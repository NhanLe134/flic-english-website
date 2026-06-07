import { createContext, useContext, useState } from "react";

interface AvatarContextType {
  avatar: string | null;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarContext = createContext<AvatarContextType>({
  avatar: null,
  handleUpload: () => {},
});

export const AvatarProvider = ({ children }: { children: React.ReactNode }) => {
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <AvatarContext.Provider value={{ avatar, handleUpload }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);