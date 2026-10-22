const INSIGHT_WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const HABIT_WINDOW_DAYS = 60;
const STREAK_MIN_WATCH = 10;
const STREAK_MIN_LIVE = 15;
const DAY_MS = 86400000;

function shiftedTime(ts) {
  const d = new Date(ts);
  let m = d.getHours() * 60 + d.getMinutes();
  let wd = d.getDay();
  if (m < 240) {
    m += 1440;
    wd = (wd + 6) % 7;
  }
  return { m, wd };
}

function computeHabit(sessions, now = Date.now()) {
  const since = now - HABIT_WINDOW_DAYS * DAY_MS;
  const recent = (sessions || []).filter((s) => s && s.start >= since && s.start <= now);
  if (recent.length < 3) return { enough: false, count: recent.length };
  const perDay = [0, 0, 0, 0, 0, 0, 0];
  const mins = [];
  for (const s of recent) {
    const { m, wd } = shiftedTime(s.start);
    perDay[wd]++;
    mins.push(m);
  }
  mins.sort((a, b) => a - b);
  const minutes = Math.round(mins[Math.floor(mins.length / 2)] / 15) * 15;
  const h = Math.floor(minutes / 60) % 24;
  const mm = minutes % 60;
  const time = mm ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
  const max = Math.max(...perDay);
  const days = perDay.map((c, i) => (c >= Math.max(1, Math.ceil(max * 0.4)) ? i : -1)).filter((i) => i >= 0);
  const ordered = [1, 2, 3, 4, 5, 6, 0].filter((i) => days.includes(i));
  let daysLabel;
  if (ordered.length >= 6) daysLabel = "quase todo dia";
  else if (ordered.join() === "1,2,3,4,5") daysLabel = "seg a sex";
  else daysLabel = ordered.map((i) => INSIGHT_WEEKDAYS[i]).join(", ");
  return {
    enough: true,
    count: recent.length,
    perDay,
    days,
    minutes,
    time,
    daysLabel,
    label: `costuma entrar ${daysLabel} · ~${time}`,
  };
}

function minutesUntilHabit(habit, now = Date.now()) {
  if (!habit || !habit.enough) return null;
  const { m, wd } = shiftedTime(now);
  if (!habit.days.includes(wd)) return null;
  return habit.minutes - m;
}

function computeStreak(sessions, now = Date.now()) {
  const list = (sessions || [])
    .filter((s) => s && s.start)
    .slice()
    .sort((a, b) => b.start - a.start);
  let count = 0;
  let freezes = [];
  let lastWatched = null;
  for (const s of list) {
    const watched = (s.watched || 0) >= STREAK_MIN_WATCH;
    const ongoing = !!s.now;
    const duration = ((ongoing ? now : s.end || s.start) - s.start) / 60000;
    if (watched) {
      count++;
      if (!lastWatched) lastWatched = s.start;
      continue;
    }
    if (ongoing) continue;
    if (duration < STREAK_MIN_LIVE) continue;
    const freezeOk = !freezes.some((f) => Math.abs(f - s.start) < 7 * DAY_MS);
    if (freezeOk) {
      freezes.push(s.start);
      continue;
    }
    break;
  }
  return { count, freezesUsed: freezes.length, lastWatched };
}

function insightDayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dailyTotals(watchLog) {
  const days = {};
  for (const map of Object.values(watchLog || {})) for (const [d, v] of Object.entries(map || {})) days[d] = (days[d] || 0) + (v || 0);
  return days;
}

function computeDayStreak(watchLog, now = Date.now(), minMinutes = 5) {
  const days = dailyTotals(watchLog);
  const has = (ts) => (days[insightDayKey(ts)] || 0) >= minMinutes;
  let cursor = now;
  if (!has(cursor)) cursor -= DAY_MS;
  let count = 0;
  const gaps = [];
  for (let i = 0; i < 4000; i++) {
    if (has(cursor)) {
      count++;
    } else {
      const okGap = count > 0 && !gaps.some((g) => Math.abs(g - cursor) < 7 * DAY_MS) && has(cursor - DAY_MS);
      if (!okGap) break;
      gaps.push(cursor);
    }
    cursor -= DAY_MS;
  }
  return count;
}

function computeWeekendStreak(watchLog, now = Date.now(), minMinutes = 5) {
  const days = dailyTotals(watchLog);
  const ok = (ts) => (days[insightDayKey(ts)] || 0) >= minMinutes;
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  const back = (d.getDay() + 1) % 7;
  let sat = d.getTime() - back * DAY_MS;
  let count = 0;
  let first = true;
  for (let i = 0; i < 300; i++) {
    const sun = sat + DAY_MS;
    const full = ok(sat) && ok(sun);
    if (full) count++;
    else if (!(first && sun >= now - DAY_MS)) break;
    first = false;
    sat -= 7 * DAY_MS;
  }
  return count;
}

function fmtHoursShort(min) {
  const h = min / 60;
  if (h >= 10) return `${Math.floor(h)}h`;
  if (h >= 1) return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1).replace(".", ",")}h`;
  return `${Math.floor(min)} min`;
}

const ACHIEVEMENT_GROUPS = [
  { id: "tempo", title: "Tempo" },
  { id: "dedicacao", title: "Dedicação" },
  { id: "chat", title: "Chat" },
  { id: "especiais", title: "Especiais" },
  { id: "lendarias", title: "Lendárias" },
  { id: "p", get title() { return (PERK && PERK.g) || ""; } },
];

function computeAchievements(data, now = Date.now()) {
  const watchLog = data.watchLog || {};
  const sessions = [
    ...(data.liveHistory || []),
    ...Object.values(data.openSessions || {}).map((s) => ({ ...s, now: true })),
  ];
  const ach = data.achState || {};
  const perKey = {};
  for (const [k, map] of Object.entries(watchLog)) perKey[k] = Object.values(map || {}).reduce((a, b) => a + (b || 0), 0);
  const total = Object.values(perKey).reduce((a, b) => a + b, 0);
  let bestKey = null;
  let bestMin = 0;
  for (const [k, v] of Object.entries(perKey)) if (v > bestMin) (bestMin = v), (bestKey = k);
  const bestName = bestKey ? bestKey.split(":").slice(1).join(":") : "";
  const distinct = Object.values(perKey).filter((v) => v >= 10).length;
  const platforms = new Set(Object.entries(perKey).filter(([, v]) => v >= 10).map(([k]) => k.split(":")[0]));
  const dayStreak = computeDayStreak(watchLog, now);
  const weekendStreak = computeWeekendStreak(watchLog, now);
  const maxSession = sessions.reduce((m, s) => Math.max(m, s.watched || 0), 0);
  const punctual = sessions.filter((s) => s.firstWatchAt && s.start && s.firstWatchAt - s.start <= 5 * 60000 && (s.watched || 0) >= 10).length;
  const fullLive = sessions.some((s) => {
    if (s.now) return false;
    const dur = ((s.end || s.start) - s.start) / 60000;
    return dur >= 30 && (s.watched || 0) >= dur * 0.9;
  });
  let loyal = false;
  const byMonth = {};
  for (const s of sessions) {
    const dur = (((s.now ? now : s.end) || s.start) - s.start) / 60000;
    if (dur < 15) continue;
    const d = new Date(s.start);
    const k = `${(s.platform || "youtube")}:${s.handle}|${d.getFullYear()}-${d.getMonth()}`;
    const e = (byMonth[k] = byMonth[k] || { lives: 0, watched: 0 });
    e.lives++;
    if ((s.watched || 0) >= 10) e.watched++;
  }
  for (const e of Object.values(byMonth)) if (e.lives >= 4 && e.watched / e.lives >= 0.5) loyal = true;
  const msgs = (ach.messages && ach.messages.total) || 0;
  const nightOk = Object.values(ach.nightMin || {}).some((v) => v >= 10);
  const morningOk = Object.values(ach.morningMin || {}).some((v) => v >= 10);
  const firstLive = sessions.some((s) => (s.watched || 0) >= 5) || total >= 5;
  const installedDays = ach.installedAt ? (now - ach.installedAt) / DAY_MS : 0;

  const list = [];
  const tier = (group, id, icon, title, value, target, fmt, desc) =>
    list.push({ group, id, icon, title, value, target, unlocked: value >= target, progress: `${fmt(Math.min(value, target))} de ${fmt(target)}`, desc });
  const single = (group, id, icon, title, unlocked, desc, progress) =>
    list.push({ group, id, icon, title, value: unlocked ? 1 : 0, target: 1, unlocked: !!unlocked, progress: progress || "", desc });

  [[600, "10 horas"], [6000, "100 horas"], [30000, "500 horas"], [60000, "1.000 horas"]].forEach(([t, title], i) =>
    tier("tempo", `total-${i + 1}`, `total-${i + 1}`, title, total, t, fmtHoursShort, "Tempo total de live assistida"));
  [[600, "10h num canal"], [3000, "50h num canal"], [6000, "100h num canal"], [30000, "500h num canal"]].forEach(([t, title], i) =>
    tier("tempo", `canal-${i + 1}`, `canal-${i + 1}`, title, bestMin, t, fmtHoursShort, bestName ? `Seu canal mais assistido: ${bestName}` : "Tempo num mesmo canal"));
  [[240, "Maratona 4h"], [480, "Maratona 8h"], [720, "Maratona 12h"]].forEach(([t, title], i) =>
    tier("tempo", `maratona-${i + 1}`, `maratona-${i + 1}`, title, maxSession, t, fmtHoursShort, "Tempo assistido numa mesma live"));
  [[10, "10 dias seguidos"], [30, "30 dias seguidos"], [100, "100 dias seguidos"], [365, "1 ano seguido"]].forEach(([t, title], i) =>
    tier("dedicacao", `seq-${i + 1}`, `seq-${i + 1}`, title, dayStreak, t, (v) => `${v}`, "Dias seguidos assistindo live (1 dia de folga por semana)"));
  [[5, "Explorador"], [15, "Explorador II"], [30, "Explorador III"]].forEach(([t, title], i) =>
    tier("dedicacao", `explorador-${i + 1}`, `explorador-${i + 1}`, title, distinct, t, (v) => `${v}`, `Canais diferentes assistidos (10 min ou mais)`));
  [[100, "Tagarela"], [1000, "Tagarela II"], [10000, "Tagarela III"]].forEach(([t, title], i) =>
    tier("chat", `tagarela-${i + 1}`, `tagarela-${i + 1}`, title, msgs, t, (v) => v.toLocaleString("pt-BR"), "Mensagens enviadas no chat das lives"));
  single("chat", "primeirapalavra", "primeirapalavra", "Primeira palavra", msgs >= 1, "Mandou sua primeira mensagem num chat");

  single("especiais", "primeira", "primeira", "Primeira de todas", firstLive, "Assistiu sua primeira live com o Canais");
  single("especiais", "coruja", "coruja", "Coruja", nightOk, "Assistiu live entre meia-noite e 5h");
  single("especiais", "madrugador", "madrugador", "Madrugador", morningOk, "Assistiu live entre 5h e 8h da manhã");
  tier("especiais", "pontual", "pontual", "Pontual", punctual, 10, (v) => `${v}`, "Entrou nos primeiros 5 minutos de live");
  single("especiais", "comecoaofim", "comecoaofim", "Do começo ao fim", fullLive, "Assistiu 90% de uma live inteira");
  single("especiais", "fiel", "fiel", "Fiel", loyal, "Assistiu metade das lives de um canal num mês");
  tier("especiais", "tresmundos", "tresmundos", "Três mundos", platforms.size, 3, (v) => `${v}`, "Assistiu live no YouTube, na Twitch e na Kick");
  tier("especiais", "fimdesemana", "fimdesemana", "Fim de semana", weekendStreak, 4, (v) => `${v}`, "Assistiu sábado e domingo, 4 fins de semana seguidos");
  tier("especiais", "cacadorvideos", "cacadorvideos", "Caçador de vídeos", ach.videoOpens || 0, 25, (v) => `${v}`, "Abriu vídeos novos pela notificação");
  tier("especiais", "nuncaperde", "nuncaperde", "Nunca perde", ach.quickOpens || 0, 10, (v) => `${v}`, "Abriu a live até 2 min depois do aviso");
  single("especiais", "virada", "virada", "Virada", !!ach.virada, "Estava assistindo live na virada do ano");
  single("especiais", "diahistorico", "diahistorico", "Dia histórico", !!ach.historic, "Assistiu uma live no recorde de espectadores do canal (Kick)");
  tier("especiais", "aniversario", "aniversario", "Aniversário", Math.floor(installedDays), 365, (v) => `${v}`, "1 ano usando o Canais");

  const lvlNow = typeof computeLevel === "function" ? computeLevel(data).level : 1;
  tier("lendarias", "lendaria-bronze", "lendaria-bronze", "Lendária de Bronze", lvlNow, 50, (v) => `nível ${v}`, "Chegou ao nível 50");
  tier("lendarias", "lendaria-prata", "lendaria-prata", "Lendária de Prata", lvlNow, 75, (v) => `nível ${v}`, "Chegou ao nível 75");
  tier("lendarias", "lendaria-ouro", "lendaria-ouro", "Lendária de Ouro", lvlNow, 100, (v) => `nível ${v}`, "Chegou ao nível 100");

  const stored = data.achievements || {};
  const allOthers = list.every((a) => a.unlocked || stored[a.id]);
  list.push(perkify({ group: "p", id: PERK_ID, icon: "level", title: "???", value: allOthers ? 1 : 0, target: 1, unlocked: allOthers, progress: "", desc: "", hidden: true }));
  return list;
}

function computeChannelAchievements(key, data, now = Date.now()) {
  const days = (data.watchLog || {})[key] || {};
  const total = Object.values(days).reduce((a, b) => a + (b || 0), 0);
  const sessions = [
    ...(data.liveHistory || []).filter((s) => `${s.platform || "youtube"}:${s.handle}` === key),
    ...Object.entries(data.openSessions || {}).filter(([k]) => k === key).map(([, s]) => ({ ...s, now: true })),
  ];
  const maxSession = sessions.reduce((m, s) => Math.max(m, s.watched || 0), 0);
  let bestStreak = 0;
  const sorted = sessions.slice().sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length; i++) {
    const st = computeStreak(sorted.slice(0, i + 1), now).count;
    if (st > bestStreak) bestStreak = st;
  }
  const msgs = (((data.achState || {}).messages || {}).perKey || {})[key] || 0;
  const punctual = sessions.filter((s) => s.firstWatchAt && s.start && s.firstWatchAt - s.start <= 5 * 60000 && (s.watched || 0) >= 10).length;
  const fullLive = sessions.some((s) => {
    if (s.now) return false;
    const dur = ((s.end || s.start) - s.start) / 60000;
    return dur >= 30 && (s.watched || 0) >= dur * 0.9;
  });
  const byMonth = {};
  for (const s of sessions) {
    const dur = (((s.now ? now : s.end) || s.start) - s.start) / 60000;
    if (dur < 15) continue;
    const d = new Date(s.start);
    const e = (byMonth[`${d.getFullYear()}-${d.getMonth()}`] = byMonth[`${d.getFullYear()}-${d.getMonth()}`] || { lives: 0, watched: 0 });
    e.lives++;
    if ((s.watched || 0) >= 10) e.watched++;
  }
  const loyal = Object.values(byMonth).some((e) => e.lives >= 4 && e.watched / e.lives >= 0.5);

  const list = [];
  const tier = (group, id, icon, title, value, target, fmt, desc) =>
    list.push({ group, id, icon, title, value, target, unlocked: value >= target, progress: `${fmt(Math.min(value, target))} de ${fmt(target)}`, desc });
  const single = (group, id, icon, title, unlocked, desc) =>
    list.push({ group, id, icon, title, value: unlocked ? 1 : 0, target: 1, unlocked: !!unlocked, progress: "", desc });
  [[600, "10 horas"], [3000, "50 horas"], [6000, "100 horas"], [30000, "500 horas"]].forEach(([t, title], i) =>
    tier("tempo", `c-tempo-${i + 1}`, `canal-${i + 1}`, title, total, t, fmtHoursShort, "Tempo assistido neste canal"));
  [[240, "Maratona 4h"], [480, "Maratona 8h"], [720, "Maratona 12h"]].forEach(([t, title], i) =>
    tier("tempo", `c-maratona-${i + 1}`, `maratona-${i + 1}`, title, maxSession, t, fmtHoursShort, "Numa mesma live deste canal"));
  [[10, "10 lives seguidas"], [30, "30 lives seguidas"], [100, "100 lives seguidas"]].forEach(([t, title], i) =>
    tier("dedicacao", `c-seq-${i + 1}`, `seq-${i + 1}`, title, bestStreak, t, (v) => `${v}`, "Lives seguidas deste canal (1 falta por semana)"));
  tier("dedicacao", "c-pontual", "pontual", "Pontual", punctual, 10, (v) => `${v}`, "Entrou nos primeiros 5 min de live");
  single("dedicacao", "c-comecoaofim", "comecoaofim", "Do começo ao fim", fullLive, "Assistiu 90% de uma live inteira");
  single("dedicacao", "c-fiel", "fiel", "Fiel", loyal, "Metade das lives deste canal num mês");
  single("chat", "c-primeirapalavra", "primeirapalavra", "Primeira palavra", msgs >= 1, "Primeira mensagem no chat deste canal");
  [[100, "Tagarela"], [1000, "Tagarela II"], [10000, "Tagarela III"]].forEach(([t, title], i) =>
    tier("chat", `c-tagarela-${i + 1}`, `tagarela-${i + 1}`, title, msgs, t, (v) => v.toLocaleString("pt-BR"), "Mensagens no chat deste canal"));
  return { list, total, sessions: sessions.length, msgs };
}

const XP_PER_ACHIEVEMENT = 30;
const XP_PER_CHALLENGE = 60;
const RANKS = [
  [1, "Novato"],
  [5, "Espectador"],
  [10, "Frequente"],
  [15, "Fã"],
  [20, "Veterano"],
  [30, "Lenda"],
];

function xpForLevel(level) {
  return level <= 1 ? 0 : Math.round(60 * Math.pow(level, 1.6));
}

function computeLevel(data) {
  const total = Object.values(data.watchLog || {}).reduce(
    (a, map) => a + Object.values(map || {}).reduce((x, y) => x + (y || 0), 0),
    0
  );
  const achCount = Object.keys(data.achievements || {}).filter((k) => !k.startsWith("c-")).length;
  const challenges = Object.values((data.achState || {}).challengesDone || {}).reduce((a, list) => a + (list || []).length, 0);
  const xp = Math.floor(total + achCount * XP_PER_ACHIEVEMENT + challenges * XP_PER_CHALLENGE);
  let level = 1;
  while (xp >= xpForLevel(level + 1) && level < 200) level++;
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  let rank = RANKS[0][1];
  for (const [min, name] of RANKS) if (level >= min) rank = name;
  return { xp, level, rank, cur, next, progress: (xp - cur) / Math.max(1, next - cur) };
}

const ACCENTS = [
  { id: "iris", name: "Íris", level: 1, light: "#5b4bff", dark: "#8b7fff" },
  { id: "ciano", name: "Ciano", level: 5, light: "#0aa5c2", dark: "#3ee8ff" },
  { id: "magenta", name: "Magenta", level: 10, light: "#e8256f", dark: "#ff5c9d" },
  { id: "coral", name: "Coral", level: 15, light: "#e5533d", dark: "#ff7a66" },
  { id: "menta", name: "Menta", level: 20, light: "#12a37c", dark: "#3fd9a8" },
  { id: "grafite", name: "Grafite", level: 30, light: "#0b0c14", dark: "#f1f2f6" },
  { id: "bronze", name: "Bronze", badge: "lendaria-bronze", badgeName: "Lendária de Bronze", light: "#a8642e", dark: "#d99459" },
  { id: "prata", name: "Prata", badge: "lendaria-prata", badgeName: "Lendária de Prata", light: "#6f7a88", dark: "#c6cdd7" },
  { id: "ouro", name: "Ouro", badge: "lendaria-ouro", badgeName: "Lendária de Ouro", light: "#b07d10", dark: "#ecb93f" },
  { id: "p0", badge: "p0", badgeName: "???", hidden: true, get name() { return (PERK && PERK.an) || "???"; }, get light() { return (PERK && PERK.light) || "#5b4bff"; }, get dark() { return (PERK && PERK.dark) || "#8b7fff"; } },
];

const THEME_REWARDS = [
  { id: "meianoite", name: "Tema Meia-noite", desc: "Preto total, ótimo pra tela OLED", badge: "coruja", badgeName: "Coruja" },
  { id: "p0", badge: "p0", badgeName: "???", hidden: true, get name() { return (PERK && PERK.tn) || ""; }, get desc() { return (PERK && PERK.td) || ""; } },
];

const FRAME_REWARDS = [
  { id: "none", name: "Sem moldura", level: 1, desc: "Cartão sem borda" },
  { id: "neon", name: "Neon", level: 8, desc: "Borda ciano" },
  { id: "tricolor", name: "Tricolor", badge: "total-3", badgeName: "500 horas", desc: "Borda ciano, íris e magenta" },
  { id: "lenda", name: "Lenda", level: 30, desc: "Borda tricolor com borda magenta por fora" },
  { id: "bronze", name: "Bronze", badge: "lendaria-bronze", badgeName: "Lendária de Bronze", desc: "Borda de bronze" },
  { id: "prata", name: "Prata", badge: "lendaria-prata", badgeName: "Lendária de Prata", desc: "Borda de prata" },
  { id: "ouro", name: "Ouro", badge: "lendaria-ouro", badgeName: "Lendária de Ouro", desc: "Borda de ouro" },
];

const METAL_COLORS = {
  bronze: { base: "#c27a3e", dark: "#8a4f22", light: "#eaa56c" },
  prata: { base: "#b4bcc8", dark: "#6f7a88", light: "#eef1f5" },
  ouro: { base: "#e3ad2f", dark: "#a5720f", light: "#ffdc7d" },
};

function currentFrame(settings, levelInfo, achievements) {
  const f = FRAME_REWARDS.find((x) => x.id === (settings || {}).frame);
  return f && rewardUnlocked(f, levelInfo, achievements) ? f.id : "none";
}

function rewardUnlocked(reward, levelInfo, achievements) {
  if (reward.badge) return !!(achievements || {})[reward.badge];
  return levelInfo.level >= (reward.level || 1);
}

function weekStart(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

function weekId(ts) {
  return insightDayKey(weekStart(ts));
}

const CHALLENGE_POOL = [
  { id: "horas3", title: "Assista 3h de live", target: 180, unit: "min", calc: (w) => w.minutes },
  { id: "horas6", title: "Assista 6h de live", target: 360, unit: "min", calc: (w) => w.minutes },
  { id: "canais3", title: "Assista 3 canais diferentes", target: 3, unit: "", calc: (w) => w.channels },
  { id: "dias4", title: "Assista live em 4 dias diferentes", target: 4, unit: "", calc: (w) => w.days },
  { id: "pontual2", title: "Entre nos primeiros 5 min de 2 lives", target: 2, unit: "", calc: (w) => w.punctual },
  { id: "longa", title: "Fique 2h seguidas numa live", target: 120, unit: "min", calc: (w) => w.longest },
  { id: "inteira", title: "Assista uma live do começo ao fim", target: 1, unit: "", calc: (w) => w.full },
  { id: "chat20", title: "Mande 20 mensagens no chat", target: 20, unit: "", calc: (w) => w.messages, needsChat: true },
  { id: "fds", title: "Assista live no sábado e no domingo", target: 2, unit: "", calc: (w) => w.weekendDays },
];

function seededPick(seedStr, pool, n) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const arr = pool.slice();
  const out = [];
  while (out.length < n && arr.length) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const i = h % arr.length;
    const c = arr.splice(i, 1)[0];
    if (out.some((o) => o.id.startsWith("horas") && c.id.startsWith("horas"))) continue;
    out.push(c);
  }
  return out;
}

function weekStats(data, start, end) {
  const days = {};
  const channels = new Set();
  let minutes = 0;
  for (const [k, map] of Object.entries(data.watchLog || {})) {
    for (const [d, v] of Object.entries(map || {})) {
      const t = new Date(d + "T12:00:00").getTime();
      if (t < start || t >= end || !(v > 0)) continue;
      minutes += v;
      days[d] = (days[d] || 0) + v;
      if (v >= 10) channels.add(k);
    }
  }
  const sessions = [
    ...(data.liveHistory || []),
    ...Object.values(data.openSessions || {}).map((s) => ({ ...s, now: true })),
  ].filter((s) => s.start >= start - 12 * 3600000 && s.start < end);
  const punctual = sessions.filter((s) => s.firstWatchAt && s.firstWatchAt >= start && s.firstWatchAt - s.start <= 5 * 60000 && (s.watched || 0) >= 10).length;
  const longest = sessions.reduce((m, s) => Math.max(m, s.watched || 0), 0);
  const full = sessions.filter((s) => {
    if (s.now) return false;
    const dur = ((s.end || s.start) - s.start) / 60000;
    return dur >= 30 && (s.watched || 0) >= dur * 0.9;
  }).length;
  let messages = 0;
  for (const [d, n] of Object.entries(((data.achState || {}).messagesByDay) || {})) {
    const t = new Date(d + "T12:00:00").getTime();
    if (t >= start && t < end) messages += n;
  }
  const activeDays = Object.entries(days).filter(([, v]) => v >= 5);
  const weekendDays = activeDays.filter(([d]) => [0, 6].includes(new Date(d + "T12:00:00").getDay())).length;
  return { minutes, channels: channels.size, days: activeDays.length, punctual, longest, full, messages, weekendDays };
}

function computeChallenges(data, now = Date.now()) {
  const start = weekStart(now);
  const end = start + 7 * DAY_MS;
  const chatOn = ((data.settings || {}).countChat) !== false;
  const pool = CHALLENGE_POOL.filter((c) => chatOn || !c.needsChat);
  const picked = seededPick(weekId(now), pool, 3);
  const w = weekStats(data, start, end);
  const done = (((data.achState || {}).challengesDone || {})[weekId(now)]) || [];
  return {
    weekId: weekId(now),
    endsAt: end,
    items: picked.map((c) => {
      const value = c.calc(w);
      const fmt = (v) => (c.unit === "min" ? fmtHoursShort(v) : `${Math.floor(v)}`);
      return {
        id: c.id,
        title: c.title,
        value,
        target: c.target,
        done: done.includes(c.id) || value >= c.target,
        progress: `${fmt(Math.min(value, c.target))} de ${fmt(c.target)}`,
      };
    }),
  };
}

function computeRetro(data, start, end) {
  const perKey = {};
  const days = {};
  for (const [k, map] of Object.entries(data.watchLog || {})) {
    for (const [d, v] of Object.entries(map || {})) {
      const t = new Date(d + "T12:00:00").getTime();
      if (t < start || t >= end || !(v > 0)) continue;
      perKey[k] = (perKey[k] || 0) + v;
      days[d] = (days[d] || 0) + v;
    }
  }
  const total = Object.values(perKey).reduce((a, b) => a + b, 0);
  const top = Object.entries(perKey).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ key: k, name: k.split(":").slice(1).join(":"), platform: k.split(":")[0], minutes: v }));
  const sessions = (data.liveHistory || []).filter((s) => s.start >= start && s.start < end);
  const longest = sessions.reduce((m, s) => ((s.watched || 0) > (m ? m.watched : 0) ? s : m), null);
  const livesWatched = sessions.filter((s) => (s.watched || 0) >= 10).length;
  const achievements = Object.entries(data.achievements || {}).filter(([id, t]) => !id.startsWith("c-") && t >= start && t < end).map(([id]) => id);
  let bestDay = null;
  for (const [d, v] of Object.entries(days)) if (!bestDay || v > bestDay.minutes) bestDay = { day: d, minutes: v };
  let streak = 0;
  let run = 0;
  for (let t = start; t < end; t += DAY_MS) {
    if ((days[insightDayKey(t)] || 0) >= 5) streak = Math.max(streak, ++run);
    else run = 0;
  }
  return { total, top, days: Object.values(days).filter((v) => v >= 5).length, longest, livesWatched, achievements, bestDay, streak };
}


// ---- extras ----
const PERK_ID = "p0";
var PERK = null;
const PK_BLOB = "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";

function perkify(a) {
  if (!a || a.id !== PERK_ID || !PERK) return a;
  return { ...a, title: PERK.t, desc: PERK.d, kicker: PERK.k, svg: PERK.svg, src: "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(PERK.svg))) };
}

function badgeSrc(a) {
  return (a && a.src) || `badges/${a.icon}.svg`;
}

function perkOn(settings, achievements) {
  return !!PERK && !!(achievements || {})[PERK_ID] && (settings || {}).fx !== false;
}

async function loadPerk() {
  try {
    const { pk } = await chrome.storage.local.get("pk");
    if (pk) PERK = pk;
  } catch (_) {}
  return PERK;
}

async function openPerk() {
  if (PERK) return PERK;
  try {
    const seed = ACHIEVEMENT_SEED.slice().sort().join("|") + "#canais";
    const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
    const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
    const bytes = Uint8Array.from(atob(PK_BLOB), (ch) => ch.charCodeAt(0));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.slice(0, 12) }, key, bytes.slice(12));
    PERK = JSON.parse(new TextDecoder().decode(plain));
    await chrome.storage.local.set({ pk: PERK });
    return PERK;
  } catch (_) {
    return null;
  }
}

const ACHIEVEMENT_SEED = ["lendaria-bronze", "lendaria-prata", "lendaria-ouro"];

try {
  loadPerk();
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area === "local" && ch.pk) PERK = ch.pk.newValue || null;
  });
} catch (_) {}
