> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# JSON 事件流模式

```bash
pi --mode json "Your prompt"
```

把所有会话事件以 JSON 行的形式输出到 stdout。适合把 pi 集成到其他工具或自定义 UI 中。

## 事件类型

线上事件使用 `JsonAgentSessionEvent`。它与
[`AgentSessionEvent`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/agent-session.ts)
一致,区别是流式消息更新省略了累计快照:

```typescript
type WithoutPartial<T> = T extends { partial: unknown } ? Omit<T, "partial"> : T;

type JsonAssistantMessageEvent<T> = T extends { type: "toolcall_start"; partial: unknown }
  ? WithoutPartial<T> & { id: string; toolName: string }
  : WithoutPartial<T>;

type JsonAgentSessionEvent =
  | Exclude<AgentSessionEvent, { type: "message_update" }>
  | {
      type: "message_update";
      usage: Usage;
      assistantMessageEvent: JsonAssistantMessageEvent<AssistantMessageEvent>;
    };
```

`queue_update` 在待处理的 steering 与 follow-up 队列每次变化时输出完整队列。`compaction_start` 和 `compaction_end` 同时覆盖手动与自动压缩。

其他基础事件来自
[`AgentEvent`](https://github.com/earendil-works/pi/blob/main/packages/agent/src/types.ts):

```typescript
type AgentEvent =
  // Agent lifecycle
  | { type: "agent_start" }
  | { type: "agent_end"; messages: AgentMessage[] }
  // Turn lifecycle
  | { type: "turn_start" }
  | { type: "turn_end"; message: AgentMessage; toolResults: ToolResultMessage[] }
  // Message lifecycle
  | { type: "message_start"; message: AgentMessage }
  | { type: "message_update"; message: AgentMessage; assistantMessageEvent: AssistantMessageEvent }
  | { type: "message_end"; message: AgentMessage }
  // Tool execution
  | { type: "tool_execution_start"; toolCallId: string; toolName: string; args: any }
  | { type: "tool_execution_update"; toolCallId: string; toolName: string; args: any; partialResult: any }
  | { type: "tool_execution_end"; toolCallId: string; toolName: string; result: any; isError: boolean };
```

## 消息类型

基础消息来自 [`packages/ai/src/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/ai/src/types.ts#L134):
- `UserMessage`(第 134 行)
- `AssistantMessage`(第 140 行)
- `ToolResultMessage`(第 152 行)

扩展消息来自 [`packages/coding-agent/src/core/messages.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/messages.ts#L29):
- `BashExecutionMessage`(第 29 行)
- `CustomMessage`(第 46 行)
- `BranchSummaryMessage`(第 55 行)
- `CompactionSummaryMessage`(第 62 行)

## 输出格式

每行是一个 JSON 对象。第一行是会话头:

```json
{"type":"session","version":3,"id":"uuid","timestamp":"...","cwd":"/path"}
```

之后按事件发生顺序输出:

```json
{"type":"agent_start"}
{"type":"turn_start"}
{"type":"message_start","message":{"role":"assistant","content":[],...}}
{"type":"message_update","usage":{...},"assistantMessageEvent":{"type":"text_delta","contentIndex":0,"delta":"Hello"}}
{"type":"message_end","message":{...}}
{"type":"turn_end","message":{...},"toolResults":[]}
{"type":"agent_end","messages":[...]}
```

`message_update` 记录只包含增量。为保持流大小线性增长,它同时省略累计的 `message` 字段和
`assistantMessageEvent.partial`。顶层的 `usage` 字段是 provider 上报的最新累计用量,
当 provider 只在完成时上报用量时,它可能一直为零。如需组装实时文本、思考或工具调用参数,
请使用 `contentIndex` 和 `delta`。`toolcall_start` 事件还附带大小恒定的 `id` 和 `toolName`
字段。`message_end` 包含最终权威消息。

## 示例

```bash
pi --mode json "List files" 2>/dev/null | jq -c 'select(.type == "message_end")'
```
