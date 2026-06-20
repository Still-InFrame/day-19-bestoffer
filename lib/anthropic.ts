import Anthropic from "@anthropic-ai/sdk";
import type { BusinessInput, ModelId, OfferKit, SenderInput } from "./types";

// The marketing-strategist persona. Mirrors the original brief: clear, direct,
// human, no hype. Extended to weave the sender's contact details into the
// email/SMS copy so the kit is ready to use.
const SYSTEM_PROMPT = `You are a marketing strategist for service-based businesses.

Given a business's details, create a clear offer positioning kit. Write in a clear, direct, human tone. Avoid hype, buzzwords, and exclamation-point energy. Be specific and concrete.

Weave the sender's contact details into the deliverables where it reads naturally:
- Each email ends with a plain sign-off using the sender's full name, then their email and phone on separate lines.
- Each SMS is signed with the sender's first name; include the phone only where it genuinely helps (e.g. a "call/text" line). Keep each SMS around 160 characters.

Return everything through the emit_offer_kit tool. Do not write any prose outside the tool call.`;

// One tool, forced, so the model must return well-formed JSON.
const OFFER_KIT_TOOL: Anthropic.Tool = {
  name: "emit_offer_kit",
  description:
    "Return the complete offer positioning kit as structured data. All fields are required.",
  input_schema: {
    type: "object",
    properties: {
      idealCustomer: {
        type: "string",
        description: "The ideal customer profile: who they are and what defines them.",
      },
      coreProblem: {
        type: "string",
        description: "The core problem this business solves, in the customer's own terms.",
      },
      clearOffer: {
        type: "string",
        description: "A single, clear offer: what the customer gets and the outcome.",
      },
      homepageHeadline: {
        type: "string",
        description: "One homepage headline. Plain and direct, no hype.",
      },
      cta: {
        type: "string",
        description: "A single call-to-action line for a button or link.",
      },
      emailSequence: {
        type: "array",
        description: "Exactly 3 follow-up emails around the offer.",
        items: {
          type: "object",
          properties: {
            subject: { type: "string", description: "Email subject line." },
            body: {
              type: "string",
              description: "Email body, ending with the sender's sign-off and contact details.",
            },
          },
          required: ["subject", "body"],
        },
      },
      smsSequence: {
        type: "array",
        description: "Exactly 3 SMS messages around the offer, each ~160 characters, signed by the sender.",
        items: { type: "string" },
      },
      adHooks: {
        type: "array",
        description: "Exactly 3 ad hooks the business can use.",
        items: { type: "string" },
      },
    },
    required: [
      "idealCustomer",
      "coreProblem",
      "clearOffer",
      "homepageHeadline",
      "cta",
      "emailSequence",
      "smsSequence",
      "adHooks",
    ],
  },
};

function buildUserPrompt(business: BusinessInput, sender: SenderInput): string {
  return `Create the offer positioning kit for this business.

Business type: ${business.businessType}
Audience: ${business.audience}
Service: ${business.service}
Problem: ${business.problem}
Goal: ${business.goal}

Sender (use in email/SMS sign-offs):
Name: ${sender.firstName} ${sender.lastName}
Email: ${sender.email}
Phone: ${sender.phone}`;
}

export interface GenerateArgs {
  apiKey: string;
  model: ModelId;
  business: BusinessInput;
  sender: SenderInput;
}

// Calls Anthropic directly from the browser. The key never leaves the user's
// machine except to Anthropic's API — see dangerouslyAllowBrowser note in the
// onboarding copy.
export async function generateKit({
  apiKey,
  model,
  business,
  sender,
}: GenerateArgs): Promise<OfferKit> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [OFFER_KIT_TOOL],
    tool_choice: { type: "tool", name: "emit_offer_kit" },
    messages: [{ role: "user", content: buildUserPrompt(business, sender) }],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUse) {
    throw new Error("The model did not return a structured kit. Please try again.");
  }

  return toolUse.input as OfferKit;
}
