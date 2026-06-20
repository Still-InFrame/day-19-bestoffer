"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bestoffer_anthropic_key";

// Reads/writes the Anthropic key in localStorage so it persists across reloads
// but never leaves the browser. `ready` guards against SSR/hydration flicker:
// we don't know the stored value until after mount.
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setApiKeyState(localStorage.getItem(STORAGE_KEY));
    } catch {
      // localStorage can throw in private modes; treat as no key.
    }
    setReady(true);
  }, []);

  function setApiKey(key: string) {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // Ignore persistence failure; key still lives in memory for this session.
    }
    setApiKeyState(key);
  }

  function clearApiKey() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
    setApiKeyState(null);
  }

  return { apiKey, ready, setApiKey, clearApiKey };
}
