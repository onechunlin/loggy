# RAG 集成文档

## 功能概述

本项目已成功集成 RAG（Retrieval-Augmented Generation）功能，可以在聊天时自动检索相关笔记，为 AI 提供上下文信息。

## 功能特性

### 1. 自动向量化
- 创建或更新笔记时，系统会自动生成 embedding 向量
- 支持阿里云灵积和智谱 AI 两种 embedding 提供商
- 向量维度：1024

### 2. 智能检索
- 用户发送消息时，系统自动将消息向量化
- 使用余弦相似度算法搜索相关笔记
- 默认返回最多 5 个相似度 >= 0.7 的笔记
- 相似度阈值和结果数可通过环境变量配置

### 3. 上下文注入
- 检索到的笔记会自动注入到 AI 对话上下文中
- AI 可以基于笔记内容回答问题

### 4. 前端展示
- 引用的笔记作为消息的一部分保存在数据库中
- 以卡片形式展示在 AI 回复内容**上方**
- 显示笔记标题、内容预览和相似度分数
- 点击卡片可跳转到笔记详情页
- 流式完成后继续展示（从数据库重新加载）
- 相似度分数用颜色区分：
  - 绿色：>= 80%
  - 蓝色：>= 60%
  - 灰色：< 60%

## 环境配置

### 必需环境变量

```bash
# RAG 功能开关（默认启用）
RAG_ENABLED=true

# RAG 相似度阈值（0-1，默认 0.7）
# 值越高，检索结果越精确，但可能找不到足够的相关笔记
# 建议范围：0.6-0.8
RAG_SIMILARITY_THRESHOLD=0.7

# RAG 最大返回结果数（默认 5）
RAG_MAX_RESULTS=5

# Embedding 提供商（dashscope 或 zhipu）
EMBEDDING_PROVIDER=dashscope

# 向量维度（默认 1024）
EMBEDDING_DIMENSIONS=1024

# 阿里云灵积 API Key（如果使用 dashscope）
DASHSCOPE_API_KEY=your_api_key

# 智谱 AI API Key（如果使用 zhipu）
ZHIPU_API_KEY=your_api_key
```

## 技术实现

### 后端

#### 1. Embedding 服务 (`app/lib/server/embedding-service.ts`)

核心功能：
- `generateEmbedding(text)` - 生成单个文本的向量
- `generateNoteEmbedding(title, content)` - 为笔记生成向量
- `cosineSimilarity(vecA, vecB)` - 计算余弦相似度
- `searchSimilarNotes(queryEmbedding, userId, limit, threshold)` - 搜索相关笔记

#### 2. 消息模型 (`app/lib/server/models/Message.ts`)

- 添加 `references` 字段存储引用的笔记
- 只有 assistant 消息才会有 references
- 引用数据随消息一起保存到数据库

#### 3. 笔记 API (`app/api/notes/route.ts` 和 `app/api/notes/[id]/route.ts`)

- 创建或更新笔记时自动触发 embedding 生成
- 使用异步方式避免阻塞主流程

#### 4. 聊天 API (`app/api/chat/route.ts`)

RAG 流程：
1. 接收用户消息
2. 生成消息的 embedding 向量
3. 搜索相关笔记（余弦相似度 >= 配置阈值，默认 0.7）
4. 将相关笔记注入到系统消息中
5. 调用 AI 模型生成回复
6. 将引用的笔记保存到 assistant 消息的 references 字段
7. 在 SSE start 事件中返回引用列表（用于实时显示）

### 前端

#### 1. 类型定义 (`app/types/chat.ts`)

```typescript
interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  references?: ReferencedNote[]; // 引用的笔记（仅 assistant 消息）
}

interface ReferencedNote {
  noteId: string;
  title: string;
  content: string;
  similarity: number;
}

interface SSEEventWithReferences extends SSEEvent {
  references?: ReferencedNote[];
}
```

#### 2. Hook (`app/hooks/use-chat-stream.ts`)

新增回调：
- `onReferences(references)` - 接收引用的笔记列表并更新消息对象

#### 3. 组件

- `ReferencedNoteCard` - 笔记引用卡片组件
- `AssistantMessage` - 从 `message.references` 读取并显示引用笔记（位于消息内容**上方**）
- `ChatContainer` - 传递消息对象到消息列表
- `ChatPage` - 在收到引用时更新最后一条 assistant 消息的 references 字段
  - `onReferences` 回调：实时更新消息的引用字段
  - `onDone` 回调：重新加载消息以同步服务器数据（包含引用）

## 使用示例

### 1. 创建笔记

```typescript
// POST /api/notes
{
  "title": "React Hooks 最佳实践",
  "content": "useState 和 useEffect 是最常用的 Hooks..."
}

// 系统会自动生成 embedding 并保存
```

### 2. 聊天查询

```typescript
// 用户发送消息："React Hooks 有哪些最佳实践？"

// 系统自动：
// 1. 生成消息的 embedding
// 2. 搜索相关笔记（找到 "React Hooks 最佳实践" 笔记）
// 3. 注入上下文
// 4. AI 基于笔记内容回答

// 前端显示：
// - AI 回复内容上方显示引用的笔记卡片
// - 卡片显示相似度分数（如 85%）
// - 点击卡片跳转到笔记详情
// - 引用数据保存在消息对象中，持久化到数据库
// - 流式完成后继续展示（从数据库加载）
```

## 性能优化

1. **异步向量化**：笔记保存后异步生成 embedding，不阻塞主流程
2. **选择性查询**：默认查询时不返回 embedding 字段，节省带宽
3. **相似度阈值**：只返回相似度 >= 配置阈值（默认 0.7）的笔记，减少噪音
4. **结果限制**：最多返回配置数量（默认 5 个）的相关笔记，避免上下文过长
5. **上下文窗口限制**：前端只发送最近 20 条消息（约 10 轮对话）给 AI，避免 token 消耗过大
6. **可配置性**：通过环境变量灵活调整阈值和结果数

## 注意事项

1. **首次使用**：需要为现有笔记生成 embedding，可以通过 API 批量处理
2. **API 配额**：注意 embedding API 的调用次数限制
3. **向量维度**：更改向量维度需要重新生成所有笔记的 embedding
4. **相似度阈值**：可通过 `RAG_SIMILARITY_THRESHOLD` 环境变量调整（默认 0.7）
   - 范围：0-1
   - 推荐值：0.6-0.8
   - 值越高越精确，但可能检索到的笔记越少

## 未来改进

- [ ] 支持批量向量化现有笔记
- [ ] 添加向量数据库（如 Pinecone、Weaviate）提升检索性能
- [ ] 支持混合检索（向量 + 关键词）
- [ ] 添加笔记分块，支持长文本检索
- [ ] 支持用户自定义相似度阈值
- [ ] 添加检索结果缓存

