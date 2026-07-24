import venaroLogo from "../assets/venaro_logo.png";
import venaroLandmark from "../assets/venaro_landmark.png";
import "../cv-style.css";

const JOB_BASE_HEIGHT = 82;
const JOB_LINE_HEIGHT = 14;
const PAGE_1_WORK_CAPACITY = 310;
const CONTINUATION_WORK_CAPACITY = 500;

function estimateJobHeight(ex) {
  const responsibilities = (ex.responsibilities || []).filter(Boolean).length;
  return JOB_BASE_HEIGHT + responsibilities * JOB_LINE_HEIGHT;
}

function splitExperience(experiences) {
  if (!experiences?.length) return { page1: [], pages: [] };

  const page1 = [];
  let used = 0;
  let i = 0;

  for (; i < experiences.length; i++) {
    const h = estimateJobHeight(experiences[i]);
    if (used + h > PAGE_1_WORK_CAPACITY && page1.length > 0) break;
    page1.push(experiences[i]);
    used += h;
  }

  const remaining = experiences.slice(i);
  const pages = [];
  let chunk = [];
  used = 0;

  for (const ex of remaining) {
    const h = estimateJobHeight(ex);
    if (used + h > CONTINUATION_WORK_CAPACITY && chunk.length > 0) {
      pages.push(chunk);
      chunk = [];
      used = 0;
    }
    chunk.push(ex);
    used += h;
  }
  if (chunk.length) pages.push(chunk);

  return { page1, pages };
}

function LeftPanel({ cv }) {
  return (
    <aside className="left-panel">
      <div className="left-section">
        <div className="mini-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <h2 className="left-title">LANGUAGES</h2>
        <ul style={{ paddingLeft: 13, margin: 0 }}>
          {cv.spokenLanguages.map((l, i) => <li key={i} style={{ color: "#1F1F1F", marginBottom: 4 }}>{l}</li>)}
        </ul>
      </div>

      <div className="left-section skills">
        <div className="mini-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>
        </div>
        <h2 className="left-title">SKILLS</h2>
        <ul style={{ paddingLeft: 13, margin: 0 }}>
          {cv.skills.map((s, i) => <li key={i} style={{ color: "#1F1F1F", marginBottom: 3.5 }}>{s}</li>)}
        </ul>
      </div>
    </aside>
  );
}

function EducationSection({ cv }) {
  return (
    <section className="section-with-icon education">
      <div className="section-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
      </div>
      <h2 className="section-title">Education<span className="title-rule" /></h2>
      <ul style={{ paddingLeft: 23, margin: 0 }}>
        {cv.education.map((ed, i) => (
          <li key={i}>
            <div style={{ fontWeight: 700 }}>{ed.degree}</div>
            <div style={{ color: "#444" }}>{ed.institution}{ed.year ? ` - ${ed.year}` : ""}</div>
          </li>
        ))}
      </ul>

      {cv.certifications?.filter((c) => c.name).length > 0 && (
        <div style={{ paddingLeft: 13, marginTop: 10 }}>
          <div style={{ fontWeight: 800, textDecoration: "underline", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Certifications:</div>
          <ul style={{ paddingLeft: 13, margin: 0 }}>
            {cv.certifications.filter((c) => c.name).map((c, i) => (
              <li key={i}>
                {c.name}{c.issuer ? ` - ${c.issuer}` : ""}{c.year ? ` - ${c.year}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function WorkSection({ jobs }) {
  if (!jobs?.length) return null;
  return (
    <section className="section-with-icon work">
      <div className="section-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
      </div>
      <h2 className="section-title">Work Experience<span className="title-rule" /></h2>
      <div>
        {jobs.map((ex, i) => (
          <div key={i} style={{ paddingLeft: 13, marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>{ex.company}</div>
            <div style={{ fontWeight: 700 }}>Position: {ex.role}</div>
            <div style={{ color: "#555", marginBottom: 3 }}>Date: {ex.from} – {ex.to}</div>
            <div style={{ fontWeight: 700, marginBottom: 3 }}>Responsibilities:</div>
            <ul style={{ paddingLeft: 13, margin: 0 }}>
              {(ex.responsibilities || []).filter(Boolean).map((r, j) => (
                <li key={j} style={{ color: "#333" }}>{r}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function PageShell({ children, cv, className = "" }) {
  return (
    <section className={`page ${className}`} aria-label="CV page">
      <div className="black-top" />
      <div className="side" />
      <div className="purple-block">
        <img src={venaroLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <header className="header">
        <h1 className="name">{cv.name || "—"}</h1>
        <p className="role">{cv.title}</p>
        <div className="header-line" />
      </header>

      <LeftPanel cv={cv} />

      <div className="main">
        {children}
      </div>

      <div className="footer" aria-label="Venaro">
        <img src={venaroLandmark} alt="Venaro" style={{ height: 50 }} />
      </div>
    </section>
  );
}

export default function StandardFormat({ cv }) {
  const { page1, pages } = splitExperience(cv.experience || []);

  return (
    <main className="document" aria-label="Standard format">
      <PageShell cv={cv}>
        {(cv.education?.length > 0 || cv.certifications?.filter((c) => c.name).length > 0) && (
          <EducationSection cv={cv} />
        )}
        <WorkSection jobs={page1} />
      </PageShell>

      {pages.map((chunk, i) => (
        <PageShell key={i} cv={cv} className="page-continuation">
          <WorkSection jobs={chunk} />
        </PageShell>
      ))}
    </main>
  );
}
