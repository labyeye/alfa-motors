import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  LayoutDashboard,
  TrendingUp,
  Wrench,
  Users,
  LogOut,
  ChevronDown,
  Bike,
  Camera,
  CarFront,
  Car,
  Menu,
} from "lucide-react";
import logo from "../images/company.png";

const MENU_ITEMS = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: (role) => (role === "admin" ? "/admin" : "/staff"),
  },
  {
    name: "RTO",
    icon: Car,
    submenu: [
      { name: "RC Entry", path: "/rc/create" },
      { name: "RC List", path: "/rc/list" },
    ],
  },
  {
    name: "Car Management",
    icon: CarFront,
    submenu: [
      { name: "Add Car Data", path: "/car/create" },
      { name: "List Car Data", path: "/car/list" },
    ],
  },
  {
    name: "Sell",
    icon: TrendingUp,
    submenu: [
      { name: "Create Sell Letter", path: "/sell/create" },
      { name: "Sell Letter History", path: "/sell/history" },
      { name: "Sell Queries", path: "/sell-requests" },
      { name: "Advance Payments", path: "/advance-payments/create" },
      { name: "Payment History", path: "/advance-payments/history" },
    ],
  },
  { name: "Gallery Management", icon: Camera, path: "/gallery" },
  {
    name: "Service",
    icon: Wrench,
    submenu: [
      { name: "Create Service Bill", path: "/service/create" },
      { name: "Service History", path: "/service/history" },
    ],
  },
  {
    name: "Refurbishment",
    icon: CarFront,
    submenu: [
      { name: "Create Refurbishment", path: "/refurbishment/create" },
      { name: "Refurbishment History", path: "/refurbishment/history" },
    ],
  },
  {
    name: "Staff",
    icon: Users,
    submenu: [
      { name: "Create Staff ID", path: "/staff/create" },
      { name: "Staff List", path: "/staff/list" },
    ],
  },
  { name: "Vehicle History", icon: Bike, path: "/bike-history" },
];

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Single source of truth for vertical gap between top-level menu items
  // compact spacing requested by user
  const ITEM_GAP = 6; // pixels

  const toggleMenu = (name) =>
    setExpandedMenus((s) => ({ ...s, [name]: !s[name] }));

  const handleNavigate = (menuName, path) => {
    if (setActiveMenu) setActiveMenu(menuName);
    const actualPath = typeof path === "function" ? path(user?.role) : path;
    if (actualPath) navigate(actualPath);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
    if (isMobile) setMobileOpen(false);
  };

  const sidebarClass = {
    ...styles.sidebar,
    ...(isMobile ? styles.sidebarMobile : {}),
    ...(isMobile && !mobileOpen ? styles.sidebarHidden : {}),
  };

  return (
    <>
      {isMobile && (
        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          style={styles.hamburgerButton}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Menu size={20} />
        </button>
      )}
      {isMobile && mobileOpen && (
        <div style={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}
      <aside style={sidebarClass} aria-label="Main sidebar">
        <div style={styles.sidebarHeader}>
          <img src={logo} alt="Company logo" style={styles.logo} />
          <div>
            <div style={styles.title}>Alfa Motor World</div>
            <div style={styles.sidebarSubtitle}>Welcome</div>
          </div>
        </div>
        <nav style={styles.nav} aria-label="Primary">
          <ul style={styles.menuList}>
            {MENU_ITEMS.map((item) => {
              const isExpanded = !!expandedMenus[item.name];
              return (
                <li key={item.name} style={{ ...styles.menuListItem, marginBottom: ITEM_GAP }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (item.submenu) toggleMenu(item.name);
                        else handleNavigate(item.name, item.path);
                      }
                    }}
                    onClick={() =>
                      item.submenu
                        ? toggleMenu(item.name)
                        : handleNavigate(item.name, item.path)
                    }
                    style={{
                      ...styles.menuItem,
                      ...(activeMenu === item.name
                        ? styles.menuItemActive
                        : {}),
                    }}
                    aria-expanded={!!item.submenu && !!expandedMenus[item.name]}
                  >
                    <div style={styles.menuItemContent}>
                      <item.icon size={18} style={styles.menuIcon} />
                      <span style={styles.menuText}>{item.name}</span>
                    </div>
                    {item.submenu && (
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                        }}
                      />
                    )}
                  </div>
                  {item.submenu && (
                    <ul
                      style={{
                        ...styles.submenu,
                        marginTop: isExpanded ? `${ITEM_GAP}px` : "0px",
                        padding: isExpanded ? "4px 0 4px 12px" : "0px 0 0 12px",
                        maxHeight: isExpanded ? `${item.submenu.length * 40}px` : "0px",
                        overflow: "hidden",
                        transition: "max-height 220ms ease, margin-top 180ms ease, padding 180ms ease",
                      }}
                      aria-hidden={!isExpanded}
                    >
                      {item.submenu.map((sub) => (
                        <li key={sub.name} style={{ ...styles.submenuItem, marginBottom: isExpanded ? 6 : 0 }}>
                          <button
                            type="button"
                            onClick={() => handleNavigate(sub.name, sub.path)}
                            style={styles.submenuButton}
                          >
                            {sub.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <div style={styles.logoutWrap}>
            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut size={18} style={styles.menuIcon} />
              <span style={styles.menuText}>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    backgroundColor: "#2B2B2B",
    color: "#FFFFFF",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    position: "sticky",
    top: 0,
    height: "100vh",
    backgroundImage: "linear-gradient(180deg, #2B2B2B 0%, #B3B3B3 100%)",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: "contain",
    borderRadius: 8,
    background: "#FFFFFF",
    padding: 6,
  },
  title: { fontSize: 14, fontWeight: 600, color: "#FFFFFF" },
  sidebarSubtitle: { fontSize: 12, color: "#D4D4D4" },
  nav: { padding: "12px 8px", flex: 1, overflowY: "auto" },
  menuList: { listStyle: "none", margin: 0, padding: 0 },
  menuListItem: { marginBottom: 6 },
  menuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    cursor: "pointer",
    color: "#FFFFFF",
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: "#B3B3B3",
    borderRight: "3px solid #D4D4D4",
    color: "#2B2B2B",
  },
  menuItemContent: { display: "flex", alignItems: "center", gap: 12 },
  menuIcon: { marginRight: 8, color: "#D4D4D4" },
  menuText: { fontSize: 14, fontWeight: 500 },
  submenu: {
    listStyle: "none",
    margin: 0,
    padding: "4px 0 4px 12px",
    /* no background on the wrapper so each item can be its own box */
    backgroundColor: "transparent",
  },
  submenuItem: { marginBottom: 6, paddingLeft: 8 },
  submenuButton: {
    display: "block",
    boxSizing: "border-box",
    background: "#B3B3B3",
    border: "none",
    color: "#2B2B2B",
    padding: "10px 12px",
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    fontSize: 13,
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    margin: "6px 0",
  },
  logoutWrap: { borderTop: "1px solid #B3B3B3", padding: 8 },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "transparent",
    color: "#FFFFFF",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
    width: "100%",
    borderRadius: 8,
  },
  hamburgerButton: {
    position: "fixed",
    top: 12,
    left: 12,
    zIndex: 1003,
    backgroundColor: "#0f172a",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#ffffff",
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 8,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(2,6,23,0.35)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1001,
  },
  sidebarMobile: {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    zIndex: 1002,
    width: "240px",
    transform: "translateX(0)",
    transition: "transform 0.28s ease",
  },
  sidebarHidden: { transform: "translateX(-100%)" },
};

export default Sidebar;
