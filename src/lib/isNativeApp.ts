"use client";

import { useEffect, useState } from "react";

// Capacitor の appendUserAgent で付与した目印を検知
// （Google Play の決済規約対応：アプリ内では課金導線を隠す）
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsNative(navigator.userAgent.includes("FukugyoBuddyApp"));
    }
  }, []);

  return isNative;
}
