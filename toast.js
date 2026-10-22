(() => {
  if (window.__canaisToast) return;
  window.__canaisToast = true;

  const CSS = `
  :host { all: initial; }
  .wrap { position: fixed; top: 20px; right: 20px; z-index: 2147483647; display: flex; flex-direction: column; gap: 10px; pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif; }
  .card { pointer-events: auto; cursor: pointer; position: relative; display: flex; align-items: center; gap: 14px; width: 320px; box-sizing: border-box;
    padding: 14px 18px 14px 14px; border-radius: 20px; background: rgba(11,12,20,.92); color: #f1f2f6;
    border: 1px solid rgba(255,255,255,.09); box-shadow: 0 18px 50px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.25);
    -webkit-backdrop-filter: blur(18px) saturate(1.4); backdrop-filter: blur(18px) saturate(1.4);
    animation: card-in .55s cubic-bezier(.2,.9,.25,1.15) both; overflow: visible; }
  .card.out { animation: card-out .38s cubic-bezier(.4,0,.6,1) both; }
  .badge { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
  .badge img, .badge .img { position: relative; z-index: 2; width: 60px; height: 60px; display: block; animation: pop .7s cubic-bezier(.2,.9,.25,1.3) .12s both; }
  .ring { position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #8b7fff; opacity: 0; z-index: 1; animation: ring 1.1s ease-out .35s both; }
  .ring.r2 { border-color: #ff5c9d; animation-delay: .55s; }
  .bit { position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3.5px; border-radius: 2px; z-index: 3; opacity: 0;
    animation: burst .9s cubic-bezier(.15,.7,.3,1) .3s both; }
  .bit.round { border-radius: 50%; }
  .txt { min-width: 0; }
  .kicker { font-size: 10.5px; line-height: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #8b7fff; margin-bottom: 3px;
    animation: rise .45s ease-out .25s both; }
  .title { font-size: 15px; line-height: 19px; font-weight: 700; letter-spacing: -0.01em; color: #fff; animation: rise .45s ease-out .32s both; }
  .desc { font-size: 12px; line-height: 16px; color: #a3a5b2; margin-top: 2px; animation: rise .45s ease-out .38s both;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .more { position: absolute; right: 12px; top: 10px; font-size: 11px; font-weight: 700; color: #ff5c9d; }
  .timer { position: absolute; left: 18px; right: 18px; bottom: 6px; height: 2px; border-radius: 2px; background: rgba(255,255,255,.08); overflow: hidden; }
  .timer b { display: block; height: 100%; background: #8b7fff; transform-origin: left; animation: timer var(--dur) linear both; }
  .card:hover .timer b { animation-play-state: paused; }
  @keyframes card-in { from { opacity: 0; transform: translateY(-14px) scale(.96); } to { opacity: 1; transform: none; } }
  @keyframes card-out { to { opacity: 0; transform: translateY(-10px) scale(.97); } }
  @keyframes pop { 0% { opacity: 0; transform: scale(.3) rotate(-24deg); } 60% { opacity: 1; transform: scale(1.14) rotate(6deg); } 100% { transform: scale(1) rotate(0); } }
  @keyframes ring { 0% { opacity: .9; transform: scale(.7); } 100% { opacity: 0; transform: scale(1.5); } }
  @keyframes burst { 0% { opacity: 1; transform: translate(0,0) rotate(0) scale(1); } 100% { opacity: 0; transform: translate(var(--x), var(--y)) rotate(var(--r)) scale(.6); } }
  @keyframes rise { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
  @keyframes timer { from { transform: scaleX(1); } to { transform: scaleX(0); } }
  @media (prefers-reduced-motion: reduce) {
    .card, .card.out, .badge img, .badge .img, .kicker, .title, .desc { animation-duration: .01s !important; animation-delay: 0s !important; }
    .bit, .ring { display: none; }
  }`;

  let host = null;
  let root = null;
  let wrap = null;
  const queue = [];
  let showing = false;

  function mountPoint() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.documentElement;
  }

  function ensureHost() {
    if (!host) {
      host = document.createElement("canais-toast");
      root = host.attachShadow({ mode: "closed" });
      const style = document.createElement("style");
      style.textContent = CSS;
      wrap = document.createElement("div");
      wrap.className = "wrap";
      root.append(style, wrap);
    }
    const target = mountPoint();
    if (host.parentNode !== target) target.appendChild(host);
  }

  document.addEventListener("fullscreenchange", () => host && host.isConnected && ensureHost());

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function showOne(item, extra) {
    ensureHost();
    const dur = 5200;
    const card = el("div", "card");
    card.style.setProperty("--dur", dur + "ms");
    const badge = el("div", "badge");
    let img = document.createElement("img");
    img.alt = "";
    if (item.svg) {
      try {
        const doc = new DOMParser().parseFromString(item.svg, "image/svg+xml");
        const s = doc.documentElement;
        if (s && s.nodeName.toLowerCase() === "svg") {
          s.querySelectorAll("script,foreignObject").forEach((n) => n.remove());
          img = document.importNode(s, true);
          img.setAttribute("class", "img");
        }
      } catch (_) {}
    } else {
      try {
        img.src = chrome.runtime.getURL(`badges/${item.icon}.svg`);
      } catch (_) {}
    }
    badge.append(el("span", "ring"), el("span", "ring r2"), img);
    const colors = ["#3ee8ff", "#5b4bff", "#ff3d8b", "#8b7fff", "#ffffff"];
    for (let i = 0; i < 16; i++) {
      const bit = el("span", "bit" + (i % 3 === 0 ? " round" : ""));
      const ang = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.5;
      const dist = 38 + Math.random() * 34;
      bit.style.setProperty("--x", `${Math.cos(ang) * dist}px`);
      bit.style.setProperty("--y", `${Math.sin(ang) * dist}px`);
      bit.style.setProperty("--r", `${Math.round(Math.random() * 360)}deg`);
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = `${0.28 + Math.random() * 0.12}s`;
      badge.append(bit);
    }
    const txt = el("div", "txt");
    txt.append(el("div", "kicker", item.kicker || "Conquista desbloqueada"), el("div", "title", item.title || ""), el("div", "desc", item.desc || ""));
    card.append(badge, txt);
    if (extra > 0) card.append(el("div", "more", `+${extra}`));
    const timer = el("div", "timer");
    timer.append(el("b"));
    card.append(timer);
    wrap.append(card);

    return new Promise((resolve) => {
      let left = dur;
      let started = Date.now();
      let t = null;
      const close = () => {
        clearTimeout(t);
        card.classList.add("out");
        setTimeout(() => {
          card.remove();
          resolve();
        }, 380);
      };
      const arm = () => {
        started = Date.now();
        t = setTimeout(close, left);
      };
      card.addEventListener("mouseenter", () => {
        clearTimeout(t);
        left -= Date.now() - started;
      });
      card.addEventListener("mouseleave", arm);
      card.addEventListener("click", close);
      arm();
    });
  }

  async function drain() {
    if (showing) return;
    showing = true;
    while (queue.length) {
      const item = queue.shift();
      const extra = queue.length > 2 ? queue.length : 0;
      await showOne(item, extra);
      if (extra) queue.length = 0;
    }
    showing = false;
  }

  try {
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg && msg.type === "SHOW_BADGES" && Array.isArray(msg.items)) {
        if (document.visibilityState === "hidden") {
          sendResponse({ shown: false });
          return;
        }
        queue.push(...msg.items.slice(0, 10));
        drain();
        sendResponse({ shown: true });
      }
    });
  } catch (_) {}
})();
