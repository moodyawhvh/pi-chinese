> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。
>
> 注:本文件为 provider 核心参考,配置表与解析规则均属关键内容,已完整翻译。

# Provider

pi 通过 OAuth 支持订阅制 provider,通过环境变量或认证文件支持 API key provider。内置目录随 pi 分发;已配置的 provider 可刷新更新的目录并缓存在 `~/.pi/agent/models-store.json` 中供离线使用。

## 目录

- [订阅](#订阅)
- [API Key](#api-key)
- [认证文件](#认证文件)
- [云 Provider](#云-provider)
- [llama.cpp](#llamacpp)
- [自定义 Provider](#自定义-provider)
- [解析顺序](#解析顺序)

## 订阅

在交互模式使用 `/login`,然后选择 provider:

- ChatGPT Plus/Pro (Codex)
- Claude Pro/Max
- GitHub Copilot
- xAI(Grok/X 订阅)
- OpenRouter(OAuth 签发的 API key,从 OpenRouter 余额计费)
- Radius

用 `/logout` 清除凭据。token 存储在 `~/.pi/agent/auth.json`,过期后自动刷新。OpenRouter 例外:签发的是用户自控的 API key,不会自动过期。

### OpenAI Codex

- 需要 ChatGPT Plus 或 Pro 订阅
- 获 OpenAI 官方认可:[Codex for OSS](https://developers.openai.com/community/codex-for-oss)

### Claude Pro/Max

Anthropic 订阅认证对 Claude Pro/Max 账户开放。第三方 harness 用量从 [extra usage](https://claude.ai/settings/usage) 扣费,按 token 计费,不占用 Claude 套餐额度。

### GitHub Copilot

- 访问 github.com 直接按 Enter,或输入你的 GitHub Enterprise Server 域名
- 如果提示 "model not supported",在 VS Code 中启用:Copilot Chat → 模型选择器 → 选中模型 → "Enable"

### xAI(Grok/X 订阅)

- 运行 `/login xai`,然后选择 **Use a subscription**
- `XAI_API_KEY` 仍可通过 **Use an API key** 使用

### OpenRouter

- 运行 `/login openrouter`,然后选择 **Sign in with OpenRouter**,进入 OpenRouter PKCE 授权流程
- 授权会创建一个用户自控的 OpenRouter API key,从你的 OpenRouter 余额计费
- 在远程/无头机器(如通过 SSH)上,浏览器无法访问 loopback 回调;改为把最终重定向 URL(或授权码)粘贴进登录提示
- `OPENROUTER_API_KEY` 仍可通过 **Use an API key** 使用

### Radius

Radius 是动态 `pi-messages` 网关。`/login radius` 把 OAuth token 存入 `auth.json`;网关目录独立刷新并缓存在 `models-store.json`。自定义 Radius 网关可在 `models.json` 中以 `"oauth": "radius"` 加网关 `baseUrl` 声明。

## API Key

### 环境变量或认证文件

在交互模式使用 `/login` 并选择 provider,把 API key 存入 `auth.json`;或通过环境变量设置凭据:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pi
```

| Provider | 环境变量 | `auth.json` 键 |
|----------|----------|----------------|
| Anthropic | `ANTHROPIC_API_KEY` | `anthropic` |
| Ant Ling | `ANT_LING_API_KEY` | `ant-ling` |
| Azure OpenAI Responses | `AZURE_OPENAI_API_KEY` | `azure-openai-responses` |
| OpenAI | `OPENAI_API_KEY` | `openai` |
| DeepSeek | `DEEPSEEK_API_KEY` | `deepseek` |
| NVIDIA NIM | `NVIDIA_API_KEY` | `nvidia` |
| Google Gemini | `GEMINI_API_KEY` | `google` |
| Amazon Bedrock | `AWS_BEARER_TOKEN_BEDROCK` | `amazon-bedrock` |
| Mistral | `MISTRAL_API_KEY` | `mistral` |
| Groq | `GROQ_API_KEY` | `groq` |
| Cerebras | `CEREBRAS_API_KEY` | `cerebras` |
| Cloudflare AI Gateway | `CLOUDFLARE_API_KEY`(+ `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_GATEWAY_ID`) | `cloudflare-ai-gateway` |
| Cloudflare Workers AI | `CLOUDFLARE_API_KEY`(+ `CLOUDFLARE_ACCOUNT_ID`) | `cloudflare-workers-ai` |
| xAI | `XAI_API_KEY` | `xai` |
| OpenRouter | `OPENROUTER_API_KEY` | `openrouter` |
| Vercel AI Gateway | `AI_GATEWAY_API_KEY` | `vercel-ai-gateway` |
| ZAI Coding Plan(国际) | `ZAI_API_KEY` | `zai` |
| ZAI Coding Plan(中国) | `ZAI_CODING_CN_API_KEY` | `zai-coding-cn` |
| OpenCode Zen | `OPENCODE_API_KEY` | `opencode` |
| OpenCode Go | `OPENCODE_API_KEY` | `opencode-go` |
| Radius | `RADIUS_API_KEY` | `radius` |
| Hugging Face | `HF_TOKEN` | `huggingface` |
| Fireworks | `FIREWORKS_API_KEY` | `fireworks` |
| Together AI | `TOGETHER_API_KEY` | `together` |
| Baseten | `BASETEN_API_KEY` | `baseten` |
| Kimi For Coding | `KIMI_API_KEY` | `kimi-coding` |
| MiniMax | `MINIMAX_API_KEY` | `minimax` |
| MiniMax(中国) | `MINIMAX_CN_API_KEY` | `minimax-cn` |
| Qwen Token Plan(现有目录) | `QWEN_TOKEN_PLAN_API_KEY` | `qwen-token-plan` |
| Qwen Token Plan(个人版) | `QWEN_TOKEN_PLAN_API_KEY` | `qwen-token-plan-individual` |
| Qwen Token Plan(中国) | `QWEN_TOKEN_PLAN_CN_API_KEY` | `qwen-token-plan-cn` |
| Xiaomi MiMo | `XIAOMI_API_KEY` | `xiaomi` |
| Xiaomi MiMo Token Plan(中国) | `XIAOMI_TOKEN_PLAN_CN_API_KEY` | `xiaomi-token-plan-cn` |
| Xiaomi MiMo Token Plan(阿姆斯特丹) | `XIAOMI_TOKEN_PLAN_AMS_API_KEY` | `xiaomi-token-plan-ams` |
| Xiaomi MiMo Token Plan(新加坡) | `XIAOMI_TOKEN_PLAN_SGP_API_KEY` | `xiaomi-token-plan-sgp` |

环境变量与 `auth.json` 键的权威参考:[`packages/ai/src/env-api-keys.ts`](https://github.com/earendil-works/pi/blob/main/packages/ai/src/env-api-keys.ts) 中的 [`const envMap`](https://github.com/earendil-works/pi/blob/main/packages/ai/src/env-api-keys.ts)。

#### 认证文件

凭据存放在 `~/.pi/agent/auth.json`:

```json
{
  "anthropic": { "type": "api_key", "key": "sk-ant-..." },
  "ant-ling": { "type": "api_key", "key": "..." },
  "openai": { "type": "api_key", "key": "sk-..." },
  "deepseek": { "type": "api_key", "key": "sk-..." },
  "nvidia": { "type": "api_key", "key": "nvapi-..." },
  "google": { "type": "api_key", "key": "..." },
  "opencode": { "type": "api_key", "key": "..." },
  "opencode-go": { "type": "api_key", "key": "..." },
  "together": { "type": "api_key", "key": "..." },
  "qwen-token-plan":  { "type": "api_key", "key": "sk-sp-..." },
  "qwen-token-plan-individual": { "type": "api_key", "key": "sk-sp-..." },
  "qwen-token-plan-cn": { "type": "api_key", "key": "sk-sp-..." },
  "xiaomi": { "type": "api_key", "key": "..." },
  "xiaomi-token-plan-cn":  { "type": "api_key", "key": "..." },
  "xiaomi-token-plan-ams": { "type": "api_key", "key": "..." },
  "xiaomi-token-plan-sgp": { "type": "api_key", "key": "..." }
}
```

`qwen-token-plan-individual` 使用与国际版 `qwen-token-plan` 相同的 endpoint 和 `QWEN_TOKEN_PLAN_API_KEY`,但选择器只显示个人版订阅文档中的模型。现有 provider 保留更全的目录以保持向后兼容。使用 `auth.json` 时,把凭据存到你选择的那个 provider 键下;环境变量则由两个国际版 provider 共享。

该文件以 `0600` 权限创建(仅用户可读写)。认证文件凭据优先于环境变量。

API key 凭据还可以包含 provider 作用域的环境变量值。解析凭据 key、provider/model 请求头以及 provider 配置(如 Cloudflare 账户 ID、Azure OpenAI 设置、Vertex project/location、Bedrock 设置、`PI_CACHE_RETENTION`、`HTTP_PROXY`/`HTTPS_PROXY`)时,这些值优先于进程环境变量。

```json
{
  "cloudflare-ai-gateway": {
    "type": "api_key",
    "key": "$CLOUDFLARE_API_KEY",
    "env": {
      "CLOUDFLARE_API_KEY": "...",
      "CLOUDFLARE_ACCOUNT_ID": "account-id",
      "CLOUDFLARE_GATEWAY_ID": "gateway-id"
    }
  }
}
```

当你希望 pi 使用与项目 shell 环境不同的 provider 设置时,用它。

### Key 解析

`key` 字段支持命令执行、环境变量插值和字面量:

- **Shell 命令:** 以 `"!command"` 开头时,整个值作为命令执行并取 stdout(进程生命周期内缓存)
  ```json
  { "type": "api_key", "key": "!security find-generic-password -ws 'anthropic'" }
  { "type": "api_key", "key": "!op read 'op://vault/item/credential'" }
  ```
- **环境变量插值:** `"$ENV_VAR"` 或 `"${ENV_VAR}"` 使用指定变量的值。插值也可嵌在更大的字面量中。
  ```json
  { "type": "api_key", "key": "$MY_ANTHROPIC_KEY" }
  { "type": "api_key", "key": "${KEY_PREFIX}_${KEY_SUFFIX}" }
  ```
  `$FOO_BAR` 是变量 `FOO_BAR`;当 `BAR` 是字面文本时用 `${FOO}_BAR`。环境变量缺失会导致该值无法解析。
- **转义:** `"$$"` 输出字面 `"$"`;`"$!"` 输出字面 `"!"`,不触发命令执行。
  ```json
  { "type": "api_key", "key": "$$literal-dollar-prefix" }
  { "type": "api_key", "key": "$!literal-bang-prefix" }
  ```
- **字面量:** 直接使用。`MY_API_KEY` 这类纯大写字符串是字面量;要引用环境变量请写 `$MY_API_KEY`。
  ```json
  { "type": "api_key", "key": "sk-ant-..." }
  { "type": "api_key", "key": "public" }
  ```

OAuth 凭据在 `/login` 后也存储于此,并自动管理。

## 云 Provider

### Azure OpenAI

```bash
export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_BASE_URL=https://your-resource.ai.azure.com
# also supported: https://your-resource.cognitiveservices.azure.com
# also supported: https://your-resource.openai.azure.com
# root endpoints are auto-normalized to /openai/v1
# or use resource name instead of base URL
export AZURE_OPENAI_RESOURCE_NAME=your-resource

# Optional
export AZURE_OPENAI_API_VERSION=2024-02-01
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP=gpt-4=my-gpt4,gpt-4o=my-gpt4o
```

### Amazon Bedrock

用 `/login amazon-bedrock` 存储 Bedrock API key,或配置以下任一环境式 AWS 凭据来源:

```bash
# Option 1: AWS Profile
export AWS_PROFILE=your-profile

# Option 2: IAM Keys
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...

# Option 3: Bearer Token
export AWS_BEARER_TOKEN_BEDROCK=...

# Optional region (defaults to us-east-1)
export AWS_REGION=us-west-2
```

还支持 ECS 任务角色(`AWS_CONTAINER_CREDENTIALS_*`)和 IRSA(`AWS_WEB_IDENTITY_TOKEN_FILE`)。

```bash
pi --provider amazon-bedrock --model us.anthropic.claude-sonnet-4-20250514-v1:0
```

ID 中包含可识别模型名的 Claude 模型(基础模型和系统定义的推理配置档)会自动启用提示缓存。对于应用推理配置档(ARN 中不含模型名),设置 `AWS_BEDROCK_FORCE_CACHE=1` 以启用缓存点:

```bash
export AWS_BEDROCK_FORCE_CACHE=1
pi --provider amazon-bedrock --model arn:aws:bedrock:us-east-1:123456789012:application-inference-profile/abc123
```

如果你连接的是 Bedrock API 代理,可使用以下环境变量:

```bash
# Set the URL for the Bedrock proxy (standard AWS SDK env var)
export AWS_ENDPOINT_URL_BEDROCK_RUNTIME=https://my.corp.proxy/bedrock

# Set if your proxy does not require authentication
export AWS_BEDROCK_SKIP_AUTH=1

# Set if your proxy only supports HTTP/1.1
export AWS_BEDROCK_FORCE_HTTP1=1
```

### Cloudflare AI Gateway

`CLOUDFLARE_API_KEY` 可通过 `/login` 设置。账户 ID 和网关 slug 可用环境变量,或写在 `auth.json` 中 API key 凭据的 `env` 对象里。

```bash
export CLOUDFLARE_API_KEY=...           # or use /login
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_GATEWAY_ID=...        # create at dash.cloudflare.com → AI → AI Gateway
pi --provider cloudflare-ai-gateway --model "claude-sonnet-4-5"
```

通过 Cloudflare AI Gateway 路由到 OpenAI、Anthropic 和 Workers AI。Workers AI 使用统一 API(`/compat`)和带前缀的模型 ID(`workers-ai/@cf/...`)。OpenAI 使用 OpenAI 透传路由(`/openai`)和原生 OpenAI 模型 ID(如 `gpt-5.1`)。Anthropic 使用 Anthropic 透传路由(`/anthropic`)和原生 Anthropic 模型 ID(如 `claude-sonnet-4-5`)。

AI Gateway 认证使用 `CLOUDFLARE_API_KEY` 作为 `cf-aig-authorization`。上游认证可以是:

| 模式 | 请求认证 | 上游认证 |
|------|----------|----------|
| Workers AI | 仅 Cloudflare token | Cloudflare 原生 |
| 统一计费 | 仅 Cloudflare token | Cloudflare 处理上游认证并扣减余额 |
| 存储 BYOK | 仅 Cloudflare token | Cloudflare 注入存在 AI Gateway 控制台中的 provider 密钥 |
| 内联 BYOK | Cloudflare token 加上游 `Authorization` 头 | 请求自带上游 provider 密钥 |

正常使用 pi 时,优先选择统一计费或存储 BYOK。内联 BYOK 需要为 Cloudflare AI Gateway provider 额外配置上游 `Authorization` 头,例如通过 `models.json` 的 provider/model 覆盖。

### Cloudflare Workers AI

`CLOUDFLARE_API_KEY` 可通过 `/login` 设置。`CLOUDFLARE_ACCOUNT_ID` 可用环境变量或写在 `auth.json` 中 API key 凭据的 `env` 对象里。

```bash
export CLOUDFLARE_API_KEY=...           # or use /login
export CLOUDFLARE_ACCOUNT_ID=...
pi --provider cloudflare-workers-ai --model "@cf/moonshotai/kimi-k2.6"
```

pi 会自动为 [prefix caching](https://developers.cloudflare.com/workers-ai/features/prompt-caching/) 折扣设置 `x-session-affinity`。

### Google Vertex AI

使用应用默认凭据:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT=your-project
export GOOGLE_CLOUD_LOCATION=us-central1
```

或将 `GOOGLE_APPLICATION_CREDENTIALS` 指向服务账号密钥文件。

## llama.cpp

pi 支持 llama.cpp router 服务器。用 `/login llama.cpp` 配置,用 `/llama` 管理已加载模型,用 `/model` 选择已加载模型。

服务器搭建、模型目录布局、环境变量和命令用法见 [llama.cpp](llama-cpp.md)。

## 自定义 Provider

**通过 models.json:** 添加 Ollama、LM Studio、vLLM 或任何讲受支持 API(OpenAI Completions、OpenAI Responses、Anthropic Messages、Google Generative AI)的 provider。见 [models.md](models.md)。

**通过扩展:** 需要自定义 API 实现或 OAuth 流程的 provider,请写扩展。见 [custom-provider.md](custom-provider.md) 和 [examples/extensions/custom-provider-gitlab-duo](../examples/extensions/custom-provider-gitlab-duo/)。

## 解析顺序

解析 provider 凭据时的顺序:

1. CLI `--api-key` 参数
2. `auth.json` 条目(API key 或 OAuth token)
3. 环境变量
4. `models.json` 中的自定义 provider 密钥
