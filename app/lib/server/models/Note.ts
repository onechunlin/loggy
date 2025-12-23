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
  tags: string[];
  isStarred: boolean;
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
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 20;
        },
        message: "标签数量不能超过20个",
      },
      index: true,
    },
    isStarred: {
      type: Boolean,
      default: false,
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
NoteSchema.index({ userId: 1, tags: 1 });

/**
 * 笔记模型
 */
const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;
