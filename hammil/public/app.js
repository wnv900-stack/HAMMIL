const form = document.querySelector("#link-form");
const input = document.querySelector("#video-url");
const button = document.querySelector("#submit-btn");
const result = document.querySelector("#result");
const preview = document.querySelector("#preview");
const platformName = document.querySelector("#platform-name");
const message = document.querySelector("#result-message");
const openLink = document.querySelector("#open-link");
const downloadLink = document.querySelector("#download-link");

document.querySelector("#year").textContent = new Date().getFullYear();

function safeLink(value) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) ? u : null;
  } catch { return null; }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = safeLink(input.value.trim());
  if (!url) {
    alert("تأكد من إدخال رابط يبدأ بـ https:// أو http://");
    return;
  }

  button.disabled = true;
  button.querySelector("span").textContent = "جارٍ الفحص...";
  result.classList.add("hidden");
  preview.replaceChildren();

  try {
    const response = await fetch("/api/inspect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.href })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "تعذر فحص الرابط.");

    platformName.textContent = data.platform;
    message.textContent = data.message;
    openLink.href = data.originalUrl;

    if (data.previewType === "iframe" && data.embedUrl) {
      const frame = document.createElement("iframe");
      frame.src = data.embedUrl;
      frame.title = "معاينة الفيديو";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      preview.append(frame);
    } else if (data.previewType === "direct-media") {
      const media = document.createElement("video");
      media.src = data.originalUrl;
      media.controls = true;
      media.preload = "metadata";
      preview.append(media);
      downloadLink.href = data.originalUrl;
      downloadLink.classList.remove("hidden");
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "preview-placeholder";
      placeholder.textContent = "المعاينة تعتمد على دعم المنصة وإعدادات خصوصية المقطع.";
      preview.append(placeholder);
      downloadLink.classList.add("hidden");
    }

    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    alert(error.message || "حدث خطأ غير متوقع.");
  } finally {
    button.disabled = false;
    button.querySelector("span").textContent = "معاينة الرابط";
  }
});
