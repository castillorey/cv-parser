import { toBase64, toText, extractPdfText } from "./fileUtils";

const EDGE_FUNCTION_URL =
  "https://useejgiprosrfiabgukn.supabase.co/functions/v1/parse-cv";

export async function parseCV(file) {
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

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.error || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  const raw = await res.text();
  if (!raw) throw new Error("Empty response from server");
  return JSON.parse(raw);
}
