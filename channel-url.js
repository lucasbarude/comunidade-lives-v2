const CANAIS_RESERVED = {
  twitch: new Set([
    "directory", "videos", "settings", "p", "search", "downloads", "jobs", "turbo", "subscriptions",
    "inventory", "wallet", "drops", "prime", "friends", "messages", "login", "signup", "following",
    "store", "payments", "moderator", "popout", "embed", "broadcast", "dashboard", "u", "team",
    "products", "bits", "redeem", "activate", "privacy", "legal", "creatorcamp",
  ]),
  kick: new Set([
    "categories", "category", "browse", "search", "following", "video", "videos", "clips", "clip",
    "dashboard", "settings", "login", "signup", "terms-of-service", "privacy-policy",
    "community-guidelines", "dmca-policy", "transparency", "contact", "about", "careers", "faq",
    "help", "subscriptions", "wallet", "messages", "notifications", "emotes", "explore", "home",
    "channels", "api", "popout", "stream", "kick-store",
  ]),
};

function parseChannelUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch (_) {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
  let parts;
  try {
    parts = u.pathname.split("/").filter(Boolean).map((p) => decodeURIComponent(p));
  } catch (_) {
    return null;
  }

  if (host === "youtube.com") {
    if (parts[0] && parts[0].startsWith("@") && parts[0].length > 1) {
      return { platform: "youtube", handle: parts[0] };
    }
    const resolvable =
      (parts[0] === "watch" && u.searchParams.get("v")) ||
      (["channel", "c", "user"].includes(parts[0]) && parts[1]) ||
      (["live", "shorts"].includes(parts[0]) && parts[1]);
    if (resolvable) return { platform: "youtube", needsResolve: true, url: u.href };
    return null;
  }
  if (host === "twitch.tv") {
    const name = (parts[0] || "").toLowerCase();
    if (!/^[a-z0-9_]{2,25}$/.test(name) || CANAIS_RESERVED.twitch.has(name)) return null;
    return { platform: "twitch", handle: name };
  }
  if (host === "kick.com") {
    const name = (parts[0] || "").toLowerCase();
    if (!/^[a-z0-9_-]{2,30}$/.test(name) || CANAIS_RESERVED.kick.has(name)) return null;
    return { platform: "kick", handle: name };
  }
  return null;
}

function findYoutubeHandleInHtml(html) {
  const patterns = [
    /"ownerProfileUrl"\s*:\s*"https?:\/\/www\.youtube\.com\/(@[^"\/?]+)"/,
    /<link itemprop="url" href="https?:\/\/www\.youtube\.com\/(@[^"\/?]+)"/,
    /"vanityChannelUrl"\s*:\s*"https?:\/\/www\.youtube\.com\/(@[^"\/?]+)"/,
    /"canonicalBaseUrl"\s*:\s*"\/(@[^"\/?]+)"/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      try {
        return decodeURIComponent(m[1].replace(/\\u0026/g, "&"));
      } catch (_) {
        return m[1];
      }
    }
  }
  return null;
}
