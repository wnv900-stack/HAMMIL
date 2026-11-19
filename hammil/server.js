const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MAX_LINK_LENGTH = Number(process.env.MAX_LINK_LENGTH || 2048);

app.disable("x-powered-by");
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: [
        "'self'",
        "https://www.youtube-nocookie.com",
        "https://www.youtube.com",
        "https://www.tiktok.com",
        "https://www.instagram.com",
        "https://www.snapchat.com"
      ],
      mediaSrc: ["'self'", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: "10kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));

const platformHosts = [
  { name: "TikTok", test: h => h === "tiktok.com" || h.endsWith(".tiktok.com") },
  { name: "Instagram", test: h => h === "instagram.com" || h.endsWith(".instagram.com") },
  { name: "Snapchat", test: h => h === "snapchat.com" || h.endsWith(".snapchat.com") },
  { name: "YouTube", test: h => ["youtube.com", "youtu.be", "youtube-nocookie.com"].some(d => h === d || h.endsWith("." + d)) },
  { name: "Facebook", test: h => h === "facebook.com" || h.endsWith(".facebook.com") || h === "fb.watch" },
  { name: "X", test: h => h === "x.com" || h.endsWith(".x.com") || h === "twitter.com" || h.endsWith(".twitter.com") },
  { name: "Pinterest", test: h => h === "pinterest.com" || h.endsWith(".pinterest.com") || h === "pin.it" },
  { name: "Reddit", test: h => h === "reddit.com" || h.endsWith(".reddit.com") }
];

function identifyPlatform(host) {
  return platformHosts.find(p => p.test(host))?.name || "رابط خارجي";
}

function getYouTubeId(url) {
  const host = url.hostname.toLowerCase();
  let id = "";
  if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
  else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/") || url.pathname.startsWith("/live/")) {
    id = url.pathname.split("/")[2] || "";
  } else id = url.searchParams.get("v") || "";
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
}

function isDirectMedia(url) {
  return /\.(mp4|webm|mov|m4v|mp3|m4a|wav|ogg)$/i.test(url.pathname);
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "HAMMIL API" }));

app.post("/api/inspect", (req, res) => {
  const raw = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  if (!raw || raw.length > MAX_LINK_LENGTH) {
    return res.status(400).json({ error: "أدخل رابطاً صحيحاً بطول مناسب." });
  }

  let url;
  try { url = new URL(raw); } catch {
    return res.status(400).json({ error: "صيغة الرابط غير صحيحة." });
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    return res.status(400).json({ error: "هذا النوع من الروابط غير مسموح." });
  }

  const platform = identifyPlatform(url.hostname.toLowerCase());
  const result = {
    platform,
    originalUrl: url.toString(),
    isDirectMedia: isDirectMedia(url),
    previewType: "link",
    embedUrl: null,
    message: "يمكن فتح الرابط الأصلي. التنزيل يعتمد على صلاحيات المنصة ونوع الرابط."
  };

  if (platform === "YouTube") {
    const id = getYouTubeId(url);
    if (id) {
      result.previewType = "iframe";
      result.embedUrl = `https://www.youtube-nocookie.com/embed/${id}`;
      result.message = "معاينة YouTube متاحة. استخدم خيارات YouTube الرسمية لتنزيل المحتوى عندما تكون متاحة لحسابك.";
    }
  } else if (platform === "TikTok") {
    result.previewType = "official-embed";
    result.message = "افتح المقطع أو استخدم مشاركة/تضمين TikTok. لا يمكن تنزيل كل المقاطع؛ يعتمد ذلك على إعدادات صاحب المحتوى.";
  } else if (platform === "Instagram") {
    result.previewType = "official-embed";
    result.message = "قد تتوفر معاينة للمحتوى العام عبر تضمين Instagram. المحتوى الخاص أو المحمي غير متاح.";
  } else if (platform === "Snapchat") {
    result.previewType = "official-embed";
    result.message = "تتوفر المعاينة فقط للروابط العامة التي تسمح بها Snapchat.";
  } else if (result.isDirectMedia) {
    result.previewType = "direct-media";
    result.message = "يبدو أنه رابط ملف وسائط مباشر. جرّب تشغيله ثم استخدم قائمة المشغل للتنزيل إذا كان المصدر يسمح بذلك.";
  }

  res.json(result);
});

app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "المسار غير موجود." });
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`HAMMIL running at http://localhost:${PORT}`);
});
