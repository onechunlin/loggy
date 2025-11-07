/**
 * 待办事项相关类型定义（简化版）
 */

/**
 * 待办事项
 */
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建待办的参数
 */
export interface CreateTodoParams {
  title: string;
  description?: string;
  dueDate?: Date;
  tags?: string[];
}

/**
 * 更新待办的参数
 */
export interface UpdateTodoParams {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
  tags?: string[];
}

/**
 * 待办筛选参数
 */
export interface TodoFilters {
  completed?: boolean;
  tags?: string[];
  hasDate?: boolean;
  overdue?: boolean;
}

/**
 * 待办统计信息
 */
export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  today: number;
  thisWeek: number;
}

