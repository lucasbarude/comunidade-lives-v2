const form = document.getElementById("add-form");
const handleInput = document.getElementById("handle-input");
const notifyCheck = document.getElementById("notify-check");
const autoOpenCheck = document.getElementById("autoopen-check");
const list = document.getElementById("list");
const empty = document.getElementById("empty");
const checkNowBtn = document.getElementById("check-now");
const checkStatus = document.getElementById("check-status");
const tabs = document.querySelectorAll(".tab");
const themeBtn = document.getElementById("theme-btn");
const historyBtn = document.getElementById("history-btn");
const achBtn = document.getElementById("ach-btn");
const settingsBtn = document.getElementById("settings-btn");
const permBanner = document.getElementById("perm-banner");
const permBtn = document.getElementById("perm-btn");
const resetBtn = document.getElementById("reset-btn");
const dndBanner = document.getElementById("dnd-banner");
const dndText = document.getElementById("dnd-text");
const dndOff = document.getElementById("dnd-off");
const liveSummary = document.getElementById("live-summary");
const progressBar = document.getElementById("progress");
const pageBanner = document.getElementById("page-banner");
const pageText = document.getElementById("page-text");
const pageAdd = document.getElementById("page-add");
const toolbar = document.getElementById("toolbar");
const filterWrap = document.getElementById("filter-wrap");
const filterInput = document.getElementById("filter-input");
const openAllBtn = document.getElementById("open-all");
const addBtn = form.querySelector(".add-btn");

const ALL_ORIGINS = ["https://www.youtube.com/*", "https://www.twitch.tv/*", "https://kick.com/*"];
const PLATFORMS = ["youtube", "twitch", "kick"];
const PLATFORM_LABEL = { youtube: "YouTube", twitch: "Twitch", kick: "Kick" };
const IS_FULL = new URLSearchParams(location.search).has("full");
if (IS_FULL) document.body.classList.add("full");

let currentPlatform = "youtube";
try {
  const saved = localStorage.getItem("canais.tab");
  if (["live", "youtube", "twitch", "kick"].includes(saved)) currentPlatform = saved;
} catch (_) {}
let filterText = "";
let checkingAll = false;

const ICON_PATHS = {
  bellOn: `<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" />`,
  bellOff: `<path d="M3 3l18 18" /><path d="M10 5a2 2 0 0 1 3.585 -1.133l.015 .013a7 7 0 0 1 4.4 6.12l0 .28v3m2 2h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 .12 -1.27" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" />`,
  linkOn: `<path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />`,
  linkOff: `<path d="M9 15l3 -3m2 -2l1 -1" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M3 3l18 18" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />`,
  videoAuto: `<path d="M12 20h-7a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v3.5" /><path d="M12 16a3 3 0 1 0 0 -6a3 3 0 0 0 0 6z" /><path d="M19 22v-6" /><path d="M22 19l-3 -3l-3 3" />`,
  menu: `<path d="M12 5.5v.01" /><path d="M12 12v.01" /><path d="M12 18.5v.01" />`,
  star: `<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />`,
  plus: `<path d="M12 5l0 14" /><path d="M5 12l14 0" />`,
  broadcast: `<path d="M18.364 19.364a9 9 0 1 0 -12.728 0" /><path d="M15.536 16.536a5 5 0 1 0 -7.072 0" /><path d="M12 13m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />`,
  external: `<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" />`,
  clock: `<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" />`,
  flame: `<path d="M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.621 -2.333 5.588c0 3.704 3.134 6.706 7 6.706s7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235" />`,
  search: `<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" />`,
  trash: `<path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />`,
  pause: `<path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />`,
  play: `<path d="M7 4v16l13 -8z" />`,
  close: `<path d="M18 6l-12 12" /><path d="M6 6l12 12" />`,
  sun: `<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />`,
  moon: `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />`,
  themeAuto: `<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 3v18" /><path d="M12 9l4.65 -4.65" /><path d="M12 14.3l7.37 -7.37" /><path d="M12 19.6l8.85 -8.85" />`,
  chevron: `<path d="M9 6l6 6l-6 6" />`,
  check: `<path d="M5 12l5 5l10 -10" />`,
  lock: `<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" /><path d="M8 11v-4a4 4 0 1 1 8 0v4" />`,
  pin: `<path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" /><path d="M9 15l-4.5 4.5" /><path d="M14.5 4l5.5 5.5" />`,
  share: `<path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" />`,
  trophy: `<path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10" /><path d="M17 4v8a5 5 0 0 1 -10 0v-8" /><path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />`,
  grid: `<path d="M4 4h4v4h-4z" /><path d="M10 4h4v4h-4z" /><path d="M16 4h4v4h-4z" /><path d="M4 10h4v4h-4z" /><path d="M10 10h4v4h-4z" /><path d="M16 10h4v4h-4z" /><path d="M4 16h4v4h-4z" /><path d="M10 16h4v4h-4z" /><path d="M16 16h4v4h-4z" />`,
  gear: `<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />`,
  volume: `<path d="M15 8a5 5 0 0 1 0 8" /><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />`,
  volumeOff: `<path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" /><path d="M16 10l4 4m0 -4l-4 4" />`,
  back: `<path d="M5 12l14 0" /><path d="M5 12l6 6" /><path d="M5 12l6 -6" />`,
  expand: `<path d="M16 4l4 0l0 4" /><path d="M14 10l6 -6" /><path d="M8 20l-4 0l0 -4" /><path d="M4 20l6 -6" />`,
  refresh: `<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />`,
};

function initialOf(handle) {
  const c = (handle || "").replace("@", "").trim().charAt(0);
  return c ? c.toUpperCase() : "?";
}

function svgIcon(name, size = 16, width = 2) {
  const w = name === "menu" ? 3 : width;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

function el(tag, props = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e[k] = v;
    else e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) e.append(c);
  return e;
}

function channelKey(c) {
  return (c.platform || "youtube") + ":" + c.handle;
}

async function getChannels() {
  const { channels = [] } = await chrome.storage.local.get("channels");
  return channels;
}

async function getSettings() {
  const { settings = {} } = await chrome.storage.local.get("settings");
  return settings;
}

async function patchSettings(fields) {
  const settings = await getSettings();
  const next = { ...settings, ...fields };
  await chrome.storage.local.set({ settings: next });
  return next;
}

async function saveChannels(channels) {
  await chrome.storage.local.set({ channels });
  render();
}

const THEME_ORDER = ["auto", "light", "dark"];
const THEME_LABEL = { auto: "Tema: automático", light: "Tema: claro", dark: "Tema: escuro" };
const THEME_ICON = { auto: "themeAuto", light: "sun", dark: "moon" };

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
  else document.documentElement.removeAttribute("data-theme");
  themeBtn.innerHTML = svgIcon(THEME_ICON[theme] || "themeAuto", 14);
  themeBtn.title = THEME_LABEL[theme] || THEME_LABEL.auto;
}

async function loadTheme() {
  const settings = await getSettings();
  applyTheme(settings.theme || "auto");
}

themeBtn.addEventListener("click", async () => {
  const settings = await getSettings();
  const current = settings.theme || "auto";
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
  await patchSettings({ theme: next });
  applyTheme(next);
});

historyBtn.innerHTML = svgIcon("grid", 14);
settingsBtn.innerHTML = svgIcon("gear", 14);
historyBtn.addEventListener("click", () => openHistoryPanel());
achBtn.insertAdjacentHTML("afterbegin", svgIcon("trophy", 15));
achBtn.addEventListener("click", () => openAchievementsPanel());

async function refreshAchDot() {
  const { achievements = {}, settings = {} } = await chrome.storage.local.get(["achievements", "settings"]);
  const seen = settings.achSeenAt || 0;
  achBtn.classList.toggle("has-new", Object.values(achievements).some((t) => t > seen));
}

async function loadAchData() {
  await loadPerk();
  return chrome.storage.local.get(["watchLog", "liveHistory", "openSessions", "achState", "achievements", "settings", "channels"]);
}

function achNode(a, { unlockedAt, seen } = {}) {
  const isNew = a.unlocked && unlockedAt && seen !== undefined && unlockedAt > seen;
  const node = el("div", { class: "ach" + (a.unlocked ? "" : " locked") + (isNew ? " new" : ""), title: a.desc });
  node.append(el("img", { src: badgeSrc(a), alt: "" }), el("div", { class: "t", text: a.title }));
  if (a.unlocked) {
    node.append(el("div", { class: "p", text: unlockedAt ? `ganha em ${fmtDate(unlockedAt)}` : "desbloqueada" }));
  } else {
    node.append(el("div", { class: "p", text: a.target > 1 ? a.progress : a.desc }));
    if (a.target > 1) {
      const mini = el("div", { class: "mini" }, [el("b")]);
      mini.firstChild.style.width = Math.round(Math.min(1, a.value / a.target) * 100) + "%";
      node.append(mini);
    }
  }
  return node;
}

function achSummary(got, total, sub) {
  const bar = el("div", { class: "ach-bar" }, [el("b")]);
  bar.firstChild.style.width = Math.round((got / Math.max(1, total)) * 100) + "%";
  return card(
    el("div", { class: "panel-section" }, [
      el("div", { class: "ach-summary" }, [el("div", { class: "big", text: `${got} de ${total}` }), el("div", { class: "small", text: sub })]),
      bar,
    ])
  );
}

function achGroups(panel, list, opts) {
  for (const g of ACHIEVEMENT_GROUPS) {
    const items = list.filter((a) => a.group === g.id && (!a.hidden || (!!PERK && a.unlocked)));
    if (!items.length) continue;
    const grid = el("div", { class: "ach-grid" });
    for (const a of items) grid.append(achNode(a, { unlockedAt: opts.unlockedAt ? opts.unlockedAt[a.id] : null, seen: opts.seen }));
    panel.append(secTitle(g.title), card(grid));
  }
}

function achTabs(panel, current) {
  const seg = el("div", { class: "seg" });
  for (const [v, label] of [
    ["geral", "Geral"],
    ["canais", "Por canal"],
  ]) {
    const b = el("button", { type: "button", class: current === v ? "active" : "", text: label });
    b.onclick = () => (v === "geral" ? openAchievementsPanel() : openChannelAchievementsList());
    seg.append(b);
  }
  const wrap = el("div", { class: "panel-section" }, [seg]);
  wrap.style.padding = "8px 12px 0";
  panel.append(wrap);
}

async function openAchievementsPanel() {
  sendToBackground({ type: "EVAL_ACHIEVEMENTS" }, 8000);
  const data = await loadAchData();
  const unlockedAt = data.achievements || {};
  const seen = (data.settings || {}).achSeenAt || 0;
  const list = computeAchievements(data);
  for (const a of list) if (unlockedAt[a.id]) a.unlocked = true;
  const panel = makePanel("Conquistas");
  achTabs(panel, "geral");
  const visible = list.filter((a) => !a.hidden || (!!PERK && a.unlocked));
  const got = visible.filter((a) => a.unlocked).length;
  const lvl = computeLevel(data);
  const ring = el("div", { class: "lvl-ring big" });
  ring.dataset.frame = currentFrame(data.settings, lvl, data.achievements);
  ring.style.setProperty("--p", String(Math.round(lvl.progress * 100)));
  ring.append(el("span", { text: String(lvl.level) }));
  const lvlCard = el("button", { type: "button", class: "today-card", style: "background:transparent;padding:4px" }, [
    ring,
    el("div", { class: "today-txt" }, [
      el("div", { class: "lvl-title", text: `Nível ${lvl.level} · ${lvl.rank}` }),
      el("div", { class: "today-l2", text: `${got} de ${visible.length} conquistas · ${Math.round(lvl.progress * 100)}% pro nível ${lvl.level + 1}` }),
    ]),
    el("span", { class: "today-chev", html: svgIcon("chevron", 16) }),
  ]);
  lvlCard.onclick = () => openTodayPanel();
  const shareP = el("button", { type: "button", class: "chip", html: svgIcon("share", 13) + " Cartão de perfil" });
  shareP.onclick = () => openProfileCard(() => openAchievementsPanel());
  const shareR = el("button", { type: "button", class: "chip", text: "Retrospectiva" });
  shareR.onclick = () => openRetro(null, () => openAchievementsPanel());
  const bar = el("div", { class: "ach-bar" }, [el("b")]);
  bar.firstChild.style.width = Math.round((got / visible.length) * 100) + "%";
  panel.append(card(el("div", { class: "panel-section" }, [lvlCard, bar]), el("div", { class: "share-row", style: "padding:0 12px 12px" }, [shareP, shareR])));
  panel.append(secTitle("Desafios da semana"), card(challengesBlock(data)));
  achGroups(panel, list, { unlockedAt, seen });
  const chatOff = (data.settings || {}).countChat === false;
  panel.append(
    el("div", {
      class: "note",
      style: "margin:14px 18px 0",
      text:
        "Tudo é calculado no seu navegador. As de chat contam só as mensagens enviadas pelo PC" +
        (chatOff ? " (contagem desligada nas configurações)." : " e são experimentais: podem parar de contar se o site mudar."),
    })
  );
  await patchSettings({ achSeenAt: Date.now() });
  refreshAchDot();
}

function channelLabelFromKey(key, channels) {
  const ch = (channels || []).find((c) => channelKey(c) === key);
  const [pf, ...rest] = key.split(":");
  return { name: ch ? ch.handle : rest.join(":"), platform: pf, avatarUrl: ch ? ch.avatarUrl : null, removed: !ch };
}

async function openChannelAchievementsList() {
  const data = await loadAchData();
  const panel = makePanel("Conquistas");
  achTabs(panel, "canais");
  const keys = new Set([
    ...(data.channels || []).map(channelKey),
    ...Object.keys(data.watchLog || {}),
    ...Object.keys(((data.achState || {}).messages || {}).perKey || {}),
  ]);
  const rows = [];
  for (const key of keys) {
    const res = computeChannelAchievements(key, data);
    const got = res.list.filter((a) => a.unlocked);
    rows.push({ key, res, got, info: channelLabelFromKey(key, data.channels) });
  }
  rows.sort((a, b) => b.got.length - a.got.length || b.res.total - a.res.total);
  if (!rows.length) {
    panel.append(card(el("div", { class: "panel-section empty-note", text: "Adicione canais e assista lives pra ver as conquistas de cada um." })));
    return;
  }
  const box = el("div", { class: "ach-ch-list" });
  for (const r of rows) {
    const avatar = el("div", { class: "avatar ach-ch-avatar" });
    if (r.info.avatarUrl) {
      const img = el("img", { src: r.info.avatarUrl, alt: "" });
      img.onerror = () => {
        avatar.innerHTML = "";
        avatar.textContent = initialOf(r.info.name);
      };
      avatar.append(img);
    } else avatar.textContent = initialOf(r.info.name);
    const icons = el("div", { class: "ach-ch-icons" });
    const best = r.got.slice().reverse().slice(0, 4);
    for (const a of best) icons.append(el("img", { src: badgeSrc(a), alt: "", title: a.title }));
    const row = el("button", { type: "button", class: "ach-ch-row" }, [
      avatar,
      el("div", { class: "ach-ch-info" }, [
        el("div", { class: "ach-ch-name" }, [
          el("span", { class: "name", text: r.info.name }),
          el("span", { class: "pf-tag " + r.info.platform, text: PLATFORM_LABEL[r.info.platform] || r.info.platform }),
        ]),
        el("div", { class: "ach-ch-sub", text: `${r.got.length} de ${r.res.list.length} · ${fmtMinutes(r.res.total)} assistidos${r.info.removed ? " · removido" : ""}` }),
      ]),
      icons,
    ]);
    row.onclick = () => openChannelAchievements(r.key, "list");
    box.append(row);
  }
  panel.append(card(box));
}

async function openChannelAchievements(key, from = "list") {
  const data = await loadAchData();
  const info = channelLabelFromKey(key, data.channels);
  const res = computeChannelAchievements(key, data);
  const panel = makePanel(info.name, {
    onBack: () => {
      if (from === "list") openChannelAchievementsList();
      else if (from === "options") {
        const ch = (data.channels || []).find((c) => channelKey(c) === key);
        if (ch) openOptionsPanel(ch);
        else closeOptionsPanel();
      } else closeOptionsPanel();
    },
  });
  const got = res.list.filter((a) => a.unlocked).length;
  panel.append(
    achSummary(
      got,
      res.list.length,
      `${PLATFORM_LABEL[info.platform] || info.platform} · ${fmtMinutes(res.total)} assistidos · ${res.sessions} ${res.sessions === 1 ? "live" : "lives"}`
    )
  );
  achGroups(panel, res.list, {});
  panel.append(
    el("div", {
      class: "note",
      style: "margin:14px 18px 0",
      text: "As conquistas do canal contam a partir da versão 1.17, quando o histórico começou a ser gravado.",
    })
  );
}


function showPopupToasts(items) {
  if (!items.length) return;
  let wrap = document.getElementById("ptoast-wrap");
  if (!wrap) {
    wrap = el("div", { id: "ptoast-wrap" });
    document.body.appendChild(wrap);
  }
  const queue = items.slice(0, 3);
  const extra = items.length - queue.length;
  const showNext = () => {
    const a = queue.shift();
    if (!a) return;
    const badge = el("div", { class: "pt-badge" }, [el("span", { class: "pt-ring" }), el("span", { class: "pt-ring r2" }), el("img", { src: badgeSrc(a), alt: "" })]);
    const colors = ["#3ee8ff", "#5b4bff", "#ff3d8b", "#8b7fff"];
    for (let i = 0; i < 14; i++) {
      const bit = el("span", { class: "pt-bit" + (i % 3 === 0 ? " round" : "") });
      const ang = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5;
      const dist = 34 + Math.random() * 28;
      bit.style.setProperty("--x", `${Math.cos(ang) * dist}px`);
      bit.style.setProperty("--y", `${Math.sin(ang) * dist}px`);
      bit.style.setProperty("--r", `${Math.round(Math.random() * 360)}deg`);
      bit.style.background = colors[i % colors.length];
      badge.append(bit);
    }
    const node = el("div", { class: "ptoast" }, [
      badge,
      el("div", { class: "pt-txt" }, [
        el("div", { class: "pt-kicker", text: a.kicker || "Conquista desbloqueada" }),
        el("div", { class: "pt-title", text: a.title }),
        el("div", { class: "pt-desc", text: a.desc || "" }),
      ]),
    ]);
    if (!queue.length && extra > 0) node.append(el("div", { class: "pt-more", text: `+${extra}` }));
    wrap.append(node);
    const close = () => {
      if (node.classList.contains("out")) return;
      node.classList.add("out");
      setTimeout(() => {
        node.remove();
        showNext();
      }, 350);
    };
    node.onclick = () => {
      close();
      queue.length = 0;
      openAchievementsPanel();
    };
    setTimeout(close, 3600);
  };
  showNext();
}

async function celebrateOnOpen() {
  const data = await loadAchData();
  const settings = data.settings || {};
  if (settings.achievementAlerts === false) return;
  const since = Math.max(settings.achCelebratedAt || 0, settings.achSeenAt || 0);
  const unlockedAt = data.achievements || {};
  const fresh = Object.entries(unlockedAt)
    .filter(([, t]) => t > since)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
  if (!fresh.length) return;
  const all = computeAchievements(data);
  const items = fresh
    .map((id) => all.find((a) => a.id === id))
    .filter((a) => a && (!a.hidden || PERK))
    .map((a) => ({ ...a, kicker: a.kicker || (a.group === "lendarias" ? "Conquista lendária" : "") }));
  await patchSettings({ achCelebratedAt: Date.now() });
  setTimeout(() => showPopupToasts(items), 450);
}

settingsBtn.addEventListener("click", () => openSettingsPanel());

async function checkPermissions() {
  const ok = await chrome.permissions.contains({ origins: ALL_ORIGINS });
  permBanner.style.display = ok ? "none" : "flex";
  return ok;
}

permBtn.addEventListener("click", () => {
  chrome.permissions.request({ origins: ALL_ORIGINS }, async (granted) => {
    await checkPermissions();
    if (granted) runCheckAll();
  });
});

function sendToBackground(msg, timeoutMs = 30000) {
  return new Promise((resolve) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve({ timeout: true });
      }
    }, timeoutMs);
    chrome.runtime.sendMessage(msg, (res) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      const err = chrome.runtime.lastError;
      resolve(err ? { error: err.message } : res || {});
    });
  });
}

async function runCheckAll() {
  if (checkingAll) return;
  checkingAll = true;
  checkNowBtn.disabled = true;
  checkNowBtn.textContent = "Verificando…";
  progressBar.classList.add("on");
  const res = await sendToBackground({ type: "CHECK_NOW" }, 120000);
  checkingAll = false;
  checkNowBtn.disabled = false;
  checkNowBtn.textContent = "Verificar todos";
  if (res.error) flash("erro: " + res.error, 8000);
  else if (res.timeout) flash("demorou demais", 8000);
  else flash("tudo verificado", 3000);
  render();
}

function flash(text, ms = 5000) {
  checkStatus.textContent = text;
  setTimeout(() => {
    if (checkStatus.textContent === text) checkStatus.textContent = "";
  }, ms);
}

function moveThumb() {
  const thumb = document.querySelector(".seg-thumb");
  const active = document.querySelector(".tab.active");
  if (!thumb || !active) return;
  thumb.style.width = active.offsetWidth + "px";
  thumb.style.transform = `translateX(${active.offsetLeft - 2}px)`;
  if (!thumb.parentElement.classList.contains("ready")) requestAnimationFrame(() => thumb.parentElement.classList.add("ready"));
}

function selectTab(platform) {
  currentPlatform = platform;
  try {
    localStorage.setItem("canais.tab", platform);
  } catch (_) {}
  tabs.forEach((t) => {
    const on = t.getAttribute("data-platform") === platform;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  handleInput.placeholder =
    platform === "twitch"
      ? "Adicionar canal da Twitch (nome ou link)"
      : platform === "kick"
      ? "Adicionar canal da Kick (nome ou link)"
      : "Adicionar @canal ou link";
  form.style.display = platform === "live" ? "none" : "";
  requestAnimationFrame(moveThumb);
  filterText = "";
  filterInput.value = "";
  render();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectTab(tab.getAttribute("data-platform")));
});

filterInput.addEventListener("input", () => {
  filterText = filterInput.value.trim();
  render();
});

handleInput.addEventListener("focus", () => form.classList.add("open"));
handleInput.addEventListener("blur", () => {
  setTimeout(() => {
    if (!handleInput.value.trim() && !form.contains(document.activeElement)) form.classList.remove("open");
  }, 150);
});

openAllBtn.addEventListener("click", async () => {
  openAllBtn.disabled = true;
  const res = await sendToBackground({ type: "OPEN_ALL_LIVE" }, 20000);
  openAllBtn.disabled = false;
  if (res.error) flash("erro: " + res.error);
  else if (res.opened === 0 && res.skipped) flash("todas já estão abertas");
  else if (res.opened) flash(`${res.opened} aba(s) aberta(s)` + (res.skipped ? `, ${res.skipped} já estava(m)` : ""));
});

function normalizeHandle(raw, platform) {
  let h = raw.trim();
  if (!h) return null;
  const urlMatch = h.match(/^(?:https?:\/\/)?(?:www\.|m\.)?(youtube\.com|twitch\.tv|kick\.com)\/([^/?#]+)/i);
  if (urlMatch) h = decodeURIComponent(urlMatch[2]);
  if (platform === "youtube" && !h.startsWith("@")) h = "@" + h;
  if ((platform === "twitch" || platform === "kick") && h.startsWith("@")) h = h.substring(1);
  return h;
}

function timeAgo(ts) {
  if (!ts) return "nunca verificado";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "verificado agora";
  if (diff < 3600) return `verificado há ${Math.floor(diff / 60)} min`;
  return `verificado há ${Math.floor(diff / 3600)} h`;
}

function timeAlive(ts) {
  if (!ts) return "";
  const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (diffMin < 60) return `Em live há ${diffMin} min`;
  return `Em live há ${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
}

function fmtMinutes(min) {
  const m = Math.round(min || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
}

function fmtViewers(n) {
  if (!Number.isFinite(n)) return "";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + " mil assistindo";
  return n + " assistindo";
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function dayKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtClock(ts) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDate(ts) {
  const d = new Date(ts);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

function isQuietNow(settings, now = new Date()) {
  if (settings.dndUntil && settings.dndUntil > now.getTime()) return true;
  const q = settings.quietHours;
  if (!q || !q.enabled) return false;
  const toMin = (s) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(s || "");
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const start = toMin(q.start);
  const end = toMin(q.end);
  if (start === null || end === null || start === end) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  return start < end ? cur >= start && cur < end : cur >= start || cur < end;
}

async function renderDnd() {
  const settings = await getSettings();
  const now = Date.now();
  if (settings.dndUntil && settings.dndUntil > now) {
    const d = new Date(settings.dndUntil);
    const sameDay = d.toDateString() === new Date().toDateString();
    dndText.textContent = `Não perturbe até ${sameDay ? "" : fmtDate(settings.dndUntil) + " "}${fmtClock(settings.dndUntil)}`;
    dndOff.style.display = "";
    dndBanner.style.display = "flex";
  } else if (isQuietNow(settings)) {
    dndText.textContent = `Horário de silêncio (${settings.quietHours.start}–${settings.quietHours.end})`;
    dndOff.style.display = "none";
    dndBanner.style.display = "flex";
  } else {
    dndBanner.style.display = "none";
  }
  settingsBtn.classList.toggle("active", dndBanner.style.display === "flex");
}

dndOff.addEventListener("click", async () => {
  await patchSettings({ dndUntil: null });
  renderDnd();
});

function closeAnyMenu() {
  const existing = document.getElementById("options-overlay");
  if (existing) existing.remove();
  document.body.classList.remove("sheet-open");
}

function overlayOpen() {
  return !!document.getElementById("options-overlay");
}

function closeOptionsPanel() {
  closeAnyMenu();
  render();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlayOpen()) {
    e.preventDefault();
    if (sheetBack) sheetBack();
    else closeOptionsPanel();
  }
});

let sheetBack = null;

function makePanel(titleText, { keepScroll = false, onBack = null } = {}) {
  const prev = document.querySelector("#options-overlay .options-panel");
  const prevScroll = keepScroll && prev ? prev.scrollTop : 0;
  closeAnyMenu();
  document.body.classList.add("sheet-open");
  const sheet = el("div", { class: "sheet", id: "options-overlay" });
  if (keepScroll) sheet.style.animation = "none";
  const back = el("button", { type: "button", class: "back-btn", title: "Voltar (Esc)", html: svgIcon("back", 18) });
  sheetBack = onBack;
  back.onclick = () => (onBack ? onBack() : closeOptionsPanel());
  const actions = el("div", { class: "sheet-actions" });
  const panel = el("div", { class: "options-panel" });
  sheet.append(el("div", { class: "sheet-header" }, [back, el("span", { class: "title", text: titleText }), actions]), panel);
  document.body.appendChild(sheet);
  panel.actions = actions;
  if (prevScroll) requestAnimationFrame(() => (panel.scrollTop = prevScroll));
  return panel;
}

function card(...children) {
  return el("div", { class: "card" }, children.flat().filter(Boolean));
}

function secTitle(text) {
  return el("div", { class: "sec-title", text });
}

function switchEl(checked, onChange) {
  const input = el("input", { type: "checkbox" });
  input.checked = !!checked;
  input.onchange = () => onChange(input.checked);
  return el("span", { class: "switch" }, [input, el("span", { class: "track" })]);
}

function switchRow(label, checked, onChange) {
  const sw = switchEl(checked, onChange);
  const row = el("label", { class: "row" }, [el("span", { text: label }), sw]);
  row.style.cursor = "pointer";
  return el("div", { class: "panel-section" }, [row]);
}

async function updateChannel(ch, fields) {
  const channels = await getChannels();
  const target = channels.find((c) => channelKey(c) === channelKey(ch));
  if (!target) return;
  Object.assign(target, fields);
  Object.assign(ch, fields);
  await chrome.storage.local.set({ channels });
}

function openOptionsPanel(ch) {
  const panel = makePanel(ch.handle);

  function item({ getIcon, getLabel, getChecked, onToggle }) {
    const btn = el("button", { type: "button", class: "item" });
    const iconSpan = el("span");
    const textSpan = el("span");
    btn.append(el("span", { class: "menu-item-label" }, [iconSpan, textSpan]));
    let sw = null;
    if (getChecked) {
      sw = el("span", { class: "switch" });
      sw.style.pointerEvents = "none";
      btn.append(sw);
    }
    function refresh() {
      iconSpan.innerHTML = svgIcon(getIcon(), 14);
      textSpan.textContent = getLabel();
      if (sw) sw.innerHTML = `<input type="checkbox" tabindex="-1" ${getChecked() ? "checked" : ""}><span class="track"></span>`;
    }
    refresh();
    btn.onclick = async (ev) => {
      ev.stopPropagation();
      const fields = onToggle();
      if (fields) await updateChannel(ch, fields);
      refresh();
    };
    return btn;
  }

  const isYt = (ch.platform || "youtube") === "youtube";

  let checkItem = null;
  checkItem = item({
    getIcon: () => "refresh",
    getLabel: () => (checkItem?.dataset.busy ? "Verificando…" : "Verificar agora"),
    onToggle: () => {
      if (checkItem.dataset.busy) return null;
      checkItem.dataset.busy = "1";
      checkItem.querySelector(".menu-item-label span:last-child").textContent = "Verificando…";
      sendToBackground({ type: "CHECK_ONE", handle: ch.handle, platform: ch.platform }, 60000).then(async (res) => {
        if (!checkItem.isConnected) return;
        delete checkItem.dataset.busy;
        const fresh = (await getChannels()).find((c) => channelKey(c) === channelKey(ch));
        checkItem.querySelector(".menu-item-label span:last-child").textContent = res.error
          ? "Erro: " + res.error
          : fresh?.lastError
          ? "Erro: " + fresh.lastError
          : fresh?.isLive
          ? "Verificado: ao vivo agora"
          : "Verificado: offline";
      });
      return null;
    },
  });

  panel.append(
    card(
      item({
        getIcon: () => "star",
        getLabel: () => (ch.favorite ? "Favorito (fica no topo)" : "Favoritar (fica no topo)"),
        getChecked: () => !!ch.favorite,
        onToggle: () => ({ favorite: !ch.favorite }),
      }),
      checkItem
    ),
    secTitle("Live"),
    card(
      item({
        getIcon: () => (ch.paused ? "play" : "pause"),
        getLabel: () => (ch.paused ? "Retomar monitoramento" : "Pausar monitoramento"),
        onToggle: () => ({ paused: !ch.paused }),
      }),
      item({
        getIcon: () => (ch.autoOpen ? "linkOn" : "linkOff"),
        getLabel: () => "Abrir live automaticamente",
        getChecked: () => ch.autoOpen,
        onToggle: () => ({ autoOpen: !ch.autoOpen }),
      }),
      item({
        getIcon: () => (ch.sound !== false ? "volume" : "volumeOff"),
        getLabel: () => "Som na notificação",
        getChecked: () => ch.sound !== false,
        onToggle: () => ({ sound: ch.sound === false }),
      }),
      item({
        getIcon: () => "clock",
        getLabel: () => "Avisar 15 min antes do horário habitual",
        getChecked: () => !!ch.preAlert,
        onToggle: () => ({ preAlert: !ch.preAlert }),
      }),
      item({
        getIcon: () => "refresh",
        getLabel: () => "Avisar se mudar título ou jogo",
        getChecked: () => !!ch.notifyChanges,
        onToggle: () => ({ notifyChanges: !ch.notifyChanges }),
      })
    )
  );

  if (isYt) {
    panel.append(
      secTitle("Vídeos"),
      card(
        item({
          getIcon: () => "videoAuto",
          getLabel: () => "Notificar novos vídeos",
          getChecked: () => ch.notifyVideos,
          onToggle: () => ({ notifyVideos: !ch.notifyVideos }),
        }),
        item({
          getIcon: () => "videoAuto",
          getLabel: () => "Abrir vídeo novo automaticamente",
          getChecked: () => ch.autoOpenVideos,
          onToggle: () => ({ autoOpenVideos: !ch.autoOpenVideos }),
        }),
        ch.videoError && (ch.notifyVideos || ch.autoOpenVideos)
          ? el("div", { class: "panel-section note", text: "Último erro nos vídeos: " + ch.videoError, style: "color:var(--danger);margin:0" })
          : null
      )
    );
  }

  const kw = el("input", {
    type: "text",
    class: "field wide",
    placeholder: "ex: torneio, campeonato, minecraft",
    maxlength: "200",
  });
  kw.value = ch.keywords || "";
  const saved = el("span", { class: "hint" });
  kw.oninput = () => (saved.textContent = "");
  kw.onchange = async () => {
    await updateChannel(ch, { keywords: kw.value.trim() });
    saved.textContent = "salvo";
  };
  panel.append(
    secTitle("Só avisar se o título tiver"),
    card(
      el("div", { class: "panel-section" }, [
        kw,
        el("div", { class: "note" }, [
          el("span", { text: "Separe por vírgula. Vazio = avisa sempre. " }),
          saved,
        ]),
      ])
    )
  );

  const habitSection = el("div", { class: "panel-section" });
  panel.append(secTitle("Sequência e horário"), card(habitSection));
  chrome.storage.local.get(["liveHistory", "openSessions"]).then((stored) => {
    const sess = sessionsByChannel(stored.liveHistory, stored.openSessions)[channelKey(ch)] || [];
    const habit = computeHabit(sess);
    const st = computeStreak(sess);
    habitSection.append(
      el("div", { class: "row", style: "margin-bottom:10px" }, [
        el("span", { class: "streak", html: svgIcon("flame", 14) + `<span>${st.count} ${st.count === 1 ? "live seguida" : "lives seguidas"}</span>` }),
        el("span", { class: "hint", text: st.freezesUsed ? "1 falta perdoada" : "assistidas por 10+ min" }),
      ])
    );
    if (!habit.enough) {
      habitSection.append(
        el("div", {
          class: "note",
          text: `Ainda aprendendo: precisa de pelo menos 3 lives registradas (tem ${habit.count}). O histórico começa a contar a partir desta versão.`,
          style: "margin:0",
        })
      );
      return;
    }
    const max = Math.max(...habit.perDay, 1);
    const box = el("div", { class: "habit-box" });
    for (const i of [1, 2, 3, 4, 5, 6, 0]) {
      const bar = el("b");
      bar.style.height = Math.round((habit.perDay[i] / max) * 100) + "%";
      box.append(el("div", { class: "habit-day" }, [el("i", {}, [bar]), el("span", { text: WEEKDAY_SHORT[i] })]));
    }
    habitSection.append(
      el("div", { class: "row" }, [el("b", { text: `Costuma entrar ${habit.daysLabel}` }), el("span", { class: "hint", text: `~${habit.time}` })]),
      box,
      el("div", { class: "note", text: `Baseado em ${habit.count} lives dos últimos ${HABIT_WINDOW_DAYS} dias.` })
    );
  });

  let removeItem = null;
  removeItem = item({
    getIcon: () => "trash",
    getLabel: () => (removeItem?.dataset.armed ? "Clique de novo para remover" : "Remover canal"),
    onToggle: () => {
      if (!removeItem.dataset.armed) {
        removeItem.dataset.armed = "1";
        setTimeout(() => {
          if (!removeItem.isConnected) return;
          delete removeItem.dataset.armed;
          removeItem.querySelector(".menu-item-label span:last-child").textContent = "Remover canal";
        }, 4000);
        return null;
      }
      getChannels().then(async (all) => {
        await chrome.storage.local.set({ channels: all.filter((c) => channelKey(c) !== channelKey(ch)) });
        flash(`${ch.handle} removido`);
        closeOptionsPanel();
      });
      return null;
    },
  });
  removeItem.classList.add("danger");

  panel.append(
    card(
      item({
        getIcon: () => "trophy",
        getLabel: () => "Conquistas deste canal",
        onToggle: () => {
          openChannelAchievements(channelKey(ch), "options");
          return null;
        },
      }),
      item({
        getIcon: () => "grid",
        getLabel: () => "Ver histórico deste canal",
        onToggle: () => {
          openHistoryPanel(channelKey(ch));
          return null;
        },
      }),
      removeItem
    )
  );
}

function nextMorning() {
  const d = new Date();
  d.setDate(d.getDate() + (d.getHours() >= 8 ? 1 : 0));
  d.setHours(8, 0, 0, 0);
  return d.getTime();
}

function timeSelect(value) {
  const sel = el("select", { class: "field" });
  const opts = [];
  for (let h = 0; h < 24; h++) for (const m of [0, 30]) opts.push(`${pad(h)}:${pad(m)}`);
  const norm = /^(\d{1,2}):(\d{2})$/.test(value || "") ? value.replace(/^(\d):/, "0$1:") : "";
  if (norm && !opts.includes(norm)) opts.push(norm);
  opts.sort();
  for (const o of opts) sel.append(el("option", { value: o, text: o }));
  sel.value = norm || opts[0];
  return sel;
}

async function openSettingsPanel(keepScroll = false) {
  const settings = await getSettings();
  const panel = makePanel("Configurações", { keepScroll: keepScroll === true });
  const pdata = await chrome.storage.local.get(["settings", "watchLog", "achievements", "achState"]);
  panel.append(secTitle("Personalizar"), card(personalizeBlock(pdata)));

  const dndSeg = el("div", { class: "seg" });
  const dndStatus = el("div", { class: "note" });
  const DND = [
    ["off", "Desligado", () => null],
    ["1h", "1 hora", () => Date.now() + 3600000],
    ["4h", "4 horas", () => Date.now() + 4 * 3600000],
    ["morning", "Até 8h", nextMorning],
  ];
  async function refreshDnd() {
    const s = await getSettings();
    const on = s.dndUntil && s.dndUntil > Date.now();
    const current = on ? s.dndPreset || "1h" : "off";
    dndSeg.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.v === current));
    dndStatus.textContent = on
      ? `Silenciado até ${fmtDate(s.dndUntil)} às ${fmtClock(s.dndUntil)}. Continua verificando e contando o histórico.`
      : "Avisos normais.";
    renderDnd();
  }
  for (const [v, label, fn] of DND) {
    const b = el("button", { type: "button", text: label });
    b.dataset.v = v;
    b.onclick = async () => {
      await patchSettings({ dndUntil: fn(), dndPreset: v });
      refreshDnd();
    };
    dndSeg.append(b);
  }
  refreshDnd();

  const q = settings.quietHours || { enabled: false, start: "23:00", end: "07:00" };
  const qStart = timeSelect(q.start || "23:00");
  const qEnd = timeSelect(q.end || "07:00");
  const qTimes = el("div", { class: "row" }, [el("span", { text: "Das" }), qStart, el("span", { text: "às" }), qEnd]);
  qTimes.style.opacity = q.enabled ? "1" : "0.5";
  qTimes.style.justifyContent = "flex-start";
  qTimes.style.gap = "10px";
  async function saveQuiet(enabled) {
    const cur = (await getSettings()).quietHours || {};
    const en = enabled === undefined ? !!cur.enabled : enabled;
    qTimes.style.opacity = en ? "1" : "0.5";
    await patchSettings({ quietHours: { enabled: en, start: qStart.value, end: qEnd.value } });
    renderDnd();
  }
  qStart.onchange = () => saveQuiet();
  qEnd.onchange = () => saveQuiet();

  const interval = el("select", { class: "field" });
  for (const v of [1, 2, 3, 5, 10, 15, 30, 60]) interval.append(el("option", { value: String(v), text: `${v} min` }));
  const curInt = settings.interval || 5;
  if (![1, 2, 3, 5, 10, 15, 30, 60].includes(curInt)) interval.append(el("option", { value: String(curInt), text: `${curInt} min` }));
  interval.value = String(curInt);
  interval.onchange = async () => {
    await patchSettings({ interval: parseInt(interval.value) || 5 });
    sendToBackground({ type: "UPDATE_ALARM" });
  };

  panel.append(
    secTitle("Não perturbe"),
    card(el("div", { class: "panel-section" }, [dndSeg, dndStatus])),
    secTitle("Horário de silêncio (todo dia)"),
    card(
      switchRow("Ativar", q.enabled, (v) => saveQuiet(v)),
      el("div", { class: "panel-section" }, [qTimes])
    ),
    secTitle("Geral"),
    card(
      el("div", { class: "panel-section" }, [el("div", { class: "row" }, [el("span", { text: "Verificar a cada" }), interval])]),
      switchRow("Canais ao vivo primeiro", settings.sortLiveFirst !== false, (v) => patchSettings({ sortLiveFirst: v })),
      switchRow("Mostrar cartão “Hoje” na tela inicial", !settings.hideToday, async (v) => {
        await patchSettings({ hideToday: !v });
        const t = document.getElementById("today");
        if (t) t.dataset.sig = "";
        renderToday();
      })
    )
  );

  panel.append(
    secTitle("Lembretes"),
    card(
      switchRow("Segurar avisos quando eu estiver longe do PC", settings.holdWhenAway !== false, (v) => patchSettings({ holdWhenAway: v })),
      el("div", {
        class: "panel-section note",
        style: "margin:0;padding-top:0",
        text: "Se o PC ficar parado por 10 min (ou bloqueado), os avisos esperam e chegam juntos num resumo quando você voltar.",
      }),
      switchRow("Resumo da semana (domingo)", settings.weeklySummary !== false, (v) => patchSettings({ weeklySummary: v })),
      switchRow("Mostrar sequência de lives", settings.showStreaks !== false, (v) => patchSettings({ showStreaks: v })),
      switchRow("Avisar quando ganhar conquista", settings.achievementAlerts !== false, (v) => patchSettings({ achievementAlerts: v })),
      (() => {
        const b = el("button", { type: "button", class: "chip", text: "Testar animação da conquista" });
        const note = el("div", { class: "note", style: "margin:6px 0 0" });
        b.onclick = async () => {
          const res = await sendToBackground({ type: "TEST_TOAST" }, 5000);
          if (res && res.shown) note.textContent = "Apareceu na aba da live que está aberta.";
          else {
            note.textContent = "Abra uma página do YouTube, Twitch ou Kick pra ver na tela da live. Mostrando aqui:";
            showPopupToasts([{ icon: "total-1", title: "10 horas", desc: "Tempo total de live assistida" }]);
          }
        };
        return el("div", { class: "panel-section" }, [b, note]);
      })()
    ),
    secTitle("Lives perdidas"),
    card(
      (() => {
        const sel = el("select", { class: "field" });
        for (const [v, l] of [["favoritos", "Só favoritos"], ["todos", "Todos os canais"], ["off", "Não avisar"]]) sel.append(el("option", { value: v, text: l }));
        sel.value = settings.missedAlerts || "favoritos";
        sel.onchange = () => patchSettings({ missedAlerts: sel.value });
        return el("div", { class: "panel-section" }, [
          el("div", { class: "row" }, [el("span", { text: "Avisar quando eu perder uma live" }), sel]),
          el("div", { class: "note", text: "O aviso leva pra gravação. As perdidas também aparecem em “Seu dia”." }),
        ]);
      })()
    ),
    secTitle("Menções no chat"),
    card(
      (() => {
        const nick = el("input", { type: "text", class: "field wide", placeholder: "ex: lucaslourenzii", maxlength: "80" });
        nick.value = settings.mentionNicks || "";
        nick.onchange = () => patchSettings({ mentionNicks: nick.value.trim() });
        return el("div", { class: "panel-section" }, [
          el("div", { class: "row", style: "margin-bottom:8px" }, [el("span", { text: "Seu nick (se tiver mais de um, separe por vírgula)" })]),
          nick,
          el("div", { class: "note", text: "Avisa quando alguém escrever @seunick no chat. Só funciona com o chat da live aberto em alguma aba (pode estar em segundo plano). Não avisa se você já está olhando a aba." }),
        ]);
      })(),
      switchRow("Avisar quando me marcarem", settings.mentionAlerts !== false, (v) => patchSettings({ mentionAlerts: v }))
    ),
    secTitle("Chat (experimental)"),
    card(
      switchRow("Contar minhas mensagens no chat", settings.countChat !== false, (v) => patchSettings({ countChat: v })),
      el("div", {
        class: "panel-section note",
        style: "margin:0;padding-top:0",
        text: "Só conta quantas mensagens você envia, pras conquistas de chat. Não lê nem guarda o que você escreve.",
      })
    )
  );

  const exportBtn = el("button", { type: "button", class: "chip", text: "Exportar" });
  exportBtn.onclick = exportBackup;
  const importBtn = el("button", { type: "button", class: "chip", text: "Importar" });
  const fileInput = el("input", { type: "file", accept: ".json,application/json" });
  fileInput.style.display = "none";
  fileInput.onchange = () => fileInput.files[0] && importBackup(fileInput.files[0]);
  importBtn.onclick = () => {
    if (IS_FULL) fileInput.click();
    else chrome.tabs.create({ url: chrome.runtime.getURL("popup.html?full=1#settings") });
  };
  panel.append(
    secTitle("Backup"),
    card(
      el("div", { class: "panel-section" }, [
        el("div", { class: "chip-row" }, [exportBtn, importBtn, fileInput]),
        el("div", {
          class: "note",
          text: IS_FULL
            ? "Leva canais, configurações e histórico. Importar junta com o que já existe, sem apagar nada."
            : "Leva canais, configurações e histórico. Importar abre numa aba (o Chrome fecha o popup ao escolher arquivo).",
        }),
      ])
    )
  );
}

async function exportBackup() {
  const data = await chrome.storage.local.get(["channels", "settings", "watchLog", "liveHistory", "achievements", "achState"]);
  const KEEP = ["platform", "handle", "favorite", "preAlert", "notify", "autoOpen", "paused", "notifyVideos", "autoOpenVideos", "sound", "notifyChanges", "keywords"];
  const channels = (data.channels || []).map((c) => Object.fromEntries(KEEP.filter((k) => k in c).map((k) => [k, c[k]])));
  const { dndUntil, ...settings } = data.settings || {};
  const payload = {
    app: "Canais",
    format: 1,
    version: chrome.runtime.getManifest().version,
    exportedAt: new Date().toISOString(),
    channels,
    settings,
    watchLog: data.watchLog || {},
    liveHistory: data.liveHistory || [],
    achievements: data.achievements || {},
    achState: data.achState || {},
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: `canais-backup-${dayKey(new Date())}.json` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  flash("backup exportado");
}

async function importBackup(file) {
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("arquivo grande demais");
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.channels)) throw new Error("não parece um backup do Canais");

    const channels = await getChannels();
    const existing = new Set(channels.map(channelKey));
    let added = 0;
    for (const c of data.channels) {
      if (!c || typeof c.handle !== "string" || !PLATFORMS.includes(c.platform || "youtube")) continue;
      const handle = c.handle.trim().slice(0, 100);
      if (!handle) continue;
      const platform = c.platform || "youtube";
      if (existing.has(platform + ":" + handle)) continue;
      existing.add(platform + ":" + handle);
      channels.push({
        platform,
        handle,
        notify: c.notify !== false,
        autoOpen: !!c.autoOpen,
        paused: !!c.paused,
        notifyVideos: !!c.notifyVideos,
        autoOpenVideos: !!c.autoOpenVideos,
        sound: c.sound !== false,
        notifyChanges: !!c.notifyChanges,
        keywords: typeof c.keywords === "string" ? c.keywords.slice(0, 200) : "",
        favorite: !!c.favorite,
        preAlert: !!c.preAlert,
        isLive: false,
        lastChecked: null,
      });
      added++;
    }
    await chrome.storage.local.set({ channels });

    if (data.settings && typeof data.settings === "object") {
      const s = data.settings;
      const fields = {};
      if (Number.isFinite(s.interval)) fields.interval = Math.min(60, Math.max(1, s.interval));
      if (["auto", "light", "dark"].includes(s.theme)) fields.theme = s.theme;
      if (typeof s.sortLiveFirst === "boolean") fields.sortLiveFirst = s.sortLiveFirst;
      if (s.quietHours && typeof s.quietHours === "object")
        fields.quietHours = {
          enabled: !!s.quietHours.enabled,
          start: /^\d{1,2}:\d{2}$/.test(s.quietHours.start) ? s.quietHours.start : "23:00",
          end: /^\d{1,2}:\d{2}$/.test(s.quietHours.end) ? s.quietHours.end : "07:00",
        };
      const next = await patchSettings(fields);
      applyTheme(next.theme || "auto");
      sendToBackground({ type: "UPDATE_ALARM" });
    }

    await sendToBackground({
      type: "IMPORT_HISTORY",
      watchLog: data.watchLog,
      liveHistory: data.liveHistory,
      achievements: data.achievements,
      achState: data.achState,
    });
    closeOptionsPanel();
    flash(`importado: ${added} canal(is) novo(s)`, 8000);
    if (added) runCheckAll();
  } catch (e) {
    flash("erro ao importar: " + (e.message || e), 8000);
  }
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function levelOf(min) {
  if (!min || min < 1) return 0;
  if (min < 15) return 1;
  if (min < 60) return 2;
  if (min < 180) return 3;
  return 4;
}

function buildHeatmap(perDay, infoEl) {
  const WEEKS = IS_FULL ? 53 : 26;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7);

  const months = el("div", { class: "heat-months" });
  const grid = el("div", { class: "heat-grid" });
  const days = el("div", { class: "heat-days" });
  WEEKDAYS.forEach((w, i) => days.append(el("span", { text: i % 2 === 1 ? w : "" })));

  let lastMonth = -1;
  const cursor = new Date(start);
  for (let w = 0; w < WEEKS; w++) {
    const m = cursor.getMonth();
    const twoWeeksLater = new Date(cursor);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    const crowded = w === 0 && twoWeeksLater.getMonth() !== m;
    const label = el("span", { text: m !== lastMonth && !crowded && w < WEEKS - 2 ? MONTHS[m] : "" });
    months.append(label);
    lastMonth = m;
    for (let d = 0; d < 7; d++) {
      const key = dayKey(cursor);
      const min = perDay[key] || 0;
      const future = cursor > today;
      const cell = el("div", {
        class: "heat-cell" + (future ? " future" : ` l${levelOf(min)}`) + (cursor.getTime() === today.getTime() ? " today" : ""),
      });
      if (!future) {
        const text = `${pad(cursor.getDate())} de ${MONTHS[cursor.getMonth()]} de ${cursor.getFullYear()}: ${
          min >= 1 ? fmtMinutes(min) + " assistido" : "nada assistido"
        }`;
        cell.title = text;
        cell.onmouseenter = () => (infoEl.textContent = text);
      }
      grid.append(cell);
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  months.style.gridTemplateColumns = `repeat(${WEEKS}, 1fr)`;
  grid.style.gridTemplateColumns = `repeat(${WEEKS}, 1fr)`;
  return el("div", { class: "heat-wrap" }, [el("span"), months, days, grid]);
}

function computeStats(perDay) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yearAgo = new Date(today);
  yearAgo.setDate(yearAgo.getDate() - 364);
  const fromKey = dayKey(yearAgo);
  let total = 0;
  let activeDays = 0;
  let best = { key: null, min: 0 };
  for (const [k, v] of Object.entries(perDay)) {
    if (k < fromKey || v < 1) continue;
    total += v;
    activeDays++;
    if (v > best.min) best = { key: k, min: v };
  }
  let current = 0;
  const c = new Date(today);
  if (!(perDay[dayKey(c)] >= 1)) c.setDate(c.getDate() - 1);
  while (perDay[dayKey(c)] >= 1) {
    current++;
    c.setDate(c.getDate() - 1);
  }
  let longest = 0;
  let run = 0;
  const d = new Date(yearAgo);
  while (d <= today) {
    if (perDay[dayKey(d)] >= 1) longest = Math.max(longest, ++run);
    else run = 0;
    d.setDate(d.getDate() + 1);
  }
  return { total, activeDays, current, longest, best };
}

async function openHistoryPanel(selectedKey = "all", filter = "watched", keepScroll = false) {
  const [channels, store] = await Promise.all([
    getChannels(),
    chrome.storage.local.get(["watchLog", "liveHistory", "openSessions"]),
  ]);
  const watchLog = store.watchLog || {};
  const liveHistory = store.liveHistory || [];
  const openSessions = store.openSessions || {};

  const panel = makePanel("Histórico", { keepScroll });

  const retroBtn = el("button", { type: "button", class: "head-btn", title: "Retrospectiva pra compartilhar", html: svgIcon("share", 14) });
  retroBtn.onclick = () => openRetro(null, () => openHistoryPanel(selectedKey, filter));
  panel.actions.append(retroBtn);
  if (!IS_FULL) {
    const big = el("button", { type: "button", class: "head-btn", title: "Abrir em tela cheia (12 meses)", html: svgIcon("expand", 14) });
    big.onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL("popup.html?full=1#history") });
    panel.actions.append(big);
  }

  const keys = new Map();
  for (const c of channels) keys.set(channelKey(c), `${c.handle} · ${PLATFORM_LABEL[c.platform || "youtube"]}`);
  for (const k of Object.keys(watchLog)) {
    if (!keys.has(k)) {
      const [pf, ...rest] = k.split(":");
      keys.set(k, `${rest.join(":")} · ${PLATFORM_LABEL[pf] || pf} (removido)`);
    }
  }
  if (selectedKey !== "all" && !keys.has(selectedKey)) selectedKey = "all";

  const select = el("select", { class: "field wide", "aria-label": "Canal" });
  select.append(el("option", { value: "all", text: "Todos os canais" }));
  for (const [k, label] of keys) select.append(el("option", { value: k, text: label }));
  select.value = selectedKey;
  select.onchange = () => openHistoryPanel(select.value, filter, true);
  const top = el("div", { class: "panel-section" }, [select]);
  top.style.padding = "8px 12px 0";
  panel.append(top);

  const perDay = {};
  const totalsByKey = {};
  for (const [k, daysMap] of Object.entries(watchLog)) {
    if (selectedKey !== "all" && k !== selectedKey) continue;
    for (const [d, v] of Object.entries(daysMap)) {
      perDay[d] = (perDay[d] || 0) + v;
      totalsByKey[k] = (totalsByKey[k] || 0) + v;
    }
  }

  const now = new Date();
  const todayMin = perDay[dayKey(now)] || 0;
  let weekMin = 0;
  const wd = new Date(now);
  for (let i = 0; i < 7; i++) {
    weekMin += perDay[dayKey(wd)] || 0;
    wd.setDate(wd.getDate() - 1);
  }
  const st = computeStats(perDay);
  const stat = (big, small) => el("div", { class: "stat" }, [el("b", { text: big }), el("span", { text: small })]);
  const stats = el("div", { class: "stats" }, [
    stat(fmtMinutes(todayMin), "hoje"),
    stat(fmtMinutes(weekMin), "últimos 7 dias"),
    stat(`${st.current} ${st.current === 1 ? "dia" : "dias"}`, `seguidos (recorde ${st.longest})`),
    stat(fmtMinutes(st.total), `em 12 meses · ${st.activeDays} ${st.activeDays === 1 ? "dia" : "dias"}`),
  ]);
  const statsWrap = el("div", { class: "panel-section" }, [stats]);
  statsWrap.style.padding = "10px 12px 0";
  panel.append(statsWrap);

  const info = el("span", { text: st.total >= 1 ? "Passe o mouse num dia" : "Nenhum minuto assistido ainda" });
  const legend = el("div", { class: "legend" }, [
    el("span", { text: "Menos" }),
    ...[0, 1, 2, 3, 4].map((l) => el("div", { class: `heat-cell l${l}` })),
    el("span", { text: "Mais" }),
  ]);
  panel.append(
    secTitle(IS_FULL ? "Últimos 12 meses" : "Últimos 6 meses"),
    card(el("div", { class: "panel-section" }, [buildHeatmap(perDay, info), el("div", { class: "heat-foot" }, [info, legend])]))
  );

  if (selectedKey === "all") {
    const ranked = Object.entries(totalsByKey)
      .filter(([, v]) => v >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    if (ranked.length) {
      const rank = el("div", { class: "rank" });
      const max = ranked[0][1];
      for (const [k, v] of ranked) {
        rank.append(el("span", { class: "name", text: keys.get(k) || k }), el("span", { class: "val", text: fmtMinutes(v) }));
        const bar = el("div", { class: "bar" });
        bar.style.width = Math.max(4, (v / max) * 100) + "%";
        rank.append(bar);
      }
      panel.append(secTitle("Mais assistidos"), card(el("div", { class: "panel-section" }, [rank])));
    }
  }

  {
    const bySess = sessionsByChannel(liveHistory, openSessions);
    const streaks = Object.entries(bySess)
      .filter(([k]) => selectedKey === "all" || k === selectedKey)
      .map(([k, list]) => [k, computeStreak(list)])
      .filter(([, st]) => st.count >= 1 || selectedKey !== "all")
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    if (streaks.length) {
      const box = el("div", { class: "streak-list" });
      for (const [k, st] of streaks) {
        box.append(
          el("div", { class: "streak-row" }, [
            el("span", { class: "name", text: keys.get(k) || k.split(":").slice(1).join(":") }),
            el("span", { class: "val", html: svgIcon("flame", 13) + `<span>${st.count} ${st.count === 1 ? "live" : "lives"}</span>` }),
          ])
        );
      }
      box.append(
        el("div", {
          class: "note",
          style: "margin:0",
          text: "Conta lives seguidas do canal que você assistiu por 10 min ou mais. Dia sem live não quebra, e 1 live perdida por semana é perdoada.",
        })
      );
      panel.append(secTitle("Sequências"), card(el("div", { class: "panel-section" }, [box])));
    }
  }

  const seg = el("div", { class: "seg" });
  for (const [val, label] of [
    ["watched", "Que assisti"],
    ["all", "Todas as lives"],
  ]) {
    const b = el("button", { type: "button", class: filter === val ? "active" : "", text: label });
    b.onclick = () => openHistoryPanel(selectedKey, val, true);
    seg.append(b);
  }

  const items = [];
  for (const [k, s] of Object.entries(openSessions)) {
    if (selectedKey !== "all" && k !== selectedKey) continue;
    items.push({ ...s, now: true });
  }
  for (const s of liveHistory) {
    if (selectedKey !== "all" && channelKey(s) !== selectedKey) continue;
    items.push(s);
  }
  const shown = items.filter((s) => filter === "all" || (s.watched || 0) >= 1).slice(0, 40);
  const livesBox = el("div", { class: "lives" });
  for (const s of shown) {
    const dur = Math.max(0, ((s.now ? Date.now() : s.end) - s.start) / 60000);
    const pf = s.platform || "youtube";
    const sub = [
      `${fmtDate(s.start)} ${fmtClock(s.start)}`,
      s.now ? `ao vivo há ${fmtMinutes(dur)}` : `durou ${fmtMinutes(dur)}`,
      (s.watched || 0) >= 1 ? `você viu ${fmtMinutes(s.watched)}` : "não viu",
    ].join(" · ");
    livesBox.append(
      el("div", { class: "live-item" + (s.now ? " now" : "") }, [
        el("div", { class: "top" }, [el("span", { text: s.handle }), el("span", { class: "pf " + pf, text: s.now ? "● ao vivo" : PLATFORM_LABEL[pf] })]),
        s.title ? el("div", { class: "ttl", text: s.title + (s.category ? ` · ${s.category}` : ""), title: s.title }) : null,
        el("div", { class: "sub", text: sub }),
      ])
    );
  }
  panel.append(
    secTitle("Lives"),
    card(
      el("div", { class: "panel-section" }, [
        seg,
        el("div", { style: "height:10px" }),
        shown.length
          ? livesBox
          : el("div", {
              class: "empty-note",
              text:
                filter === "watched"
                  ? "Nenhuma live assistida ainda. Abra uma live de um canal da lista e deixe a aba visível: o tempo conta sozinho."
                  : "Nenhuma live registrada ainda.",
            }),
      ])
    )
  );

  const clearLabel = selectedKey === "all" ? "Apagar todo o histórico" : "Apagar histórico deste canal";
  const clearBtn = el("button", { type: "button", class: "chip danger", text: clearLabel });
  let armed = null;
  clearBtn.onclick = async () => {
    if (!clearBtn.classList.contains("confirm")) {
      clearBtn.classList.add("confirm");
      clearBtn.textContent = "Clique de novo para confirmar";
      armed = setTimeout(() => {
        clearBtn.classList.remove("confirm");
        clearBtn.textContent = clearLabel;
      }, 4000);
      return;
    }
    clearTimeout(armed);
    await sendToBackground({ type: "CLEAR_HISTORY", key: selectedKey === "all" ? null : selectedKey });
    openHistoryPanel(selectedKey, filter, true);
  };
  const foot = el("div", { class: "panel-section" }, [
    el("div", {
      class: "note",
      text: "Conta o tempo em que a aba da live está aberta e visível, ou tocando som em segundo plano. Fica salvo só no seu navegador.",
    }),
    el("div", { style: "height:10px" }),
    clearBtn,
  ]);
  foot.style.padding = "14px 16px 4px";
  panel.append(foot);
}

const WEEKDAY_SHORT = INSIGHT_WEEKDAYS;

function sessionsByChannel(liveHistory, openSessions) {
  const map = {};
  for (const s of liveHistory || []) (map[channelKey(s)] = map[channelKey(s)] || []).push(s);
  for (const [k, s] of Object.entries(openSessions || {})) (map[k] = map[k] || []).push({ ...s, now: true });
  return map;
}

const EMPTY_TEXT = {
  live: ["Ninguém ao vivo agora", "Quando um canal da sua lista entrar ao vivo, ele aparece aqui."],
  youtube: ["Nenhum canal do YouTube ainda", "Digite o @ do canal acima, ou clique com o botão direito numa página do YouTube."],
  twitch: ["Nenhum canal da Twitch ainda", "Digite o nome do canal acima, ou clique com o botão direito numa página da Twitch."],
  kick: ["Nenhum canal da Kick ainda", "Digite o nome do canal acima, ou clique com o botão direito numa página da Kick."],
};

function sortChannels(channels, settings) {
  const liveFirst = settings.sortLiveFirst !== false;
  return channels
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const la = liveFirst && a.c.isLive && !a.c.paused ? 2 : 0;
      const lb = liveFirst && b.c.isLive && !b.c.paused ? 2 : 0;
      const fa = a.c.favorite ? 1 : 0;
      const fb = b.c.favorite ? 1 : 0;
      return lb + fb - (la + fa) || a.i - b.i;
    })
    .map((x) => x.c);
}

let firstRender = true;
let lastRenderSig = "";

async function render() {
  renderToday().catch(() => {});
  const [allChannels, settings, store] = await Promise.all([
    getChannels(),
    getSettings(),
    chrome.storage.local.get(["liveHistory", "openSessions"]),
  ]);
  const sig = JSON.stringify([
    allChannels,
    settings.sortLiveFirst,
    settings.showStreaks,
    currentPlatform,
    filterText,
    checkingAll,
    Math.floor(Date.now() / 60000),
    (store.liveHistory || []).length,
  ]);
  if (sig === lastRenderSig) return;
  lastRenderSig = sig;
  const sessions = sessionsByChannel(store.liveHistory, store.openSessions);
  const liveAll = allChannels.filter((c) => c.isLive && !c.paused);

  const liveCount = liveAll.length;
  liveSummary.textContent =
    liveCount === 0 ? `${allChannels.length} ${allChannels.length === 1 ? "canal" : "canais"} · ninguém ao vivo` : `${liveCount} ao vivo agora`;
  liveSummary.classList.toggle("has-live", liveCount > 0);
  for (const pf of ["live", ...PLATFORMS]) {
    const tab = document.querySelector(`.tab[data-platform="${pf}"]`);
    const countEl = document.getElementById("count-" + pf);
    if (pf === "live") {
      countEl.textContent = liveCount ? String(liveCount) : "";
      countEl.classList.toggle("hot", liveCount > 0);
      tab.classList.toggle("has-live", liveCount > 0);
    } else {
      const n = liveAll.filter((c) => (c.platform || "youtube") === pf).length;
      countEl.textContent = n ? String(n) : "";
      countEl.classList.toggle("hot", n > 0);
    }
  }

  const anyChecking = checkingAll || allChannels.some((c) => c.checkingSince && Date.now() - c.checkingSince < 60000);
  progressBar.classList.toggle("on", anyChecking);

  let channels =
    currentPlatform === "live" ? liveAll : allChannels.filter((c) => (c.platform || "youtube") === currentPlatform);
  const totalInTab = channels.length;
  channels = sortChannels(channels, settings);
  if (filterText) {
    const q = filterText.toLowerCase();
    channels = channels.filter((c) =>
      [c.handle, c.liveTitle, c.liveCategory].filter(Boolean).some((t) => t.toLowerCase().includes(q))
    );
  }

  const showFilter = totalInTab >= 5 || !!filterText;
  const showOpenAll = currentPlatform === "live" && liveCount > 0;
  filterWrap.classList.toggle("show", showFilter);
  openAllBtn.classList.toggle("show", showOpenAll);
  openAllBtn.innerHTML = svgIcon("external", 14) + `<span>Abrir ${liveCount > 1 ? `todas (${liveCount})` : "live"}</span>`;
  toolbar.classList.toggle("show", showFilter || showOpenAll);

  list.innerHTML = "";
  if (channels.length === 0) {
    const [big, small] = filterText ? ["Nada encontrado", `Nenhum canal com "${filterText}".`] : EMPTY_TEXT[currentPlatform];
    empty.innerHTML = "";
    empty.append(
      el("span", { html: svgIcon(currentPlatform === "live" ? "broadcast" : "plus", 28, 1.6) }),
      el("div", { class: "big", text: big }),
      el("div", { class: "small", text: small })
    );
    if (!filterText && currentPlatform !== "live" && totalInTab === 0) {
      const imp = el("button", { type: "button", class: "chip", text: `Importar canais que sigo na ${PLATFORM_LABEL[currentPlatform]}` });
      imp.onclick = () => chrome.tabs.create({ url: FOLLOW_PAGES[currentPlatform] });
      empty.append(el("div", { class: "empty-actions" }, [imp]));
    }
    empty.style.display = "flex";
    list.style.display = "none";
  } else {
    empty.style.display = "none";
    list.style.display = "";
  }
  requestAnimationFrame(moveThumb);

  channels.forEach((ch, index) => {
    const live = ch.isLive && !ch.paused;
    const pf = ch.platform || "youtube";
    const row = el("div", { class: "channel" + (ch.paused ? " paused" : "") + (live ? " live" : "") });
    row.style.setProperty("--i", String(Math.min(index, 12)));

    const isChecking = ch.checkingSince && Date.now() - ch.checkingSince < 60000;
    const avatarWrap = el("div", { class: "avatar-wrap" + (isChecking ? " checking" : "") + (live ? " is-live" : "") });
    const avatar = el("div", { class: "avatar" });
    if (ch.avatarUrl) {
      const img = el("img", { src: ch.avatarUrl, alt: "" });
      img.onerror = () => {
        avatar.innerHTML = "";
        avatar.textContent = initialOf(ch.handle);
      };
      avatar.appendChild(img);
    } else {
      avatar.textContent = initialOf(ch.handle);
    }
    avatarWrap.append(avatar);
    if (live) avatarWrap.append(el("span", { class: "badge-live", title: "Ao vivo" }));

    const statusEl = el("div", { class: "status" + (live ? " live-status" : "") });
    if (ch.paused) {
      statusEl.textContent = "pausado";
    } else if (live) {
      statusEl.textContent = ch.liveSince ? timeAlive(ch.liveSince) : "AO VIVO";
      if (Number.isFinite(ch.liveViewers)) statusEl.textContent += " · " + fmtViewers(ch.liveViewers);
    } else if (isChecking) {
      statusEl.textContent = "verificando…";
    } else if (ch.lastError) {
      statusEl.textContent = "erro: " + ch.lastError;
      statusEl.title = ch.lastError;
      statusEl.classList.add("error-status");
    } else {
      statusEl.textContent = timeAgo(ch.lastChecked);
    }

    const nameRow = el("span", { class: "handle" }, [el("span", { class: "name", text: ch.handle, title: ch.handle })]);
    if (ch.favorite) nameRow.append(el("span", { class: "fav-mark", html: svgIcon("star", 12), title: "Favorito" }));
    if (settings.showStreaks !== false) {
      const st = computeStreak(sessions[channelKey(ch)] || []);
      if (st.count >= 2)
        nameRow.append(
          el("span", {
            class: "streak",
            html: svgIcon("flame", 12) + `<span>${st.count}</span>`,
            title: `Você assistiu as últimas ${st.count} lives desse canal` + (st.freezesUsed ? " (com 1 falta perdoada)" : ""),
          })
        );
    }
    if (currentPlatform === "live") nameRow.append(el("span", { class: "pf-tag " + pf, text: PLATFORM_LABEL[pf] }));
    const info = el("div", { class: "info" }, [nameRow, el("div", { class: "meta" }, [statusEl])]);
    if (live && (ch.liveTitle || ch.liveCategory)) {
      const t = [ch.liveTitle, ch.liveCategory].filter(Boolean).join(" · ");
      info.append(el("span", { class: "live-title", text: t, title: t }));
    } else if (!live && !ch.paused) {
      const habit = computeHabit(sessions[channelKey(ch)] || []);
      if (habit.enough) info.append(el("span", { class: "habit", text: habit.label, title: `Baseado em ${habit.count} lives dos últimos ${HABIT_WINDOW_DAYS} dias` }));
    }
    row.append(avatarWrap, info);

    const watchBtn = el("button", {
      type: "button",
      class: "icon-btn" + (live ? " watch" : " disabled"),
      html: svgIcon("play", 14),
      title: live ? "Assistir agora" : "Canal offline",
    });
    watchBtn.onclick = () => {
      if (ch.isLive && ch.liveUrl) chrome.tabs.create({ url: ch.liveUrl });
    };

    const notifyBtn = el("button", {
      type: "button",
      class: "icon-btn" + (ch.notify ? " on" : ""),
      html: svgIcon(ch.notify ? "bellOn" : "bellOff", 15),
      title: ch.notify ? "Notificação ligada" : "Notificação desligada",
      "aria-pressed": ch.notify ? "true" : "false",
    });
    notifyBtn.onclick = async () => {
      await updateChannel(ch, { notify: !ch.notify });
      render();
    };

    const menuBtn = el("button", { type: "button", class: "icon-btn", html: svgIcon("menu", 15), title: "Mais opções" });
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      openOptionsPanel(ch);
    };

    row.append(el("div", { class: "actions" }, [watchBtn, notifyBtn, menuBtn]));
    list.appendChild(row);
  });

  if (firstRender) {
    firstRender = false;
    setTimeout(() => document.body.classList.remove("anim-in"), 700);
  }
}

async function checkCurrentPage() {
  pageBanner.style.display = "none";
  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch (_) {
    return;
  }
  if (!tab?.url) return;
  const parsed = typeof parseChannelUrl === "function" ? parseChannelUrl(tab.url) : null;
  if (!parsed) return;
  let target = parsed;
  if (parsed.needsResolve) {
    const r = await sendToBackground({ type: "RESOLVE_URL", url: tab.url }, 15000);
    if (!r || r.error || !r.handle) return;
    target = r;
  }
  const channels = await getChannels();
  const exists = channels.some(
    (c) => (c.platform || "youtube") === target.platform && c.handle.toLowerCase() === target.handle.toLowerCase()
  );
  if (exists) return;
  pageText.innerHTML = "";
  pageText.append(
    el("span", { text: "Você está em " }),
    el("b", { text: target.handle }),
    el("span", { text: ` (${PLATFORM_LABEL[target.platform]})` })
  );
  pageAdd.disabled = false;
  pageAdd.textContent = "Adicionar";
  pageAdd.onclick = async () => {
    pageAdd.disabled = true;
    pageAdd.textContent = "Adicionando…";
    const res = await sendToBackground({ type: "ADD_FROM_URL", url: tab.url }, 20000);
    if (res.status === "added" || res.status === "exists") {
      pageBanner.style.display = "none";
      flash(res.status === "added" ? `${res.handle} adicionado` : `${res.handle} já estava na lista`);
      selectTab(res.platform);
    } else {
      pageAdd.disabled = false;
      pageAdd.textContent = "Tentar de novo";
      flash("erro: " + (res.error || "não deu pra adicionar"), 8000);
    }
  };
  pageBanner.style.display = "flex";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const raw = handleInput.value.trim();
  if (!raw) return;
  let platform = currentPlatform === "live" ? "youtube" : currentPlatform;
  const asUrl = /^(https?:\/\/|www\.|m\.)?(youtube\.com|twitch\.tv|kick\.com)\//i.test(raw)
    ? parseChannelUrl(/^https?:/i.test(raw) ? raw : "https://" + raw)
    : null;
  if (asUrl && asUrl.needsResolve) {
    addBtn.disabled = true;
    const res = await sendToBackground({ type: "ADD_FROM_URL", url: asUrl.url }, 20000);
    addBtn.disabled = false;
    if (res.status === "added" || res.status === "exists") {
      handleInput.value = "";
      flash(res.status === "added" ? `${res.handle} adicionado` : `${res.handle} já estava na lista`);
      selectTab(res.platform);
    } else flash("erro: " + (res.error || "não deu pra adicionar"), 8000);
    return;
  }
  if (asUrl) platform = asUrl.platform;
  const handle = asUrl ? asUrl.handle : normalizeHandle(raw, platform);
  if (!handle) return;

  const channels = await getChannels();
  if (channels.some((c) => c.handle.toLowerCase() === handle.toLowerCase() && (c.platform || "youtube") === platform)) {
    handleInput.value = "";
    flash(`${handle} já estava na lista`);
    if (platform !== currentPlatform) selectTab(platform);
    return;
  }

  channels.push({
    favorite: false,
    platform,
    handle,
    notify: notifyCheck.checked,
    autoOpen: autoOpenCheck.checked,
    paused: false,
    sound: true,
    notifyChanges: false,
    keywords: "",
    isLive: false,
    lastChecked: null,
    liveUrl: null,
    liveSince: null,
    notifyVideos: false,
    autoOpenVideos: false,
    channelId: null,
    lastVideoId: null,
    lastVideoUrl: null,
    lastVideoTitle: null,
    avatarUrl: null,
  });
  await chrome.storage.local.set({ channels });
  handleInput.value = "";
  form.classList.remove("open");
  if (platform !== currentPlatform) selectTab(platform);
  else render();
  flash(`${handle} adicionado`);
  sendToBackground({ type: "CHECK_ONE", handle, platform }, 60000).then(() => render());
});

checkNowBtn.addEventListener("click", runCheckAll);

let resetArmedTimer = null;
resetBtn.addEventListener("click", async () => {
  if (!resetBtn.classList.contains("confirm")) {
    resetBtn.classList.add("confirm");
    resetBtn.textContent = "Confirmar?";
    resetArmedTimer = setTimeout(() => {
      resetBtn.classList.remove("confirm");
      resetBtn.textContent = "Resetar";
    }, 4000);
    return;
  }
  clearTimeout(resetArmedTimer);
  resetBtn.classList.remove("confirm");
  resetBtn.textContent = "Resetar";
  closeAnyMenu();
  checkStatus.textContent = "resetando...";
  const res = await sendToBackground({ type: "RESET" }, 15000);
  checkStatus.textContent = res.error ? "erro: " + res.error : "resetado, verificando...";
  setTimeout(() => {
    if (checkStatus.textContent.startsWith("resetado")) checkStatus.textContent = "";
  }, 6000);
  render();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if ((changes.channels || changes.settings) && !overlayOpen()) render();
  if (changes.settings) renderDnd();
  if (changes.achievements || changes.settings) refreshAchDot();
  if (changes.settings || changes.achievements || changes.pk) applyPersonalization();
  if (changes.watchLog || changes.missedLives || changes.achState || changes.achievements) renderToday().catch(() => {});
});

setInterval(() => {
  if (!overlayOpen()) render();
  renderDnd();
}, 5000);

addBtn.innerHTML = svgIcon("plus", 16, 2.4);
loadTheme();
checkPermissions();
renderDnd();
selectTab(currentPlatform);
checkCurrentPage();
if (IS_FULL && location.hash === "#history") openHistoryPanel();
if (IS_FULL && location.hash === "#settings") openSettingsPanel();
applyPersonalization();
if (IS_FULL && location.hash === "#achievements") openAchievementsPanel();
if (IS_FULL && location.hash === "#welcome") openWelcome(0);
if (IS_FULL && location.hash.startsWith("#retro-")) openRetro(location.hash.slice(7));
celebrateOnOpen();
refreshAchDot();
