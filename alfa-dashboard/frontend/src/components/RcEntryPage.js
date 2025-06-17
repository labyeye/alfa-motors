import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ChevronLeft,
  Save,
  Upload,
  Download,
  Check,
  X,
  LayoutDashboard,
  TrendingUp,
  Wrench,
  Users,
  LogOut,
  CarFront,
  ChevronDown,
  ChevronRight,
  Car,
  Bike,
} from "lucide-react";
import useMediaQuery from "react-responsive";
import AuthContext from "../context/AuthContext";
import logo from "../images/company.png";

const RcEntryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rcId, setRcId] = useState(null);

  const [formData, setFormData] = useState({
    vehicleName: "",
    vehicleRegNo: "",
    ownerName: "",
    ownerPhone: "",
    applicantName: "",
    applicantPhone: "",
    work: "",
    dealerName: "",
    rtoAgentName: "",
    remarks: "",
    status: {
      rcTransferred: false,
      rtoFeesPaid: false,
    },
  });
  const { user } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState("RC Entry");
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
    ...(user?.role !== "staff"
      ? [
          {
            name: "Staff",
            icon: Users,
            submenu: [
              { name: "Create Staff ID", path: "/staff/create" },
              { name: "Staff List", path: "/staff/list" },
            ],
          },
        ]
      : []),
    {
      name: "Vehicle History",
      icon: Bike,
      path: "/bike-history",
    },
  ];

  useEffect(() => {
    // Check if we're editing an existing RC entry
    const pathParts = window.location.pathname.split("/");
    if (pathParts.includes("edit") && pathParts.length > 2) {
      const id = pathParts[pathParts.length - 1];
      setIsEditMode(true);
      setRcId(id);
      fetchRcEntry(id);
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
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

  const fetchRcEntry = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://alfa-motors.onrender.com/api/rc/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to fetch RC entry";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFormData(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching RC entry:", error);
      setError(
        error.message || "Failed to load RC entry. Please try again later."
      );
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "rcTransferred" || name === "rtoFeesPaid") {
      setFormData((prev) => ({
        ...prev,
        status: {
          ...prev.status,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      const payload = {
        ...formData,
        createdBy: user.id,
      };

      if (isEditMode) {
        response = await fetch(`https://alfa-motors.onrender.com/api/rc/${rcId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("https://alfa-motors.onrender.com/api/rc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        // Better error handling for non-JSON responses
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // If response is HTML or other format, get text
            const errorText = await response.text();
            console.error("Server returned non-JSON response:", errorText);
            errorMessage = `Server error (${response.status}). Check console for details.`;
          }
        } catch (parseError) {
          console.error("Error parsing server response:", parseError);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess("RC entry saved successfully!");

      
      if (!isEditMode) {
        navigate(`/rc/list`);
        setRcId(data.data._id);
        setIsEditMode(true);
      }

      if (pdfFile) {
        await uploadPdf(data.data._id);
      }
    } catch (error) {
      console.error("Error saving RC entry:", error);
      setError(error.message || "Failed to save RC entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadPdf = async (id) => {
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await fetch(
        `https://alfa-motors.onrender.com/api/rc/${id}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to upload PDF";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        pdfUrl: data.data.pdfUrl,
      }));
      setPdfFile(null);
      setSuccess("PDF uploaded successfully!");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setError(error.message || "Failed to upload PDF. Please try again.");
    }
  };

  const downloadPdf = () => {
    if (!formData.pdfUrl) return;
    window.open(`https://alfa-motors.onrender.com${formData.pdfUrl}`, "_blank");
  };

  return (
    <div style={styles.container}>
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
      <div style={styles.mainContent}>
        {error && (
          <div style={styles.alertError}>
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.alertSuccess}>
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Vehicle Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Vehicle Details</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Vehicle Name</label>
                <input
                  type="text"
                  name="vehicleName"
                  value={formData.vehicleName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Vehicle Registration No.</label>
                <input
                  type="text"
                  name="vehicleRegNo"
                  value={formData.vehicleRegNo}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  disabled={isEditMode}
                />
              </div>
            </div>

            {/* Owner Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Owner Details</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Owner Phone</label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Applicant Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Applicant Details</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Buyer Name</label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Buyer Phone</label>
                <input
                  type="tel"
                  name="applicantPhone"
                  value={formData.applicantPhone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Work Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Work Details</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Work Description</label>
                <input
                  type="text"
                  name="work"
                  value={formData.work}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Dealer Name</label>
                <input
                  type="text"
                  name="dealerName"
                  value={formData.dealerName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>RTO Agent Name</label>
                <input
                  type="text"
                  name="rtoAgentName"
                  value={formData.rtoAgentName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  style={{ ...styles.input, minHeight: "80px" }}
                />
              </div>
            </div>

            {/* Status */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Status</h3>
              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="rcTransferred"
                    checked={formData.status.rcTransferred}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  RC Transferred
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="rtoFeesPaid"
                    checked={formData.status.rtoFeesPaid}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  RTO Fees Paid
                </label>
              </div>
            </div>
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>RC Document</h3>
              {formData.pdfUrl ? (
                <div style={styles.pdfContainer}>
                  <p style={styles.pdfText}>PDF uploaded</p>
                  <button
                    type="button"
                    onClick={downloadPdf}
                    style={styles.pdfButton}
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <label style={styles.pdfUploadLabel}>
                    <Upload size={16} />
                    Replace PDF
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ) : (
                <div style={styles.pdfContainer}>
                  <label style={styles.pdfUploadLabel}>
                    <Upload size={16} />
                    Upload RC PDF
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      style={{ display: "none" }}
                    />
                  </label>
                  <p style={styles.pdfHint}>Max 5MB, PDF only</p>
                </div>
              )}
              {pdfFile && (
                <p style={styles.pdfFileInfo}>
                  Selected file: {pdfFile.name}
                  <button
                    type="button"
                    onClick={() => uploadPdf(rcId)}
                    style={styles.uploadButton}
                    disabled={loading}
                  >
                    {loading ? "Uploading..." : "Upload Now"}
                  </button>
                </p>
              )}
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? "Update RC Entry" : "Create RC Entry"}
                </>
              )}
            </button>
          </div>
        </form>
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

  // Sidebar Styles (keep as is)
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
  },
  menuItemHover: {
    backgroundColor: "#334155",
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
  submenuItemHover: {
    backgroundColor: "#2d3748",
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
  logoutButtonHover: {
    backgroundColor: "rgba(127, 29, 29, 0.2)",
  },

  // Main Content Styles
  mainContent: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#ffffff",
  },
  contentPadding: {
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: "16px",
    marginRight: "20px",
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "background-color 0.2s ease",
  },
  backButtonHover: {
    backgroundColor: "#e0e7ff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleIcon: {
    color: "#3b82f6",
  },
  alertError: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    border: "1px solid #fecaca",
  },
  alertSuccess: {
    backgroundColor: "#d1fae5",
    color: "#059669",
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    border: "1px solid #a7f3d0",
  },

  // Enhanced Form Styles
  form: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
    maxWidth: "100%",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "32px",
    alignItems: "start",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    flex: 1,
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 16px 0",
    paddingBottom: "8px",
    borderBottom: "2px solid #e5e7eb",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "4px",
  },
  labelRequired: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "4px",
    position: "relative",
  },
  requiredAsterisk: {
    color: "#dc2626",
    marginLeft: "4px",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    lineHeight: "1.5",
  },
  inputFocus: {
    outline: "none",
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
  },
  inputError: {
    borderColor: "#dc2626",
    boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)",
  },
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
    cursor: "not-allowed",
  },
  textarea: {
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    lineHeight: "1.5",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  select: {
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
    lineHeight: "1.5",
    cursor: "pointer",
  },
  errorMessage: {
    fontSize: "13px",
    color: "#dc2626",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  helpText: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
  },
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    lineHeight: "1.5",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#3b82f6",
    marginTop: "2px",
    flexShrink: 0,
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    lineHeight: "1.5",
  },
  radio: {
    width: "18px",
    height: "18px",
    accentColor: "#3b82f6",
    marginTop: "2px",
    flexShrink: 0,
  },

  // Enhanced PDF/File Upload Styles
  pdfContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  pdfText: {
    fontSize: "14px",
    color: "#374151",
    margin: 0,
    lineHeight: "1.5",
  },
  fileUploadZone: {
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    padding: "24px",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  fileUploadZoneHover: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  fileUploadZoneDragOver: {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
  },
  pdfButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    width: "fit-content",
    transition: "background-color 0.2s ease",
  },
  pdfButtonHover: {
    backgroundColor: "#2563eb",
  },
  pdfUploadLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    width: "fit-content",
    transition: "all 0.2s ease",
  },
  pdfUploadLabelHover: {
    backgroundColor: "#e5e7eb",
    borderColor: "#9ca3af",
  },
  pdfHint: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "8px 0 0 0",
    fontStyle: "italic",
  },
  pdfFileInfo: {
    fontSize: "14px",
    color: "#374151",
    margin: "12px 0 0 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f0f9ff",
    borderRadius: "6px",
    border: "1px solid #bae6fd",
  },
  uploadButton: {
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  uploadButtonHover: {
    backgroundColor: "#047857",
  },

  // Enhanced Form Actions
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cancelButtonHover: {
    backgroundColor: "#f9fafb",
    borderColor: "#9ca3af",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    minWidth: "120px",
    justifyContent: "center",
  },
  submitButtonHover: {
    backgroundColor: "#2563eb",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  submitButtonLoading: {
    backgroundColor: "#6b7280",
    cursor: "not-allowed",
  },

  // Responsive Design
  "@media (max-width: 768px)": {
    contentPadding: {
      padding: "16px",
    },
    form: {
      padding: "24px 16px",
    },
    formGrid: {
      gridTemplateColumns: "1fr",
      gap: "24px",
    },
    formActions: {
      flexDirection: "column-reverse",
    },
    submitButton: {
      width: "100%",
    },
    cancelButton: {
      width: "100%",
    },
  },
};

export default RcEntryPage;
