const esc = (s) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const li = (text) => `<li>${esc(text)}</li>`;

const edItem = (ed) =>
  `<li><strong>${esc(ed.degree)}</strong><br>${esc(ed.institution)}${ed.year ? ` - ${esc(ed.year)}` : ""}</li>`;

const certItem = (c) =>
  `<li>${esc(c.name)}${c.issuer ? ` - ${esc(c.issuer)}` : ""}${c.year ? ` - ${esc(c.year)}` : ""}</li>`;

const jobHTML = (ex, i) => `<div class="job"${i > 0 ? ' style="margin-top:25pt"' : ""}>
    <strong>${esc(ex.company)}</strong><br>
    <strong>Position: ${esc(ex.role)}</strong><br>
    <strong>Date: ${esc(ex.from)} – ${esc(ex.to)}</strong><br>
    <strong>Responsibilities:</strong>
    <ul>${(ex.responsibilities || []).filter(Boolean).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
  </div>`;

const leftContent = (cv) => `
    <aside class="left-panel">
      ${cv.spokenLanguages?.length ? `
      <div class="left-section">
        <div class="mini-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 35c-5-4-6-12-2-18C12 8 25 7 35 13c9 6 10 18 2 25-6 6-17 7-25 2L4 43l5-8Z"/>
            <path d="M17 30c1-9 9-14 20-14"/>
          </svg>
        </div>
        <h2 class="left-title">LANGUAGES</h2>
        <ul>${cv.spokenLanguages.map(li).join("")}</ul>
      </div>` : ""}
      ${cv.skills?.length ? `
      <div class="left-section skills">
        <div class="mini-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
            <ellipse cx="24" cy="24" rx="7" ry="21" transform="rotate(18 24 24)"/>
            <ellipse cx="24" cy="24" rx="7" ry="21" transform="rotate(78 24 24)"/>
            <ellipse cx="24" cy="24" rx="7" ry="21" transform="rotate(138 24 24)"/>
          </svg>
        </div>
        <h2 class="left-title">SKILLS</h2>
        <ul>${cv.skills.map(li).join("")}</ul>
      </div>` : ""}
    </aside>`;

const educationHTML = (cv) =>
  cv.education?.length
    ? `
    <section class="section-with-icon education">
      <div class="section-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 28c0-10 7-17 17-17 7 0 12 5 12 12 0 8-6 14-14 14H12"/>
          <path d="M33 22c-7 2-12 7-12 15"/>
          <path d="M33 37c-8 0-13-5-13-13"/>
        </svg>
      </div>
      <h2 class="section-title">Education<span class="title-rule"></span></h2>
      <ul>${cv.education.map(edItem).join("")}</ul>
      ${cv.certifications?.filter((c) => c.name).length ? `
      <p class="cert-title">CERTIFICATIONS:</p>
      <ul>${cv.certifications.filter((c) => c.name).map(certItem).join("")}</ul>` : ""}
    </section>`
    : "";

const workSectionHTML = (experiences) =>
  experiences?.length
    ? `
    <section class="section-with-icon work">
      <div class="section-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="24" cy="14" r="6"/>
          <path d="M14 39v-9c0-6 4-10 10-10s10 4 10 10v9H14Z"/>
          <path d="M24 27v8"/>
          <circle cx="24" cy="37" r="1.8" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <h2 class="section-title">Work Experience<span class="title-rule"></span></h2>
      ${experiences.map(jobHTML).join("")}
    </section>`
    : "";

const pageHeader = (cv) => `
      <header class="header">
        <h1 class="name">${esc(cv.name)}</h1>
        <p class="role">${esc(cv.title)}</p>
        <div class="header-line"></div>
      </header>`;

const pageFooter = `
      <div class="footer" aria-label="Salvatech">
        <svg viewBox="0 0 154 34" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 6 8 14l10 10-11 6 6 2 16-9L19 13l11-6-8-1Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
          <text x="38" y="25" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" fill="currentColor">Salvatech.</text>
        </svg>
      </div>`;

const brandMark = `
      <div class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 90 122" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M66 8 22 32c-10 5-11 19-2 27l22 21-30 18c-9 6-5 19 6 14l47-27c9-5 11-18 3-26L45 38 76 20c9-6 1-18-10-12Z" stroke="currentColor" stroke-width="10" stroke-linejoin="round"/>
          <path d="M40 38c-4 10-1 20 11 31" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>
          <circle cx="83" cy="49" r="4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>`;

export function generatePDF(cv) {
  const totalR = (cv.experience || []).reduce(
    (sum, ex) => sum + (ex.responsibilities || []).length, 0
  );
  const needsPage2 = cv.experience?.length > 1 || totalR > 8;
  const page1Exp = needsPage2 ? [cv.experience[0]] : cv.experience;
  const page2Exp = needsPage2 ? cv.experience.slice(1) : [];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(cv.name)} - CV</title>
  <link rel="stylesheet" href="cv-style.css">
</head>
<body>
  <main class="document">
    <section class="page" aria-label="Página 1">
      <div class="black-top"></div>
      <div class="side"></div>
      <div class="purple-block"></div>
      ${brandMark}
      ${pageHeader(cv)}
      ${leftContent(cv)}
      <div class="main">
        ${educationHTML(cv)}
        ${workSectionHTML(page1Exp)}
      </div>
      ${pageFooter}
    </section>
    ${page2Exp.length ? `
    <section class="page page-two" aria-label="Página 2">
      <div class="black-top"></div>
      <div class="side"></div>
      <div class="purple-block"></div>
      ${brandMark}
      ${pageHeader(cv)}
      <div class="main">${page2Exp.map(jobHTML).join("")}</div>
      ${pageFooter}
    </section>` : ""}
  </main>
</body>
</html>`;
}
