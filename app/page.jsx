"use client";
import { useState, useMemo, useEffect } from "react";

const WHATSAPP_NUMBER = "5517991582296";

function sendWhatsApp(text) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

function loadStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

function saveStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

const BRAND = "#204040";
const BRAND_LIGHT = "#2a5555";
const BRAND_BG = "#f0f5f4";

// ============================
// BRISTOL SCALE DATA
// ============================
const TYPES = [
  {
    num: 1,
    title: "Bolinhas separadas e duras",
    visual: "Pequenas bolinhas duras e separadas, parecidas com caroços de azeitona. Difíceis de eliminar, geralmente exigem esforço.",
    status: "red",
    statusLabel: "Constipação",
    indica: "O intestino está muito lento. As fezes ficaram tempo demais ali dentro, perderam muita água e endureceram. Pode ter relação com pouca hidratação, falta de fibra adequada, intestino preguiçoso ou flora desbalanceada.",
    dica: "Se esse é o seu padrão frequente, não tente resolver sozinho com laxante ou fibra em excesso. Isso pode piorar dependendo da causa. Fale com o Vitor na próxima consulta.",
    emoji: "⚫⚫⚫",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
  {
    num: 2,
    title: "Formato de salsicha, mas irregular e com grumos",
    visual: "Uma peça mais alongada, mas cheia de grumos e caroços na superfície. Ainda dura e difícil de eliminar.",
    status: "red",
    statusLabel: "Constipação leve",
    indica: "Também indica trânsito lento, mas um pouco menos que o tipo 1. As fezes começaram a se juntar mas ainda estão desidratadas. É comum em quem vai ao banheiro a cada 3-4 dias.",
    dica: "Preste atenção na frequência. Se você só vai ao banheiro a cada 3+ dias e o formato é sempre assim, vale investigar o que está deixando seu intestino lento.",
    emoji: "🟤〰️",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
  {
    num: 3,
    title: "Formato de salsicha com rachaduras na superfície",
    visual: "Alongada, com formato definido, mas com rachaduras visíveis na superfície. Sai com facilidade.",
    status: "yellow",
    statusLabel: "Normal (tendendo a seco)",
    indica: "Está quase no ideal. As rachaduras indicam que perdeu um pouco mais de água do que deveria. Pode significar que você poderia beber um pouco mais de água ou que o trânsito está levemente lento.",
    dica: "Se você se sente bem e evacua sem esforço, está ok. Se perceber que precisa forçar ou que demora para ir ao banheiro, aumente a hidratação e observe.",
    emoji: "🟫〰️",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  {
    num: 4,
    title: "Formato de salsicha ou cobra, lisa e macia",
    visual: "Alongada, lisa, macia. Formato contínuo, fácil de eliminar. Não exige esforço.",
    status: "green",
    statusLabel: "Ideal",
    indica: "Esse é o padrão que a gente busca. Significa que o trânsito intestinal está no tempo certo: nem rápido demais, nem lento demais. A hidratação e a flora estão funcionando bem.",
    dica: "Se o seu padrão é assim na maioria dos dias, seu intestino está funcionando como deveria. Continue fazendo o que está fazendo.",
    emoji: "🟢〰️",
    bg: "#f0fdf4",
    border: "#86efac",
  },
  {
    num: 5,
    title: "Pedaços macios com bordas definidas",
    visual: "Pedaços separados, macios, com bordas bem definidas. Saem com muita facilidade.",
    status: "yellow",
    statusLabel: "Normal (tendendo a mole)",
    indica: "Pode ser normal para algumas pessoas, especialmente se acontece 1-2x por dia sem desconforto. Mas se for frequente, pode indicar que o trânsito está um pouco acelerado ou que falta fibra para dar consistência.",
    dica: "Se não tem urgência e você se sente bem, está ok. Se perceber que precisa correr para o banheiro logo depois de comer, vale anotar e falar comigo.",
    emoji: "🟡🟡",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  {
    num: 6,
    title: "Pedaços fofos, pastosos, sem forma definida",
    visual: "Fezes pastosas, sem forma clara, com bordas irregulares. Consistência fofa, quase desmanchando.",
    status: "red",
    statusLabel: "Tendência a diarreia",
    indica: "O intestino está rápido demais. A comida passa sem tempo suficiente para absorver água e nutrientes. Pode estar relacionado a inflamação, flora desbalanceada, intolerância alimentar ou até estresse intenso.",
    dica: "Se isso acontece com frequência (mais de 3x por semana), anote o que comeu antes e me conte. Pode ter um padrão que precisamos investigar.",
    emoji: "🟠💧",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
  {
    num: 7,
    title: "Totalmente líquida, sem pedaços sólidos",
    visual: "Completamente líquida, sem nenhum pedaço sólido. Pode ter urgência intensa para ir ao banheiro.",
    status: "red",
    statusLabel: "Diarreia",
    indica: "O intestino está muito acelerado. A água não está sendo absorvida. Pode ser infecção, reação alimentar aguda, inflamação ou quadro crônico que precisa de atenção.",
    dica: "Se for pontual (1 dia), hidrate-se bem e observe. Se durar mais de 2-3 dias ou vier acompanhado de febre e dor forte, procure atendimento médico. Se for recorrente, precisamos investigar a causa.",
    emoji: "🔴💧💧",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
];

const statusColor = { green: "#16a34a", yellow: "#d97706", red: "#dc2626" };

// ============================
// QUESTIONNAIRE DATA
// ============================
const QUESTIONS = [
  { id: "bloat", label: "Inchaço abdominal", type: "scale10", desc: "0 = nenhum inchaço, 10 = insuportável", category: "Sintomas digestivos", invert: true },
  { id: "gas", label: "Gases", type: "scale10", desc: "0 = nenhum, 10 = o dia inteiro", category: "Sintomas digestivos", invert: true },
  { id: "pain", label: "Dor ou desconforto abdominal", type: "scale10", desc: "0 = nenhuma dor, 10 = dor forte", category: "Sintomas digestivos", invert: true },
  { id: "bowel", label: "Funcionamento do intestino", type: "scale10", desc: "0 = muito preso, 5 = normal, 10 = muito solto", category: "Sintomas digestivos", invert: false, special: true },
  { id: "energy", label: "Nível de energia", type: "scale5", category: "Bem-estar geral" },
  { id: "sleep", label: "Qualidade do sono", type: "scale5", category: "Bem-estar geral" },
  { id: "mood", label: "Humor geral", type: "scale5", category: "Bem-estar geral" },
  { id: "food", label: "Confiança para comer sem medo", type: "scale5", category: "Relação com comida" },
  { id: "adherence", label: "Quanto você seguiu o planejado", type: "scale10", desc: "0 = não consegui fazer nada, 10 = segui tudo certinho", category: "Adesão ao plano", invert: false },
  { id: "notes", label: "Tem algo que quer me contar sobre essa semana?", type: "text", category: "Observação" },
];

const SCALE5_OPTIONS = [
  { value: 5, label: "Muito melhor", emoji: "😁", color: "#16a34a" },
  { value: 4, label: "Melhor", emoji: "🙂", color: "#65a30d" },
  { value: 3, label: "Igual", emoji: "😐", color: "#d97706" },
  { value: 2, label: "Pior", emoji: "😟", color: "#ea580c" },
  { value: 1, label: "Muito pior", emoji: "😣", color: "#dc2626" },
];

function calcScore(answers) {
  let total = 0, count = 0;
  ["bloat", "gas", "pain"].forEach((id) => {
    if (answers[id] !== undefined) { total += (10 - answers[id]); count++; }
  });
  if (answers.bowel !== undefined) {
    total += (10 - Math.abs(answers.bowel - 5) * 2); count++;
  }
  ["energy", "sleep", "mood", "food"].forEach((id) => {
    if (answers[id] !== undefined) { total += ((answers[id] - 1) / 4) * 10; count++; }
  });
  if (answers.adherence !== undefined) { total += answers.adherence; count++; }
  if (count === 0) return 0;
  return Math.round((total / count) * 10) / 10;
}

function getScoreMessage(score) {
  if (score >= 8) return { text: "Semana excelente! Seu corpo está respondendo bem. Continue assim.", color: "#16a34a", emoji: "🌟" };
  if (score >= 6) return { text: "Boa evolução. Alguns pontos ainda precisam de ajuste. Vamos trabalhar nisso na próxima consulta.", color: "#65a30d", emoji: "💪" };
  if (score >= 4) return { text: "Semana razoável. Anote o que sentiu para conversarmos na próxima consulta.", color: "#d97706", emoji: "📝" };
  return { text: "Semana difícil. Me manda mensagem no WhatsApp para avaliarmos se precisa ajustar algo antes da próxima consulta.", color: "#dc2626", emoji: "💬" };
}

function getScoreColor(s) {
  if (s >= 8) return "#16a34a";
  if (s >= 6) return "#65a30d";
  if (s >= 4) return "#d97706";
  return "#dc2626";
}

function getWeekLabel(d) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// ============================
// MAIN APP
// ============================
export default function App() {
  const [tab, setTab] = useState("bristol"); // bristol | avaliacao

  // Bristol state
  const [bristolView, setBristolView] = useState("scale");
  const [selectedType, setSelectedType] = useState(null);
  const [diary, setDiary] = useState(() => loadStorage("bristol_diary", []));
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [addNote, setAddNote] = useState("");
  const [addDate, setAddDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Questionnaire state
  const [qView, setQView] = useState("home");
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [qHistory, setQHistory] = useState(() => loadStorage("q_history", []));
  const [fillDate, setFillDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [lastResult, setLastResult] = useState(null);

  // Persist data
  useEffect(() => { saveStorage("bristol_diary", diary); }, [diary]);
  useEffect(() => { saveStorage("q_history", qHistory); }, [qHistory]);

  const avgType = useMemo(() => {
    if (diary.length === 0) return null;
    const last7 = diary.slice(0, 7);
    return Math.round((last7.reduce((s, e) => s + e.type, 0) / last7.length) * 10) / 10;
  }, [diary]);

  // ============================
  // TAB BAR
  // ============================
  const TabBar = () => (
    <div style={{
      display: "flex", background: "white", borderBottom: "2px solid #f1f5f9",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      {[
        { key: "bristol", label: "Escala de Bristol", icon: "📊" },
        { key: "avaliacao", label: "Avaliação Semanal", icon: "📋" },
      ].map((t) => (
        <button key={t.key} onClick={() => { setTab(t.key); setBristolView("scale"); setQView("home"); }} style={{
          flex: 1, padding: "14px 8px", border: "none",
          borderBottom: tab === t.key ? `3px solid ${BRAND}` : "3px solid transparent",
          background: tab === t.key ? BRAND_BG : "white",
          color: tab === t.key ? BRAND : "#94a3b8",
          fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
          cursor: "pointer", fontFamily: "inherit",
          transition: "all .2s",
        }}>
          <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
          {t.label}
        </button>
      ))}
    </div>
  );

  // ============================
  // BRISTOL: SCALE VIEW
  // ============================
  const BristolScale = () => (
    <div>
      <div style={{ padding: "20px 16px 8px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1e293b" }}>Escala de Bristol</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Toque em cada tipo para entender o que significa</p>
      </div>

      <div style={{ padding: "8px 16px 12px" }}>
        {TYPES.map((type) => (
          <div key={type.num} onClick={() => { setSelectedType(type); setBristolView("detail"); }}
            style={{
              background: "white", borderRadius: 14, padding: "14px 16px",
              marginBottom: 8, cursor: "pointer", border: `1.5px solid ${type.border}`,
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,.02)",
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: type.bg, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: statusColor[type.status],
              flexShrink: 0, border: `2px solid ${type.border}`,
            }}>{type.num}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>{type.title}</div>
              <div style={{ fontSize: 12, color: statusColor[type.status], fontWeight: 600 }}>{type.statusLabel}</div>
            </div>
            <div style={{ fontSize: 16, opacity: 0.3 }}>›</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ background: "white", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${BRAND}18` }}>
          <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            <strong style={{ color: BRAND }}>Como usar:</strong> observe suas fezes antes de dar descarga. Compare com os tipos acima. O ideal é estar entre o tipo 3 e 4 na maioria dos dias.
          </p>
        </div>
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        <button onClick={() => setBristolView("diary")} style={{
          width: "100%", padding: "13px", borderRadius: 12,
          background: BRAND, color: "white", border: "none",
          fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>📋 Meu diário de Bristol</button>
      </div>
    </div>
  );

  // ============================
  // BRISTOL: DETAIL VIEW
  // ============================
  const BristolDetail = () => {
    if (!selectedType) return null;
    const type = selectedType;
    return (
      <div>
        <div style={{ padding: "16px" }}>
          <button onClick={() => setBristolView("scale")} style={{ background: "none", border: "none", color: BRAND, fontSize: 14, cursor: "pointer", padding: 0, fontFamily: "inherit", marginBottom: 12 }}>← Voltar</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: type.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: statusColor[type.status], border: `2px solid ${type.border}` }}>{type.num}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Tipo {type.num}</h3>
              <div style={{ fontSize: 13, color: statusColor[type.status], fontWeight: 600 }}>{type.statusLabel}</div>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 14, padding: "18px", marginBottom: 10, border: `1.5px solid ${type.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Como são</div>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{type.emoji}</div>
            <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{type.visual}</p>
          </div>

          <div style={{ background: "white", borderRadius: 14, padding: "18px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>O que pode indicar</div>
            <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{type.indica}</p>
          </div>

          <div style={{ background: type.bg, borderRadius: 14, padding: "18px", border: `1.5px solid ${type.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: statusColor[type.status], textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>💡 Dica prática</div>
            <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{type.dica}</p>
          </div>

          <button onClick={() => { setShowAddModal(true); setAddType(type.num); setBristolView("diary"); }} style={{
            width: "100%", padding: "13px", borderRadius: 12, marginTop: 14,
            background: BRAND, color: "white", border: "none",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>Registrar tipo {type.num} no meu diário</button>
        </div>
      </div>
    );
  };

  // ============================
  // BRISTOL: DIARY VIEW
  // ============================
  const BristolDiary = () => (
    <div>
      <div style={{ padding: "16px" }}>
        <button onClick={() => { setBristolView("scale"); setShowAddModal(false); }} style={{ background: "none", border: "none", color: BRAND, fontSize: 14, cursor: "pointer", padding: 0, fontFamily: "inherit", marginBottom: 12 }}>← Voltar para a escala</button>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1e293b" }}>📋 Meu Diário</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#94a3b8" }}>Registre seu tipo Bristol para acompanhar a evolução</p>

        {diary.length > 0 && avgType && (
          <div style={{ background: "white", borderRadius: 14, padding: "16px", marginBottom: 12, textAlign: "center", border: `1.5px solid ${BRAND}25` }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Média dos últimos registros</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: BRAND, margin: "6px 0 4px" }}>{avgType}</div>
            <div style={{ fontSize: 12, color: avgType >= 3 && avgType <= 4.5 ? "#16a34a" : "#d97706" }}>
              {avgType >= 3 && avgType <= 4.5 ? "Dentro do ideal ✓" : avgType < 3 ? "Tendência a constipação" : "Tendência a fezes amolecidas"}
            </div>
          </div>
        )}

        <button onClick={() => { setShowAddModal(true); setAddType(null); }} style={{
          width: "100%", padding: "13px", borderRadius: 12, marginBottom: 12,
          background: BRAND, color: "white", border: "none",
          fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>+ Novo registro</button>

        {showAddModal && (
          <div style={{ background: "white", borderRadius: 14, padding: "18px", marginBottom: 12, border: `2px solid ${BRAND}` }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: BRAND }}>Novo registro</h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Data</label>
            <input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", marginBottom: 12 }} />
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>Tipo Bristol</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 12 }}>
              {[1,2,3,4,5,6,7].map((n) => {
                const tp = TYPES[n-1];
                return (
                  <button key={n} onClick={() => setAddType(n)} style={{
                    padding: "10px 0", borderRadius: 8,
                    border: addType === n ? `2px solid ${BRAND}` : "2px solid #e2e8f0",
                    background: addType === n ? tp.bg : "#f8fafc",
                    fontSize: 16, fontWeight: addType === n ? 700 : 500,
                    color: addType === n ? statusColor[tp.status] : "#94a3b8",
                    cursor: "pointer",
                  }}>{n}</button>
                );
              })}
            </div>
            {addType && <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", fontStyle: "italic" }}>Tipo {addType}: {TYPES[addType-1].title}</p>}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Observação (opcional)</label>
            <textarea value={addNote} onChange={(e) => setAddNote(e.target.value)} placeholder="Ex: comi feijão ontem, tive mais gases hoje..." rows={2} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", resize: "vertical", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#64748b" }}>Cancelar</button>
              <button onClick={() => {
                if (!addType) return;
                setDiary(prev => [{ date: addDate, type: addType, note: addNote, id: Date.now() }, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
                setShowAddModal(false); setAddType(null); setAddNote(""); setAddDate(new Date().toISOString().split("T")[0]);
              }} disabled={!addType} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: addType ? BRAND : "#cbd5e1", color: "white", fontSize: 13, fontWeight: 600, cursor: addType ? "pointer" : "default", fontFamily: "inherit" }}>Salvar</button>
            </div>
          </div>
        )}

        {diary.length === 0 && !showAddModal && (
          <div style={{ textAlign: "center", padding: "30px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
            <p style={{ fontSize: 14, margin: 0 }}>Nenhum registro ainda</p>
          </div>
        )}

        {diary.map((entry) => {
          const tp = TYPES[entry.type - 1];
          return (
            <div key={entry.id} style={{ background: "white", borderRadius: 12, padding: "12px 14px", marginBottom: 6, border: "1.5px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: tp.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: statusColor[tp.status], border: `2px solid ${tp.border}`, flexShrink: 0 }}>{entry.type}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Tipo {entry.type} <span style={{ fontWeight: 400, color: "#94a3b8" }}>· {getWeekLabel(entry.date)}</span></div>
                {entry.note && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{entry.note}</div>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setDiary(prev => prev.filter(x => x.id !== entry.id)); }} style={{ background: "none", border: "none", fontSize: 14, color: "#cbd5e1", cursor: "pointer", padding: 2 }}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================
  // QUESTIONNAIRE: HOME
  // ============================
  const QHome = () => (
    <div>
      <div style={{ padding: "20px 16px 8px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1e293b" }}>Avaliação Semanal</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Acompanhe como você está semana a semana</p>
      </div>

      <div style={{ padding: "8px 16px" }}>
        {qHistory.length > 0 && (
          <div style={{ background: "white", borderRadius: 14, padding: "20px 18px", marginBottom: 12, textAlign: "center", border: `1.5px solid ${BRAND}20` }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Último registro</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{getWeekLabel(qHistory[0].date)}</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: getScoreColor(qHistory[0].score), lineHeight: 1 }}>{qHistory[0].score}</div>
            <div style={{ fontSize: 13, color: getScoreColor(qHistory[0].score), marginTop: 8 }}>{getScoreMessage(qHistory[0].score).emoji} de 10</div>
            {qHistory.length >= 2 && (
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                {qHistory[0].score > qHistory[1].score
                  ? `📈 Subiu ${(qHistory[0].score - qHistory[1].score).toFixed(1)} pontos`
                  : qHistory[0].score < qHistory[1].score
                  ? `📉 Caiu ${(qHistory[1].score - qHistory[0].score).toFixed(1)} pontos`
                  : "➡️ Mesma nota da semana anterior"}
              </div>
            )}
          </div>
        )}

        <button onClick={() => { setAnswers({}); setCurrentQ(0); setFillDate(new Date().toISOString().split("T")[0]); setQView("fill"); }} style={{
          width: "100%", padding: "14px", borderRadius: 12, background: BRAND, color: "white", border: "none",
          fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10,
        }}>
          {qHistory.length === 0 ? "Começar meu primeiro registro" : "Registrar essa semana"}
        </button>

        {qHistory.length > 0 && (
          <button onClick={() => setQView("history")} style={{
            width: "100%", padding: "13px", borderRadius: 12, background: "white", color: BRAND, border: `1.5px solid ${BRAND}`,
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
          }}>📊 Ver meu histórico ({qHistory.length} registro{qHistory.length !== 1 ? "s" : ""})</button>
        )}

        <div style={{ background: "white", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${BRAND}12` }}>
          <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            <strong style={{ color: BRAND }}>Como funciona:</strong> responda 10 perguntas rápidas sobre como foi sua semana. No final, você recebe uma nota de 0 a 10. Preencha 1x por semana para acompanhar o progresso.
          </p>
        </div>
      </div>
    </div>
  );

  // ============================
  // QUESTIONNAIRE: FILL
  // ============================
  const QFill = () => {
    const q = QUESTIONS[currentQ];
    const isLast = currentQ === QUESTIONS.length - 1;
    const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
    const canAdv = q.type === "text" || answers[q.id] !== undefined;

    const doNext = () => {
      if (isLast) {
        const score = calcScore(answers);
        const entry = { date: fillDate, answers: { ...answers }, score, id: Date.now() };
        setQHistory(prev => [entry, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
        setLastResult(entry);
        setQView("result");
      } else {
        setCurrentQ(prev => prev + 1);
      }
    };

    return (
      <div style={{ minHeight: "100vh", background: BRAND_BG, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
        <div style={{ background: BRAND, padding: "14px 16px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button onClick={() => currentQ === 0 ? setQView("home") : setCurrentQ(prev => prev - 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>← {currentQ === 0 ? "Sair" : "Voltar"}</button>
            <span style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>{currentQ + 1} de {QUESTIONS.length}</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,.15)", borderRadius: 2 }}>
            <div style={{ height: 4, background: "#4ade80", borderRadius: 2, width: `${progress}%`, transition: "width .3s" }} />
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{q.category}</div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1e293b", lineHeight: 1.3 }}>{q.label}</h2>
          {q.desc && <p style={{ margin: "0 0 20px", fontSize: 13, color: "#94a3b8" }}>{q.desc}</p>}
          {!q.desc && <div style={{ marginBottom: 20 }} />}

          {q.type === "scale10" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 3, marginBottom: 10 }}>
                {[0,1,2,3,4,5,6,7,8,9,10].map((n) => {
                  const sel = answers[q.id] === n;
                  let bg = "#f8fafc", tc = "#94a3b8";
                  if (sel) {
                    if (q.invert) { bg = n <= 3 ? "#f0fdf4" : n <= 6 ? "#fffbeb" : "#fef2f2"; tc = n <= 3 ? "#16a34a" : n <= 6 ? "#d97706" : "#dc2626"; }
                    else if (q.special) { bg = n >= 4 && n <= 6 ? "#f0fdf4" : "#fffbeb"; tc = n >= 4 && n <= 6 ? "#16a34a" : "#d97706"; }
                    else { bg = n >= 7 ? "#f0fdf4" : n >= 4 ? "#fffbeb" : "#fef2f2"; tc = n >= 7 ? "#16a34a" : n >= 4 ? "#d97706" : "#dc2626"; }
                  }
                  return <button key={n} onClick={() => setAnswers(p => ({...p, [q.id]: n}))} style={{ padding: "11px 0", borderRadius: 8, border: sel ? `2px solid ${tc}` : "2px solid #e2e8f0", background: sel ? bg : "white", fontSize: 15, fontWeight: sel ? 700 : 500, color: sel ? tc : "#94a3b8", cursor: "pointer" }}>{n}</button>;
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
                {q.invert ? <><span>Nenhum</span><span>Insuportável</span></> : q.special ? <><span>Muito preso</span><span>Normal</span><span>Muito solto</span></> : <><span>Nada</span><span>Totalmente</span></>}
              </div>
            </div>
          )}

          {q.type === "scale5" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {SCALE5_OPTIONS.map((opt) => {
                const sel = answers[q.id] === opt.value;
                return (
                  <button key={opt.value} onClick={() => setAnswers(p => ({...p, [q.id]: opt.value}))} style={{
                    padding: "13px 16px", borderRadius: 12,
                    border: sel ? `2px solid ${opt.color}` : "2px solid #e2e8f0",
                    background: sel ? opt.color + "12" : "white",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <span style={{ fontSize: 26 }}>{opt.emoji}</span>
                    <span style={{ fontSize: 15, fontWeight: sel ? 700 : 500, color: sel ? opt.color : "#475569" }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "text" && (
            <textarea value={answers[q.id] || ""} onChange={(e) => setAnswers(p => ({...p, [q.id]: e.target.value}))} placeholder="Escreva aqui se quiser... é opcional" rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: "2px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none" }} />
          )}
        </div>

        <div style={{ padding: "0 16px 30px" }}>
          <button onClick={doNext} disabled={!canAdv} style={{
            width: "100%", padding: "14px", borderRadius: 12,
            background: canAdv ? BRAND : "#cbd5e1", color: "white", border: "none",
            fontSize: 15, fontWeight: 700, cursor: canAdv ? "pointer" : "default", fontFamily: "inherit",
          }}>{isLast ? "Ver meu resultado" : "Próxima →"}</button>
        </div>
      </div>
    );
  };

  // ============================
  // QUESTIONNAIRE: RESULT
  // ============================
  const QResult = () => {
    if (!lastResult) return null;
    const msg = getScoreMessage(lastResult.score);
    const prev = qHistory.length >= 2 ? qHistory[1] : null;
    const diff = prev ? (lastResult.score - prev.score).toFixed(1) : null;

    return (
      <div>
        <div style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`, padding: "30px 20px 34px", color: "white", textAlign: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Sua nota dessa semana</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1 }}>{lastResult.score}</div>
          <div style={{ fontSize: 13, marginTop: 6, opacity: 0.9 }}>{msg.emoji} de 10</div>
        </div>

        <div style={{ padding: "16px" }}>
          <div style={{ background: "white", borderRadius: 14, padding: "18px", marginBottom: 10, borderLeft: `4px solid ${msg.color}` }}>
            <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{msg.text}</p>
          </div>

          {prev && (
            <div style={{ background: "white", borderRadius: 14, padding: "16px", marginBottom: 10, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Comparação com a semana anterior</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
                <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Anterior</div><div style={{ fontSize: 24, fontWeight: 700, color: getScoreColor(prev.score) }}>{prev.score}</div></div>
                <div style={{ fontSize: 20 }}>{diff > 0 ? "📈" : diff < 0 ? "📉" : "➡️"}</div>
                <div><div style={{ fontSize: 11, color: "#94a3b8" }}>Agora</div><div style={{ fontSize: 24, fontWeight: 700, color: getScoreColor(lastResult.score) }}>{lastResult.score}</div></div>
              </div>
              <div style={{ fontSize: 12, color: diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#94a3b8", marginTop: 6 }}>
                {diff > 0 ? `+${diff} pontos. Você está melhorando!` : diff < 0 ? `${diff} pontos. Vamos entender o que aconteceu.` : "Mesma nota. Estável."}
              </div>
            </div>
          )}

          <div style={{ background: "white", borderRadius: 14, padding: "16px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Resumo</div>
            {QUESTIONS.filter(q => q.type !== "text").map((q) => {
              const val = lastResult.answers[q.id];
              if (val === undefined) return null;
              let display, color;
              if (q.type === "scale5") { const opt = SCALE5_OPTIONS.find(o => o.value === val); display = opt ? `${opt.emoji} ${opt.label}` : val; color = opt?.color || "#475569"; }
              else { display = `${val}/10`; if (q.invert) { color = val <= 3 ? "#16a34a" : val <= 6 ? "#d97706" : "#dc2626"; } else if (q.special) { color = val >= 4 && val <= 6 ? "#16a34a" : "#d97706"; } else { color = val >= 7 ? "#16a34a" : val >= 4 ? "#d97706" : "#dc2626"; } }
              return <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f8fafc" }}><span style={{ fontSize: 13, color: "#475569" }}>{q.label}</span><span style={{ fontSize: 13, fontWeight: 600, color }}>{display}</span></div>;
            })}
            {lastResult.answers.notes && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>Observação:</div><p style={{ margin: 0, fontSize: 13, color: "#475569", fontStyle: "italic" }}>"{lastResult.answers.notes}"</p></div>}
          </div>

          <button onClick={() => setQView("home")} style={{ width: "100%", padding: "13px", borderRadius: 12, background: BRAND, color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>Voltar ao início</button>
          <button onClick={() => {
            const lines = [`*Avaliação Semanal* - ${getWeekLabel(lastResult.date)}`, `*Nota geral: ${lastResult.score}/10*`, ""];
            QUESTIONS.filter(q => q.type !== "text").forEach((q) => {
              const val = lastResult.answers[q.id];
              if (val === undefined) return;
              if (q.type === "scale5") { const opt = SCALE5_OPTIONS.find(o => o.value === val); lines.push(`${q.label}: ${opt ? opt.label : val}`); }
              else { lines.push(`${q.label}: ${val}/10`); }
            });
            if (lastResult.answers.notes) { lines.push(""); lines.push(`Observação: ${lastResult.answers.notes}`); }
            sendWhatsApp(lines.join("\n"));
          }} style={{ width: "100%", padding: "13px", borderRadius: 12, background: "#25D366", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            💬 Enviar para o Vitor pelo WhatsApp
          </button>
          {qHistory.length > 1 && <button onClick={() => setQView("history")} style={{ width: "100%", padding: "13px", borderRadius: 12, background: "white", color: BRAND, border: `1.5px solid ${BRAND}`, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Ver histórico completo</button>}
        </div>
      </div>
    );
  };

  // ============================
  // QUESTIONNAIRE: HISTORY
  // ============================
  const QHistory = () => (
    <div>
      <div style={{ padding: "16px" }}>
        <button onClick={() => setQView("home")} style={{ background: "none", border: "none", color: BRAND, fontSize: 14, cursor: "pointer", padding: 0, fontFamily: "inherit", marginBottom: 12 }}>← Voltar</button>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1e293b" }}>📊 Meu Histórico</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#94a3b8" }}>{qHistory.length} registro{qHistory.length !== 1 ? "s" : ""}</p>

        {qHistory.map((entry, i) => {
          const prev = qHistory[i + 1];
          const diff = prev ? (entry.score - prev.score).toFixed(1) : null;
          return (
            <div key={entry.id} style={{ background: "white", borderRadius: 14, padding: "14px 16px", marginBottom: 8, border: "1.5px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: getScoreColor(entry.score) + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: getScoreColor(entry.score), flexShrink: 0, border: `2px solid ${getScoreColor(entry.score)}30` }}>{entry.score}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{getWeekLabel(entry.date)}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Adesão: {entry.answers.adherence !== undefined ? `${entry.answers.adherence}/10` : "N/A"}</div>
                {diff && <div style={{ fontSize: 11, marginTop: 2, color: diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#94a3b8" }}>{diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : "= igual"}</div>}
              </div>
              <div style={{ fontSize: 18 }}>{getScoreMessage(entry.score).emoji}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================
  // RENDER
  // ============================
  // Full-screen views (questionnaire fill)
  if (tab === "avaliacao" && qView === "fill") return <QFill />;

  return (
    <div style={{ minHeight: "100vh", background: BRAND_BG, fontFamily: "'DM Sans',system-ui,sans-serif", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`, padding: "28px 20px 14px", color: "white", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Guia do Paciente</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.7 }}>Nutri Vitor Sandrin</p>
      </div>

      <TabBar />

      {/* Bristol tab */}
      {tab === "bristol" && bristolView === "scale" && <BristolScale />}
      {tab === "bristol" && bristolView === "detail" && <BristolDetail />}
      {tab === "bristol" && bristolView === "diary" && <BristolDiary />}

      {/* Avaliação tab */}
      {tab === "avaliacao" && qView === "home" && <QHome />}
      {tab === "avaliacao" && qView === "result" && <QResult />}
      {tab === "avaliacao" && qView === "history" && <QHistory />}

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,.95)", backdropFilter: "blur(10px)", borderTop: "1px solid #e2e8f0", padding: "8px 16px", textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
        <strong style={{ color: BRAND }}>Nutri Vitor Sandrin</strong> — Material de apoio ao paciente. Não substitui orientação profissional.
      </div>
    </div>
  );
}
