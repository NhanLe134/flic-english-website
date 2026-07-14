import { createContext, useContext, useState } from "react";

interface AvatarContextType {
  avatar: string | null;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAvatar: (avatar: string | null) => void;
}

const AvatarContext = createContext<AvatarContextType>({
  avatar: null,
  handleUpload: () => {},
  setAvatar: () => {},
});

export const AvatarProvider = ({ children }: { children: React.ReactNode }) => {
  const [avatar, setAvatar] = useState<string | null>(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const path = user.AnhDaiDien;
      if (!path) return null;
      return path.startsWith("http") ? path : `${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}${path}`;
    }
    return null;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      // 1. Upload file vật lý lên server backend
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "/upload", {
        method: "POST",
        body: formData
      });
      if (!uploadRes.ok) throw new Error("Upload thất bại");

      const uploadData = await uploadRes.json();
      const relativeUrl = uploadData.url; // e.g. /uploads/filename.png
      const absoluteUrl = `${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}${relativeUrl}`;

      // 2. Cập nhật state và sessionStorage
      setAvatar(absoluteUrl);
      user.AnhDaiDien = relativeUrl;
      sessionStorage.setItem("user", JSON.stringify(user));

      // 3. Lưu link relative URL vào database cột AnhDaiDien
      await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/users/${user.MaNguoiDung}/anh-dai-dien`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ AnhDaiDien: relativeUrl })
      });
    } catch (err) {
      console.error("Lỗi cập nhật ảnh đại diện:", err);
      alert("Lỗi khi tải ảnh đại diện lên máy chủ");
    }
  };

  return (
    <AvatarContext.Provider value={{ avatar, handleUpload, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);
