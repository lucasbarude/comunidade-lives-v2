const SHARE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';
const SHARE_C = { bg: "#0b0c14", tile: "#15161f", tile2: "#1c1d28", ink: "#ffffff", muted: "#8d8fa0", soft: "#a3a5b2", cyan: "#3ee8ff", iris: "#5b4bff", irisL: "#8b7fff", magenta: "#ff3d8b" };
const MONTHS_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function loadImg(src) {
  return new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = src;
  });
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function font(ctx, size, weight = 700) {
  ctx.font = `${weight} ${size}px ${SHARE_FONT}`;
}

function fitText(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

function fmtH(min) {
  const m = Math.round(min || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
}

function accentDark(settings, lvl, ach) {
  let a = ACCENTS.find((x) => x.id === (settings || {}).accent) || ACCENTS[0];
  if (!rewardUnlocked(a, lvl, ach)) a = ACCENTS[0];
  return a.id === "grafite" ? "#f1f2f6" : a.dark;
}

function decoCircles(ctx, W, palette) {
  if (palette) {
    const spots = [[W - 120, 40, 120], [W - 40, 190, 95], [W - 230, 175, 60]];
    for (let i = 0; i < spots.length; i++) {
      const [x, y, r] = spots[i];
      const c = palette[i][0];
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = SHARE_C.cyan;
  ctx.beginPath();
  ctx.arc(W - 120, 40, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SHARE_C.iris;
  ctx.beginPath();
  ctx.arc(W - 40, 190, 95, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SHARE_C.magenta;
  ctx.beginPath();
  ctx.arc(W - 230, 175, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

async function header(ctx, x, y, subtitle) {
  const logo = await loadImg("icons/icon128.png");
  if (logo) ctx.drawImage(logo, x, y, 72, 72);
  ctx.fillStyle = SHARE_C.ink;
  font(ctx, 44, 800);
  ctx.textBaseline = "middle";
  ctx.fillText("Canais", x + 92, y + 30);
  ctx.fillStyle = SHARE_C.muted;
  font(ctx, 26, 600);
  ctx.fillText(subtitle, x + 92, y + 66);
  ctx.textBaseline = "alphabetic";
}

function tile(ctx, x, y, w, h, value, label, color) {
  ctx.fillStyle = SHARE_C.tile;
  rrect(ctx, x, y, w, h, 30);
  ctx.fill();
  ctx.fillStyle = color || SHARE_C.ink;
  font(ctx, 52, 800);
  ctx.fillText(fitText(ctx, value, w - 56), x + 28, y + 78);
  ctx.fillStyle = SHARE_C.muted;
  font(ctx, 25, 600);
  ctx.fillText(fitText(ctx, label, w - 56), x + 28, y + 120);
}

async function drawRetro(data, period) {
  const W = 1080, H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = SHARE_C.bg;
  ctx.fillRect(0, 0, W, H);
  decoCircles(ctx, W);
  const r = computeRetro(data, period.start, period.end);
  await header(ctx, 80, 80, `Retrospectiva · ${period.label}`);

  ctx.fillStyle = SHARE_C.ink;
  font(ctx, 128, 800);
  ctx.fillText(fmtH(r.total), 76, 350);
  ctx.fillStyle = SHARE_C.soft;
  font(ctx, 36, 600);
  ctx.fillText("de live assistida", 82, 404);

  const tw = 290;
  tile(ctx, 80, 460, tw, 150, String(r.days), r.days === 1 ? "dia assistindo" : "dias assistindo", SHARE_C.cyan);
  tile(ctx, 80 + tw + 20, 460, tw, 150, String(r.livesWatched), r.livesWatched === 1 ? "live assistida" : "lives assistidas", SHARE_C.irisL);
  tile(ctx, 80 + (tw + 20) * 2, 460, tw, 150, `${r.streak} ${r.streak === 1 ? "dia" : "dias"}`, "maior sequência", SHARE_C.magenta);

  ctx.fillStyle = SHARE_C.muted;
  font(ctx, 28, 700);
  ctx.fillText("MAIS ASSISTIDOS", 82, 690);
  const colors = [SHARE_C.magenta, SHARE_C.irisL, SHARE_C.cyan, "#ffffff", "#8d8fa0"];
  const max = r.top[0] ? r.top[0].minutes : 1;
  if (!r.top.length) {
    ctx.fillStyle = SHARE_C.soft;
    font(ctx, 30, 600);
    ctx.fillText("Nenhuma live assistida nesse período.", 82, 750);
  }
  r.top.forEach((t, i) => {
    const y = 740 + i * 84;
    ctx.fillStyle = colors[i];
    font(ctx, 34, 800);
    ctx.fillText(String(i + 1), 82, y + 34);
    ctx.fillStyle = SHARE_C.ink;
    font(ctx, 34, 700);
    ctx.fillText(fitText(ctx, t.name, 520), 132, y + 34);
    ctx.fillStyle = SHARE_C.muted;
    font(ctx, 28, 600);
    const mt = fmtH(t.minutes);
    ctx.fillText(mt, W - 80 - ctx.measureText(mt).width, y + 33);
    ctx.fillStyle = SHARE_C.tile2;
    rrect(ctx, 132, y + 50, W - 212, 10, 5);
    ctx.fill();
    ctx.fillStyle = colors[i];
    rrect(ctx, 132, y + 50, Math.max(14, (W - 212) * (t.minutes / max)), 10, 5);
    ctx.fill();
  });

  await loadPerk();
  const badges = r.achievements.filter((id) => id !== PERK_ID || PERK).slice(-6);
  if (badges.length) {
    ctx.fillStyle = SHARE_C.muted;
    font(ctx, 28, 700);
    ctx.fillText("CONQUISTAS NO PERÍODO", 82, 1190);
    const all = computeAchievements(data);
    let x = 82;
    for (const id of badges) {
      const a = all.find((z) => z.id === id);
      const img = a ? await loadImg(badgeSrc(a)) : null;
      if (img) ctx.drawImage(img, x, 1210, 84, 84);
      x += 100;
    }
  } else if (r.bestDay) {
    ctx.fillStyle = SHARE_C.muted;
    font(ctx, 28, 700);
    ctx.fillText("MAIOR DIA", 82, 1190);
    ctx.fillStyle = SHARE_C.ink;
    font(ctx, 40, 800);
    const [yy, mm, dd] = r.bestDay.day.split("-");
    ctx.fillText(`${dd}/${mm} · ${fmtH(r.bestDay.minutes)}`, 82, 1250);
  }
  ctx.fillStyle = "#5d5f70";
  font(ctx, 22, 600);
  const foot = "feito com o Canais, extensão grátis pra quem acompanha lives";
  ctx.fillText(foot, W - 80 - ctx.measureText(foot).width, 1310);
  return cv;
}

async function drawProfile(data) {
  const W = 1080, H = 1080;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  const lvl = computeLevel(data);
  const ach = data.achievements || {};
  const settings = data.settings || {};
  const frameId = currentFrame(settings, lvl, ach);
  await loadPerk();
  const fx = perkOn(settings, ach) ? PERK.card : null;
  const cardBg = fx ? fx.bg : SHARE_C.bg;
  ctx.fillStyle = frameId === "none" ? cardBg : "#05060a";
  ctx.fillRect(0, 0, W, H);
  if (frameId !== "none") {
    ctx.save();
    rrect(ctx, 30, 30, W - 60, H - 60, 56);
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.clip();
  }
  decoCircles(ctx, W, fx && fx.deco);
  await header(ctx, 80, 80, "Meu perfil de lives");
  const accent = accentDark(settings, lvl, ach);
  const frame = currentFrame(settings, lvl, ach);

  const cx = 230, cy = 400, R = 130;
  if (fx) drawAura(ctx, cx, cy, R, fx);
  ctx.fillStyle = SHARE_C.tile;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "round";
  ctx.lineWidth = 14;
  ctx.strokeStyle = SHARE_C.tile2;
  ctx.beginPath();
  ctx.arc(cx, cy, R - 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, R - 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, lvl.progress));
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = SHARE_C.muted;
  font(ctx, 26, 700);
  ctx.fillText("NÍVEL", cx, cy - 40);
  ctx.fillStyle = SHARE_C.ink;
  font(ctx, 104, 800);
  ctx.fillText(String(lvl.level), cx, cy + 50);
  ctx.textAlign = "left";

  ctx.fillStyle = SHARE_C.ink;
  font(ctx, 64, 800);
  ctx.fillText(lvl.rank, 420, 380);
  ctx.fillStyle = SHARE_C.soft;
  font(ctx, 30, 600);
  ctx.fillText(`${lvl.xp.toLocaleString("pt-BR")} XP · ${Math.round(lvl.progress * 100)}% pro nível ${lvl.level + 1}`, 422, 430);

  const total = Object.values(data.watchLog || {}).reduce((a, m) => a + Object.values(m || {}).reduce((x, y) => x + (y || 0), 0), 0);
  const streak = computeDayStreak(data.watchLog);
  const list = computeAchievements(data).filter((a) => !a.hidden || (!!PERK && !!ach[a.id]));
  const got = list.filter((a) => ach[a.id] || a.unlocked).length;
  const tw = 290;
  tile(ctx, 80, 590, tw, 150, total >= 600 ? `${Math.floor(total / 60)}h` : fmtH(total), "de live assistida", SHARE_C.cyan);
  tile(ctx, 80 + tw + 20, 590, tw, 150, `${streak} ${streak === 1 ? "dia" : "dias"}`, "sequência atual", SHARE_C.magenta);
  tile(ctx, 80 + (tw + 20) * 2, 590, tw, 150, `${got}/${list.length}`, "conquistas", SHARE_C.irisL);

  let favKey = null;
  let favMin = 0;
  for (const [k, m] of Object.entries(data.watchLog || {})) {
    const v = Object.values(m || {}).reduce((a, b) => a + (b || 0), 0);
    if (v > favMin) (favMin = v), (favKey = k);
  }
  if (favKey) {
    ctx.fillStyle = SHARE_C.muted;
    font(ctx, 28, 700);
    ctx.fillText("CANAL FAVORITO", 82, 805);
    ctx.fillStyle = SHARE_C.ink;
    font(ctx, 40, 800);
    const nm = favKey.split(":").slice(1).join(":");
    ctx.fillText(fitText(ctx, `${nm} · ${fmtH(favMin)}`, W - 160), 82, 855);
  }
  const recent = Object.entries(ach)
    .filter(([id]) => !id.startsWith("c-"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => list.find((a) => a.id === id))
    .filter(Boolean);
  let x = 82;
  for (const a of recent) {
    const img = await loadImg(badgeSrc(a));
    if (img) ctx.drawImage(img, x, 900, 96, 96);
    x += 112;
  }
  ctx.fillStyle = "#5d5f70";
  font(ctx, 22, 600);
  const foot = "feito com o Canais";
  ctx.fillText(foot, W - 80 - ctx.measureText(foot).width, frameId === "none" ? 1040 : 1020);
  if (frameId !== "none") {
    ctx.restore();
    drawCardFrame(ctx, W, H, frameId);
  }
  return cv;
}

function framePath(ctx, inset, W, H, r) {
  rrect(ctx, inset, inset, W - inset * 2, H - inset * 2, r);
}

function drawCardFrame(ctx, W, H, id) {
  ctx.save();
  ctx.lineJoin = "round";
  if (METAL_COLORS[id]) {
    const m = METAL_COLORS[id];
    ctx.lineWidth = 22;
    ctx.strokeStyle = m.base;
    framePath(ctx, 30, W, H, 56);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = m.light;
    framePath(ctx, 24, W, H, 62);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = m.dark;
    framePath(ctx, 43, W, H, 44);
    ctx.stroke();
    for (const [x, y] of [[W / 2, 30], [W / 2, H - 30], [30, H / 2], [W - 30, H / 2]]) {
      ctx.fillStyle = m.dark;
      ctx.beginPath();
      ctx.moveTo(x, y - 18);
      ctx.lineTo(x + 18, y);
      ctx.lineTo(x, y + 18);
      ctx.lineTo(x - 18, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = m.light;
      ctx.beginPath();
      ctx.moveTo(x, y - 9);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x, y + 9);
      ctx.lineTo(x - 9, y);
      ctx.closePath();
      ctx.fill();
    }
  } else if (id === "neon") {
    ctx.lineWidth = 10;
    ctx.strokeStyle = SHARE_C.cyan;
    framePath(ctx, 30, W, H, 56);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(62,232,255,.35)";
    framePath(ctx, 48, W, H, 42);
    ctx.stroke();
  } else {
    const per = 2 * (W - 60 + H - 60) - (8 - 2 * Math.PI) * 56;
    const seg = per / 3;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    [SHARE_C.cyan, SHARE_C.iris, SHARE_C.magenta].forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.setLineDash([seg - 26, per - seg + 26]);
      ctx.lineDashOffset = -(i * seg) - 13;
      framePath(ctx, 30, W, H, 56);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    if (id === "lenda") {
      ctx.lineWidth = 8;
      ctx.strokeStyle = SHARE_C.magenta;
      framePath(ctx, 12, W, H, 72);
      ctx.stroke();
    }
  }
  ctx.restore();
}

async function openShareSheet(title, canvasPromise, filename, onBack) {
  const panel = makePanel(title, { onBack });
  const holder = el("div", { class: "share-holder" }, [el("div", { class: "empty-note", text: "Gerando imagem…" })]);
  panel.append(holder);
  const cv = await canvasPromise;
  const url = cv.toDataURL("image/png");
  holder.innerHTML = "";
  holder.append(el("img", { src: url, alt: title, class: "share-img" }));
  const dl = el("button", { type: "button", class: "wel-next", text: "Baixar imagem" });
  dl.style.margin = "12px 16px 0";
  dl.onclick = () => {
    const a = el("a", { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const cp = el("button", { type: "button", class: "chip", text: "Copiar imagem" });
  cp.onclick = async () => {
    try {
      const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      cp.textContent = "Copiada!";
    } catch (_) {
      cp.textContent = "Não deu pra copiar, use Baixar";
    }
  };
  const row = el("div", { class: "chip-row", style: "justify-content:center;margin:10px 16px 0" }, [cp]);
  panel.append(dl, row, el("div", { class: "note", style: "margin:10px 18px 0;text-align:center", text: "A imagem é criada aqui no seu navegador. Nada é enviado pra lugar nenhum." }));
}

function retroPeriods(watchLog) {
  const keys = [];
  for (const m of Object.values(watchLog || {})) keys.push(...Object.keys(m || {}));
  const now = new Date();
  const first = keys.length ? new Date(keys.sort()[0] + "T12:00:00") : now;
  const out = [];
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  while (d >= new Date(first.getFullYear(), first.getMonth(), 1) && out.length < 24) {
    const start = d.getTime();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    const label = `${MONTHS_LONG[d.getMonth()]} de ${d.getFullYear()}`;
    out.push({ id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: label.charAt(0).toUpperCase() + label.slice(1), start, end });
    d.setMonth(d.getMonth() - 1);
  }
  const years = [...new Set(out.map((p) => p.id.slice(0, 4)))];
  for (const y of years) out.push({ id: y, label: `Ano de ${y}`, start: new Date(+y, 0, 1).getTime(), end: new Date(+y + 1, 0, 1).getTime() });
  return out;
}

async function openRetro(periodId, onBack) {
  const data = await chrome.storage.local.get(["watchLog", "liveHistory", "achievements", "achState", "settings"]);
  const periods = retroPeriods(data.watchLog);
  if (!periodId) {
    const panel = makePanel("Retrospectiva", { onBack });
    const box = el("div", { class: "ach-ch-list" });
    for (const p of periods) {
      const r = computeRetro(data, p.start, p.end);
      const row = el("button", { type: "button", class: "ach-ch-row" }, [
        el("div", { class: "ach-ch-info" }, [el("div", { class: "ach-ch-name" }, [el("span", { class: "name", text: p.label })]), el("div", { class: "ach-ch-sub", text: r.total ? `${fmtH(r.total)} · ${r.days} ${r.days === 1 ? "dia" : "dias"}` : "nada assistido" })]),
        el("span", { class: "today-chev", html: svgIcon("chevron", 16) }),
      ]);
      row.onclick = () => openRetro(p.id, () => openRetro(null, onBack));
      box.append(row);
    }
    panel.append(card(box));
    return;
  }
  const p = periods.find((x) => x.id === periodId) || periods[0];
  return openShareSheet(`Retrospectiva · ${p.label}`, drawRetro(data, p), `canais-retrospectiva-${p.id}.png`, onBack);
}

async function openProfileCard(onBack) {
  const data = await chrome.storage.local.get(["watchLog", "liveHistory", "openSessions", "achievements", "achState", "settings"]);
  return openShareSheet("Cartão de perfil", drawProfile(data), "canais-perfil.png", onBack);
}


function drawAura(ctx, cx, cy, R, fx) {
  const n = 22;
  const hs = [46, 30, 38, 26];
  const tongue = (a, w, h, curl) => {
    const P = (ang, r) => [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    const [x0, y0] = P(a - w, R - 4);
    const [x1, y1] = P(a + w, R - 4);
    const [tx, ty] = P(a + curl, R + h);
    const [c0x, c0y] = P(a - w * 0.9, R + h * 0.75);
    const [c1x, c1y] = P(a + w * 1.25, R + h * 0.15);
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(c0x, c0y, tx, ty);
    ctx.quadraticCurveTo(c1x, c1y, x1, y1);
  };
  const layer = (color, scale, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const h = hs[i % hs.length] * scale;
      tongue(a, (Math.PI / n) * 1.05, h, 0.11);
    }
    ctx.fill();
    ctx.restore();
  };
  ctx.save();
  ctx.shadowColor = fx.glow;
  ctx.shadowBlur = 28;
  layer(fx.c1, 1, 0.95);
  ctx.restore();
  layer(fx.c2, 0.55, 1);
}
