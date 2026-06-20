"use client";

import { useMemo, useState } from "react";
import { generateKit } from "@/lib/anthropic";
import { autofillFromWebsite } from "@/lib/autofill";
import type { BusinessInput, ModelId, OfferKit, SenderInput } from "@/lib/types";
import { MODELS } from "@/lib/types";
import { normalizeUrl, required, validateEmail, validatePhone } from "@/lib/validation";
import ResultsKit from "./ResultsKit";

interface Props {
  apiKey: string;
  onChangeKey: () => void;
}

const EMPTY_BUSINESS: BusinessInput = {
  businessType: "",
  audience: "",
  service: "",
  problem: "",
  goal: "",
};

const EMPTY_SENDER: SenderInput = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
};

// Validates the whole form and returns a map of field -> error message.
function validateForm(business: BusinessInput, sender: SenderInput) {
  return {
    businessType: required(business.businessType, "Business type"),
    audience: required(business.audience, "Audience"),
    service: required(business.service, "Service"),
    problem: required(business.problem, "Problem"),
    goal: required(business.goal, "Goal"),
    firstName: required(sender.firstName, "First name"),
    lastName: required(sender.lastName, "Last name"),
    phone: validatePhone(sender.phone),
    email: validateEmail(sender.email),
  } as Record<string, string | null>;
}

export default function Generator({ apiKey, onChangeKey }: Props) {
  const [business, setBusiness] = useState<BusinessInput>(EMPTY_BUSINESS);
  const [sender, setSender] = useState<SenderInput>(EMPTY_SENDER);
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kit, setKit] = useState<OfferKit | null>(null);

  const [website, setWebsite] = useState("");
  const [autofilling, setAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);

  const errors = useMemo(() => validateForm(business, sender), [business, sender]);
  const isValid = Object.values(errors).every((e) => e === null);

  const opusNote = MODELS.find((m) => m.id === "claude-opus-4-8")?.note;

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function showError(field: string): string | null {
    return touched[field] ? errors[field] : null;
  }

  async function handleAutofill() {
    const url = normalizeUrl(website);
    if (!url) {
      setAutofillError("Enter a website address, e.g. yourbusiness.com");
      return;
    }
    setAutofilling(true);
    setAutofillError(null);
    try {
      const profile = await autofillFromWebsite({ apiKey, model, url });
      setBusiness(profile);
      // Clear any stale validation errors on the now-filled business fields.
      setTouched((t) => ({
        ...t,
        businessType: false,
        audience: false,
        service: false,
        problem: false,
        goal: false,
      }));
    } catch (err) {
      setAutofillError(toReadableError(err));
    } finally {
      setAutofilling(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    // Reveal any outstanding errors if they click without filling everything.
    setTouched(
      Object.keys(errors).reduce((acc, k) => ({ ...acc, [k]: true }), {} as Record<string, boolean>),
    );
    if (!isValid) return;

    setLoading(true);
    setError(null);
    setKit(null);
    try {
      const result = await generateKit({ apiKey, model, business, sender });
      setKit(result);
    } catch (err) {
      setError(toReadableError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">bestoffer</h1>
          <p className="text-sm text-zinc-600">Your offer positioning kit, generated.</p>
        </div>
        <button
          type="button"
          onClick={onChangeKey}
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900"
        >
          Change key
        </button>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-6">
          <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-zinc-900">Your business</legend>

            <div className="rounded-lg bg-zinc-50 p-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-700">
                  Autofill from your website (optional)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="yourbusiness.com"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={autofilling}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleAutofill}
                    disabled={autofilling}
                    className="shrink-0 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {autofilling ? "Reading…" : "Autofill"}
                  </button>
                </div>
              </label>
              <p className="mt-1.5 text-xs text-zinc-500">
                We read your site and fill in the fields below. Review and edit before generating.
              </p>
              {autofillError && <p className="mt-1.5 text-xs text-red-600">{autofillError}</p>}
            </div>

            <Field
              label="Business type"
              value={business.businessType}
              onChange={(v) => setBusiness({ ...business, businessType: v })}
              onBlur={() => markTouched("businessType")}
              error={showError("businessType")}
              placeholder="e.g. Bookkeeping for small agencies"
            />
            <Field
              label="Audience"
              value={business.audience}
              onChange={(v) => setBusiness({ ...business, audience: v })}
              onBlur={() => markTouched("audience")}
              error={showError("audience")}
              placeholder="Who you serve"
            />
            <Field
              label="Service"
              value={business.service}
              onChange={(v) => setBusiness({ ...business, service: v })}
              onBlur={() => markTouched("service")}
              error={showError("service")}
              placeholder="What you do for them"
              textarea
            />
            <Field
              label="Problem"
              value={business.problem}
              onChange={(v) => setBusiness({ ...business, problem: v })}
              onBlur={() => markTouched("problem")}
              error={showError("problem")}
              placeholder="The problem you solve"
              textarea
            />
            <Field
              label="Goal"
              value={business.goal}
              onChange={(v) => setBusiness({ ...business, goal: v })}
              onBlur={() => markTouched("goal")}
              error={showError("goal")}
              placeholder="What you want customers to do or achieve"
            />
          </fieldset>

          <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-zinc-900">Your details</legend>
            <p className="text-xs text-zinc-500">
              Used in the email and SMS sign-offs. Remove anything you don&apos;t want later.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                value={sender.firstName}
                onChange={(v) => setSender({ ...sender, firstName: v })}
                onBlur={() => markTouched("firstName")}
                error={showError("firstName")}
              />
              <Field
                label="Last name"
                value={sender.lastName}
                onChange={(v) => setSender({ ...sender, lastName: v })}
                onBlur={() => markTouched("lastName")}
                error={showError("lastName")}
              />
            </div>
            <Field
              label="Phone"
              value={sender.phone}
              onChange={(v) => setSender({ ...sender, phone: v })}
              onBlur={() => markTouched("phone")}
              error={showError("phone")}
              placeholder="+1 555 123 4567"
            />
            <Field
              label="Email"
              value={sender.email}
              onChange={(v) => setSender({ ...sender, email: v })}
              onBlur={() => markTouched("email")}
              error={showError("email")}
              placeholder="you@business.com"
            />
          </fieldset>

          <fieldset className="space-y-2 rounded-xl border border-zinc-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-zinc-900">Model</legend>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelId)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            {model === "claude-opus-4-8" ? (
              <p className="text-xs text-zinc-500">Using Opus for higher-quality copy.</p>
            ) : (
              <p className="text-xs text-zinc-500">{opusNote}</p>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate offer kit"}
          </button>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>

        {/* Results */}
        <div>
          {kit ? (
            <ResultsKit kit={kit} />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              {loading
                ? "Writing your positioning kit…"
                : "Fill in your business and details, then generate your kit."}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error: string | null;
  placeholder?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 " +
    (error ? "border-red-400" : "border-zinc-300");

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-700">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={3}
          className={base + " resize-y"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={base}
        />
      )}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

// Turns SDK/network errors into something a non-technical user can act on.
function toReadableError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/401|authentication|invalid x-api-key/i.test(message)) {
    return "Your API key was rejected. Check it under “Change key.”";
  }
  if (/429|rate limit/i.test(message)) {
    return "Anthropic is rate-limiting your key. Wait a moment and try again.";
  }
  if (/credit|billing|quota/i.test(message)) {
    return "Your Anthropic account is out of credit. Add billing in the console, then retry.";
  }
  return message || "Something went wrong. Please try again.";
}
