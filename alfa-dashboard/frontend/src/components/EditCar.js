import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Save,
  Upload,
  X,
  Camera,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import logo from "../images/company.png";

const API_BASE = (function() {
  const host = window.location.hostname;
  if (host === 'localhost' || host.startsWith('127.')) return 'https://alfa-motors-5yfh.vercel.app';
  return 'https://alfa-motors-5yfh.vercel.app';
})();

const EditCar = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Edit Car Data");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [carData, setCarData] = useState({
    make: "",
    model: "",
    variant: "",
    fuelType: "Petrol",
    modelYear: "",
    registrationYear: "",
    color: "",
    chassisNo: "",
    engineNo: "",
    kmDriven: "",
    ownership: "1st Owner",
    daysOld: "",
    buyingPrice: "",
    quotingPrice: "",
    sellingPrice: "",
    photos: [],
    status: "Available",
    sold: {}
  });

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
        { name: "Sell Queries", path: "/sell-requests" },
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
    const fetchCarData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/cars/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const car = response.data && response.data.data ? response.data.data : response.data;
        
        setCarData({
          make: car.make || '',
          model: car.model || '',
          variant: car.variant || '',
          fuelType: car.fuelType || 'Petrol',
          modelYear: car.modelYear || '',
          registrationYear: car.registrationYear || '',
          color: car.color || '',
          chassisNo: car.chassisNo || '',
          engineNo: car.engineNo || '',
          kmDriven: car.kmDriven || '',
          ownership: car.ownership || '1st Owner',
          daysOld: car.daysOld || '',
          buyingPrice: car.buyingPrice || '',
          quotingPrice: car.quotingPrice || '',
          sellingPrice: car.sellingPrice || '',
          photos: car.photos || [],
          status: car.status || 'Available',
          sold: car.sold || {}
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching car data:", error);
        alert("Failed to load car data. Please check your connection and try again.");
        navigate("/car/list");
      }
    };

    fetchCarData();
  }, [id, navigate]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;
    
    // Validate file count
    if (files.length > 12) {
      alert('Please select maximum 12 images at once.');
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert('Please select only image files (JPEG, JPG, PNG, WEBP).');
      return;
    }
    
    try {
      // Show loading state
      const uploadingPhotos = files.map((_, index) => `uploading-${index}`);
      setCarData(prev => ({ ...prev, photos: uploadingPhotos }));
      
      const formData = new FormData();
      
      // Add replace flag to replace all existing photos
      formData.append('replacePhotos', 'true');
      
      for (let file of files) {
        formData.append('photos', file);
      }

      const response = await axios.put(`${API_BASE}/api/cars/${id}/photos`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh car data after upload
      const updatedResponse = await axios.get(`${API_BASE}/api/cars/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      const car = updatedResponse.data && updatedResponse.data.data ? updatedResponse.data.data : updatedResponse.data;
      setCarData(prev => ({ ...prev, photos: car.photos || [] }));
      
      alert(`${files.length} photos uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      setCarData(prev => ({ ...prev, photos: [] })); // Reset on error
      alert('Failed to upload photos. Please try again.');
    }
  };
  
  const handleDeletePhoto = async (photoToDelete) => {
    try {
      // Extract just the filename from the path
      const filename = photoToDelete.replace('carimages/', '').replace(`${API_BASE}/carimages/`, '');
      
      await axios.delete(`${API_BASE}/api/cars/${id}/photo`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { filename: filename }
      });
      
      // Remove from local state
      setCarData(prev => ({
        ...prev,
        photos: prev.photos.filter(photo => photo !== photoToDelete)
      }));
      
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const buildImageUrl = (file) => {
    if (!file) return '/assets/placeholder.png';
    if (file.startsWith('http') || file.startsWith('/')) return file;
    const filename = file.replace('carimages/', '');
    return `${API_BASE}/carimages/${filename}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updateData = {
        brand: carData.make,
        model: carData.model,
        variant: carData.variant,
        fuelType: carData.fuelType,
        modelYear: Number(carData.modelYear),
        registrationYear: Number(carData.registrationYear),
        color: carData.color,
        chassisNo: carData.chassisNo,
        engineNo: carData.engineNo,
        kmDriven: Number(carData.kmDriven),
        ownership: carData.ownership,
        daysOld: Number(carData.daysOld),
        buyingPrice: Number(carData.buyingPrice),
        quotingPrice: Number(carData.quotingPrice),
        sellingPrice: Number(carData.sellingPrice),
        status: carData.status,
      };

      await axios.put(`${API_BASE}/api/cars/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      alert("Car updated successfully!");
      navigate("/car/list");
    } catch (error) {
      console.error("Error updating car:", error);
      alert("Failed to update car. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading car data...</p>
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
            alt="Alfa Motors Logo"
            style={styles.logoImage}
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
        <div style={styles.contentWrapper}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Edit Car Details</h1>
            <p style={styles.pageSubtitle}>
              Update vehicle information and manage photos
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Basic Information Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Car size={24} style={styles.sectionIcon} />
                <h2 style={styles.sectionTitle}>Basic Information</h2>
              </div>
              
              <div style={styles.inputGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Make *</label>
                  <input
                    type="text"
                    name="make"
                    value={carData.make}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter car make"
                    required
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Model *</label>
                  <input
                    type="text"
                    name="model"
                    value={carData.model}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter car model"
                    required
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Variant</label>
                  <input
                    type="text"
                    name="variant"
                    value={carData.variant}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter variant"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fuel Type *</label>
                  <select
                    name="fuelType"
                    value={carData.fuelType}
                    onChange={handleChange}
                    style={styles.select}
                    required
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">Electric</option>
                    <option value="CNG">CNG</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Model Year *</label>
                  <input
                    type="number"
                    name="modelYear"
                    value={carData.modelYear}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Registration Year *</label>
                  <input
                    type="number"
                    name="registrationYear"
                    value={carData.registrationYear}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={carData.color}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter color"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Ownership *</label>
                  <select
                    name="ownership"
                    value={carData.ownership}
                    onChange={handleChange}
                    style={styles.select}
                    required
                  >
                    <option value="1st Owner">1st Owner</option>
                    <option value="2nd Owner">2nd Owner</option>
                    <option value="3rd Owner">3rd Owner</option>
                    <option value="4th Owner or more">4th Owner or more</option>
                  </select>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>KM Driven</label>
                  <input
                    type="number"
                    name="kmDriven"
                    value={carData.kmDriven}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="50000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Details Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <CarFront size={24} style={styles.sectionIcon} />
                <h2 style={styles.sectionTitle}>Vehicle Details</h2>
              </div>
              
              <div style={styles.inputGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Chassis Number</label>
                  <input
                    type="text"
                    name="chassisNo"
                    value={carData.chassisNo}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter chassis number"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Engine Number</label>
                  <input
                    type="text"
                    name="engineNo"
                    value={carData.engineNo}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter engine number"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Days Old</label>
                  <input
                    type="number"
                    name="daysOld"
                    value={carData.daysOld}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="365"
                    min="0"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    name="status"
                    value={carData.status}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold Out">Sold Out</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <TrendingUp size={24} style={styles.sectionIcon} />
                <h2 style={styles.sectionTitle}>Pricing Information</h2>
              </div>
              
              <div style={styles.inputGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Buying Price (₹)</label>
                  <input
                    type="number"
                    name="buyingPrice"
                    value={carData.buyingPrice}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="500000"
                    min="0"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Quoting Price (₹)</label>
                  <input
                    type="number"
                    name="quotingPrice"
                    value={carData.quotingPrice}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="550000"
                    min="0"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Selling Price (₹)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={carData.sellingPrice}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="525000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Camera size={24} style={styles.sectionIcon} />
                <h2 style={styles.sectionTitle}>Vehicle Photos</h2>
              </div>
              
              <div style={styles.photoSection}>
                <div style={styles.uploadArea}>
                  <Upload size={48} style={styles.uploadIcon} />
                  <h3 style={styles.uploadTitle}>Upload Vehicle Photos</h3>
                  <p style={styles.uploadSubtitle}>
                    Select up to 12 high-quality images (JPEG, PNG, WEBP)
                  </p>
                  <p style={styles.uploadNote}>
                    ⚠️ Uploading new photos will replace all existing photos
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        handleFileUpload(Array.from(e.target.files));
                        e.target.value = ''; // Reset input
                      }
                    }}
                    style={styles.fileInput}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" style={styles.uploadButton}>
                    Choose Photos
                  </label>
                </div>

                {carData.photos && carData.photos.length > 0 && (
                  <div style={styles.photoGrid}>
                    {carData.photos.map((photo, index) => {
                      // Show loading placeholder for uploading photos
                      if (typeof photo === 'string' && photo.startsWith('uploading-')) {
                        return (
                          <div key={index} style={styles.photoCard}>
                            <div style={styles.uploadingPlaceholder}>
                              <div style={styles.uploadingSpinner}></div>
                              <span style={styles.uploadingText}>Uploading...</span>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                      <div key={index} style={styles.photoCard}>
                        <img
                          src={buildImageUrl(photo)}
                          alt={`Vehicle ${index + 1}`}
                          style={styles.photoImage}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/placeholder.png';
                          }}
                        />
                        <button
                          type="button"
                          style={styles.deletePhotoButton}
                          onClick={() => {
                            if (window.confirm('Delete this photo from server? This cannot be undone.')) {
                              handleDeletePhoto(photo);
                            }
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={styles.submitSection}>
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(isSaving ? styles.submitButtonDisabled : {})
                }}
                disabled={isSaving}
              >
                <Save size={20} style={styles.submitButtonIcon} />
                {isSaving ? "Updating Car..." : "Update Car Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add CSS animation for spinners
const styleSheet = document.styleSheets[0];
if (styleSheet && !document.querySelector('#spinner-keyframes')) {
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  const style = document.createElement('style');
  style.id = 'spinner-keyframes';
  document.head.appendChild(style);
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },
  
  // Loading Styles
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f8fafc",
  },
  loadingSpinner: {
    border: "4px solid #e5e7eb",
    borderLeftColor: "#3b82f6",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  loadingText: {
    fontSize: "1rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  
  // Sidebar Styles
  sidebar: {
    width: "280px",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    height: "100vh",
    backgroundImage: "linear-gradient(to bottom, #1e293b, #0f172a)",
    zIndex: 10,
  },
  sidebarHeader: {
    padding: "24px",
    borderBottom: "1px solid #334155",
  },
  logoImage: {
    width: "12.5rem",
    height: "7.5rem",
    color: "#7c3aed",
  },
  sidebarSubtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: "8px 0 0 0",
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
  
  // Main Content Styles
  mainContent: {
    flex: 1,
    backgroundColor: "#f8fafc",
    overflow: "auto",
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px",
  },
  pageHeader: {
    marginBottom: "32px",
    textAlign: "center",
  },
  pageTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
    letterSpacing: "-0.025em",
  },
  pageSubtitle: {
    fontSize: "1.125rem",
    color: "#64748b",
    margin: 0,
  },
  
  // Form Styles
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
  },
  sectionIcon: {
    color: "#3b82f6",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  
  // Input Styles
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    letterSpacing: "0.025em",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
  },
  select: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "0.875rem",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  
  // Photo Section Styles
  photoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  uploadArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    border: "2px dashed #d1d5db",
    borderRadius: "16px",
    backgroundColor: "#f9fafb",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  uploadIcon: {
    color: "#6b7280",
    marginBottom: "16px",
  },
  uploadTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 8px 0",
  },
  uploadSubtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0 0 8px 0",
  },
  uploadNote: {
    fontSize: "0.75rem",
    color: "#f59e0b",
    margin: "0 0 24px 0",
    fontWeight: "600",
  },
  fileInput: {
    display: "none",
  },
  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "16px",
  },
  photoCard: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    aspectRatio: "1",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  deletePhotoButton: {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    color: "#ffffff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  uploadingPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  uploadingSpinner: {
    width: "24px",
    height: "24px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "8px",
  },
  uploadingText: {
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  
  // Submit Section Styles
  submitSection: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "16px",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 32px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "200px",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  submitButtonIcon: {
    flexShrink: 0,
  },
};

export default EditCar;
