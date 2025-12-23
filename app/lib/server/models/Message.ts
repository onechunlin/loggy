/**
 * 聊天消息模型
 */

import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * 引用的笔记（轻量级，只包含必要信息）
 */
interface ReferencedNoteData {
  noteId: string;
  title: string;
  content: string;
  similarity: number;
}

/**
 * 消息文档接口
 */
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: ReferencedNoteData[]; // 引用的笔记（仅 assistant 消息）
}

/**
 * 消息 Schema
 */
const MessageSchema = new Schema<IMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "用户ID不能为空"],
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: [true, "角色不能为空"],
    },
    content: {
      type: String,
      required: [true, "消息内容不能为空"],
      maxlength: [10000, "消息内容长度不能超过10000个字符"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    references: {
      type: [
        {
          noteId: { type: String, required: true },
          title: { type: String, required: true },
          content: { type: String, required: true },
          similarity: { type: Number, required: true },
        },
      ],
      default: undefined,
    },
  },
  {
    collection: "messages",
  }
);

// 创建索引
MessageSchema.index({ userId: 1, timestamp: -1 });

/**
 * 消息模型
 */
const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
