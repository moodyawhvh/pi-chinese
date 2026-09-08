> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# llama.cpp

pi 支持 [llama.cpp](https://github.com/ggml-org/llama.cpp) 的 router 服务器。router 能发现多个 GGUF 模型并按需加载/卸载。

请使用支持 router 的较新 llama.cpp 构建。按[构建说明](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md)自行构建,或安装适合你平台的[预编译版本](https://github.com/ggml-org/llama.cpp/releases)。

## 启动 router

不带 `--model` 或 `-m` 启动 `llama-server`。传入模型会进入单模型模式而非 router 模式。

```bash
llama-server \
  --models-dir ~/models \
  --no-models-autoload \
  --jinja \
  --host 127.0.0.1 \
  --port 8080 \
  -ngl 999 \
  -c 32768
```

重要选项:

- `--models-dir ~/models` 发现本地 GGUF 文件。
- `--no-models-autoload` 让加载始终通过 `/llama` 显式进行。
- `--jinja` 启用兼容的聊天模板与工具调用。
- `-ngl 999` 尽可能多地把层卸载到 GPU。
- `-c 32768` 为每个已加载模型设置上下文窗口。省略则使用模型原生上下文,但可能需要显著更多内存。

单文件模型可直接放在模型目录下。多模态和多分片模型放在独立子目录中:

```text
~/models/
├── llama-3.2-1b-Q4_K_M.gguf
├── gemma-3-4b-it-Q4_K_M/
│   ├── gemma-3-4b-it-Q4_K_M.gguf
│   └── mmproj-F16.gguf
└── large-model-Q4_K_M/
    ├── large-model-Q4_K_M-00001-of-00003.gguf
    ├── large-model-Q4_K_M-00002-of-00003.gguf
    └── large-model-Q4_K_M-00003-of-00003.gguf
```

手动添加文件后重启 router。要设置每模型的上下文大小等选项,使用 [llama.cpp model presets](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md#model-presets)。

## 配置 Pi

启动 Pi 并配置 provider:

```text
/login llama.cpp
```

输入 router URL 和可选的 API key。默认 URL 为 `http://127.0.0.1:8080`。

如果 router 以 `--no-models-autoload` 启动,`/login llama.cpp` 只保存连接信息。先运行 `/llama` 加载模型,再运行 `/model` 为当前会话选择已加载的模型。

也可以用环境变量配置同样的值,无需 `/login`:

```bash
export LLAMA_BASE_URL=http://127.0.0.1:8080
export LLAMA_API_KEY=optional-secret
pi
```

如果服务器启用了 API key,启动 `llama-server` 时要带上匹配的 `--api-key` 值。保持 `--host 127.0.0.1` 可限制为仅本地访问。

## 管理模型

运行:

```text
/llama
```

- 选中未加载的模型即加载。
- 选中已加载的模型即卸载。
- 选择 **Download model…**,搜索 Hugging Face,然后选择仓库和量化版本。也支持精确的 `owner/repository[:quant]` 值。
- 加载或下载过程中按 Escape 可确认取消。

Hugging Face 搜索在设置了 `HF_TOKEN` 时使用它,否则依次检查 `$HF_TOKEN_PATH`、`$HF_HOME/token`、`$XDG_CACHE_HOME/huggingface/token` 和 `~/.cache/huggingface/token`。未认证也可以搜索,但速率限制更低。下载受限(gated)仓库前 pi 会警告并给出其访问页链接。实际下载由 llama.cpp 服务器执行,因此所选仓库需要授权时,其进程也必须持有 `HF_TOKEN`。

如果已有其他模型加载中,pi 会询问是先卸载它们还是保持加载。pi 不会静默卸载模型,也绝不删除模型文件。router 可能与其他客户端共享,因此 `/llama` 总是显示 router 的当前状态。

只有已加载的模型会出现在 `/model` 中。加载模型后,运行 `/model` 为当前 Pi 会话选择它。

如果 router 断开,`/llama` 会显示 **Retry** 和 **Close**。Retry 会重新连接并刷新模型状态,不会重放被中断的操作。

## 故障排查

检查 router 是否可达:

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/models
```

- **`/llama` 中没有模型:** 检查 `--models-dir` 和目录布局,并重启 router。
- **`/model` 中缺少模型:** 先用 `/llama` 加载。
- **加载失败或内存占用过高:** 调低 `-c` 或卸载其他模型。
- **服务器不在 router 模式:** 启动时不要带 `--model`、`-m` 或 `-hf`。
