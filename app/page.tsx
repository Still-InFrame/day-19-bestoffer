"use client";

import { useApiKey } from "@/lib/useApiKey";
import Onboarding from "./components/Onboarding";
import Generator from "./components/Generator";

export default function Home() {
  const { apiKey, ready, setApiKey, clearApiKey } = useApiKey();

  // Avoid an onboarding flash before localStorage is read.
  if (!ready) {
    return <div className="min-h-screen bg-zinc-50" />;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {apiKey ? (
        <Generator apiKey={apiKey} onChangeKey={clearApiKey} />
      ) : (
        <Onboarding onSave={setApiKey} />
      )}
    </div>
  );
}
