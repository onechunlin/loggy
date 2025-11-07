"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TodoCard,
  TodoForm,
  EmptyState,
  FilterButtons,
  type FilterType,
} from "./components";
import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  getOverdueTodos,
} from "@/app/services/todo-storage";
import type { Todo } from "@/app/types";
import { useToast } from "@/app/hooks/use-toast";

/**
 * 待办列表页面
 */
export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const { showToast, ToastComponent } = useToast();

  // 加载待办
  useEffect(() => {
    async function loadTodos() {
      try {
        const allTodos = await getAllTodos();
        setTodos(allTodos);
      } catch (error) {
        console.error("加载待办失败:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTodos();
  }, []);

  // 筛选待办
  const filteredTodos = useMemo(() => {
    let result = todos;

    switch (currentFilter) {
      case "active":
        result = result.filter((todo) => !todo.completed);
        break;
      case "completed":
        result = result.filter((todo) => todo.completed);
        break;
      case "overdue":
        result = result.filter(
          (todo) =>
            !todo.completed &&
            todo.dueDate &&
            new Date(todo.dueDate) < new Date()
        );
        break;
    }

    return result;
  }, [todos, currentFilter]);

  // 统计数据
  const counts = useMemo(() => {
    const active = todos.filter((t) => !t.completed).length;
    const completed = todos.filter((t) => t.completed).length;
    const overdue = todos.filter(
      (t) =>
        !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    return {
      all: todos.length,
      active,
      completed,
      overdue,
    };
  }, [todos]);

  // 创建或更新待办
  const handleSubmit = async (data: {
    title: string;
    description?: string;
    dueDate?: Date;
    tags: string[];
  }) => {
    try {
      if (editingTodo) {
        // 更新
        const updated = await updateTodo(editingTodo.id, data);
        if (updated) {
          setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
          showToast("已更新", 1000);
        }
      } else {
        // 创建
        const newTodo = await createTodo(data);
        setTodos([newTodo, ...todos]);
        showToast("已添加", 1000);
      }
      setShowForm(false);
      setEditingTodo(null);
    } catch (error) {
      console.error("操作失败:", error);
      showToast("操作失败", 2000);
    }
  };

  // 切换完成状态
  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleTodoComplete(id);
      if (updated) {
        setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
      }
    } catch (error) {
      console.error("切换状态失败:", error);
    }
  };

  // 编辑待办
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  // 删除待办
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个待办吗？")) return;

    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
      showToast("已删除", 1000);
    } catch (error) {
      console.error("删除失败:", error);
      showToast("删除失败", 2000);
    }
  };

  // 取消表单
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ✅
          </motion.div>
          <p className="text-gray-400">加载中...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
      {/* Toast */}
      {ToastComponent}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* 头部 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                ✅ 待办事项
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                {counts.active} 个待完成 · {counts.completed} 个已完成
                {counts.overdue > 0 && (
                  <span className="text-red-500 ml-2">
                    · {counts.overdue} 个逾期
                  </span>
                )}
              </p>
            </div>
            {!showForm && (
              <motion.button
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">+</span>
                <span>新建待办</span>
              </motion.button>
            )}
          </div>

          {/* 筛选按钮 */}
          <FilterButtons
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={counts}
          />
        </div>

        {/* 表单 */}
        <AnimatePresence>
          {showForm && (
            <TodoForm
              editingTodo={editingTodo}
              onSubmit={handleSubmit}
              onCancel={handleCancelForm}
            />
          )}
        </AnimatePresence>

        {/* 待办列表 */}
        {filteredTodos.length === 0 ? (
          todos.length === 0 ? (
            <EmptyState onCreateTodo={() => setShowForm(true)} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-400 text-lg">
                {currentFilter === "completed" && "还没有完成的待办"}
                {currentFilter === "active" && "所有待办都已完成！🎉"}
                {currentFilter === "overdue" && "没有逾期的待办"}
              </p>
            </motion.div>
          )
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo, index) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                index={index}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

