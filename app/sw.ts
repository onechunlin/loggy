import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

type ReplaceJsContentData = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  message: string;
};

// 使用 IndexedDB 持久化存储
const DB_NAME = "loggy_js_replace";
const STORE_NAME = "js_replacements";
const DB_VERSION = 1;

// 初始化 IndexedDB
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// 从 IndexedDB 加载所有替换内容
async function loadReplacements(): Promise<Map<string, string>> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const map = new Map<string, string>();

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          map.set(cursor.key as string, cursor.value);
          cursor.continue();
        } else {
          console.log("🚀 从 IndexedDB 加载替换内容:", map.size, "条");
          resolve(map);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("🚀 加载替换内容失败:", error);
    return new Map();
  }
}

// 保存替换内容到 IndexedDB
async function saveReplacement(key: string, value: string): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put(value, key);
      request.onsuccess = () => {
        console.log("🚀 保存替换内容到 IndexedDB:", key);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("🚀 保存替换内容失败:", error);
    throw error;
  }
}

// 删除替换内容
async function deleteReplacement(key: string): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => {
        console.log("🚀 删除替换内容:", key);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("🚀 删除替换内容失败:", error);
    throw error;
  }
}

// 内存中的 Map（用于快速访问）
const replaceJsContent = new Map<string, string>();

// Service Worker 启动时从 IndexedDB 加载数据
loadReplacements().then((map) => {
  map.forEach((value, key) => {
    replaceJsContent.set(key, value);
  });
});

self.addEventListener("message", async (event) => {
  const { type, data } = event.data as {
    type: string;
    data: ReplaceJsContentData;
  };

  if (type === "REPLACE_JS_CONTENT") {
    event.source?.postMessage({
      type: "REPLACE_JS_CONTENT_START",
      data: {
        fileName: data.fileName,
      },
    });
    // todo 调用AI修复，这里先模拟
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const replacement = `(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[264],{5519:(e,s,l)=>{"use strict";var r=l(2455);l.o(r,"useParams")&&l.d(s,{useParams:function(){return r.useParams}}),l.o(r,"usePathname")&&l.d(s,{usePathname:function(){return r.usePathname}}),l.o(r,"useRouter")&&l.d(s,{useRouter:function(){return r.useRouter}})},6419:(e,s,l)=>{"use strict";l.r(s),l.d(s,{default:()=>n});var r=l(4248),a=l(4564),t=l(5519);function n(){let e=(0,t.useRouter)(),[s,l]=(0,a.useState)(!1),[n,o]=(0,a.useState)(null),d=async()=>{l(!0);try{let e=await fetch("/api/demo/user-info"),s=await e.json();o(s)}catch(e){console.error(e)}finally{l(!1)}};return(0,r.jsx)("div",{className:"h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8",children:(0,r.jsxs)("div",{className:"max-w-2xl mx-auto",children:[(0,r.jsxs)("button",{onClick:()=>e.push("/playground"),className:"mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors",children:[(0,r.jsx)("span",{className:"text-lg",children:"←"}),(0,r.jsx)("span",{className:"text-sm",children:"返回 Playground"})]}),(0,r.jsxs)("div",{className:"mb-8",children:[(0,r.jsx)("h1",{className:"text-3xl font-bold text-gray-900",children:"⚠️ API 协议不对齐演示"}),(0,r.jsx)("p",{className:"text-gray-600 mt-2",children:"演示前端和后端接口协议不对齐导致的 JavaScript 错误"})]}),(0,r.jsxs)("div",{className:"bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6",children:[(0,r.jsx)("h2",{className:"text-lg font-semibold text-yellow-900 mb-2",children:"\uD83D\uDCCB 问题说明"}),(0,r.jsxs)("ul",{className:"text-sm text-yellow-800 space-y-1 list-disc list-inside",children:[(0,r.jsxs)("li",{children:["前端认为"," ",(0,r.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","字段是必传的"]}),(0,r.jsxs)("li",{children:["后端实际返回中"," ",(0,r.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","是可选的（90% 概率不返回）"]}),(0,r.jsxs)("li",{children:["前端直接使用"," ",(0,r.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"data.userInfo.profile.name"})," ","访问"]}),(0,r.jsx)("li",{children:"当后端没有返回 userInfo 时，会页面白屏"})]})]}),(0,r.jsx)("div",{className:"bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6",children:(0,r.jsx)("button",{onClick:d,disabled:s,className:"w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium",children:s?"请求中...":"发起请求（可能触发错误）"})}),n&&(0,r.jsx)("div",{className:"bg-white rounded-2xl p-6 border border-gray-200 shadow-lg",children:(0,r.jsxs)("h6",{className:"text-lg font-semibold text-gray-900 mb-2",children:["用户名称：",n.userInfo?.profile?.name || "未知用户"]})})]})})}},6776:(e,s,l)=>{Promise.resolve().then(l.bind(l,6419))}},e=>{e.O(0,[647,895,358],()=>e(e.s=6776)),_N_E=e.O()}]);`;
    replaceJsContent.set(data.fileName, replacement);
    await saveReplacement(data.fileName, replacement);

    event.source?.postMessage({
      type: "REPLACE_JS_CONTENT_SUCCESS",
      data: {
        fileName: data.fileName,
      },
    });
  } else if (type === "REMOVE_JS_CONTENT") {
    replaceJsContent.delete(data.fileName);
    await deleteReplacement(data.fileName);
  }
});

// 先注册自定义的 fetch 监听器（在 Serwist 之前）
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 检查请求是否是JS文件
  if (url.endsWith(".js") && replaceJsContent.has(url)) {
    // 返回替换后的内容
    event.respondWith(
      new Response(replaceJsContent.get(url) || "", {
        headers: {
          "Content-Type": "application/javascript",
        },
      })
    );
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
