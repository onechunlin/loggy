/**
 * 待办事项存储服务
 * 使用 localforage 和 IndexedDB 存储待办事项
 */

import localforage from "localforage";
import type { Todo, CreateTodoParams, UpdateTodoParams } from "@/app/types";

// 配置 localforage
const todoStore = localforage.createInstance({
  name: "loggy",
  storeName: "todos",
  description: "待办事项存储",
  driver: localforage.INDEXEDDB,
});

/**
 * 待办存储键
 */
const TODOS_KEY = "all_todos";

/**
 * 序列化待办（Date -> ISO String）
 */
function serializeTodo(todo: Todo) {
  return {
    ...todo,
    dueDate: todo.dueDate?.toISOString(),
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

/**
 * 反序列化待办（ISO String -> Date）
 */
function deserializeTodo(
  todo: Omit<Todo, "createdAt" | "updatedAt" | "dueDate"> & {
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
  }
): Todo {
  return {
    ...todo,
    dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    createdAt: new Date(todo.createdAt),
    updatedAt: new Date(todo.updatedAt),
  };
}

/**
 * 获取所有待办
 */
export async function getAllTodos(): Promise<Todo[]> {
  try {
    const stored = await todoStore.getItem<
      Array<
        Omit<Todo, "createdAt" | "updatedAt" | "dueDate"> & {
          createdAt: string;
          updatedAt: string;
          dueDate?: string;
        }
      >
    >(TODOS_KEY);

    if (!stored || !Array.isArray(stored)) {
      return [];
    }

    return stored.map(deserializeTodo);
  } catch (error) {
    console.error("加载待办失败:", error);
    return [];
  }
}

/**
 * 保存所有待办
 */
async function saveAllTodos(todos: Todo[]): Promise<void> {
  try {
    const serialized = todos.map(serializeTodo);
    await todoStore.setItem(TODOS_KEY, serialized);
  } catch (error) {
    console.error("保存待办失败:", error);
    throw error;
  }
}

/**
 * 根据 ID 获取待办
 */
export async function getTodoById(id: string): Promise<Todo | null> {
  try {
    const todos = await getAllTodos();
    return todos.find((todo) => todo.id === id) || null;
  } catch (error) {
    console.error("获取待办失败:", error);
    return null;
  }
}

/**
 * 创建待办
 */
export async function createTodo(params: CreateTodoParams): Promise<Todo> {
  try {
    const now = new Date();
    const newTodo: Todo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: params.title,
      description: params.description,
      completed: false,
      dueDate: params.dueDate,
      tags: params.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    const todos = await getAllTodos();
    todos.unshift(newTodo); // 新待办放在最前面
    await saveAllTodos(todos);

    return newTodo;
  } catch (error) {
    console.error("创建待办失败:", error);
    throw error;
  }
}

/**
 * 更新待办
 */
export async function updateTodo(
  id: string,
  params: UpdateTodoParams
): Promise<Todo | null> {
  try {
    const todos = await getAllTodos();
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return null;
    }

    const updatedTodo: Todo = {
      ...todos[index],
      ...params,
      updatedAt: new Date(),
    };

    todos[index] = updatedTodo;
    await saveAllTodos(todos);

    return updatedTodo;
  } catch (error) {
    console.error("更新待办失败:", error);
    throw error;
  }
}

/**
 * 删除待办
 */
export async function deleteTodo(id: string): Promise<boolean> {
  try {
    const todos = await getAllTodos();
    const filteredTodos = todos.filter((todo) => todo.id !== id);

    if (filteredTodos.length === todos.length) {
      return false; // 没有找到要删除的待办
    }

    await saveAllTodos(filteredTodos);
    return true;
  } catch (error) {
    console.error("删除待办失败:", error);
    throw error;
  }
}

/**
 * 切换待办完成状态
 */
export async function toggleTodoComplete(id: string): Promise<Todo | null> {
  try {
    const todos = await getAllTodos();
    const todo = todos.find((t) => t.id === id);

    if (!todo) {
      return null;
    }

    return await updateTodo(id, { completed: !todo.completed });
  } catch (error) {
    console.error("切换完成状态失败:", error);
    throw error;
  }
}

/**
 * 获取未完成的待办
 */
export async function getPendingTodos(): Promise<Todo[]> {
  try {
    const todos = await getAllTodos();
    return todos.filter((todo) => !todo.completed);
  } catch (error) {
    console.error("获取未完成待办失败:", error);
    return [];
  }
}

/**
 * 获取已完成的待办
 */
export async function getCompletedTodos(): Promise<Todo[]> {
  try {
    const todos = await getAllTodos();
    return todos.filter((todo) => todo.completed);
  } catch (error) {
    console.error("获取已完成待办失败:", error);
    return [];
  }
}

/**
 * 获取今天到期的待办
 */
export async function getTodayTodos(): Promise<Todo[]> {
  try {
    const todos = await getAllTodos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  } catch (error) {
    console.error("获取今日待办失败:", error);
    return [];
  }
}

/**
 * 获取逾期的待办
 */
export async function getOverdueTodos(): Promise<Todo[]> {
  try {
    const todos = await getAllTodos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return todos.filter((todo) => {
      if (!todo.dueDate || todo.completed) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate < today;
    });
  } catch (error) {
    console.error("获取逾期待办失败:", error);
    return [];
  }
}

/**
 * 按标签筛选待办
 */
export async function getTodosByTags(tags: string[]): Promise<Todo[]> {
  try {
    if (tags.length === 0) {
      return await getAllTodos();
    }

    const todos = await getAllTodos();
    return todos.filter((todo) =>
      tags.some((tag) => todo.tags.includes(tag))
    );
  } catch (error) {
    console.error("按标签筛选失败:", error);
    return [];
  }
}

/**
 * 获取所有标签
 */
export async function getAllTodoTags(): Promise<string[]> {
  try {
    const todos = await getAllTodos();
    const tagsSet = new Set<string>();

    todos.forEach((todo) => {
      todo.tags.forEach((tag) => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error("获取标签失败:", error);
    return [];
  }
}

/**
 * 清空所有待办
 */
export async function clearAllTodos(): Promise<void> {
  try {
    await todoStore.removeItem(TODOS_KEY);
  } catch (error) {
    console.error("清空待办失败:", error);
    throw error;
  }
}

/**
 * 获取待办数量
 */
export async function getTodosCount(): Promise<number> {
  try {
    const todos = await getAllTodos();
    return todos.length;
  } catch (error) {
    console.error("获取待办数量失败:", error);
    return 0;
  }
}

