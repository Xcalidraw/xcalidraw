import { useAtom } from "jotai";
import { Home, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { activeNavItemAtom, activeSpaceIdAtom } from "../sidebar.store";
import { NavItem } from "./NavItem";

export const Navigation = () => {
  const [activeNavItem, setActiveNavItem] = useAtom(activeNavItemAtom);
  const [, setActiveSpaceId] = useAtom(activeSpaceIdAtom);
  const navigate = useNavigate();

  const handleNavClick = (item: "home" | "recent" | "starred") => {
    setActiveNavItem(item);
    setActiveSpaceId(null);
    if (item === "home") {
      navigate("/dashboard");
    }
  };

  return (
    <nav className="flex flex-col gap-0.5">
      <NavItem
        icon={Home}
        label="Home"
        active={activeNavItem === "home"}
        onClick={() => handleNavClick("home")}
      />
      <NavItem
        icon={Clock}
        label="Recent"
        active={activeNavItem === "recent"}
        onClick={() => handleNavClick("recent")}
      />
      <NavItem
        icon={Star}
        label="Starred"
        badge="3"
        active={activeNavItem === "starred"}
        onClick={() => handleNavClick("starred")}
      />
    </nav>
  );
};
