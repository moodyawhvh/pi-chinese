> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。
>
> 注:本文件为自定义模型配置的核心参考,字段表与兼容性说明均属关键内容,已完整翻译。

# 自定义模型

通过 `~/.pi/agent/models.json` 添加自定义 provider 和模型(Ollama、vLLM、LM Studio、代理等)。

## 目录

- [最小示例](#最小示例)
- [完整示例](#完整示例)
- [支持的 API](#支持的-api)
- [Provider 配置](#provider-配置)
- [模型配置](#模型配置)
- [覆盖内置 Provider](#覆盖内置-provider)
- [按模型覆盖](#按模型覆盖)
- [Anthropic Messages 兼容性](#anthropic-messages-兼容性)
- [OpenAI 兼容性](#openai-兼容性)

## 最小示例

对本地模型(Ollama、LM Studio、vLLM),每个模型只需 `id`:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "llama3.1:8b" },
        { "id": "qwen2.5-coder:7b" }
      ]
    }
  }
}
```

`apiKey` 是占位值,因为 Ollama 会忽略它。但 pi 仍要求模型配置了认证才会出现在 `/model` 中,所以无密钥的本地服务器应保留一个假值、用 `/login` 为该 provider 保存一个 key,或在选择模型时传 `--api-key`。

部分 OpenAI 兼容服务器不理解面向推理模型的 `developer` 角色。对这类 provider,把 `compat.supportsDeveloperRole` 设为 `false`,pi 会改用 `system` 消息发送系统提示。如果服务器也不支持 `reasoning_effort`,同时把 `compat.supportsReasoningEffort` 设为 `false`。

`compat` 可设在 provider 级(作用于所有模型)或模型级(覆盖特定模型)。常见于 Ollama、vLLM、SGLang 等类似的 OpenAI 兼容服务器。

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "compat": {
        "supportsDeveloperRole": false,
        "supportsReasoningEffort": false
      },
      "models": [
        {
          "id": "gpt-oss:20b",
          "reasoning": true
        }
      ]
    }
  }
}
```

## 完整示例

需要特定值时覆盖默认项:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        {
          "id": "llama3.1:8b",
          "name": "Llama 3.1 8B (Local)",
          "reasoning": false,
          "input": ["text"],
          "contextWindow": 128000,
          "maxTokens": 32000,
          "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
        }
      ]
    }
  }
}
```

每次打开 `/model` 时该文件都会重新加载。会话中直接编辑即可,无需重启。

## Google AI Studio 示例

用 `google-generative-ai` 加 `baseUrl` 可添加 Google AI Studio 的模型,包括自定义 Gemma 4 条目:

```json
{
  "providers": {
    "my-google": {
      "baseUrl": "https://generativelanguage.googleapis.com/v1beta",
      "api": "google-generative-ai",
      "apiKey": "$GEMINI_API_KEY",
      "models": [
        {
          "id": "gemma-4-31b-it",
          "name": "Gemma 4 31B",
          "input": ["text", "image"],
          "contextWindow": 262144,
          "reasoning": true
        }
      ]
    }
  }
}
```

为 `google-generative-ai` API 类型添加自定义模型时 `baseUrl` 必填。

## 支持的 API

| API | 说明 |
|-----|------|
| `openai-completions` | OpenAI Chat Completions(兼容性最好) |
| `openai-responses` | OpenAI Responses API |
| `anthropic-messages` | Anthropic Messages API |
| `google-generative-ai` | Google Generative AI |

`api` 可设在 provider 级(所有模型的默认值)或模型级(按模型覆盖)。

## Provider 配置

| 字段 | 说明 |
|------|------|
| `baseUrl` | API endpoint URL |
| `api` | API 类型(见上表) |
| `apiKey` | 可选的 API key 配置(见下文值解析)。认证由 `/login`/`auth.json` 或 CLI `--api-key` 提供时省略。 |
| `oauth` | 动态 OAuth provider 类型。当前支持 `"radius"`;需要网关 `baseUrl`。 |
| `headers` | 自定义请求头(见下文值解析) |
| `authHeader` | 设为 `true` 自动添加 `Authorization: Bearer <apiKey>` |
| `models` | 模型配置数组 |
| `modelOverrides` | 对该 provider 上内置或扩展注册模型的按模型覆盖 |

带 `models` 的非内置 provider 配置需要 `baseUrl`,并在 provider 或模型级给出 `api` 值。加载文件不要求 `apiKey`:通过 `/login`/`auth.json`、CLI `--api-key` 或 provider `apiKey` 配置认证后模型才可用。未配置认证时模型会加载,但在 `/model` 和 `--list-models` 中不可用。

### 值解析

`apiKey` 和 `headers` 字段支持命令执行、环境变量插值和字面量:

- **Shell 命令:** 以 `"!command"` 开头时,整个值作为命令执行并取 stdout
  ```json
  "apiKey": "!security find-generic-password -ws 'anthropic'"
  "apiKey": "!op read 'op://vault/item/credential'"
  ```
- **环境变量插值:** `"$ENV_VAR"` 或 `"${ENV_VAR}"` 使用指定变量的值。插值也可嵌在更大的字面量中。
  ```json
  "apiKey": "$MY_API_KEY"
  "apiKey": "${KEY_PREFIX}_${KEY_SUFFIX}"
  ```
  `$FOO_BAR` 是变量 `FOO_BAR`;当 `BAR` 是字面文本时用 `${FOO}_BAR`。环境变量缺失会导致该值无法解析。
- **转义:** `"$$"` 输出字面 `"$"`;`"$!"` 输出字面 `"!"`,不触发命令执行。
  ```json
  "apiKey": "$$literal-dollar-prefix"
  "apiKey": "$!literal-bang-prefix"
  ```
- **字面量:** 直接使用。`MY_API_KEY` 这类纯大写字符串是字面量;要引用环境变量请写 `$MY_API_KEY`。
  ```json
  "apiKey": "sk-..."
  ```

对 `models.json`,shell 命令在请求时解析。pi 有意不为任意命令应用内置 TTL、过期复用或恢复逻辑。不同命令需要不同的缓存与失败策略,pi 无法替你推断。

如果命令慢、昂贵、有速率限制,或希望瞬时失败时沿用上一个值,请把它包进你自己实现缓存/TTL 行为的脚本或命令里。

`/model` 的可用性检查只看已配置的认证是否存在,不会执行 shell 命令。

### 自定义请求头

```json
{
  "providers": {
    "custom-proxy": {
      "baseUrl": "https://proxy.example.com/v1",
      "apiKey": "$MY_API_KEY",
      "api": "anthropic-messages",
      "headers": {
        "x-portkey-api-key": "$PORTKEY_API_KEY",
        "x-secret": "!op read 'op://vault/item/secret'"
      },
      "models": [...]
    }
  }
}
```

## 模型配置

| 字段 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | 是 | — | 模型标识(传给 API) |
| `name` | 否 | `id` | 人类可读的模型标签。用于匹配(`--model` 模式)并显示为次级模型详情文本。 |
| `api` | 否 | provider 的 `api` | 为该模型覆盖 provider 的 API |
| `reasoning` | 否 | `false` | 支持扩展思考 |
| `thinkingLevelMap` | 否 | 省略 | 把 pi 思考等级映射到 provider 取值,并标记不支持的等级(见下) |
| `input` | 否 | `["text"]` | 输入类型:`["text"]` 或 `["text", "image"]` |
| `contextWindow` | 否 | `128000` | 上下文窗口大小(token) |
| `maxTokens` | 否 | `16384` | 最大输出 token |
| `samplingParams` | 否 | 省略 | 原样合并进每个请求体的采样参数(见下) |
| `cost` | 否 | 全 0 | 每百万 token 费率,可选按请求总输入价格分档 |
| `compat` | 否 | provider `compat` | provider 兼容性覆盖。与 provider 级 `compat` 同时设置时合并。 |

费用分档提供一套完整的替代费率,当请求总输入用量(`input + cacheRead + cacheWrite`)超过 `inputTokensAbove` 时作用于整个请求。多个分档匹配时取最高阈值。

```json
{
  "cost": {
    "input": 5,
    "output": 30,
    "cacheRead": 0.5,
    "cacheWrite": 6.25,
    "tiers": [
      {
        "inputTokensAbove": 272000,
        "input": 10,
        "output": 45,
        "cacheRead": 1,
        "cacheWrite": 12.5
      }
    ]
  }
}
```

当前行为:
- `/model`、`--list-models` 和交互页脚按模型 `id` 显示条目。
- 配置的 `name` 用于模型匹配和次级模型详情文本,不会替换页脚/状态栏中的模型 id。

### 采样参数

`samplingParams` 是自由格式对象,在 pi 自身设置的字段之后原样合并进该模型的每个请求体,因此其键优先。用它发送 pi 未建模的采样参数——包括服务器特有的参数,如 llama.cpp 的 `min_p` 或 vLLM 的 `top_k`:

```json
{
  "id": "deepseek-v4-flash",
  "samplingParams": {
    "temperature": 1.0,
    "top_p": 0.95,
    "top_k": 0,
    "min_p": 0.0
  }
}
```

只有 OpenAI 兼容 API 会应用它(`openai-completions`、`openai-responses`、`azure-openai-responses`);其他 API 忽略。其键会覆盖 pi 的具名请求字段(例如这里的 `temperature` 键胜过请求级 temperature),因此建议把它作为该模型采样参数的唯一事实来源。在 `modelOverrides` 中,`samplingParams` 按键与基础模型的值合并。

恒定的思考 token 上限也可以写在这里,但它不会跟随 `thinkingBudgets`,也不会为答案预留空间。这类需求请用 `compat.thinkingTokenBudgetField`(或别名 `supportsThinkingTokenBudget`)。

### 思考等级映射

在模型上使用 `thinkingLevelMap` 描述模型特定的思考控制。键是 pi 思考等级:`off`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max`。映射可以有空洞;例如模型可以暴露 `high` 和 `max` 而不暴露 `xhigh`。

取值为三态:

| 值 | 含义 |
|----|------|
| 省略 | `high` 及以下的标准等级使用 provider 默认映射;扩展的 `xhigh` 和 `max` 不支持 |
| 字符串 | 该等级受支持,此值发送给 provider |
| `null` | 该等级不支持,在 UI 中隐藏/跳过/钳制 |

只支持 off、high、max 推理的模型示例:

```json
{
  "id": "deepseek-v4-pro",
  "reasoning": true,
  "thinkingLevelMap": {
    "minimal": null,
    "low": null,
    "medium": null,
    "high": "high",
    "xhigh": null,
    "max": "max"
  }
}
```

思考不可关闭的模型示例:

```json
{
  "id": "always-thinking-model",
  "reasoning": true,
  "thinkingLevelMap": {
    "off": null
  }
}
```

迁移:旧配置中使用 `compat.reasoningEffortMap` 的映射应移到模型级 `thinkingLevelMap`。不应出现在 UI 中的等级用 `null`。

## 覆盖内置 Provider

不重定义模型、让内置 provider 走代理:

```json
{
  "providers": {
    "anthropic": {
      "baseUrl": "https://my-proxy.example.com/v1"
    }
  }
}
```

所有内置 Anthropic 模型保持可用。已有的 OAuth 或 API key 认证继续生效。

要把自定义模型合并进内置 provider,加上 `models` 数组:

```json
{
  "providers": {
    "anthropic": {
      "baseUrl": "https://my-proxy.example.com/v1",
      "apiKey": "$ANTHROPIC_API_KEY",
      "api": "anthropic-messages",
      "models": [...]
    }
  }
}
```

合并语义:
- 内置模型保留。
- 自定义模型在 provider 内按 `id` upsert。
- 自定义模型 `id` 与内置模型 `id` 相同时,替换该内置模型。
- 自定义模型 `id` 是新的时,与内置模型并列添加。

## 按模型覆盖

用 `modelOverrides` 定制内置模型及匹配的扩展注册模型,而不必替换 provider 的完整模型列表。

```json
{
  "providers": {
    "openrouter": {
      "modelOverrides": {
        "anthropic/claude-sonnet-4": {
          "name": "Claude Sonnet 4 (Bedrock Route)",
          "compat": {
            "openRouterRouting": {
              "only": ["amazon-bedrock"]
            }
          }
        }
      }
    }
  }
}
```

`modelOverrides` 对每个模型支持这些字段:`name`、`reasoning`、`thinkingLevelMap`、`input`、`cost`(部分)、`contextWindow`、`maxTokens`、`samplingParams`(按键合并)、`headers`、`compat`。

OpenAI 直连的 GPT-5.6 Sol、Terra、Luna 默认 `272000` 上下文窗口,使请求保持在 OpenAI 短上下文计费档内。要选择 OpenAI 的 1.05M 上下文窗口,为你使用的每个模型调大:

```json
{
  "providers": {
    "openai": {
      "modelOverrides": {
        "gpt-5.6-sol": {
          "contextWindow": 1050000
        }
      }
    }
  }
}
```

覆盖会保留内置定价元数据。总输入 token 超过 272K 的请求对整个请求使用 GPT-5.6 的长上下文费率。需要时对 `gpt-5.6-terra` 或 `gpt-5.6-luna` 应用同样覆盖。

行为说明:
- `modelOverrides` 作用于内置 provider 模型和匹配的扩展注册 provider 模型。
- 未知的模型 ID 被忽略。
- provider 级 `baseUrl`/`headers` 可与 `modelOverrides` 组合。
- 覆盖 `name` 只改变模型匹配和次级详情文本;页脚和主模型列表仍显示模型 `id`。
- 如果 provider 同时定义了 `models`,自定义模型在内置覆盖之后合并。`id` 相同的自定义模型会替换被覆盖的内置模型条目。

## Anthropic Messages 兼容性

对使用 `api: "anthropic-messages"` 的 provider 或代理,用 `compat` 控制 Anthropic 特有的请求兼容性。

默认情况下 pi 为每个工具发送 `eager_input_streaming: true`。如果代理或 Anthropic 兼容后端拒绝该字段,把 `supportsEagerToolInputStreaming` 设为 `false`。pi 将省略 `tools[].eager_input_streaming`,并对启用工具的请求改发旧的 `fine-grained-tool-streaming-2025-05-14` beta 头。

某些 Anthropic 模型要求自适应思考(`thinking.type: "adaptive"` 加 `output_config.effort`)而非旧的预算式思考负载。内置模型自动设置。路由到这些模型的自定义 provider 或别名,把 `forceAdaptiveThinking` 设为 `true`。

支持每轮 effort 的 Claude 模型使用 `supportsMidConvoEffort`。启用后 pi 会持久化每个响应的 provider effort、在后续请求中重建仅含 effort 的系统消息,并以 `prefix_mismatch_behavior: "drop_block"` 发送思考绑定控制,避免过期的已签名思考前缀造成持续 400。只为在忠实还原 Anthropic Messages 传输上的确切受支持 Claude 模型开启;不要对仅模仿 Messages 形状的 API 启用。

一些 Anthropic 兼容 provider 会发出签名为空的思考块并期望原样回放。只为这些 provider 把 `allowEmptySignature` 设为 `true`;真正的 Anthropic 会拒绝空思考签名。

内置 Anthropic 模型在其模型元数据中启用了 `supportsStrictTools`。自定义 Anthropic 兼容模型在其 endpoint 接受严格 JSON-schema 工具定义时必须设为 `true`。

```json
{
  "providers": {
    "anthropic-proxy": {
      "baseUrl": "https://proxy.example.com",
      "api": "anthropic-messages",
      "apiKey": "$ANTHROPIC_PROXY_KEY",
      "compat": {
        "supportsEagerToolInputStreaming": false,
        "supportsLongCacheRetention": true,
        "forceAdaptiveThinking": true,
        "allowEmptySignature": true
      },
      "models": [
        {
          "id": "claude-opus-4-7",
          "reasoning": true,
          "input": ["text", "image"]
        }
      ]
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `supportsEagerToolInputStreaming` | provider 是否接受每工具 `eager_input_streaming`。默认 `true`。设为 `false` 时省略该字段,并在启用工具的请求上使用旧的细粒度工具流式 beta 头。 |
| `supportsLongCacheRetention` | 缓存保留为 `long` 时,provider 是否接受 Anthropic 长缓存保留(`cache_control.ttl: "1h"`)。默认 `true`。 |
| `sendSessionAffinityHeaders` | 启用缓存时是否从会话 id 发送 `x-session-affinity`。默认:已知 provider 自动检测。 |
| `supportsCacheControlOnTools` | provider 是否接受工具定义上的 Anthropic 风格 `cache_control` 标记。默认 `true`。 |
| `forceAdaptiveThinking` | 是否为该模型发送自适应思考(`thinking.type: "adaptive"` 加 `output_config.effort`)。内置自适应模型自动设置。默认 `false`。 |
| `supportsMidConvoEffort` | 该 Claude 模型传输是否支持每轮 effort 系统消息和思考绑定控制。启用时 pi 持久化原生 effort 等级并始终发送 `drop_block`。默认 `false`。 |
| `allowEmptySignature` | 回放空思考签名时保留 `signature: ""` 而不是把思考转为文本。默认 `false`。 |
| `supportsStrictTools` | provider 是否接受严格 JSON-schema 工具定义。默认 `false`;内置 Anthropic 模型在生成的元数据中启用。 |

## OpenAI 兼容性

对部分兼容 OpenAI 的 provider,使用 `compat` 字段。

- provider 级 `compat` 作为该 provider 下所有模型的默认值。
- 模型级 `compat` 为该模型覆盖 provider 级值。

```json
{
  "providers": {
    "local-llm": {
      "baseUrl": "http://localhost:8080/v1",
      "api": "openai-completions",
      "compat": {
        "supportsUsageInStreaming": false,
        "maxTokensField": "max_tokens"
      },
      "models": [...]
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `supportsStore` | provider 支持 `store` 字段 |
| `supportsDeveloperRole` | 使用 `developer` 还是 `system` 角色 |
| `supportsReasoningEffort` | 支持 `reasoning_effort` 参数 |
| `supportsUsageInStreaming` | 支持 `stream_options: { include_usage: true }`(默认 `true`) |
| `supportsFinishReason` | 流式响应是否包含 `finish_reason`。为 `false` 时,pi 在流结束时推断 `stop` 或 `toolUse`。默认 `true`。 |
| `maxTokensField` | 使用 `max_completion_tokens` 或 `max_tokens` |
| `requiresToolResultName` | 工具结果消息需包含 `name` |
| `requiresAssistantAfterToolResult` | 工具结果之后、用户消息之前需插入 assistant 消息 |
| `requiresThinkingAsText` | 把思考块转为纯文本 |
| `requiresReasoningContentOnAssistantMessages` | 启用推理时,所有回放的 assistant 消息都带空 `reasoning_content` |
| `thinkingFormat` | 使用 `reasoning_effort`、`openrouter`、`deepseek`、`together`、`baseten`、`zai`、`qwen`、`chat-template` 或 `qwen-chat-template` 思考参数 |
| `chatTemplateKwargs` | `thinkingFormat: "chat-template"` 的 `chat_template_kwargs` 值;用 `{ "$var": "thinking.enabled" }`、`{ "$var": "thinking.effort" }` 或 `{ "$var": "thinking.budget" }` 引用 pi 控制的思考值 |
| `chatTemplateArgs` | `thinkingFormat: "baseten"` 的 `chat_template_args` 值;占位符用法同上 |
| `thinkingTokenBudgetField` | 用于从 `thinkingBudgets` 限制推理 token 的顶层请求字段,钳制为至少给答案留 1024 token。`"thinking_token_budget"`(vLLM)、`"thinking_budget"`(Qwen/DashScope/SGLang)、`"thinking_budget_tokens"`(llama.cpp)。默认关闭;不写入生成的目录。 |
| `supportsThinkingTokenBudget` | `thinkingTokenBudgetField: "thinking_token_budget"`(vLLM)的别名。优先用 `thinkingTokenBudgetField`。默认 `false`。 |
| `cacheControlFormat` | 在系统提示、最后一个工具定义和最后一条 user/assistant/tool-result 文本内容上使用 Anthropic 风格 `cache_control` 标记。目前仅支持 `anthropic`。 |
| `sendSessionAffinityHeaders` | 对 `openai-completions`,启用缓存时从会话 id 发送会话亲和头。默认 `false`。 |
| `sessionAffinityFormat` | 对 `openai-completions` 和 `openai-responses`,会话亲和头格式:`openai` 发送 `session_id`/`x-client-request-id`(completions 还发 `x-session-affinity`);`openai-nosession` 省略带下划线的 `session_id` 头;`openrouter` 发送 `x-session-id`。不影响 `prompt_cache_key` 请求体参数。默认自动检测。 |
| `supportsStrictMode` | provider 是否接受严格 JSON-schema 函数工具定义。默认取决于 API;内置 OpenAI 模型带显式能力元数据。 |
| `supportsOpenAIGrammarTools` | OpenAI 兼容 API 是否发出自定义 Lark/regex 文法工具。为 `false` 时,文法约束工具回退为普通函数工具。默认 `false`;内置目录为 OpenAI、OpenAI Codex、Azure OpenAI、GitHub Copilot、opencode、Cloudflare AI Gateway 上的 GPT-5+ 模型启用。 |
| `deferredToolsMode` | 使用 provider 特定的延迟工具序列化。目前仅支持 Kimi 的 OpenAI 兼容 Chat Completions 格式 `"kimi"`。 |
| `supportsLongCacheRetention` | 缓存保留为 `long` 时 provider 是否接受长缓存保留:GPT-5.6+ Responses 模型的 `prompt_cache_options.ttl: "30m"`、更早 OpenAI 模型的 `prompt_cache_retention: "24h"`,或 `cacheControlFormat` 为 `anthropic` 时的 `cache_control.ttl: "1h"`。默认 `true`。 |
| `openRouterRouting` | OpenRouter provider 路由偏好。该对象原样放入 [OpenRouter API 请求](https://openrouter.ai/docs/guides/routing/provider-selection)的 `provider` 字段。 |
| `vercelGatewayRouting` | Vercel AI Gateway 的 provider 选择路由配置(`only`、`order`) |

`openrouter` 使用 `reasoning: { effort }`。`together` 使用 `reasoning: { enabled }`,并在 `supportsReasoningEffort` 启用时同时发送 `reasoning_effort`。`qwen` 使用顶层 `enable_thinking`。需要 `chat_template_kwargs.enable_thinking` 和 `preserve_thinking` 的本地 Qwen 兼容服务器用 `qwen-chat-template`。需要可配置 `chat_template_kwargs` 的 vLLM/Hugging Face 聊天模板用 `chat-template`,例如 DeepSeek V3.x 模板配 `chatTemplateKwargs: { "thinking": { "$var": "thinking.enabled" } }`。通过 `chat_template_args` 暴露开关并可选支持顶层 `reasoning_effort` 的 provider,用 `thinkingFormat: "baseten"` 加 `chatTemplateArgs`。

`thinkingTokenBudgetField` 与 `thinkingFormat` 相互独立。不要在生成的 Qwen 目录上启用:那些模型已经发送 `reasoning_effort`,而 DashScope 会同时拒绝 `thinking_budget` 与 `reasoning_effort`。

`cacheControlFormat: "anthropic"` 用于通过文本内容和工具定义上的 `cache_control` 标记暴露 Anthropic 风格提示缓存的 OpenAI 兼容 provider。

示例:

```json
{
  "providers": {
    "openrouter": {
      "baseUrl": "https://openrouter.ai/api/v1",
      "apiKey": "$OPENROUTER_API_KEY",
      "api": "openai-completions",
      "models": [
        {
          "id": "openrouter/anthropic/claude-3.5-sonnet",
          "name": "OpenRouter Claude 3.5 Sonnet",
          "compat": {
            "openRouterRouting": {
              "allow_fallbacks": true,
              "require_parameters": false,
              "data_collection": "deny",
              "zdr": true,
              "enforce_distillable_text": false,
              "order": ["anthropic", "amazon-bedrock", "google-vertex"],
              "only": ["anthropic", "amazon-bedrock"],
              "ignore": ["gmicloud", "friendli"],
              "quantizations": ["fp16", "bf16"],
              "sort": {
                "by": "price",
                "partition": "model"
              },
              "max_price": {
                "prompt": 10,
                "completion": 20
              },
              "preferred_min_throughput": {
                "p50": 100,
                "p90": 50
              },
              "preferred_max_latency": {
                "p50": 1,
                "p90": 3,
                "p99": 5
              }
            }
          }
        }
      ]
    }
  }
}
```

Vercel AI Gateway 示例:

```json
{
  "providers": {
    "vercel-ai-gateway": {
      "baseUrl": "https://ai-gateway.vercel.sh/v1",
      "apiKey": "$AI_GATEWAY_API_KEY",
      "api": "openai-completions",
      "models": [
        {
          "id": "moonshotai/kimi-k2.5",
          "name": "Kimi K2.5 (Fireworks via Vercel)",
          "reasoning": true,
          "input": ["text", "image"],
          "cost": { "input": 0.6, "output": 3, "cacheRead": 0, "cacheWrite": 0 },
          "contextWindow": 262144,
          "maxTokens": 262144,
          "compat": {
            "vercelGatewayRouting": {
              "only": ["fireworks", "novita"],
              "order": ["fireworks", "novita"]
            }
          }
        }
      ]
    }
  }
}
```
