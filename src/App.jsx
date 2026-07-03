import { useState, useRef, useCallback } from "react";

const VIOLET = "#7C3AED";
const VIOLET_LIGHT = "#EDE9FE";
const VIOLET_MID = "#A78BFA";

const SYSTEM_PROMPT = `You are an expert CV/Resume parser. The user will provide you with raw text extracted from a resume or CV, in any language or format.

Your job is to extract and structure this information into a clean, standardized JSON object.

Return ONLY valid JSON, no markdown, no explanation, no backticks. The structure must be:

{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "summary": "",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": [""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "details": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "languages": []
  },
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ]
}

Rules:
- If a field has no data, use empty string or empty array.
- Preserve original dates as written.
- Separate skills into technical, soft, and languages arrays. If unsure, put in technical.
- For certifications, only include if explicitly mentioned.
- Translate field content to English if the CV is in another language, but preserve proper nouns.
- Make the summary concise (2-3 sentences max) if not present, generate one from the experience.`;

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke={VIOLET_LIGHT} strokeWidth="4" />
        <path d="M44 24a20 20 0 0 0-20-20" stroke={VIOLET} strokeWidth="4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
      <p style={{ color: VIOLET, fontSize: 14, fontWeight: 500, letterSpacing: "0.05em" }}>Analyzing CV…</p>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span style={{
      background: VIOLET_LIGHT, color: VIOLET, borderRadius: 999,
      padding: "3px 10px", fontSize: 13, fontWeight: 500, display: "inline-block"
    }}>{children}</span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: VIOLET, textTransform: "uppercase" }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>
      {children}
    </div>
  );
}

function CVResult({ data, onReset }) {
  const [copied, setCopied] = useState(false);
  const { personalInfo, summary, experience, education, skills, certifications } = data;

  const handleCopy = () => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${personalInfo.name.replace(/\s+/g, "_") || "cv"}_standardized.json`;
    a.click();
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${VIOLET} 0%, #6D28D9 100%)`,
        borderRadius: 16, padding: "28px 32px", marginBottom: 24, color: "#fff"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {personalInfo.name || "—"}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 10, opacity: 0.85, fontSize: 13 }}>
              {personalInfo.email && <span>✉ {personalInfo.email}</span>}
              {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
              {personalInfo.location && <span>📍 {personalInfo.location}</span>}
              {personalInfo.linkedin && <span>in {personalInfo.linkedin}</span>}
              {personalInfo.website && <span>🔗 {personalInfo.website}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCopy} style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer",
              fontSize: 13, fontWeight: 500, backdropFilter: "blur(4px)"
            }}>
              {copied ? "✓ Copied" : "Copy JSON"}
            </button>
            <button onClick={handleDownload} style={{
              background: "#fff", border: "none", color: VIOLET,
              borderRadius: 8, padding: "8px 16px", cursor: "pointer",
              fontSize: 13, fontWeight: 600
            }}>
              Download
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", border: "1px solid #E5E7EB" }}>

        {/* Summary */}
        {summary && (
          <Section title="Summary">
            <p style={{ margin: 0, color: "#374151", lineHeight: 1.7, fontSize: 14 }}>{summary}</p>
          </Section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <Section title="Experience">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{exp.title}</span>
                      {exp.company && <span style={{ color: VIOLET, fontWeight: 500, fontSize: 14 }}> · {exp.company}</span>}
                    </div>
                    <span style={{ color: "#9CA3AF", fontSize: 13 }}>
                      {exp.startDate}{exp.endDate || exp.current ? ` — ${exp.current ? "Present" : exp.endDate}` : ""}
                    </span>
                  </div>
                  {exp.location && <div style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>📍 {exp.location}</div>}
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: "8px 0 0 0", padding: "0 0 0 18px", color: "#374151", fontSize: 14, lineHeight: 1.7 }}>
                      {exp.bullets.filter(b => b).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <Section title="Education">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {education.map((edu, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{edu.degree}</span>
                    {edu.institution && <span style={{ color: "#6B7280", fontSize: 14 }}> · {edu.institution}</span>}
                    {edu.details && <div style={{ color: "#9CA3AF", fontSize: 13, marginTop: 2 }}>{edu.details}</div>}
                  </div>
                  <span style={{ color: "#9CA3AF", fontSize: 13 }}>
                    {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Skills */}
        {(skills?.technical?.length > 0 || skills?.soft?.length > 0 || skills?.languages?.length > 0) && (
          <Section title="Skills">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {skills.technical?.length > 0 && (
                <div>
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 6 }}>TECHNICAL</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skills.technical.map((s, i) => <Tag key={i}>{s}</Tag>)}
                  </div>
                </div>
              )}
              {skills.soft?.length > 0 && (
                <div>
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 6 }}>SOFT SKILLS</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skills.soft.map((s, i) => <Tag key={i}>{s}</Tag>)}
                  </div>
                </div>
              )}
              {skills.languages?.length > 0 && (
                <div>
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 6 }}>LANGUAGES</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skills.languages.map((s, i) => <Tag key={i}>{s}</Tag>)}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Certifications */}
        {certifications?.filter(c => c.name).length > 0 && (
          <Section title="Certifications">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {certifications.filter(c => c.name).map((cert, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: "#374151" }}>
                    <span style={{ fontWeight: 600 }}>{cert.name}</span>
                    {cert.issuer && <span style={{ color: "#9CA3AF" }}> · {cert.issuer}</span>}
                  </span>
                  {cert.date && <span style={{ color: "#9CA3AF", fontSize: 13 }}>{cert.date}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      <button onClick={onReset} style={{
        marginTop: 20, background: "none", border: `1.5px solid ${VIOLET}`, color: VIOLET,
        borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600,
        display: "block", margin: "20px auto 0"
      }}>
        ↑ Parse another CV
      </button>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState("idle"); // idle | loading | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const readFileAsBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Could not read file"));
    r.readAsDataURL(file);
  });

  const readFileAsText = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Could not read file"));
    r.readAsText(file);
  });

  const processFile = async (file) => {
    setState("loading");
    setError("");

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let messages;

      if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
        const base64 = await readFileAsBase64(file);
        const mediaType = file.type || "image/jpeg";
        messages = [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "This is a CV/Resume image. Extract all information and return the structured JSON." }
          ]
        }];
      } else if (ext === "pdf") {
        const base64 = await readFileAsBase64(file);
        messages = [{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: "This is a CV/Resume PDF. Extract all information and return the structured JSON." }
          ]
        }];
      } else {
        // txt, doc-like, or unknown — read as text
        const text = await readFileAsText(file);
        messages = [{
          role: "user",
          content: `Here is the raw CV text:\n\n${text}\n\nExtract all information and return the structured JSON.`
        }];
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || "API error");

      const text = data.content.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setResult(parsed);
      setState("result");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["pdf", "txt", "jpg", "jpeg", "png", "webp"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`File type .${ext} not supported. Use PDF, TXT, or an image.`);
      setState("error");
      return;
    }
    processFile(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div style={{
      minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Nav */}
      <nav style={{
        width: "100%", padding: "18px 32px", display: "flex", alignItems: "center",
        gap: 10, borderBottom: "1px solid #E5E7EB", background: "#fff"
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: VIOLET,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="12" rx="1" fill="white" opacity="0.7" />
            <rect x="9" y="2" width="5" height="8" rx="1" fill="white" />
            <rect x="9" y="12" width="5" height="2" rx="1" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0F0F0F", letterSpacing: "-0.01em" }}>CVform</span>
        <span style={{
          marginLeft: 4, fontSize: 11, background: VIOLET_LIGHT, color: VIOLET,
          borderRadius: 999, padding: "2px 8px", fontWeight: 600
        }}>AI</span>
      </nav>

      <main style={{ width: "100%", maxWidth: 720, padding: "40px 20px 60px" }}>

        {state === "idle" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h1 style={{
                fontSize: 36, fontWeight: 800, color: "#0F0F0F",
                letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.1
              }}>
                Any CV.<br />
                <span style={{ color: VIOLET }}>One standard.</span>
              </h1>
              <p style={{ color: "#6B7280", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                Drop a resume in any format — PDF, image, or text.<br />
                AI extracts and structures it instantly.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? VIOLET : "#D1D5DB"}`,
                borderRadius: 20, padding: "56px 32px", cursor: "pointer",
                background: dragging ? VIOLET_LIGHT : "#fff",
                textAlign: "center", transition: "all 0.2s ease",
                boxShadow: dragging ? `0 0 0 4px ${VIOLET_LIGHT}` : "none"
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16, background: VIOLET_LIGHT,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 16, color: "#111" }}>
                Drop your CV here
              </p>
              <p style={{ margin: 0, color: "#9CA3AF", fontSize: 13 }}>
                or click to browse · PDF, PNG, JPG, TXT
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 32 }}>
              {["Any format", "Any language", "Instant output"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, color: "#9CA3AF", fontSize: 13 }}>
                  <span style={{ color: VIOLET, fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {state === "loading" && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300, animation: "fadeIn 0.3s ease" }}>
            <Spinner />
          </div>
        )}

        {state === "result" && result && (
          <CVResult data={result} onReset={() => { setState("idle"); setResult(null); }} />
        )}

        {state === "error" && (
          <div style={{
            background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 16,
            padding: 24, textAlign: "center", animation: "fadeIn 0.3s ease"
          }}>
            <p style={{ color: "#9F1239", fontWeight: 600, margin: "0 0 8px" }}>Could not process file</p>
            <p style={{ color: "#BE123C", fontSize: 14, margin: "0 0 16px" }}>{error}</p>
            <button onClick={() => setState("idle")} style={{
              background: "#9F1239", color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14
            }}>
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
