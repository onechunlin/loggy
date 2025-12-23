/**
 * 聊天消息模型
 */

import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * 消息文档接口
 */
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

