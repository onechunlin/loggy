/**
 * Embedding 辅助函数
 * 统一处理笔记的向量化逻辑
 */

import { Note } from "./models";
import type { INote } from "./models/Note";

/**
 * 触发笔记的 embedding 生成
 * @param noteId 笔记 ID
 * @param title 笔记标题
 * @param content 笔记内容
 */
export async function triggerNoteEmbedding(
  noteId: string,
  title: string,
  content: string
): Promise<void> {
  const ragEnabled = process.env.RAG_ENABLED !== "false";
  if (!ragEnabled) {
    return;
  }

  // 使用动态导入避免在模块加载时触发依赖初始化
  import("./embedding-service")
    .then(({ generateNoteEmbedding, getModelInfo }) => {
      return generateNoteEmbedding(title, content).then(async (embedding) => {
        const modelInfo = getModelInfo();
        await Note.findByIdAndUpdate(noteId, {
          embedding,
          embeddingModel: modelInfo.modelName,
          lastEmbeddedAt: new Date(),
        });
        console.log(`[Embedding] 笔记 ${noteId} 向量化完成`);
      });
    })
    .catch((error) => {
      console.error(`[Embedding] 笔记 ${noteId} 向量化失败:`, error);
    });
}
