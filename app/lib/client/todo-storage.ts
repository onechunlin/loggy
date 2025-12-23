/**
 * 待办事项存储服务（使用 API 优先 + 离线降级策略）
 */

import localforage from "localforage";
import type { Todo, CreateTodoParams, UpdateTodoParams } from "@/app/types";
import { apiClient, isOnline } from "./api-client";

// 配置 localforage
const todoStore = localforage.createInstance({
  name: "loggy",
  storeName: "todos",
  description: "待办事项存储",
  driver: localforage.INDEXEDDB,
});

const TODOS_KEY = "all_todos";

/**
 * 序列化待办
 */
function serializeTodo(todo: Todo) {
  return {
    ...todo,
    dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate,
    createdAt: todo.createdAt instanceof Date ? todo.createdAt.toISOString() : todo.createdAt,
    updatedAt: todo.updatedAt instanceof Date ? todo.updatedAt.toISOString() : todo.updatedAt,
  };
}

/**
 * 反序列化待办
 */
function deserializeTodo(
  todo: Omit<Todo, "createdAt" | "updatedAt" | "dueDate"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
    dueDate?: string | Date;
  }
): Todo {
  return {
    ...todo,
    dueDate: todo.dueDate 
      ? (todo.dueDate instanceof Date ? todo.dueDate : new Date(todo.dueDate))
      : undefined,
    createdAt: todo.createdAt instanceof Date ? todo.createdAt : new Date(todo.createdAt),
    updatedAt: todo.updatedAt instanceof Date ? todo.updatedAt : new Date(todo.updatedAt),
  };
}

/**
 * 从本地缓存获取所有待办
 */
async function getLocalTodos(): Promise<Todo[]> {
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
    console.error("加载本地待办失败:", error);
    return [];
  }
}

/**
 * 保存待办到本地缓存
 */
async function saveLocalTodos(todos: Todo[]): Promise<void> {
  try {
    const serialized = todos.map(serializeTodo);
    await todoStore.setItem(TODOS_KEY, serialized);
  } catch (error) {
    console.error("保存本地待办失败:", error);
  }
}

/**
 * 获取所有待办
 */
export async function getAllTodos(): Promise<Todo[]> {
  try {
    if (isOnline()) {
      const todos = await apiClient.get<Todo[]>("/api/todos");
      const deserializedTodos = todos.map(deserializeTodo);
      await saveLocalTodos(deserializedTodos);
      return deserializedTodos;
    }
  } catch (error) {
    console.error("从 API 获取待办失败，使用本地缓存:", error);
  }

  return await getLocalTodos();
}

/**
 * 根据 ID 获取待办
 */
export async function getTodoById(id: string): Promise<Todo | null> {
  try {
    if (isOnline()) {
      const todo = await apiClient.get<Todo>(`/api/todos/${id}`);
      return deserializeTodo(todo);
    }
  } catch (error) {
    console.error("从 API 获取待办失败，使用本地缓存:", error);
  }

  const todos = await getLocalTodos();
  return todos.find((todo) => todo.id === id) || null;
}

/**
 * 创建待办
 */
export async function createTodo(params: CreateTodoParams): Promise<Todo> {
  try {
    if (isOnline()) {
      const todo = await apiClient.post<Todo>("/api/todos", params);
      const deserializedTodo = deserializeTodo(todo);
      
      const localTodos = await getLocalTodos();
      localTodos.unshift(deserializedTodo);
      await saveLocalTodos(localTodos);
      
      return deserializedTodo;
    }
  } catch (error) {
    console.error("创建待办 API 失败，使用本地存储:", error);
  }

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

  const todos = await getLocalTodos();
  todos.unshift(newTodo);
  await saveLocalTodos(todos);

  return newTodo;
}

/**
 * 更新待办
 */
export async function updateTodo(
  id: string,
  params: UpdateTodoParams
): Promise<Todo | null> {
  try {
    if (isOnline()) {
      const todo = await apiClient.patch<Todo>(`/api/todos/${id}`, params);
      const deserializedTodo = deserializeTodo(todo);
      
      const localTodos = await getLocalTodos();
      const index = localTodos.findIndex((t) => t.id === id);
      if (index !== -1) {
        localTodos[index] = deserializedTodo;
        await saveLocalTodos(localTodos);
      }
      
      return deserializedTodo;
    }
  } catch (error) {
    console.error("更新待办 API 失败，使用本地存储:", error);
  }

  const todos = await getLocalTodos();
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
  await saveLocalTodos(todos);

  return updatedTodo;
}

/**
 * 删除待办
 */
export async function deleteTodo(id: string): Promise<boolean> {
  try {
    if (isOnline()) {
      await apiClient.delete(`/api/todos/${id}`);
      
      const localTodos = await getLocalTodos();
      const filteredTodos = localTodos.filter((todo) => todo.id !== id);
      await saveLocalTodos(filteredTodos);
      
      return true;
    }
  } catch (error) {
    console.error("删除待办 API 失败，使用本地存储:", error);
  }

  const todos = await getLocalTodos();
  const filteredTodos = todos.filter((todo) => todo.id !== id);

  if (filteredTodos.length === todos.length) {
    return false;
  }

  await saveLocalTodos(filteredTodos);
  return true;
}

/**
 * 切换待办完成状态
 */
export async function toggleTodoComplete(id: string): Promise<Todo | null> {
  const todo = await getTodoById(id);
  if (!todo) return null;

  return await updateTodo(id, { completed: !todo.completed });
}

/**
 * 获取未完成的待办
 */
export async function getPendingTodos(): Promise<Todo[]> {
  const todos = await getAllTodos();
  return todos.filter((todo) => !todo.completed);
}

/**
 * 获取已完成的待办
 */
export async function getCompletedTodos(): Promise<Todo[]> {
  const todos = await getAllTodos();
  return todos.filter((todo) => todo.completed);
}

/**
 * 获取今天到期的待办
 */
export async function getTodayTodos(): Promise<Todo[]> {
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
}

/**
 * 获取逾期的待办
 */
export async function getOverdueTodos(): Promise<Todo[]> {
  const todos = await getAllTodos();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return todos.filter((todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    return dueDate < today;
  });
}

/**
 * 按标签筛选待办
 */
export async function getTodosByTags(tags: string[]): Promise<Todo[]> {
  if (tags.length === 0) {
    return await getAllTodos();
  }

  const todos = await getAllTodos();
  return todos.filter((todo) => tags.some((tag) => todo.tags.includes(tag)));
}

/**
 * 获取所有标签
 */
export async function getAllTodoTags(): Promise<string[]> {
  const todos = await getAllTodos();
  const tagsSet = new Set<string>();

  todos.forEach((todo) => {
    todo.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * 清空所有待办
 */
export async function clearAllTodos(): Promise<void> {
  try {
    if (isOnline()) {
      const todos = await getAllTodos();
      await Promise.all(todos.map((todo) => deleteTodo(todo.id)));
    }
  } catch (error) {
    console.error("清空待办 API 失败:", error);
  }

  await todoStore.removeItem(TODOS_KEY);
}

/**
 * 获取待办数量
 */
export async function getTodosCount(): Promise<number> {
  const todos = await getAllTodos();
  return todos.length;
}

