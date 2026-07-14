const VIOLET = "#7C3AED";
const VIOLET_LIGHT = "#EDE9FE";

export default function Spinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 14 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="18" stroke={VIOLET_LIGHT} strokeWidth="3.5" />
        <path d="M40 22a18 18 0 0 0-18-18" stroke={VIOLET} strokeWidth="3.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.75s" repeatCount="indefinite" />
        </path>
      </svg>
      <p style={{ color: VIOLET, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", margin: 0 }}>PARSING CV…</p>
    </div>
  );
}
