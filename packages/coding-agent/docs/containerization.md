> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# 容器化

pi 默认以全部权限运行,但有些情况下你会希望更精确地控制 pi 可以写入哪些目录、拥有哪些访问权限。

总体有两种方案:
1. 把整个 `pi` 进程放进隔离环境中运行;或
2. 在宿主机上运行 `pi`,把工具执行路由进隔离环境。

## 选择模式

| 模式 | 隔离对象 | 最适合 | 备注 |
| --- | --- | --- | --- |
| Gondolin 扩展 | 内置工具和 `!` 命令 | 本地 micro-VM 隔离,同时把认证留在宿主机 | 见 [`examples/extensions/gondolin/`](../examples/extensions/gondolin/)。 |
| 纯 Docker | 整个 `pi` 进程放进本地容器 | 简单的本地隔离 | provider API key 会进入容器。 |
| OpenShell | 整个 `pi` 进程放进策略控制的沙箱 | 本地或远程托管沙箱 | 需要 OpenShell 网关 |
| Docker Sandboxes | 整个 `pi` 进程放进托管沙箱 | 本地隔离,provider 密钥留在宿主机 | 需要 Docker Sandboxes(`sbx`)。 |

扩展跟随 `pi` 进程所在位置运行。如果你在宿主机 pi 上使用工具路由扩展,其他自定义扩展工具仍在宿主机执行,除非它们自己也委托操作。

## Gondolin

[Gondolin](https://github.com/earendil-works/gondolin) 是一个本地 Linux micro-VM。
当你想让 `pi` 跑在宿主机、但所有内置工具都路由进 VM 时,使用[示例扩展](../examples/extensions/gondolin)。

安装:

```bash
cp -R packages/coding-agent/examples/extensions/gondolin ~/.pi/agent/extensions/gondolin
cd ~/.pi/agent/extensions/gondolin
npm install --ignore-scripts
```

在你想挂载的项目目录中运行:

```bash
cd /path/to/project
pi -e ~/.pi/agent/extensions/gondolin
```

该扩展把宿主机 cwd 挂载为 VM 内的 `/workspace`,并覆盖 `read`、`write`、`edit`、`bash`、`grep`、`find`、`ls`。
用户的 `!` 命令也会路由进 VM。
`/workspace` 下的文件变更会直写回宿主机。

要求:Node.js >= 23.6.0(用于 `@earendil-works/gondolin`),另需 QEMU(通过包管理器安装)。

## 纯 Docker

想要最简单的本地容器边界时,把整个 `pi` 进程跑在 Docker 里。

`Dockerfile.pi`:

```dockerfile
FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash ca-certificates git ripgrep \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent

WORKDIR /workspace
ENTRYPOINT ["pi"]
```

构建并运行:

```bash
docker build -t pi-sandbox -f Dockerfile.pi .

docker run --rm -it \
  -e ANTHROPIC_API_KEY \
  -v "$PWD:/workspace" \
  -v pi-agent-home:/root/.pi/agent \
  pi-sandbox
```

`-v "$PWD:/workspace"` 把当前目录挂载进容器的 /workspace,这样 Docker 内 `/workspace` 的读写会直接影响宿主机文件,与 Gondolin 示例类似。

如果想要容器私有的设置和会话,给 `/root/.pi/agent` 使用命名卷。直接挂载宿主机的 `~/.pi/agent` 会把宿主机的认证和会话文件暴露给容器。

## OpenShell

想要带文件系统、进程、网络、凭据和推理控制的策略化沙箱时,使用 [NVIDIA OpenShell](https://docs.nvidia.com/openshell/about/overview)。
OpenShell 可以通过由 Docker、Podman 或 VM 运行时支撑的本地网关运行沙箱,也可以通过远程 Kubernetes 网关。

每个沙箱都需要一个活动网关。
创建沙箱前先注册并选择一个:

```bash
openshell gateway add <gateway-url> --name <name>
openshell gateway select <name>
```

在 OpenShell 沙箱内启动 `pi`:

```bash
openshell sandbox create --name pi-sandbox --from pi -- pi
```

此模式下,整个 `pi` 进程运行在沙箱内。
内置工具、`!` 命令和扩展工具都在 OpenShell 边界内执行。

如果网关是远程的,项目文件不会从宿主机 bind-mount,意味着沙箱内的写操作不会反映到你的机器上。
在沙箱内 clone 仓库,或使用 OpenShell 文件传输命令:

```bash
openshell sandbox upload pi-sandbox ./repo /workspace
openshell sandbox download pi-sandbox /workspace/repo ./repo-out
```

OpenShell provider 可以把原始模型 API key 保留在沙箱之外。
配置推理路由后,沙箱内的代码可以调用 `https://inference.local`,由网关在上游注入已配置的 provider 凭据。
要让模型流量走这条路由,把 Pi 配置为对应的 OpenAI 兼容或 Anthropic 兼容 endpoint 即可。

## Docker Sandboxes

[Docker Sandboxes](https://docs.docker.com/ai/sandboxes/) 是 Docker 提供的托管沙箱运行时,把整个 `pi` 进程运行在沙箱内。
它是[无内置沙箱](security.md#no-built-in-sandbox)一节所指的容器边界之一。

与上面的纯 Docker 模式不同,provider 凭据不会传入容器。
沙箱收到的是占位值,`sbx` 代理在对 `api.anthropic.com` 的出站请求上替换为真实凭据。
凭据在创建时接线,因此创建沙箱前先把你的凭据存在宿主机上。

Claude Pro/Max 订阅用户,先在有 Claude Code 的机器上运行 `claude setup-token`,然后把结果存到宿主机。
如果已绑定 `anthropic` secret,先移除它:否则代理会在 Bearer token 旁边附加 `x-api-key` 头,Anthropic 会拒绝请求。
`sbx secret set-custom` 从 stdin 读取 token,因此不会留在 shell 历史里。

```bash
sbx secret rm anthropic

sbx secret set-custom \
  --host api.anthropic.com \
  --env ANTHROPIC_OAUTH_TOKEN \
  --placeholder 'sk-ant-oat01-{rand}'
```

沙箱拿到的是 OAuth 形状的占位符而非真实 token,代理会在出站到该主机时替换;`ANTHROPIC_OAUTH_TOKEN` 是 pi 已读取并优先于 API key 使用的变量,因此无需额外配置 pi。

API key 则改用 `sbx secret set anthropic` 存储。工具包以同样方式接线,作为代理在出站时替换的占位值。

凭据存好后,在你想挂载的项目目录中启动 `pi`:

```bash
sbx run --kit "docker.io/sbx/pi-kit:latest" pi
```

工具包已把 `pi` 预置进镜像,沙箱启动无需安装任何东西,当前目录即沙箱工作区。

不要在沙箱内做认证:在沙箱里执行 `/login` 会把真实 token 写进容器,破坏代理模型。

脚本化使用方式相同:

```bash
sbx exec <sandbox-name> -- pi -p "list the failing tests"
```

完整的凭据矩阵、故障排查和版本固定见[工具包文档](https://github.com/docker/sbx-kits-contrib/tree/main/pi)。
