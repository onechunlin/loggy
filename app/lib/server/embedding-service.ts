/**
 * Embedding 服务层
 * 支持多种 embedding 提供商：阿里云灵积、智谱 AI
 */

// Embedding 提供商类型
type EmbeddingProvider = "dashscope" | "zhipu";

// 获取配置
const EMBEDDING_PROVIDER =
  (process.env.EMBEDDING_PROVIDER as EmbeddingProvider) || "dashscope";
const VECTOR_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1024"); // 阿里云和智谱默认 1024 维

/**
 * 阿里云灵积 Embedding API
 */
async function generateEmbeddingWithDashScope(text: string): Promise<number[]> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY 环境变量未设置");
  }

  const response = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-v3",
        input: {
          texts: [text],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`阿里云灵积 API 调用失败: ${error}`);
  }

  const data = await response.json();
  return data.output.embeddings[0].embedding;
}

/**
 * 智谱 AI Embedding API
 */
async function generateEmbeddingWithZhipu(text: string): Promise<number[]> {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    throw new Error("ZHIPU_API_KEY 环境变量未设置");
  }

  const response = await fetch(
    "https://open.bigmodel.cn/api/paas/v4/embeddings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "embedding-3",
        input: text,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`智谱 AI API 调用失败: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * 预处理文本
 * 组合标题和内容，生成用于 embedding 的文本
 */
function preprocessText(title: string, content: string): string {
  // 清理和组合文本
  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  // 组合格式：标题 + 内容
  const combined = [cleanTitle, cleanContent]
    .filter((part) => part.length > 0)
    .join("\n\n");

  // 限制最大长度（避免超过 API 限制）
  const maxLength = 5000; // 字符数限制
  return combined.length > maxLength
    ? combined.substring(0, maxLength)
    : combined;
}

/**
 * 生成单个文本的 embedding
 * @param text 要向量化的文本
 * @returns 向量数组
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("文本不能为空");
  }

  try {
    let embedding: number[];

    // 根据配置选择不同的提供商
    switch (EMBEDDING_PROVIDER) {
      case "dashscope":
        console.log("[Embedding] 使用阿里云灵积生成向量");
        embedding = await generateEmbeddingWithDashScope(text);
        break;

      case "zhipu":
        console.log("[Embedding] 使用智谱 AI 生成向量");
        embedding = await generateEmbeddingWithZhipu(text);
        break;

      default:
        throw new Error(`未知的 embedding 提供商: ${EMBEDDING_PROVIDER}`);
    }

    // 验证向量维度
    if (embedding.length !== VECTOR_DIMENSIONS) {
      console.warn(
        `[Embedding] 向量维度: ${embedding.length} (配置: ${VECTOR_DIMENSIONS})`
      );
    }

    return embedding;
  } catch (error) {
    console.error("[Embedding] 生成 embedding 失败:", error);
    throw error;
  }
}

/**
 * 为笔记生成 embedding
 * @param title 笔记标题
 * @param content 笔记内容
 * @returns 向量数组
 */
export async function generateNoteEmbedding(
  title: string,
  content: string
): Promise<number[]> {
  const text = preprocessText(title, content);

  if (text.length === 0) {
    throw new Error("笔记内容为空，无法生成 embedding");
  }

  return generateEmbedding(text);
}

/**
 * 批量生成 embeddings
 * @param texts 文本数组
 * @returns 向量数组
 */
export async function batchGenerateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    try {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    } catch (error) {
      console.error(
        `[Embedding] 批量处理失败，跳过文本:`,
        text.substring(0, 50)
      );
      // 使用零向量作为占位符
      embeddings.push(new Array(VECTOR_DIMENSIONS).fill(0));
    }
  }

  return embeddings;
}

/**
 * 检查 embedding 服务是否可用
 */
export async function checkEmbeddingService(): Promise<boolean> {
  try {
    await generateEmbedding("测试");
    return true;
  } catch (error) {
    console.error("[Embedding] 服务不可用:", error);
    return false;
  }
}

/**
 * 获取模型信息
 */
export function getModelInfo() {
  const modelNames = {
    dashscope: "text-embedding-v3",
    zhipu: "embedding-3",
  };

  return {
    provider: EMBEDDING_PROVIDER,
    modelName: modelNames[EMBEDDING_PROVIDER],
    dimensions: VECTOR_DIMENSIONS,
  };
}

/**
 * 计算两个向量的余弦相似度
 * @param vecA 向量 A
 * @param vecB 向量 B
 * @returns 相似度分数 (0-1)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("向量维度不匹配");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * 搜索相关笔记（基于向量相似度）
 * @param queryEmbedding 查询向量
 * @param userId 用户 ID
 * @param limit 返回结果数量限制（默认 5）
 * @param threshold 相似度阈值 (0-1)，默认 0.7
 * @returns 相关笔记列表，包含相似度分数
 */
export async function searchSimilarNotes(
  queryEmbedding: number[],
  userId: string,
  limit = 5,
  threshold = 0.7
): Promise<
  Array<{
    noteId: string;
    title: string;
    content: string;
    similarity: number;
  }>
> {
  try {
    // 动态导入 Note 模型
    const { Note } = await import("./models");
    const mongoose = await import("mongoose");

    // 查询所有有 embedding 的笔记（只获取必要字段）
    const notes = await Note.find({
      userId: new mongoose.Types.ObjectId(userId),
      embedding: { $exists: true, $ne: null },
    })
      .select("_id title content embedding")
      .lean();

    if (notes.length === 0) {
      console.log("[RAG] 没有找到包含 embedding 的笔记");
      return [];
    }

    console.log(`[RAG] 找到 ${notes.length} 个包含 embedding 的笔记`);

    // 计算相似度并排序
    const allResults = notes.map((note) => {
      const similarity = cosineSimilarity(
        queryEmbedding,
        note.embedding as number[]
      );
      return {
        noteId: note._id.toString(),
        title: note.title,
        content: note.content || "",
        similarity,
      };
    });

    // 打印所有笔记的相似度（按相似度排序）
    const sortedResults = [...allResults].sort(
      (a, b) => b.similarity - a.similarity
    );
    console.log("[RAG] 所有笔记相似度排序:");
    sortedResults.forEach((result, index) => {
      console.log(
        `  ${index + 1}. [${result.similarity.toFixed(
          4
        )}] ${result.title.substring(0, 30)}${
          result.title.length > 30 ? "..." : ""
        }`
      );
    });

    // 过滤和限制结果
    const results = allResults
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    console.log(
      `[RAG] 阈值 ${threshold}，找到 ${results.length} 个相似度 >= ${threshold} 的笔记`
    );
    if (results.length > 0) {
      console.log("[RAG] 返回的笔记:");
      results.forEach((result, index) => {
        console.log(
          `  ${index + 1}. [${result.similarity.toFixed(4)}] ${result.title}`
        );
      });
    }

    return results;
  } catch (error) {
    console.error("[RAG] 搜索相关笔记失败:", error);
    return [];
  }
}
