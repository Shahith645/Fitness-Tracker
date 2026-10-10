import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ── Palette & Globals ──────────────────────────────────────────────────────
const ACCENT = "#00FF87";
const ACCENT2 = "#60efff";
const BG = "#0a0a0f";
const CARD = "#12121a";
const CARD2 = "#1a1a26";
const BORDER = "#2a2a3a";
const TEXT = "#e8e8f0";
const MUTED = "#666680";

const CATEGORIES = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio", "Full Body"];
const PRESET_EXERCISES = {
  Chest: ["Bench Press", "Push-Up", "Chest Fly", "Incline Press"],
  Back: ["Pull-Up", "Deadlift", "Row", "Lat Pulldown"],
  Legs: ["Squat", "Leg Press", "Lunge", "Leg Curl"],
  Arms: ["Bicep Curl", "Tricep Dip", "Hammer Curl", "Skull Crusher"],
  Shoulders: ["Overhead Press", "Lateral Raise", "Front Raise", "Shrug"],
  Core: ["Plank", "Crunches", "Russian Twist", "Leg Raise"],
  Cardio: ["Running", "Cycling", "Jump Rope", "Rowing"],
  "Full Body": ["Burpee", "Clean & Press", "Kettlebell Swing", "Turkish Get-Up"],
};

const ACHIEVEMENTS = [
  { id: "first_workout", name: "First Step", desc: "Log your first workout", icon: "🏅", check: (s) => s.workouts.length >= 1 },
  { id: "week_streak", name: "7-Day Warrior", desc: "7-day workout streak", icon: "🔥", check: (s) => s.streak >= 7 },
  { id: "weight_log", name: "Body Aware", desc: "Log 5 body weights", icon: "⚖️", check: (s) => s.bodyLog.length >= 5 },
  { id: "ten_workouts", name: "Dedicated", desc: "Complete 10 workouts", icon: "💪", check: (s) => s.workouts.length >= 10 },
  { id: "goal_set", name: "Goal Getter", desc: "Set your first goal", icon: "🎯", check: (s) => s.goals.length >= 1 },
];

const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const load = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } };

const Pill = ({ children, active, onClick, color }) => (
  <button onClick={onClick} style={{
    padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? (color || ACCENT) : BORDER}`,
    background: active ? `${color || ACCENT}18` : "transparent", color: active ? (color || ACCENT) : MUTED,
    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s", fontFamily: "inherit", letterSpacing: ".5px",
  }}>{children}</button>
);

const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{label}</label>}
    <input {...props} style={{
      background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px",
      color: TEXT, fontSize: 14, fontFamily: "inherit", outline: "none", transition: "border .2s", ...props.style,
    }}
      onFocus={e => e.target.style.borderColor = ACCENT}
      onBlur={e => e.target.style.borderColor = BORDER}
    />
  </div>
);

const Btn = ({ children, onClick, variant = "primary", small, disabled, style: extra }) => {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: "#000", fontWeight: 800 },
    ghost: { background: "transparent", color: ACCENT, border: `1px solid ${ACCENT}` },
    danger: { background: "#ff4466", color: "#fff", fontWeight: 700 },
    muted: { background: CARD2, color: MUTED, border: `1px solid ${BORDER}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? "7px 16px" : "11px 22px", borderRadius: 10, border: "none",
      cursor: disabled ? "not-allowed" : "pointer", fontSize: small ? 12 : 14, fontFamily: "inherit",
      opacity: disabled ? .5 : 1, transition: "all .2s", letterSpacing: ".3px", ...styles[variant], ...extra,
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = ".85"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? ".5" : "1"; e.currentTarget.style.transform = "none"; }}
    >{children}</button>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px", ...style }}>{children}</div>
);

function RestTimer() {
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const ref = useRef(null);
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setRemaining(r => { if (r <= 1) { setRunning(false); return 0; } return r - 1; }), 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  const pct = (remaining / seconds) * 100;
  const r = 44; const circ = 2 * Math.PI * r;
  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>REST TIMER ⏱️</div>
      <svg width={110} height={110} style={{ display: "block", margin: "0 auto 12px" }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke={CARD2} strokeWidth={6} />
        <circle cx={55} cy={55} r={r} fill="none" stroke={running ? ACCENT : ACCENT2} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "55px 55px", transition: "stroke-dashoffset .9s" }} />
        <text x={55} y={60} textAnchor="middle" fill={TEXT} fontSize={22} fontWeight={800} fontFamily="monospace">
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
        </text>
      </svg>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        {[30, 60, 90, 120].map(s => <Pill key={s} active={seconds === s} onClick={() => { setSeconds(s); setRemaining(s); setRunning(false); }}>{s}s</Pill>)}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <Btn onClick={() => setRunning(r => !r)} variant={running ? "danger" : "primary"} small>{running ? "Pause" : "Start"}</Btn>
        <Btn onClick={() => { setRunning(false); setRemaining(seconds); }} variant="muted" small>Reset</Btn>
      </div>
    </Card>
  );
}

// ── Ollama config — change model name here if needed ──────────────────────
const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "llama3"; // change to "mistral", "phi3", "gemma2" etc.

function AIPanel({ workouts, bodyLog, goals }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [prompt, setPrompt] = useState("Suggest a workout plan for today");
  const [ollamaModel, setOllamaModel] = useState(OLLAMA_MODEL);

  const ask = async () => {
    setLoading(true); setResponse("");
    const context = `User has done ${workouts.length} workouts recently. Latest body weight: ${bodyLog[0]?.weight || "unknown"} kg. Goals: ${goals.map(g => g.text).join(", ") || "none set"}.`;
    try {
      const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          stream: false,
          messages: [
            {
              role: "system",
              content: "You are a personal fitness coach AI (J.A.R.V.I.S. style). Be concise, motivating, and specific. Use emojis. Give actionable advice in 3-5 bullet points max.",
            },
            {
              role: "user",
              content: `${context}\n\nUser asks: ${prompt}`,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      const data = await res.json();
      setResponse(data.message?.content || "No response.");
    } catch (err) {
      setResponse(`⚠️ Could not reach Ollama.\n\nMake sure:\n1. Ollama is running (ollama serve)\n2. Model is pulled: ollama pull ${ollamaModel}\n3. Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <Card>
      <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>🤖 AI COACH — LOCAL J.A.R.V.I.S. (Ollama)</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: MUTED, fontWeight: 700, whiteSpace: "nowrap" }}>MODEL:</span>
        {["llama3", "mistral", "phi3", "gemma2"].map(m => (
          <Pill key={m} active={ollamaModel === m} onClick={() => setOllamaModel(m)}>{m}</Pill>
        ))}
        <input value={ollamaModel} onChange={e => setOllamaModel(e.target.value)}
          style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px", color: TEXT, fontSize: 12, fontFamily: "inherit", outline: "none" }}
          placeholder="custom model..." />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {["Suggest today's workout", "Analyze my progress", "Adjust plan for my goals", "Recovery tips"].map(q => (
          <Pill key={q} active={prompt === q} onClick={() => setPrompt(q)}>{q}</Pill>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={prompt} onChange={e => setPrompt(e.target.value)}
          style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, fontFamily: "inherit", outline: "none" }}
          placeholder="Ask your AI coach..." />
        <Btn onClick={ask} disabled={loading}>{loading ? "Thinking..." : "Ask AI"}</Btn>
      </div>
      {loading && <div style={{ color: ACCENT, fontSize: 13 }}>⚡ Analyzing your fitness data...</div>}
      {response && (
        <div style={{ background: `${ACCENT}0a`, border: `1px solid ${ACCENT}30`, borderRadius: 12, padding: 16, fontSize: 14, color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {response}
        </div>
      )}
    </Card>
  );
}

export default function FitTrack() {
  const [tab, setTab] = useState("dashboard");
  const [workouts, setWorkouts] = useState(() => load("ft_workouts", []));
  const [bodyLog, setBodyLog] = useState(() => load("ft_body", []));
  const [goals, setGoals] = useState(() => load("ft_goals", []));
  const [streak, setStreak] = useState(() => load("ft_streak", 0));
  const [wCategory, setWCategory] = useState("Chest");
  const [wExercise, setWExercise] = useState("");
  const [wSets, setWsets] = useState("3");
  const [wReps, setWReps] = useState("10");
  const [wWeight, setWWeight] = useState("");
  const [wNote, setWNote] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [bWeight, setBWeight] = useState("");
  const [bHeight, setBHeight] = useState(() => load("ft_height", ""));
  const [goalText, setGoalText] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  useEffect(() => { save("ft_workouts", workouts); }, [workouts]);
  useEffect(() => { save("ft_body", bodyLog); }, [bodyLog]);
  useEffect(() => { save("ft_goals", goals); }, [goals]);
  useEffect(() => { save("ft_streak", streak); }, [streak]);
  useEffect(() => { save("ft_height", bHeight); }, [bHeight]);

  const addWorkout = () => {
    if (!wExercise) return;
    setWorkouts(p => [{ id: Date.now(), date: new Date().toISOString().split("T")[0], category: wCategory, exercise: wExercise, sets: +wSets, reps: +wReps, weight: wWeight ? +wWeight : null, note: wNote }, ...p]);
    setStreak(s => s + 1);
    setWExercise(""); setWWeight(""); setWNote("");
  };

  const addBodyLog = () => {
    if (!bWeight) return;
    const bmi = bHeight ? +(+bWeight / ((+bHeight / 100) ** 2)).toFixed(1) : null;
    setBodyLog(p => [{ date: new Date().toISOString().split("T")[0], weight: +bWeight, height: bHeight ? +bHeight : null, bmi }, ...p]);
    setBWeight("");
  };

  const addGoal = () => {
    if (!goalText) return;
    setGoals(p => [...p, { id: Date.now(), text: goalText, target: goalTarget, done: false, created: new Date().toISOString().split("T")[0] }]);
    setGoalText(""); setGoalTarget("");
  };

  const appState = { workouts, bodyLog, goals, streak };
  const weightChartData = [...bodyLog].reverse().slice(-15).map(b => ({ date: b.date.slice(5), weight: b.weight }));
  const filteredWorkouts = filterDate ? workouts.filter(w => w.date === filterDate) : workouts;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⚡" },
    { id: "workout", label: "Workout", icon: "🏋️" },
    { id: "body", label: "Body", icon: "⚖️" },
    { id: "history", label: "History", icon: "📜" },
    { id: "goals", label: "Goals", icon: "🎯" },
    { id: "ai", label: "AI Coach", icon: "🤖" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${BG}; } ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 4px; }
        input::placeholder { color: ${MUTED}; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{ background: `${CARD}ee`, borderBottom: `1px solid ${BORDER}`, padding: "0 20px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)", WebkitAppRegion: "drag" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, WebkitAppRegion: "no-drag" }}>
            <div style={{ width: 30, height: 30, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 15 }}>FIT<span style={{ color: ACCENT }}>TRACK</span></span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", WebkitAppRegion: "no-drag" }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: ACCENT, fontSize: 14 }}>{streak}</span>
            <span style={{ fontSize: 11, color: MUTED }}>streak</span>
          </div>
        </div>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 2, overflowX: "auto", WebkitAppRegion: "no-drag" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "9px 16px", background: "none", border: "none", cursor: "pointer",
              color: tab === t.id ? ACCENT : MUTED, fontFamily: "inherit", fontWeight: tab === t.id ? 700 : 500,
              fontSize: 13, borderBottom: `2px solid ${tab === t.id ? ACCENT : "transparent"}`, transition: "all .2s", whiteSpace: "nowrap",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", animation: "slideUp .3s ease" }}>

        {tab === "dashboard" && (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {[
                { label: "Total Workouts", val: workouts.length, icon: "🏋️", color: ACCENT },
                { label: "Current Streak", val: `${streak} days`, icon: "🔥", color: "#ff6b35" },
                { label: "Body Logs", val: bodyLog.length, icon: "⚖️", color: ACCENT2 },
                { label: "Goals Set", val: goals.length, icon: "🎯", color: "#a78bfa" },
              ].map(s => (
                <Card key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase" }}>{s.label}</div>
                </Card>
              ))}
            </div>
            {weightChartData.length > 1 && (
              <Card>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>📈 WEIGHT TREND</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} />
                    <YAxis tick={{ fill: MUTED, fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT }} />
                    <Line type="monotone" dataKey="weight" stroke={ACCENT} strokeWidth={2.5} dot={{ fill: ACCENT, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
            <Card>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>🏆 ACHIEVEMENTS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                {ACHIEVEMENTS.map(a => {
                  const unlocked = a.check(appState);
                  return (
                    <div key={a.id} style={{ background: unlocked ? `${ACCENT}12` : CARD2, border: `1px solid ${unlocked ? ACCENT + "44" : BORDER}`, borderRadius: 12, padding: 14, opacity: unlocked ? 1 : .45 }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: unlocked ? ACCENT : TEXT }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{a.desc}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
            {workouts.length > 0 && (
              <Card>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>🕐 RECENT ACTIVITY</div>
                {workouts.slice(0, 5).map(w => (
                  <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
                    <div><span style={{ fontWeight: 700, fontSize: 14 }}>{w.exercise}</span><span style={{ marginLeft: 8, fontSize: 11, color: MUTED }}>{w.category}</span></div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: ACCENT }}>{w.sets}×{w.reps}{w.weight ? ` @ ${w.weight}kg` : ""}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>{w.date}</div>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {tab === "workout" && (
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Card>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 20 }}>🏋️ LOG WORKOUT</div>
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Category</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{CATEGORIES.map(c => <Pill key={c} active={wCategory === c} onClick={() => { setWCategory(c); setWExercise(""); }}>{c}</Pill>)}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Exercise</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{PRESET_EXERCISES[wCategory]?.map(e => <Pill key={e} active={wExercise === e} onClick={() => setWExercise(e)}>{e}</Pill>)}</div>
                    <Input placeholder="Or type custom exercise..." value={wExercise} onChange={e => setWExercise(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <Input label="Sets" type="number" value={wSets} onChange={e => setWsets(e.target.value)} min={1} />
                    <Input label="Reps" type="number" value={wReps} onChange={e => setWReps(e.target.value)} min={1} />
                    <Input label="Weight (kg)" type="number" value={wWeight} onChange={e => setWWeight(e.target.value)} placeholder="Optional" />
                  </div>
                  <Input label="Note (optional)" value={wNote} onChange={e => setWNote(e.target.value)} placeholder="e.g. felt strong today" />
                  <Btn onClick={addWorkout}>+ Log Workout</Btn>
                </div>
              </Card>
            </div>
            <RestTimer />
            <Card>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>🗂️ CATEGORY BREAKDOWN</div>
              {CATEGORIES.map(cat => {
                const count = workouts.filter(w => w.category === cat).length;
                const pct = workouts.length ? Math.round((count / workouts.length) * 100) : 0;
                return count > 0 ? (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}><span>{cat}</span><span style={{ color: MUTED }}>{count} sessions</span></div>
                    <div style={{ height: 6, background: CARD2, borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${ACCENT},${ACCENT2})`, borderRadius: 3 }} />
                    </div>
                  </div>
                ) : null;
              })}
              {workouts.length === 0 && <div style={{ color: MUTED, fontSize: 13 }}>Log workouts to see breakdown</div>}
            </Card>
          </div>
        )}

        {tab === "body" && (
          <div style={{ display: "grid", gap: 20 }}>
            <Card>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 20 }}>⚖️ LOG BODY METRICS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Input label="Weight (kg)" type="number" value={bWeight} onChange={e => setBWeight(e.target.value)} placeholder="e.g. 72.5" />
                <Input label="Height (cm)" type="number" value={bHeight} onChange={e => setBHeight(e.target.value)} placeholder="e.g. 175" />
              </div>
              {bWeight && bHeight && (
                <div style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>
                  Estimated BMI: <strong style={{ color: ACCENT }}>{(+bWeight / ((+bHeight / 100) ** 2)).toFixed(1)}</strong>
                </div>
              )}
              <Btn onClick={addBodyLog}>+ Log Weight</Btn>
            </Card>
            {weightChartData.length > 1 && (
              <Card>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>📈 WEIGHT OVER TIME</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="4 4" />
                    <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} />
                    <YAxis tick={{ fill: MUTED, fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="weight" stroke={ACCENT} strokeWidth={3} dot={{ fill: ACCENT, r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
            <Card>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>📋 BODY LOG HISTORY</div>
              {bodyLog.length === 0 && <div style={{ color: MUTED, fontSize: 14 }}>No entries yet.</div>}
              {bodyLog.slice(0, 12).map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14 }}>
                  <span style={{ color: MUTED }}>{b.date}</span>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span><span style={{ color: ACCENT, fontWeight: 700 }}>{b.weight}</span> kg</span>
                    {b.bmi && <span style={{ color: MUTED }}>BMI {b.bmi}</span>}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {tab === "history" && (
          <Card>
            <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>📜 WORKOUT HISTORY</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-end" }}>
              <Input label="Filter by date" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              {filterDate && <Btn onClick={() => setFilterDate("")} variant="muted" small>Clear</Btn>}
            </div>
            {filteredWorkouts.length === 0 && <div style={{ color: MUTED, fontSize: 14 }}>No workouts found.</div>}
            {filteredWorkouts.map(w => (
              <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{w.exercise}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}><span style={{ color: ACCENT2 }}>{w.category}</span> · {w.sets}×{w.reps}{w.weight ? ` · ${w.weight}kg` : ""}{w.note ? ` · "${w.note}"` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: MUTED }}>{w.date}</span>
                  <button onClick={() => setWorkouts(p => p.filter(x => x.id !== w.id))} style={{ background: "none", border: "none", color: "#ff4466", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {tab === "goals" && (
          <div style={{ display: "grid", gap: 20 }}>
            <Card>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 20 }}>🎯 SET A GOAL</div>
              <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Lose 5kg", "Workout 5x/week", "Run 5km", "Bench 100kg", "Build muscle"].map(g => <Pill key={g} active={goalText === g} onClick={() => setGoalText(g)}>{g}</Pill>)}
                </div>
                <Input label="Goal" value={goalText} onChange={e => setGoalText(e.target.value)} placeholder="e.g. Lose 5kg" />
                <Input label="Target / Deadline (optional)" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="e.g. By June 2025" />
              </div>
              <Btn onClick={addGoal}>+ Add Goal</Btn>
            </Card>
            <Card>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 16 }}>📋 MY GOALS</div>
              {goals.length === 0 && <div style={{ color: MUTED, fontSize: 14 }}>No goals yet!</div>}
              {goals.map(g => (
                <div key={g.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <button onClick={() => setGoals(p => p.map(x => x.id === g.id ? { ...x, done: !x.done } : x))} style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${g.done ? ACCENT : BORDER}`, background: g.done ? ACCENT : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 13, fontWeight: 900 }}>{g.done ? "✓" : ""}</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, textDecoration: g.done ? "line-through" : "none", color: g.done ? MUTED : TEXT }}>{g.text}</div>
                    {g.target && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{g.target}</div>}
                  </div>
                  <button onClick={() => setGoals(p => p.filter(x => x.id !== g.id))} style={{ background: "none", border: "none", color: "#ff4466", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
              ))}
            </Card>
          </div>
        )}

        {tab === "ai" && (
          <div style={{ display: "grid", gap: 20 }}>
            <AIPanel workouts={workouts} bodyLog={bodyLog} goals={goals} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 14 }}>📊 WEEKLY ANALYTICS</div>
                {(() => {
                  const week = new Date(); week.setDate(week.getDate() - 7);
                  const recent = workouts.filter(w => w.date >= week.toISOString().split("T")[0]);
                  const cats = {};
                  recent.forEach(w => { cats[w.category] = (cats[w.category] || 0) + 1; });
                  return (
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: ACCENT, fontFamily: "'Space Mono', monospace" }}>{recent.length}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>workouts this week</div>
                      {Object.entries(cats).map(([c, n]) => (
                        <div key={c} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                          <span style={{ color: MUTED }}>{c}</span><span style={{ color: ACCENT }}>{n}×</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>
              <Card>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "1px", marginBottom: 14 }}>🧠 MOTIVATION</div>
                <div style={{ fontSize: 34, marginBottom: 8 }}>🔥</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 28, color: ACCENT }}>{streak}</div>
                <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>day streak</div>
                <div style={{ fontSize: 13, color: TEXT }}>
                  {streak === 0 && "Start your streak today! 💪"}
                  {streak >= 1 && streak < 3 && "Great start! Keep it going!"}
                  {streak >= 3 && streak < 7 && "You're on fire! 3+ days strong!"}
                  {streak >= 7 && "Elite mode activated! 🚀"}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
