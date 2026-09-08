> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。
>
> 注:本文件超长,译本保留核心章节(概述、压缩机制、分支摘要、摘要格式、设置);`CompactionEntry`/`BranchSummaryEntry` 结构定义、消息序列化与扩展自定义摘要 API 属于实现细节,未翻译,请见英文原版对应章节。

# 压缩与分支摘要

LLM 的上下文窗口有限。当对话变得过长时,Pi 使用压缩(compaction)在保留近期工作的前提下摘要较旧的内容。本页同时覆盖自动压缩与分支摘要。

**源码文件**([pi](https://github.com/earendil-works/pi)):
- [`packages/coding-agent/src/core/compaction/compaction.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/compaction.ts) - 自动压缩逻辑
- [`packages/coding-agent/src/core/compaction/branch-summarization.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/branch-summarization.ts) - 分支摘要
- [`packages/coding-agent/src/core/compaction/utils.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/utils.ts) - 共享工具(文件跟踪、序列化)
- [`packages/coding-agent/src/core/session-manager.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/session-manager.ts) - 条目类型(`CompactionEntry`、`BranchSummaryEntry`)
- [`packages/coding-agent/src/core/extensions/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts) - 扩展事件类型

需要项目内的 TypeScript 定义时,查看 `node_modules/@earendil-works/pi-coding-agent/dist/`。

## 概述

Pi 有两套摘要机制:

| 机制 | 触发方式 | 用途 |
|------|----------|------|
| 压缩 | 上下文超过阈值,或 `/compact` | 摘要旧消息以释放上下文 |
| 分支摘要 | `/tree` 导航 | 切换分支时保留上下文 |

两者使用相同的结构化摘要格式,并累计跟踪文件操作。压缩与分支摘要请求使用全新的路由会话 ID,并在 provider 支持时禁用提示缓存写入,因为这类一次性 prompt 不太可能被复用。

## 压缩(Compaction)

### 触发时机

满足以下条件时触发自动压缩:

```
contextTokens > contextWindow - reserveTokens
```

默认 `reserveTokens` 为 16384 token(可在 `~/.pi/agent/settings.json` 或 `<project-dir>/.pi/settings.json` 配置)。这是给 LLM 响应预留的空间。

在多轮 agent 运行期间,Pi 在工具执行完毕、结果追加之后、下一条助手响应开始之前检查该阈值。若越过阈值,Pi 会在同一次 agent 运行内压缩,然后带着摘要和保留的消息继续。当已完成的工具批次终止了运行、且没有排队消息需要再响应时,跳过这一轮间检查。Pi 还会在新用户 prompt 之前、以及低层 agent 运行结束后检查阈值。

也可以用 `/compact [instructions]` 手动触发,可选的 instructions 用于聚焦摘要内容。

### 工作原理

1. **寻找切点**:从最新消息向前回溯,累加 token 估计,直到达到 `keepRecentTokens`(默认 20k,可在 `~/.pi/agent/settings.json` 或 `<project-dir>/.pi/settings.json` 配置)
2. **提取消息**:收集上一个保留边界(或会话起点)到切点之间的消息
3. **生成摘要**:以结构化格式调用 LLM 摘要;若存在上一个摘要,作为迭代上下文传入
4. **追加条目**:保存带摘要和 `firstKeptEntryId` 的 `CompactionEntry`
5. **重建上下文**:会话用"摘要 + 从 `firstKeptEntryId` 起的消息"为下一个请求重建上下文

```
Before compaction:

  entry:  0     1     2     3      4     5     6      7      8     9
        ┌─────┬─────┬─────┬──────┬─────┬─────┬──────┬──────┬─────┬─────┐
        │ hdr │ usr │ ass │ tool │ usr │ ass │ tool │ tool │ ass │ tool│
        └─────┴─────┴─────┴──────┴─────┴─────┴──────┴──────┴─────┴─────┘
                └────────┬───────┘ └──────────────┬──────────────┘
               messagesToSummarize            kept messages
                                    ↑
                           firstKeptEntryId (entry 4)

After compaction (new entry appended):

  entry:  0     1     2     3      4     5     6      7      8     9     10
        ┌─────┬─────┬─────┬──────┬─────┬─────┬──────┬──────┬─────┬─────┬─────┐
        │ hdr │ usr │ ass │ tool │ usr │ ass │ tool │ tool │ ass │ tool│ cmp │
        └─────┴─────┴─────┴──────┴─────┴─────┴──────┴──────┴─────┴─────┴─────┘
               └──────────┬──────┘ └──────────────────────┬───────────────────┘
                 not sent to LLM                    sent to LLM
                                                         ↑
                                              starts from firstKeptEntryId

What the LLM sees:

  ┌────────┬─────────┬─────┬─────┬──────┬──────┬─────┬──────┐
  │ system │ summary │ usr │ ass │ tool │ tool │ ass │ tool │
  └────────┴─────────┴─────┴─────┴──────┴──────┴─────┴──────┘
       ↑         ↑      └─────────────────┬────────────────┘
    prompt   from cmp          messages from firstKeptEntryId
```

重复压缩时,被摘要的范围从上一次压缩的保留边界(`firstKeptEntryId`)开始,而不是压缩条目本身;若在路径中找不到该保留条目,则回退到上一次压缩条目的后一条。这样,在上一次压缩中幸存的消息也会并入下一次摘要,避免丢失。Pi 在写入新 `CompactionEntry` 前还会基于重建后的会话上下文重新计算 `tokensBefore`,使 token 数反映被替换的真实压缩前上下文。

### 分裂轮次(Split Turns)

一个"轮次(turn)"以用户消息开始,包含其后所有助手响应和工具调用,直到下一条用户消息。正常情况下压缩在轮次边界切分。

当单个轮次超过 `keepRecentTokens` 时,切点会落在轮次中间的某条助手消息上,即"分裂轮次":

```
Split turn (one huge turn exceeds budget):

  entry:  0     1     2      3     4      5      6     7      8
        ┌─────┬─────┬─────┬──────┬─────┬──────┬──────┬─────┬──────┐
        │ hdr │ usr │ ass │ tool │ ass │ tool │ tool │ ass │ tool │
        └─────┴─────┴─────┴──────┴─────┴──────┴──────┴─────┴──────┘
                ↑                                     ↑
         turnStartIndex = 1                  firstKeptEntryId = 7
                │                                     │
                └──── turnPrefixMessages (1-6) ───────┘
                                                      └── kept (7-8)

  isSplitTurn = true
  messagesToSummarize = []  (no complete turns before)
  turnPrefixMessages = [usr, ass, tool, ass, tool, tool]
```

对分裂轮次,Pi 生成两份摘要并合并:
1. **历史摘要**:此前的上下文(如有)
2. **轮次前缀摘要**:分裂轮次的前半部分

### 切点规则

有效切点为:
- 用户消息
- 助手消息
- BashExecution 消息
- 自定义消息(custom_message、branch_summary)

绝不在工具结果处切分(它们必须与其工具调用保持在一起)。

## 分支摘要(Branch Summarization)

### 触发时机

当你用 `/tree` 导航到另一分支时,Pi 会询问是否摘要你即将离开的工作,从而把左分支的上下文注入新分支。

### 工作原理

1. **寻找公共祖先**:新旧位置共享的最深节点
2. **收集条目**:从旧叶节点回溯到公共祖先
3. **按预算准备**:在 token 预算内纳入消息(最新的优先)
4. **生成摘要**:以结构化格式调用 LLM
5. **追加条目**:在导航点保存 `BranchSummaryEntry`

```
Tree before navigation:

         ┌─ B ─ C ─ D (old leaf, being abandoned)
    A ───┤
         └─ E ─ F (target)

Common ancestor: A
Entries to summarize: B, C, D

After navigation with summary:

         ┌─ B ─ C ─ D
    A ───┤
         └─ E ─ F ─ [summary of B,C,D] (new leaf)
```

### 累计文件跟踪

压缩与分支摘要都以累计方式跟踪文件。生成摘要时,pi 从以下来源提取文件操作:
- 被摘要消息中的工具调用
- 上一次压缩或分支摘要的 `details`(如有)

也就是说,文件跟踪会跨多次压缩或嵌套分支摘要不断累积,保留读过和改过的文件的完整历史。

## 摘要格式

压缩与分支摘要使用相同的结构化格式:

```markdown
## Goal
[What the user is trying to accomplish]

## Constraints & Preferences
- [Requirements mentioned by user]

## Progress
### Done
- [x] [Completed tasks]

### In Progress
- [ ] [Current work]

### Blocked
- [Issues, if any]

## Key Decisions
- **[Decision]**: [Rationale]

## Next Steps
1. [What should happen next]

## Critical Context
- [Data needed to continue]

<read-files>
path/to/file1.ts
path/to/file2.ts
</read-files>

<modified-files>
path/to/changed.ts
</modified-files>
```

## 设置

在 `~/.pi/agent/settings.json` 或 `<project-dir>/.pi/settings.json` 中配置压缩:

```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  }
}
```

| 设置 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 启用自动压缩 |
| `reserveTokens` | `16384` | 为 LLM 响应预留的 token 数 |
| `keepRecentTokens` | `20000` | 保留不摘要的近期 token 数 |

`"enabled": false` 可禁用自动压缩;仍可用 `/compact` 手动压缩。
