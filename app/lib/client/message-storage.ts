/**
 * 消息存储服务
 * 使用 localforage 和 IndexedDB 存储聊天消息
 */

import localforage from "localforage";
import type { Message } from "@/app/types";

// 配置 localforage
const messageStore = localforage.createInstance({
  name: "loggy",
  storeName: "messages",
  description: "聊天消息存储",
  driver: localforage.INDEXEDDB,
});

/**
 * 消息存储键
 */
const MESSAGES_KEY = "chat_messages";

/**
 * 保存消息列表到 IndexedDB
 * @param messages 消息列表
 */
export async function saveMessages(messages: Message[]): Promise<void> {
  try {
    // 转换 Date 对象为 ISO 字符串以便存储
    const serializedMessages = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));

    await messageStore.setItem(MESSAGES_KEY, serializedMessages);
  } catch (error) {
    console.error("保存消息失败:", error);
    throw error;
  }
}

/**
 * 从 IndexedDB 加载消息列表
 * @returns 消息列表
 */
export async function loadMessages(): Promise<Message[]> {
  try {
    const stored = await messageStore.getItem<
      Array<Omit<Message, "timestamp"> & { timestamp: string }>
    >(MESSAGES_KEY);

    if (!stored || !Array.isArray(stored)) {
      return [];
    }

    // 将 ISO 字符串转换回 Date 对象
    return stored.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error("加载消息失败:", error);
    return [];
  }
}

/**
 * 清空所有消息
 */
export async function clearMessages(): Promise<void> {
  try {
    await messageStore.removeItem(MESSAGES_KEY);
  } catch (error) {
    console.error("清空消息失败:", error);
    throw error;
  }
}

/**
 * 获取消息数量
 */
export async function getMessageCount(): Promise<number> {
  try {
    const messages = await loadMessages();
    return messages.length;
  } catch (error) {
    console.error("获取消息数量失败:", error);
    return 0;
  }
}
