import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import NavbarLogin from "./NavbarLogin";

const NavbarAuto = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    setIsLoggedIn(!!user && user !== "{}");
  }, []);

  return isLoggedIn ? <NavbarLogin /> : <Navbar />;
};

export default NavbarAuto;