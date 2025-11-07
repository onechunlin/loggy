/**
 * 文本处理工具函数
 */

/**
 * 截断文本
 * @param text 原文本
 * @param maxLength 最大长度
 * @param ellipsis 省略符号
 */
export function truncate(
  text: string,
  maxLength: number,
  ellipsis = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * 高亮搜索关键词
 * @param text 原文本
 * @param query 搜索关键词
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) {
    return text;
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 从 Markdown 提取纯文本
 */
export function extractPlainText(markdown: string): string {
  return markdown
    .replace(/^#+\s+/gm, "") // 移除标题标记
    .replace(/\*\*(.+?)\*\*/g, "$1") // 移除加粗
    .replace(/\*(.+?)\*/g, "$1") // 移除斜体
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // 移除链接，保留文本
    .replace(/`(.+?)`/g, "$1") // 移除行内代码
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/>\s+/g, "") // 移除引用
    .replace(/[-*+]\s+/g, "") // 移除列表标记
    .replace(/\n{2,}/g, "\n") // 合并多个换行
    .trim();
}

/**
 * 生成摘要
 * @param text 原文本
 * @param maxLength 最大长度
 */
export function generateSummary(text: string, maxLength = 150): string {
  const plainText = extractPlainText(text);
  return truncate(plainText, maxLength);
}

/**
 * 统计字数（中文按字符，英文按单词）
 */
export function countWords(text: string): number {
  // 移除标点和空白
  const cleanText = text.replace(/[\s\p{P}]/gu, "");
  
  // 统计中文字符
  const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];
  
  // 统计英文单词
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  
  return chineseChars.length + englishWords.length;
}

/**
 * 从文本中提取标签（# 开头的词）
 */
export function extractTags(text: string): string[] {
  const tagRegex = /#([^\s#]+)/g;
  const tags: string[] = [];
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    tags.push(match[1]);
  }

  return Array.from(new Set(tags)); // 去重
}

/**
 * 智能解析待办文本
 * @example "明天下午2点开会 #工作" -> { title, dueDate, tags }
 */
export function parseTodoText(text: string): {
  title: string;
  dueDate?: Date;
  tags: string[];
} {
  // 提取标签
  const tags = extractTags(text);
  
  // 移除标签，得到标题
  let title = text.replace(/#[^\s#]+/g, "").trim();
  
  // 尝试提取日期（简单实现）
  let dueDate: Date | undefined;
  
  const today = new Date();
  
  if (/明天|tomorrow/i.test(title)) {
    dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 1);
    title = title.replace(/明天|tomorrow/gi, "").trim();
  } else if (/后天/i.test(title)) {
    dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 2);
    title = title.replace(/后天/gi, "").trim();
  } else if (/今天|today/i.test(title)) {
    dueDate = new Date(today);
    title = title.replace(/今天|today/gi, "").trim();
  }
  
  // 提取时间（如：下午2点、14:00）
  const timeMatch = title.match(/(\d{1,2})[点:：](\d{0,2})/);
  if (timeMatch && dueDate) {
    const hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    dueDate.setHours(hour, minute, 0, 0);
    title = title.replace(/(\d{1,2})[点:：](\d{0,2})/, "").trim();
  }
  
  return { title, dueDate, tags };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 生成随机颜色（用于标签等）
 */
export function generateColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = hash % 360;
  return `hsl(${h}, 70%, 60%)`;
}

/**
 * 验证是否是有效的 URL
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

