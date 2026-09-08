> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# 环境变量

Pi 以三种方式使用环境变量:

- `PI_OFFLINE` 之类的变量用于配置 pi 进程本身。
- pi 会设置进程标记,让子进程能识别出启动自己的 agent 是 pi。
- 由 LLM 可调用的 shell 工具执行的命令,会收到描述当前会话的 `PI_*` 变量。

Provider 的 API-key 变量单独记录在 [Providers](providers.md#environment-variables-or-auth-file)。

## 进程标记

CLI 和 RPC 入口会设置两个进程标记:

- `AI_AGENT=pi` 是通用标记,让工具链能识别出 pi 是启动该进程的 agent。
- `PI_CODING_AGENT=true` 是 pi 专属标记,让子进程检测到自己运行在 pi 之内。

子进程会继承这两个标记。它们与具体会话无关,并且在通过 SDK 嵌入 pi 时不会自动设置。

## Shell 工具的会话环境

由 `bash` 和 `powershell` 工具执行的命令会收到当前 pi 会话状态:

| 变量 | 说明 |
|----------|-------------|
| `PI_SESSION_ID` | 当前会话 ID |
| `PI_SESSION_FILE` | 当前会话 JSONL 文件的绝对路径;临时会话不设置 |
| `PI_PROVIDER` | 当前选中的模型 provider |
| `PI_MODEL` | 当前选中的模型 ID |
| `PI_REASONING_LEVEL` | 当前生效的推理等级:`off`、`minimal`、`low`、`medium`、`high`、`xhigh` 或 `max` |

这些值在每条命令启动时解析。因此切换模型或修改推理等级会影响下一条 shell 命令,而无需重启 pi。`PI_PROVIDER` 和 `PI_MODEL` 标识的是 pi 中选中的模型,而不是路由器内部可能选择的另一个上游模型。

当被问到当前运行的是哪个模型或 provider 时,应检查这些变量,而不是从系统提示里推断:

```bash
printf '%s/%s\n' "$PI_PROVIDER" "$PI_MODEL"
printf 'reasoning=%s session=%s\n' "$PI_REASONING_LEVEL" "$PI_SESSION_ID"
```

会话为持久会话时,可以直接查看会话文件:

```bash
if [ -n "$PI_SESSION_FILE" ]; then
  tail -n 1 "$PI_SESSION_FILE"
fi
```

这些变量只会注入 LLM 可调用的 `bash` 和 `powershell` 工具,不会注入用户输入的 `!` 或 `!!` 命令。

### 自定义 Shell 工具

用 `createBashTool()` 或 `createPowerShellTool()` 创建的工具,在向 pi 注册时默认暴露会话环境。注入发生在 `spawnHook` 之前,所以 hook 会在 `ctx.env` 中收到这些变量:

```typescript
const bashTool = createBashTool(cwd, {
  spawnHook: (ctx) => ({
    ...ctx,
    env: { ...ctx.env, CI: "1" },
  }),
});
```

可以独立于 spawn hook 单独禁用会话元数据:

```typescript
const powershellTool = createPowerShellTool(cwd, {
  exposeSessionEnvironment: false,
  spawnHook: (ctx) => ctx,
});
```

禁用后,pi 会移除这些变量的继承值,避免嵌套的 pi 进程暴露过期的父会话元数据。

## Pi 进程配置

以下变量由 pi 自身读取:

| 变量 | 说明 |
|----------|-------------|
| `PI_CODING_AGENT_DIR` | 覆盖配置目录;默认 `~/.pi/agent` |
| `PI_CODING_AGENT_SESSION_DIR` | 覆盖会话存储;`--session-dir` 优先级更高 |
| `PI_PACKAGE_DIR` | 覆盖包目录,对 Nix/Guix store 路径有用 |
| `PI_OFFLINE` | 禁用启动期网络操作,包括更新检查、包更新以及安装/更新遥测 |
| `PI_SKIP_VERSION_CHECK` | 禁用对 `pi.dev` 的最新版本请求 |
| `PI_TELEMETRY` | 覆盖安装/更新遥测与 provider 归因头:`1`/`true`/`yes` 或 `0`/`false`/`no` |
| `PI_CACHE_RETENTION` | 设为 `long` 可在受支持时启用扩展的 provider 提示缓存 |
| `PI_SHARE_VIEWER_URL` | 覆盖 `/share` 使用的 base URL |
| `PI_HARDWARE_CURSOR` | 设为 `1` 显示硬件光标;见[终端配置](terminal-setup.md) |
| `PI_HYPERLINKS` | 以 `1`、`0` 或 `auto` 覆盖 OSC 8 超链接检测 |
| `PI_IMAGE_PROTOCOL` | 以 `kitty`、`iterm2`、`none` 或 `auto` 覆盖内联图片检测 |
| `PI_TRUE_COLOR` | 以 `1`、`0` 或 `auto` 覆盖真彩检测 |
| `PI_TUI_ESC_TIMEOUT` | 单独的 ESC 按键被判定为 Escape 键前的等待毫秒数;SSH 下默认 `100`,其他默认 `10`。Alt 键输入被误判为 Escape 时可调大 |
| `VISUAL`, `EDITOR` | `externalEditor` 未设置时的外部编辑器回退 |
| `HTTP_PROXY`, `HTTPS_PROXY` | 为出站 HTTP 请求设置代理 |

`ANTHROPIC_API_KEY`、`OPENAI_API_KEY` 等 provider 凭据以及云端 provider 配置见 [Providers](providers.md#environment-variables-or-auth-file)。

`PI_SERVER_DIR` 和 `PI_SERVER_ID` 只作用于仅源码可用的[实验性远程 harness](development.md#experimental-remote-harness),不适用于分发包。
