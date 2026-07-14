import { SYSTEM_PROMPT } from "./prompts";
import { toBase64, toText, extractPdfText } from "./fileUtils";

export async function parseCV(file) {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key || key === "your_openrouter_api_key_here") {
    throw new Error("OpenRouter API key is not configured. Set VITE_OPENROUTER_API_KEY in .env");
  }

  const ext = file.name.split(".").pop().toLowerCase();
  let content;

  if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
    const b64 = await toBase64(file);
    const mime = file.type || "image/jpeg";
    content = [
      { type: "text", text: "Parse this CV image and return the JSON." },
      { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
    ];
  } else if (ext === "pdf") {
    const text = await extractPdfText(file);
    content = `Parse this CV and return the JSON:\n\n${text}`;
  } else {
    const text = await toText(file);
    content = `Parse this CV and return the JSON:\n\n${text}`;
  }

  const base = import.meta.env.DEV
    ? "/api/openrouter"
    : "https://openrouter.ai";

  const res = await fetch(`${base}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://cv-parser.app",
      "X-Title": "CV Parser",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      max_tokens: 8192,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const detail = data.error?.message || data.error?.code || JSON.stringify(data.error);
    throw new Error(`Provider error: ${detail}`);
  }

  const msg = data.choices?.[0]?.message;
  let raw = msg?.content?.replace(/```json|```/g, "").trim();
  if (!raw && msg?.reasoning) {
    const match = msg.reasoning.match(/\{[\s\S]*\}/);
    if (match) raw = match[0].replace(/```json|```/g, "").trim();
  }
  if (!raw) throw new Error("Empty response from API");

  return JSON.parse(raw);
}
