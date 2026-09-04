import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SYSTEM_PROMPT = `You are an expert CV/Resume parser and standardizer.

Parse the provided CV/Resume (in any language or format) and return ONLY a valid JSON object — no markdown, no backticks, no explanation.

Always translate content to English, preserving proper nouns (company names, universities, tools).

JSON structure (strict — do not add or remove keys):

{
  "name": "",
  "title": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": "",
  "spokenLanguages": ["English - Advanced", "Spanish - Native"],
  "skills": [],
  "education": [
    { "degree": "", "institution": "", "year": "" }
  ],
  "certifications": [
    { "name": "", "issuer": "", "year": "" }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "from": "",
      "to": "",
      "responsibilities": [""]
    }
  ]
}

Rules:
- skills: a flat array of all tools, software, platforms, and technical skills. Each item is a short string.
- spokenLanguages: format as "Language - Level" (e.g. "English - Advanced").
- education: degree name + institution + graduation year (or year range).
- certifications: only if explicitly mentioned. Empty array [] if none.
- experience: list responsibilities as bullet strings starting with an action verb. Include ALL jobs found.
- title: infer from most recent role if not stated.
- Dates: use "Month YYYY" format. Use "Present" for current roles.
- Empty fields: use "" or []. Never null.`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
};

const json = (body: unknown, status: number, extra?: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extra,
    },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) {
    return json(
      { error: "OpenRouter API key is not configured on the server." },
      500
    );
  }

  let body: { content?: unknown; model?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.content) {
    return json({ error: "Missing content" }, 400);
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://cv-parser.app",
      "X-Title": "CV Parser",
    },
    body: JSON.stringify({
      model: body.model || "openrouter/free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: body.content },
      ],
      max_tokens: 8192,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const detail = data.error?.message || data.error?.code || JSON.stringify(data.error);
    return json({ error: `Provider error: ${detail}` }, res.status || 502);
  }

  const msg = data.choices?.[0]?.message;
  let raw = msg?.content?.replace(/```json|```/g, "").trim();
  if (!raw && msg?.reasoning) {
    const match = msg.reasoning.match(/\{[\s\S]*\}/);
    if (match) raw = match[0].replace(/```json|```/g, "").trim();
  }
  if (!raw) {
    return json({ error: "Empty response from API" }, 502);
  }

  return new Response(raw, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
});
