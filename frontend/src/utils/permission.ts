export const hasPermission = (permissionCode: string): boolean => {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  if (user.VaiTro === "Quản Trị Viên") return true; // Admin has all permissions
  
  const savedPerms = JSON.parse(sessionStorage.getItem("permissions") || "[]");
  return savedPerms.includes(permissionCode);
};
