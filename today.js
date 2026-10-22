const FOLLOW_PAGES = {
  twitch: "https://www.twitch.tv/directory/following/channels",
  youtube: "https://www.youtube.com/feed/channels",
  kick: "https://kick.com/following",
};

function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

async function applyPersonalization() {
  await loadPerk();
  const data = await chrome.storage.local.get(["settings", "watchLog", "achievements", "achState"]);
  const settings = data.settings || {};
  const lvl = computeLevel(data);
  let accent = ACCENTS.find((a) => a.id === settings.accent) || ACCENTS[0];
  if (!rewardUnlocked(accent, lvl, data.achievements)) accent = ACCENTS[0];
  const oled = settings.oled && rewardUnlocked(THEME_REWARDS[0], lvl, data.achievements);
  document.documentElement.classList.toggle("oled", !!oled);
  const fxOn = perkOn(settings, data.achievements);
  document.documentElement.classList.toggle("fx-on", fxOn);
  if (fxOn && !document.getElementById("fx-layer")) {
    const f = document.createElement("div");
    f.id = "fx-layer";
    f.innerHTML = '<span class="fx-a"></span>';
    document.body.appendChild(f);
  } else if (!fxOn) {
    const f = document.getElementById("fx-layer");
    if (f) f.remove();
  }
  const lightOn = accent.id === "grafite" ? "#ffffff" : "#ffffff";
  const darkOn = accent.id === "grafite" ? "#0b0c14" : "#0b0c14";
  const light = `--accent:${accent.light};--accent-soft:${hexToRgba(accent.light, 0.1)};--focus-ring:${accent.light};--on-accent:${lightOn};`;
  const dark = `--accent:${accent.dark};--accent-soft:${hexToRgba(accent.dark, 0.14)};--focus-ring:${accent.dark};--on-accent:${darkOn};`;
  const fxVars = fxOn ? PERK.vars : "";
  const oledVars = "--bg:#000000;--group:#0c0c10;--surface:#0c0c10;--surface-raised:#121218;--row:#121218;--row-hover:#18181f;--thumb:#1d1d26;--avatar-bg:#17162a;";
  let style = document.getElementById("personal-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "personal-style";
    document.head.appendChild(style);
  }
  style.textContent = `
    :root { ${light} }
    :root[data-theme="dark"] { ${dark} }
    @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${dark} } }
    :root.oled[data-theme="dark"] { ${oledVars} }
    @media (prefers-color-scheme: dark) { :root.oled:not([data-theme="light"]) { ${oledVars} } }
    :root.fx-on, :root.fx-on[data-theme="light"], :root.fx-on[data-theme="dark"] { ${fxVars} }
    ${fxOn ? PERK.css : ""}
  `;
}

function nextLikelyLives(channels, sessionsMap, now = Date.now()) {
  const out = [];
  for (const ch of channels) {
    if (ch.isLive || ch.paused) continue;
    const habit = computeHabit(sessionsMap[channelKey(ch)] || [], now);
    const diff = minutesUntilHabit(habit, now);
    if (diff === null || diff < -30) continue;
    out.push({ ch, habit, diff });
  }
  return out.sort((a, b) => a.diff - b.diff);
}

function recentMissed(missed, now = Date.now()) {
  return (missed || []).filter((m) => !m.dismissed && now - m.end < 48 * 3600000);
}

async function renderToday() {
  const box = document.getElementById("today");
  if (!box) return;
  const data = await chrome.storage.local.get(["channels", "watchLog", "liveHistory", "openSessions", "achievements", "achState", "missedLives", "settings"]);
  const channels = data.channels || [];
  if (!channels.length || (data.settings || {}).hideToday) {
    box.style.display = "none";
    return;
  }
  const lvl = computeLevel(data);
  const todayMin = dailyTotals(data.watchLog)[dayKey(new Date())] || 0;
  const streak = computeDayStreak(data.watchLog);
  const sessions = sessionsByChannel(data.liveHistory, data.openSessions);
  const next = nextLikelyLives(channels, sessions)[0];
  const missed = recentMissed(data.missedLives);
  const ch = computeChallenges(data);
  const doneCh = ch.items.filter((c) => c.done).length;

  const sig = JSON.stringify([currentFrame(data.settings, lvl, data.achievements), lvl.level, Math.round(lvl.progress * 50), Math.floor(todayMin), streak, next && next.ch.handle, next && next.habit.time, missed.length, doneCh]);
  if (box.dataset.sig === sig) return;
  box.dataset.sig = sig;

  const ring = el("div", { class: "lvl-ring", title: `Nível ${lvl.level} · ${lvl.rank}` });
  ring.dataset.frame = currentFrame(data.settings, lvl, data.achievements);
  ring.style.setProperty("--p", String(Math.round(lvl.progress * 100)));
  ring.append(el("span", { text: String(lvl.level) }));

  const line1 = el("div", { class: "today-l1" }, [
    el("b", { text: `Hoje ${fmtMinutes(todayMin)}` }),
    streak >= 1 ? el("span", { class: "today-streak", html: svgIcon("flame", 12) + `<span>${streak} ${streak === 1 ? "dia" : "dias"}</span>` }) : null,
    el("span", { class: "today-ch", text: `${doneCh}/3 desafios` }),
  ]);
  let l2;
  if (missed.length) {
    const m = missed[0];
    l2 = el("div", { class: "today-l2 missed" }, [el("span", { text: `Perdeu: ${m.handle}` }), el("span", { class: "dot", text: "·" }), el("span", { class: "link", text: "ver gravação" })]);
    l2.querySelector(".link").onclick = (e) => {
      e.stopPropagation();
      chrome.tabs.create({ url: m.vodUrl });
    };
  } else if (next) {
    const when = next.diff <= 0 ? "deve entrar agora" : next.diff < 60 ? `em ~${next.diff} min` : `~${next.habit.time}`;
    l2 = el("div", { class: "today-l2", text: `Próxima provável: ${next.ch.handle} ${when}` });
  } else {
    l2 = el("div", { class: "today-l2", text: `Nível ${lvl.level} · ${lvl.rank} · ${Math.round(lvl.progress * 100)}% pro próximo` });
  }
  const inner = el("button", { type: "button", class: "today-card", title: "Ver seu dia" }, [
    ring,
    el("div", { class: "today-txt" }, [line1, l2]),
    el("span", { class: "today-chev", html: svgIcon("chevron", 16) }),
  ]);
  inner.onclick = () => openTodayPanel();
  box.innerHTML = "";
  box.append(inner);
  box.style.display = "";
}

async function openTodayPanel() {
  const data = await chrome.storage.local.get(["channels", "watchLog", "liveHistory", "openSessions", "achievements", "achState", "missedLives", "settings"]);
  const panel = makePanel("Seu dia");
  const lvl = computeLevel(data);
  const todayMin = dailyTotals(data.watchLog)[dayKey(new Date())] || 0;
  const streak = computeDayStreak(data.watchLog);

  const bar = el("div", { class: "ach-bar" }, [el("b")]);
  bar.firstChild.style.width = Math.round(lvl.progress * 100) + "%";
  const ring = el("div", { class: "lvl-ring big" });
  ring.dataset.frame = currentFrame(data.settings, lvl, data.achievements);
  ring.style.setProperty("--p", String(Math.round(lvl.progress * 100)));
  ring.append(el("span", { text: String(lvl.level) }));
  const nextReward = [...ACCENTS, ...FRAME_REWARDS].filter((r) => r.level && r.level > lvl.level).sort((a, b) => a.level - b.level)[0];
  panel.append(
    card(
      el("div", { class: "panel-section" }, [
        el("div", { class: "lvl-head" }, [
          ring,
          el("div", {}, [
            el("div", { class: "lvl-title", text: `Nível ${lvl.level} · ${lvl.rank}` }),
            el("div", { class: "note", style: "margin:2px 0 0", text: `${lvl.xp - lvl.cur} de ${lvl.next - lvl.cur} XP pro nível ${lvl.level + 1}` + (nextReward ? ` · libera ${nextReward.name} no nível ${nextReward.level}` : "") }),
          ]),
        ]),
        bar,
        el("div", { class: "note", text: "XP: 1 por minuto de live assistida, 30 por conquista e 60 por desafio concluído." }),
      ])
    )
  );

  const stat = (big, small) => el("div", { class: "stat" }, [el("b", { text: big }), el("span", { text: small })]);
  const sw = el("div", { class: "panel-section" }, [
    el("div", { class: "stats" }, [stat(fmtMinutes(todayMin), "assistido hoje"), stat(`${streak} ${streak === 1 ? "dia" : "dias"}`, "seguidos assistindo")]),
  ]);
  sw.style.padding = "10px 12px 0";
  panel.append(sw);

  panel.append(secTitle("Desafios da semana"), card(challengesBlock(data)));

  const missed = recentMissed(data.missedLives);
  if (missed.length) {
    const box = el("div", { class: "lives" });
    for (const m of missed.slice(0, 6)) {
      const dur = Math.round((m.end - m.start) / 60000);
      const row = el("div", { class: "live-item missed-item" }, [
        el("div", { class: "top" }, [el("span", { text: m.handle }), el("span", { class: "pf " + m.platform, text: PLATFORM_LABEL[m.platform] })]),
        m.title ? el("div", { class: "ttl", text: m.title, title: m.title }) : null,
        el("div", { class: "sub", text: `${fmtDate(m.start)} ${fmtClock(m.start)} · durou ${fmtMinutes(dur)}` }),
      ]);
      const actions = el("div", { class: "chip-row", style: "margin-top:8px" });
      const watch = el("button", { type: "button", class: "chip", text: "Ver gravação" });
      watch.onclick = () => chrome.tabs.create({ url: m.vodUrl });
      const hide = el("button", { type: "button", class: "chip", text: "Dispensar" });
      hide.onclick = async () => {
        const { missedLives = [] } = await chrome.storage.local.get("missedLives");
        const it = missedLives.find((x) => x.key === m.key && x.start === m.start);
        if (it) it.dismissed = true;
        await chrome.storage.local.set({ missedLives });
        row.remove();
        renderToday();
      };
      actions.append(watch, hide);
      row.append(actions);
      box.append(row);
    }
    panel.append(secTitle("Lives que você perdeu"), card(el("div", { class: "panel-section" }, [box])));
  }

  panel.append(secTitle("Agenda da semana"), card(agendaBlock(data)));
  panel.append(
    el("div", {
      class: "note",
      style: "margin:12px 18px 0",
      text: "A agenda é uma previsão pelo horário em que cada canal costuma entrar (precisa de 3 lives registradas do canal).",
    })
  );
}

function challengesBlock(data) {
  const ch = computeChallenges(data);
  const wrap = el("div", { class: "panel-section chal-list" });
  for (const c of ch.items) {
    const pct = Math.round(Math.min(1, c.value / c.target) * 100);
    const row = el("div", { class: "chal" + (c.done ? " done" : "") }, [
      el("span", { class: "chal-ck", html: c.done ? svgIcon("check", 13, 3) : "" }),
      el("div", { class: "chal-txt" }, [el("div", { class: "chal-t", text: c.title }), el("div", { class: "chal-p", text: c.done ? `Concluído · +${XP_PER_CHALLENGE} XP` : c.progress })]),
    ]);
    if (!c.done) {
      const mini = el("div", { class: "mini" }, [el("b")]);
      mini.firstChild.style.width = pct + "%";
      row.append(mini);
    }
    wrap.append(row);
  }
  const days = Math.max(0, Math.ceil((ch.endsAt - Date.now()) / 86400000));
  wrap.append(el("div", { class: "note", text: `Novos desafios em ${days} ${days === 1 ? "dia" : "dias"} (toda segunda).` }));
  return wrap;
}

function agendaBlock(data) {
  const channels = (data.channels || []).filter((c) => !c.paused);
  const sessions = sessionsByChannel(data.liveHistory, data.openSessions);
  const habits = channels.map((ch) => ({ ch, habit: computeHabit(sessions[channelKey(ch)] || []) })).filter((x) => x.habit.enough);
  const wrap = el("div", { class: "panel-section agenda" });
  if (!habits.length) {
    wrap.append(el("div", { class: "empty-note", text: "Ainda aprendendo os horários. Conforme os canais fizerem lives, a agenda vai aparecendo aqui." }));
    return wrap;
  }
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const wd = d.getDay();
    const items = habits.filter((x) => x.habit.days.includes(wd)).sort((a, b) => a.habit.minutes - b.habit.minutes);
    const label = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : `${WEEKDAY_SHORT[wd]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    const day = el("div", { class: "ag-day" }, [el("div", { class: "ag-label" + (i === 0 ? " today" : ""), text: label })]);
    const list = el("div", { class: "ag-items" });
    if (!items.length) list.append(el("span", { class: "ag-empty", text: "—" }));
    for (const x of items) {
      const live = i === 0 && x.ch.isLive;
      list.append(
        el("div", { class: "ag-item" + (live ? " live" : "") }, [
          el("span", { class: "ag-time", text: live ? "ao vivo" : x.habit.time }),
          el("span", { class: "ag-name", text: x.ch.handle }),
          el("span", { class: "pf-tag " + (x.ch.platform || "youtube"), text: PLATFORM_LABEL[x.ch.platform || "youtube"] }),
        ])
      );
    }
    day.append(list);
    wrap.append(day);
  }
  return wrap;
}

function personalizeBlock(data) {
  const settings = data.settings || {};
  const lvl = computeLevel(data);
  const ach = data.achievements || {};
  const wrap = el("div", { class: "panel-section" });
  const sw = el("div", { class: "accent-row" });
  for (const a of ACCENTS) {
    const ok = rewardUnlocked(a, lvl, ach);
    if (a.hidden && (!ok || !PERK)) continue;
    const active = (settings.accent || "iris") === a.id && ok;
    const b = el("button", {
      type: "button",
      class: "accent-dot" + (active ? " active" : "") + (ok ? "" : " locked"),
      title: ok ? a.name : `${a.name} · libera ${a.badge ? "com " + a.badgeName : "no nível " + a.level}`,
    });
    b.style.setProperty("--c", a.light);
    b.style.setProperty("--cd", a.dark);
    if (!ok) b.innerHTML = svgIcon("lock", 12, 2.4);
    b.onclick = async () => {
      if (!ok) return flash(`${a.name} libera ${a.badge ? "com " + a.badgeName : "no nível " + a.level}`);
      await patchSettings({ accent: a.id });
      await applyPersonalization();
      openSettingsPanel(true);
    };
    sw.append(el("div", { class: "accent-cell" }, [b, el("span", { text: ok ? a.name : a.badge ? a.name : `nível ${a.level}` })]));
  }
  wrap.append(el("div", { class: "row", style: "margin-bottom:8px" }, [el("span", { text: "Cor de destaque" }), el("span", { class: "hint", text: `você está no nível ${lvl.level}` })]), sw);
  const theme = THEME_REWARDS[0];
  const themeOk = rewardUnlocked(theme, lvl, ach);
  const themeRow = el("div", { class: "row", style: "margin-top:12px" }, [
    el("span", {}, [el("span", { text: theme.name }), el("div", { class: "note", style: "margin:0", text: themeOk ? theme.desc : `Libera com a conquista ${theme.badgeName}` })]),
    themeOk ? switchEl(!!settings.oled, async (v) => { await patchSettings({ oled: v }); applyPersonalization(); }) : el("span", { class: "hint", html: svgIcon("lock", 13, 2.2) }),
  ]);
  wrap.append(themeRow);
  const fxTheme = THEME_REWARDS.find((t) => t.id === PERK_ID);
  if (fxTheme && PERK && rewardUnlocked(fxTheme, lvl, ach)) {
    wrap.append(
      el("div", { class: "row", style: "margin-top:12px" }, [
        el("span", {}, [el("span", { text: fxTheme.name }), el("div", { class: "note", style: "margin:0", text: fxTheme.desc })]),
        switchEl(settings.fx !== false, async (v) => {
          await patchSettings({ fx: v });
          applyPersonalization();
        }),
      ])
    );
  }
  const current = currentFrame(settings, lvl, ach);
  const frames = el("div", { class: "frame-row" });
  for (const f of FRAME_REWARDS) {
    const ok = rewardUnlocked(f, lvl, ach);
    const ring = el("div", { class: "mini-card", "data-frame": f.id }, [
      el("span", { class: "mc-dot" }),
      el("span", { class: "mc-lvl", text: String(lvl.level) }),
      el("span", { class: "mc-line" }),
      el("span", { class: "mc-line short" }),
    ]);
    const need = f.badge ? `conquista ${f.badgeName}` : `nível ${f.level}`;
    const tileBtn = el("button", {
      type: "button",
      class: "frame-tile" + (f.id === current ? " active" : "") + (ok ? "" : " locked"),
      title: ok ? f.desc : `Libera com ${need}`,
    }, [
      el("div", { class: "frame-prev" }, [ring]),
      el("div", { class: "frame-name", text: f.name }),
      el("div", { class: "frame-sub", html: ok ? (f.id === current ? "em uso" : "usar") : svgIcon("lock", 10, 2.6) + " " + need }),
    ]);
    tileBtn.onclick = async () => {
      if (!ok) return flash(`${f.name} libera com ${need}`);
      await patchSettings({ frame: f.id });
      const t = document.getElementById("today");
      if (t) t.dataset.sig = "";
      renderToday();
      openSettingsPanel(true);
    };
    frames.append(tileBtn);
  }
  wrap.append(
    el("div", { class: "row", style: "margin-top:14px;margin-bottom:8px" }, [el("span", { text: "Moldura do cartão de perfil" })]),
    frames,
    (() => {
      const b = el("button", { type: "button", class: "chip", style: "margin-top:10px", text: "Ver meu cartão de perfil" });
      b.onclick = () => openProfileCard(() => openSettingsPanel(true));
      return b;
    })(),
    el("div", { class: "note", text: "A moldura fica em volta da imagem do cartão de perfil, a que você baixa ou copia pra postar." })
  );
  return wrap;
}

async function openWelcome(step = 0) {
  const panel = makePanel("Bem-vindo ao Canais", { onBack: step > 0 ? () => openWelcome(step - 1) : () => window.close() });
  const dots = el("div", { class: "wel-dots" }, [0, 1, 2].map((i) => el("span", { class: i === step ? "on" : "" })));
  const hero = el("div", { class: "wel-hero" }, [el("img", { src: "icons/icon128.png", alt: "" }), dots]);
  panel.append(hero);
  const nextBtn = (label, fn) => {
    const b = el("button", { type: "button", class: "wel-next", text: label });
    b.onclick = fn;
    return b;
  };
  if (step === 0) {
    panel.append(
      el("div", { class: "wel-title", text: "Traga seus canais" }),
      el("div", { class: "wel-sub", text: "Abra a sua lista de canais seguidos e clique em “Importar canais pro Canais”, que aparece no canto da página." })
    );
    const grid = el("div", { class: "wel-grid" });
    for (const [pf, label, sub] of [
      ["twitch", "Twitch", "canais que você segue"],
      ["youtube", "YouTube", "suas inscrições"],
      ["kick", "Kick", "canais que você segue"],
    ]) {
      const b = el("button", { type: "button", class: "wel-src " + pf }, [el("b", { text: label }), el("span", { text: sub })]);
      b.onclick = () => chrome.tabs.create({ url: FOLLOW_PAGES[pf] });
      grid.append(b);
    }
    panel.append(card(el("div", { class: "panel-section" }, [grid])));
    panel.append(el("div", { class: "wel-tip", text: "Também dá pra digitar o @ do canal no popup ou clicar com o botão direito numa página de canal." }));
    panel.append(nextBtn("Continuar", () => openWelcome(1)));
  } else if (step === 1) {
    const s = await getSettings();
    panel.append(el("div", { class: "wel-title", text: "Como você quer ser avisado" }), el("div", { class: "wel-sub", text: "Dá pra mudar tudo depois nas configurações." }));
    const nick = el("input", { type: "text", class: "field wide", placeholder: "seu nick no chat (opcional)", maxlength: "80" });
    nick.value = s.mentionNicks || "";
    nick.onchange = () => patchSettings({ mentionNicks: nick.value.trim() });
    panel.append(
      card(
        switchRow("Segurar avisos quando eu estiver longe do PC", s.holdWhenAway !== false, (v) => patchSettings({ holdWhenAway: v })),
        switchRow("Avisar quando eu perder a live de um favorito", (s.missedAlerts || "favoritos") !== "off", (v) => patchSettings({ missedAlerts: v ? "favoritos" : "off" })),
        switchRow("Resumo da semana e do mês", s.weeklySummary !== false, (v) => patchSettings({ weeklySummary: v })),
        switchRow("Avisar quando ganhar conquista", s.achievementAlerts !== false, (v) => patchSettings({ achievementAlerts: v }))
      ),
      secTitle("Te avisar quando te marcarem no chat"),
      card(el("div", { class: "panel-section" }, [nick, el("div", { class: "note", text: "Funciona enquanto o chat da live estiver aberto em alguma aba." })]))
    );
    panel.append(nextBtn("Continuar", () => openWelcome(2)));
  } else {
    panel.append(el("div", { class: "wel-title", text: "Tudo pronto" }), el("div", { class: "wel-sub", text: "Umas dicas rápidas:" }));
    const tips = [
      ["pin", "Fixe o Canais na barra do Chrome: clique no ícone de quebra-cabeça e no alfinete."],
      ["broadcast", "Quando um canal entrar ao vivo, o ícone mostra quantos estão ao vivo."],
      ["trophy", "Assistindo lives você ganha XP, sobe de nível e desbloqueia conquistas e cores."],
      ["flame", "Toda segunda tem 3 desafios novos."],
    ];
    const list = el("div", { class: "panel-section wel-tips" });
    for (const [icon, text] of tips) list.append(el("div", { class: "wel-tiprow" }, [el("span", { class: "wel-ic", html: svgIcon(icon, 16) }), el("span", { text })]));
    panel.append(card(list));
    panel.append(
      nextBtn("Concluir", async () => {
        await patchSettings({ onboarded: true });
        if (IS_FULL) window.close();
        else closeOptionsPanel();
      })
    );
  }
}
