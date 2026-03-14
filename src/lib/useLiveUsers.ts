"use client";

import { useState, useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL = 30_000; // 30s

export function useLiveUsers() {
  const [count, setCount] = useState(1);
  const sessionId = useRef("");

  useEffect(() => {
    // Generate a stable session ID per tab
    if (!sessionId.current) {
      sessionId.current = crypto.randomUUID();
    }

    let cancelled = false;

    async function heartbeat() {
      try {
        const res = await fetch("/api/online", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId.current }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === "number") {
          setCount(Math.max(1, data.count));
        }
      } catch {
        // ignore
      }
    }

    heartbeat();
    const interval = setInterval(heartbeat, HEARTBEAT_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { count, status: "connected" as const };
}
