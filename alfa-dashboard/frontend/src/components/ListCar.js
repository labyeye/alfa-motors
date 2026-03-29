import { useState, useEffect } from "react";
import { formatIndian } from "../utils/formatIndian";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit, Trash2, Car, Fuel, Gauge, Tag } from "lucide-react";
import Sidebar from "./Sidebar";

const ListCar = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState("List Car Data");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const API_BASE = "https://alfa-motors-9bk6.vercel.app";
  const getId = (obj) => (obj && (obj.id || obj._id)) || null;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // response.data.data may be undefined depending on API response shape;
        // ensure we always store an array to avoid `.map` on undefined.
        setCars(response.data?.data || response.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch cars");
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleEdit = (carId) => {
    navigate(`/car/edit/${carId}`);
  };

  const handleDelete = async (carId) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/api/cars/${carId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // use functional update and guard against undefined/current not being an array
        setCars((current) =>
          Array.isArray(current)
            ? current.filter((car) => getId(car) !== carId)
            : [],
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete car");
      }
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div style={styles.mainContent} className="dashboard-main-content">
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
          ) : isMobile ? (
            /* ─── MOBILE: card list ─── */
            <div style={styles.cardList}>
              {(Array.isArray(cars) ? cars : []).map((car) => {
                const statusStyle =
                  car.status === "Available"
                    ? styles.statusAvailable
                    : car.status === "Coming Soon"
                      ? styles.statusComingSoon
                      : styles.statusSoldOut;
                return (
                  <div
                    key={getId(car) || Math.random()}
                    style={styles.mobileCard}
                  >
                    {/* top row: name + status */}
                    <div style={styles.mobileCardHeader}>
                      <div style={styles.mobileCarName}>
                        <Car
                          size={15}
                          style={{ marginRight: 6, color: "#6b7280" }}
                        />
                        <span style={styles.mobileCarNameText}>
                          {car.modelYear} {car.make} {car.model}
                        </span>
                      </div>
                      <span style={{ ...styles.statusBadge, ...statusStyle }}>
                        {car.status}
                      </span>
                    </div>

                    {/* stats row */}
                    <div style={styles.mobileCardStats}>
                      <div style={styles.mobileStat}>
                        <Gauge size={13} color="#9ca3af" />
                        <span style={styles.mobileStatLabel}>KM</span>
                        <span style={styles.mobileStatValue}>
                          {car.kmDriven != null
                            ? Number(car.kmDriven).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                      <div style={styles.mobileStat}>
                        <Fuel size={13} color="#9ca3af" />
                        <span style={styles.mobileStatLabel}>Fuel</span>
                        <span style={styles.mobileStatValue}>
                          {car.fuelType || "-"}
                        </span>
                      </div>
                      <div style={styles.mobileStat}>
                        <Tag size={13} color="#9ca3af" />
                        <span style={styles.mobileStatLabel}>Own</span>
                        <span style={styles.mobileStatValue}>
                          {car.ownership || "-"}
                        </span>
                      </div>
                    </div>

                    {/* prices */}
                    <div style={styles.mobilePrices}>
                      <div style={styles.mobilePrice}>
                        <span style={styles.mobilePriceLabel}>Buying</span>
                        <span style={styles.mobilePriceValue}>
                          ₹{formatIndian(car.buyingPrice)}
                        </span>
                      </div>
                      <div style={styles.mobilePriceDivider} />
                      <div style={styles.mobilePrice}>
                        <span style={styles.mobilePriceLabel}>Quoting</span>
                        <span style={styles.mobilePriceValue}>
                          ₹{formatIndian(car.quotingPrice)}
                        </span>
                      </div>
                      <div style={styles.mobilePriceDivider} />
                      <div style={styles.mobilePrice}>
                        <span style={styles.mobilePriceLabel}>Selling</span>
                        <span
                          style={{
                            ...styles.mobilePriceValue,
                            color: "#16a34a",
                            fontWeight: 700,
                          }}
                        >
                          ₹{formatIndian(car.sellingPrice)}
                        </span>
                      </div>
                    </div>

                    {/* actions */}
                    <div style={styles.mobileCardActions}>
                      <button
                        onClick={() => handleEdit(getId(car))}
                        style={styles.mobileEditBtn}
                      >
                        <Edit size={14} style={{ marginRight: 4 }} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(getId(car))}
                        style={styles.mobileDeleteBtn}
                      >
                        <Trash2 size={14} style={{ marginRight: 4 }} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── DESKTOP: table ─── */
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Image</th>
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
                  {(Array.isArray(cars) ? cars : []).map((car) => (
                    <tr key={getId(car) || Math.random()} style={styles.tr}>
                      <td style={styles.td}>
                        {(() => {
                          let photoList = car.photos || [];
                          try {
                            if (typeof photoList === "string") {
                              photoList = JSON.parse(photoList);
                            }
                          } catch (e) {
                            console.error("Error parsing photos JSON:", e);
                            photoList = [];
                          }

                          let firstPhoto = null;
                          if (
                            photoList &&
                            typeof photoList === "object" &&
                            !Array.isArray(photoList)
                          ) {
                            firstPhoto = photoList.cover || null;
                          } else if (Array.isArray(photoList)) {
                            firstPhoto = photoList[0] || null;
                          }

                          return firstPhoto ? (
                            <img
                              src={firstPhoto}
                              alt={`${car.make} ${car.model}`}
                              style={styles.carThumbnail}
                            />
                          ) : (
                            <div style={styles.noImagePlaceholder}>
                              <Car size={16} color="#9ca3af" />
                            </div>
                          );
                        })()}
                      </td>
                      <td style={styles.td}>{car.make}</td>
                      <td style={styles.td}>{car.model}</td>
                      <td style={styles.td}>{car.modelYear}</td>
                      <td style={styles.td}>
                        {car.kmDriven !== undefined && car.kmDriven !== null
                          ? Number(car.kmDriven).toLocaleString()
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        ₹{formatIndian(car.buyingPrice)}
                      </td>
                      <td style={styles.td}>
                        ₹{formatIndian(car.quotingPrice)}
                      </td>
                      <td style={styles.td}>
                        ₹{formatIndian(car.sellingPrice)}
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
                          onClick={() => handleEdit(getId(car))}
                          style={styles.editButton}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(getId(car))}
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
    /* flat dark sidebar to match palette */
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
    borderTop: "1px solid #B3B3B3",
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
  loading: {
    padding: "20px",
    textAlign: "center",
    color: "#B3B3B3",
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
    backgroundColor: "#FFFFFF",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#2B2B2B",
    borderBottom: "1px solid #D4D4D4",
  },
  tr: {
    borderBottom: "1px solid #D4D4D4",
    ":hover": {
      backgroundColor: "#FFFFFF",
    },
  },
  td: {
    padding: "12px 16px",
    color: "#2B2B2B",
    verticalAlign: "middle",
  },
  carThumbnail: {
    width: "48px",
    height: "36px",
    borderRadius: "4px",
    objectFit: "cover",
    backgroundColor: "#f3f4f6",
    display: "block",
  },
  noImagePlaceholder: {
    width: "48px",
    height: "36px",
    borderRadius: "4px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#2B2B2B",
    cursor: "pointer",
    padding: "4px 8px",
    marginRight: "8px",
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: "4px 8px",
  },

  /* ─── Mobile card list ─── */
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mobileCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "14px 16px",
    border: "1px solid #f0f0f0",
  },
  mobileCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  mobileCarName: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  mobileCarNameText: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1f2937",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileCardStats: {
    display: "flex",
    gap: 12,
    marginBottom: 12,
    padding: "10px 0",
    borderTop: "1px solid #f3f4f6",
    borderBottom: "1px solid #f3f4f6",
  },
  mobileStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  mobileStatLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mobileStatValue: {
    fontSize: 12,
    color: "#374151",
    fontWeight: 600,
  },
  mobilePrices: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: "10px 12px",
  },
  mobilePrice: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  mobilePriceDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#e5e7eb",
  },
  mobilePriceLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  mobilePriceValue: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: 600,
  },
  mobileCardActions: {
    display: "flex",
    gap: 10,
  },
  mobileEditBtn: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: "8px 0",
    borderRadius: 8,
    border: "1.5px solid #d1d5db",
    backgroundColor: "#fff",
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  mobileDeleteBtn: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: "8px 0",
    borderRadius: 8,
    border: "1.5px solid #fecaca",
    backgroundColor: "#fff5f5",
    color: "#ef4444",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default ListCar;
