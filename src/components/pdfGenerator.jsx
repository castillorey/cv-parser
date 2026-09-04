import { renderToString } from "react-dom/server";
import cvStyle from "../cv-style.css?raw";
import StandardFormat from "./StandardFormat";
import TEMPLATE_CV from "../template-cv.json";

const esc = (s) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

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
