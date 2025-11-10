# 指令中心架构说明

## 📖 概述

指令中心（CommandCenter）是一个统一的指令管理和分发系统，用于处理 AI 工具调用。它将工具定义和执行逻辑统一管理，降低组件间耦合度。

## 📁 目录结构

```
app/
├── lib/
│   ├── client/
│   │   └── ai-agent.ts          # AI Agent 服务（客户端）
│   └── server/
│       └── openai-service.ts    # DeepSeek API 服务（服务端）
├── events/                      # 事件中心目录
│   ├── formEvent.ts            # 表单事件
│   ├── fontStyleEvent.ts       # 字体样式事件
│   └── navigatePageEvent.ts    # 页面导航事件
├── utils/
│   └── commandCenter/
│       ├── CommandCenter.ts    # 指令中心核心
│       ├── types.ts            # 类型定义
│       ├── commands/           # 指令处理器
│       │   ├── NavigateCommand.ts   # 页面导航（包含 PAGE_ROUTES）
│       │   ├── FontStyleCommand.ts  # 字体样式
│       │   ├── FormCommand.ts       # 表单
│       │   └── index.ts             # 导出
│       └── index.ts            # 统一导出
└── components/
    ├── features/
    │   └── ai-assistant/       # 注册并使用指令
    └── layout/
        └── MainLayout/         # 监听导航事件
```

## 🏗️ 架构设计

### 核心组件

```
┌─────────────────────────────────────────────────────────────┐
│                    AIAssistant (组件)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. 组件初始化时注册指令到 CommandCenter                  │ │
│  │ 2. 识别到工具调用时，通过 CommandCenter 分发执行         │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      CommandCenter                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • register(handler)      - 注册指令                    │ │
│  │ • getTools()             - 获取工具定义                │ │
│  │ • executeToolCall(call)  - 执行工具调用                │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬──────────────┐
         ▼           ▼           ▼              ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐  ┌─────────┐
    │Navigate │ │FontStyle│ │  Form   │  │  ...    │
    │ Command │ │ Command │ │ Command │  │ Command │
    └─────────┘ └─────────┘ └─────────┘  └─────────┘
         │           │           │              │
         └───────────┴───────────┴──────────────┘
                     │
                     ▼
         ┌─────────────────────────┐
         │    EventCenter 层        │
         │ (NavigatePageEventCenter)│
         │ (FontStyleEventCenter)   │
         │ (FormEventCenter)        │
         └─────────────────────────┘
```

## 💡 核心概念

### 1. CommandHandler（指令处理器）

每个指令处理器包含两部分：
- **工具定义（tool）**: AI 需要的工具描述（Tool 格式）
- **执行函数（execute）**: 实际执行逻辑

```typescript
interface CommandHandler {
  tool: Tool              // 工具定义
  execute: (args: Record<string, any>) => any  // 执行函数
}
```

### 2. CommandCenter（指令中心）

统一管理所有指令：
- 注册/注销指令
- 提供工具定义给 AI
- 分发执行工具调用

## 📝 使用方法

### 步骤1: 创建指令处理器

```typescript
// app/utils/commandCenter/commands/MyCommand.ts
import { CommandHandler } from '../CommandCenter'
import { NavigatePageEventCenter, NavigatePageEventName } from '@/app/events/navigatePageEvent'

export class MyCommand implements CommandHandler {
  // 工具定义
  tool = {
    type: 'function' as const,
    function: {
      name: 'my_command',
      description: '我的指令描述',
      parameters: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: '参数1描述'
          }
        },
        required: ['param1']
      }
    }
  }

  // 执行函数
  execute(args: Record<string, any>): void {
    const { param1 } = args as { param1: string }
    console.log('执行我的指令:', param1)
    // 执行具体逻辑...
  }
}
```

### 步骤2: 在组件中注册指令

```typescript
// app/components/features/ai-assistant/AIAssistant.tsx
import { useEffect } from 'react'
import { CommandCenter } from '@/app/utils/commandCenter'
import { MyCommand } from '@/app/utils/commandCenter/commands'

export default function AIAssistant() {
  useEffect(() => {
    // 组件初始化时注册
    CommandCenter.register(new MyCommand())
    
    // 或批量注册
    CommandCenter.registerBatch([
      new NavigateCommand(),
      new MyCommand(),
      // ...
    ])

    // 组件卸载时清理（可选）
    return () => {
      CommandCenter.clear()
    }
  }, [])
}
```

### 步骤3: AI 调用时自动分发

```typescript
// AI 识别到工具调用时
const tools = CommandCenter.getTools()  // 获取所有工具定义

// AI 返回工具调用后
const result = await CommandCenter.executeToolCall(toolCall)
```

## 📌 详细示例

### 示例1：添加一个简单的指令

假设我们要添加一个"显示提示"的指令，当 AI 识别到用户想看提示时，显示一个提示框。

#### 步骤1：创建指令处理器

```typescript
// app/utils/commandCenter/commands/ShowTipCommand.ts
import { CommandHandler } from '../CommandCenter'

/**
 * 显示提示指令处理器
 */
export class ShowTipCommand implements CommandHandler {
  // 工具定义：告诉 AI 这个工具是干什么的
  tool = {
    type: 'function' as const,
    function: {
      name: 'show_tip',
      description: '显示提示信息工具。当用户说"给我看个提示"、"显示提示"、"提醒我一下"等时使用。',
      parameters: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '要显示的提示信息内容'
          },
          duration: {
            type: 'number',
            description: '提示显示时长（毫秒），默认2000ms'
          }
        },
        required: ['message']
      }
    }
  }

  // 执行函数：真正执行的逻辑
  execute(args: Record<string, any>): void {
    const { message, duration = 2000 } = args as { message: string; duration?: number }
    // 使用 toast 或其他提示组件显示
    console.log('显示提示:', message, duration)
  }
}
```

#### 步骤2：导出指令

在 `app/utils/commandCenter/commands/index.ts` 中添加：

```typescript
export { ShowTipCommand } from './ShowTipCommand'
```

#### 步骤3：注册指令

在 `app/components/features/ai-assistant/AIAssistant.tsx` 的 `useEffect` 中添加：

```typescript
import { ShowTipCommand } from '@/app/utils/commandCenter/commands'

useEffect(() => {
  CommandCenter.registerBatch([
    // ... 其他指令
    new ShowTipCommand(),  // 👈 添加这行
  ])
}, [])
```

#### 完成！

现在用户对 AI 说"给我看个提示：记得喝水"，AI 就会调用这个指令，显示提示框。

---

### 示例2：带事件中心的指令

假设我们要添加一个"切换主题"的指令，需要先创建事件中心，然后创建指令。

#### 步骤1：创建事件中心

```typescript
// app/events/themeEvent.ts
export interface ThemeEventConfig {
  theme: 'light' | 'dark'
}

class ThemeEvent {
  private eventMap: Map<string, Function[]> = new Map()

  on(eventName: string, callback: Function) {
    const callbacks = this.eventMap.get(eventName) || []
    callbacks.push(callback)
    this.eventMap.set(eventName, callbacks)
  }

  off(eventName: string) {
    this.eventMap.delete(eventName)
  }

  emit(eventName: string, config: ThemeEventConfig) {
    const callbacks = this.eventMap.get(eventName) || []
    callbacks.forEach(callback => callback(config))
  }
}

export const ThemeEventCenter = new ThemeEvent()
```

#### 步骤2：创建指令处理器

```typescript
// app/utils/commandCenter/commands/ThemeCommand.ts
import { CommandHandler } from '../CommandCenter'
import { ThemeEventCenter } from '@/app/events/themeEvent'

export class ThemeCommand implements CommandHandler {
  tool = {
    type: 'function' as const,
    function: {
      name: 'switch_theme',
      description: '切换主题工具。用户说"切换主题"、"换成深色模式"、"改成浅色主题"时使用。',
      parameters: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            description: '主题类型',
            enum: ['light', 'dark']
          }
        },
        required: ['theme']
      }
    }
  }

  execute(args: Record<string, any>): void {
    const { theme } = args as { theme: 'light' | 'dark' }
    ThemeEventCenter.emit('changeTheme', { theme })
  }
}
```

#### 步骤3：在页面组件中监听事件

```typescript
// app/components/layout/MainLayout.tsx
import { useEffect } from 'react'
import { ThemeEventCenter } from '@/app/events/themeEvent'

export default function MainLayout() {
  useEffect(() => {
    // 监听主题切换事件
    const handleThemeChange = (config: { theme: 'light' | 'dark' }) => {
      console.log('切换主题到:', config.theme)
      // 执行主题切换逻辑...
    }

    ThemeEventCenter.on('changeTheme', handleThemeChange)

    return () => {
      ThemeEventCenter.off('changeTheme')
    }
  }, [])
}
```

#### 步骤4：注册指令

```typescript
import { ThemeCommand } from '@/app/utils/commandCenter/commands'

useEffect(() => {
  CommandCenter.register(new ThemeCommand())
}, [])
```

---

### 示例3：异步指令

假设我们要添加一个"查询天气"的指令，需要调用 API。

```typescript
// app/utils/commandCenter/commands/WeatherCommand.ts
import { CommandHandler } from '../CommandCenter'

export class WeatherCommand implements CommandHandler {
  tool = {
    type: 'function' as const,
    function: {
      name: 'query_weather',
      description: '查询天气工具。用户说"查询天气"、"今天天气怎么样"时使用。',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称'
          }
        },
        required: ['city']
      }
    }
  }

  // 异步执行函数
  async execute(args: Record<string, any>): Promise<{ temperature: number; weather: string }> {
    const { city } = args as { city: string }
    // 调用天气 API
    const response = await fetch(`https://api.weather.com/query?city=${city}`)
    const data = await response.json()
    
    console.log(`${city}的天气：${data.weather}，温度：${data.temperature}°C`)
    
    // 返回结果
    return {
      temperature: data.temperature,
      weather: data.weather
    }
  }
}
```

注册后，CommandCenter 会自动处理异步执行：

```typescript
const result = await CommandCenter.executeToolCall(toolCall)
console.log(result.data) // { temperature: 25, weather: '晴天' }
```

---

## 🎯 现有指令

### 1. 页面导航指令

- **NavigateCommand**: 页面跳转
  - 工具名: `navigate_to_page`
  - 参数: `{ page_path: string }`
  - 支持的路由: `/`, `/notes`, `/todos`, `/chat`, `/playground`

### 2. 字体样式指令

- **ChangeFontSizeCommand**: 调整字体大小
  - 工具名: `change_font_size`
  - 参数: `{ size?: number, scale?: number, content: string }`

- **ChangeFontColorCommand**: 调整字体颜色
  - 工具名: `change_font_color`
  - 参数: `{ color: string, content: string }`

### 3. 表单指令

- **FormCommand**: 修改表单内容（动态生成）
  - 工具名: `change_form_values-{formId}`
  - 参数: 根据表单项动态生成

## ✅ 优势

### 改进前（原架构）
```typescript
// AIAssistant 组件中的 handleToolCall 方法
if (toolName === 'navigate_to_page') {
  NavigatePageEventCenter.emit(...)
} else if (toolName === 'adjust_price') {
  NavigatePageEventCenter.emit(...)
} else if (toolName === 'change_font_size') {
  FontStyleEventCenter.emit(...)
} else if (toolName === 'change_font_color') {
  FontStyleEventCenter.emit(...)
} else if (toolName.startsWith('change_form_values')) {
  FormEventCenter.emit(...)
}
```

**问题**:
- ❌ 大量 if-else 判断
- ❌ 工具定义和执行逻辑分离
- ❌ AIAssistant 与所有 EventCenter 强耦合
- ❌ 新增指令需要修改 AIAssistant 代码

### 改进后（指令中心架构）
```typescript
// AIAssistant 组件中
const result = await CommandCenter.executeToolCall(toolCall)
```

**优势**:
- ✅ 无需 if-else 判断
- ✅ 工具定义和执行逻辑在同一处
- ✅ 组件解耦，AIAssistant 只依赖 CommandCenter
- ✅ 新增指令只需注册到 CommandCenter
- ✅ 易于测试和维护

## 🔧 扩展指令

### 添加新指令的步骤

1. **创建指令处理器文件**
```typescript
// app/utils/commandCenter/commands/NewCommand.ts
import { CommandHandler } from '../CommandCenter'

export class NewCommand implements CommandHandler {
  tool = {
    type: 'function' as const,
    function: {
      name: 'new_command',
      description: '新指令描述',
      parameters: { /* ... */ }
    }
  }

  execute(args: Record<string, any>): void {
    // 执行逻辑
  }
}
```

2. **在 commands/index.ts 中导出**
```typescript
export { NewCommand } from './NewCommand'
```

3. **在组件中注册**
```typescript
import { NewCommand } from '@/app/utils/commandCenter/commands'

useEffect(() => {
  CommandCenter.register(new NewCommand())
}, [])
```

完成！无需修改其他任何代码。

## 📚 API 文档

### CommandCenter

#### `register(handler: CommandHandler): void`
注册单个指令处理器

#### `registerBatch(handlers: CommandHandler[]): void`
批量注册指令处理器

#### `unregister(toolName: string): void`
注销指令处理器

#### `getTools(): Tool[]`
获取所有已注册的工具定义（供 AI 使用）

#### `executeToolCall(toolCall: ToolCall): Promise<CommandResult>`
执行单个工具调用

#### `executeToolCalls(toolCalls: ToolCall[]): Promise<CommandResult[]>`
批量执行工具调用

#### `hasCommand(toolName: string): boolean`
检查指令是否已注册

#### `getCommandNames(): string[]`
获取所有已注册的指令名称

#### `clear(): void`
清空所有指令处理器

#### `size: number`
获取已注册指令数量

### CommandResult

```typescript
interface CommandResult {
  success: boolean  // 执行是否成功
  toolName: string  // 工具名称
  data?: any        // 执行结果数据
  error?: string    // 错误信息（如果失败）
}
```

## 🎨 最佳实践

### ✅ 推荐做法

1. **工具描述要清晰**
```typescript
// 👍 好的描述
description: '页面导航工具，支持跳转到笔记列表、待办列表等页面。用户说"查看笔记"、"打开待办"时使用。'

// 👎 不好的描述
description: '导航'
```

2. **参数类型要完整**
```typescript
// 👍 完整的参数定义
properties: {
  color: {
    type: 'string',
    description: '颜色值，必须是十六进制格式，如 #FF0000',
    pattern: '^#[0-9A-Fa-f]{6}$'
  }
}

// 👎 简单的参数定义
properties: {
  color: { type: 'string' }
}
```

3. **错误处理**
```typescript
// 👍 有错误处理
execute(args: Record<string, any>): void {
  try {
    // 执行逻辑
  } catch (error) {
    console.error('执行失败:', error)
    throw error  // CommandCenter 会捕获并记录
  }
}
```

4. **职责单一**
```typescript
// 👍 职责单一
class NavigateCommand {
  execute(args: Record<string, any>): void {
    // 只负责导航
    NavigatePageEventCenter.emit(...)
  }
}
```

5. **组件初始化时注册指令**
   - 在 `useEffect` 中注册所需的指令
   - 在清理函数中清理（如果需要）

6. **指令处理器职责单一**
   - 每个指令处理器只负责一个功能
   - 保持 execute 方法简洁

7. **异步支持**
   - execute 方法支持返回 Promise
   - CommandCenter 会等待异步操作完成

8. **工具描述优化**
   - 为 AI 提供清晰、简洁的工具描述
   - 包含使用场景和参数说明

### ❌ 避免的做法

1. **不要在指令中直接操作组件状态**
```typescript
// ❌ 错误
execute() {
  setState({ ... })  // 指令不应该知道组件
}

// ✅ 正确
execute() {
  ThemeEventCenter.emit('change', { ... })  // 通过事件通知
}
```

2. **不要在指令中硬编码**
```typescript
// ❌ 错误
execute() {
  router.push('/hardcoded/path')
}

// ✅ 正确
execute(args: Record<string, any>) {
  const { path } = args as { path: string }
  router.push(path)
}
```

3. **不要忘记类型定义**
```typescript
// ❌ 错误
execute(args: any) { ... }

// ✅ 正确
execute(args: Record<string, any>) {
  const { name, age } = args as { name: string; age: number }
  // ...
}
```

## 🔍 示例：完整流程

```typescript
// 1. 创建指令处理器
class GreetCommand implements CommandHandler {
  tool = {
    type: 'function',
    function: {
      name: 'greet_user',
      description: '向用户打招呼',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '用户名' }
        },
        required: ['name']
      }
    }
  }

  execute(args: Record<string, any>): void {
    const { name } = args as { name: string }
    console.log(`你好，${name}！`)
  }
}

// 2. 注册指令
CommandCenter.register(new GreetCommand())

// 3. AI 获取工具定义
const tools = CommandCenter.getTools()
// [{ type: 'function', function: { name: 'greet_user', ... } }]

// 4. AI 返回工具调用
const toolCall = {
  type: 'function',
  function: {
    name: 'greet_user',
    arguments: '{"name":"张三"}'
  }
}

// 5. 执行工具调用
const result = await CommandCenter.executeToolCall(toolCall)
// 控制台输出: "你好，张三！"
// result = { success: true, toolName: 'greet_user', data: undefined }
```

## 📄 相关文件

### 核心文件
- `app/utils/commandCenter/CommandCenter.ts` - 指令中心核心实现
- `app/utils/commandCenter/types.ts` - 类型定义
- `app/utils/commandCenter/commands/NavigateCommand.ts` - 页面导航指令
- `app/utils/commandCenter/commands/FontStyleCommand.ts` - 字体样式指令
- `app/utils/commandCenter/commands/FormCommand.ts` - 表单指令
- `app/utils/commandCenter/commands/index.ts` - 指令导出入口

### 服务层
- `app/lib/client/ai-agent.ts` - AI Agent 服务（客户端）
- `app/lib/server/openai-service.ts` - DeepSeek API 服务（服务端）

### 事件层
- `app/events/formEvent.ts` - 表单事件中心
- `app/events/fontStyleEvent.ts` - 字体样式事件中心
- `app/events/navigatePageEvent.ts` - 页面导航事件中心

## 🤝 贡献指南

添加新指令时，请确保：
1. 实现 `CommandHandler` 接口
2. 提供清晰的工具描述
3. 参数类型定义完整
4. execute 方法有适当的错误处理
5. 更新本 README 文档

