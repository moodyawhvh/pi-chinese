/**
 * Hello 工具 —— 最小自定义工具示例(中文注释版)
 */

// Type 来自 pi-ai,基于 TypeBox,用于声明工具参数的 JSON Schema
import { Type } from "@earendil-works/pi-ai";
// defineTool 是扩展侧定义工具的辅助函数
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

// 定义一个名为 "hello" 的自定义工具:
// - name:模型调用时使用的工具名(小写、无空格)
// - label:TUI 中展示的短标签
// - description:写给模型看的功能说明,决定模型何时选择该工具
// - parameters:用 TypeBox 描述入参;description 同样是给模型的参数说明
const helloTool = defineTool({
	name: "hello",
	label: "Hello",
	description: "A simple greeting tool",
	parameters: Type.Object({
		name: Type.String({ description: "Name to greet" }),
	}),

	// execute:工具真正执行的回调
	// _toolCallId:本次调用的唯一 ID;_signal:中止信号;_onUpdate:流式进度回调;_ctx:扩展上下文
	async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
		return {
			// content:返回给模型的内容块(此处为一段文本)
			content: [{ type: "text", text: `Hello, ${params.name}!` }],
			// details:附加的结构化数据,供扩展 UI 渲染使用,模型不可见
			details: { greeted: params.name },
		};
	},
});

// 扩展入口:pi 启动加载本模块后调用此函数,
// registerTool 把工具注册进会话,模型即可调用
export default function (pi: ExtensionAPI) {
	pi.registerTool(helloTool);
}
