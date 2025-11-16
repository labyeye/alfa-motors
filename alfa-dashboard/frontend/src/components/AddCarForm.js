import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Sidebar from "./Sidebar";
import "../css/AddcarForm.css";

const AddCarForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    photos: [],
    status: "Available",
  });
  const [activeMenu, setActiveMenu] = useState("Add Car Data");

  const getId = (obj) => (obj && (obj.id || obj._id)) || null;

  const API_BASE = "https://alfa-motors-5yfh.vercel.app";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 12) {
      setError(
        "You can upload a maximum of 12 photos. Extra files were ignored."
      );
    }
    const limitedFiles = files.slice(0, 12);

    const compressAll = async (fileList) => {
      try {
        const compressed = await Promise.all(
          fileList.map((f) => compressImageFile(f, 1200, 0.8))
        );
        setFormData((prev) => ({ ...prev, photos: compressed }));
      } catch (err) {
        console.error("Image compression failed:", err);
        // Fallback: use original files
        setFormData((prev) => ({ ...prev, photos: limitedFiles }));
      }
    };
    compressAll(limitedFiles);
  };

  const compressImageFile = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) return resolve(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            // Preserve original filename when possible
            const newFile = new File([blob], file.name, { type: blob.type });
            resolve(newFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      // Support blob URL or file object
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.src = ev.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!user || !getId(user) || !token) {
      setError("User not authenticated. Please log in.");
      setIsSubmitting(false);
      return;
    }
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "photos") {
          value.forEach((file) => formPayload.append("photos", file));
        } else {
          formPayload.append(key, value);
        }
      });
      formPayload.append("addedBy", getId(user));
      const response = await axios.post(`${API_BASE}/api/cars`, formPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        navigate("/admin");
      } else {
        setError(response.data.message || "Failed to add car");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.join(", ") ||
          err.message ||
          "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin");

  return (
    <div style={styles.container}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
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
                    style={{ verticalAlign: "middle", marginRight: 8 }}
                  >
                    error
                  </i>
                  {error}
                </div>
              )}

              <form
                id="addCarForm"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
              >
                <div className="form-grid">
                  <div className="form-group col-3">
                    <label className="form-label required">Make</label>
                    <input
                      type="text"
                      name="make"
                      className="form-control"
                      required
                      value={formData.make}
                      onChange={handleChange}
                      placeholder="Enter car make (e.g., Toyota, Honda)"
                    />
                  </div>

                  <div className="form-group col-3">
                    <label className="form-label required">Model</label>
                    <input
                      type="text"
                      name="model"
                      className="form-control"
                      required
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Enter car model (e.g., Camry, Civic)"
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">Variant</label>
                    <input
                      type="text"
                      name="variant"
                      className="form-control"
                      required
                      value={formData.variant}
                      onChange={handleChange}
                      placeholder="Enter car variant (e.g., GL, LXI, VXI)"
                    />
                  </div>

                  <div className="form-group col-2">
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
                      <option value="Diesel">Diesel</option>
                      <option value="EV">Electric</option>
                      <option value="CNG">CNG</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">Model Year</label>
                    <input
                      type="number"
                      name="modelYear"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="form-control"
                      required
                      value={formData.modelYear}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">
                      Registration Year
                    </label>
                    <input
                      type="number"
                      name="registrationYear"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="form-control"
                      required
                      value={formData.registrationYear}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">Color</label>
                    <input
                      type="text"
                      name="color"
                      className="form-control"
                      required
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Enter car color"
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">Chassis No</label>
                    <input
                      type="text"
                      name="chassisNo"
                      className="form-control"
                      required
                      value={formData.chassisNo}
                      onChange={handleChange}
                      placeholder="Enter chassis number"
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">Engine No</label>
                    <input
                      type="text"
                      name="engineNo"
                      className="form-control"
                      required
                      value={formData.engineNo}
                      onChange={handleChange}
                      placeholder="Enter engine number"
                    />
                  </div>

                  <div className="form-group col-2">
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

                  <div className="form-group col-2">
                    <label className="form-label required">Ownership</label>
                    <select
                      name="ownership"
                      className="form-control select"
                      required
                      value={formData.ownership}
                      onChange={handleChange}
                    >
                      <option value="">Select Ownership</option>
                      <option value="1st Own">1st Own</option>
                      <option value="2nd Own">2nd Own</option>
                      <option value="3rd Own">3rd Own</option>
                      <option value="4th Own">4th Own</option>
                    </select>
                  </div>

                  <div className="form-group col-2">
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

                  <div className="form-group col-2">
                    <label className="form-label required">
                      Buying Price (₹)
                    </label>
                    <input
                      type="number"
                      name="buyingPrice"
                      min="0"
                      className="form-control"
                      required
                      value={formData.buyingPrice}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">
                      Quoting Price (₹)
                    </label>
                    <input
                      type="number"
                      name="quotingPrice"
                      min="0"
                      className="form-control"
                      required
                      value={formData.quotingPrice}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      min="0"
                      className="form-control"
                      required
                      value={formData.sellingPrice}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group col-2">
                    <label className="form-label required">Status</label>
                    <select
                      name="status"
                      className="form-control select"
                      required
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Available">Available</option>
                      <option value="Sold Out">Sold Out</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">
                      Photos (10-12)
                    </label>
                    <input
                      type="file"
                      name="photos"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      required
                    />
                    {formData.photos && formData.photos.length > 0 && (
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
                      >
                        {Array.from(formData.photos).map((file, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: 100,
                              height: 100,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={
                                typeof file === "string"
                                  ? file
                                  : URL.createObjectURL(file)
                              }
                              alt={`Preview ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-start", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn btn-outlined"
                    onClick={handleCancel}
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Add Car"}
                  </button>
                </div>
              </form>
            </div>
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
    backgroundColor: "#FFFFFF",
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: "280px",
    backgroundColor: "#2B2B2B",
    color: "#FFFFFF",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
    position: "sticky",
    top: 0,
    height: "100vh",
    /* kept flat dark background to match the 4-color palette */
  },
  sidebarHeader: {
    padding: "24px",
    borderBottom: "1px solid #B3B3B3",
  },
  sidebarTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  sidebarSubtitle: {
    fontSize: "0.875rem",
    color: "#D4D4D4",
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
    color: "#D4D4D4",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ":hover": {
      backgroundColor: "#B3B3B3",
    },
  },
  menuItemActive: {
    backgroundColor: "#B3B3B3",
    borderRight: "3px solid #D4D4D4",
    color: "#2B2B2B",
  },
  menuItemContent: {
    display: "flex",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: "12px",
    color: "#D4D4D4",
  },
  menuText: {
    fontSize: "0.9375rem",
    fontWeight: "500",
  },
  submenu: {
    backgroundColor: "#2B2B2B",
  },
  submenuItem: {
    padding: "10px 24px 10px 64px",
    cursor: "pointer",
    color: "#D4D4D4",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#B3B3B3",
    },
  },
  submenuItemActive: {
    backgroundColor: "#D4D4D4",
    color: "#2B2B2B",
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
    backgroundColor: "#FFFFFF",
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
    color: "#2B2B2B",
    margin: 0,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#B3B3B3",
    margin: "8px 0 0 0",
    textAlign: "center",
  },
};

export default AddCarForm;
