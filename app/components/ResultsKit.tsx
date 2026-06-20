"use client";

import type { OfferKit } from "@/lib/types";
import { kitToMarkdown } from "@/lib/markdown";
import CopyButton from "./CopyButton";

function Card({
  title,
  copyText,
  children,
}: {
  title: string;
  copyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
        <CopyButton text={copyText} />
      </div>
      <div className="mt-3 text-zinc-900">{children}</div>
    </section>
  );
}

export default function ResultsKit({ kit }: { kit: OfferKit }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900">Your offer positioning kit</h2>
        <CopyButton
          text={kitToMarkdown(kit)}
          label="Copy all (Markdown)"
          className="border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
        />
      </div>

      <Card title="Ideal customer" copyText={kit.idealCustomer}>
        <p className="whitespace-pre-line leading-relaxed">{kit.idealCustomer}</p>
      </Card>

      <Card title="Core problem" copyText={kit.coreProblem}>
        <p className="whitespace-pre-line leading-relaxed">{kit.coreProblem}</p>
      </Card>

      <Card title="Clear offer" copyText={kit.clearOffer}>
        <p className="whitespace-pre-line leading-relaxed">{kit.clearOffer}</p>
      </Card>

      <Card title="Homepage headline" copyText={kit.homepageHeadline}>
        <p className="text-lg font-medium leading-snug">{kit.homepageHeadline}</p>
      </Card>

      <Card title="Call to action" copyText={kit.cta}>
        <p className="font-medium">{kit.cta}</p>
      </Card>

      <Card
        title="Email sequence"
        copyText={kit.emailSequence
          .map((e, i) => `Email ${i + 1}: ${e.subject}\n\n${e.body}`)
          .join("\n\n---\n\n")}
      >
        <div className="space-y-4">
          {kit.emailSequence.map((email, i) => (
            <div key={i} className="rounded-lg bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Email {i + 1}
              </p>
              <p className="mt-1 font-medium text-zinc-900">{email.subject}</p>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-zinc-700">{email.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="SMS sequence" copyText={kit.smsSequence.join("\n\n")}>
        <div className="space-y-3">
          {kit.smsSequence.map((sms, i) => (
            <div key={i} className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                SMS {i + 1}
              </p>
              <p className="mt-1 whitespace-pre-line text-zinc-700">{sms}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Ad hooks" copyText={kit.adHooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}>
        <ol className="list-decimal space-y-2 pl-5">
          {kit.adHooks.map((hook, i) => (
            <li key={i} className="leading-relaxed text-zinc-700">
              {hook}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
