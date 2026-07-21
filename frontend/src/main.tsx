if (typeof window !== "undefined") {
  window.alert = function (message) {
    const isAuthPrompt = typeof message === "string" && message.toLowerCase().includes("đăng nhập");

    const overlay = document.createElement("div");
    overlay.className = "global-alert-overlay-bg";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.45)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "999999";
    overlay.style.fontFamily = "'Segoe UI', Roboto, sans-serif";

    const box = document.createElement("div");
    box.style.position = "relative";
    box.style.background = "#fff";
    box.style.padding = "28px 32px";
    box.style.borderRadius = "16px";
    box.style.width = "fit-content";
    box.style.minWidth = "340px";
    box.style.maxWidth = "480px";
    box.style.textAlign = "center";
    box.style.boxShadow = "0 15px 35px rgba(0,0,0,0.18)";

    const closeAlert = () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };

    // Close X button
    const closeX = document.createElement("button");
    closeX.innerHTML = "&times;";
    closeX.style.position = "absolute";
    closeX.style.top = "10px";
    closeX.style.right = "14px";
    closeX.style.background = "none";
    closeX.style.border = "none";
    closeX.style.fontSize = "22px";
    closeX.style.color = "#94a3b8";
    closeX.style.cursor = "pointer";
    closeX.onclick = closeAlert;
    box.appendChild(closeX);
    
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
    title.style.fontSize = "19px";
    title.style.fontWeight = "700";

    const text = document.createElement("p");
    text.innerText = message;
    text.style.margin = "0 0 24px 0";
    text.style.color = "#334155";
    text.style.fontSize = "14.5px";
    text.style.lineHeight = "1.6";
    text.style.fontWeight = "600";

    box.appendChild(title);
    box.appendChild(text);

    if (isAuthPrompt) {
      const btnGroup = document.createElement("div");
      btnGroup.style.display = "flex";
      btnGroup.style.justifyContent = "center";
      btnGroup.style.gap = "12px";

      const loginBtn = document.createElement("button");
      loginBtn.innerText = "Đăng Nhập";
      loginBtn.style.background = "#F95800";
      loginBtn.style.color = "#fff";
      loginBtn.style.border = "none";
      loginBtn.style.padding = "10px 24px";
      loginBtn.style.borderRadius = "8px";
      loginBtn.style.cursor = "pointer";
      loginBtn.style.fontSize = "14px";
      loginBtn.style.fontWeight = "700";
      loginBtn.style.boxShadow = "0 3px 8px rgba(249, 88, 0, 0.25)";
      loginBtn.style.transition = "background 0.2s, transform 0.1s";
      loginBtn.onmouseover = () => loginBtn.style.background = "#e04f00";
      loginBtn.onmouseout = () => loginBtn.style.background = "#F95800";
      loginBtn.onmousedown = () => loginBtn.style.transform = "scale(0.95)";
      loginBtn.onmouseup = () => loginBtn.style.transform = "scale(1)";
      loginBtn.onclick = () => {
        closeAlert();
        const hash = window.location.hash || "#/";
        const baseUrl = hash.includes("?") ? hash.split("?")[0] : hash;
        window.location.hash = `${baseUrl}?auth=login`;
      };

      const registerBtn = document.createElement("button");
      registerBtn.innerText = "Đăng Ký";
      registerBtn.style.background = "#000080";
      registerBtn.style.color = "#fff";
      registerBtn.style.border = "none";
      registerBtn.style.padding = "10px 24px";
      registerBtn.style.borderRadius = "8px";
      registerBtn.style.cursor = "pointer";
      registerBtn.style.fontSize = "14px";
      registerBtn.style.fontWeight = "700";
      registerBtn.style.boxShadow = "0 3px 8px rgba(0, 0, 128, 0.25)";
      registerBtn.style.transition = "background 0.2s, transform 0.1s";
      registerBtn.onmouseover = () => registerBtn.style.background = "#000066";
      registerBtn.onmouseout = () => registerBtn.style.background = "#000080";
      registerBtn.onmousedown = () => registerBtn.style.transform = "scale(0.95)";
      registerBtn.onmouseup = () => registerBtn.style.transform = "scale(1)";
      registerBtn.onclick = () => {
        closeAlert();
        const hash = window.location.hash || "#/";
        const baseUrl = hash.includes("?") ? hash.split("?")[0] : hash;
        window.location.hash = `${baseUrl}?auth=register`;
      };

      btnGroup.appendChild(loginBtn);
      btnGroup.appendChild(registerBtn);
      box.appendChild(btnGroup);
    } else {
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
      btn.onclick = closeAlert;

      box.appendChild(btn);
    }

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  };
}

if (typeof window !== "undefined") {
  (window as any).showGlobalErrorPopup = function (titleText: string, messageText: string) {
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

    const title = document.createElement("h3");
    title.innerText = titleText || "Hệ thống gặp sự cố";
    title.style.margin = "0";
    title.style.color = "#dc2626";
    title.style.fontSize = "20px";
    title.style.fontWeight = "700";

    header.appendChild(title);
    box.appendChild(header);

    const desc = document.createElement("p");
    desc.innerText = messageText || "Đã xảy ra lỗi không mong muốn trong quá trình vận hành.";
    desc.style.margin = "0 0 20px 0";
    desc.style.color = "#1e293b";
    desc.style.fontSize = "14.5px";
    desc.style.lineHeight = "1.5";
    desc.style.fontWeight = "600";
    box.appendChild(desc);

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
  window.addEventListener("error", () => {
    (window as any).showGlobalErrorPopup(
      "Lỗi xử lý ứng dụng",
      "Đã xảy ra sự cố khi tải dữ liệu hoặc giao diện. Bạn vui lòng tải lại trang (F5) để tiếp tục."
    );
  });

  // Intercept Unhandled Promise Rejections
  window.addEventListener("unhandledrejection", () => {
    (window as any).showGlobalErrorPopup(
      "Thao tác chưa thể hoàn thành",
      "Hệ thống không thể xử lý thao tác vừa thực hiện. Vui lòng thử lại hoặc tải lại trang."
    );
  });

  // Intercept Global Fetch API calls
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    try {
      const response = await originalFetch(...args);
      if (!response.ok && response.status >= 500) {
        (window as any).showGlobalErrorPopup(
          `Máy chủ gặp sự cố (Lỗi ${response.status})`,
          `Máy chủ xử lý yêu cầu gặp lỗi nội bộ (${response.status}). Vui lòng kiểm tra lại dịch vụ Backend hoặc liên hệ quản trị viên.`
        );
      }
      return response;
    } catch (error: any) {
      (window as any).showGlobalErrorPopup(
        "Mất kết nối máy chủ (Backend)",
        "Không thể kết nối đến máy chủ Backend (Port 5004). Vui lòng kiểm tra kết nối mạng hoặc đảm bảo máy chủ Backend đang hoạt động."
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
