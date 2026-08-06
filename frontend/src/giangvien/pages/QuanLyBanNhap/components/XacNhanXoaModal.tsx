
interface XacNhanXoaModalProps {
  show: boolean;
  message: string;
  subMessage?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function XacNhanXoaModal({
  show,
  message,
  subMessage,
  onClose,
  onConfirm,
}: XacNhanXoaModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1001,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div className="modal-container" style={{
        background: "#ffffff",
        padding: "32px 40px",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "480px",
        textAlign: "center",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
          Xác nhận xóa
        </h3>
        <p style={{ fontSize: "14px", color: "#475569", margin: subMessage ? "0 0 8px 0" : "0 0 24px 0", lineHeight: "1.5" }}>
          {message}
        </p>
        {subMessage && (
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px 0", lineHeight: "1.5" }}>
            {subMessage}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              padding: "10px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
