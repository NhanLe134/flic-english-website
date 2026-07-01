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
    box.style.width = "90%";
    box.style.maxWidth = "400px";
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

// Load mock API only when explicitly enabled via Vite env `VITE_USE_MOCK`
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mockApi');
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
