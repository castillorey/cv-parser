import { useState, useRef } from "react";
import { parseCV } from "./lib/api";
import { generatePDF, generateTemplatePDF } from "./lib/pdfGenerator";
import Spinner from "./components/Spinner";
import StandardFormat from "./components/StandardFormat";
import SAMPLE_CV from "./sample-cv.json";

const VIOLET = "#7C3AED";
const VIOLET_LIGHT = "#EDE9FE";

const SUPPORTED_EXTENSIONS = ["pdf", "txt", "jpg", "jpeg", "png", "webp"];

export default function App() {
  const [phase, setPhase] = useState("upload");
  const [cv, setCv] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setErrMsg(`.${ext} not supported. Use PDF, image, or TXT.`);
      setPhase("error");
      return;
    }
    setPhase("loading");
    try {
      const parsed = await parseCV(file);
      setCv(parsed);
      setPhase("result");
    } catch (err) {
      setErrMsg(err.message || "Unknown error");
      setPhase("error");
    }
  };

  const downloadPDF = () => {
    const html = generatePDF(cv);
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 900);
  };

  const downloadTemplatePDF = () => {
    const html = generateTemplatePDF();
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 900);
  };

  const downloadJSON = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" }));
    a.download = `${(cv.name || "cv").replace(/\s+/g, "_")}.json`;
    a.click();
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(cv, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setCv(null);
    setErrMsg("");
    setPhase("upload");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", fontFamily: "'Inter',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        button:hover { opacity:0.88; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "14px 28px", display: "flex", alignItems: "center", gap: 9, background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: VIOLET, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="12" rx="1" fill="white" opacity="0.7" /><rect x="9" y="2" width="5" height="8" rx="1" fill="white" /><rect x="9" y="12" width="5" height="2" rx="1" fill="white" opacity="0.5" /></svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 14, color: "#0F0F0F", letterSpacing: "-0.01em" }}>CVform</span>
        <span style={{ fontSize: 10, background: VIOLET_LIGHT, color: VIOLET, borderRadius: 999, padding: "2px 7px", fontWeight: 700 }}>AI</span>
      </nav>

      <main style={{ flex: 1, width: "100%", maxWidth: 860, margin: "0 auto", padding: "36px 20px 60px" }}>

        {phase === "upload" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.1 }}>
                Drop any CV.<br /><span style={{ color: VIOLET }}>Get one standard.</span>
              </h1>
              <p style={{ color: "#6B7280", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                Any language, any layout. AI extracts and structures it into a clean, consistent format.
              </p>
            </div>
            <div
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragging ? VIOLET : "#C4B5FD"}`, borderRadius: 18, padding: "52px 32px", cursor: "pointer", textAlign: "center", background: dragging ? VIOLET_LIGHT : "#fff", transition: "all 0.18s ease", boxShadow: dragging ? `0 0 0 5px ${VIOLET_LIGHT}` : "none" }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 13, background: VIOLET_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <p style={{ margin: "0 0 5px", fontWeight: 700, fontSize: 15, color: "#111" }}>Drop your CV here</p>
              <p style={{ margin: 0, color: "#9CA3AF", fontSize: 12 }}>or click to browse · PDF · PNG · JPG · TXT</p>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 24 }}>
              {["Any format", "Any language", "Standard output"].map((f) => (
                <span key={f} style={{ display: "flex", alignItems: "center", gap: 5, color: "#9CA3AF", fontSize: 12 }}>
                  <span style={{ color: VIOLET, fontWeight: 700 }}>✓</span>{f}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setPhase("template")} style={{ background: "none", border: `1.5px dashed ${VIOLET}`, color: VIOLET, borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease" }}>
                Preview Template
              </button>
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300, animation: "fadeUp 0.3s ease" }}>
            <Spinner />
          </div>
        )}

        {phase === "template" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <button onClick={reset} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 13, cursor: "pointer", padding: 0 }}>← Back</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={downloadTemplatePDF} style={{ background: VIOLET, border: "none", color: "#fff", borderRadius: 8, padding: "7px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>↓ Template PDF</button>
              </div>
            </div>
            <StandardFormat cv={SAMPLE_CV} />
          </div>
        )}

        {phase === "result" && cv && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <button onClick={reset} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 13, cursor: "pointer", padding: 0 }}>← Parse another</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyJSON} style={{ background: "#fff", border: `1.5px solid ${VIOLET}`, color: VIOLET, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {copied ? "✓ Copied" : "Copy JSON"}
                </button>
                <button onClick={downloadJSON} style={{ background: "#fff", border: `1.5px solid ${VIOLET}`, color: VIOLET, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>↓ JSON</button>
                <button onClick={downloadPDF} style={{ background: VIOLET, border: "none", color: "#fff", borderRadius: 8, padding: "7px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>↓ PDF</button>
              </div>
            </div>
            <StandardFormat cv={cv} />
          </div>
        )}

        {phase === "error" && (
          <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 14, padding: 24, textAlign: "center", animation: "fadeUp 0.3s ease" }}>
            <p style={{ color: "#9F1239", fontWeight: 700, margin: "0 0 6px", fontSize: 15 }}>Could not process this file</p>
            <p style={{ color: "#BE123C", fontSize: 13, margin: "0 0 18px" }}>{errMsg}</p>
            <button onClick={reset} style={{ background: "#9F1239", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Try again</button>
          </div>
        )}
      </main>
    </div>
  );
}
