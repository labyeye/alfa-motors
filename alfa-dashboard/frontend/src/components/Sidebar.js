import React, { useState, useContext } from "react";
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
} from "lucide-react";
import logo from "../images/company.png";

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

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
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <img src={logo} alt="logo" style={{ width: "12.5rem", height: "7.5rem" }} />
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
              {item.submenu && (expandedMenus[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </div>

            {item.submenu && expandedMenus[item.name] && (
              <div style={styles.submenu}>
                {item.submenu.map((subItem) => (
                  <div
                    key={subItem.name}
                    style={styles.submenuItem}
                    onClick={() => handleMenuClick(subItem.name, subItem.path)}
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
    padding: "12px 24px",
    cursor: "pointer",
    color: "#e2e8f0",
  },
  menuItemActive: {
    backgroundColor: "#334155",
    borderRight: "3px solid #3b82f6",
    color: "#ffffff",
  },
  menuItemContent: { display: "flex", alignItems: "center" },
  menuIcon: { marginRight: "12px", color: "#94a3b8" },
  menuText: { fontSize: "0.9375rem", fontWeight: "500" },
  submenu: { backgroundColor: "#1a2536" },
  submenuItem: {
    padding: "10px 24px 10px 64px",
    cursor: "pointer",
    color: "#cbd5e1",
    fontSize: "0.875rem",
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
};

export default Sidebar;
