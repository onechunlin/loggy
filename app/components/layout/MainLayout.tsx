"use client";

import { ReactNode, useState, useEffect } from "react";
import TabBar from "./TabBar";
import { AIAssistant } from "@/app/components/features";
import { NavigationConfirmModal } from "@/app/components/ui";
import {
  NavigatePageEventCenter,
  NavigatePageEventName,
  type NavigatePageEventConfig,
} from "@/app/events/navigatePageEvent";
import { findBracketRange } from "@/app/utils/bracket-matcher";

interface MainLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
}

/**
 * 主布局组件
 * 包含底部导航栏和内容区域
 */
export default function MainLayout({
  children,
  showTabBar = true,
}: MainLayoutProps) {
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<
    string | null
  >(null);

  // 监听导航事件
  useEffect(() => {
    const handleNavigate = (config: NavigatePageEventConfig) => {
      setPendingNavigationUrl(config.pagePath);
    };

    NavigatePageEventCenter.on(
      NavigatePageEventName.NavigateToPage,
      handleNavigate
    );

    if ("serviceWorker" in navigator) {
      window.addEventListener("error", (event) => {
        const errorFileName = event.filename;
        const errorLineNumber = event.lineno;
        const errorColumnNumber = event.colno;
        const errorMessage = event.message;
        console.error("global error", {
          errorFileName,
          errorLineNumber,
          errorColumnNumber,
          errorMessage,
        });

        const replacement = `(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[264],{1442:(e,s,r)=>{Promise.resolve().then(r.bind(r,6419))},5519:(e,s,r)=>{"use strict";var l=r(2455);r.o(l,"useParams")&&r.d(s,{useParams:function(){return l.useParams}}),r.o(l,"usePathname")&&r.d(s,{usePathname:function(){return l.usePathname}}),r.o(l,"useRouter")&&r.d(s,{useRouter:function(){return l.useRouter}})},6419:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>o});var l=r(4248),a=r(4564),t=r(5519);function o(){let e=(0,t.useRouter)(),[s,r]=(0,a.useState)(!1),[o,i]=(0,a.useState)(null),[n,d]=(0,a.useState)(!1),c=async()=>{r(!0);try{let e=await fetch("/api/demo/user-info"),s=await e.json();i(s)}catch(e){console.error(e)}finally{r(!1)}},u=async()=>{if(confirm("确定要清空 JS 缓存吗？清空后页面会重新报错。")){d(!0);try{if("serviceWorker"in navigator){let e=await navigator.serviceWorker.getRegistration();if(null==e?void 0:e.active){e.active.postMessage({type:"CLEAR_ALL_JS_CONTENT",data:{}});let s=null,r=e=>{let{type:l}=e.data;("CLEAR_ALL_JS_CONTENT_SUCCESS"===l||"CLEAR_ALL_JS_CONTENT_ERROR"===l)&&(s&&clearTimeout(s),navigator.serviceWorker.removeEventListener("message",r),"CLEAR_ALL_JS_CONTENT_SUCCESS"===l?(alert("JS 缓存已清空，页面将重新加载"),window.location.reload()):(alert("清空缓存失败，请重试"),d(!1)))};navigator.serviceWorker.addEventListener("message",r),s=setTimeout(()=>{navigator.serviceWorker.removeEventListener("message",r),alert("清空缓存超时，请重试"),d(!1)},5e3)}else alert("Service Worker 未激活"),d(!1)}else alert("浏览器不支持 Service Worker"),d(!1)}catch(e){console.error("清空缓存失败:",e),alert("清空缓存失败，请重试"),d(!1)}}};return(0,l.jsx)("div",{className:"h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8",children:(0,l.jsxs)("div",{className:"max-w-2xl mx-auto",children:[(0,l.jsxs)("button",{onClick:()=>e.push("/playground"),className:"mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors",children:[(0,l.jsx)("span",{className:"text-lg",children:"←"}),(0,l.jsx)("span",{className:"text-sm",children:"返回 Playground"})]}),(0,l.jsxs)("div",{className:"mb-8",children:[(0,l.jsx)("h1",{className:"text-3xl font-bold text-gray-900",children:"⚠️ API 协议不对齐演示"}),(0,l.jsx)("p",{className:"text-gray-600 mt-2",children:"演示前端和后端接口协议不对齐导致的 JavaScript 错误"})]}),(0,l.jsxs)("div",{className:"bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6",children:[(0,l.jsx)("h2",{className:"text-lg font-semibold text-yellow-900 mb-2",children:"\uD83D\uDCCB 问题说明"}),(0,l.jsxs)("ul",{className:"text-sm text-yellow-800 space-y-2 list-disc list-inside",children:[(0,l.jsxs)("li",{children:["前端认为"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","字段是必传的"]}),(0,l.jsxs)("li",{children:["后端实际返回中"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","是可选的 （90% 概率不返回）"]}),(0,l.jsxs)("li",{children:["前端直接使用"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"data.userInfo.profile.name"})," ","访问，当后端没有返回"," ",(0,l.jsx)("code",{className:"bg-yellow-100 px-1 rounded",children:"userInfo"})," ","时，会页面白屏"]}),(0,l.jsx)("li",{children:"前端监测到页面白屏后，会后台调用 AI 修复页面异常"}),(0,l.jsx)("li",{children:"AI 修复完成后，会重新加载页面"})]})]}),(0,l.jsxs)("div",{className:"bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6 space-y-3",children:[(0,l.jsx)("button",{onClick:c,disabled:s,className:"w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium",children:s?"请求中...":"发起请求（可能触发错误）"}),(0,l.jsx)("button",{onClick:u,disabled:n,className:"w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium",children:n?"清空中...":"清空JS缓存（会重新报错）"})]}),o&&(0,l.jsx)("div",{className:"bg-white rounded-2xl p-6 border border-gray-200 shadow-lg",children:(0,l.jsxs)("h6",{className:"text-lg font-semibold text-gray-900 mb-2",children:["用户名称：",o.userInfo?.profile?.name || "未知用户"]})})]})})}}},e=>{e.O(0,[647,895,358],()=>e(e.s=1442)),_N_E=e.O()}]);`;

        const range = findBracketRange(replacement, errorColumnNumber);
        const [startIndex, endIndex] = range || [0, 0];
        // todo 后续把错误代码块发给AI，让AI修复
        const errorCodeChunk = replacement.slice(startIndex, endIndex + 1);
        console.log("🚀 ~ errorCodeChunk:", errorCodeChunk);

        navigator.serviceWorker.getRegistration().then((registration) => {
          // 向激活的 Service Worker 发送消息
          if (registration?.active) {
            // 发送消息
            registration.active.postMessage({
              type: "REPLACE_JS_CONTENT",
              data: {
                fileName: errorFileName,
                lineNumber: errorLineNumber,
                columnNumber: errorColumnNumber,
                message: errorMessage,
              },
            });
          }
        });
      });

      // 监听 Service Worker 的回复
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, data } = event.data as {
          type: string;
          data: { fileName: string };
        };
        console.log("🚀 ~ MainLayout ~ type:", type);
        if (type === "REPLACE_JS_CONTENT_START") {
          alert("监测到页面异常，AI正在尝试修复");
          console.warn("⚠️监测到页面异常，AI正在尝试修复");
        } else if (type === "REPLACE_JS_CONTENT_SUCCESS") {
          console.log("AI已尝试修复完成，点击重新加载");
          // 强制刷新，禁用缓存
          const url = new URL(window.location.href);
          url.searchParams.set("_sw_reload", Date.now().toString());
          window.location.replace(url.toString());
        }
      });
    }

    return () => {
      NavigatePageEventCenter.off(NavigatePageEventName.NavigateToPage);
    };
  }, []);

  // 取消跳转
  const handleCancelNavigation = () => {
    console.log("❌ 用户取消跳转");
    setPendingNavigationUrl(null);
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 主内容区域 - 弹性布局 */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>

      {/* 底部导航栏 */}
      {showTabBar && <TabBar />}

      {/* AI 助手 */}
      <AIAssistant />

      {/* 确认跳转弹窗 */}
      {pendingNavigationUrl && (
        <NavigationConfirmModal
          url={pendingNavigationUrl}
          countdownSeconds={3}
          onClose={handleCancelNavigation}
        />
      )}
    </div>
  );
}
