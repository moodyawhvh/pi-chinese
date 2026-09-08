/**
 * 危险操作确认扩展(Confirm Destructive Actions)
 *
 * 在破坏性会话操作(清空、切换、分支)前弹出确认。
 * 演示如何通过 before_* 系列事件取消会话事件:返回 { cancel: true } 即中止该操作。
 */

// ExtensionAPI:扩展入口拿到的 API 句柄(pi.on 注册事件、pi.sendUserMessage 等)
// SessionBeforeSwitchEvent:切换会话事件,携带 reason("new" | "resume" 等)
// SessionMessageEntry:会话中类型为 "message" 的条目
import type { ExtensionAPI, SessionBeforeSwitchEvent, SessionMessageEntry } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	// 会话切换前触发(新建 / 恢复 都算切换)
	pi.on("session_before_switch", async (event: SessionBeforeSwitchEvent, ctx) => {
		// 无 TUI(如 -p 非交互模式)时无法弹窗,直接放行
		if (!ctx.hasUI) return;

		if (event.reason === "new") {
			// 新建会话 = 丢弃当前会话:先让用户确认
			const confirmed = await ctx.ui.confirm(
				"Clear session?",
				"This will delete all messages in the current session.",
			);

			if (!confirmed) {
				ctx.ui.notify("Clear cancelled", "info");
				return { cancel: true }; // 取消本次新建,留在原会话
			}
			return;
		}

		// reason === "resume" - 检查是否有未处理的工作(最后一条助手响应之后的用户消息)
		const entries = ctx.sessionManager.getEntries();
		const hasUnsavedWork = entries.some(
			(e): e is SessionMessageEntry => e.type === "message" && e.message.role === "user",
		);

		if (hasUnsavedWork) {
			// 有未完成消息时切换会话,先确认
			const confirmed = await ctx.ui.confirm(
				"Switch session?",
				"You have messages in the current session. Switch anyway?",
			);

			if (!confirmed) {
				ctx.ui.notify("Switch cancelled", "info");
				return { cancel: true };
			}
		}
	});

	// 会话分叉(fork)前触发
	pi.on("session_before_fork", async (event, ctx) => {
		if (!ctx.hasUI) return;

		// 列出选项让用户选择;entryId 截前 8 位用于简短展示
		const choice = await ctx.ui.select(`Fork from entry ${event.entryId.slice(0, 8)}?`, [
			"Yes, create fork",
			"No, stay in current session",
		]);

		if (choice !== "Yes, create fork") {
			ctx.ui.notify("Fork cancelled", "info");
			return { cancel: true }; // 用户拒绝,中止分叉
		}
	});
}
