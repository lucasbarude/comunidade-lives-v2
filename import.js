(() => {
  if (window.__canaisImport) return;
  window.__canaisImport = true;

  const host = location.hostname;
  const platform = host.endsWith("twitch.tv") ? "twitch" : host.endsWith("kick.com") ? "kick" : host.endsWith("youtube.com") ? "youtube" : null;
  if (!platform) return;

  const RESERVED = {
    twitch: new Set(["directory", "videos", "settings", "p", "search", "downloads", "jobs", "turbo", "subscriptions", "inventory", "wallet", "drops", "prime", "friends", "messages", "login", "signup", "following", "store", "payments", "moderator", "popout", "embed", "broadcast", "dashboard", "u", "team", "products", "bits", "redeem", "activate", "privacy", "legal"]),
    kick: new Set(["categories", "category", "browse", "search", "following", "video", "videos", "clips", "clip", "dashboard", "settings", "login", "signup", "terms-of-service", "privacy-policy", "community-guidelines", "dmca-policy", "transparency", "contact", "about", "careers", "faq", "help", "subscriptions", "wallet", "messages", "notifications", "emotes", "explore", "home", "channels", "api", "popout", "stream"]),
  };

  function pageKind() {
    const p = location.pathname.toLowerCase();
    if (platform === "youtube") {
      if (p.startsWith("/feed/channels")) return "list";
      if (p.startsWith("/feed/subscriptions")) return "hint";
      return null;
    }
    if (platform === "twitch") return p.startsWith("/directory/following") ? "list" : null;
    if (platform === "kick") return p.startsWith("/following") ? "list" : null;
    return null;
  }

  function collect() {
    const found = new Map();
    const scope = (platform === "youtube" ? document.querySelector("ytd-browse[page-subtype='channels'], ytd-browse") : document.querySelector("main")) || document.body;
    for (const a of scope.querySelectorAll("a[href]")) {
      let url;
      try {
        url = new URL(a.getAttribute("href"), location.origin);
      } catch (_) {
        continue;
      }
      if (url.origin !== location.origin) continue;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length !== 1) continue;
      let handle;
      try {
        handle = decodeURIComponent(parts[0]);
      } catch (_) {
        continue;
      }
      if (platform === "youtube") {
        if (!handle.startsWith("@") || handle.length < 2) continue;
      } else {
        handle = handle.toLowerCase();
        const re = platform === "twitch" ? /^[a-z0-9_]{2,25}$/ : /^[a-z0-9_-]{2,30}$/;
        if (!re.test(handle) || RESERVED[platform].has(handle)) continue;
      }
      const key = handle.toLowerCase();
      if (found.has(key)) continue;
      const card = a.closest("ytd-channel-renderer, article, li, [data-a-target], div") || a;
      const img = (card.querySelector && card.querySelector("img[src]")) || a.querySelector("img[src]");
      let name = (a.getAttribute("title") || a.textContent || "").trim().replace(/\s+/g, " ");
      if (!name || name.length > 60) name = handle;
      found.set(key, { platform, handle, name, avatar: img ? img.src : "" });
    }
    return [...found.values()];
  }

  function scroller() {
    if (platform === "youtube") return document.scrollingElement;
    let best = null;
    let bestDiff = 0;
    for (const el of document.querySelectorAll("main, main *")) {
      const diff = el.scrollHeight - el.clientHeight;
      if (diff > bestDiff + 50) {
        const ov = getComputedStyle(el).overflowY;
        if (ov === "auto" || ov === "scroll") {
          best = el;
          bestDiff = diff;
        }
      }
    }
    return best || document.scrollingElement;
  }

  async function loadAll(onProgress) {
    const sc = scroller();
    const startTop = sc.scrollTop;
    let last = -1;
    let stable = 0;
    for (let i = 0; i < 60 && stable < 3; i++) {
      sc.scrollTop = sc.scrollHeight;
      await new Promise((r) => setTimeout(r, 650));
      const n = collect().length;
      onProgress(n);
      if (n === last) stable++;
      else stable = 0;
      last = n;
    }
    sc.scrollTop = startTop;
    return collect();
  }

  const CSS = `
  :host { all: initial; }
  * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif; }
  .pill { position: fixed; right: 20px; bottom: 20px; z-index: 2147483646; display: flex; align-items: center; gap: 10px;
    height: 44px; padding: 0 18px 0 8px; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; cursor: pointer;
    background: rgba(11,12,20,.94); color: #fff; font-size: 13.5px; font-weight: 650; box-shadow: 0 12px 34px rgba(0,0,0,.35);
    -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); animation: in .45s cubic-bezier(.2,.9,.25,1.15) both; }
  .pill:hover { background: rgba(28,29,40,.96); }
  .pill img { width: 28px; height: 28px; border-radius: 8px; }
  .pill .x { margin-left: 4px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; color: #8d8fa0; font-size: 15px; }
  .pill .x:hover { background: rgba(255,255,255,.1); color: #fff; }
  .back { position: fixed; inset: 0; z-index: 2147483647; background: rgba(5,6,10,.55); display: grid; place-items: center; animation: fade .2s both; }
  .modal { width: 400px; max-width: calc(100vw - 32px); max-height: min(640px, calc(100vh - 48px)); display: flex; flex-direction: column;
    background: #15161f; color: #f1f2f6; border-radius: 22px; border: 1px solid rgba(255,255,255,.08); box-shadow: 0 30px 80px rgba(0,0,0,.5);
    animation: in .4s cubic-bezier(.2,.9,.25,1.1) both; overflow: hidden; }
  .head { display: flex; align-items: center; gap: 12px; padding: 18px 18px 12px; }
  .head img { width: 34px; height: 34px; border-radius: 9px; }
  .head h2 { margin: 0; font-size: 16px; line-height: 20px; font-weight: 700; letter-spacing: -.01em; }
  .head p { margin: 2px 0 0; font-size: 12px; color: #8d8fa0; }
  .tools { display: flex; gap: 8px; padding: 0 18px 10px; }
  .tools input { flex: 1; height: 34px; padding: 0 12px; border-radius: 10px; border: none; background: rgba(255,255,255,.07); color: #fff; font-size: 12.5px; outline: none; }
  .tools input:focus { box-shadow: 0 0 0 2px #8b7fff; }
  .tools button { height: 34px; padding: 0 12px; border-radius: 10px; border: none; background: rgba(255,255,255,.07); color: #f1f2f6; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .tools button:hover { background: rgba(255,255,255,.12); }
  .list { flex: 1; overflow-y: auto; padding: 0 8px; margin: 0 10px; background: rgba(255,255,255,.03); border-radius: 14px; }
  .list::-webkit-scrollbar { width: 8px; } .list::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 8px; border: 2px solid #15161f; }
  .row { display: flex; align-items: center; gap: 12px; padding: 8px 6px; border-radius: 10px; cursor: pointer; }
  .row:hover { background: rgba(255,255,255,.05); }
  .row + .row { border-top: 1px solid rgba(255,255,255,.05); }
  .row.has { opacity: .45; cursor: default; }
  .av { width: 32px; height: 32px; border-radius: 50%; background: #25243f; color: #8b7fff; display: grid; place-items: center; font-weight: 700; font-size: 13px; overflow: hidden; flex-shrink: 0; }
  .av img { width: 100%; height: 100%; object-fit: cover; }
  .nm { flex: 1; min-width: 0; }
  .nm b { display: block; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .nm span { font-size: 11.5px; color: #8d8fa0; }
  .ck { width: 20px; height: 20px; border-radius: 6px; border: 2px solid rgba(255,255,255,.25); display: grid; place-items: center; flex-shrink: 0; transition: background .15s, border-color .15s; }
  .row.on .ck { background: #8b7fff; border-color: #8b7fff; }
  .row.on .ck::after { content: ""; width: 9px; height: 5px; border-left: 2px solid #0b0c14; border-bottom: 2px solid #0b0c14; transform: rotate(-45deg) translate(1px,-1px); }
  .foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px 18px; }
  .foot .note { font-size: 11.5px; color: #8d8fa0; flex: 1; min-width: 0; }
  .foot > div { display: flex; gap: 8px; flex-shrink: 0; }
  .foot button { height: 38px; padding: 0 18px; border-radius: 12px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; }
  .go { background: #8b7fff; color: #0b0c14; }
  .go:disabled { opacity: .5; cursor: default; }
  .cancel { background: transparent; color: #a3a5b2; }
  .cancel:hover { color: #fff; }
  .msg { padding: 28px 18px; text-align: center; color: #a3a5b2; font-size: 13px; line-height: 18px; }
  .msg b { display: block; color: #fff; font-size: 15px; margin-bottom: 4px; }
  @keyframes in { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .pill, .modal, .back { animation: none; } }`;

  let hostEl = null;
  let root = null;
  let dismissedFor = null;

  function ensureRoot() {
    if (!hostEl) {
      hostEl = document.createElement("canais-import");
      root = hostEl.attachShadow({ mode: "closed" });
      const st = document.createElement("style");
      st.textContent = CSS;
      root.append(st);
    }
    if (!hostEl.isConnected) document.documentElement.appendChild(hostEl);
  }

  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function logoUrl() {
    try {
      return chrome.runtime.getURL("icons/icon48.png");
    } catch (_) {
      return "";
    }
  }

  function clearUi() {
    if (root) [...root.children].forEach((c) => c.tagName !== "STYLE" && c.remove());
  }

  function showPill() {
    const kind = pageKind();
    if (!kind || dismissedFor === location.pathname) return;
    ensureRoot();
    clearUi();
    const pill = h("button", "pill");
    const img = h("img");
    img.src = logoUrl();
    img.alt = "";
    const label = h("span", "", kind === "hint" ? "Importar inscrições pro Canais" : "Importar canais pro Canais");
    const x = h("span", "x", "×");
    x.title = "Fechar";
    pill.append(img, label, x);
    x.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissedFor = location.pathname;
      clearUi();
    });
    pill.addEventListener("click", () => {
      if (kind === "hint") {
        location.href = "https://www.youtube.com/feed/channels";
        return;
      }
      startImport(label);
    });
    root.append(pill);
  }

  let importing = false;
  async function startImport(label) {
    if (importing) return;
    importing = true;
    try {
      await runImport(label);
    } finally {
      importing = false;
    }
  }

  async function runImport(label) {
    label.textContent = "Carregando sua lista…";
    const list = await loadAll((n) => (label.textContent = `Carregando… ${n} canais`));
    let existing = new Set();
    try {
      const r = await chrome.storage.local.get("channels");
      existing = new Set((r.channels || []).map((c) => `${c.platform || "youtube"}:${c.handle}`.toLowerCase()));
    } catch (_) {}
    openModal(list, existing);
  }

  function openModal(list, existing) {
    clearUi();
    const back = h("div", "back");
    const modal = h("div", "modal");
    back.append(modal);
    back.addEventListener("click", (e) => {
      if (e.target === back) close();
    });
    const close = () => {
      clearUi();
      if (pageKind()) showPill();
    };

    const head = h("div", "head");
    const logo = h("img");
    logo.src = logoUrl();
    logo.alt = "";
    const titles = h("div");
    const label = { youtube: "YouTube", twitch: "Twitch", kick: "Kick" }[platform];
    titles.append(h("h2", "", "Importar pro Canais"), h("p", "", `${list.length} canais encontrados na ${label}`));
    head.append(logo, titles);
    modal.append(head);

    if (!list.length) {
      const m = h("div", "msg");
      m.append(h("b", "", "Não achei canais nesta página"), document.createTextNode("Confira se você está logado e se a lista de canais seguidos apareceu. Se o site mudou o layout, adicione pelo popup."));
      const foot = h("div", "foot");
      const ok = h("button", "cancel", "Fechar");
      ok.onclick = close;
      foot.append(h("span"), ok);
      modal.append(m, foot);
      root.append(back);
      return;
    }

    const selected = new Set(list.filter((c) => !existing.has(`${platform}:${c.handle}`.toLowerCase())).map((c) => c.handle));
    const tools = h("div", "tools");
    const search = h("input");
    search.placeholder = "Buscar";
    const toggle = h("button", "", "Desmarcar todos");
    tools.append(search, toggle);
    const box = h("div", "list");
    const foot = h("div", "foot");
    const note = h("span", "note");
    const btns = h("div");
    const cancel = h("button", "cancel", "Cancelar");
    const go = h("button", "go");
    btns.append(cancel, go);
    foot.append(note, btns);
    modal.append(tools, box, foot);

    const rows = [];
    for (const c of list) {
      const has = existing.has(`${platform}:${c.handle}`.toLowerCase());
      const row = h("div", "row" + (has ? " has" : "") + (selected.has(c.handle) ? " on" : ""));
      const av = h("div", "av");
      if (c.avatar) {
        const im = h("img");
        im.src = c.avatar;
        im.alt = "";
        im.onerror = () => (av.textContent = c.handle.replace("@", "").charAt(0).toUpperCase());
        av.append(im);
      } else av.textContent = c.handle.replace("@", "").charAt(0).toUpperCase();
      const nm = h("div", "nm");
      nm.append(h("b", "", c.name), h("span", "", has ? `${c.handle} · já está na lista` : c.handle));
      row.append(av, nm, h("span", "ck"));
      if (!has)
        row.addEventListener("click", () => {
          if (selected.has(c.handle)) selected.delete(c.handle);
          else selected.add(c.handle);
          row.classList.toggle("on", selected.has(c.handle));
          refresh();
        });
      rows.push({ row, text: `${c.name} ${c.handle}`.toLowerCase() });
      box.append(row);
    }
    function refresh() {
      go.textContent = selected.size ? `Importar ${selected.size}` : "Importar";
      go.disabled = !selected.size;
      note.textContent = existing.size ? "Os que já estão na lista ficam de fora." : "";
      toggle.textContent = selected.size ? "Desmarcar todos" : "Marcar todos";
    }
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      for (const r of rows) r.row.style.display = !q || r.text.includes(q) ? "" : "none";
    });
    toggle.addEventListener("click", () => {
      const markAll = !selected.size;
      for (const c of list) {
        if (existing.has(`${platform}:${c.handle}`.toLowerCase())) continue;
        if (markAll) selected.add(c.handle);
        else selected.delete(c.handle);
      }
      rows.forEach((r, i) => r.row.classList.toggle("on", selected.has(list[i].handle)));
      refresh();
    });
    cancel.onclick = close;
    go.onclick = () => {
      go.disabled = true;
      go.textContent = "Importando…";
      const payload = list.filter((c) => selected.has(c.handle)).map((c) => ({ platform, handle: c.handle }));
      try {
        chrome.runtime.sendMessage({ type: "IMPORT_CHANNELS", channels: payload }, (res) => {
          void chrome.runtime.lastError;
          modal.innerHTML = "";
          const m = h("div", "msg");
          const n = res && typeof res.added === "number" ? res.added : 0;
          m.append(
            h("b", "", res && !res.error ? `${n} ${n === 1 ? "canal importado" : "canais importados"}` : "Não deu pra importar"),
            document.createTextNode(res && !res.error ? "Pronto! Eles já aparecem no Canais e vão ser verificados agora." : "Recarregue a página e tente de novo.")
          );
          const f = h("div", "foot");
          const ok = h("button", "go", "Fechar");
          ok.onclick = () => {
            clearUi();
            dismissedFor = location.pathname;
          };
          f.append(h("span"), ok);
          modal.append(m, f);
        });
      } catch (_) {
        go.textContent = "Erro. Recarregue a página";
      }
    };
    refresh();
    root.append(back);
    search.focus();
  }

  let lastPath = null;
  function check() {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    const kind = pageKind();
    if (!kind) {
      clearUi();
      return;
    }
    if (dismissedFor === location.pathname) return;
    setTimeout(showPill, 900);
  }
  setInterval(check, 1000);
  check();
})();
