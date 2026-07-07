import { useEffect, useState } from "react";
import Nav from "../Nav/Nav";
import NavDaDangNhap from "../NavDaDangNhap/NavDaDangNhap";

// Thành phần tự động phát hiện trạng thái đăng nhập để hiển thị thanh điều hướng phù hợp
const NavTuDong = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    setIsLoggedIn(!!user && user !== "{}");
  }, []);

  return isLoggedIn ? <NavDaDangNhap /> : <Nav />;
};

export default NavTuDong;
