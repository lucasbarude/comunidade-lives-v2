(() => {
  if (window.__canaisChatCounter) return;
  window.__canaisChatCounter = true;

  const host = location.hostname;
  const platform = host.endsWith("twitch.tv") ? "twitch" : host.endsWith("kick.com") ? "kick" : host.endsWith("youtube.com") ? "youtube" : null;
  if (!platform) return;

  let enabled = true;
  let mentionOn = true;
  let nickRes = [];
  let nicks = [];

  function escapeRe(x) {
    return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function applySettings(st) {
    st = st || {};
    enabled = st.countChat !== false;
    mentionOn = st.mentionAlerts !== false;
    nicks = String(st.mentionNicks || "")
      .split(",")
      .map((n) => n.trim().replace(/^@/, ""))
      .filter((n) => n.length >= 2)
      .slice(0, 5);
    nickRes = nicks.map((n) => new RegExp(`(^|[^\\p{L}\\p{N}_])@?${escapeRe(n)}(?![\\p{L}\\p{N}_])`, "iu"));
  }

  try {
    chrome.storage.local.get("settings", (r) => applySettings(r && r.settings));
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.settings) applySettings(changes.settings.newValue);
    });
  } catch (_) {}

  const INPUTS = {
    youtube: "yt-live-chat-text-input-field-renderer #input, yt-live-chat-text-input-field-renderer [contenteditable]",
    twitch: '[data-a-target="chat-input"], [data-a-target="chat-input"] [contenteditable], textarea[data-a-target="chat-input"]',
    kick: '#message-input, [data-testid="chat-input"], [data-input="true"][contenteditable], div[contenteditable="true"][class*="chat" i]',
  };
  const SEND = {
    youtube: "#send-button button, #send-button yt-button-renderer, #send-button yt-icon-button",
    twitch: '[data-a-target="chat-send-button"]',
    kick: '#send-message-button, [data-testid="send-message-button"], button[aria-label*="send" i], button[aria-label*="enviar" i]',
  };

  function looksLikeChat(el) {
    let node = el;
    for (let i = 0; node && i < 8; i++, node = node.parentElement) {
      const sig = `${node.id || ""} ${typeof node.className === "string" ? node.className : ""} ${node.getAttribute ? node.getAttribute("data-a-target") || "" : ""}`;
      if (/chat/i.test(sig)) return true;
    }
    return false;
  }

  function isChatInput(el) {
    if (!el || !(el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "INPUT")) return false;
    try {
      if (el.matches(INPUTS[platform]) || el.closest(INPUTS[platform])) return true;
    } catch (_) {}
    return platform !== "youtube" && looksLikeChat(el);
  }

  function textOf(el) {
    if (!el) return "";
    const v = typeof el.value === "string" ? el.value : el.innerText || el.textContent || "";
    return v.replace(/\u200b/g, "").trim();
  }

  function context() {
    const parts = location.pathname.split("/").filter(Boolean);
    if (platform === "youtube") {
      let v = new URLSearchParams(location.search).get("v");
      if (!v) {
        try {
          v = new URL(document.referrer).searchParams.get("v");
        } catch (_) {}
      }
      return { videoId: v && /^[\w-]{11}$/.test(v) ? v : null };
    }
    let handle = parts[0] || "";
    if (handle === "popout" || handle === "embed") handle = parts[1] || "";
    return { handle: handle.toLowerCase() };
  }

  let last = 0;
  function sent() {
    const now = Date.now();
    if (now - last < 600) return;
    last = now;
    try {
      chrome.runtime.sendMessage({ type: "CHAT_SENT", platform, ...context() }, () => void chrome.runtime.lastError);
    } catch (_) {}
  }

  const MSG = {
    youtube: { item: "yt-live-chat-text-message-renderer", text: "#message", author: "#author-name" },
    twitch: { item: ".chat-line__message, [data-a-target='chat-line-message']", text: "[data-a-target='chat-line-message-body'], .message, [data-test-selector='chat-line-message-body']", author: ".chat-author__display-name, [data-a-target='chat-message-username']" },
    kick: { item: "[data-chat-entry], .chat-entry, [data-index] .group, div[class*='chat-entry' i]", text: ".chat-entry-content, [class*='message' i] span, span", author: ".chat-entry-username, [class*='username' i], button[title]" },
  };
  const ready = Date.now() + 4000;
  const seen = new WeakSet();
  let lastMention = 0;

  function checkMessage(node) {
    if (!mentionOn || !nickRes.length || Date.now() < ready || seen.has(node)) return;
    seen.add(node);
    const sel = MSG[platform];
    const textEl = node.querySelector(sel.text) || node;
    const authorEl = node.querySelector(sel.author);
    const author = authorEl ? (authorEl.getAttribute("title") || authorEl.textContent || "").trim().replace(/^@/, "").replace(/:$/, "") : "";
    let text = (textEl.innerText || textEl.textContent || "").trim();
    if (!text || text.length > 600) return;
    if (author && text.startsWith(author)) text = text.slice(author.length).replace(/^[:\s]+/, "");
    if (author && nicks.some((n) => n.toLowerCase() === author.toLowerCase())) return;
    if (!nickRes.some((re) => re.test(text))) return;
    const now = Date.now();
    if (now - lastMention < 4000) return;
    lastMention = now;
    try {
      chrome.runtime.sendMessage(
        { type: "CHAT_MENTION", platform, author: author.slice(0, 40), text: text.slice(0, 160), ...context() },
        () => void chrome.runtime.lastError
      );
    } catch (_) {}
  }

  const observer = new MutationObserver((muts) => {
    if (!mentionOn || !nickRes.length) return;
    const sel = MSG[platform].item;
    let count = 0;
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1 || ++count > 60) continue;
        try {
          if (n.matches(sel)) checkMessage(n);
          else n.querySelectorAll && n.querySelectorAll(sel).forEach((x) => checkMessage(x));
        } catch (_) {}
      }
    }
  });
  const startObserving = () => {
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) startObserving();
  else document.addEventListener("DOMContentLoaded", startObserving);

  document.addEventListener(
    "keydown",
    (e) => {
      if (!enabled || e.key !== "Enter" || e.shiftKey || e.isComposing) return;
      const el = e.target;
      if (!isChatInput(el)) return;
      if (!textOf(el)) return;
      sent();
    },
    true
  );

  document.addEventListener(
    "click",
    (e) => {
      if (!enabled) return;
      let btn = null;
      try {
        btn = e.target.closest(SEND[platform]);
      } catch (_) {}
      if (!btn) return;
      let input = null;
      try {
        input = document.querySelector(INPUTS[platform]);
      } catch (_) {}
      if (!textOf(input)) return;
      sent();
    },
    true
  );
})();
