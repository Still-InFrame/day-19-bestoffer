"use client";

import { useState } from "react";

// Small copy-to-clipboard button with a brief "Copied" confirmation.
export default function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; fail quietly rather than crash.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 ${className}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
