"use client";

import { useState } from "react";
import { looksLikeAnthropicKey } from "@/lib/validation";

export default function Onboarding({ onSave }: { onSave: (key: string) => void }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!looksLikeAnthropicKey(value)) {
      setError("That doesn't look like an Anthropic key. It should start with sk-ant-.");
      return;
    }
    setError(null);
    onSave(value.trim());
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">bestoffer</h1>
      <p className="mt-2 text-zinc-600">
        Turn five facts about your service business into a ready-to-use offer positioning kit.
      </p>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-medium text-zinc-900">Add your Anthropic API key</h2>
        <p className="mt-1 text-sm text-zinc-600">
          bestoffer runs on your own Anthropic key. You only pay for what you generate.
        </p>

        <ol className="mt-4 space-y-1 text-sm text-zinc-600">
          <li>
            1. Open the{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline underline-offset-2"
            >
              Anthropic Console API keys page
            </a>
            .
          </li>
          <li>2. Click &ldquo;Create Key&rdquo;, name it, and copy the value.</li>
          <li>3. Paste it below. It starts with sk-ant-.</li>
        </ol>

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="flex gap-2">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Unlock bestoffer
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-500">
          Your key is stored only in this browser and sent directly to Anthropic when you generate.
          It never reaches our servers. Clear it anytime with &ldquo;Change key.&rdquo;
        </p>
      </div>
    </main>
  );
}
