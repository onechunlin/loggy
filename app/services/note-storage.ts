/**
 * 笔记存储服务
 * 使用 localforage 和 IndexedDB 存储笔记
 */

import localforage from "localforage";
import type { Note, CreateNoteParams, UpdateNoteParams } from "@/app/types";

// 配置 localforage
const noteStore = localforage.createInstance({
  name: "loggy",
  storeName: "notes",
  description: "笔记存储",
  driver: localforage.INDEXEDDB,
});

/**
 * 笔记存储键
 */
const NOTES_KEY = "all_notes";

/**
 * 序列化笔记（Date -> ISO String）
 */
function serializeNote(note: Note) {
  return {
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

/**
 * 反序列化笔记（ISO String -> Date）
 */
function deserializeNote(
  note: Omit<Note, "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  }
): Note {
  return {
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
  };
}

/**
 * 获取所有笔记
 */
export async function getAllNotes(): Promise<Note[]> {
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
    console.error("加载笔记失败:", error);
    return [];
  }
}

/**
 * 保存所有笔记
 */
async function saveAllNotes(notes: Note[]): Promise<void> {
  try {
    const serialized = notes.map(serializeNote);
    await noteStore.setItem(NOTES_KEY, serialized);
  } catch (error) {
    console.error("保存笔记失败:", error);
    throw error;
  }
}

/**
 * 根据 ID 获取笔记
 */
export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const notes = await getAllNotes();
    return notes.find((note) => note.id === id) || null;
  } catch (error) {
    console.error("获取笔记失败:", error);
    return null;
  }
}

/**
 * 创建笔记
 */
export async function createNote(params: CreateNoteParams): Promise<Note> {
  try {
    const now = new Date();
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: params.title,
      content: params.content || "",
      tags: params.tags || [],
      isStarred: false,
      createdAt: now,
      updatedAt: now,
    };

    const notes = await getAllNotes();
    notes.unshift(newNote); // 新笔记放在最前面
    await saveAllNotes(notes);

    return newNote;
  } catch (error) {
    console.error("创建笔记失败:", error);
    throw error;
  }
}

/**
 * 更新笔记
 */
export async function updateNote(
  id: string,
  params: UpdateNoteParams
): Promise<Note | null> {
  try {
    const notes = await getAllNotes();
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
    await saveAllNotes(notes);

    return updatedNote;
  } catch (error) {
    console.error("更新笔记失败:", error);
    throw error;
  }
}

/**
 * 删除笔记
 */
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const notes = await getAllNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);

    if (filteredNotes.length === notes.length) {
      return false; // 没有找到要删除的笔记
    }

    await saveAllNotes(filteredNotes);
    return true;
  } catch (error) {
    console.error("删除笔记失败:", error);
    throw error;
  }
}

/**
 * 切换笔记收藏状态
 */
export async function toggleNoteStar(id: string): Promise<Note | null> {
  try {
    const notes = await getAllNotes();
    const note = notes.find((n) => n.id === id);

    if (!note) {
      return null;
    }

    return await updateNote(id, { isStarred: !note.isStarred });
  } catch (error) {
    console.error("切换收藏状态失败:", error);
    throw error;
  }
}

/**
 * 搜索笔记
 */
export async function searchNotes(query: string): Promise<Note[]> {
  try {
    if (!query.trim()) {
      return await getAllNotes();
    }

    const notes = await getAllNotes();
    const lowerQuery = query.toLowerCase();

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error("搜索笔记失败:", error);
    return [];
  }
}

/**
 * 按标签筛选笔记
 */
export async function getNotesByTags(tags: string[]): Promise<Note[]> {
  try {
    if (tags.length === 0) {
      return await getAllNotes();
    }

    const notes = await getAllNotes();
    return notes.filter((note) => tags.some((tag) => note.tags.includes(tag)));
  } catch (error) {
    console.error("按标签筛选失败:", error);
    return [];
  }
}

/**
 * 获取所有标签
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const notes = await getAllNotes();
    const tagsSet = new Set<string>();

    notes.forEach((note) => {
      note.tags.forEach((tag) => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error("获取标签失败:", error);
    return [];
  }
}

/**
 * 清空所有笔记
 */
export async function clearAllNotes(): Promise<void> {
  try {
    await noteStore.removeItem(NOTES_KEY);
  } catch (error) {
    console.error("清空笔记失败:", error);
    throw error;
  }
}

/**
 * 获取笔记数量
 */
export async function getNotesCount(): Promise<number> {
  try {
    const notes = await getAllNotes();
    return notes.length;
  } catch (error) {
    console.error("获取笔记数量失败:", error);
    return 0;
  }
}
