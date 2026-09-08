<div align="center">

# pi 中文文档

[![原项目](https://img.shields.io/badge/原项目-earendil--works--pi-blue?style=flat-square&logo=github)](https://github.com/earendil-works/pi)
[![中文简介](https://img.shields.io/badge/中文简介-README.md-orange?style=flat-square)](README.md)
[![微信联系](https://img.shields.io/badge/微信-uaycar-brightgreen?style=flat-square&logo=wechat)](#)

</div>

> 本文档是 [earendil-works/pi](https://github.com/earendil-works/pi) 官方 README 的完整中文翻译。
> 完整源代码请访问原项目:https://github.com/earendil-works/pi
>
> **代部署 / 定制服务 / 技术咨询 请添加微信:uaycar**

## Pi 智能体框架(Pi Agent Harness)

这里是 Pi 智能体框架项目的代码仓库,其中包括可自我扩展的编程智能体。

- **@earendil-works/pi-coding-agent**:交互式编程智能体命令行工具
- **@earendil-works/pi-agent-core**:支持工具调用与状态管理的智能体运行时
- **@earendil-works/pi-ai**:统一的多厂商 LLM API(OpenAI、Anthropic、Google 等)

想进一步了解 Pi:

- 访问 [pi.dev](https://pi.dev) 项目官网,上面带有演示
- 阅读[官方文档](https://pi.dev/docs/latest),也可以直接让智能体自己给你讲解

## 全部软件包

| 软件包 | 说明 |
|---------|-------------|
| **[@earendil-works/chord](packages/chord)** | 面向服务、副本状态、RPC 与插件的独立应用组合运行时 |
| **[@earendil-works/pi-telemetry](packages/telemetry)** | 厂商中立的遥测契约、参考适配器、一致性测试与类型化模式 |
| **[@earendil-works/pi-ai](packages/ai)** | 统一的多厂商 LLM API(OpenAI、Anthropic、Google 等) |
| **[@earendil-works/pi-agent-core](packages/agent)** | 支持工具调用与状态管理的智能体运行时 |
| **[@earendil-works/pi-coding-agent](packages/coding-agent)** | 交互式编程智能体命令行工具 |
| **[@earendil-works/pi-tui](packages/tui)** | 支持差分渲染的终端 UI 库 |

Slack / 聊天自动化与工作流请见 [earendil-works/pi-chat](https://github.com/earendil-works/pi-chat)。

## 权限与容器化

Pi 不内置用于限制文件系统、进程、网络或凭据访问的权限系统。默认情况下,它以启动它的用户和进程的权限运行。

如果需要更强的隔离边界,请对 Pi 进行容器化或沙箱化处理。官方文档提供了三种模式:

- **Gondolin 扩展**:让 `pi` 和厂商认证留在宿主机上,同时把内置工具与 `!` 命令路由进本地 Linux micro-VM。
- **纯 Docker**:把整个 `pi` 进程跑在本地容器里,实现简单隔离。
- **OpenShell**:把整个 `pi` 进程跑在策略可控的沙箱中。

## 参与贡献

贡献指南见原仓库 CONTRIBUTING.md,项目专属规则(对人类与智能体同样适用)见 AGENTS.md。Pi 的长期规划还可参阅官方 RFC。

## 开发

```bash
npm install --ignore-scripts  # Install all dependencies without running lifecycle scripts
npm run build         # Refresh model data, then build all packages
npm run build:offline # Rebuild using existing model data without network access
npm run check         # Lint, format, and type check
./test.sh            # Run tests (skips LLM-dependent tests without API keys)
./pi-test.sh         # Run pi from sources (can be run from any directory)
```

## 从发布源码构建独立二进制

GitHub Releases 提供由 `SHA256SUMS` 文件校验的版本化源码包。解压后运行与官方独立二进制相同的构建脚本:

```bash
VERSION="<release-version>"
tar -xzf "pi-${VERSION}-source.tar.gz"
cd "pi-${VERSION}"
./scripts/build-binaries.sh --offline-model-data --platform linux-x64 --out "$PWD/out"
```

源码包包含发布版模型数据与原生预构建产物。`--offline-model-data` 表示使用这份模型数据、不刷新厂商目录。该脚本会安装依赖,并把可执行文件连同运行时资源一起构建出来;若依赖已就绪,可传 `--skip-install`。

## 供应链加固

官方把 npm 依赖变更视同经过评审的代码变更:

- 直接外部依赖固定到精确版本;内部 workspace 包保留版本区间。
- `.npmrc` 设置 `save-exact=true` 与 `min-release-age=2`,避免 npm 解析时命中当天刚发布的依赖版本。
- `package-lock.json` 是依赖的唯一事实来源。除非设置 `PI_ALLOW_LOCKFILE_CHANGE=1`,pre-commit 钩子会拦截意外的 lockfile 提交。
- `npm run check` 校验固定的直接依赖、原生 TypeScript 导入兼容性,以及生成的 coding-agent shrinkwrap。
- 发布的 CLI 包内含由根 lockfile 生成的 `packages/coding-agent/npm-shrinkwrap.json`,为 npm 用户固定传递依赖。
- 发布冒烟测试使用 `npm run release:local`,在打 tag 前于仓库之外构建、打包并创建隔离的 npm 与 Bun 安装。
- 本地发布安装、文档中的 npm 安装以及 `pi update --self` 在支持的场景下均使用 `--ignore-scripts`。
- CI 使用 `npm ci --ignore-scripts` 安装依赖,并由定时 GitHub workflow 运行 `npm audit --omit=dev` 与 `npm audit signatures --omit=dev`。
- Shrinkwrap 生成流程对依赖生命周期脚本设有显式白名单;新增带生命周期脚本的依赖若未经评审,检查会直接失败。

## 分享你的开源编程智能体会话

如果你在开源工作中使用 Pi 或其他编程智能体,欢迎公开分享你的会话记录。

真实的 OSS 会话数据(真实任务、工具使用、失败与修复过程)比玩具基准测试更能帮助改进编程智能体。发布会话可使用 [badlogic/pi-share-hf](https://github.com/badlogic/pi-share-hf),只需一个 Hugging Face 账号、Hugging Face CLI 和 pi-share-hf 即可,详见其 README。作者会定期把自己的 pi-mono 工作会话发布在 [badlogicgames/pi-mono(Hugging Face 数据集)](https://huggingface.co/datasets/badlogicgames/pi-mono)。

## 许可证

MIT

---

> 本文档为 [earendil-works/pi](https://github.com/earendil-works/pi) 官方 README 的中文翻译,所有代码版权归原项目作者所有,遵循其原始 MIT 许可证。
>
> **代部署 / 定制服务 / 技术咨询 请添加微信:uaycar**
>
> **如果觉得有用,请给原项目点个 Star!** ⭐
