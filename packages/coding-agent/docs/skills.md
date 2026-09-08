> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

> pi 可以创建技能。让你的用例,直接让它帮你写一个。

# 技能

技能是 agent 按需加载的自包含能力包。技能为特定任务提供专门的工作流、配置说明、辅助脚本和参考文档。

Pi 实现了 [Agent Skills 标准](https://agentskills.io/specification),对大多数违规项给出警告但保持宽容。pi 允许技能名与父目录名不同,尽管标准不允许——这条规则对跨多个 agent harness 共享的技能目录来说并不合理。

## 目录

- [位置](#位置)
- [技能如何工作](#技能如何工作)
- [技能命令](#技能命令)
- [技能结构](#技能结构)
- [Frontmatter](#frontmatter)
- [校验](#校验)
- [示例](#示例)
- [技能仓库](#技能仓库)

## 位置

> **安全:** 技能可以指示模型执行任何操作,并可能包含模型会调用的可执行代码。使用前请审阅技能内容。

Pi 从以下位置加载技能:

- 全局:
  - `~/.pi/agent/skills/`
  - `~/.agents/skills/`
- 项目(仅在项目被信任之后):
  - `.pi/skills/`
  - `cwd` 及祖先目录中的 `.agents/skills/`(向上至 git 仓库根;不在仓库中则至文件系统根)
- 包:`skills/` 目录或 `package.json` 中的 `pi.skills` 条目
- 设置:`skills` 数组,可含文件或目录
- CLI:`--skill <路径>`(可重复;即便有 `--no-skills` 也会加载)

发现规则:
- 在 `~/.pi/agent/skills/` 和 `.pi/skills/` 中,根层 `.md` 文件若带有含非空 `description` 的有效技能 frontmatter,会被作为独立技能发现
- 在所有技能位置,含 `SKILL.md` 的目录会被递归发现
- 在 `~/.agents/skills/` 和项目 `.agents/skills/` 中,根层 `.md` 文件被忽略,但分组文件夹内声明了技能 frontmatter 的嵌套 `.md` 文件会被发现
- 不像技能的、`SKILL.md` 以外的根层 Markdown 文件会被静默忽略

使用 `--no-skills` 禁用发现(显式 `--skill` 路径仍会加载)。

### 使用其他 harness 的技能

想使用 Claude Code 或 OpenAI Codex 的技能,把它们的目录加进设置:

```json
{
  "skills": [
    "~/.claude/skills",
    "~/.codex/skills"
  ]
}
```

项目级 Claude Code 技能,添加到 `.pi/settings.json`:

```json
{
  "skills": ["../.claude/skills"]
}
```

## 技能如何工作

1. 启动时,pi 扫描技能位置并提取名称与描述
2. 系统提示按[规范](https://agentskills.io/integrate-skills)以 XML 格式列出可用技能
3. 任务匹配时,agent 用 `read`(不可用时用 `bash`)加载完整 SKILL.md(模型不总会这么做;可用提示或 `/skill:名称` 强制触发)
4. agent 遵循其中的指令,使用相对路径引用脚本和资源

这就是渐进式披露:上下文中始终只有描述,完整指令按需加载。

## 技能命令

技能注册为 `/skill:名称` 命令:

```bash
/skill:brave-search           # 加载并执行技能
/skill:pdf-tools extract      # 带参数加载技能
```

命令后的参数会以 `User: <参数>` 的形式附加到技能内容之后。

在交互模式通过 `/settings`,或在 `settings.json` 中开关技能命令:

```json
{
  "enableSkillCommands": true
}
```

## 技能结构

技能就是一个含 `SKILL.md` 文件的目录,其余内容自由组织。

```
my-skill/
├── SKILL.md              # 必需:frontmatter + 指令
├── scripts/              # 辅助脚本
│   └── process.sh
├── references/           # 按需加载的详细文档
│   └── api-reference.md
└── assets/
    └── template.json
```

### SKILL.md 格式

````markdown
---
name: my-skill
description: 这个技能做什么、何时使用。要写具体。
---

# My Skill

## Setup

首次使用前运行一次:
```bash
cd /path/to/skill && npm install
```

## Usage

```bash
./scripts/process.sh <input>
```
````

使用相对于技能目录的路径:

```markdown
详见[参考指南](references/REFERENCE.md)。
```

## Frontmatter

依据 [Agent Skills 规范](https://agentskills.io/specification#frontmatter-required):

| 字段 | 必需 | 说明 |
|-------|----------|-------------|
| `name` | 是 | 最长 64 字符。小写 a-z、0-9、连字符。与标准不同,pi 不要求它匹配父目录名,因为那条要求对共享技能目录并不合理。 |
| `description` | 是 | 最长 1024 字符。技能做什么、何时使用。 |
| `license` | 否 | 许可证名称或对随附文件的引用。 |
| `compatibility` | 否 | 最长 500 字符。环境要求。 |
| `metadata` | 否 | 任意键值映射。 |
| `allowed-tools` | 否 | 预批准工具的空格分隔列表(实验性)。 |
| `disable-model-invocation` | 否 | 为 `true` 时,技能从系统提示中隐藏,用户必须使用 `/skill:名称`。 |

### 名称规则

- 1-64 个字符
- 仅小写字母、数字、连字符
- 首尾不能是连字符
- 不能有连续连字符
pi 不要求名称匹配父目录。Agent Skills 标准有此要求,但它对多工具共享的技能目录并不合理。

有效:`pdf-processing`、`data-analysis`、`code-review`
无效:`PDF-Processing`、`-pdf`、`pdf--processing`

### 描述最佳实践

描述决定 agent 何时加载该技能。要写具体。

好的:
```yaml
description: 从 PDF 文件提取文本和表格,填写 PDF 表单,合并多个 PDF。处理 PDF 文档时使用。
```

差的:
```yaml
description: 帮你处理 PDF。
```

## 校验

Pi 按 Agent Skills 标准校验技能。大多数问题只产生警告,技能仍会加载:

- 名称超过 64 字符或含非法字符
- 名称以连字符开头/结尾或有连续连字符
- 描述超过 1024 字符

未知 frontmatter 字段被忽略。

缺少描述的已声明技能不会加载。格式错误的 `SKILL.md` 和没有描述的 `SKILL.md` 会产生警告且不加载。其他没有有效技能 frontmatter 的 Markdown 文件被忽略。

名称冲突(不同位置出现同名技能)会警告并保留先发现的技能。

## 示例

```
brave-search/
├── SKILL.md
├── search.js
└── content.js
```

**SKILL.md:**
````markdown
---
name: brave-search
description: 通过 Brave Search API 进行网页搜索和内容提取。搜索文档、事实或任意网页内容时使用。
---

# Brave Search

## Setup

```bash
cd /path/to/brave-search && npm install
```

## Search

```bash
./search.js "query"              # 基本搜索
./search.js "query" --content    # 包含页面内容
```

## Extract Page Content

```bash
./content.js https://example.com
```
````

## 技能仓库

- [Anthropic Skills](https://github.com/anthropics/skills) - 文档处理(docx、pdf、pptx、xlsx)、Web 开发
- [Pi Skills](https://github.com/badlogic/pi-skills) - 网页搜索、浏览器自动化、Google API、转录
