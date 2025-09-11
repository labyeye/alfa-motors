import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  CarFront,
  Car,
  Edit,
  Trash2,
} from "lucide-react";
import logo from "../images/company.png";

const ListCar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState("List Car Data");
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
      ],
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

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:2500/api/cars", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCars(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch cars");
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (menuName, path) => {
    setActiveMenu(menuName);
    const actualPath = typeof path === "function" ? path(user?.role) : path;
    navigate(actualPath);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleEdit = (carId) => {
    navigate(`/car/edit/${carId}`);
  };

  const handleDelete = async (carId) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:2500/api/cars/${carId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCars(cars.filter((car) => car._id !== carId));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete car");
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <img
            src={logo}
            alt="logo"
            style={{ width: "12.5rem", height: "7.5rem", color: "#7c3aed" }}
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
                  if (item.submenu) {
                    toggleMenu(item.name);
                  } else {
                    handleMenuClick(item.name, item.path);
                  }
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
                      style={{
                        ...styles.submenuItem,
                        ...(activeMenu === subItem.name
                          ? styles.submenuItemActive
                          : {}),
                      }}
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

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentPadding}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Car Inventory</h1>
            <p style={styles.pageSubtitle}>
              View and manage all cars in inventory
            </p>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading cars...</div>
          ) : error ? (
            <div style={styles.error}>{error}</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Brand</th>
                    <th style={styles.th}>Model</th>
                    <th style={styles.th}>Year</th>
                    <th style={styles.th}>KM Driven</th>
                    <th style={styles.th}>Buying Price</th>
                    <th style={styles.th}>Quoting Price</th>
                    <th style={styles.th}>Selling Price</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car._id} style={styles.tr}>
                      <td style={styles.td}>{car.make}</td>
                      <td style={styles.td}>{car.model}</td>
                      <td style={styles.td}>{car.modelYear}</td>
                      <td style={styles.td}>
                        {car.kmDriven !== undefined && car.kmDriven !== null
                          ? Number(car.kmDriven).toLocaleString()
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        ₹
                        {car.buyingPrice !== undefined && car.buyingPrice !== null
                          ? Number(car.buyingPrice).toLocaleString()
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        ₹
                        {car.quotingPrice !== undefined && car.quotingPrice !== null
                          ? Number(car.quotingPrice).toLocaleString()
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        ₹
                        {car.sellingPrice !== undefined && car.sellingPrice !== null
                          ? Number(car.sellingPrice).toLocaleString()
                          : "-"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(car.status === "Available"
                              ? styles.statusAvailable
                              : car.status === "Coming Soon"
                              ? styles.statusComingSoon
                              : styles.statusSoldOut),
                          }}
                        >
                          {car.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleEdit(car._id)}
                          style={styles.editButton}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(car._id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Inter', sans-serif",
  },
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
  sidebarTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0,
  },
  sidebarSubtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  nav: {
    padding: "16px 0",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    cursor: "pointer",
    color: "#e2e8f0",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ":hover": {
      backgroundColor: "#334155",
    },
  },
  menuItemActive: {
    backgroundColor: "#334155",
    borderRight: "3px solid #3b82f6",
    color: "#ffffff",
  },
  menuItemContent: {
    display: "flex",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: "12px",
    color: "#94a3b8",
  },
  menuText: {
    fontSize: "0.9375rem",
    fontWeight: "500",
  },
  submenu: {
    backgroundColor: "#1a2536",
  },
  submenuItem: {
    padding: "10px 24px 10px 64px",
    cursor: "pointer",
    color: "#cbd5e1",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#2d3748",
    },
  },
  submenuItemActive: {
    backgroundColor: "#2d3748",
    color: "#ffffff",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    cursor: "pointer",
    color: "#f87171",
    marginTop: "16px",
    borderTop: "1px solid #334155",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#7f1d1d20",
    },
  },
  mainContent: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#ffffff",
  },
  contentPadding: {
    padding: "32px",
  },
  header: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    margin: "8px 0 0 0",
  },
  loading: {
    padding: "20px",
    textAlign: "center",
    color: "#64748b",
  },
  error: {
    padding: "20px",
    textAlign: "center",
    color: "#ef4444",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    backgroundColor: "#f1f5f9",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
    ":hover": {
      backgroundColor: "#f8fafc",
    },
  },
  td: {
    padding: "12px 16px",
    color: "#334155",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  statusAvailable: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusComingSoon: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
  },
  statusSoldOut: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  editButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    padding: "4px 8px",
    marginRight: "8px",
    ":hover": {
      color: "#2563eb",
    },
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: "4px 8px",
    ":hover": {
      color: "#dc2626",
    },
  },
};

export default ListCar;
