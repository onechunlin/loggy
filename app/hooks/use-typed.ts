"use client";

import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { TYPED_CONFIG } from "@/app/lib/constants";

/**
 * Typed.js 打字效果的 Hook
 */
export function useTyped() {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typedRef.current) {
      const typed = new Typed(typedRef.current, TYPED_CONFIG);

      return () => {
        typed.destroy();
      };
    }
  }, []);

  return typedRef;
}
