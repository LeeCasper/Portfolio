/**
 * 后台的简介、项目亮点支持少量行内 Markdown（加粗、行内代码）。
 * 这里只做最小实现：先转义 HTML，再还原 **加粗** 与 `代码`，避免注入。
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function renderInlineMarkdown(text: string): string {
	return escapeHtml(text)
		.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
		.replace(/`([^`]+)`/g, "<code>$1</code>");
}

/** 纯文本场景（卡片摘要）去掉标记符号 */
export function stripInlineMarkdown(text: string): string {
	return text.replace(/\*\*/g, "").replace(/`/g, "");
}
