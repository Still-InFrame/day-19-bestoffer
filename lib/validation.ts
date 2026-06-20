// Plain field validators shared by the generator form. Each returns an
// error string, or null when the value is acceptable.

export function required(value: string, label: string): string | null {
  return value.trim().length === 0 ? `${label} is required.` : null;
}

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (v.length === 0) return "Email is required.";
  // Pragmatic check: something@something.tld — not RFC-exhaustive on purpose.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email address.";
}

export function validatePhone(value: string): string | null {
  const v = value.trim();
  if (v.length === 0) return "Phone number is required.";
  // Allow digits, spaces, and common separators; require at least 7 digits.
  const digits = v.replace(/\D/g, "");
  if (!/^[+\d][\d\s().-]*$/.test(v) || digits.length < 7) {
    return "Enter a valid phone number.";
  }
  return null;
}

// An Anthropic key looks like sk-ant-...  Used only to gate the UI, not to
// guarantee the key works (that's confirmed by the first real API call).
export function looksLikeAnthropicKey(value: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(value.trim());
}

// Accepts a bare domain ("acme.com") or a full URL and returns a normalized
// https URL, or null if it doesn't look like a domain at all.
export function normalizeUrl(value: string): string | null {
  const v = value.trim();
  if (v.length === 0) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    // Require a dotted hostname so plain words aren't treated as sites.
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
