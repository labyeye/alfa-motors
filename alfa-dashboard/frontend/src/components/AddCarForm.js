import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/AddcarForm.css";
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
} from "lucide-react";
import logo from "../images/company.png";

const AddcarForm = () => {
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    modelYear: "",
    kmDriven: "",
    ownership: "",
    fuelType: "",
    daysOld: "",
    price: "",
    downPayment: "",
    status: "",
    images: Array(10).fill(""),
  });
  const [activeMenu, setActiveMenu] = useState("Add Car Data");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token");
    
    if (!user || !user._id || !token) {
      setError("User not authenticated. Please log in.");
      setIsSubmitting(false);
      return;
    }

    try {
      const nonEmptyImages = formData.images.filter((url) => url.trim() !== "");
      const carData = {
        ...formData,
        images: nonEmptyImages,
        addedBy: user._id
      };

      const response = await axios.post(
        "https://alfa-motors.onrender.com/api/cars",
        carData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        navigate("/admin");
      } else {
        setError(response.data.message || "Failed to add car");
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error?.join(', ') || 
        err.message || 
        "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
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
            <h1 style={styles.pageTitle}>Add New Car</h1>
            <p style={styles.pageSubtitle}>
              Fill in the details to add a new car to inventory
            </p>
          </div>

          <div className="form-container">
            <div className="form-header">
              <h1 className="form-title">Add New Car</h1>
              <button
                type="button"
                className="btn btn-outlined"
                onClick={handleCancel}
              >
                <span>Cancel</span>
              </button>
            </div>

            <div className="form-body">
              {error && (
                <div className="alert error">
                  <i
                    className="material-icons"
                    style={{ verticalAlign: "middle", marginRight: "8px" }}
                  >
                    error
                  </i>
                  {error}
                </div>
              )}

              <form id="addCarForm" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      className="form-control"
                      required
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Model</label>
                    <input
                      type="text"
                      name="model"
                      className="form-control"
                      required
                      value={formData.model}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Model Year</label>
                    <input
                      type="number"
                      name="modelYear"
                      min="2000"
                      max="2024"
                      className="form-control"
                      required
                      value={formData.modelYear}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">KM Driven</label>
                    <input
                      type="number"
                      name="kmDriven"
                      min="0"
                      className="form-control"
                      required
                      value={formData.kmDriven}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Ownership</label>
                    <select
                      name="ownership"
                      className="form-control select"
                      required
                      value={formData.ownership}
                      onChange={handleChange}
                    >
                      <option value="">Select Ownership</option>
                      <option value="1st Owner">1st Owner</option>
                      <option value="2nd Owner">2nd Owner</option>
                      <option value="3rd Owner">3rd Owner</option>
                      <option value="4th Owner or more">
                        4th Owner or more
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Fuel Type</label>
                    <select
                      name="fuelType"
                      className="form-control select"
                      required
                      value={formData.fuelType}
                      onChange={handleChange}
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="EV">Electric</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Days Old</label>
                    <input
                      type="number"
                      name="daysOld"
                      min="0"
                      className="form-control"
                      required
                      value={formData.daysOld}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      className="form-control"
                      required
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">
                      Down Payment (₹)
                    </label>
                    <input
                      type="number"
                      name="downPayment"
                      min="0"
                      className="form-control"
                      required
                      value={formData.downPayment}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URLs</label>
                    {formData.images.map((url, index) => (
                      <div key={index} style={{ marginBottom: "8px" }}>
                        <input
                          type="text"
                          placeholder={`Image URL ${index + 1} (optional)`}
                          className="form-control"
                          value={url}
                          onChange={(e) =>
                            handleImageChange(index, e.target.value)
                          }
                        />
                      </div>
                    ))}
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "var(--text-secondary)",
                        fontSize: "0.75rem",
                      }}
                    >
                      Add up to 10 image URLs (at least one recommended)
                    </small>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Status</label>
                  <select
                    name="status"
                    className="form-control select"
                    required
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">Select Status</option>
                    <option value="Available">Available</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="form-footer">
              <button
                type="button"
                className="btn btn-outlined"
                onClick={handleCancel}
              >
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                form="addCarForm"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Car"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Use the same styles object from SellLetterPDF.js
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
};

export default AddcarForm;