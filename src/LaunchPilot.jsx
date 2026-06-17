import { supabase } from "./lib/supabase";

// const {
//   data: { user },
// } = await supabase.auth.getUser();

// if (user) {
//   await supabase.from("generations").insert([
//     {
//       user_id: user.id,
//       type: key,
//       content: out,
//     },
//   ]);
// }

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Rocket, Target, MessageSquareText, FileText, Clapperboard, ListChecks,
  Send, Share2, FlaskConical, LayoutDashboard, Lightbulb, Compass,
  Sparkles, Loader2, Check, ChevronRight, Copy, RefreshCw, Plus, Minus,
  TrendingUp, Users, Gauge, Radio, Zap, AlertTriangle, ExternalLink,
  Flame, Crosshair, BookOpen, MessageCircle, Hash, Mail, Megaphone,
} from "lucide-react";

/* ============================================================
   LaunchPilot — AI Head of Growth for early-stage products.
   Single-file React app. Generative modules call Claude via the
   in-artifact Anthropic API. Aesthetic: mission-control flight deck.
   ============================================================ */

const MODEL = "claude-sonnet-4-20250514";

/* ---------- Claude generation engine ---------- */
async function callGemini(system, user, { json = false } = {}) {
  const prompt = `${system}\n\n${user}`;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }

  const data = await res.json();

  const text = data.content;

  if (!json) return text;

  return parseJson(text);
}

function parseJson(text) {
  let t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstObj = t.indexOf("{");
  const firstArr = t.indexOf("[");
  let start = -1;
  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) start = firstArr;
  else start = firstObj;
  if (start === -1) throw new Error("No JSON found");
  const open = t[start];
  const close = open === "[" ? "]" : "}";
  const end = t.lastIndexOf(close);
  t = t.slice(start, end + 1);
  return JSON.parse(t);
}

/* ---------- product context block (shared across prompts) ---------- */
function productContext(p) {
  return `PRODUCT BRIEF
Name: ${p.name}
URL: ${p.url}
Description: ${p.description}
Target audience: ${p.audience}
Pricing: ${p.pricing}
Stage: ${p.stage}`;
}

const BASE_SYSTEM =
  "You are the engine behind LaunchPilot, an AI Head of Growth for early-stage founders. " +
  "Your single objective is to help founders acquire their first 10 ACTIVATED users — not to generate vanity content. " +
  "Every recommendation must be concrete, specific, and executable by a solo founder this week. " +
  "Name real communities, real tactics, real numbers. No fluff, no hedging, no generic marketing-speak.";

/* ============================================================
   DESIGN SYSTEM (injected stylesheet) — flight-deck aesthetic
   ============================================================ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root {
  --ink:#080b10; --ink2:#0d1117; --panel:#111620; --panel2:#141a26;
  --line:#1e2736; --line2:#243044; --line3:#2d3a50;
  --txt:#e6ecf5; --txt2:#8fa0b8; --muted:#6a7d95; --muted2:#4d5f75;
  --amber:#f97316; --amber2:#fb923c; --amber3:#fed7aa; --amber-bg:#1c1008;
  --cyan:#22d3ee; --cyan-bg:#041f2a;
  --green:#4ade80; --red:#f87171; --violet:#a78bfa;
  --r-sm:8px; --r:12px; --r-lg:16px;
  --sidebar:240px;
  --font:'Inter',system-ui,sans-serif;
  --mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(0.16,1,0.3,1);
}

*{box-sizing:border-box}
.lp-root {
  font-family: 'Inter', sans-serif;
  color: var(--txt);

  background:
  linear-gradient(
  to bottom,
  #080b10,
  #0d1117
  );

  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.lp-root::before{
  content:'';
  position:fixed;
  inset:0;

  background-image:
    linear-gradient(
      rgba(255,255,255,.03) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.03) 1px,
      transparent 1px
    );

  background-size:40px 40px;

  pointer-events:none;
}

.lp-mono{font-family:'JetBrains Mono',monospace}
.lp-display{font-family:'Inter',sans-serif;letter-spacing:-.02em}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--line2);border-radius:20px;border:2px solid var(--ink)}
/* sidebar */
.lp-side {
  width: var(--sidebar);
  flex-shrink: 0;
  background: var(--ink2);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
}
  .lp-navbtn {
  display: flex; align-items: center; gap: 9px;
  width: 100%; padding: 8px 10px; border-radius: 8px;
  color: var(--muted); font-size: 13px; font-weight: 500;
  background: transparent; border: none; cursor: pointer;
  transition: color .15s, background .15s;
  text-align: left; position: relative;
  font-family: var(--font);
}
.lp-navbtn:hover { color: var(--txt2); background: var(--panel); }

.lp-navbtn.on {
  color: var(--txt);
  background: var(--panel2);
  border: none;
}

.lp-navbtn.on::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background: var(--amber);
  border-radius: 0 3px 3px 0;
}

.lp-navbtn.on .lp-ic {
  color: var(--amber);
}

/* panels */
.lp-card {
  background: var(--ink2);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: border-color .18s;
}
.lp-card {
  background: var(--ink2);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: border-color .18s;
}
.lp-card:hover { border-color: var(--line2); }

.lp-panel {
  background: rgba(17,22,32,.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border: 1px solid var(--line);

  border-radius: 16px;
}

.lp-up {
  width: 100%;
  max-width: 1200px;
}

/* buttons */
.lp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;
  font-size:13.5px; height:36px; padding:0 16px;border-radius:10px;cursor:pointer;border:1px solid transparent;
  transition:all .16s;font-family:'Inter'}
.lp-btn:disabled{opacity:.55;cursor:not-allowed}
.lp-btn-primary {
  background: var(--amber);
  color: #150a00;
  border-color: var(--amber2);
  box-shadow: none;
}
.lp-btn-primary:not(:disabled):hover {
  background: var(--amber2);
  filter: none;
  transform: none;
}
.lp-btn-ghost {
  background: var(--panel2);
  color: var(--txt);
  border-color: var(--line2);
}
.lp-btn-ghost:not(:disabled):hover {
  border-color: var(--line3);
  background: var(--panel);
}

/* inputs */
.lp-input, .lp-textarea {
  width: 100%;
  background: var(--ink);
  border: 1px solid var(--line2);
  border-radius: 8px;
  color: var(--txt);
  font-size: 13.5px;
  font-family: var(--font);
  padding: 0 13px;
  height: 36px;
  transition: border-color .15s, box-shadow .15s;
  outline: none;
}

.lp-input:focus,
.lp-textarea:focus {
  border-color: var(--amber);
  box-shadow: 0 0 0 3px rgba(249,115,22,.12);
}

.lp-textarea {
  height: auto;
  min-height: 90px;
  padding: 10px 13px;
}
.lp-input:focus,.lp-textarea:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px rgba(255,122,24,.13)}
.lp-textarea{resize:vertical;min-height:90px;line-height:1.55}
.lp-label{display:block;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:var(--muted);margin-bottom:7px;font-family:'JetBrains Mono'}

/* badges + chips */
.lp-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:3px 9px;
  border-radius:999px;font-family:'JetBrains Mono';letter-spacing:.03em}
.lp-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:5px 10px;border-radius:8px;
  background:var(--ink);border:1px solid var(--line2);color:var(--txt2)}

/* score bar */
.lp-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden}
.lp-bar > i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--amber),var(--amber2))}

/* animations */
@keyframes lpUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.lp-up{animation:lpUp .45s cubic-bezier(.2,.7,.3,1) both}
@keyframes lpScan{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
.lp-scan{position:relative;overflow:hidden}
.lp-scan:after{content:"";position:absolute;top:0;left:0;height:100%;width:30%;
  background:linear-gradient(90deg,transparent,rgba(255,122,24,.12),transparent);animation:lpScan 1.4s infinite}
@keyframes lpSpin{to{transform:rotate(360deg)}}
.lp-spin{animation:lpSpin 1s linear infinite}
@keyframes lpPulse{0%,100%{opacity:1}50%{opacity:.35}}
.lp-pulse{animation:lpPulse 1.4s ease-in-out infinite}

.lp-divider{height:1px;background:linear-gradient(90deg,transparent,var(--line2),transparent)}
.lp-kpi-num{font-family:'Inter';font-weight:700;letter-spacing:-.4px;line-height:1}
.lp-prose{line-height:1.65;font-size:14px;color:var(--txt2);white-space:pre-wrap}
.lp-prose strong{color:var(--txt)}
a.lp-link{color:var(--cyan);text-decoration:none;border-bottom:1px solid var(--cyan-dim)}

@media (max-width: 1024px) {
  :root {
    --sidebar: 200px;
  }

  main {
    padding: 24px 20px 60px !important;
  }
}

@media (max-width: 768px) {
  .lp-side {
    display: none;
  }

  main {
    padding: 20px 16px 60px !important;
  }

  .lp-display {
    font-size: 22px !important;
  }
}
`;

/* ============================================================
   PRIMITIVES
   ============================================================ */
function Btn({ variant = "primary", size, children, className = "", ...p }) {
  return (
    <button className={`lp-btn lp-btn-${variant} ${size === "sm" ? "lp-btn-sm" : ""} ${className}`} {...p}>
      {children}
    </button>
  );
}
function Panel({ children, className = "", style }) {
  return <div className={`lp-panel ${className}`} style={style}>{children}</div>;
}
function Label({ children, style }) { return <label className="lp-label" style={style}>{children}</label>; }
function Badge({ children, color = "var(--amber)" }) {
  return (
    <span className="lp-badge" style={{ color, background: `${color}1a`, border: `1px solid ${color}33` }}>
      {children}
    </span>
  );
}
function SectionHead({ icon: Icon, kicker, title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 5,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--amber)",
            flexShrink: 0,
          }}
        />
        <span
          className="lp-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          {kicker}
        </span>
      </div>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-.4px",
          lineHeight: 1.15,
          margin: "0 0 6px",
        }}
      >
        {title}
      </h1>

      {sub && (
        <p
  style={{
    color: "var(--muted)",
    fontSize: 13.5,
    lineHeight: 1.6,
    maxWidth: 580,
    margin: "0 auto",
    marginBottom: 0,
    textAlign: "center",
  }}
>
          {sub}
        </p>
      )}
    </div>
  );
}
function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="lp-chip"
      style={{ cursor: "pointer" }}
      onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1200); }}
    >
      {done ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}
function GenBlock({ onGen, busy, label, done, children, hint }) {
  if (busy) {
    return (
      <Panel className="lp-scan" style={{ padding: 40, textAlign: "center" }}>
        <Loader2 size={26} className="lp-spin" style={{ color: "var(--amber)" }} />
        <p className="lp-mono" style={{ marginTop: 14, color: "var(--muted)", fontSize: 12.5 }}>{label}</p>
      </Panel>
    );
  }
  if (!done) {
    return (
      <Panel style={{ padding: 36, textAlign: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16, maxWidth: 460, margin: "0 auto 16px" }}>{hint}</p>
        <Btn onClick={onGen}><Sparkles size={15} /> Generate</Btn>
      </Panel>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Btn variant="ghost" size="sm" onClick={onGen}><RefreshCw size={12} /> Regenerate</Btn>
      </div>
      {children}
    </div>
  );
}
function ErrLine({ msg }) {
  if (!msg) return null;
  return (
    <div className="lp-card" style={{ padding: "10px 13px", marginBottom: 14, display: "flex", gap: 9, alignItems: "center", borderColor: "var(--red)" }}>
      <AlertTriangle size={15} style={{ color: "var(--red)", flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: "var(--txt2)" }}>{msg}</span>
    </div>
  );
}

/* ============================================================
   NAV CONFIG
   ============================================================ */
const NAV = [
  { id: "setup", label: "Mission Setup", icon: Rocket, group: "Briefing" },
  { id: "dashboard", label: "GTM Dashboard", icon: LayoutDashboard, group: "Briefing" },
  { id: "intel", label: "Product Intelligence", icon: Target, group: "Strategy" },
  { id: "audience", label: "Audience Discovery", icon: Compass, group: "Strategy" },
  { id: "message", label: "Message Discovery", icon: MessageSquareText, group: "Strategy" },
  { id: "content", label: "Content Engine", icon: FileText, group: "Build" },
  { id: "ideas", label: "Content Studio", icon: Lightbulb, group: "Build" },
  { id: "video", label: "Video Studio", icon: Clapperboard, group: "Build" },
  { id: "playbook", label: "First-10 Playbook", icon: ListChecks, group: "Execute" },
  { id: "agent", label: "Acquisition Agent", icon: Send, group: "Execute" },
  { id: "distro", label: "Distribution Engine", icon: Share2, group: "Execute" },
  { id: "experiments", label: "Growth Experiments", icon: FlaskConical, group: "Execute" },
];

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [view, setView] = useState(
  localStorage.getItem("lp-view") || "setup"
);

  useEffect(() => {
  localStorage.setItem("lp-view", view);
}, [view]);
  
  const [product, setProduct] = useState(null);
  const [artifacts, setArtifacts] = useState({}); // module outputs cache

  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState({
  projectCount: 0,
  generationCount: 0,
  mostUsed: "-",
  lastGenerated: "-",
});


  useEffect(() => {
  loadWorkspace();
}, []);

  const [usersAcquired, setUsersAcquired] = useState(0);

  async function logout() {
  await supabase.auth.signOut();
  window.location.reload();
}

  const [live, setLive] = useState({ url: "", status: "off", payload: null, syncedAt: null, error: "" });
  const [user, setUser] = useState(null);

  async function loadWorkspace() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
    

    if (!user) return;

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (products?.length) {
      setProduct(products[0]);
    }

    setProjects(products || []);

    setAnalytics((a) => ({
        ...a,
        projectCount: products?.length || 0,
      }));

    if (products?.length) {
    setCurrentProjectId(products[0].id);
    }

    const { data: gens } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id);

      if (gens?.length) {
  const counts = {};

  gens.forEach((g) => {
    counts[g.type] = (counts[g.type] || 0) + 1;
  });

  const mostUsed = Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );

  const lastGen = gens[gens.length - 1];

  setAnalytics((prev) => ({
    ...prev,
    generationCount: gens.length,
    mostUsed,
    lastGenerated: lastGen.type,
  }));
}

    if (gens?.length) {
        const restored = {};

        gens.forEach((g) => {
            restored[g.type] = g.content;
        });

        setArtifacts(restored);
        }
        setLoading(false);
  } catch (err) {
    console.error("Workspace load failed:", err);

    setLoading(false);
  }
}


  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const setArt = (key, val) => setArtifacts((a) => ({ ...a, [key]: val }));

const ctx = {
      product,
      setProduct,
      artifacts,
      setArt,
      usersAcquired,
      setUsersAcquired,
      setView,
      live,
      setLive,
      analytics,
      setAnalytics,
    };
  const locked = false;

  if (loading) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#080b10",
        color: "#e6ecf5",
      }}
    >
      <div
  style={{
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
  <div
  style={{
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "var(--amber)",
    display: "grid",
    placeItems: "center",
    marginBottom: "18px",
  }}
>
  <Rocket size={30} style={{ color: "#150a00" }} />
</div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          LaunchPilot
        </div>

        <div
          style={{
            color: "#8fa0b8",
            fontSize: "14px",
          }}
        >
          Loading workspace...
        </div>
      </div>
    </div>
  );
}

  return (
    <div
      className="lp-root"
      style={{
        display: "flex",
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden"
      }}
    >
      {/* SIDEBAR */}
      <aside className="lp-side" style={{ padding: "0 10px 20px" }}>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "20px 16px 16px",
    borderBottom: "1px solid var(--line)",
  }}
>
  <div
    style={{
      width: 32,
      height: 32,
      borderRadius: 9,
      background: "var(--amber)",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
    }}
  >
    <Rocket size={18} style={{ color: "#150a00" }} />
  </div>

  <div>
    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "-.3px",
        lineHeight: 1,
      }}
    >
      LaunchPilot
    </div>

    <div
      className="lp-mono"
      style={{
        fontSize: 10,
        color: "var(--muted)",
        letterSpacing: ".1em",
        textTransform: "uppercase",
        marginTop: 2,
      }}
    >
      AI Head of Growth
    </div>
  </div>
</div>
        {["Briefing", "Strategy", "Build", "Execute"].map((g) => (
          <div key={g} style={{ marginBottom: 10 }}>
            <div className="lp-mono" style={{ fontSize: 9.5, letterSpacing: ".14em", color: "var(--muted2)", padding: "8px 10px 6px" }}>{g.toUpperCase()}</div>
            {NAV.filter((n) => n.group === g).map((n) => {
              const isLocked = locked && n.id !== "setup";
              return (
                <button key={n.id}
                  className={`lp-navbtn ${view === n.id ? "on" : ""} ${isLocked ? "locked" : ""}`}
                  onClick={() => !isLocked && setView(n.id)}>
                  <n.icon size={16} className="lp-ic" />
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {view === n.id && <ChevronRight size={14} style={{ color: "var(--amber)" }} />}
                </button>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 14 }}>
          <MissionMeter acquired={usersAcquired} />
          {user && (
  <div
    style={{
      marginTop: "12px",
      marginBottom: "12px",
      padding: "10px",
      border: "1px solid var(--line)",
      borderRadius: "10px",
      fontSize: "13px",
    }}
  >
    <div
      style={{
        fontWeight: 600,
        marginBottom: "4px",
      }}
    >
      Account
    </div>
        {user.user_metadata?.full_name && (
      <div
        style={{
          fontWeight: 600,
          marginBottom: "4px",
          color: "var(--text)",
        }}
      >
        {user.user_metadata.full_name}
      </div>
    )}


    <div
      style={{
        color: "var(--muted)",
        fontSize: "12px",
        wordBreak: "break-word",
      }}
    >
      {user.email}
    </div>
  </div>
)}

          <button
            onClick={logout}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
          flex: 1,
          minWidth: 0,
          width: 0,        // ← add this line
          height: "100vh",
          overflowY: "auto",
          padding: "32px 40px 80px",
        }}>
        {view === "setup" && <SetupView {...ctx} />}
        {view === "dashboard" && (product ? <DashboardView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "intel" && (product ? <IntelView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "audience" && (product ? <AudienceView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "message" && (product ? <MessageView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "content" && (product ? <ContentView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "ideas" && (product ? <IdeasView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "video" && (product ? <VideoView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "playbook" && (product ? <PlaybookView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "agent" && (product ? <AgentView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "distro" && (product ? <DistroView {...ctx} /> : <NeedSetup setView={setView} />)}
        {view === "experiments" && (product ? <ExperimentsView {...ctx} /> : <NeedSetup setView={setView} />)}
      </main>
    </div>
  );
}

function MissionMeter({ acquired }) {
  const pct = Math.min(100, (acquired / 10) * 100);
  return (
    <div className="lp-card" style={{ padding: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span className="lp-mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--muted)" }}>MISSION</span>
        <span className="lp-display" style={{ fontWeight: 800, fontSize: 15 }}>{acquired}<span style={{ color: "var(--muted2)", fontSize: 12 }}>/10</span></span>
      </div>
      <div className="lp-bar"><i style={{ width: `${pct}%` }} /></div>
      <div style={{ fontSize: 10.5, color: "var(--muted2)", marginTop: 7 }}>activated users acquired</div>
    </div>
  );
}

function NeedSetup({ setView }) {
  return (
    <div className="lp-up" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <Panel style={{ padding: 40, textAlign: "left", maxWidth: 440 }}>
        <Rocket size={28} style={{ color: "var(--amber)" }} />
        <h2 className="lp-display" style={{ fontSize: 22, fontWeight: 800, margin: "14px 0 8px" }}>Brief your mission first</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
          LaunchPilot needs your product details before it can build and run your go-to-market.
        </p>
        <Btn onClick={() => setView("setup")}><Rocket size={15} /> Go to Mission Setup</Btn>
      </Panel>
    </div>
  );
}

/* ============================================================
   1 — MISSION SETUP
   ============================================================ */
const SAMPLES = [
  {
    name: "Cassette",
    url: "https://cassette.app",
    description: "A voice-first journaling app with a vintage tape-deck interface. You hit record, talk for a few minutes, and Cassette transcribes, tags, and resurfaces your reflections over time. Built for people who think better out loud than on a keyboard.",
    audience: "Busy knowledge workers and founders aged 25–45 who want a journaling habit but bounce off blank-page text apps. Privacy-conscious, design-sensitive, iOS-first.",
    pricing: "Free tier (3 entries/week), Pro $7/mo unlimited + AI insights.",
    stage: "Pre-launch beta. ~40 TestFlight users, no paying customers yet.",
  },
  {
    name: "StudyFlow",
    url: "https://studyflow.app",
    description: "An AI-powered study planner that turns syllabi, lecture notes, and deadlines into personalized study schedules.",
    audience: "University students aged 18–25 struggling with time management and exam preparation.",
    pricing: "Free tier + Pro $5/mo",
    stage: "Early beta with 150 student users.",
  },
  {
    name: "InternTrack",
    url: "https://interntrack.app",
    description: "A centralized internship tracking platform where students manage applications, interviews, resumes, and networking activities.",
    audience: "College students actively applying for internships and placements.",
    pricing: "Free + Premium $4/mo",
    stage: "MVP with first 100 users.",
  },
  {
    name: "FitForge",
    url: "https://fitforge.app",
    description: "AI-powered workout and nutrition planning tailored to body goals, lifestyle, and available equipment.",
    audience: "Young professionals and fitness enthusiasts aged 20–35.",
    pricing: "Freemium + Pro $9/mo",
    stage: "Pre-launch waitlist of 500 users.",
  },
  {
    name: "LaunchLens",
    url: "https://launchlens.ai",
    description: "AI market research platform that analyzes competitors, trends, and customer sentiment before product launches.",
    audience: "Indie hackers, startup founders, and product managers.",
    pricing: "Starter $19/mo",
    stage: "Private beta.",
  },
  {
    name: "Roomie",
    url: "https://roomie.app",
    description: "Roommate matching platform that uses lifestyle preferences, schedules, and personality traits to find compatible roommates.",
    audience: "Students and young professionals moving to new cities.",
    pricing: "Free + Verified Match $8 one-time fee",
    stage: "Pilot in Bangalore.",
  },
];

function SetupView({ product, setProduct, setView }) {
  const [f, setF] = useState(product || { name: "", url: "", description: "", audience: "", pricing: "", stage: "" });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const ready = f.name && f.description && f.audience;

  const fields = [
    ["name", "Product name", "input", "e.g. Cassette"],
    ["url", "Product URL", "input", "https://…"],
    ["description", "Description", "textarea", "What does it do, for whom, and why does it matter?"],
    ["audience", "Target audience", "textarea", "Who exactly is the first user? Be specific."],
    ["pricing", "Pricing", "input", "e.g. Free + Pro $7/mo"],
    ["stage", "Stage", "input", "e.g. Pre-launch beta, 40 testers"],
  ];

  return (
    <div className="lp-up">
      <SectionHead icon={Rocket} kicker="Step 0 · Briefing"
        title="Mission Setup"
        sub="Give LaunchPilot the raw material. Everything downstream — strategy, content, video, the daily playbook — is built from this brief." />

        

      <Panel style={{ padding: 40, maxWidth: "none" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(320px, 1fr))", gap: 18 }}>
          {fields.map(([k, lbl, type, ph]) => (
            <div key={k} style={{ gridColumn: type === "textarea" ? "1 / -1" : "auto" }}>
              <Label>{lbl}</Label>
              {type === "textarea"
                ? <textarea className="lp-textarea" value={f[k]} onChange={set(k)} placeholder={ph} />
                : <input className="lp-input" value={f[k]} onChange={set(k)} placeholder={ph} />}
            </div>
          ))}
        </div>

        <div className="lp-divider" style={{ margin: "24px 0" }} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Btn
            disabled={!ready}
            onClick={async () => {
                const {
                data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                const { data: existing } = await supabase
                    .from("products")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("name", f.name)
                    .limit(1);

                    if (existing?.length) {
                    await supabase
                        .from("products")
                        .update({
                        url: f.url,
                        description: f.description,
                        audience: f.audience,
                        pricing: f.pricing,
                        stage: f.stage,
                        })
                        .eq("id", existing[0].id);
                    } else {
                    await supabase.from("products").insert([
                        {
                        user_id: user.id,
                        name: f.name,
                        url: f.url,
                        description: f.description,
                        audience: f.audience,
                        pricing: f.pricing,
                        stage: f.stage,
                        },
                    ]);
                    }

                setProduct(f);
                setView("intel");
            }}
        }
            >
            <Rocket size={15} /> Launch mission
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => {
                const random =
                SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
                setF(random);
            }}
            >
            <Sparkles size={14} /> Load sample product
            </Btn>
            <Btn
  variant="ghost"
  onClick={() => {
    setProduct(null);

    setF({
      name: "",
      url: "",
      description: "",
      audience: "",
      pricing: "",
      stage: "",
    });
  }}
>
  New Project
</Btn>
          {!ready && <span style={{ fontSize: 12.5, color: "var(--muted2)" }}>Name, description & audience required.</span>}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 18 }}>
        {[
          [Target, "Strategy", "Product intelligence, audience map, 50-hook message library."],
          [FileText, "Build", "Platform-tailored content, 100 ideas, full video asset packages."],
          [ListChecks, "Execute", "A daily first-10 playbook, outreach agent, and weekly experiments."],
        ].map(([Ic, t, d]) => (
          <div key={t} className="lp-card" style={{ padding: 16 }}>
            <Ic size={17} style={{ color: "var(--amber)" }} />
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 9 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Generic generative module hook
   ============================================================ */
function useGen(key, ctx, runner) {
  const {
      artifacts,
      setArt,
      product,
      analytics,
      setAnalytics,
    } = ctx;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const data = artifacts[key];

  const run = async () => {
    setBusy(true);
    setErr("");

    try {
      const out = await runner(product);

      setArt(key, out);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("generations").insert([
          {
            user_id: user.id,
            type: key,
            content: out,
          },
        ]);
      }
      setAnalytics((prev) => ({
      ...prev,
      generationCount: prev.generationCount + 1,
      lastGenerated: key,
    }));
    } catch (e) {
      setErr("Generation failed — " + (e.message || "try again."));
    } finally {
      setBusy(false);
    }
  };

  return { busy, err, data, run };
}

/* ============================================================
   2 — PRODUCT INTELLIGENCE
   ============================================================ */
function IntelView(ctx) {
  const g = useGen("intel", ctx, async (p) => callGemini(BASE_SYSTEM,
    `${productContext(p)}

Produce a Product Intelligence Profile. Return ONLY valid JSON:
{
 "problem":"the core problem solved, sharp and specific (2-3 sentences)",
 "icp":{"who":"...","trigger":"the moment they go looking for this","jobs":["job to be done", "..."]},
 "category":"the market category + a one-line frame on positioning within it",
 "alternatives":[{"name":"what they use today (incl. 'doing nothing')","why":"why it's the status quo","gap":"where it fails the ICP"}],
 "advantages":[{"edge":"a real competitive advantage","proof":"why it's credible / defensible"}],
 "wedge":"the single sharpest wedge to win the first 10 users",
 "risks":["the biggest risk to early traction", "..."]
}
4-5 alternatives, 3-4 advantages, 2-3 risks, 3 jobs.`,
    { json: true, maxTokens: 3000 }));

  return (
    <div className="lp-up">
      <SectionHead icon={Target} kicker="Step 1 · Strategy" title="Product Intelligence"
        sub="Before we acquire anyone, we get brutally clear on the problem, the ICP, the alternatives, and the one wedge worth betting on." />
      <ErrLine msg={g.err} />
      <GenBlock onGen={g.run} busy={g.busy} done={!!g.data} label="Analyzing problem, ICP, category, alternatives…"
        hint="Generate your Product Intelligence Profile from the brief.">
        {g.data && <IntelOut d={g.data} />}
      </GenBlock>
    </div>
  );
}
function IntelOut({ d }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel style={{ padding: 22, borderColor: "var(--amber-dim)" }}>
        <Badge>THE WEDGE</Badge>
        <p className="lp-display" style={{ fontSize: 19, fontWeight: 600, marginTop: 10, lineHeight: 1.4 }}>{d.wedge}</p>
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel style={{ padding: 20 }}>
          <Label>Problem solved</Label>
          <p className="lp-prose">{d.problem}</p>
        </Panel>
        <Panel style={{ padding: 20 }}>
          <Label>Ideal customer profile</Label>
          <p className="lp-prose"><strong>{d.icp.who}</strong></p>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}><strong style={{ color: "var(--cyan)" }}>Trigger:</strong> {d.icp.trigger}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {d.icp.jobs.map((j, i) => <span key={i} className="lp-chip">{j}</span>)}
          </div>
        </Panel>
      </div>
      <Panel style={{ padding: 20 }}>
        <Label>Category</Label>
        <p className="lp-prose">{d.category}</p>
      </Panel>
      <Panel style={{ padding: 20 }}>
        <Label>Alternatives & gaps</Label>
        <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
          {d.alternatives.map((a, i) => (
            <div key={i} className="lp-card" style={{ padding: 13 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{a.why}</div>
              <div style={{ fontSize: 12.5, color: "var(--red)", marginTop: 6 }}>↳ Gap: {a.gap}</div>
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel style={{ padding: 20 }}>
          <Label>Competitive advantages</Label>
          <div style={{ display: "grid", gap: 9, marginTop: 4 }}>
            {d.advantages.map((a, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--green)" }}>✓ {a.edge}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{a.proof}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel style={{ padding: 20 }}>
          <Label>Traction risks</Label>
          <div style={{ display: "grid", gap: 9, marginTop: 4 }}>
            {d.risks.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--txt2)" }}>
                <AlertTriangle size={14} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 2 }} /> {r}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ============================================================
   3 — AUDIENCE DISCOVERY
   ============================================================ */
const CH_ICON = { reddit: Hash, subreddit: Hash, linkedin: Users, slack: MessageCircle, discord: MessageCircle, forum: MessageCircle, newsletter: Mail, influencer: Megaphone, twitter: Hash, community: Users };
function AudienceView(ctx) {
  const g = useGen("audience", ctx, async (p) => callGemini(BASE_SYSTEM,
    `${productContext(p)}

Identify the specific places this product's first 10 users already gather. Return ONLY valid JSON:
{"channels":[
 {"name":"EXACT name (e.g. r/Journaling, 'Indie Hackers', a named newsletter/Slack)",
  "type":"reddit|subreddit|linkedin|slack|discord|forum|newsletter|influencer|twitter|community",
  "url":"best-guess url or handle",
  "density":0-100, "relevance":0-100, "engagement":0-100,
  "why":"why your ICP is here and what they talk about",
  "play":"the specific, non-spammy first move to make here this week"}
]}
Return 12 real, named channels across varied types. Use realistic communities for THIS audience. Score honestly — not everything is 90+.`,
    { json: true, maxTokens: 4000 }));

  const sorted = useMemo(() => {
    if (!g.data) return [];
    return [...g.data.channels].map((c) => ({ ...c, score: Math.round((c.density + c.relevance + c.engagement) / 3) }))
      .sort((a, b) => b.score - a.score);
  }, [g.data]);

  return (
    <div className="lp-up">
      <SectionHead icon={Compass} kicker="Step 2 · Strategy" title="Audience Discovery"
        sub="Where do your first 10 users already hang out? Ranked by audience density, relevance and engagement — with a non-spammy first move for each." />
      <ErrLine msg={g.err} />
      <GenBlock onGen={g.run} busy={g.busy} done={!!g.data} label="Mapping communities, ranking by density × relevance × engagement…"
        hint="Discover and rank the communities, newsletters and influencers your ICP already follows.">
        <div style={{ display: "grid", gap: 11 }}>
          {sorted.map((c, i) => {
            const Ic = CH_ICON[c.type] || Users;
            return (
              <Panel key={i} style={{ padding: 16, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--ink)", border: "1px solid var(--line2)", display: "grid", placeItems: "center" }}>
                  <Ic size={18} style={{ color: "var(--amber)" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span>
                    <Badge color="var(--cyan)">{c.type}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 5, lineHeight: 1.5 }}>{c.why}</div>
                  <div style={{ fontSize: 12.5, color: "var(--cyan)", marginTop: 6 }}>▸ Play: {c.play}</div>
                </div>
                <div style={{ width: 130 }}>
                  <div style={{ textAlign: "right", marginBottom: 7 }}>
                    <span className="lp-display" style={{ fontWeight: 800, fontSize: 22, color: scoreColor(c.score) }}>{c.score}</span>
                    <span className="lp-mono" style={{ fontSize: 9, color: "var(--muted2)", marginLeft: 3 }}>FIT</span>
                  </div>
                  {[["Density", c.density], ["Relevance", c.relevance], ["Engage", c.engagement]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span className="lp-mono" style={{ fontSize: 9, color: "var(--muted2)", width: 52 }}>{l}</span>
                      <div className="lp-bar" style={{ flex: 1 }}><i style={{ width: `${v}%` }} /></div>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>
      </GenBlock>
    </div>
  );
}
function scoreColor(s) { return s >= 80 ? "var(--green)" : s >= 60 ? "var(--amber)" : "var(--muted)"; }

/* ============================================================
   4 — MESSAGE DISCOVERY (incl. 50 hooks)
   ============================================================ */
function MessageView(ctx) {
  const g = useGen("message", ctx, async (p) => callGemini(BASE_SYSTEM,
    `${productContext(p)}

Generate the core messaging system. Return ONLY valid JSON:
{
 "valueProp":"one crisp sentence — the core value",
 "positioning":"For [ICP] who [need], [Product] is the [category] that [benefit], unlike [alternative].",
 "pitch":"a 2-3 sentence elevator pitch a founder could say out loud",
 "headline":"the landing-page hero headline (punchy, <12 words)",
 "subhead":"the supporting subheadline",
 "hooks":[{"text":"a scroll-stopping hook/opening line","angle":"curiosity|pain|contrarian|result|story|stat|question|bold-claim"}]
}
Generate EXACTLY 50 hooks, varied across angles and usable as first lines for posts/threads/cold messages. Make them specific to this product, not generic.`,
    { json: true, maxTokens: 8000 }));

  const [filter, setFilter] = useState("all");
  const angles = g.data ? ["all", ...Array.from(new Set(g.data.hooks.map((h) => h.angle)))] : [];
  const hooks = g.data ? g.data.hooks.filter((h) => filter === "all" || h.angle === filter) : [];

  return (
    <div className="lp-up">
      <SectionHead icon={MessageSquareText} kicker="Step 3 · Strategy" title="Message Discovery"
        sub="Your positioning, pitch, hero copy — and a 50-hook library you'll pull from for every post, thread and cold message." />
      <ErrLine msg={g.err} />
      <GenBlock onGen={g.run} busy={g.busy} done={!!g.data} label="Crafting positioning + writing 50 hooks…"
        hint="Generate the core value proposition, positioning, pitch, landing headline, and a library of 50 hooks.">
        {g.data && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Panel style={{ padding: 20, gridColumn: "1 / -1", borderColor: "var(--amber-dim)" }}>
              <Label>Landing page hero</Label>
              <h2 className="lp-display" style={{ fontSize: 26, fontWeight: 800, margin: "6px 0", lineHeight: 1.15 }}>{g.data.headline}</h2>
              <p style={{ color: "var(--muted)", fontSize: 15 }}>{g.data.subhead}</p>
            </Panel>
            {[["Value proposition", g.data.valueProp], ["Positioning statement", g.data.positioning], ["Elevator pitch", g.data.pitch]].map(([l, v]) => (
              <Panel key={l} style={{ padding: 18, gridColumn: l === "Elevator pitch" ? "1 / -1" : "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Label>{l}</Label><CopyBtn text={v} />
                </div>
                <p className="lp-prose" style={{ color: "var(--txt)" }}>{v}</p>
              </Panel>
            ))}
          </div>

          <Panel style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <Label>Hook library · {g.data.hooks.length} hooks</Label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {angles.map((a) => (
                  <button key={a} className="lp-chip" onClick={() => setFilter(a)}
                    style={{ cursor: "pointer", borderColor: filter === a ? "var(--amber)" : "var(--line2)", color: filter === a ? "var(--amber)" : "var(--txt2)" }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {hooks.map((h, i) => (
                <div key={i} className="lp-card" style={{ padding: "11px 13px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span className="lp-mono" style={{ fontSize: 10, color: "var(--muted2)", marginTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{h.text}</div>
                    <span className="lp-mono" style={{ fontSize: 9.5, color: "var(--cyan)", marginTop: 5, display: "inline-block" }}>{h.angle}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </>}
      </GenBlock>
    </div>
  );
}

/* ============================================================
   5 — CONTENT ENGINE
   ============================================================ */
const CONTENT_TYPES = [
  { id: "linkedin", label: "LinkedIn post", icon: Users },
  { id: "twitter", label: "Twitter/X thread", icon: Hash },
  { id: "reddit", label: "Reddit post", icon: Hash },
  { id: "blog", label: "Blog post", icon: BookOpen },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "founder", label: "Founder story", icon: Flame },
  { id: "update", label: "Product update", icon: Megaphone },
];
function ContentView(ctx) {
  const { artifacts, setArt, product } = ctx;
  const [type, setType] = useState("linkedin");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const store = artifacts.content || {};
  const out = store[type];

  const gen = async () => {
    setBusy(true); setErr("");
    try {
      const t = CONTENT_TYPES.find((c) => c.id === type).label;
      const text = await callGemini(BASE_SYSTEM,
        `${productContext(product)}

Write a ready-to-publish ${t} for this product, tailored to the platform's native format and norms.
${topic ? `Angle/topic to focus on: ${topic}` : "Pick the highest-converting angle for acquiring early users."}
Rules:
- ${type === "twitter" ? "Number each tweet (1/, 2/ …), keep each under 280 chars, strong hook first." : ""}
- ${type === "reddit" ? "Sound like a real founder sharing, NOT an ad. Lead with value/story. Soft mention of the product only." : ""}
- ${type === "linkedin" ? "Hook on line 1, short punchy lines, one clear takeaway, light formatting." : ""}
- ${type === "blog" ? "Include a working title (#), subheads (##), and a clear CTA." : ""}
- ${type === "newsletter" ? "Subject line first (Subject: …), then body, then CTA." : ""}
- ${type === "founder" ? "Personal, specific, vulnerable. The why behind the build." : ""}
- ${type === "update" ? "What shipped, why it matters to the user, what's next." : ""}
Return only the post text, formatted for copy-paste. No preamble.`,
        { maxTokens: 2500 });
      setArt("content", { ...store, [type]: text });
    } catch (e) { setErr("Generation failed — " + (e.message || "try again.")); }
    finally { setBusy(false); }
  };

  return (
    <div className="lp-up">
      <SectionHead icon={FileText} kicker="Build · Content Engine" title="Content Engine"
        sub="Platform-native content built from your positioning. Each format follows the norms of where it'll be posted — not copy-paste mush." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {CONTENT_TYPES.map((c) => (
          <button key={c.id} className="lp-chip" onClick={() => setType(c.id)}
            style={{ cursor: "pointer", padding: "8px 13px", borderColor: type === c.id ? "var(--amber)" : "var(--line2)", color: type === c.id ? "var(--amber)" : "var(--txt2)", background: type === c.id ? "var(--amber-dim)" : "var(--ink)" }}>
            <c.icon size={13} /> {c.label}
          </button>
        ))}
      </div>
      <Panel style={{ padding: 16, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Label>Angle / topic (optional)</Label>
          <input className="lp-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. why we killed the blank text box" />
        </div>
        <Btn onClick={gen} disabled={busy}>{busy ? <Loader2 size={15} className="lp-spin" /> : <Sparkles size={15} />} Write</Btn>
      </Panel>
      <ErrLine msg={err} />
      {busy && <Panel className="lp-scan" style={{ padding: 36, textAlign: "center" }}><Loader2 size={24} className="lp-spin" style={{ color: "var(--amber)" }} /><p className="lp-mono" style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>Drafting platform-native copy…</p></Panel>}
      {!busy && out && (
        <Panel style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Badge color="var(--cyan)">{CONTENT_TYPES.find((c) => c.id === type).label}</Badge>
            <CopyBtn text={out} />
          </div>
          <div className="lp-prose" style={{ color: "var(--txt)", fontSize: 14.5 }}>{out}</div>
        </Panel>
      )}
      {!busy && !out && <Panel style={{ padding: 36, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Pick a format and hit Write.</Panel>}
    </div>
  );
}

/* ============================================================
   6 — CONTENT STUDIO (100 ideas × 5 angles)
   ============================================================ */
const ANGLES = [
  { id: "beginner", label: "Beginner", color: "var(--cyan)" },
  { id: "founder", label: "Founder", color: "var(--amber)" },
  { id: "contrarian", label: "Contrarian", color: "var(--red)" },
  { id: "educational", label: "Educational", color: "var(--green)" },
  { id: "casestudy", label: "Case Study", color: "var(--violet)" },
];
function IdeasView(ctx) {
  const g = useGen("ideas", ctx, async (p) => callGemini(BASE_SYSTEM,
    `${productContext(p)}

Generate 100 content ideas (titles/angles) for this product — 20 each across these 5 angles:
beginner, founder, contrarian, educational, casestudy.
Return ONLY valid JSON:
{"ideas":[{"title":"specific, clickable content idea","angle":"beginner|founder|contrarian|educational|casestudy","format":"suggested format e.g. LinkedIn post / X thread / blog / short video"}]}
Make them specific to this product and audience. Exactly 100 ideas.`,
    { json: true, maxTokens: 8000 }));

  const [filter, setFilter] = useState("all");
  const ideas = g.data ? g.data.ideas.filter((i) => filter === "all" || i.angle === filter) : [];
  const counts = g.data ? ANGLES.map((a) => ({ ...a, n: g.data.ideas.filter((i) => i.angle === a.id).length })) : [];

  return (
    <div className="lp-up">
      <SectionHead icon={Lightbulb} kicker="Build · AI Content Studio" title="Content Studio"
        sub="100 content ideas from one product, spread across five angles. A month-plus of raw material in one click." />
      <ErrLine msg={g.err} />
      <GenBlock onGen={g.run} busy={g.busy} done={!!g.data} label="Generating 100 ideas across 5 angles…"
        hint="Generate 100 content ideas across beginner, founder, contrarian, educational and case-study angles.">
        {g.data && <>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
            <button className="lp-chip" onClick={() => setFilter("all")} style={{ cursor: "pointer", borderColor: filter === "all" ? "var(--amber)" : "var(--line2)", color: filter === "all" ? "var(--amber)" : "var(--txt2)" }}>All · {g.data.ideas.length}</button>
            {counts.map((a) => (
              <button key={a.id} className="lp-chip" onClick={() => setFilter(a.id)}
                style={{ cursor: "pointer", borderColor: filter === a.id ? a.color : "var(--line2)", color: filter === a.id ? a.color : "var(--txt2)" }}>
                {a.label} · {a.n}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {ideas.map((idea, i) => {
              const ang = ANGLES.find((a) => a.id === idea.angle) || ANGLES[0];
              return (
                <div key={i} className="lp-card" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13.5, lineHeight: 1.4, fontWeight: 500 }}>{idea.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    <span className="lp-badge" style={{ color: ang.color, background: `${ang.color}1a`, border: `1px solid ${ang.color}33` }}>{ang.label}</span>
                    <span className="lp-mono" style={{ fontSize: 10, color: "var(--muted2)" }}>{idea.format}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>}
      </GenBlock>
    </div>
  );
}

/* ============================================================
   7 — VIDEO STUDIO
   ============================================================ */
const VIDEO_TYPES = ["Short-form (vertical)", "Founder video", "Product demo", "Tutorial", "Launch video"];
const VIDEO_TOOLS = ["Veo", "Runway", "Synthesia", "ElevenLabs"];
function VideoView(ctx) {
  const { artifacts, setArt, product } = ctx;
  const [vtype, setVtype] = useState(VIDEO_TYPES[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const store = artifacts.video || {};
  const out = store[vtype];

  const gen = async () => {
    setBusy(true); setErr("");
    try {
      const d = await callGemini(BASE_SYSTEM,
        `${productContext(product)}

Produce a complete, production-ready video asset package for a "${vtype}" promoting this product.
Return ONLY valid JSON:
{
 "concept":"the one-line creative concept",
 "duration":"target length",
 "script":[{"time":"0:00-0:03","vo":"voiceover line","onscreen":"on-screen text"}],
 "shotList":[{"shot":"shot description","type":"e.g. close-up / screen-rec / b-roll / talking head"}],
 "visualPrompts":{
   "veo":"a ready-to-paste Google Veo prompt for the key generative shot",
   "runway":"a ready-to-paste Runway Gen prompt for an alt shot"
 },
 "voiceover":{"elevenlabs":"the full clean VO script for ElevenLabs, with [pause] cues", "voice":"suggested voice/tone"},
 "synthesia":"a Synthesia avatar script (if a presenter format fits) or note why not",
 "captions":["punchy burned-in caption line", "..."],
 "thumbnail":["thumbnail/cover idea", "..."]
}
6-8 script beats, 5-6 shots, 5 captions, 3 thumbnail ideas. Make it specific and shootable by a solo founder.`,
        { json: true, maxTokens: 5000 });
      setArt("video", { ...store, [vtype]: d });
    } catch (e) { setErr("Generation failed — " + (e.message || "try again.")); }
    finally { setBusy(false); }
  };

  return (
    <div className="lp-up">
      <SectionHead icon={Clapperboard} kicker="Build · AI Video Studio" title="Video Studio"
        sub="Full video asset packages — script, shot list, generative prompts, voiceover and captions — wired for Veo, Runway, Synthesia and ElevenLabs." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {VIDEO_TYPES.map((t) => (
          <button key={t} className="lp-chip" onClick={() => setVtype(t)}
            style={{ cursor: "pointer", padding: "8px 13px", borderColor: vtype === t ? "var(--amber)" : "var(--line2)", color: vtype === t ? "var(--amber)" : "var(--txt2)", background: vtype === t ? "var(--amber-dim)" : "var(--ink)" }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Btn onClick={gen} disabled={busy}>{busy ? <Loader2 size={15} className="lp-spin" /> : <Sparkles size={15} />} Generate package</Btn>
        <div style={{ display: "flex", gap: 6 }}>
          {VIDEO_TOOLS.map((t) => <span key={t} className="lp-chip" style={{ fontSize: 10.5 }}><Radio size={10} style={{ color: "var(--cyan)" }} /> {t}</span>)}
        </div>
      </div>
      <ErrLine msg={err} />
      {busy && <Panel className="lp-scan" style={{ padding: 36, textAlign: "center" }}><Loader2 size={24} className="lp-spin" style={{ color: "var(--amber)" }} /><p className="lp-mono" style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>Building script, shot list, prompts, VO…</p></Panel>}
      {!busy && out && <VideoOut d={out} />}
      {!busy && !out && <Panel style={{ padding: 36, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Pick a video type and generate the full package.</Panel>}
    </div>
  );
}
function VideoOut({ d }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel style={{ padding: 20, borderColor: "var(--amber-dim)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Badge>CONCEPT</Badge><span className="lp-mono" style={{ fontSize: 11, color: "var(--cyan)" }}>{d.duration}</span>
        </div>
        <p className="lp-display" style={{ fontSize: 18, fontWeight: 600, marginTop: 10 }}>{d.concept}</p>
      </Panel>

      <Panel style={{ padding: 20 }}>
        <Label>Script · timed</Label>
        <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
          {d.script.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 12, padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
              <span className="lp-mono" style={{ fontSize: 11, color: "var(--amber)" }}>{s.time}</span>
              <div>
                <div style={{ fontSize: 13.5 }}>{s.vo}</div>
                {s.onscreen && <div style={{ fontSize: 11.5, color: "var(--cyan)", marginTop: 3 }}>▸ on-screen: {s.onscreen}</div>}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel style={{ padding: 20 }}>
          <Label>Shot list</Label>
          <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
            {d.shotList.map((s, i) => (
              <div key={i} className="lp-card" style={{ padding: 11 }}>
                <div style={{ fontSize: 13 }}>{s.shot}</div>
                <span className="lp-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{s.type}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel style={{ padding: 20 }}>
          <Label>Captions (burned-in)</Label>
          <div style={{ display: "grid", gap: 7, marginTop: 6 }}>
            {d.captions.map((c, i) => <div key={i} className="lp-chip" style={{ fontSize: 12.5 }}>{c}</div>)}
          </div>
          <Label style={{ marginTop: 16 }}>Thumbnail ideas</Label>
          <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
            {d.thumbnail.map((c, i) => <div key={i} style={{ fontSize: 12.5, color: "var(--txt2)" }}>• {c}</div>)}
          </div>
        </Panel>
      </div>

      <Panel style={{ padding: 20 }}>
        <Label>Generative prompts</Label>
        <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
          {[["Veo", d.visualPrompts?.veo], ["Runway", d.visualPrompts?.runway]].map(([t, v]) => v && (
            <div key={t} className="lp-card" style={{ padding: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <Badge color="var(--violet)">{t}</Badge><CopyBtn text={v} />
              </div>
              <div className="lp-mono" style={{ fontSize: 12, color: "var(--txt2)", lineHeight: 1.55 }}>{v}</div>
            </div>
          ))}
          <div className="lp-card" style={{ padding: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <Badge color="var(--cyan)">ElevenLabs · {d.voiceover?.voice}</Badge><CopyBtn text={d.voiceover?.elevenlabs || ""} />
            </div>
            <div className="lp-prose" style={{ fontSize: 13 }}>{d.voiceover?.elevenlabs}</div>
          </div>
          {d.synthesia && (
            <div className="lp-card" style={{ padding: 13 }}>
              <Badge color="var(--green)">Synthesia</Badge>
              <div className="lp-prose" style={{ fontSize: 13, marginTop: 6 }}>{d.synthesia}</div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

/* ============================================================
   8 — FIRST 10 USER PLAYBOOK
   ============================================================ */
function PlaybookView(ctx) {
  const { setUsersAcquired, usersAcquired } = ctx;
  const [done, setDone] = useState({});
  const g = useGen("playbook", ctx, async (p) => callGemini(BASE_SYSTEM,
    `${productContext(p)}

Build a day-by-day execution playbook to acquire the FIRST 10 ACTIVATED users. Return ONLY valid JSON:
{"days":[
 {"day":1,"theme":"short theme","goal":"the outcome this day drives toward (users, learning, or asset)",
  "tasks":[{"task":"one concrete, time-boxed action","detail":"exactly how / where / who","time":"~30m"}]}
]}
Cover ~14 days. Each day 2-4 tasks. Front-load direct outreach + community presence over passive content. Tie days to the goal of 10 users. Be specific to this product (name real channels, real numbers).`,
    { json: true, maxTokens: 6000 }));

  const total = g.data ? g.data.days.reduce((n, d) => n + d.tasks.length, 0) : 0;
  const completed = Object.values(done).filter(Boolean).length;

  return (
    <div className="lp-up">
      <SectionHead icon={ListChecks} kicker="Execute · First-10 Playbook" title="First-10 User Playbook"
        sub="A daily, time-boxed plan that runs until you have 10 activated users. Built to optimize for users — not content output." />
      <ErrLine msg={g.err} />

      {g.data && (
        <Panel style={{ padding: 16, marginBottom: 16, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div className="lp-mono" style={{ fontSize: 10, color: "var(--muted)" }}>TASKS DONE</div>
            <div className="lp-display" style={{ fontWeight: 800, fontSize: 22 }}>{completed}<span style={{ color: "var(--muted2)", fontSize: 14 }}>/{total}</span></div>
          </div>
          <div className="lp-divider" style={{ width: 1, height: 36, background: "var(--line2)" }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="lp-mono" style={{ fontSize: 10, color: "var(--muted)" }}>USERS ACQUIRED — log progress as it happens</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Btn variant="ghost" size="sm" onClick={() => setUsersAcquired(Math.max(0, usersAcquired - 1))}><Minus size={13} /></Btn>
              <span className="lp-display" style={{ fontWeight: 800, fontSize: 24, color: "var(--amber)" }}>{usersAcquired}<span style={{ color: "var(--muted2)", fontSize: 14 }}>/10</span></span>
              <Btn size="sm" onClick={() => setUsersAcquired(Math.min(10, usersAcquired + 1))}><Plus size={13} /></Btn>
              {usersAcquired >= 10 && <Badge color="var(--green)">🎉 MISSION COMPLETE</Badge>}
            </div>
          </div>
        </Panel>
      )}

      <GenBlock onGen={g.run} busy={g.busy} done={!!g.data} label="Sequencing a ~14-day acquisition plan…"
        hint="Generate a day-by-day playbook that runs until your first 10 users.">
        {g.data && (
          <div style={{ display: "grid", gap: 12 }}>
            {g.data.days.map((day) => (
              <Panel key={day.day} style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(150deg,var(--amber2),var(--amber))", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <span className="lp-display" style={{ fontWeight: 800, fontSize: 17, color: "#1a0e02" }}>{day.day}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{day.theme}</div>
                    <div style={{ fontSize: 12, color: "var(--cyan)" }}>🎯 {day.goal}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 7 }}>
                  {day.tasks.map((t, ti) => {
                    const key = `${day.day}-${ti}`;
                    const isDone = done[key];
                    return (
                      <button key={ti} onClick={() => setDone((d) => ({ ...d, [key]: !d[key] }))}
                        className="lp-card" style={{ padding: "11px 13px", display: "flex", gap: 11, alignItems: "flex-start", textAlign: "left", cursor: "pointer", borderColor: isDone ? "var(--green)" : "var(--line)" }}>
                        <div style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${isDone ? "var(--green)" : "var(--line2)"}`, background: isDone ? "var(--green)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                          {isDone && <Check size={12} style={{ color: "#06210f" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.6 : 1 }}>{t.task}</span>
                            <span className="lp-mono" style={{ fontSize: 10, color: "var(--muted2)", flexShrink: 0 }}>{t.time}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{t.detail}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            ))}
          </div>
        )}
      </GenBlock>
    </div>
  );
}

/* ============================================================
   9 — ACQUISITION AGENT
   ============================================================ */
const OUTREACH_TYPES = [
  { id: "cold", label: "Cold outreach (DM)" },
  { id: "referral", label: "Referral request" },
  { id: "partnership", label: "Partnership request" },
  { id: "influencer", label: "Influencer outreach" },
  { id: "beta", label: "Beta invitation" },
];
function AgentView(ctx) {
  const { artifacts, setArt, product } = ctx;
  const [otype, setOtype] = useState("cold");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const store = artifacts.agent || {};
  const out = store[otype];

  const gen = async () => {
    setBusy(true); setErr("");
    try {
      const t = OUTREACH_TYPES.find((o) => o.id === otype).label;
      const d = await callGemini(BASE_SYSTEM,
        `${productContext(product)}

Write 3 variants of a "${t}" message to help acquire early users. Return ONLY valid JSON:
{"variants":[{"angle":"short label of the strategy","subject":"subject line if relevant, else empty","body":"the message — short, human, specific, no corporate tone","why":"one line: why this works"}]}
Rules: personalized feel, value-first, soft ask, no spam. Reference the real product. Keep DMs under ~90 words.`,
        { json: true, maxTokens: 2500 });
      setArt("agent", { ...store, [otype]: d });
    } catch (e) { setErr("Generation failed — " + (e.message || "try again.")); }
    finally { setBusy(false); }
  };

  return (
    <div className="lp-up">
      <SectionHead icon={Send} kicker="Execute · Acquisition Agent" title="User Acquisition Agent"
        sub="Outreach, referral, partnership, influencer and beta-invite messages — three angles each, written to start conversations, not get ignored." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {OUTREACH_TYPES.map((o) => (
          <button key={o.id} className="lp-chip" onClick={() => setOtype(o.id)}
            style={{ cursor: "pointer", padding: "8px 13px", borderColor: otype === o.id ? "var(--amber)" : "var(--line2)", color: otype === o.id ? "var(--amber)" : "var(--txt2)", background: otype === o.id ? "var(--amber-dim)" : "var(--ink)" }}>
            {o.label}
          </button>
        ))}
      </div>
      <Btn onClick={gen} disabled={busy} className="lp-up" >{busy ? <Loader2 size={15} className="lp-spin" /> : <Sparkles size={15} />} Generate messages</Btn>
      <div style={{ height: 16 }} />
      <ErrLine msg={err} />
      {busy && <Panel className="lp-scan" style={{ padding: 36, textAlign: "center" }}><Loader2 size={24} className="lp-spin" style={{ color: "var(--amber)" }} /><p className="lp-mono" style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>Writing outreach variants…</p></Panel>}
      {!busy && out && (
        <div style={{ display: "grid", gap: 12 }}>
          {out.variants.map((v, i) => (
            <Panel key={i} style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Badge color="var(--cyan)">{v.angle}</Badge>
                <CopyBtn text={(v.subject ? `Subject: ${v.subject}\n\n` : "") + v.body} />
              </div>
              {v.subject && <div style={{ fontSize: 13, marginBottom: 8 }}><span className="lp-mono" style={{ color: "var(--muted2)", fontSize: 11 }}>SUBJECT</span> &nbsp;{v.subject}</div>}
              <div className="lp-prose" style={{ color: "var(--txt)" }}>{v.body}</div>
              <div style={{ fontSize: 12, color: "var(--green)", marginTop: 10 }}>✓ {v.why}</div>
            </Panel>
          ))}
        </div>
      )}
      {!busy && !out && <Panel style={{ padding: 36, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Pick an outreach type and generate.</Panel>}
    </div>
  );
}

/* ============================================================
   10 — DISTRIBUTION ENGINE
   ============================================================ */
function DistroView(ctx) {
  const g = useGen("distro", ctx, async (p) => callGemini(BASE_SYSTEM,
    `${productContext(p)}

Build a distribution plan: for each content asset type, recommend where to post, best timing, audience fit and a realistic expected reach for a pre-traction founder. Return ONLY valid JSON:
{"plan":[
 {"channel":"specific channel (named community / platform)","asset":"what to post there",
  "timing":"best day/time","fit":0-100,"reach":"realistic reach estimate for a small account",
  "priority":"high|medium|low","note":"one tactical note"}
]}
Return 8-10 rows, sorted by priority. Be realistic about reach for someone with no audience yet.`,
    { json: true, maxTokens: 3500 }));

  const sorted = g.data ? [...g.data.plan].sort((a, b) => (b.fit) - (a.fit)) : [];
  const pColor = { high: "var(--green)", medium: "var(--amber)", low: "var(--muted)" };

  return (
    <div className="lp-up">
      <SectionHead icon={Share2} kicker="Execute · Distribution" title="Distribution Engine"
        sub="Content is worthless unseen. This maps each asset to the right channel, timing and audience fit — and prioritizes where to spend your limited hours." />
      <ErrLine msg={g.err} />
      <GenBlock onGen={g.run} busy={g.busy} done={!!g.data} label="Prioritizing channels by fit and reach…"
        hint="Generate a prioritized distribution plan: where to post, when, and expected reach.">
        {g.data && (
          <Panel style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr .8fr .8fr .6fr", gap: 0, padding: "12px 18px", borderBottom: "1px solid var(--line2)", background: "var(--ink)" }}>
              {["Channel", "Asset & note", "Timing", "Reach", "Fit"].map((h) => <span key={h} className="lp-mono" style={{ fontSize: 10, letterSpacing: ".08em", color: "var(--muted)" }}>{h.toUpperCase()}</span>)}
            </div>
            {sorted.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr .8fr .8fr .6fr", gap: 0, padding: "14px 18px", borderBottom: i < sorted.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.channel}</div>
                  <span className="lp-badge" style={{ marginTop: 4, color: pColor[r.priority], background: `${pColor[r.priority]}1a`, border: `1px solid ${pColor[r.priority]}33` }}>{r.priority}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--txt2)", paddingRight: 10 }}>{r.asset}<div style={{ color: "var(--muted2)", fontSize: 11.5, marginTop: 3 }}>{r.note}</div></div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.timing}</div>
                <div className="lp-mono" style={{ fontSize: 12, color: "var(--cyan)" }}>{r.reach}</div>
                <div className="lp-display" style={{ fontWeight: 800, fontSize: 18, color: scoreColor(r.fit) }}>{r.fit}</div>
              </div>
            ))}
          </Panel>
        )}
      </GenBlock>
    </div>
  );
}

/* ============================================================
   11 — GROWTH EXPERIMENTS
   ============================================================ */
function ExperimentsView(ctx) {
  const g = useGen("experiments", ctx, async (p) => callGemini(BASE_SYSTEM,
    `${productContext(p)}

Design 5 growth experiments to run this week toward the first 10 users. Return ONLY valid JSON:
{"experiments":[
 {"name":"experiment name","hypothesis":"If we X, then Y, because Z",
  "type":"founder-led|community|referral|teardown|interviews|content|outbound",
  "steps":["step", "..."], "metric":"the single metric that proves it worked",
  "effort":"low|medium|high","leverage":"low|medium|high"}
]}
Make them runnable solo in a week. 3-4 steps each. Bias toward direct, high-learning experiments.`,
    { json: true, maxTokens: 4000 }));

  const [results, setResults] = useState({});
  const lvColor = { low: "var(--muted)", medium: "var(--amber)", high: "var(--green)" };

  return (
    <div className="lp-up">
      <SectionHead icon={FlaskConical} kicker="Execute · Experiments" title="Growth Experiments"
        sub="Weekly, falsifiable experiments — each with a hypothesis and a single success metric. Log results to learn what actually moves users." />
      <ErrLine msg={g.err} />
      <GenBlock onGen={g.run} busy={g.busy} done={!!g.data} label="Designing this week's experiments…"
        hint="Generate 5 runnable growth experiments with hypotheses and success metrics.">
        {g.data && (
          <div style={{ display: "grid", gap: 12 }}>
            {g.data.experiments.map((e, i) => (
              <Panel key={i} style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15.5 }}>{e.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--cyan)", marginTop: 4, fontStyle: "italic" }}>{e.hypothesis}</div>
                  </div>
                  <Badge color="var(--violet)">{e.type}</Badge>
                </div>
                <div style={{ display: "flex", gap: 16, margin: "14px 0", flexWrap: "wrap" }}>
                  <span className="lp-chip" style={{ fontSize: 11 }}>Effort: <b style={{ color: lvColor[e.effort], marginLeft: 4 }}>{e.effort}</b></span>
                  <span className="lp-chip" style={{ fontSize: 11 }}>Leverage: <b style={{ color: lvColor[e.leverage], marginLeft: 4 }}>{e.leverage}</b></span>
                  <span className="lp-chip" style={{ fontSize: 11 }}>📏 {e.metric}</span>
                </div>
                <div style={{ display: "grid", gap: 5, marginBottom: 12 }}>
                  {e.steps.map((s, si) => (
                    <div key={si} style={{ display: "flex", gap: 9, fontSize: 13, color: "var(--txt2)" }}>
                      <span className="lp-mono" style={{ color: "var(--amber)", fontSize: 11 }}>{si + 1}</span> {s}
                    </div>
                  ))}
                </div>
                <input className="lp-input" placeholder="Log result / what you learned…" value={results[i] || ""} onChange={(ev) => setResults((r) => ({ ...r, [i]: ev.target.value }))} style={{ fontSize: 13 }} />
              </Panel>
            ))}
          </div>
        )}
      </GenBlock>
    </div>
  );
}

/* ============================================================
   12 — GTM DASHBOARD + POSTHOG
   ============================================================ */
function seedSeries(seedStr) {
  // deterministic pseudo-random based on product name so the demo feels stable
  let h = 0; for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  const rnd = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  const days = [];
  let visits = 8 + Math.floor(rnd() * 10);
  for (let d = 1; d <= 14; d++) {
    visits = Math.max(4, visits + Math.floor(rnd() * 14 - 4));
    const signups = Math.max(0, Math.round(visits * (0.06 + rnd() * 0.06)));
    const activated = Math.max(0, Math.round(signups * (0.4 + rnd() * 0.3)));
    days.push({ day: `D${d}`, visits, signups, activated });
  }
  return days;
}
const SOURCES = (seed) => {
  const base = [["Reddit", 34], ["LinkedIn", 22], ["Direct DMs", 18], ["Newsletter", 14], ["X / Twitter", 8], ["Referral", 4]];
  return base.map(([name, v]) => ({ name, value: v }));
};

async function connectProxy(url, setLive) {
  const base = (url || "").trim().replace(/\/+$/, "");
  if (!base) return;
  setLive({ url: base, status: "connecting", payload: null, syncedAt: null, error: "" });
  try {
    const h = await fetch(base + "/api/health");
    const hj = await h.json().catch(() => ({}));
    if (!h.ok || hj.ok === false) throw new Error(hj.error || `health check failed (${h.status})`);
    if (hj.posthog === "missing-keys") throw new Error("Proxy is reachable but its PostHog keys aren't set (.env)");
    const m = await fetch(base + "/api/metrics?days=14");
    const mj = await m.json();
    if (!m.ok) throw new Error(mj.error || `metrics fetch failed (${m.status})`);
    setLive({ url: base, status: "live", payload: mj, syncedAt: mj.syncedAt || new Date().toISOString(), error: "" });
  } catch (e) {
    setLive((l) => ({ ...(l || {}), url: base, status: "error", payload: null, error: e.message || "could not reach proxy" }));
  }
}
async function sendTestEvent(url, setMsg) {
  setMsg("sending…");
  try {
    const r = await fetch(url.replace(/\/+$/, "") + "/api/capture", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "launchpilot_test", distinct_id: "launchpilot-dashboard", properties: { source: "launchpilot" } }),
    });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok && j.ok ? "test event sent ✓" : "failed: " + (j.error || r.status));
  } catch (e) { setMsg("failed: " + e.message); }
}

function LiveBar({ live, setLive }) {
  const [url, setUrl] = useState(live.url || "");
  const [testMsg, setTestMsg] = useState("");
  const st = live.status;
  const pill = {
    off: ["var(--muted)", "SAMPLE DATA"], connecting: ["var(--cyan)", "CONNECTING…"],
    live: ["var(--green)", "LIVE"], error: ["var(--red)", "OFFLINE"],
  }[st] || ["var(--muted)", "SAMPLE"];

  return (
    <Panel style={{ padding: 14, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span className="lp-badge" style={{ color: pill[0], background: `${pill[0]}1a`, border: `1px solid ${pill[0]}33` }}>
          <Radio size={11} className={st === "live" || st === "connecting" ? "lp-pulse" : ""} /> {pill[1]}
        </span>
        <input className="lp-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="PostHog proxy URL  ·  e.g. http://localhost:8787"
          style={{ flex: 1, minWidth: 220, fontSize: 13 }} />
        {st === "live"
          ? <>
              <Btn variant="ghost" size="sm" onClick={() => connectProxy(url, setLive)}><RefreshCw size={12} /> Refresh</Btn>
              <Btn variant="ghost" size="sm" onClick={() => sendTestEvent(url, setTestMsg)}><Send size={12} /> Test event</Btn>
              <Btn variant="ghost" size="sm" onClick={() => setLive({ url, status: "off", payload: null, syncedAt: null, error: "" })}>Disconnect</Btn>
            </>
          : <Btn size="sm" disabled={st === "connecting"} onClick={() => connectProxy(url, setLive)}>
              {st === "connecting" ? <Loader2 size={12} className="lp-spin" /> : <Zap size={12} />} Connect
            </Btn>}
      </div>
      {st === "live" && (
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 9, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span>Live from PostHog · synced {live.syncedAt ? new Date(live.syncedAt).toLocaleTimeString() : "now"}</span>
          {testMsg && <span style={{ color: testMsg.includes("✓") ? "var(--green)" : testMsg === "sending…" ? "var(--cyan)" : "var(--red)" }}>{testMsg}</span>}
        </div>
      )}
      {st === "error" && (
        <div style={{ fontSize: 12, color: "var(--red)", marginTop: 9, display: "flex", gap: 7, alignItems: "flex-start" }}>
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Couldn't reach the proxy — <b>{live.error}</b>. Showing sample data. (In the artifact preview the sandbox blocks localhost calls; run LaunchPilot in your own app to connect.)</span>
        </div>
      )}
      {st === "off" && (
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 9 }}>
          Showing sample data seeded from your product. Start the included <span className="lp-mono" style={{ color: "var(--txt2)" }}>posthog-proxy</span> and connect to replace it with live metrics.
        </div>
      )}
    </Panel>
  );
}

const FUNNEL_COLORS = ["var(--muted)", "var(--cyan)", "var(--amber)", "var(--green)", "var(--violet)"];

function DashboardView(ctx) {
    const { analytics } = ctx;
  const { product, usersAcquired, live, setLive } = ctx;
  const seeded = useMemo(() => seedSeries(product.name || "x"), [product.name]);
  const seededSources = useMemo(() => SOURCES(product.name), [product.name]);
  const isLive = live.status === "live" && live.payload;
  const p = isLive ? live.payload : null;

  const data = isLive ? p.series : seeded;
  const sources = isLive ? p.sources : seededSources;
  const totals = isLive
    ? p.totals
    : data.reduce((a, d) => ({ visits: a.visits + d.visits, signups: a.signups + d.signups, activated: a.activated + d.activated }), { visits: 0, signups: 0, activated: 0 });
  const convRate = totals.visits ? ((totals.signups / totals.visits) * 100).toFixed(1) : "0.0";
  const actRate = totals.signups ? ((totals.activated / totals.signups) * 100).toFixed(0) : 0;

  const funnel = isLive
    ? p.funnel.map((s, i) => ({ ...s, color: FUNNEL_COLORS[i] || "var(--amber)" }))
    : [
        { stage: "Landing visits", n: totals.visits, color: "var(--muted)" },
        { stage: "Signups", n: totals.signups, color: "var(--cyan)" },
        { stage: "Activated", n: totals.activated, color: "var(--amber)" },
        { stage: "Retained (D7)", n: Math.round(totals.activated * 0.55), color: "var(--green)" },
        { stage: "Referred a friend", n: Math.round(totals.activated * 0.18), color: "var(--violet)" },
      ];
  const trendDays = isLive ? `${data.length} days` : "14 days";

  return (
    <div className="lp-up">
      <SectionHead icon={LayoutDashboard} kicker="Briefing · Command" title="GTM Dashboard"
        sub="Your acquisition cockpit. Funnels, sources and retention in one view. Connect the PostHog proxy for live numbers; otherwise it runs on sample data." />

      <LiveBar live={live} setLive={setLive} />

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 12,
    marginBottom: 16,
  }}
>
  <Kpi
    icon={Rocket}
    label="Projects"
    value={analytics.projectCount}
    accent="var(--amber)"
  />

  <Kpi
    icon={FileText}
    label="Generations"
    value={analytics.generationCount}
    accent="var(--cyan)"
  />

  <Kpi
    icon={Sparkles}
    label="Most Used"
    value={analytics.mostUsed}
    accent="var(--green)"
  />

  <Kpi
    icon={TrendingUp}
    label="Last Generated"
    value={analytics.lastGenerated}
    accent="var(--violet)"
  />
</div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 16 }}>
        <Kpi icon={TrendingUp} label="Landing visits" value={fmtNum(totals.visits)} accent="var(--cyan)" />
        <Kpi icon={Users} label="Signups" value={fmtNum(totals.signups)} sub={`${convRate}% conv`} accent="var(--amber)" />
        <Kpi icon={Zap} label="Activated" value={fmtNum(totals.activated)} sub={`${actRate}% of signups`} accent="var(--green)" />
        <Kpi icon={Gauge} label="First-10 progress" value={`${usersAcquired}/10`} accent="var(--amber)" />
        <Kpi icon={Crosshair} label="Cost / user" value="$0" sub="founder-led" accent="var(--violet)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
        <Panel style={{ padding: 20 }}>
          <Label>Acquisition trend · {trendDays}</Label>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data} margin={{ top: 12, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3fe0d0" stopOpacity={0.4} /><stop offset="100%" stopColor="#3fe0d0" stopOpacity={0} /></linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff7a18" stopOpacity={0.5} /><stop offset="100%" stopColor="#ff7a18" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#222b38" vertical={false} />
              <XAxis dataKey="day" stroke="#586474" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#586474" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0f131a", border: "1px solid #2c3848", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "#9ba6b4" }} />
              <Area type="monotone" dataKey="visits" stroke="#3fe0d0" strokeWidth={2} fill="url(#gV)" />
              <Area type="monotone" dataKey="activated" stroke="#ff7a18" strokeWidth={2} fill="url(#gA)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel style={{ padding: 20 }}>
          <Label>Referral sources</Label>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={sources} layout="vertical" margin={{ top: 10, right: 14, left: 10, bottom: 0 }}>
              <CartesianGrid stroke="#222b38" horizontal={false} />
              <XAxis type="number" stroke="#586474" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#9ba6b4" fontSize={11.5} tickLine={false} axisLine={false} width={78} />
              <Tooltip contentStyle={{ background: "#0f131a", border: "1px solid #2c3848", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#161c2680" }} />
              <Bar dataKey="value" fill="#ff7a18" radius={[0, 5, 5, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Funnel + cohort */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Panel style={{ padding: 20 }}>
          <Label>Activation funnel</Label>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {funnel.map((s, i) => {
              const pct = Math.round((s.n / funnel[0].n) * 100);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5 }}>{s.stage}</span>
                    <span className="lp-mono" style={{ fontSize: 12, color: "var(--txt2)" }}>{s.n} · {pct}%</span>
                  </div>
                  <div className="lp-bar" style={{ height: 9 }}><i style={{ width: `${pct}%`, background: s.color }} /></div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel style={{ padding: 20 }}>
          <Label>Weekly retention cohorts</Label>
          {isLive && p.retention && p.retention.length
            ? <LiveCohortGrid data={p.retention} />
            : <CohortGrid seed={product.name} />}
          {isLive && (!p.retention || !p.retention.length) && (
            <div style={{ fontSize: 11.5, color: "var(--muted2)", marginTop: 10 }}>No activated-user cohorts yet — retention fills in once users hit the <span className="lp-mono">activated</span> event.</div>
          )}
        </Panel>
      </div>

      <PostHogPanel product={product} />
    </div>
  );
}
function Kpi({ icon: Icon, label, value, sub, accent }) {
  return (
    <Panel style={{ padding: 16 }}>
      <Icon size={16} style={{ color: accent }} />
      <div className="lp-kpi-num" style={{ fontSize: 26, marginTop: 10 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{label}</div>
      {sub && <div className="lp-mono" style={{ fontSize: 10, color: accent, marginTop: 3 }}>{sub}</div>}
    </Panel>
  );
}
function CohortGrid({ seed }) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 17 + seed.charCodeAt(i)) >>> 0;
  const rnd = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  const weeks = ["W0", "W1", "W2", "W3"];
  const rows = ["Cohort 1", "Cohort 2", "Cohort 3"];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "70px repeat(4,1fr)", gap: 5, marginBottom: 5 }}>
        <span />{weeks.map((w) => <span key={w} className="lp-mono" style={{ fontSize: 10, color: "var(--muted2)", textAlign: "center" }}>{w}</span>)}
      </div>
      {rows.map((r, ri) => {
        let ret = 100;
        return (
          <div key={r} style={{ display: "grid", gridTemplateColumns: "70px repeat(4,1fr)", gap: 5, marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "var(--txt2)", alignSelf: "center" }}>{r}</span>
            {weeks.map((w, wi) => {
              if (wi > 0) ret = Math.round(ret * (0.5 + rnd() * 0.35));
              const op = ret / 100;
              return <div key={w} style={{ height: 30, borderRadius: 6, background: `rgba(255,122,24,${0.12 + op * 0.6})`, display: "grid", placeItems: "center", fontSize: 11, color: op > 0.4 ? "#1a0e02" : "var(--txt2)", fontWeight: 600 }}>{ret}%</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function fmtNum(n) {
  if (n == null || isNaN(n)) return "0";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}
function LiveCohortGrid({ data }) {
  const weeks = ["W0", "W1", "W2", "W3"];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "70px repeat(4,1fr)", gap: 5, marginBottom: 5 }}>
        <span />{weeks.map((w) => <span key={w} className="lp-mono" style={{ fontSize: 10, color: "var(--muted2)", textAlign: "center" }}>{w}</span>)}
      </div>
      {data.slice(0, 3).map((row) => (
        <div key={row.cohort} style={{ display: "grid", gridTemplateColumns: "70px repeat(4,1fr)", gap: 5, marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "var(--txt2)", alignSelf: "center" }}>{row.cohort}</span>
          {row.cells.map((c) => {
            const op = c.pct / 100;
            return <div key={c.wk} title={`${c.users} users`} style={{ height: 30, borderRadius: 6, background: `rgba(255,122,24,${0.1 + op * 0.6})`, display: "grid", placeItems: "center", fontSize: 11, color: op > 0.4 ? "#1a0e02" : "var(--txt2)", fontWeight: 600 }}>{c.pct}%</div>;
          })}
        </div>
      ))}
    </div>
  );
}
function PostHogPanel({ product }) {
  const [open, setOpen] = useState(false);
  const events = [
    ["landing_page_viewed", "Landing page visits", "{ utm_source, utm_campaign, referrer }"],
    ["signup_started", "Signup conversion (top)", "{ source, plan }"],
    ["signup_completed", "Signup conversion", "{ source, plan }"],
    ["activated", "Activation rate", "{ aha_action, time_to_activate }"],
    ["feature_used", "Feature adoption", "{ feature, count }"],
    ["referral_shared", "Referral source / rate", "{ channel }"],
    ["community_arrival", "Community source", "{ community, post_id }"],
    ["video_engaged", "Video engagement", "{ asset, watch_pct }"],
  ];
  const snippet = `// Send the 9 LaunchPilot events THROUGH the proxy.
// The proxy holds the secret Personal API Key — your client never sees it.

const PROXY = 'http://localhost:8787' // your deployed proxy URL

function track(event, distinct_id, properties = {}) {
  return fetch(PROXY + '/api/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, distinct_id, properties }),
  })
}

// On landing
track('landing_page_viewed', anonId, {
  source: getUTM('utm_source'),       // e.g. 'reddit'
  campaign: getUTM('utm_campaign'),   // LaunchPilot campaign tag
})

// On signup + activation
track('signup_completed', userId, { source: 'reddit', plan: 'pro' })
track('activated', userId, { aha_action: 'first_recording', time_to_activate: 42 })

// Referral loop
track('referral_shared', userId, { channel: 'whatsapp' })`;

  const funnelsCohorts = `# Proxy = the secure middle layer
client/product  ──POST /api/capture──▶  proxy  ──▶  PostHog ingest
dashboard       ──GET  /api/metrics──▶  proxy  ──HogQL (Personal API Key)──▶  PostHog

# The proxy already builds these for the dashboard:
- series   : daily visits / signups / activated  (14d)
- sources  : signup_completed grouped by properties.source
- funnel   : visits -> signups -> activated -> retained -> referred
- retention: weekly cohorts of the 'activated' population

# Setup (see posthog-proxy/README.md)
cp .env.example .env   # add Personal API Key + Project ID
npm i && npm start     # -> http://localhost:8787
# then paste that URL into the Live-data bar above`;

  return (
    <Panel style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", color: "var(--txt)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1d1100", display: "grid", placeItems: "center" }}><span className="lp-display" style={{ color: "var(--amber)", fontWeight: 800, fontSize: 16 }}>P</span></div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>PostHog integration · live via proxy</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Event schema, capture-through-proxy snippet, and the data flow. Ship the included <span className="lp-mono">posthog-proxy</span> to go live.</div>
          </div>
        </div>
        <ChevronRight size={18} style={{ color: "var(--muted)", transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <div style={{ padding: "0 20px 22px" }}>
          <div className="lp-divider" style={{ margin: "0 0 18px" }} />
          <Label>Event schema — the 9 events LaunchPilot tracks</Label>
          <div style={{ display: "grid", gap: 6, marginTop: 8, marginBottom: 20 }}>
            {events.map(([ev, maps, props]) => (
              <div key={ev} className="lp-card" style={{ padding: "9px 12px", display: "grid", gridTemplateColumns: "1.1fr 1.1fr 1.4fr", gap: 12, alignItems: "center" }}>
                <span className="lp-mono" style={{ fontSize: 12, color: "var(--amber)" }}>{ev}</span>
                <span style={{ fontSize: 12, color: "var(--txt2)" }}>{maps}</span>
                <span className="lp-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{props}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <CodeBlock label="Capture events (via proxy)" code={snippet} />
            <CodeBlock label="Data flow & proxy setup" code={funnelsCohorts} />
          </div>
        </div>
      )}
    </Panel>
  );
}
function CodeBlock({ label, code }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <Label>{label}</Label><CopyBtn text={code} />
      </div>
      <pre className="lp-mono" style={{ background: "var(--ink)", border: "1px solid var(--line2)", borderRadius: 10, padding: 14, fontSize: 11.5, lineHeight: 1.6, color: "var(--txt2)", overflowX: "auto", margin: 0, whiteSpace: "pre" }}>{code}</pre>
    </div>
  );
}
