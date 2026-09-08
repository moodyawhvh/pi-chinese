> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# 开发

更多准则见 [AGENTS.md](https://github.com/earendil-works/pi/blob/main/AGENTS.md)。

## 环境搭建

```bash
git clone https://github.com/earendil-works/pi
cd pi
npm install
npm run build
```

从源码运行:

```bash
/path/to/pi/pi-test.sh
```

该脚本可以在任意目录下运行。pi 会保持在调用者当前的工作目录。

### 实验性远程 harness

远程 harness 的 server/client 集成仅用于开发。在仓库根目录运行:

```bash
PI_EXPERIMENTAL=1 ./pi-test.sh server
PI_EXPERIMENTAL=1 ./pi-test.sh client
```

`PI_SERVER_DIR` 覆盖 server 的 profile 和 socket 目录(默认:`~/.pi/server`)。省略 `--server-id` 时,`PI_SERVER_ID` 用于选择逻辑 server ID。

`client` 和 `experimental/plugin` 包子路径仅在 checkout 中以 `source` 条件解析。它们的实现以及 server/client 命令都不包含在 npm 包和独立二进制中。`pi-client`、`pi-protocol` 和 `pi-server` 是 coding-agent 的开发依赖,不是运行时依赖。本地 SDK 和 stdio RPC API 保持不变。

## Fork / 换牌

通过 `package.json` 配置:

```json
{
  "piConfig": {
    "name": "pi",
    "configDir": ".pi"
  }
}
```

为你的 fork 修改 `name`、`configDir` 和 `bin` 字段。这会影响 CLI 横幅、配置路径和环境变量名称。

## 路径解析

三种执行模式:npm 安装、独立二进制、源码 tsx。

**包资源一律使用 `src/config.ts`**:

```typescript
import { getPackageDir, getThemeDir } from "./config.js";
```

绝不要直接对包资源使用 `__dirname`。

## 调试命令

`/debug`(隐藏命令)写入 `~/.pi/agent/pi-debug.log`:
- 带 ANSI 码的渲染后 TUI 行
- 最近发送给 LLM 的消息

## 测试

```bash
./test.sh                         # 运行非 LLM 测试(无需 API key)
npm test                          # 运行全部测试
npm test -- test/specific.test.ts # 运行指定测试
```

### 已发布包冒烟测试

构建完成后,运行 `npm run check:package-install`。它会打包公开包,并在仓库外的临时目录中仅以直接依赖方式安装 coding-agent。本地 tarball 覆盖会选择已声明的传递依赖,而不安装仅用于开发的包。该检查在不带凭据、不发起模型请求的情况下验证 SDK 导入和 CLI 启动。

`npm run check` 还会检查运行时依赖声明,并拒绝通过 import 被拉进包构建的排除开发源码。

## 项目结构

```
packages/
  ai/           # LLM provider 抽象
  agent/        # Agent 循环与消息类型  
  tui/          # 终端 UI 组件
  coding-agent/ # CLI 与交互模式
```
