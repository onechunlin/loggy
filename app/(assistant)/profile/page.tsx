/**
 * 用户资料页面
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 编辑表单
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  // 修改密码表单
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 处理更新用户信息
  const handleUpdate = async () => {
    setError("");
    setMessage("");

    const result = await updateUser(editForm);
    if (result.success) {
      setMessage("更新成功");
      setIsEditing(false);
    } else {
      setError(result.message);
    }
  };

  // 处理修改密码
  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    // 验证新密码
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("新密码长度至少为6位");
      return;
    }

    const result = await changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword
    );

    if (result.success) {
      setMessage("密码修改成功");
      setIsChangingPassword(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setError(result.message);
    }
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 消息提示 */}
        {message && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 shadow-sm animate-in slide-in-from-top">
            ✓ {message}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 shadow-sm animate-in slide-in-from-top">
            ✗ {error}
          </div>
        )}

        {/* 用户头像卡片 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-6">
            {/* 头像 */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {user.nickname}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                @{user.username}
              </p>
              {user.email && (
                <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 快捷功能卡片 - 移到最上面 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚡</span>
            快捷功能
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/playground")}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="text-2xl">🎨</span>
              <div className="text-left">
                <p className="text-sm font-semibold">实验室</p>
                <p className="text-xs opacity-90">探索新功能</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <p className="text-sm font-semibold">数据统计</p>
                <p className="text-xs opacity-90">查看使用数据</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="text-2xl">⚙️</span>
              <div className="text-left">
                <p className="text-sm font-semibold">应用设置</p>
                <p className="text-xs opacity-90">个性化配置</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <p className="text-sm font-semibold">帮助反馈</p>
                <p className="text-xs opacity-90">联系我们</p>
              </div>
            </button>
          </div>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>👤</span>
              基本信息
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                ✏️ 编辑
              </button>
            )}
          </div>

          {!isEditing ? (
            // 显示模式
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  用户名
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user.username}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  昵称
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user.nickname}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  邮箱
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-1 truncate">
                  {user.email || "未设置"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  注册时间
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {new Date(user.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {user.lastLoginAt && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    最后登录
                  </label>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {new Date(user.lastLoginAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // 编辑模式
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  昵称
                </label>
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nickname: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  💾 保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      nickname: user?.nickname || "",
                      email: user?.email || "",
                      avatar: user?.avatar || "",
                    });
                    setError("");
                  }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium rounded-xl transition-all"
                >
                  ✕ 取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 修改密码卡片 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🔒</span>
              安全设置
            </h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                🔑 修改密码
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  原密码
                </label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="请输入原密码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="至少6位字符"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="请再次输入新密码"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ✓ 确认修改
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setError("");
                  }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium rounded-xl transition-all"
                >
                  ✕ 取消
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                定期修改密码可以提高账户安全性
              </p>
            </div>
          )}
        </div>

        {/* 登出按钮 */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          退出登录
        </button>
      </div>
    </div>
  );
}
