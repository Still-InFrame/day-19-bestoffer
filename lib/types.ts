// Shared types for the offer positioning kit.

export type ModelId = "claude-sonnet-4-6" | "claude-opus-4-8";

export const MODELS: { id: ModelId; label: string; note?: string }[] = [
  { id: "claude-sonnet-4-6", label: "Sonnet — fast, lower cost" },
  {
    id: "claude-opus-4-8",
    label: "Opus — highest quality",
    note: "Recommended for higher-quality copy. Costs more.",
  },
];

// What the user tells us about their business.
export interface BusinessInput {
  businessType: string;
  audience: string;
  service: string;
  problem: string;
  goal: string;
}

// The sender's own details, woven into the email/SMS templates.
export interface SenderInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface EmailMessage {
  subject: string;
  body: string;
}

// The structured kit the model returns via the emit_offer_kit tool.
export interface OfferKit {
  idealCustomer: string;
  coreProblem: string;
  clearOffer: string;
  homepageHeadline: string;
  cta: string;
  emailSequence: EmailMessage[];
  smsSequence: string[];
  adHooks: string[];
}
