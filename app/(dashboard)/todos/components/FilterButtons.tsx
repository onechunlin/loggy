"use client";

import { motion } from "framer-motion";

export type FilterType = "all" | "active" | "completed" | "overdue";

interface FilterButtonsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    overdue: number;
  };
}

/**
 * 筛选按钮组件
 */
export default function FilterButtons({
  currentFilter,
  onFilterChange,
  counts,
}: FilterButtonsProps) {
  const filters: Array<{ type: FilterType; label: string; icon: string }> = [
    { type: "all", label: "全部", icon: "📋" },
    { type: "active", label: "进行中", icon: "⏳" },
    { type: "completed", label: "已完成", icon: "✅" },
    { type: "overdue", label: "逾期", icon: "⚠️" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.type;
        const count = counts[filter.type];

        return (
          <motion.button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-xs sm:text-base ${
              isActive
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-sm sm:text-base">{filter.icon}</span>
            <span>{filter.label}</span>
            {count > 0 && (
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
