/**
 * 最小化 SDK 用法(中文注释版)
 *
 * 全部使用默认配置:自动从 cwd 和 ~/.pi/agent 发现技能、扩展、工具和上下文文件。
 * 模型按设置选择,若无设置则选第一个可用模型。
 */

import { createAgentSession } from "@earendil-works/pi-coding-agent";

// 创建一个 agent 会话;不传任何选项即走全默认发现流程
const { session } = await createAgentSession();

try {
	// 订阅会话事件流:只筛选文本增量(text_delta),
	// 把模型流式输出的每一小段文字直接写到标准输出
	session.subscribe((event) => {
		if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
			process.stdout.write(event.assistantMessageEvent.delta);
		}
	});

	// 发送一条用户提示并等待 agent 完成
	// (工具调用、多轮循环都在内部自动处理)
	await session.prompt("What files are in the current directory?");

	// 结束后遍历并打印会话中的全部消息(含工具调用记录)
	session.state.messages.forEach((msg) => {
		console.log(msg);
	});
	console.log();
} finally {
	// 无论如何都释放会话资源(关闭进程、清理订阅)
	session.dispose();
}
