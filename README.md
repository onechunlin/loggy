# Loggy

一个基于 Next.js 15 的 PWA 智能助手应用，支持离线使用和安装。

## 🚀 技术栈

- **框架**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: ^5
- **样式**: Tailwind CSS 4
- **PWA**: Serwist 9.2.1 (Service Worker)
- **动画**: Typed.js 2.1.0
- **包管理**: pnpm

## 📦 开始使用

首先，安装依赖：

```bash
pnpm install
```

然后，运行开发服务器：

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `app/page.tsx` 来编辑页面，文件保存后页面会自动更新。

## 📁 项目目录结构

本项目采用 Next.js 15 App Router 架构，遵循最佳实践组织代码。

```
app/
├── components/              # 组件目录
│   ├── ui/                 # 基础 UI 组件
│   │   ├── MessageInput.tsx
│   │   └── index.ts
│   ├── features/          # 功能组件
│   │   ├── WelcomeBanner.tsx
│   │   └── index.ts
│   ├── InstallPrompt/      # PWA 安装提示（待实现）
│   ├── PushNotificationManager/  # 推送通知管理（待实现）
│   └── index.ts           # 组件统一导出
│
├── hooks/                  # 自定义 React Hooks
│   └── use-typed.ts       # Typed.js 打字效果 Hook
│
├── lib/                    # 工具库和配置
│   ├── constants.ts        # 应用常量
│   └── utils.ts           # 工具函数
│
├── types/                  # TypeScript 类型定义
│   └── index.ts
│
├── services/               # 业务服务层（待实现）
│
├── layout.tsx              # 根布局
├── page.tsx                # 首页
├── manifest.ts             # PWA Manifest
├── sw.ts                   # Service Worker
└── globals.css             # 全局样式
```

## 📦 组件组织

### UI 组件 (`components/ui/`)
基础的可复用 UI 组件，如按钮、输入框等。

### 功能组件 (`components/features/`)
包含业务逻辑的功能组件，如欢迎横幅、消息列表等。

## 🔧 工具函数 (`lib/`)

- `constants.ts`: 应用常量配置
- `utils.ts`: 通用工具函数（如 `cn()` 用于合并 Tailwind 类名）

## 🎣 Hooks (`hooks/`)

自定义 React Hooks，封装可复用的逻辑。

## 📝 类型定义 (`types/`)

集中管理 TypeScript 类型定义，便于类型复用和维护。

## 🚀 使用示例

### 导入组件
```tsx
import { MessageInput, WelcomeBanner } from "@/app/components";
```

### 导入工具函数
```tsx
import { cn } from "@/app/lib/utils";
import { APP_NAME } from "@/app/lib/constants";
```

### 使用自定义 Hook
```tsx
import { useTyped } from "@/app/hooks/use-typed";
```

## 📋 最佳实践

1. **组件命名**: 使用 PascalCase（如 `MessageInput.tsx`）
2. **文件命名**: 页面用 `page.tsx`，布局用 `layout.tsx`
3. **代码组织**: 按功能而非类型组织（features > components）
4. **类型定义**: 集中管理在 `types/` 目录
5. **工具函数**: 放在 `lib/utils.ts`，使用 `@/lib/utils` 导入
6. **常量配置**: 统一放在 `lib/constants.ts`

## 🛠️ 可用脚本

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 构建生产版本
pnpm start    # 启动生产服务器
pnpm lint     # 运行 ESLint 代码检查
```

## 📚 文档

### 项目文档

- [指令中心架构说明](./docs/command-center.md) - 了解指令中心的设计和使用方法
- [服务层架构说明](./app/lib/README.md) - 了解服务端和客户端服务的组织方式

### Next.js 文档

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API
- [学习 Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

你可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js) - 欢迎反馈和贡献！

## 🚢 部署

部署 Next.js 应用最简单的方法是使用 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)，这是 Next.js 的创建者提供的平台。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多详情。
