import type { OfferKit } from "./types";

// Serialize the kit to Markdown for the "Copy all" / export action, so the
// user can drop the whole thing into another LLM or doc.
export function kitToMarkdown(kit: OfferKit): string {
  const lines: string[] = [];

  lines.push("# Offer Positioning Kit", "");

  lines.push("## Ideal Customer", "", kit.idealCustomer, "");
  lines.push("## Core Problem", "", kit.coreProblem, "");
  lines.push("## Clear Offer", "", kit.clearOffer, "");
  lines.push("## Homepage Headline", "", kit.homepageHeadline, "");
  lines.push("## Call to Action", "", kit.cta, "");

  lines.push("## Email Sequence", "");
  kit.emailSequence.forEach((email, i) => {
    lines.push(`### Email ${i + 1}: ${email.subject}`, "", email.body, "");
  });

  lines.push("## SMS Sequence", "");
  kit.smsSequence.forEach((sms, i) => {
    lines.push(`${i + 1}. ${sms}`);
  });
  lines.push("");

  lines.push("## Ad Hooks", "");
  kit.adHooks.forEach((hook, i) => {
    lines.push(`${i + 1}. ${hook}`);
  });
  lines.push("");

  return lines.join("\n").trim() + "\n";
}
