import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Car,
  CarFront,
  Bike,
  TrendingUp,
  Wrench,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  Camera,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import logo from "../images/company.png";

const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:2500' : 'https://alfa-motors-5yfh.vercel.app');

const GalleryManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Gallery Management");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [soldCars, setSoldCars] = useState([]);
  const [uploadingIds, setUploadingIds] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);

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
      name: "Gallery Management",
      icon: Camera,
      path: "/gallery",
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch sold cars for gallery
      const soldResponse = await axios.get(`${API_BASE}/api/cars/sold`);
      setSoldCars(soldResponse.data.data || []);

      // Fetch all cars to manage which ones appear in gallery
      const allResponse = await axios.get(`${API_BASE}/api/cars`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAllCars(allResponse.data.data || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSoldPhoto = async (carId, file) => {
    if (!file) return;
    try {
      setUploadingIds(prev => [...prev, carId]);
      const fd = new FormData();
      fd.append('photo', file);
      const res = await axios.post(`${API_BASE}/api/cars/${carId}/sold-photo`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
      });
      const updatedSold = res.data?.data?.sold;
      setSoldCars(prev => prev.map(c => c._id === carId ? { ...c, sold: updatedSold } : c));
      alert('Customer photo uploaded');
    } catch (err) {
      console.error('Upload sold photo error:', err);
      alert(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploadingIds(prev => prev.filter(id => id !== carId));
    }
  };

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

  const buildImageUrl = (file) => {
    if (!file) return '/assets/placeholder.png';
    if (file.startsWith('http') || file.startsWith('/')) return file;
    const filename = file.replace('carimages/', '');
    return `${API_BASE}/carimages/${filename}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading gallery data...</p>
      </div>
    );
  }

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
            <h1 style={styles.pageTitle}>Gallery Management</h1>
            <p style={styles.pageSubtitle}>
              Manage happy customer gallery and sold car testimonials
            </p>
            <div style={styles.actionButtons}>
              <a 
                href="/happy-customers.html" 
                target="_blank" 
                style={styles.viewGalleryButton}
              >
                <ExternalLink size={16} />
                View Public Gallery
              </a>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{soldCars.length}</h3>
              <p style={styles.statLabel}>Cars in Gallery</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>
                {soldCars.filter(car => car.sold?.testimonial).length}
              </h3>
              <p style={styles.statLabel}>With Testimonials</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>
                {soldCars.filter(car => car.sold?.customerPhotos?.length > 0).length}
              </h3>
              <p style={styles.statLabel}>With Customer Photos</p>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Happy Customer Gallery</h2>
            {soldCars.length === 0 ? (
              <div style={styles.emptyState}>
                <Camera size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
                <h3 style={{ color: "#64748b", margin: "0 0 8px 0" }}>No sold cars in gallery yet</h3>
                <p style={{ color: "#94a3b8", margin: 0 }}>
                  Mark cars as sold and add customer testimonials to build your gallery
                </p>
              </div>
            ) : (
              <div style={styles.galleryGrid}>
                {soldCars.map((car) => (
                  <div key={car._id} style={styles.galleryCard}>
                    <div style={styles.cardImage}>
                      <img
                        src={buildImageUrl(
                          (car.sold?.customerPhotos && car.sold.customerPhotos[0]) ||
                          (car.photos && car.photos[0])
                        )}
                        alt={`${car.make} ${car.model}`}
                        style={styles.cardImg}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/placeholder.png';
                        }}
                      />
                      <div style={styles.soldBadge}>SOLD</div>
                    </div>
                    <div style={styles.cardContent}>
                      <h3 style={styles.cardTitle}>
                        {car.make} {car.model} {car.variant} ({car.modelYear})
                      </h3>
                      {car.sold?.customerName && (
                        <p style={styles.customerName}>👤 {car.sold.customerName}</p>
                      )}
                      {car.sold?.testimonial && (
                        <p style={styles.testimonial}>"{car.sold.testimonial}"</p>
                      )}
                      <div style={styles.cardActions}>
                        <button
                          style={styles.editButton}
                          onClick={() => navigate(`/car/edit/${car._id}`)}
                        >
                          <Edit size={14} />
                          Edit Details
                        </button>
                        <label style={styles.uploadLabel}>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) handleAddSoldPhoto(car._id, e.target.files[0]); e.target.value=''; }} />
                          <button style={styles.uploadButton} disabled={uploadingIds.includes(car._id)}>
                            <Plus size={14} />
                            {uploadingIds.includes(car._id) ? 'Uploading...' : 'Add Photo'}
                          </button>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
  },
  loadingSpinner: {
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderLeftColor: "#3b82f6",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  viewGalleryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  galleryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  cardImage: {
    position: "relative",
  },
  cardImg: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  soldBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#ef4444",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  cardContent: {
    padding: "20px",
  },
  cardTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "8px",
  },
  customerName: {
    fontSize: "0.875rem",
    color: "#ef4444",
    marginBottom: "8px",
    fontWeight: "500",
  },
  testimonial: {
    fontSize: "0.875rem",
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: "16px",
    lineHeight: "1.4",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  uploadLabel: {
    display: 'inline-block'
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
};

export default GalleryManagement;