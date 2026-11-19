
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>حَمِّل | HAMMIL</title>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #080b09;
  color: white;
  font-family: Arial, sans-serif;
  min-height: 100vh;
}

header {
  padding: 25px 8%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1c2920;
}

.logo {
  font-size: 30px;
  font-weight: bold;
  color: #20e878;
}

.logo span {
  color: white;
}

.hero {
  text-align: center;
  padding: 90px 20px 35px;
}

.hero h1 {
  font-size: 45px;
  margin-bottom: 18px;
}

.hero h1 span {
  color: #20e878;
}

.hero p {
  color: #999;
  font-size: 16px;
  line-height: 1.8;
}

.container {
  max-width: 750px;
  margin: 20px auto;
  padding: 0 20px;
}

.download-box {
  background: #111713;
  border: 1px solid #263b2d;
  padding: 25px;
  border-radius: 18px;
}

.input-area {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  min-width: 0;
  background: #080b09;
  color: white;
  border: 1px solid #34443a;
  padding: 17px;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  direction: ltr;
}

input:focus {
  border-color: #20e878;
}

button {
  background: #20e878;
  color: #06140b;
  border: none;
  padding: 0 25px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  font-size: 15px;
}

button:hover {
  background: #13c961;
}

.platforms {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 35px;
}

.platform {
  background: #111713;
  border: 1px solid #25352b;
  padding: 18px 8px;
  border-radius: 12px;
  text-align: center;
  color: #ccc;
  font-size: 14px;
}

.platform b {
  display: block;
  font-size: 23px;
  margin-bottom: 9px;
}

.result {
  display: none;
  background: #111713;
  margin-top: 20px;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
}

.result iframe {
  width: 100%;
  max-width: 450px;
  height: 350px;
  border: none;
  border-radius: 12px;
  margin: 15px auto;
}

.result a {
  color: #20e878;
  display: inline-block;
  margin: 12px;
}

.notice {
  color: #aaa;
  font-size: 13px;
  line-height: 1.8;
  margin-top: 18px;
}

footer {
  text-align: center;
  color: #666;
  padding: 45px 10px;
}

@media(max-width:550px) {
  .hero h1 {font-size: 34px;}
  .input-area {flex-direction: column;}
  button {padding: 16px;}
  .platforms {grid-template-columns: repeat(2, 1fr);}
}
</style>
</head>

<body>

<header>
  <div class="logo">حَمِّل <span>HAMMIL.</span></div>
  <div style="color:#20e878">تحميل سريع وسهل</div>
</header>

<section class="hero">
  <h1>كل مقاطعك في <span>مكان واحد</span></h1>
  <p>
    ضع رابط المقطع واستمتع بمعاينته.<br>
    منصات متعددة وتجربة استخدام سهلة.
  </p>
</section>

<div class="container">

  <div class="download-box">
    <div class="input-area">
      <input
        type="url"
        id="videoUrl"
        placeholder="ضع رابط الفيديو هنا..."
      >
      <button onclick="processLink()">عرض المقطع</button>
    </div>

    <div class="notice">
      يدعم التعرف على روابط TikTok وInstagram وSnapchat وYouTube.
    </div>
  </div>

  <div class="platforms">
    <div class="platform"><b>♪</b>TikTok</div>
    <div class="platform"><b>◎</b>Instagram</div>
    <div class="platform"><b>👻</b>Snapchat</div>
    <div class="platform"><b>▶</b>YouTube</div>
    <div class="platform"><b>▣</b>Reels</div>
    <div class="platform"><b>◉</b>Stories</div>
    <div class="platform"><b>▷</b>Shorts</div>
    <div class="platform"><b>＋</b>المزيد</div>
  </div>

  <div class="result" id="result">
    <h3 id="platformName">معاينة المقطع</h3>
    <div id="preview"></div>
    <p id="message" class="notice"></p>
    <div id="actions"></div>
  </div>

</div>

<footer>
  HAMMIL © 2026 — جميع الحقوق محفوظة
</footer>

<script>
function processLink() {
  const input = document.getElementById("videoUrl");
  const url = input.value.trim();

  if (!url) {
    alert("الرجاء وضع رابط أولاً");
    return;
  }

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    alert("الرابط غير صحيح");
    return;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    alert("نوع الرابط غير مدعوم");
    return;
  }

  const host = parsed.hostname.toLowerCase();
  let platform = "رابط خارجي";
  let embed = "";
  let direct = /\.(mp4|webm|ogg)(\?.*)?$/i.test(parsed.pathname);

  if (host.includes("youtube.com") ||
      host.includes("youtu.be")) {

    platform = "YouTube";

    let id = parsed.searchParams.get("v");

    if (host.includes("youtu.be")) {
      id = parsed.pathname.split("/")[1];
    }

    if (host.includes("youtube.com") &&
        parsed.pathname.startsWith("/shorts/")) {
      id = parsed.pathname.split("/")[2];
    }

    if (id && /^[\w-]{11}$/.test(id)) {
      embed = `<iframe src="https://www.youtube-nocookie.com/embed/${id}"
      allowfullscreen></iframe>`;
    }

  } else if (host.includes("tiktok.com")) {
    platform = "TikTok";

  } else if (host.includes("instagram.com")) {
    platform = "Instagram";

  } else if (host.includes("snapchat.com")) {
    platform = "Snapchat";
  }

  document.getElementById("result").style.display = "block";
  document.getElementById("platformName").textContent = platform;

  document.getElementById("preview").innerHTML = embed ||
    "<p class='notice'>المعاينة المباشرة غير متاحة لهذا الرابط في هذه النسخة.</p>";

  document.getElementById("message").textContent =
    direct
    ? "رابط ملف فيديو مباشر. تأكد من امتلاك حق تنزيله."
    : "يمكنك فتح المقطع الأصلي. تنزيل روابط المنصات يحتاج تكاملاً خلفياً معتمداً.";

  const actions = document.getElementById("actions");

  actions.innerHTML = "";

  const open = document.createElement("a");
  open.href = url;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  open.textContent = "فتح المقطع الأصلي";
  actions.appendChild(open);

  if (direct) {
    const download = document.createElement("a");
    download.href = url;
    download.download = "";
    download.textContent = "تنزيل ملف الفيديو";
    actions.appendChild(download);
  }
}
</script>

</body>
</html>
