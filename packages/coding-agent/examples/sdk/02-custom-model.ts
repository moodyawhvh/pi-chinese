/**
 * 自定义模型选择(SDK 示例 02)
 *
 * 演示如何选择特定模型与思考等级。
 */

// createAgentSession:创建一个完整的 agent 会话(模型、工具、扩展齐备)
// ModelRuntime:模型注册表运行时,负责内置目录 + models.json 自定义模型的查找与可用性判断
import { createAgentSession, ModelRuntime } from "@earendil-works/pi-coding-agent";

// 创建模型运行时(读取内置目录与用户 models.json)
const modelRuntime = await ModelRuntime.create();

// 方式一:按 provider/id 精确查找内置模型
const opus = modelRuntime.getModel("anthropic", "claude-opus-4-5");
if (opus) {
	console.log(`Found model: ${opus.provider}/${opus.id}`);
}

// 方式二:通过注册表查找模型(包含 models.json 里的自定义模型)
const customModel = modelRuntime.getModel("my-provider", "my-model");
if (customModel) {
	console.log(`Found custom model: ${customModel.provider}/${customModel.id}`);
}

// 方式三:从"可用"模型中选(即已配置有效 API key 的模型)
const available = await modelRuntime.getAvailable();
console.log(
	"Available models:",
	available.map((m) => `${m.provider}/${m.id}`),
);

// 只要有可用模型,就用第一个创建会话并发一次真实请求
if (available.length > 0) {
	const { session } = await createAgentSession({
		model: available[0],
		thinkingLevel: "medium", // off, low, medium, high
		modelRuntime,
	});

	try {
		// 订阅会话事件:仅拦截流式文本增量(text_delta),原样写到 stdout,
		// 实现"打字机"式输出;其余事件类型在此忽略
		session.subscribe((event) => {
			if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
				process.stdout.write(event.assistantMessageEvent.delta);
			}
		});

		// 发送一条 prompt 并等待完整回复
		await session.prompt("Say hello in one sentence.");
		console.log();
	} finally {
		// 无论成功与否都释放会话资源,避免句柄泄漏
		session.dispose();
	}
}
