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
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const replacement = `(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[264],{1442:(e,s,r)=>{Promise.resolve().then(r.bind(r,6419))},5519:(e,s,r)=>{"use strict";var l=r(2455);r.o(l,"useParams")&&r.d(s,{useParams:function(){return l.useParams}}),r.o(l,"usePathname")&&r.d(s,{usePathname:function(){return l.usePathname}}),r.o(l,"useRouter")&&r.d(s,{useRouter:function(){return l.useRouter}})},6419:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>o});var l=r(4248),a=r(4564),t=r(5519);function o(){let e=(0,t.useRouter)(),[s,r]=(0,a.useState)(!1),[o,i]=(0,a.useState)(null),[n,d]=(0,a.useState)(!1),c=async()=>{r(!0);try{let e=await fetch("/api/demo/user-info"),s=await e.json();i(s)}catch(e){console.error(e)}finally{r(!1)}},u=async()=>{if(confirm("确定要清空 JS 缓存吗？清空后页面会重新报错。")){d(!0);try{if("serviceWorker"in navigator){let e=await navigator.serviceWorker.getRegistration();if(null==e?void 0:e.active){e.active.postMessage({type:"CLEAR_ALL_JS_CONTENT",data:{}});let s=null,r=e=>{let{type:l}=e.data;("CLEAR_ALL_JS_CONTENT_SUCCESS"===l||"CLEAR_ALL_JS_CONTENT_ERROR"===l)&&(s&&clearTimeout(s),navigator.serviceWorker.removeEventListener("message",r),"CLEAR_ALL_JS_CONTENT_SUCCESS"===l?(alert("JS 缓存已清空，页面将重新加载"),window.location.reload()):(alert("清空缓存失败，请重试"),d(!1)))};navigator.serviceWorker.addEventListener("message",r),s=setTimeout(()=>{navigator.serviceWorker.removeEventListener("message",r),alert("清空缓存超时，请重试"),d(!1)},5e3)}else alert("Service Worker 未激活"),d(!1)}else alert("浏览器不支持 Service Worker"),d(!1)}catch(e){console.error("清空缓存失败:",e),alert("清空缓存失败，请重试"),d(!1)}}};return(0,l.jsx)("div",{className:"h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8",children:(0,l.jsxs)("div",{className:"max-w-2xl mx-auto",children:[(0,l.jsxs)("button",{onClick:()=>e.push("/playground"),className:"mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors",children:[(0,l.jsx)("span",{className:"text-lg",children:"←"}),(0,l.jsx)("span",{className:"text-sm",children:"返回 Playground"})]}),(0,l.jsxs)("div",{className:"mb-8",children:[(0,l.jsx)("h1",{className:"text-3xl font-bold text-gray-900",children:"⚠️ API 协议不对齐演示"}),(0,l.jsx)("p",{className:"text-gray-600 mt-2",children:"演示前端和后端接口协议不对齐导致的 JavaScript 错误"})]}),(0,l.jsxs)("div",{className:"bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6",children:[(0,l.jsx)("h2",{className:"text-lg font-semibold text-yellow-900 mb-2",children:"\uD83D\uDCCB 问题说明"}),(0,l.jsxs)("ul",{className:"text-sm text-yellow-800 space-y-2 list-disc list-inside",children:[(0,l.jsxs)("li",{children:["前端认为"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","字段是必传的"]}),(0,l.jsxs)("li",{children:["后端实际返回中"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","是可选的 （90% 概率不返回）"]}),(0,l.jsxs)("li",{children:["前端直接使用"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"data.userInfo.profile.name"})," ","访问，当后端没有返回"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","时，会页面白屏"]}),(0,l.jsx)("li",{children:"前端监测到页面白屏后，会后台调用 AI 修复页面异常"}),(0,l.jsx)("li",{children:"AI 修复完成后，会重新加载页面"})]})]}),(0,l.jsxs)("div",{className:"bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6 space-y-3",children:[(0,l.jsx)("button",{onClick:c,disabled:s,className:"w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium",children:s?"请求中...":"发起请求（可能触发错误）"}),(0,l.jsx)("button",{onClick:u,disabled:n,className:"w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium",children:n?"清空中...":"清空JS缓存（会重新报错）"})]}),o&&(0,l.jsx)("div",{className:"bg-white rounded-2xl p-6 border border-gray-200 shadow-lg",children:(0,l.jsxs)("h6",{className:"text-lg font-semibold text-gray-900 mb-2",children:["用户名称：",o.userInfo?.profile?.name || "未知用户"]})})]})})}}},e=>{e.O(0,[647,895,358],()=>e(e.s=1442)),_N_E=e.O()}]);`;
    replaceJsContent.set(data.fileName, replacement);
    await saveReplacement(data.fileName, replacement);

    event.source?.postMessage({
      type: "REPLACE_JS_CONTENT_SUCCESS",
      data: {
        fileName: data.fileName,
        content: replacement,
      },
    });
  } else if (type === "REMOVE_JS_CONTENT") {
    replaceJsContent.delete(data.fileName);
    await deleteReplacement(data.fileName);
  } else if (type === "CLEAR_ALL_JS_CONTENT") {
    // 清除所有替换内容
    const allKeys = Array.from(replaceJsContent.keys());
    replaceJsContent.clear();

    // 从 IndexedDB 删除所有数据
    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      await Promise.all(
        allKeys.map(
          (key) =>
            new Promise<void>((resolve, reject) => {
              const request = store.delete(key);
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
            })
        )
      );

      console.log("🚀 已清除所有 JS 替换内容");

      event.source?.postMessage({
        type: "CLEAR_ALL_JS_CONTENT_SUCCESS",
        data: {},
      });
    } catch (error) {
      console.error("🚀 清除所有 JS 替换内容失败:", error);
      event.source?.postMessage({
        type: "CLEAR_ALL_JS_CONTENT_ERROR",
        data: { error: String(error) },
      });
    }
  }
});

// 先注册自定义的 fetch 监听器（在 Serwist 之前）
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 检查请求是否是JS文件
  if (url.endsWith(".js") && replaceJsContent.has(url)) {
    console.log("🚀 ~ fetch ~ url:", url);
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
