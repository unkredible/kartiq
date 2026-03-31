import { useState } from "react";

const teams = [
  { kart: 12, name: "KOJIMA_URC_CREW",   racePos: 10, d1: 44.26, d2: 44.42, diff: 0.16, isUser: true,  computed: true  },
  { kart: 15, name: "JORDAN_GP",          racePos:  5, d1: 43.69, d2: 43.99, diff: 0.30, isUser: false, computed: true  },
  { kart:  3, name: "ZAKSPEED",           racePos:  3, d1: 43.28, d2: 43.65, diff: 0.37, isUser: false, computed: false },
  { kart: 14, name: "MIDLAND",            racePos:  8, d1: 43.45, d2: 43.87, diff: 0.42, isUser: false, computed: false },
  { kart: 10, name: "LOLA_MASTERCARD",    racePos: 11, d1: 43.80, d2: 44.22, diff: 0.42, isUser: false, computed: false },
  { kart:  2, name: "ANDREA_MODA",        racePos:  4, d1: 43.33, d2: 43.86, diff: 0.53, isUser: false, computed: true  },
  { kart:  9, name: "CORTI_FORSE",        racePos:  9, d1: 43.69, d2: 44.21, diff: 0.52, isUser: false, computed: true  },
  { kart:  4, name: "SIMTEK_S921",        racePos: 12, d1: 43.50, d2: 44.05, diff: 0.55, isUser: false, computed: false },
  { kart:  8, name: "CATERHAM_DRT",       racePos: 13, d1: 43.55, d2: 44.12, diff: 0.57, isUser: false, computed: false },
  { kart:  1, name: "DKT_ARROWS",         racePos:  1, d1: 43.05, d2: 43.70, diff: 0.65, isUser: false, computed: true  },
  { kart:  7, name: "PARELLA_KARTELLA",   racePos: 14, d1: 43.95, d2: 44.62, diff: 0.67, isUser: false, computed: false },
  { kart: 19, name: "MODENA_TEAM",        racePos: 15, d1: 44.05, d2: 44.75, diff: 0.70, isUser: false, computed: false },
  { kart: 11, name: "SPIRIT_RACING",      racePos: 17, d1: 43.80, d2: 44.55, diff: 0.75, isUser: false, computed: false },
  { kart: 21, name: "LIGIER",             racePos:  7, d1: 43.70, d2: 44.50, diff: 0.80, isUser: false, computed: false },
  { kart:  6, name: "POLENTA_MARCH",      racePos:  6, d1: 43.65, d2: 44.48, diff: 0.83, isUser: false, computed: false },
  { kart: 20, name: "HESKETH_RAC",        racePos: 16, d1: 44.15, d2: 45.05, diff: 0.90, isUser: false, computed: false },
  { kart: 16, name: "MARUSSIA",           racePos: 18, d1: 43.95, d2: 44.95, diff: 1.00, isUser: false, computed: false },
  { kart:  5, name: "HRT-BY_CCKT",        racePos:  2, d1: 43.10, d2: 44.20, diff: 1.10, isUser: false, computed: true  },
];

const sorted = [...teams].sort((a, b) => a.diff - b.diff);

const getColor = (diff, isUser) => {
  if (isUser) return { bar: "#f59e0b", bg: "#fef3c7", border: "#f59e0b" };
  if (diff <= 0.30) return { bar: "#22c55e", bg: "#f0fdf4", border: "#22c55e" };
  if (diff <= 0.55) return { bar: "#eab308", bg: "#fefce8", border: "#eab308" };
  return { bar: "#ef4444", bg: "#fef2f2", border: "#ef4444" };
};

const getLabel = (diff) => {
  if (diff <= 0.30) return "🟢 Molto equilibrato";
  if (diff <= 0.55) return "🟡 Abbastanza equilibrato";
  return "🔴 Sbilanciato";
};

export default function App() {
  const [hover, setHover] = useState(null);
  const maxDiff = 1.2;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", padding: "24px", color: "#e2e8f0" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
            Endurance Big Kart Rozzano — 28 mar 2026
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
            Classifica Equilibrio tra Piloti
          </h1>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
            Differenza media di passo tra i due piloti (minore = più equilibrato)
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { color: "#22c55e", label: "≤ 0.30s — Molto equilibrato" },
            { color: "#eab308", label: "0.31–0.55s — Abbastanza" },
            { color: "#ef4444", label: "> 0.55s — Sbilanciato" },
            { color: "#f59e0b", label: "Il tuo team" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sorted.map((t, i) => {
            const c = getColor(t.diff, t.isUser);
            const barW = (t.diff / maxDiff) * 100;
            const isHovered = hover === t.kart;
            return (
              <div
                key={t.kart}
                onMouseEnter={() => setHover(t.kart)}
                onMouseLeave={() => setHover(null)}
                style={{
                  background: isHovered ? "#1e293b" : "#0f172a",
                  border: `1px solid ${t.isUser ? "#f59e0b" : isHovered ? "#334155" : "#1e293b"}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  transition: "all 0.15s",
                  cursor: "default",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Rank */}
                  <div style={{
                    minWidth: 26, height: 26, borderRadius: 6,
                    background: i === 0 ? "#22c55e22" : "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    color: i === 0 ? "#22c55e" : "#64748b",
                  }}>
                    {i + 1}
                  </div>

                  {/* Kart number */}
                  <div style={{
                    minWidth: 28, height: 26, borderRadius: 5,
                    background: "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "#94a3b8", fontWeight: 600,
                  }}>
                    #{t.kart}
                  </div>

                  {/* Name */}
                  <div style={{ minWidth: 170, fontSize: 13, fontWeight: t.isUser ? 700 : 500, color: t.isUser ? "#fbbf24" : "#cbd5e1" }}>
                    {t.name}
                    {t.isUser && <span style={{ marginLeft: 6, fontSize: 10, background: "#f59e0b22", color: "#f59e0b", padding: "1px 5px", borderRadius: 4 }}>VOI</span>}
                    {!t.computed && <span style={{ marginLeft: 5, fontSize: 9, color: "#475569" }}>~</span>}
                  </div>

                  {/* Bar */}
                  <div style={{ flex: 1, height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${barW}%`,
                      height: "100%",
                      background: c.bar,
                      borderRadius: 4,
                      transition: "width 0.3s",
                    }} />
                  </div>

                  {/* Diff value */}
                  <div style={{ minWidth: 48, textAlign: "right", fontSize: 14, fontWeight: 700, color: c.bar }}>
                    {t.diff.toFixed(2)}s
                  </div>

                  {/* Race pos */}
                  <div style={{ minWidth: 40, textAlign: "right", fontSize: 11, color: "#475569" }}>
                    P{t.racePos}
                  </div>
                </div>

                {/* Expanded detail on hover */}
                {isHovered && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e293b", display: "flex", gap: 20, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>Pilota veloce: </span>
                      <span style={{ color: "#22c55e", fontWeight: 600 }}>{t.d1.toFixed(2)}s avg</span>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Pilota lento: </span>
                      <span style={{ color: "#f87171", fontWeight: 600 }}>{t.d2.toFixed(2)}s avg</span>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Gap: </span>
                      <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{t.diff.toFixed(2)}s/giro</span>
                    </div>
                    <div style={{ color: "#64748b" }}>
                      {t.computed ? "✓ calcolato" : "≈ stimato"}
                    </div>
                    <div style={{ marginLeft: "auto", color: "#64748b" }}>
                      {getLabel(t.diff)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Insight box */}
        <div style={{
          marginTop: 24, background: "#1e293b", borderRadius: 12,
          padding: 18, border: "1px solid #f59e0b44",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 10 }}>
            💡 Key insight — KOJIMA vs il campo
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
            Con <strong style={{ color: "#f1f5f9" }}>0.16s</strong> di differenza tra Sebastiano (44.26s avg) e te (44.42s avg),
            KOJIMA è il team <strong style={{ color: "#22c55e" }}>più equilibrato in assoluto</strong> in griglia.
            Su 149 giri di gara, questo gap vale circa <strong style={{ color: "#f1f5f9" }}>+24 secondi totali</strong> — poco più di una sosta.
            <br /><br />
            Il vincitore <strong style={{ color: "#f1f5f9" }}>DKT_ARROWS</strong> è in realtà uno dei team più <em>sbilanciati</em> (0.65s):
            un pilota dominante a 43.05s e il secondo a 43.70s. Stesso discorso per
            <strong style={{ color: "#f1f5f9" }}> HRT</strong> (P2, ma 1.1s di gap tra piloti).
            <br /><br />
            Il vero benchmark competitivo per voi è <strong style={{ color: "#f1f5f9" }}>CORTI_FORSE</strong> (P9, +14s):
            anche loro abbastanza bilanciati (0.52s), ma il loro pilota più lento fa 44.21s vs il vostro 44.42s.
            Portare il tuo passo medio da 44.42 → 44.10s (il livello di Sebastiano) azzerebbe quel gap.
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#334155" }}>
          ~ = valori stimati da pattern visivi · ✓ = calcolati giro per giro · Hover su ogni riga per il dettaglio
        </div>
      </div>
    </div>
  );
}
