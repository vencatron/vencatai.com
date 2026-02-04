const CLAUDE_ENDPOINT = "https://api.anthropic.com/v1/messages";
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export type SourceChunk = { url: string; title: string; content: string };

export function trimContent(content: string, maxChars: number) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= maxChars) return compact;
  return `${compact.slice(0, maxChars)}...`;
}

export function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

export function buildPrompt({
  goal,
  mode,
  sources,
}: {
  goal: string;
  mode: "executive" | "thorough";
  sources: SourceChunk[];
}) {
  const limits =
    mode === "thorough"
      ? {
          keyFacts: 12,
          pricing: 10,
          claims: 12,
          faqs: 10,
          trust: 10,
          risks: 6,
        }
      : {
          keyFacts: 6,
          pricing: 5,
          claims: 6,
          faqs: 5,
          trust: 5,
          risks: 3,
        };

  const schema = {
    title: "string",
    one_liner: "string",
    executive_summary: "string",
    key_facts: [
      {
        label: "string",
        value: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    pricing_offers: [
      {
        plan: "string",
        price: "string",
        notes: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    claims_proof: [
      {
        claim: "string",
        proof: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    faqs_policies: [
      {
        question: "string",
        answer: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    trust_signals: [
      {
        signal: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    risks_gaps: ["string"],
    sources: [
      {
        url: "string",
        title: "string",
      },
    ],
  };

  const sourceBlocks = sources
    .map(
      (source, index) =>
        `[Source ${index + 1}] URL: ${source.url}\nTitle: ${
          source.title || "Untitled"
        }\nContent: ${source.content}`,
    )
    .join("\n\n");

  return `You are Web Flayer, an analyst who produces non-technical briefs.
Use only the provided sources. If a field is missing, write "Not found".
Return ONLY valid JSON. No markdown, no commentary.

Goal focus: ${goal}
Mode: ${mode}

Hard limits:
- key_facts: max ${limits.keyFacts}
- pricing_offers: max ${limits.pricing}
- claims_proof: max ${limits.claims}
- faqs_policies: max ${limits.faqs}
- trust_signals: max ${limits.trust}
- risks_gaps: max ${limits.risks}

Evidence rules:
- evidence must be a short snippet (max 25 words) from the source.
- every fact or claim must include a source_url and evidence.

JSON schema (types only):
${JSON.stringify(schema, null, 2)}

Sources:
${sourceBlocks}`;
}

export async function callClaude({
  prompt,
  maxTokens,
  model,
  apiKey,
}: {
  prompt: string;
  maxTokens: number;
  model: string;
  apiKey: string;
}) {
  const response = await fetch(CLAUDE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return { ok: false, data };
  }
  const text = Array.isArray(data?.content)
    ? data.content
        .map((item: any) => (typeof item?.text === "string" ? item.text : ""))
        .join("\n")
        .trim()
    : "";

  return { ok: true, data: { text } };
}
