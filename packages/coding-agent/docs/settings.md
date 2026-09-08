> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。
>
> 注:本文件为设置项核心参考,已按章节完整翻译;JSON 键名保持原文。

# 设置

pi 使用 JSON 设置文件,项目设置覆盖全局设置。

| 位置 | 作用域 |
|------|--------|
| `~/.pi/agent/settings.json` | 全局(所有项目) |
| `.pi/settings.json` | 项目(当前目录) |

可直接编辑,或用 `/settings` 调整常用选项。要交互式保存启动模型默认值,使用 `/model` 并在目标模型上按 Ctrl+S。要保存启动思考等级,使用 `/thinking` 并按 Ctrl+S。

## 项目信任

交互启动时,如果项目文件夹包含项目级设置、资源或项目 `.agents/skills`,且 `~/.pi/agent/trust.json` 中没有该文件夹或其父文件夹的已保存决定,pi 会先询问是否信任该项目。信任项目后,pi 才会加载 `.pi/settings.json` 和 `.pi` 资源、安装缺失的项目包并执行项目扩展。

非交互模式(`-p`、`--mode json`、`--mode rpc`)不显示信任询问。在没有适用的已保存信任决定时,它们使用全局设置中的 `defaultProjectTrust`:`ask`(默认)和 `never` 会忽略这些项目资源,`always` 则信任它们。可传 `--approve`/`-a` 或 `--no-approve`/`-na` 为单次运行覆盖项目信任。

如果没有扩展或已保存决定适用,`defaultProjectTrust` 决定回退行为。可在 `~/.pi/agent/settings.json` 中设为 `"ask"`、`"always"` 或 `"never"`,或通过 `/settings` 修改。

`pi config` 和包管理命令使用同样的项目信任流程,但 `pi update` 从不询问。传 `--approve` 为单条命令信任项目本地设置,或 `--no-approve` 忽略它们。

在交互模式中使用 `/trust` 可保存项目信任决定供未来会话使用,包括对直接父文件夹的信任。它只写入 `~/.pi/agent/trust.json`;当前会话不会重载,需重启 pi 才能生效。

## 全部设置

### 模型与思考

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `defaultProvider` | string | - | 启动 provider(如 `"anthropic"`、`"openai"`;在 `/model` 中按 Ctrl+S 保存,或手动编辑) |
| `defaultModel` | string | - | 启动模型 ID(在 `/model` 中按 Ctrl+S 保存,或手动编辑) |
| `defaultThinkingLevel` | string | - | 启动思考等级(在 `/thinking` 中按 Ctrl+S 保存,或手动编辑):`"off"`、`"minimal"`、`"low"`、`"medium"`、`"high"`、`"xhigh"`、`"max"` |
| `modelThinkingLevels` | object | - | 按模型配置启动思考等级,键为 `"provider/modelId"`;可在 `/settings` → Default thinking level per model 中配置,或手动编辑 |
| `hideThinkingBlock` | boolean | `false` | 在输出中隐藏思考块 |
| `showCacheMissNotices` | boolean | `false` | 在会话记录中显示重大提示缓存未命中、压缩或分支摘要使用情况,以及 provider 恢复诊断(如 Anthropic 思考块被丢弃)的通知 |
| `thinkingBudgets` | object | - | 各思考等级的自定义 token 预算。Anthropic、Google 和 Bedrock 原生使用;OpenAI 兼容模型在设置了 `compat.thinkingTokenBudgetField`(或 `supportsThinkingTokenBudget`)时使用。 |

#### thinkingBudgets

```json
{
  "thinkingBudgets": {
    "minimal": 1024,
    "low": 4096,
    "medium": 10240,
    "high": 32768
  }
}
```

### UI 与显示

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | string | `"dark"` | 主题名(`"dark"`、`"light"` 或自定义) |
| `externalEditor` | string | 依次为 `$VISUAL`、`$EDITOR`,Windows 上为 Notepad,其他平台为 `nano` | Ctrl+G 外部编辑器命令;优先于环境变量 |
| `quietStartup` | boolean | `false` | 隐藏启动头部信息 |
| `defaultProjectTrust` | string | `"ask"` | 回退项目信任行为:`"ask"`、`"always"` 或 `"never"`。仅全局设置 |
| `collapseChangelog` | boolean | `false` | 更新后显示精简版 changelog |
| `enableInstallTelemetry` | boolean | `true` | 发送匿名安装/更新 ping 及选定的 provider 归因请求头。不控制更新检查 |
| `enableAnalytics` | boolean | `false` | 选择性加入的分析数据共享。目前仅在实验性首次设置(`PI_EXPERIMENTAL=1`)时询问 |
| `trackingId` | string | - | 分析跟踪标识,开启 `enableAnalytics` 时生成 |
| `doubleEscapeAction` | string | `"tree"` | 双击 Escape 的动作:`"tree"`、`"fork"` 或 `"none"` |
| `treeFilterMode` | string | `"default"` | `/tree` 的默认过滤器:`"default"`、`"no-tools"`、`"user-only"`、`"labeled-only"`、`"all"` |
| `editorPaddingX` | number | `0` | 输入编辑器的水平内边距(0-3) |
| `outputPad` | number | `1` | 用户消息、助手消息和思考内容的水平内边距(0 或 1) |
| `autocompleteMaxVisible` | number | `5` | 自动补全下拉最大可见条目数(3-20) |
| `showHardwareCursor` | boolean | `false` | 在 TUI 为支持 IME 而定位光标时显示终端光标 |
| `tuiMode` | string | `"regular"` | 交互 TUI 模式:`"regular"` 或实验性的 `"fullscreen"`。在 `/settings` 中更改立即生效;启动时 `--tui-mode` 覆盖此设置 |
| `fullscreenExitOutput` | string | `"transcript"` | 全屏退出输出:`"transcript"` 打印最终会话记录和恢复提示;`"resume-hint"` 恢复之前的屏幕并只打印恢复提示。普通 TUI 模式下无效果 |
| `fullscreenScrollbar` | string | `"auto"` | 全屏会话记录滚动条:`"auto"` 在滚动或指针悬停在最右列轨道上时临时显示;`"always"` 保留该列并始终可见;`"hidden"` 隐藏。普通 TUI 模式下无效果 |
| `fullscreenCopyOnSelect` | boolean | `true` | 全屏模式下选中文字自动复制。关闭后,选区保持高亮,`Ctrl+X` 复制活动选区 |

VS Code 需要带 `--wait`,这样 pi 会在编辑器退出后继续运行:

```json
{
  "externalEditor": "code --wait"
}
```

### 遥测与更新检查

`enableInstallTelemetry` 控制发往 `https://pi.dev/api/report-install` 的匿名安装/更新 ping,以及 OpenRouter、NVIDIA NIM、Cloudflare provider 请求中的 Pi 归因请求头。选择退出会同时关闭两者。它不会关闭更新检查;pi 仍会请求 `https://pi.dev/api/latest-version` 查询最新版本。

设置 `PI_SKIP_VERSION_CHECK=1` 可禁用 Pi 版本更新检查。使用 `--offline` 或 `PI_OFFLINE=1` 可禁用此处描述的所有启动网络操作,包括更新检查、包更新检查和安装/更新遥测。

### 网络

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `httpProxy` | string | - | HTTP 代理 URL,应用于 `HTTP_PROXY` 和 `HTTPS_PROXY`。仅全局设置。 |

```json
{
  "httpProxy": "http://127.0.0.1:7890"
}
```

### 警告

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `warnings.anthropicExtraUsage` | boolean | `true` | 当 Anthropic 订阅认证可能使用付费额外用量时显示警告 |

```json
{
  "warnings": {
    "anthropicExtraUsage": false
  }
}
```

### 压缩(Compaction)

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `compaction.enabled` | boolean | `true` | 启用自动压缩 |
| `compaction.reserveTokens` | number | `16384` | 为 LLM 响应预留的 token 数 |
| `compaction.keepRecentTokens` | number | `20000` | 保留不摘要的近期 token 数 |

```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  }
}
```

### 分支摘要

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `branchSummary.reserveTokens` | number | `16384` | 选择分支历史时预留的 token 数;输出上限为 4096 token |
| `branchSummary.skipPrompt` | boolean | `false` | 在 `/tree` 导航时跳过 "Summarize branch?" 询问(默认不做摘要) |

### 重试

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `retry.enabled` | boolean | `true` | 启用 agent 级瞬时错误自动重试 |
| `retry.maxRetries` | number | `3` | agent 级最大重试次数 |
| `retry.baseDelayMs` | number | `2000` | agent 级指数退避的基础延迟(2s、4s、8s) |
| `retry.provider.timeoutMs` | number | SDK 默认 | provider/SDK 请求超时(毫秒) |
| `retry.provider.maxRetries` | number | `0` | provider/SDK 重试次数 |
| `retry.provider.maxRetryDelayMs` | number | `60000` | 服务端请求的等待上限,超过即失败(60s) |

当 provider 请求的重试延迟超过 `retry.provider.maxRetryDelayMs` 时,请求会立即失败并给出说明性错误,而不是静默等待。设为 `0` 可禁用该上限。

除非明确需要 provider 级重试,保持 `retry.provider.maxRetries` 为 `0`。设为大于 0 时,SDK/provider 的重试可能在 pi 感知之前就处理掉用量超限错误,某些情况下会导致 agent 一直阻塞到 provider 配额重置。

```json
{
  "retry": {
    "enabled": true,
    "maxRetries": 3,
    "baseDelayMs": 2000,
    "provider": {
      "timeoutMs": 3600000,
      "maxRetries": 0,
      "maxRetryDelayMs": 60000
    }
  }
}
```

### 消息投递

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `steeringMode` | string | `"one-at-a-time"` | steering 消息的发送方式:`"all"` 或 `"one-at-a-time"` |
| `followUpMode` | string | `"one-at-a-time"` | follow-up 消息的发送方式:`"all"` 或 `"one-at-a-time"` |
| `transport` | string | `"auto"` | 支持多种传输的 provider 的首选传输方式:`"sse"`、`"websocket"`、`"websocket-cached"` 或 `"auto"` |
| `httpIdleTimeoutMs` | number | `300000` | HTTP 头/空闲超时(毫秒),也被带显式流空闲超时的 provider 使用。设为 `0` 禁用。 |
| `websocketConnectTimeoutMs` | number | `15000` | 支持 WebSocket 传输的 provider 的 WebSocket 连接/握手超时(毫秒)。设为 `0` 禁用。 |

### 终端与图片

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `terminal.showImages` | boolean | `true` | 在终端中显示图片(如支持) |
| `terminal.imageWidthCells` | number | `60` | 内联图片的首选宽度(终端单元格数) |
| `terminal.clearOnShrink` | boolean | `false` | 内容变少时清除空行(可能引起闪烁) |
| `terminal.hyperlinks` | boolean 或 `"auto"` | `"auto"` | 覆盖 OSC 8 超链接支持(高级,仅 JSON) |
| `terminal.images` | string 或 boolean | `"auto"` | 覆盖图片协议支持:`"kitty"`、`"iterm2"`、`false` 或 `"auto"`(高级,仅 JSON) |
| `terminal.trueColor` | boolean 或 `"auto"` | `"auto"` | 覆盖 truecolor 支持(高级,仅 JSON) |
| `images.autoResize` | boolean | `true` | 将图片缩放至最大 2000x2000。适用于 `@file` 附件、`read` 以及工具返回的图片 |
| `images.blockImages` | boolean | `false` | 阻止所有图片发送给 LLM |

### Shell

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `shellPath` | string | - | 自定义 shell 路径(如 Windows 上的 Cygwin);支持以 `~` 表示主目录 |
| `shellCommandPrefix` | string | - | 每条 bash 命令的前缀(如 `"shopt -s expand_aliases"`) |
| `npmCommand` | string[] | - | 用于 npm 包查找/安装操作的命令 argv(如 `["mise", "exec", "node@20", "--", "npm"]`) |

JSON 中的 Windows 路径必须使用正斜杠或转义的反斜杠:

```json
{
  "shellPath": "C:/Program Files/Git/bin/bash.exe"
}
```

```json
{
  "shellPath": "C:\\Program Files\\Git\\bin\\bash.exe"
}
```

```json
{
  "npmCommand": ["mise", "exec", "node@20", "--", "npm"]
}
```

`npmCommand` 用于所有 npm 包管理器操作,包括安装、卸载以及 git 包内的依赖安装。用户级 npm 包安装在 `~/.pi/agent/npm/` 下;项目级 npm 包安装在 `.pi/npm/` 下。按进程实际启动方式使用 argv 形式的条目。配置了 `npmCommand` 时,git 包依赖安装使用普通 `install`,以避免在包装器或替代包管理器中出现 npm 特有标志。

### 工具

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `defaultTools` | string[] | - | 初始启用的内置工具。省略时 pi 使用标准默认值 |

`defaultTools` 选择启动时启用的内置工具。扩展和 SDK 自定义工具不受影响,始终可用。内置工具包括 `read`、`bash`、`powershell`、`edit`、`write`、`grep`、`find` 和 `ls`:

```json
{
  "defaultTools": ["bash", "edit", "write"]
}
```

Windows 上请选 `powershell` 而非 `bash`,或两者都包含:

```json
{
  "defaultTools": ["read", "powershell", "edit", "write"]
}
```

空数组表示启动时不启用任何内置工具,但保留扩展和 SDK 自定义工具。`--tools` 会用严格 allowlist 取代此行为(对所有工具生效),`--no-tools` 禁用所有工具,`--no-builtin-tools` 禁用内置默认值。`--exclude-tools` 从结果列表中过滤。项目的 `defaultTools` 数组会替换全局数组。

### 会话

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sessionDir` | string | - | 会话文件存储目录。支持绝对/相对路径及 `~`。 |

```json
{ "sessionDir": ".pi/sessions" }
```

当多个来源指定会话目录时,优先级为 `--session-dir`、`PI_CODING_AGENT_SESSION_DIR`,然后是 settings.json 中的 `sessionDir`。

### 模型轮换

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabledModels` | string[] | - | Ctrl+P 轮换的模型模式(格式同 `--models` CLI 参数) |

```json
{
  "enabledModels": ["claude-*", "gpt-4o", "gemini-2*"]
}
```

### Markdown

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `markdown.codeBlockIndent` | string | `"  "` | 代码块缩进 |
| `markdown.mermaid` | string | `"streaming"` | Mermaid 渲染模式:`"off"`、`"final"` 或 `"streaming"` |

### 资源

这些设置定义从哪里加载扩展、技能、prompt 模板和主题。

`~/.pi/agent/settings.json` 中的路径相对于 `~/.pi/agent` 解析。`.pi/settings.json` 中的路径相对于 `.pi` 解析。支持绝对路径和 `~`。

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `packages` | array | `[]` | 从中加载资源的 npm/git 包 |
| `extensions` | string[] | `[]` | 本地扩展文件路径或目录 |
| `skills` | string[] | `[]` | 本地技能文件路径或目录 |
| `prompts` | string[] | `[]` | 本地 prompt 模板路径或目录 |
| `themes` | string[] | `[]` | 本地主题文件路径或目录 |
| `enableSkillCommands` | boolean | `true` | 将技能注册为 `/skill:name` 命令 |

数组支持 glob 模式和排除项。用 `!pattern` 排除。用 `+path` 强制包含精确路径,`-path` 强制排除精确路径。

#### packages

字符串形式加载包中的全部资源:

```json
{
  "packages": ["pi-skills", "@org/my-extension"]
}
```

对象形式可筛选要加载的资源:

```json
{
  "packages": [
    {
      "source": "pi-skills",
      "skills": ["brave-search", "transcribe"],
      "extensions": []
    }
  ]
}
```

包管理细节见 [packages.md](packages.md)。

## 示例

```json
{
  "defaultProvider": "anthropic",
  "defaultModel": "claude-sonnet-4-20250514",
  "defaultThinkingLevel": "medium",
  "modelThinkingLevels": {
    "anthropic/claude-sonnet-4-20250514": "high"
  },
  "theme": "dark",
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  },
  "retry": {
    "enabled": true,
    "maxRetries": 3
  },
  "enabledModels": ["claude-*", "gpt-4o"],
  "warnings": {
    "anthropicExtraUsage": true
  },
  "packages": ["pi-skills"]
}
```

## 项目覆盖

项目设置(`.pi/settings.json`)覆盖全局设置。嵌套对象会合并:

```json
// ~/.pi/agent/settings.json (global)
{
  "theme": "dark",
  "compaction": { "enabled": true, "reserveTokens": 16384 }
}

// .pi/settings.json (project)
{
  "compaction": { "reserveTokens": 8192 }
}

// Result
{
  "theme": "dark",
  "compaction": { "enabled": true, "reserveTokens": 8192 }
}
```
