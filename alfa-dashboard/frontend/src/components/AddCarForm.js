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

  const API_BASE = "https://alfa-motors-5yfh.vercel.app";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photos: Array.from(e.target.files) }));
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
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "photos") {
          value.forEach((file) => formPayload.append("photos", file));
        } else {
          formPayload.append(key, value);
        }
      });
      formPayload.append("addedBy", user._id);
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
                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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
                      <option value="Diesel">Diesel</option>
                      <option value="EV">Electric</option>
                      <option value="CNG">CNG</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                  <div className="form-group">
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

                <div className="form-actions">
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
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    margin: "8px 0 0 0",
    textAlign: "center",
  },
};

export default AddCarForm;
