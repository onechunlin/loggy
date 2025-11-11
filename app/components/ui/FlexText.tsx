"use client";

import { useState, useEffect, useRef } from "react";
import { FontStyleEventCenter } from "@/app/events/fontStyleEvent";
import { cn } from "@/app/lib/utils";

interface FlexTextProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * FlexText 组件
 * 支持通过事件动态改变字体大小、颜色和字重
 */
export default function FlexText({ content, className, style }: FlexTextProps) {
  const [size, setSize] = useState<number | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [weight, setWeight] = useState<string | number | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 监听字体大小变化事件
    const handleSizeChange = (params: { size?: number; scale?: number }) => {
      if (params.size !== undefined) {
        // 绝对值模式
        setSize(params.size);
      } else if (params.scale !== undefined) {
        // 相对缩放模式
        if (!textRef.current) {
          console.warn("textRef is not found");
          return;
        }
        const computedStyle = window.getComputedStyle(textRef.current);
        const baseSize = parseFloat(computedStyle.fontSize);
        const newSize = Math.ceil(baseSize * (params.scale || 1));
        setSize(newSize);
      }
    };

    // 监听字体颜色变化事件
    const handleColorChange = (params: { color?: string }) => {
      if (params.color !== undefined) {
        setColor(params.color);
      }
    };

    // 监听字重变化事件
    const handleWeightChange = (params: { weight?: string | number }) => {
      if (params.weight !== undefined) {
        setWeight(params.weight);
      }
    };

    const sizeEventName = `changeSize-${content}`;
    const colorEventName = `changeColor-${content}`;
    const weightEventName = `changeWeight-${content}`;

    FontStyleEventCenter.on(sizeEventName, handleSizeChange);
    FontStyleEventCenter.on(colorEventName, handleColorChange);
    FontStyleEventCenter.on(weightEventName, handleWeightChange);

    // 组件卸载时清理事件监听器
    return () => {
      FontStyleEventCenter.off(sizeEventName, handleSizeChange);
      FontStyleEventCenter.off(colorEventName, handleColorChange);
      FontStyleEventCenter.off(weightEventName, handleWeightChange);
    };
  }, [content]);

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(size ? { fontSize: `${size}px` } : {}),
    ...(color ? { color } : {}),
    ...(weight !== null ? { fontWeight: weight } : {}),
  };

  return (
    <span
      ref={textRef}
      className={cn("flex-text", className)}
      style={mergedStyle}
    >
      {content}
    </span>
  );
}
