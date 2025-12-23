/**
 * 用户模型
 */

import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * 用户文档接口
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  nickname: string;
  email?: string;
  passwordHash: string;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户 Schema
 */
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "用户名不能为空"],
      unique: true,
      trim: true,
      minlength: [3, "用户名长度至少为3位"],
      maxlength: [30, "用户名长度不能超过30位"],
      index: true,
    },
    nickname: {
      type: String,
      required: [true, "昵称不能为空"],
      trim: true,
      maxlength: [50, "昵称长度不能超过50位"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // 允许多个 null 值
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "请输入有效的邮箱地址",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "密码不能为空"],
      select: false, // 默认查询时不返回密码
    },
    avatar: {
      type: String,
      default: undefined,
    },
    lastLoginAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    collection: "users",
  }
);

// 创建索引
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 }, { sparse: true });

/**
 * 用户模型
 */
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

