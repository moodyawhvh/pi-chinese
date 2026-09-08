> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# 快速上手

本页带你从安装走到第一次实用的 pi 会话。

## 安装

Pi 以 npm 包的形式分发:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

`--ignore-scripts` 会在安装期间禁用依赖的生命周期脚本。常规 npm 安装不需要安装脚本。

### 卸载

使用当初安装 pi 的包管理器。curl 安装器使用的是 npm 全局安装,所以 curl 和 npm 安装都用 npm 卸载:

```bash
# curl 安装器或 npm install -g
npm uninstall -g @earendil-works/pi-coding-agent

# pnpm
pnpm remove -g @earendil-works/pi-coding-agent

# Yarn
yarn global remove @earendil-works/pi-coding-agent

# Bun
bun uninstall -g @earendil-works/pi-coding-agent
```

卸载 pi 后,设置、凭据、会话和已安装的 pi 包仍保留在 `~/.pi/agent/` 中。

然后在你想让它工作的项目目录里启动 pi:

```bash
cd /path/to/project
pi
```

## 认证

Pi 可以通过 `/login` 使用订阅型 provider,也可以通过环境变量或认证文件使用 API-key 型 provider。

### 方式一:订阅登录

启动 pi 并运行:

```text
/login
```

然后选择一个 provider。内置的订阅登录包括 Claude Pro/Max、ChatGPT Plus/Pro(Codex)和 GitHub Copilot。

### 方式二:API key

启动 pi 之前设置好 API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pi
```

你也可以运行 `/login` 并选择一个 API-key 型 provider,把 key 保存到 `~/.pi/agent/auth.json`。

所有受支持的 provider、环境变量以及云端 provider 配置见 [Providers](providers.md)。

## 第一次会话

pi 启动后,输入请求并按回车:

```text
总结这个仓库,并告诉我怎么运行它的检查。
```

默认情况下,pi 给模型提供四个工具:

- `read` - 读取文件
- `write` - 创建或覆盖文件
- `edit` - 修补文件
- `bash` - 运行 shell 命令

额外的内置只读工具(`grep`、`find`、`ls`)可通过工具选项启用。pi 在你当前的工作目录中运行,并能修改其中的文件。如果想要方便的回滚,请使用 git 或其他检查点工作流。

## 给 pi 项目指令

Pi 会在启动时加载上下文文件。添加一个 `AGENTS.md` 文件,告诉它如何在这个项目中工作:

```markdown
# Project Instructions

- 代码改动后运行 `npm run check`。
- 不要在本地运行生产环境迁移。
- 回答保持简洁。
```

Pi 会加载:

- `~/.pi/agent/AGENTS.md` 作为全局指令
- 来自父目录和当前目录的 `AGENTS.md` 或 `CLAUDE.md`

如果某个目录中存在 `AGENTS.override.md`,pi 会加载它,而不是该目录的 `AGENTS.md` 或 `CLAUDE.md`。

修改上下文文件后,请重启 pi 或运行 `/reload`。

## 常见玩法

### 引用文件

在编辑器中输入 `@` 可以模糊搜索文件,也可以在命令行上直接传文件:

```bash
pi @README.md "总结一下这个"
pi @src/app.ts @src/app.test.ts "把这两个放在一起审一下"
```

图片或文本可以用 Ctrl+V 粘贴(Windows 上是 Alt+V);在支持的终端里图片也可以拖入。

### 运行 shell 命令

在交互模式中:

```text
!npm run lint
```

命令输出会发送给模型。使用 `!!命令` 可以运行命令但不把输出加入模型上下文。

### 切换模型

使用 `/model` 或 Ctrl+L 为当前会话选择模型。在模型选择器中按 Ctrl+S 可以把高亮的模型保存为启动默认值。使用 `/thinking` 为当前会话选择思考等级,或在该选择器中按 Ctrl+S 保存启动默认思考等级。使用 Shift+Tab 循环切换思考等级。使用 Ctrl+P / Shift+Ctrl+P 在作用域模型之间循环切换。

### 稍后继续

会话会自动保存:

```bash
pi -c                  # 继续最近一次会话
pi -r                  # 浏览历史会话
pi --name "我的任务"    # 启动时设置会话显示名称
pi --session <路径|id>  # 打开指定会话
```

在 pi 内部,使用 `/resume`、`/new`、`/tree`、`/fork` 和 `/clone` 管理会话。

### 非交互模式

单次提示场景:

```bash
pi -p "总结这个代码库"
cat README.md | pi -p "总结这段文本"
pi -p @screenshot.png "这张图里有什么?"
```

使用 `--mode json` 获得 JSON 事件输出,或 `--mode rpc` 进行进程集成。

## 下一步

- [使用 Pi](usage.md) - 交互模式、斜杠命令、会话、上下文文件和 CLI 参考。
- [Providers](providers.md) - 认证与模型配置。
- [设置](settings.md) - 全局与项目配置。
- [快捷键](keybindings.md) - 快捷键与自定义。
- [Pi 包](packages.md) - 安装共享的扩展、技能、提示和主题。

平台说明:[Windows](windows.md)、[Termux](termux.md)、[tmux](tmux.md)、[终端配置](terminal-setup.md)、[Shell 别名](shell-aliases.md)。
