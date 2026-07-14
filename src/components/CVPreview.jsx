const VIOLET = "#7C3AED";

export default function CVPreview({ cv }) {
  const leftGrad = "linear-gradient(180deg, #7C3AED 0%, #C4B5FD 55%, #EDE9FE 100%)";
  return (
    <div style={{ display: "flex", borderRadius: 14, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(124,58,237,0.10)", fontFamily: "'Inter',system-ui,sans-serif", fontSize: 12 }}>

      {/* LEFT */}
      <div style={{ width: 200, flexShrink: 0, background: leftGrad, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 36, background: "#111" }} />
        <div style={{ padding: "18px 16px 10px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: VIOLET, border: "2.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="9" fill="white" opacity="0.85" />
              <path d="M6 42c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
            </svg>
          </div>
        </div>

        {cv.spokenLanguages?.length > 0 && (
          <div style={{ padding: "0 16px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#111", marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#111" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5" /><path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13" /></svg>
              Languages
            </div>
            <ul style={{ paddingLeft: 13, margin: 0 }}>
              {cv.spokenLanguages.map((l, i) => <li key={i} style={{ fontSize: 10, color: "#1F1F1F", marginBottom: 4, lineHeight: 1.5 }}>{l}</li>)}
            </ul>
            <div style={{ height: 1, background: "rgba(0,0,0,0.1)", margin: "12px 0" }} />
          </div>
        )}

        {cv.skills?.length > 0 && (
          <div style={{ padding: "0 16px", flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#111", marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#111" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v3l2 2" /></svg>
              Skills
            </div>
            <ul style={{ paddingLeft: 13, margin: 0 }}>
              {cv.skills.map((s, i) => <li key={i} style={{ fontSize: 9.5, color: "#1F1F1F", marginBottom: 3.5, lineHeight: 1.5 }}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
        <div style={{ height: 36, background: "#111" }} />

        {/* Name / Title */}
        <div style={{ padding: "16px 22px 12px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: VIOLET, letterSpacing: "-0.02em", lineHeight: 1 }}>{cv.name || "—"}</div>
          <div style={{ fontSize: 12, color: "#111", marginTop: 3 }}>{cv.title}</div>
          {(cv.email || cv.phone || cv.location || cv.linkedin) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 7, fontSize: 10, color: "#666" }}>
              {cv.email && <span>✉ {cv.email}</span>}
              {cv.phone && <span>📱 {cv.phone}</span>}
              {cv.location && <span>📍 {cv.location}</span>}
              {cv.linkedin && <span>in {cv.linkedin}</span>}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 22px", flex: 1 }}>

          {/* Education */}
          {cv.education?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: VIOLET, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6l6-4 6 4-6 4-6-4z" /><path d="M5 8v3c0 1 1.5 2 3 2s3-1 3-2V8" /></svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111", borderBottom: `2px solid ${VIOLET}`, paddingBottom: 2, flex: 1 }}>Education</span>
              </div>
              {cv.education.map((ed, i) => (
                <div key={i} style={{ paddingLeft: 36, marginBottom: 7 }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{ed.degree}</div>
                  <div style={{ fontSize: 10, color: "#444" }}>{ed.institution}{ed.year ? ` - ${ed.year}` : ""}</div>
                </div>
              ))}
              {cv.certifications?.filter((c) => c.name).length > 0 && (
                <div style={{ paddingLeft: 36, marginTop: 10 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, textDecoration: "underline", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Certifications:</div>
                  <ul style={{ paddingLeft: 13, margin: 0 }}>
                    {cv.certifications.filter((c) => c.name).map((c, i) => (
                      <li key={i} style={{ fontSize: 9.5, marginBottom: 3, lineHeight: 1.5 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: VIOLET, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="5" width="14" height="10" rx="1.5" /><path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" /></svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111", borderBottom: `2px solid ${VIOLET}`, paddingBottom: 2, flex: 1 }}>Work Experience</span>
              </div>
              {cv.experience.map((ex, i) => (
                <div key={i} style={{ paddingLeft: 36, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{ex.company}</div>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>Position: {ex.role}</div>
                  <div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Date: {ex.from} – {ex.to}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 3 }}>Responsibilities:</div>
                  <ul style={{ paddingLeft: 13, margin: 0 }}>
                    {(ex.responsibilities || []).filter(Boolean).map((r, j) => (
                      <li key={j} style={{ fontSize: 9.5, color: "#333", marginBottom: 3, lineHeight: 1.55 }}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 22px", display: "flex", justifyContent: "flex-end", borderTop: "3px solid", borderImage: "linear-gradient(90deg,#7C3AED,#06B6D4,#10B981) 1" }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#111", letterSpacing: "-0.01em" }}>CVform.</span>
        </div>
      </div>
    </div>
  );
}
