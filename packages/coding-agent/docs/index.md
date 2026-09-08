> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# Pi 文档

Pi 是一个极简的终端编码 harness。它的设计理念是核心保持小巧,同时通过 TypeScript 扩展、技能、提示模板、主题和 pi 包进行扩展。

## 快速开始

用 npm 安装 Pi:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

`--ignore-scripts` 会在安装期间禁用依赖的生命周期脚本。常规 npm 安装不需要安装脚本。

在 Linux 或 macOS 上,也可以使用安装器:

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

卸载 pi 本体时,curl 和 npm 安装方式使用 npm:

```bash
npm uninstall -g @earendil-works/pi-coding-agent
```

pnpm、Yarn 或 Bun 安装方式使用对应的全局移除命令:`pnpm remove -g @earendil-works/pi-coding-agent`、`yarn global remove @earendil-works/pi-coding-agent` 或 `bun uninstall -g @earendil-works/pi-coding-agent`。

然后在项目目录中运行:

```bash
pi
```

订阅型 provider 使用 `/login` 认证,或在启动 pi 之前设置 API key,例如 `ANTHROPIC_API_KEY`。

完整的首次运行流程见[快速上手](quickstart.md)。

## 从这里开始

- [快速上手](quickstart.md) - 安装、认证并运行第一次会话。
- [使用 Pi](usage.md) - 交互模式、斜杠命令、上下文文件和 CLI 参考。
- [Providers](providers.md) - 内置 provider 的订阅与 API-key 配置。
- [llama.cpp](llama-cpp.md) - 运行本地路由并用 `/llama` 管理模型。
- [安全](security.md) - 项目信任、沙箱边界与漏洞报告。
- [容器化](containerization.md) - 用 Gondolin、Docker 或 OpenShell 沙箱化 pi。
- [设置](settings.md) - 全局与项目设置。
- [快捷键](keybindings.md) - 默认快捷键与自定义键位。
- [会话](sessions.md) - 会话管理、分支与树状导航。
- [压缩](compaction.md) - 上下文压缩与分支摘要。

## 定制

- [扩展](extensions.md) - 用于工具、命令、事件和自定义 UI 的 TypeScript 模块。
- [技能](skills.md) - Agent Skills,提供可复用的按需能力。
- [提示模板](prompt-templates.md) - 从斜杠命令展开的可复用提示。
- [主题](themes.md) - 内置与自定义终端主题。
- [Pi 包](packages.md) - 打包并共享扩展、技能、提示和主题。
- [自定义模型](models.md) - 为受支持的 provider API 添加模型条目。
- [自定义 provider](custom-provider.md) - 实现自定义 API 和 OAuth 流程。

## 编程式使用

- [SDK](sdk.md) - 在 Node.js 应用中嵌入 pi。
- [RPC 模式](rpc.md) - 通过 stdin/stdout JSONL 集成。
- [JSON 事件流模式](json.md) - 输出结构化事件的 print 模式。
- [TUI 组件](tui.md) - 为扩展构建自定义终端 UI。

## 参考

- [环境变量](environment-variables.md) - pi 进程配置以及 bash 工具可用的会话元数据。
- [会话格式](session-format.md) - JSONL 会话文件格式、条目类型与 SessionManager API。

## 平台配置

- [Windows](windows.md)
- [Android 上的 Termux](termux.md)
- [tmux](tmux.md)
- [终端配置](terminal-setup.md)
- [Shell 别名](shell-aliases.md)

## 开发

- [开发](development.md) - 本地环境搭建、项目结构与调试。
