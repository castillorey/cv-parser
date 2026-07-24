import { renderToString } from "react-dom/server";
import cvStyle from "../cv-style.css?raw";
import StandardFormat from "../components/StandardFormat";

const esc = (s) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const TEMPLATE_CV = {
  name: "John Doe",
  title: "Senior Software Engineer",
  email: "john@example.com",
  phone: "+1 555 0123",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/johndoe",
  spokenLanguages: ["English - Native", "Spanish - Advanced", "French - Intermediate"],
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "GraphQL", "PostgreSQL"],
  education: [
    { degree: "M.S. Computer Science", institution: "Stanford University", year: "2018" },
    { degree: "B.S. Software Engineering", institution: "UC Berkeley", year: "2016" },
  ],
  certifications: [
    { name: "AWS Solutions Architect", issuer: "Amazon", year: "2023" },
  ],
  experience: [
    {
      company: "Tech Corp",
      role: "Senior Software Engineer",
      from: "Jan 2022",
      to: "Present",
      responsibilities: [
        "Led migration of monolith to microservices architecture",
        "Designed and implemented CI/CD pipelines reducing deploy time by 60%",
        "Mentored team of 5 junior developers",
      ],
    },
    {
      company: "StartupXYZ",
      role: "Full Stack Developer",
      from: "Mar 2019",
      to: "Dec 2021",
      responsibilities: [
        "Built real-time collaboration features serving 10K+ users",
        "Optimized database queries improving response time by 40%",
      ],
    },
  ],
};

export function generateTemplatePDF() {
  return generatePDF(TEMPLATE_CV);
}

export function generatePDF(cv) {
  const jsx = <StandardFormat cv={cv} />;
  const body = renderToString(jsx);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CV - ${esc(cv.name || "")}</title>
<style>${cvStyle}</style>
</head>
<body>${body}</body>
</html>`;
}
