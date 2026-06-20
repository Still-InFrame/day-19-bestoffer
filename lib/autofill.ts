import Anthropic from "@anthropic-ai/sdk";
import type { BusinessInput, ModelId } from "./types";

// The model reads the user's website with Anthropic's server-side web tools
// (fetching happens on Anthropic's infrastructure, so there's no browser CORS
// issue) and returns a concise profile to seed the "Your business" fields.
const AUTOFILL_SYSTEM = `You research a service business's website and extract a concise profile to seed a marketing tool.

Use web_fetch to read the homepage and the few most relevant pages (about, services, pricing, contact). Use web_search only if you need to locate the site or fill a clear gap.

Be accurate and specific. Do not invent details the site doesn't support; if something isn't stated, infer the most reasonable answer from what is there and keep it general. Keep each field to one or two plain sentences.

When you have enough, call emit_business_profile exactly once.`;

const EMIT_PROFILE_TOOL: Anthropic.Tool = {
  name: "emit_business_profile",
  description:
    "Return the extracted business profile. Call exactly once when research is complete.",
  input_schema: {
    type: "object",
    properties: {
      businessType: { type: "string", description: "What kind of business this is." },
      audience: { type: "string", description: "Who they serve (their target customer)." },
      service: { type: "string", description: "The core service they provide." },
      problem: { type: "string", description: "The main problem they solve for customers." },
      goal: {
        type: "string",
        description: "What they want a visitor to do or achieve (the desired outcome).",
      },
    },
    required: ["businessType", "audience", "service", "problem", "goal"],
  },
};

// Server-side web tools (fetching runs on Anthropic's side). Capped with
// max_uses to bound how many pages it reads, which bounds token cost.
const WEB_TOOLS = [
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 5 },
  { type: "web_search_20260209", name: "web_search", max_uses: 3 },
] as const;

export interface AutofillArgs {
  apiKey: string;
  model: ModelId;
  url: string;
}

export async function autofillFromWebsite({
  apiKey,
  model,
  url,
}: AutofillArgs): Promise<BusinessInput> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Research this website and extract the business profile: ${url}`,
    },
  ];

  // The web tools resolve server-side within a single response, but a long
  // research run can hit the server-tool iteration cap and return
  // stop_reason "pause_turn". Re-send (no extra user turn) to let it continue
  // until it calls emit_business_profile. The guard caps total round-trips.
  let response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: AUTOFILL_SYSTEM,
    tools: [...WEB_TOOLS, EMIT_PROFILE_TOOL],
    messages,
  });

  for (let i = 0; i < 6; i++) {
    const emit = response.content.find(
      (block): block is Anthropic.ToolUseBlock =>
        block.type === "tool_use" && block.name === "emit_business_profile",
    );
    if (emit) {
      return emit.input as BusinessInput;
    }

    if (response.stop_reason !== "pause_turn") break;

    messages.push({ role: "assistant", content: response.content });
    response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: AUTOFILL_SYSTEM,
      tools: [...WEB_TOOLS, EMIT_PROFILE_TOOL],
      messages,
    });
  }

  throw new Error(
    "Couldn't read enough from that site. Check the URL, or fill the fields in manually.",
  );
}
