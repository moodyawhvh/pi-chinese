> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

> pi 可以创建 prompt 模板。让它为你的工作流做一个即可。

# Prompt 模板

Prompt 模板是可展开为完整 prompt 的 Markdown 片段。在编辑器中输入 `/name` 即可调用模板,`name` 是不带 `.md` 的文件名。

## 位置

pi 从以下位置加载 prompt 模板:

- 全局:`~/.pi/agent/prompts/*.md`
- 项目:`.pi/prompts/*.md`(仅在项目被信任后)
- 包:`prompts/` 目录或 `package.json` 中的 `pi.prompts` 条目
- 设置:`prompts` 数组,可包含文件或目录
- CLI:`--prompt-template <path>`(可重复)

用 `--no-prompt-templates` 禁用模板发现。

## 格式

```markdown
---
description: Review staged git changes
---
Review the staged changes (`git diff --cached`). Focus on:
- Bugs and logic errors
- Security issues
- Error handling gaps
```

- 文件名即命令名。`review.md` 变成 `/review`。
- `description` 可选。缺省时使用第一个非空行。
- `argument-hint` 可选。设置后,该提示会在自动补全下拉中显示在描述之前。

### 参数提示

在 frontmatter 中使用 `argument-hint`,在自动补全中显示期望的参数。必填参数用 `<尖括号>`,可选参数用 `[方括号]`:

```markdown
---
description: Review PRs from URLs with structured issue and code analysis
argument-hint: "<PR-URL>"
---
```

在自动补全下拉中渲染为:

```
→ pr   <PR-URL>       — Review PRs from URLs with structured issue and code analysis
  is   <issue>        — Analyze GitHub issues (bugs or feature requests)
  wr   [instructions] — Finish the current task end-to-end
  cl   — Audit changelog entries before release
```

## 用法

在编辑器中输入 `/` 加模板名。自动补全会显示可用模板及其描述。

```
/review                           # Expands review.md
/component Button                 # Expands with argument
/component Button "click handler" # Multiple arguments
```

## 参数

模板支持位置参数、默认值和简单切片:

- `$1`、`$2`、... 位置参数
- `$@` 或 `$ARGUMENTS` 为全部参数拼接
- `${1:-default}` 在参数 1 存在且非空时使用参数 1,否则用 `default`
- `${@:-default}` 或 `${ARGUMENTS:-default}` 在存在非空参数时使用全部参数,否则用 `default`
- `${@:N}` 取从第 N 个位置开始的参数(1 起始)
- `${@:N:L}` 取从 N 开始的 `L` 个参数

示例:

```markdown
---
description: Create a component
---
Create a React component named $1 with features: $@
```

默认值对可选参数很有用:

```markdown
Summarize the current state in ${1:-7} bullet points.
```

用法:`/component Button "onClick handler" "disabled support"`

## 加载规则

- `prompts/` 中的模板发现是非递归的。
- 想把模板放在子目录中,需通过 `prompts` 设置或包 manifest 显式添加。
