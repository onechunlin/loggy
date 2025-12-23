/**
 * 消息存储服务（使用 API 优先 + 离线降级策略）
 */

import localforage from "localforage";
import type { Message } from "@/app/types";
import { apiClient, isOnline } from "./api-client";

// 配置 localforage
const messageStore = localforage.createInstance({
  name: "loggy",
  storeName: "messages",
  description: "聊天消息存储",
  driver: localforage.INDEXEDDB,
});

const MESSAGES_KEY = "chat_messages";

/**
 * 从本地缓存加载消息
 */
async function loadLocalMessages(): Promise<Message[]> {
  try {
    const stored = await messageStore.getItem<
      Array<Omit<Message, "timestamp"> & { timestamp: string }>
    >(MESSAGES_KEY);

    if (!stored || !Array.isArray(stored)) {
      return [];
    }

    return stored.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error("加载本地消息失败:", error);
    return [];
  }
}

/**
 * 保存消息到本地缓存
 */
async function saveLocalMessages(messages: Message[]): Promise<void> {
  try {
    const serialized = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));

    await messageStore.setItem(MESSAGES_KEY, serialized);
  } catch (error) {
    console.error("保存本地消息失败:", error);
  }
}

/**
 * 加载消息列表
 */
export async function loadMessages(): Promise<Message[]> {
  try {
    if (isOnline()) {
      interface ApiMessage {
        id: string;
        role: "user" | "assistant";
        content: string;
        timestamp: string | Date;
      }

      const messages = await apiClient.get<ApiMessage[]>("/api/messages");
      const deserializedMessages = messages.map((msg) => ({
        ...msg,
        timestamp:
          msg.timestamp instanceof Date
            ? msg.timestamp
            : new Date(msg.timestamp),
      }));

      await saveLocalMessages(deserializedMessages);
      return deserializedMessages;
    }
  } catch (error) {
    console.error("从 API 加载消息失败，使用本地缓存:", error);
  }

  return await loadLocalMessages();
}

/**
 * 创建单条消息（立即保存到服务器和本地）
 */
export async function createMessage(
  message: Omit<Message, "id">
): Promise<Message> {
  const newMessage: Message = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  // 保存到本地
  const localMessages = await loadLocalMessages();
  await saveLocalMessages([...localMessages, newMessage]);

  // 如果在线且内容不为空，保存到服务器
  if (isOnline() && message.content && message.content.trim().length > 0) {
    try {
      await apiClient.post("/api/messages", {
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      });
    } catch (error) {
      console.error("保存消息到服务器失败:", error);
      // 服务器失败不影响本地使用
    }
  }

  return newMessage;
}

/**
 * 更新单条消息内容（用于流式更新）
 */
export async function updateMessageContent(
  messageId: string,
  content: string
): Promise<void> {
  // 更新本地缓存
  const localMessages = await loadLocalMessages();
  const updatedMessages = localMessages.map((msg) =>
    msg.id === messageId ? { ...msg, content } : msg
  );
  await saveLocalMessages(updatedMessages);
}

/**
 * 完成消息编辑并同步到服务器
 */
export async function finalizeMessage(messageId: string): Promise<void> {
  const localMessages = await loadLocalMessages();
  const message = localMessages.find((msg) => msg.id === messageId);

  if (!message || !message.content || message.content.trim().length === 0) {
    return;
  }

  // 同步到服务器
  if (isOnline()) {
    try {
      await apiClient.post("/api/messages", {
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      });
    } catch (error) {
      console.error("同步消息到服务器失败:", error);
    }
  }
}

/**
 * 保存消息列表到本地（仅用于本地缓存）
 */
export async function saveMessagesToLocal(messages: Message[]): Promise<void> {
  await saveLocalMessages(messages);
}

/**
 * 清空所有消息
 */
export async function clearMessages(): Promise<void> {
  try {
    if (isOnline()) {
      await apiClient.delete("/api/messages");
    }
  } catch (error) {
    console.error("清空服务器消息失败:", error);
  }

  await messageStore.removeItem(MESSAGES_KEY);
}

/**
 * 获取消息数量
 */
export async function getMessageCount(): Promise<number> {
  const messages = await loadMessages();
  return messages.length;
}
