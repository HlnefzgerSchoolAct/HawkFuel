import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, UtensilsCrossed, Calendar, User, ChefHat, ClipboardList, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import "./BottomNavBar.css";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/log", label: "Log", icon: UtensilsCrossed },
  { path: "/coach", label: "Coach", icon: MessageCircle },
  { path: "/recipes", label: "Recipes", icon: ChefHat },
  { path: "/templates", label: "Templates", icon: ClipboardList },
  { path: "/history", label: "History", icon: Calendar },
  { path: "/profile", label: "Profile", icon: User },
];

function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show nav bar during onboarding
  if (location.pathname.startsWith("/onboarding")) {
    return null;
  }

  return (
    <nav
      className="bottom-nav-bar"
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.path}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="nav-item-content">
              {isActive && (
                <motion.div
                  className="nav-pill"
                  layoutId="navPill"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                className="nav-icon"
                size={22}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
            </div>
            <span className="nav-label">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}

export default BottomNavBar;
