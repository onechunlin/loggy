/**
 * 笔记模型
 */

import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * 笔记文档接口
 */
export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  isStarred: boolean;
  embedding?: number[]; // 向量表示，用于语义搜索
  embeddingModel?: string; // 生成 embedding 使用的模型名称
  lastEmbeddedAt?: Date; // 最后一次生成 embedding 的时间
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 笔记 Schema
 */
const NoteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "用户ID不能为空"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "标题不能为空"],
      trim: true,
      maxlength: [200, "标题长度不能超过200个字符"],
    },
    content: {
      type: String,
      default: "",
      maxlength: [100000, "内容长度不能超过100000个字符"],
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false, // 默认查询时不返回（节省带宽）
    },
    embeddingModel: {
      type: String,
      default: undefined,
    },
    lastEmbeddedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    collection: "notes",
  }
);

// 创建索引
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, isStarred: 1 });

/**
 * 笔记模型
 */
const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;
