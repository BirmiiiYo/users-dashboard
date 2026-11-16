"use client";

import { useEffect, useState } from "react";

/** false на сервере и первом клиентском рендере, true после монтирования. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
