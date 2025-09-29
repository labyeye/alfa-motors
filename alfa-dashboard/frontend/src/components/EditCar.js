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
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import logo from "../images/company.png";
const API_BASE = (function() {
  const host = window.location.hostname;
  if (host === 'localhost' || host.startsWith('127.')) return 'http://localhost:2500';
  return 'https://alfa-motors.onrender.com';
})();

const EditCar = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Edit Car Data");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [carData, setCarData] = useState({
    make: "",
    model: "",
    variant: "",
    fuelType: "",
    modelYear: "",
    registrationYear: "",
    color: "",
    chassisNo: "",
    engineNo: "",
    kmDriven: "",
    ownership: "",
    daysOld: "",
    buyingPrice: "",
    quotingPrice: "",
    sellingPrice: "",
    photos: [], // For file uploads
    status: "Available",
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
      icon: Car,
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
    const fetchCarData = async () => {
      try {
        const response = await axios.get(
              `${API_BASE}/api/cars/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // Backend stores uploaded filenames in `photos`; normalize to `photos` in state
        const photos = [...(response.data.photos || []), ...Array(10).fill("")].slice(0, 10);
        setCarData({
          ...response.data,
          photos: photos,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching car data:", error);
        alert("Failed to load car data. Please try again.");
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file sizes and warn if they're too large
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
    const largeFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (largeFiles.length > 0) {
      alert(`Warning: ${largeFiles.length} file(s) are larger than 5MB. Consider compressing them or use "Add Single Photo" for better reliability.`);
    }
    
    if (files.length > 6) {
      alert('Warning: Uploading many files at once may fail. Consider using "Add Single Photo" for better reliability.');
    }
    
    setCarData((prev) => ({
      ...prev,
      photos: files,
    }));
    
    // Clear the input for next use
    e.target.value = '';
  };
  
  const handleSingleFileAdd = async (e) => {
    const file = e.target.files[0];
    if (file && id) {
      await handleAddPhoto(file);
    }
    e.target.value = ''; // Clear input
  };

  const buildImageUrl = (file) => {
    if (!file) return '/assets/placeholder.png';
    // If it's a full URL or starts with /, return as-is
    if (file.startsWith('http') || file.startsWith('/')) return file;
    // Strip potential 'carimages/' prefix
    const filename = file.replace('carimages/', '');
    return `${API_BASE}/carimages/${filename}`;
  };

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAddPhoto = async (file) => {
    try {
      // Compress image if it's too large
      let finalFile = file;
      if (file.size > 2 * 1024 * 1024) { // If > 2MB
        finalFile = await compressImage(file);
        console.log(`Compressed ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(finalFile.size / 1024 / 1024).toFixed(2)}MB`);
      }
      
      const photoFormData = new FormData();
      photoFormData.append('photo', finalFile);
      
      const response = await axios.post(`${API_BASE}/api/cars/${id}/photo`, photoFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Update local state with new photo
      setCarData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), response.data.newPhoto]
      }));
      
      alert('Photo added successfully!');
    } catch (error) {
      console.error('Error adding photo:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to add photo. Please try again.';
      alert(errorMsg);
    }
  };

  const handleDeletePhoto = async (filename) => {
    try {
      await axios.delete(`${API_BASE}/api/cars/${id}/photo`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { filename }
      });
      
      // Update local state by removing the photo
      setCarData(prev => ({
        ...prev,
        photos: prev.photos.filter(photo => 
          (typeof photo === 'string' ? photo : photo.name) !== filename
        )
      }));
      
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  // Sold management: add customer photo
  const handleAddSoldPhoto = async (file) => {
    try {
      let finalFile = file;
      if (file.size > 2 * 1024 * 1024) finalFile = await compressImage(file);
      const fd = new FormData();
      fd.append('photo', finalFile);
      const res = await axios.post(`${API_BASE}/api/cars/${id}/sold-photo`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
      });
      setCarData(prev => ({ ...prev, sold: res.data.data.sold }));
      alert('Customer photo added');
    } catch (err) {
      console.error('Error adding sold photo', err);
      alert('Failed to add customer photo');
    }
  };

  const handleDeleteSoldPhoto = async (filename) => {
    try {
      await axios.delete(`${API_BASE}/api/cars/${id}/sold-photo`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, data: { filename } });
      setCarData(prev => ({ ...prev, sold: { ...(prev.sold || {}), customerPhotos: (prev.sold?.customerPhotos || []).filter(p => p !== filename) } }));
      alert('Customer photo deleted');
    } catch (err) {
      console.error('Error deleting sold photo', err);
      alert('Failed to delete customer photo');
    }
  };

  const handleMarkSold = async () => {
    try {
      const payload = { customerName: carData.sold?.customerName || '', testimonial: carData.sold?.testimonial || '' };
      const res = await axios.put(`${API_BASE}/api/cars/${id}/mark-sold`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setCarData(prev => ({ ...prev, status: 'Sold Out', sold: res.data.data.sold }));
      alert('Car marked as sold');
    } catch (err) {
      console.error('Error marking sold', err);
      alert('Failed to mark sold');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Step 1: Update text fields first (lightweight request)
      const textData = {};
      const primitiveFields = [
        'make','model','variant','fuelType','modelYear','registrationYear','color',
        'chassisNo','engineNo','kmDriven','ownership','daysOld',
        'buyingPrice','quotingPrice','sellingPrice','status'
      ];
      
      primitiveFields.forEach((key) => {
        const val = carData[key];
        if (val !== undefined && val !== null && val !== '') {
          // Map 'make' to 'brand' for backend compatibility
          if (key === 'make') {
            textData.brand = val;
          } else {
            textData[key] = val;
          }
        }
      });

      // Update text fields
      await axios.put(`${API_BASE}/api/cars/${id}`, textData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      // Step 2: Handle photo uploads separately if new photos are provided
      const hasNewPhotos = carData.photos && carData.photos.length > 0 && 
                           carData.photos.some(photo => photo instanceof File);
      
      if (hasNewPhotos) {
        const newPhotos = carData.photos.filter(photo => photo instanceof File);
        let successCount = 0;
        
        // Upload photos one by one to avoid payload size limits
        for (let i = 0; i < newPhotos.length; i++) {
          const file = newPhotos[i];
          
          try {
            // Compress large images
            let finalFile = file;
            if (file.size > 2 * 1024 * 1024) {
              finalFile = await compressImage(file);
            }
            
            const photoFormData = new FormData();
            photoFormData.append('photo', finalFile);
            
            await axios.post(`${API_BASE}/api/cars/${id}/photo`, photoFormData, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
              },
            });
            successCount++;
          } catch (photoError) {
            console.error(`Error uploading photo ${i + 1}:`, photoError);
            // Don't alert for individual failures during bulk upload
          }
        }
        
        if (successCount < newPhotos.length) {
          alert(`Uploaded ${successCount} of ${newPhotos.length} photos. Some uploads failed - you can try uploading them individually.`);
        }
      }
      
      alert("Car data updated successfully!");
      navigate("/car/list");
    } catch (error) {
      console.error("Error updating car:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to update car data. Please try again.";
      alert(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
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
        <p>Loading car data...</p>
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
            <h1 style={styles.pageTitle}>Edit Car Data</h1>
            <p style={styles.pageSubtitle}>
              Update the details of the car in the inventory
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={styles.form}
            encType="multipart/form-data"
            noValidate
          >
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <Car style={styles.sectionIcon} /> Basic Information
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Make</label>
                  <input
                    type="text"
                    name="make"
                    value={carData.make}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={carData.model}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Variant</label>
                  <input
                    type="text"
                    name="variant"
                    value={carData.variant}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Fuel Type</label>
                  <select
                    name="fuelType"
                    value={carData.fuelType}
                    onChange={handleChange}
                    style={styles.formSelect}
                    required
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV</option>
                    <option value="CNG">CNG</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Year</label>
                  <input
                    type="number"
                    name="modelYear"
                    value={carData.modelYear}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Registration Year</label>
                  <input
                    type="number"
                    name="registrationYear"
                    value={carData.registrationYear}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={carData.color}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Chassis No</label>
                  <input
                    type="text"
                    name="chassisNo"
                    value={carData.chassisNo}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Engine No</label>
                  <input
                    type="text"
                    name="engineNo"
                    value={carData.engineNo}
                    onChange={handleChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>KM Driven</label>
                  <input
                    type="number"
                    name="kmDriven"
                    value={carData.kmDriven}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Ownership</label>
                  <select
                    name="ownership"
                    value={carData.ownership}
                    onChange={handleChange}
                    style={styles.formSelect}
                    required
                  >
                    <option value="1st Owner">1st Owner</option>
                    <option value="2nd Owner">2nd Owner</option>
                    <option value="3rd Owner">3rd Owner</option>
                    <option value="4th Owner or more">4th Owner or more</option>
                  </select>
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Days Old</label>
                  <input
                    type="number"
                    name="daysOld"
                    value={carData.daysOld}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <Car style={styles.sectionIcon} /> Pricing Information
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Buying Price (₹)</label>
                  <input
                    type="number"
                    name="buyingPrice"
                    value={carData.buyingPrice}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Quoting Price (₹)</label>
                  <input
                    type="number"
                    name="quotingPrice"
                    value={carData.quotingPrice}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Selling Price (₹)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={carData.sellingPrice}
                    onChange={handleChange}
                    style={styles.formInput}
                    min="0"
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Status</label>
                  <select
                    name="status"
                    value={carData.status}
                    onChange={handleChange}
                    style={styles.formSelect}
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Sold Out">Sold Out</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <Car style={styles.sectionIcon} /> Photos (10-12)
              </h2>
              <div style={styles.formGrid}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={styles.formLabel}>Replace All Photos:</label>
                    <input
                      type="file"
                      name="photos"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      style={styles.formInput}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Add Single Photo:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSingleFileAdd}
                      style={styles.formInput}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm('Delete ALL images for this car? This cannot be undone.')) return;
                      setIsDeletingAll(true);
                      try {
                        await axios.delete(`${API_BASE}/api/cars/${id}/photos`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        });
                        setCarData((prev) => ({ ...prev, photos: [] }));
                        alert('All images deleted successfully.');
                      } catch (err) {
                        console.error('Delete all photos error:', err.response?.data || err.message || err);
                        alert(err.response?.data?.error || 'Failed to delete all images.');
                      } finally {
                        setIsDeletingAll(false);
                      }
                    }}
                    style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    disabled={isDeletingAll}
                  >
                    {isDeletingAll ? 'Deleting...' : 'Delete all images'}
                  </button>
                  <small style={{ color: '#666', marginLeft: '8px' }}>
                    Tip: Use "Add Single Photo" for individual uploads to avoid large payloads
                  </small>
                </div>
                {carData.photos && carData.photos.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {Array.from(carData.photos).map((file, idx) => (
                      <div
                        key={idx}
                        style={{ width: "100px", height: "100px", overflow: "hidden", position: "relative" }}
                      >
                          <img
                          src={typeof file === 'string' ? buildImageUrl(file) : URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/placeholder.png';
                              }}
                        />
                        {/* Delete button for existing images */}
                        {typeof file === "string" && (
                          <button
                            type="button"
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              background: "rgba(255,0,0,0.7)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              zIndex: 2,
                            }}
                            onClick={() => {
                              if (window.confirm("Delete this image?")) {
                                handleDeletePhoto(file);
                              }
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                <Car style={styles.sectionIcon} /> Sold / Customer Details
              </h2>
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={carData.sold?.customerName || ''}
                    onChange={(e) => setCarData(prev => ({ ...prev, sold: { ...(prev.sold||{}), customerName: e.target.value } }))}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Testimonial</label>
                  <textarea
                    name="testimonial"
                    value={carData.sold?.testimonial || ''}
                    onChange={(e) => setCarData(prev => ({ ...prev, sold: { ...(prev.sold||{}), testimonial: e.target.value } }))}
                    style={{ ...styles.formInput, height: '100px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <label style={styles.formLabel}>Add Customer Photo</label>
                    <input type="file" accept="image/*" onChange={async (e) => { if (e.target.files[0]) await handleAddSoldPhoto(e.target.files[0]); e.target.value=''; }} />
                  </div>
                  <div>
                    <button type="button" onClick={handleMarkSold} style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Mark as Sold</button>
                  </div>
                </div>

                {carData.sold?.customerPhotos && carData.sold.customerPhotos.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {carData.sold.customerPhotos.map((p, idx) => (
                      <div key={idx} style={{ width: 80, height: 80, position: 'relative' }}>
                        <img src={buildImageUrl(p)} alt={`cust-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/assets/placeholder.png'}} />
                        <button type="button" onClick={() => { if (window.confirm('Delete this customer photo?')) handleDeleteSoldPhoto(p); }} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={styles.saveButton}
                disabled={isSaving}
              >
                <Save style={styles.buttonIcon} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
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
  // Main Content Styles
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
  form: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "32px",
    border: "1px solid #e2e8f0",
  },
  formSection: {
    marginBottom: "40px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
    ":last-child": {
      borderBottom: "none",
      marginBottom: "0",
    },
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e2e8f0",
  },
  sectionIcon: {
    color: "#64748b",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  formField: {
    marginBottom: "16px",
  },
  formLabel: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#334155",
    marginBottom: "8px",
  },
  formInput: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    backgroundColor: "#f8fafc",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      backgroundColor: "#ffffff",
    },
  },
  formSelect: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.875rem",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.5rem center",
    backgroundSize: "1em",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      backgroundColor: "#ffffff",
    },
  },
  imagePreviewContainer: {
    marginTop: "8px",
    width: "100%",
    height: "150px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "32px",
  },
  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#059669",
    },
    ":disabled": {
      backgroundColor: "#6ee7b7",
      cursor: "not-allowed",
    },
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },
};

export default EditCar;
