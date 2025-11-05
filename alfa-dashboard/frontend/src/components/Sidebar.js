import React, { useState, useContext } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  LayoutDashboard,
  TrendingUp,
  Wrench,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bike,
  Camera,
  CarFront,
  Car,
  Menu,
} from "lucide-react";
import logo from "../images/company.png";

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: (userRole) => (userRole === "admin" ? "/admin" : "/staff"),
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
        { name: "Edit Car Data", path: "/car/edit" },
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
    {
      name: "Gallery Management",
      icon: Camera,
      path: "/gallery",
    },
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
    {
      name: "Vehicle History",
      icon: Bike,
      path: "/bike-history",
    },
  ];

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const handleMenuClick = (menuName, path) => {
    if (setActiveMenu) setActiveMenu(menuName);
    const actualPath = typeof path === "function" ? path(user?.role) : path;
    if (actualPath) navigate(actualPath);
    // if on mobile, close sidebar after navigation
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    // set initial
    setIsMobile(mq.matches);
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  const sidebarStyle = {
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

      <div style={sidebarStyle}>
        <div style={styles.sidebarHeader}>
          <img
            src={logo}
            alt="logo"
            style={{ width: "12.5rem", height: "12.5rem" }}
          />
          <p style={styles.sidebarSubtitle}>Welcome, Alfa Motor World</p>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <div key={item.name}>
              <div
                style={{
                  ...styles.menuItem,
                  ...(activeMenu === item.name ? styles.menuItemActive : {}),
                }}
                onClick={() => {
                  if (item.submenu) toggleMenu(item.name);
                  else handleMenuClick(item.name, item.path);
                }}
              >
                <div style={styles.menuItemContent}>
                  <item.icon size={20} style={styles.menuIcon} />
                  <span style={styles.menuText}>{item.name}</span>
                </div>
                {item.submenu &&
                  (expandedMenus[item.name] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </div>

              {item.submenu && expandedMenus[item.name] && (
                <div style={styles.submenu}>
                  {item.submenu.map((subItem) => (
                    <div
                      key={subItem.name}
                      style={styles.submenuItem}
                      onClick={() =>
                        handleMenuClick(subItem.name, subItem.path)
                      }
                    >
                      {subItem.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={20} style={styles.menuIcon} />
            <span style={styles.menuText}>Logout</span>
          </div>
        </nav>
      </div>
    </>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    height: "100vh",
    backgroundImage: "linear-gradient(to bottom, #1e293b, #0f172a)",
  },
  sidebarHeader: {
    padding: "24px",
    borderBottom: "1px solid #334155",
  },
  sidebarSubtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  nav: { padding: "16px 0" },
  menuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    cursor: "pointer",
    color: "#e2e8f0",
  },
  menuItemActive: {
    backgroundColor: "#334155",
    borderRight: "3px solid #3b82f6",
    color: "#ffffff",
  },
  menuItemContent: { display: "flex", alignItems: "center", gap: 12 },
  menuIcon: { marginRight: "14px", color: "#94a3b8" },
  menuText: { fontSize: "0.9375rem", fontWeight: "500" },
  submenu: { backgroundColor: "#1a2536" },
  submenuItem: {
    padding: "12px 24px 12px 64px",
    cursor: "pointer",
    color: "#cbd5e1",
    fontSize: "0.875rem",
    borderBottom: "1px solid rgba(255,255,255,0.02)",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    cursor: "pointer",
    color: "#f87171",
    marginTop: "16px",
    borderTop: "1px solid #334155",
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
  sidebarHidden: {
    transform: "translateX(-100%)",
  },
};

export default Sidebar;
