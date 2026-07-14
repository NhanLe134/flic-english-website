// Override native window.alert with a premium custom overlay modal
if (typeof window !== "undefined") {
  window.alert = function (message) {
    const overlay = document.createElement("div");
    overlay.className = "global-alert-overlay-bg";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "999999";
    overlay.style.fontFamily = "'Segoe UI', Roboto, sans-serif";

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "24px 32px";
    box.style.borderRadius = "16px";
    box.style.width = "fit-content";
    box.style.minWidth = "320px";
    box.style.maxWidth = "480px";
    box.style.textAlign = "center";
    box.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    
    // Inject animation styles
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @keyframes globalAlertScaleIn {
        from { transform: scale(0.85); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(styleEl);
    box.style.animation = "globalAlertScaleIn 0.2s ease-out forwards";

    const title = document.createElement("h3");
    title.innerText = "Thông báo";
    title.style.margin = "0 0 12px 0";
    title.style.color = "#000080";
    title.style.fontSize = "18px";
    title.style.fontWeight = "700";

    const text = document.createElement("p");
    text.innerText = message;
    text.style.margin = "0 0 20px 0";
    text.style.color = "#334155";
    text.style.fontSize = "14px";
    text.style.lineHeight = "1.6";
    text.style.fontWeight = "600";

    const btn = document.createElement("button");
    btn.innerText = "Đóng";
    btn.style.background = "#F95800";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.padding = "8px 28px";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "600";
    btn.style.boxShadow = "0 2px 4px rgba(249, 88, 0, 0.2)";
    btn.style.transition = "background 0.2s, transform 0.1s";
    
    btn.onmouseover = () => btn.style.background = "#e04f00";
    btn.onmouseout = () => btn.style.background = "#F95800";
    btn.onmousedown = () => btn.style.transform = "scale(0.95)";
    btn.onmouseup = () => btn.style.transform = "scale(1)";
    btn.onclick = () => {
      document.body.removeChild(overlay);
      document.head.removeChild(styleEl);
    };

    box.appendChild(title);
    box.appendChild(text);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  };
}

if (typeof window !== "undefined") {
  (window as any).showGlobalErrorPopup = function (titleText: string, messageText: string, detailsText?: string) {
    if (document.getElementById("global-error-overlay-container")) return;

    const overlay = document.createElement("div");
    overlay.id = "global-error-overlay-container";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.55)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999999";
    overlay.style.fontFamily = "'Segoe UI', Roboto, sans-serif";

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "28px 32px";
    box.style.borderRadius = "16px";
    box.style.width = "90%";
    box.style.maxWidth = "540px";
    box.style.boxShadow = "0 15px 35px rgba(239, 68, 68, 0.25)";
    box.style.borderTop = "6px solid #ef4444";
    
    if (!document.getElementById("global-error-anim-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "global-error-anim-styles";
      styleEl.innerHTML = `
        @keyframes globalErrorScaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(styleEl);
    }
    box.style.animation = "globalErrorScaleIn 0.2s ease-out forwards";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.marginBottom = "16px";
    header.style.gap = "12px";

    const icon = document.createElement("span");
    icon.innerText = "🚨";
    icon.style.fontSize = "28px";

    const title = document.createElement("h3");
    title.innerText = titleText || "Hệ thống gặp sự cố";
    title.style.margin = "0";
    title.style.color = "#dc2626";
    title.style.fontSize = "20px";
    title.style.fontWeight = "700";

    header.appendChild(icon);
    header.appendChild(title);
    box.appendChild(header);

    const desc = document.createElement("p");
    desc.innerText = messageText || "Đã xảy ra lỗi không mong muốn trong quá trình vận hành.";
    desc.style.margin = "0 0 16px 0";
    desc.style.color = "#1e293b";
    desc.style.fontSize = "14.5px";
    desc.style.lineHeight = "1.5";
    desc.style.fontWeight = "600";
    box.appendChild(desc);

    if (detailsText) {
      const detailsTitle = document.createElement("div");
      detailsTitle.innerText = "Chi tiết kỹ thuật:";
      detailsTitle.style.fontSize = "12.5px";
      detailsTitle.style.fontWeight = "700";
      detailsTitle.style.color = "#64748b";
      detailsTitle.style.marginBottom = "6px";
      box.appendChild(detailsTitle);

      const detailsBox = document.createElement("pre");
      detailsBox.innerText = detailsText;
      detailsBox.style.margin = "0 0 24px 0";
      detailsBox.style.padding = "12px";
      detailsBox.style.background = "#f8fafc";
      detailsBox.style.border = "1px solid #e2e8f0";
      detailsBox.style.borderRadius = "8px";
      detailsBox.style.fontSize = "12px";
      detailsBox.style.color = "#0f172a";
      detailsBox.style.overflowX = "auto";
      detailsBox.style.maxHeight = "150px";
      detailsBox.style.overflowY = "auto";
      detailsBox.style.whiteSpace = "pre-wrap";
      detailsBox.style.wordBreak = "break-all";
      detailsBox.style.fontFamily = "Consolas, Monaco, monospace";
      box.appendChild(detailsBox);
    }

    const footer = document.createElement("div");
    footer.style.display = "flex";
    footer.style.justifyContent = "flex-end";

    const btn = document.createElement("button");
    btn.innerText = "Bỏ qua & Đóng";
    btn.style.background = "#dc2626";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.padding = "10px 24px";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "600";
    btn.style.boxShadow = "0 2px 5px rgba(220, 38, 38, 0.3)";
    btn.style.transition = "background 0.2s, transform 0.1s";
    
    btn.onmouseover = () => btn.style.background = "#b91c1c";
    btn.onmouseout = () => btn.style.background = "#dc2626";
    btn.onmousedown = () => btn.style.transform = "scale(0.96)";
    btn.onmouseup = () => btn.style.transform = "scale(1)";
    btn.onclick = () => {
      document.body.removeChild(overlay);
    };

    footer.appendChild(btn);
    box.appendChild(footer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  };

  // Intercept Global Errors
  window.addEventListener("error", (event) => {
    if (event.message) {
      (window as any).showGlobalErrorPopup(
        "Sự cố hệ thống",
        `Phát hiện lỗi runtime: ${event.message}`,
        `Tệp tin: ${event.filename}\nDòng: ${event.lineno}, Cột: ${event.colno}`
      );
    }
  });

  // Intercept Unhandled Promise Rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason);
    const stack = reason?.stack || "";
    (window as any).showGlobalErrorPopup(
      "Sự cố bất đồng bộ",
      `Phát hiện lỗi Unhandled Promise Rejection: ${msg}`,
      stack || "Không có stack trace."
    );
  });

  // Intercept Global Fetch API calls
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    try {
      const response = await originalFetch(...args);
      if (!response.ok && response.status >= 500) {
        const clonedResponse = response.clone();
        const errorText = await clonedResponse.text().catch(() => "Không có thông tin lỗi chi tiết.");
        (window as any).showGlobalErrorPopup(
          `Lỗi phản hồi máy chủ (${response.status})`,
          `Yêu cầu tới API gặp sự cố phản hồi không hợp lệ.`,
          `API URL: ${response.url}\n\nChi tiết phản hồi từ máy chủ:\n${errorText}`
        );
      }
      return response;
    } catch (error: any) {
      (window as any).showGlobalErrorPopup(
        "Lỗi Kết Nối Mạng",
        `Không thể gửi yêu cầu đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn hoặc liên hệ quản trị viên.`,
        `Chi tiết sự cố:\n${error.message || String(error)}`
      );
      throw error;
    }
  };
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
