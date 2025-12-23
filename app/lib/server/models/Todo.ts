/**
 * 待办事项模型
 */

import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * 待办文档接口
 */
export interface ITodo extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 待办 Schema
 */
const TodoSchema = new Schema<ITodo>(
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
    description: {
      type: String,
      default: undefined,
      maxlength: [2000, "描述长度不能超过2000个字符"],
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    dueDate: {
      type: Date,
      default: undefined,
      index: true,
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
  },
  {
    timestamps: true,
    collection: "todos",
  }
);

// 创建索引
TodoSchema.index({ userId: 1, completed: 1, createdAt: -1 });
TodoSchema.index({ userId: 1, dueDate: 1 });
TodoSchema.index({ userId: 1, tags: 1 });

/**
 * 待办模型
 */
const Todo: Model<ITodo> =
  mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);

export default Todo;

