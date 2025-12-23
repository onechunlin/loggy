/**
 * 笔记存储服务（使用 API 优先 + 离线降级策略）
 */

import localforage from "localforage";
import type { Note, CreateNoteParams, UpdateNoteParams } from "@/app/types";
import { apiClient, isOnline } from "./api-client";

// 配置 localforage
const noteStore = localforage.createInstance({
  name: "loggy",
  storeName: "notes",
  description: "笔记存储",
  driver: localforage.INDEXEDDB,
});

const NOTES_KEY = "all_notes";

/**
 * 序列化笔记（Date -> ISO String）
 */
function serializeNote(note: Note) {
  return {
    ...note,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt,
  };
}

/**
 * 反序列化笔记（ISO String -> Date）
 */
function deserializeNote(
  note: Omit<Note, "createdAt" | "updatedAt"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
  }
): Note {
  return {
    ...note,
    createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt),
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt),
  };
}

/**
 * 从本地缓存获取所有笔记
 */
async function getLocalNotes(): Promise<Note[]> {
  try {
    const stored = await noteStore.getItem<
      Array<
        Omit<Note, "createdAt" | "updatedAt"> & {
          createdAt: string;
          updatedAt: string;
        }
      >
    >(NOTES_KEY);

    if (!stored || !Array.isArray(stored)) {
      return [];
    }

    return stored.map(deserializeNote);
  } catch (error) {
    console.error("加载本地笔记失败:", error);
    return [];
  }
}

/**
 * 保存笔记到本地缓存
 */
async function saveLocalNotes(notes: Note[]): Promise<void> {
  try {
    const serialized = notes.map(serializeNote);
    await noteStore.setItem(NOTES_KEY, serialized);
  } catch (error) {
    console.error("保存本地笔记失败:", error);
  }
}

/**
 * 获取所有笔记
 */
export async function getAllNotes(): Promise<Note[]> {
  try {
    // 如果在线，优先从 API 获取
    if (isOnline()) {
      const notes = await apiClient.get<Note[]>("/api/notes");
      const deserializedNotes = notes.map(deserializeNote);
      // 同步到本地缓存
      await saveLocalNotes(deserializedNotes);
      return deserializedNotes;
    }
  } catch (error) {
    console.error("从 API 获取笔记失败，使用本地缓存:", error);
  }

  // 离线或 API 失败时使用本地缓存
  return await getLocalNotes();
}

/**
 * 根据 ID 获取笔记
 */
export async function getNoteById(id: string): Promise<Note | null> {
  try {
    if (isOnline()) {
      const note = await apiClient.get<Note>(`/api/notes/${id}`);
      return deserializeNote(note);
    }
  } catch (error) {
    console.error("从 API 获取笔记失败，使用本地缓存:", error);
  }

  // 离线或 API 失败时使用本地缓存
  const notes = await getLocalNotes();
  return notes.find((note) => note.id === id) || null;
}

/**
 * 创建笔记
 */
export async function createNote(params: CreateNoteParams): Promise<Note> {
  try {
    // 如果在线，调用 API
    if (isOnline()) {
      const note = await apiClient.post<Note>("/api/notes", params);
      const deserializedNote = deserializeNote(note);
      
      // 同步到本地缓存
      const localNotes = await getLocalNotes();
      localNotes.unshift(deserializedNote);
      await saveLocalNotes(localNotes);
      
      return deserializedNote;
    }
  } catch (error) {
    console.error("创建笔记 API 失败，使用本地存储:", error);
  }

  // 离线或 API 失败时使用本地存储
  const now = new Date();
  const newNote: Note = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: params.title,
    content: params.content || "",
    isStarred: false,
    createdAt: now,
    updatedAt: now,
  };

  const notes = await getLocalNotes();
  notes.unshift(newNote);
  await saveLocalNotes(notes);

  return newNote;
}

/**
 * 更新笔记
 */
export async function updateNote(
  id: string,
  params: UpdateNoteParams
): Promise<Note | null> {
  try {
    // 如果在线，调用 API
    if (isOnline()) {
      const note = await apiClient.patch<Note>(`/api/notes/${id}`, params);
      const deserializedNote = deserializeNote(note);
      
      // 同步到本地缓存
      const localNotes = await getLocalNotes();
      const index = localNotes.findIndex((n) => n.id === id);
      if (index !== -1) {
        localNotes[index] = deserializedNote;
        await saveLocalNotes(localNotes);
      }
      
      return deserializedNote;
    }
  } catch (error) {
    console.error("更新笔记 API 失败，使用本地存储:", error);
  }

  // 离线或 API 失败时使用本地存储
  const notes = await getLocalNotes();
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  const updatedNote: Note = {
    ...notes[index],
    ...params,
    updatedAt: new Date(),
  };

  notes[index] = updatedNote;
  await saveLocalNotes(notes);

  return updatedNote;
}

/**
 * 删除笔记
 */
export async function deleteNote(id: string): Promise<boolean> {
  try {
    // 如果在线，调用 API
    if (isOnline()) {
      await apiClient.delete(`/api/notes/${id}`);
      
      // 同步到本地缓存
      const localNotes = await getLocalNotes();
      const filteredNotes = localNotes.filter((note) => note.id !== id);
      await saveLocalNotes(filteredNotes);
      
      return true;
    }
  } catch (error) {
    console.error("删除笔记 API 失败，使用本地存储:", error);
  }

  // 离线或 API 失败时使用本地存储
  const notes = await getLocalNotes();
  const filteredNotes = notes.filter((note) => note.id !== id);

  if (filteredNotes.length === notes.length) {
    return false;
  }

  await saveLocalNotes(filteredNotes);
  return true;
}

/**
 * 切换笔记收藏状态
 */
export async function toggleNoteStar(id: string): Promise<Note | null> {
  const note = await getNoteById(id);
  if (!note) return null;

  return await updateNote(id, { isStarred: !note.isStarred });
}

/**
 * 搜索笔记
 */
export async function searchNotes(query: string): Promise<Note[]> {
  const notes = await getAllNotes();
  
  if (!query.trim()) {
    return notes;
  }

  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 清空所有笔记
 */
export async function clearAllNotes(): Promise<void> {
  try {
    if (isOnline()) {
      // 如果在线，需要逐个删除（因为没有批量删除 API）
      const notes = await getAllNotes();
      await Promise.all(notes.map((note) => deleteNote(note.id)));
    }
  } catch (error) {
    console.error("清空笔记 API 失败:", error);
  }

  // 清空本地缓存
  await noteStore.removeItem(NOTES_KEY);
}

/**
 * 获取笔记数量
 */
export async function getNotesCount(): Promise<number> {
  const notes = await getAllNotes();
  return notes.length;
}

