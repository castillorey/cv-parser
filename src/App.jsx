import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const VIOLET = "#7C3AED";
const VIOLET_LIGHT = "#EDE9FE";

// ─── System Prompt ─────────────────────────────────────────────────────────
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

// ─── PDF Generator (matches Salvatech 2-column layout) ───────────────────
function generatePDF(cv) {
  const e = s => (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const leftBg = "linear-gradient(180deg, #7C3AED 0%, #C4B5FD 55%, #EDE9FE 100%)";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${e(cv.name)} - CV</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Inter', Arial, sans-serif; background:#fff; color:#111; font-size:10px; }
  .page { display:flex; min-height:100vh; width:100%; }

  /* LEFT COLUMN */
  .left { width:220px; flex-shrink:0; background:${leftBg}; padding:0 0 40px 0; display:flex; flex-direction:column; }
  .left-top { background:#111; height:48px; }
  .avatar-wrap { padding:24px 20px 20px; }
  .avatar { width:90px; height:90px; border-radius:50%; background:${VIOLET}; border:3px solid rgba(255,255,255,0.4); display:flex; align-items:center; justify-content:center; margin-bottom:0; }
  .avatar svg { width:48px; height:48px; opacity:0.9; }
  .left-section { padding:18px 20px 0; }
  .left-section-title { font-size:10px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#111; display:flex; align-items:center; gap:6px; margin-bottom:10px; }
  .left-section-title svg { flex-shrink:0; }
  .left-list { list-style:disc; padding-left:14px; }
  .left-list li { font-size:9.5px; color:#1F1F1F; margin-bottom:4px; line-height:1.5; }
  .divider-left { height:1px; background:rgba(0,0,0,0.1); margin:16px 20px 0; }

  /* RIGHT COLUMN */
  .right { flex:1; display:flex; flex-direction:column; }
  .right-top { background:#111; height:48px; }
  .right-header { padding:20px 28px 16px; border-bottom:1px solid #E5E7EB; }
  .right-name { font-size:28px; font-weight:800; color:${VIOLET}; letter-spacing:-0.02em; line-height:1; }
  .right-title { font-size:13px; font-weight:400; color:#111; margin-top:4px; }
  .right-contact { display:flex; flex-wrap:wrap; gap:4px 16px; margin-top:8px; }
  .right-contact span { font-size:9px; color:#666; }
  .right-body { padding:20px 28px; flex:1; }
  .section { margin-bottom:20px; }
  .section-head { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .section-icon { width:32px; height:32px; border-radius:50%; background:${VIOLET}; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .section-icon svg { width:16px; height:16px; }
  .section-title { font-size:14px; font-weight:700; color:#111; border-bottom:2px solid ${VIOLET}; padding-bottom:2px; flex:1; }
  .edu-degree { font-weight:700; font-size:10px; }
  .edu-inst { font-size:9.5px; color:#444; }
  .cert-title { font-size:9.5px; font-weight:600; color:#111; }
  .exp-company { font-weight:700; font-size:10.5px; color:#111; margin-bottom:1px; }
  .exp-role { font-weight:700; font-size:10px; color:#111; }
  .exp-date { font-size:9.5px; color:#555; margin-bottom:2px; }
  .exp-resp-label { font-size:9.5px; font-weight:700; margin:4px 0 3px; }
  .exp-list { padding-left:12px; margin-bottom:12px; }
  .exp-list li { font-size:9.5px; color:#333; margin-bottom:2.5px; line-height:1.5; }
  .footer { padding:10px 28px; display:flex; justify-content:flex-end; border-top:3px solid; border-image: linear-gradient(90deg, #7C3AED, #06B6D4, #10B981) 1; }
  .footer-brand { font-size:12px; font-weight:800; color:#111; letter-spacing:-0.02em; display:flex; align-items:center; gap:4px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { min-height:100vh; }
  }
</style>
</head><body>
<div class="page">

  <!-- LEFT -->
  <div class="left">
    <div class="left-top"></div>
    <div class="avatar-wrap">
      <div class="avatar">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="18" r="9" fill="white" opacity="0.85"/>
          <path d="M6 42c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="white" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
        </svg>
      </div>
    </div>

    ${cv.spokenLanguages?.length ? `
    <div class="left-section">
      <div class="left-section-title">
        <svg viewBox="0 0 16 16" fill="none" stroke="#111" stroke-width="1.5" width="13" height="13"><circle cx="8" cy="8" r="6.5"/><path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13"/></svg>
        Languages
      </div>
      <ul class="left-list">${cv.spokenLanguages.map(l=>`<li>${e(l)}</li>`).join("")}</ul>
    </div>
    <div class="divider-left"></div>` : ""}

    ${cv.skills?.length ? `
    <div class="left-section">
      <div class="left-section-title">
        <svg viewBox="0 0 16 16" fill="none" stroke="#111" stroke-width="1.5" width="13" height="13"><path d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8z"/><path d="M8 5v3l2 2"/></svg>
        Skills
      </div>
      <ul class="left-list">${cv.skills.map(s=>`<li>${e(s)}</li>`).join("")}</ul>
    </div>` : ""}
  </div>

  <!-- RIGHT -->
  <div class="right">
    <div class="right-top"></div>
    <div class="right-header">
      <div class="right-name">${e(cv.name)}</div>
      <div class="right-title">${e(cv.title)}</div>
      ${(cv.email||cv.phone||cv.location||cv.linkedin) ? `
      <div class="right-contact">
        ${cv.email?`<span>✉ ${e(cv.email)}</span>`:""}
        ${cv.phone?`<span>📱 ${e(cv.phone)}</span>`:""}
        ${cv.location?`<span>📍 ${e(cv.location)}</span>`:""}
        ${cv.linkedin?`<span>in ${e(cv.linkedin)}</span>`:""}
      </div>` : ""}
    </div>

    <div class="right-body">

      <!-- Education -->
      ${cv.education?.length ? `
      <div class="section">
        <div class="section-head">
          <div class="section-icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M2 6l6-4 6 4-6 4-6-4z"/><path d="M5 8v4c0 1 1.5 2 3 2s3-1 3-2V8"/><path d="M14 6v4"/></svg>
          </div>
          <div class="section-title">Education</div>
        </div>
        ${cv.education.map(ed=>`
        <div style="margin-bottom:8px; padding-left:42px;">
          <div class="edu-degree">${e(ed.degree)}</div>
          <div class="edu-inst">${e(ed.institution)}${ed.year?` - ${e(ed.year)}`:""}</div>
        </div>`).join("")}

        ${cv.certifications?.filter(c=>c.name).length ? `
        <div style="padding-left:42px; margin-top:10px;">
          <div style="font-size:9.5px; font-weight:800; text-decoration:underline; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.06em;">Certifications:</div>
          <ul class="left-list" style="padding-left:12px;">
            ${cv.certifications.filter(c=>c.name).map(c=>`<li class="cert-title">${e(c.name)}${c.issuer?` - ${e(c.issuer)}`:""}${c.year?` - ${e(c.year)}`:""}</li>`).join("")}
          </ul>
        </div>` : ""}
      </div>` : ""}

      <!-- Work Experience -->
      ${cv.experience?.length ? `
      <div class="section">
        <div class="section-head">
          <div class="section-icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="5" width="14" height="10" rx="1.5"/><path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5"/><line x1="8" y1="9" x2="8" y2="9"/></svg>
          </div>
          <div class="section-title">Work Experience</div>
        </div>
        ${cv.experience.map(ex=>`
        <div style="padding-left:42px; margin-bottom:14px;">
          <div class="exp-company">${e(ex.company)}</div>
          <div class="exp-role">Position: ${e(ex.role)}</div>
          <div class="exp-date">Date: ${e(ex.from)} – ${e(ex.to)}</div>
          <div class="exp-resp-label">Responsibilities:</div>
          <ul class="exp-list">
            ${(ex.responsibilities||[]).filter(r=>r).map(r=>`<li>${e(r)}</li>`).join("")}
          </ul>
        </div>`).join("")}
      </div>` : ""}

    </div>

    <div class="footer">
      <div class="footer-brand">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="#7C3AED"/>
        </svg>
        CVform.
      </div>
    </div>
  </div>
</div>
</body></html>`;
  return html;
}

// ─── UI Components ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="18" stroke={VIOLET_LIGHT} strokeWidth="3.5"/>
        <path d="M40 22a18 18 0 0 0-18-18" stroke={VIOLET} strokeWidth="3.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.75s" repeatCount="indefinite"/>
        </path>
      </svg>
      <p style={{ color:VIOLET, fontSize:12, fontWeight:700, letterSpacing:"0.08em", margin:0 }}>PARSING CV…</p>
    </div>
  );
}

function CVPreview({ cv }) {
  const leftGrad = "linear-gradient(180deg, #7C3AED 0%, #C4B5FD 55%, #EDE9FE 100%)";
  return (
    <div style={{ display:"flex", borderRadius:14, overflow:"hidden", border:"1px solid #E5E7EB", boxShadow:"0 4px 24px rgba(124,58,237,0.10)", fontFamily:"'Inter',system-ui,sans-serif", fontSize:12 }}>

      {/* LEFT */}
      <div style={{ width:200, flexShrink:0, background:leftGrad, display:"flex", flexDirection:"column" }}>
        <div style={{ height:36, background:"#111" }}/>
        <div style={{ padding:"18px 16px 10px" }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:VIOLET, border:"2.5px solid rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="9" fill="white" opacity="0.85"/>
              <path d="M6 42c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85"/>
            </svg>
          </div>
        </div>

        {cv.spokenLanguages?.length > 0 && (
          <div style={{ padding:"0 16px 0" }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:"#111", marginBottom:7, display:"flex", alignItems:"center", gap:5 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#111" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13"/></svg>
              Languages
            </div>
            <ul style={{ paddingLeft:13, margin:0 }}>
              {cv.spokenLanguages.map((l,i) => <li key={i} style={{ fontSize:10, color:"#1F1F1F", marginBottom:4, lineHeight:1.5 }}>{l}</li>)}
            </ul>
            <div style={{ height:1, background:"rgba(0,0,0,0.1)", margin:"12px 0" }}/>
          </div>
        )}

        {cv.skills?.length > 0 && (
          <div style={{ padding:"0 16px", flex:1 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:"#111", marginBottom:7, display:"flex", alignItems:"center", gap:5 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#111" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 5v3l2 2"/></svg>
              Skills
            </div>
            <ul style={{ paddingLeft:13, margin:0 }}>
              {cv.skills.map((s,i) => <li key={i} style={{ fontSize:9.5, color:"#1F1F1F", marginBottom:3.5, lineHeight:1.5 }}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#fff" }}>
        <div style={{ height:36, background:"#111" }}/>

        {/* Name / Title */}
        <div style={{ padding:"16px 22px 12px", borderBottom:"1px solid #E5E7EB" }}>
          <div style={{ fontSize:22, fontWeight:800, color:VIOLET, letterSpacing:"-0.02em", lineHeight:1 }}>{cv.name || "—"}</div>
          <div style={{ fontSize:12, color:"#111", marginTop:3 }}>{cv.title}</div>
          {(cv.email || cv.phone || cv.location || cv.linkedin) && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 14px", marginTop:7, fontSize:10, color:"#666" }}>
              {cv.email && <span>✉ {cv.email}</span>}
              {cv.phone && <span>📱 {cv.phone}</span>}
              {cv.location && <span>📍 {cv.location}</span>}
              {cv.linkedin && <span>in {cv.linkedin}</span>}
            </div>
          )}
        </div>

        <div style={{ padding:"16px 22px", flex:1 }}>

          {/* Education */}
          {cv.education?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:VIOLET, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6l6-4 6 4-6 4-6-4z"/><path d="M5 8v3c0 1 1.5 2 3 2s3-1 3-2V8"/></svg>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:"#111", borderBottom:`2px solid ${VIOLET}`, paddingBottom:2, flex:1 }}>Education</span>
              </div>
              {cv.education.map((ed,i) => (
                <div key={i} style={{ paddingLeft:36, marginBottom:7 }}>
                  <div style={{ fontWeight:700, fontSize:10.5 }}>{ed.degree}</div>
                  <div style={{ fontSize:10, color:"#444" }}>{ed.institution}{ed.year ? ` - ${ed.year}` : ""}</div>
                </div>
              ))}
              {cv.certifications?.filter(c=>c.name).length > 0 && (
                <div style={{ paddingLeft:36, marginTop:10 }}>
                  <div style={{ fontSize:9.5, fontWeight:800, textDecoration:"underline", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Certifications:</div>
                  <ul style={{ paddingLeft:13, margin:0 }}>
                    {cv.certifications.filter(c=>c.name).map((c,i) => (
                      <li key={i} style={{ fontSize:9.5, marginBottom:3, lineHeight:1.5 }}>
                        {c.name}{c.issuer ? ` - ${c.issuer}` : ""}{c.year ? ` - ${c.year}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Work Experience */}
          {cv.experience?.length > 0 && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:VIOLET, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="5" width="14" height="10" rx="1.5"/><path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5"/></svg>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:"#111", borderBottom:`2px solid ${VIOLET}`, paddingBottom:2, flex:1 }}>Work Experience</span>
              </div>
              {cv.experience.map((ex,i) => (
                <div key={i} style={{ paddingLeft:36, marginBottom:14 }}>
                  <div style={{ fontWeight:700, fontSize:11 }}>{ex.company}</div>
                  <div style={{ fontWeight:700, fontSize:10.5 }}>Position: {ex.role}</div>
                  <div style={{ fontSize:10, color:"#555", marginBottom:3 }}>Date: {ex.from} – {ex.to}</div>
                  <div style={{ fontSize:10, fontWeight:700, marginBottom:3 }}>Responsibilities:</div>
                  <ul style={{ paddingLeft:13, margin:0 }}>
                    {(ex.responsibilities||[]).filter(r=>r).map((r,j) => (
                      <li key={j} style={{ fontSize:9.5, color:"#333", marginBottom:3, lineHeight:1.55 }}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"10px 22px", display:"flex", justifyContent:"flex-end", borderTop:"3px solid", borderImage:"linear-gradient(90deg,#7C3AED,#06B6D4,#10B981) 1" }}>
          <span style={{ fontSize:12, fontWeight:800, color:"#111", letterSpacing:"-0.01em" }}>CVform.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("upload");
  const [cv, setCv] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const toBase64 = f => new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=()=>rej(new Error("Read failed")); r.readAsDataURL(f); });
  const toText   = f => new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(new Error("Read failed")); r.readAsText(f); });
  const extractPdfText = async (file) => {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text="";
    for (let i=1; i<=pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const c = await page.getTextContent();
      text += c.items.map(i=>i.str).join(" ") + "\n";
    }
    return text;
  };

  const process = async (file) => {
    setPhase("loading");
    try {
      const key = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!key || key === "your_openrouter_api_key_here") {
        throw new Error("OpenRouter API key is not configured. Set VITE_OPENROUTER_API_KEY in .env");
      }
      const ext = file.name.split(".").pop().toLowerCase();
      let content;
      if (["jpg","jpeg","png","webp"].includes(ext)) {
        const b64 = await toBase64(file);
        const mime = file.type || "image/jpeg";
        content = [
          { type:"text", text:"Parse this CV image and return the JSON." },
          { type:"image_url", image_url:{ url:`data:${mime};base64,${b64}` } }
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
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${key}`,
          "HTTP-Referer":"https://cv-parser.app",
          "X-Title":"CV Parser"
        },
        body: JSON.stringify({
          model:"openrouter/free",
          messages:[
            { role:"system", content:SYSTEM_PROMPT },
            { role:"user", content }
          ],
          max_tokens:8192
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.error?.message || data.error?.code || JSON.stringify(data.error);
        throw new Error(`Provider error: ${detail}`);
      }
      const msg = data.choices?.[0]?.message;
      let raw = msg?.content?.replace(/```json|```/g,"").trim();
      if (!raw && msg?.reasoning) {
        const m = msg.reasoning.match(/\{[\s\S]*\}/);
        if (m) raw = m[0].replace(/```json|```/g,"").trim();
      }
      if (!raw) throw new Error("Empty response from API");
      setCv(JSON.parse(raw));
      setPhase("result");
    } catch(err) {
      setErrMsg(err.message || "Unknown error");
      setPhase("error");
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf","txt","jpg","jpeg","png","webp"].includes(ext)) {
      setErrMsg(`.${ext} not supported. Use PDF, image, or TXT.`);
      setPhase("error"); return;
    }
    process(file);
  };

  const downloadPDF = () => {
    const html = generatePDF(cv);
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 900);
  };

  const downloadJSON = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(cv,null,2)],{type:"application/json"}));
    a.download = `${(cv.name||"cv").replace(/\s+/g,"_")}.json`;
    a.click();
  };

  const copyJSON = () => { navigator.clipboard.writeText(JSON.stringify(cv,null,2)); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const reset = () => { setCv(null); setErrMsg(""); setPhase("upload"); };

  return (
    <div style={{ minHeight:"100vh", background:"#F8F7FF", fontFamily:"'Inter',system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        button:hover { opacity:0.88; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding:"14px 28px", display:"flex", alignItems:"center", gap:9, background:"#fff", borderBottom:"1px solid #E5E7EB" }}>
        <div style={{ width:28, height:28, borderRadius:6, background:VIOLET, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="12" rx="1" fill="white" opacity="0.7"/><rect x="9" y="2" width="5" height="8" rx="1" fill="white"/><rect x="9" y="12" width="5" height="2" rx="1" fill="white" opacity="0.5"/></svg>
        </div>
        <span style={{ fontWeight:800, fontSize:14, color:"#0F0F0F", letterSpacing:"-0.01em" }}>CVform</span>
        <span style={{ fontSize:10, background:VIOLET_LIGHT, color:VIOLET, borderRadius:999, padding:"2px 7px", fontWeight:700 }}>AI</span>
      </nav>

      <main style={{ flex:1, width:"100%", maxWidth:860, margin:"0 auto", padding:"36px 20px 60px" }}>

        {phase === "upload" && (
          <div style={{ animation:"fadeUp 0.35s ease" }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <h1 style={{ fontSize:30, fontWeight:800, color:"#0F0F0F", letterSpacing:"-0.03em", margin:"0 0 10px", lineHeight:1.1 }}>
                Drop any CV.<br/><span style={{ color:VIOLET }}>Get one standard.</span>
              </h1>
              <p style={{ color:"#6B7280", fontSize:14, margin:0, lineHeight:1.65 }}>
                Any language, any layout. AI extracts and structures it into a clean, consistent format.
              </p>
            </div>
            <div
              onDrop={e=>{ e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e=>{ e.preventDefault(); setDragging(true); }}
              onDragLeave={()=>setDragging(false)}
              onClick={()=>fileRef.current.click()}
              style={{ border:`2px dashed ${dragging?VIOLET:"#C4B5FD"}`, borderRadius:18, padding:"52px 32px", cursor:"pointer", textAlign:"center", background:dragging?VIOLET_LIGHT:"#fff", transition:"all 0.18s ease", boxShadow:dragging?`0 0 0 5px ${VIOLET_LIGHT}`:"none" }}
            >
              <div style={{ width:52, height:52, borderRadius:13, background:VIOLET_LIGHT, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <p style={{ margin:"0 0 5px", fontWeight:700, fontSize:15, color:"#111" }}>Drop your CV here</p>
              <p style={{ margin:0, color:"#9CA3AF", fontSize:12 }}>or click to browse · PDF · PNG · JPG · TXT</p>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.webp" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])}/>
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:28, marginTop:24 }}>
              {["Any format","Any language","Standard output"].map(f=>(
                <span key={f} style={{ display:"flex", alignItems:"center", gap:5, color:"#9CA3AF", fontSize:12 }}>
                  <span style={{ color:VIOLET, fontWeight:700 }}>✓</span>{f}
                </span>
              ))}
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:300, animation:"fadeUp 0.3s ease" }}>
            <Spinner/>
          </div>
        )}

        {phase === "result" && cv && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <button onClick={reset} style={{ background:"none", border:"none", color:"#9CA3AF", fontSize:13, cursor:"pointer", padding:0 }}>← Parse another</button>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={copyJSON} style={{ background:"#fff", border:`1.5px solid ${VIOLET}`, color:VIOLET, borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  {copied ? "✓ Copied" : "Copy JSON"}
                </button>
                <button onClick={downloadJSON} style={{ background:"#fff", border:`1.5px solid ${VIOLET}`, color:VIOLET, borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>↓ JSON</button>
                <button onClick={downloadPDF} style={{ background:VIOLET, border:"none", color:"#fff", borderRadius:8, padding:"7px 18px", fontSize:12, fontWeight:700, cursor:"pointer" }}>↓ PDF</button>
              </div>
            </div>
            <CVPreview cv={cv}/>
          </div>
        )}

        {phase === "error" && (
          <div style={{ background:"#FFF1F2", border:"1px solid #FECDD3", borderRadius:14, padding:24, textAlign:"center", animation:"fadeUp 0.3s ease" }}>
            <p style={{ color:"#9F1239", fontWeight:700, margin:"0 0 6px", fontSize:15 }}>Could not process this file</p>
            <p style={{ color:"#BE123C", fontSize:13, margin:"0 0 18px" }}>{errMsg}</p>
            <button onClick={reset} style={{ background:"#9F1239", color:"#fff", border:"none", borderRadius:8, padding:"9px 22px", cursor:"pointer", fontWeight:700, fontSize:13 }}>Try again</button>
          </div>
        )}
      </main>
    </div>
  );
}