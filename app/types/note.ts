/**
 * 笔记相关类型定义（简化版）
 */

/**
 * 笔记
 */
export interface Note {
  id: string;
  title: string;
  content: string; // Markdown 格式
  tags: string[];
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建笔记的参数
 */
export interface CreateNoteParams {
  title: string;
  content?: string;
  tags?: string[];
}

/**
 * 更新笔记的参数
 */
export interface UpdateNoteParams {
  title?: string;
  content?: string;
  tags?: string[];
  isStarred?: boolean;
}

/**
 * 笔记筛选参数
 */
export interface NoteFilters {
  tags?: string[];
  isStarred?: boolean;
  searchQuery?: string;
}

/**
 * 笔记统计信息
 */
export interface NoteStats {
  total: number;
  starred: number;
  thisWeek: number;
  thisMonth: number;
  totalTags: number;
}

