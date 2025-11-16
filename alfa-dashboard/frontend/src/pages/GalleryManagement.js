import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, Edit, Plus, ExternalLink } from "lucide-react";
import Sidebar from "../components/Sidebar";

const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-5yfh.vercel.app"
    : "https://alfa-motors-5yfh.vercel.app");

const GalleryManagement = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Gallery Management");
  const [soldCars, setSoldCars] = useState([]);
  const [uploadingIds, setUploadingIds] = useState([]);
  const [, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery items and edit UI state
  const [galleryItems, setGalleryItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editTestimonial, setEditTestimonial] = useState("");

  // Helper to read id from objects that may have either `id` (SQL) or `_id` (Mongo)
  const getId = (obj) => (obj && (obj.id || obj._id)) || null;

  useEffect(() => {
    fetchData();
  }, []);

  // Debug effect to monitor galleryItems state changes
  useEffect(() => {
    console.log(
      "Gallery items state changed:",
      galleryItems.length,
      galleryItems
    );
  }, [galleryItems]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching gallery items...");
      const galleryResp = await axios.get(`${API_BASE}/api/gallery`);
      const galleryItemsData = galleryResp.data.data || [];
      console.log(
        "Gallery items fetched:",
        galleryItemsData.length,
        galleryItemsData
      );
      setGalleryItems(galleryItemsData);

      // Fetch all cars to manage which ones appear in gallery
      console.log("Fetching all cars...");
      const allResponse = await axios.get(`${API_BASE}/api/cars`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const allCarsData = allResponse.data.data || [];
      console.log("All cars fetched:", allCarsData.length);
      setAllCars(allCarsData);

      console.log("Data fetch completed successfully");
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.response?.data);
      // Set empty arrays on error to prevent undefined state
      setSoldCars([]);
      setGalleryItems([]);
      setAllCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSoldPhotos = async (carId, files) => {
    if (!files || files.length === 0) return;

    setUploadingIds((prev) => [...prev, carId]);
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let successCount = 0;
    let failCount = 0;

    // Show initial progress
    alert(`Starting upload of ${totalFiles} photo(s) for this car...`);

    // Upload files one by one
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fd = new FormData();
      fd.append("photo", file);
      fd.append("carId", carId);

      try {
        // Try the new gallery endpoint first
        const res = await axios.post(`${API_BASE}/api/gallery`, fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const galleryItem = res.data?.data;
        // Also update soldCars state by adding the filename to sold.customerPhotos for immediate UI reflection
        if (galleryItem && galleryItem.filename) {
          setSoldCars((prev) =>
            prev.map((c) =>
              getId(c) === carId
                ? {
                    ...c,
                    sold: {
                      ...(c.sold || {}),
                      customerPhotos: [
                        ...((c.sold && c.sold.customerPhotos) || []),
                        galleryItem.filename,
                      ],
                    },
                  }
                : c
            )
          );
          setGalleryItems((prev) => [galleryItem, ...prev]);
        }
        successCount++;
      } catch (err) {
        console.warn(
          "Gallery upload failed, trying fallback:",
          err?.response?.status
        );
        try {
          // Fallback to existing endpoint for backward compatibility
          const res2 = await axios.post(
            `${API_BASE}/api/cars/${carId}/sold-photo`,
            fd,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          const updatedSold = res2.data?.data?.sold;
          setSoldCars((prev) =>
            prev.map((c) =>
              getId(c) === carId ? { ...c, sold: updatedSold } : c
            )
          );
          successCount++;
        } catch (err2) {
          console.error(`Upload failed for file ${i + 1}:`, err2);
          failCount++;
        }
      }
    }

    // Show final result
    if (successCount === totalFiles) {
      alert(`All ${totalFiles} photo(s) uploaded successfully for this car!`);
    } else if (successCount > 0) {
      alert(
        `${successCount} of ${totalFiles} photo(s) uploaded successfully. ${failCount} failed.`
      );
    } else {
      alert(`Failed to upload all ${totalFiles} photo(s). Please try again.`);
    }

    setUploadingIds((prev) => prev.filter((id) => id !== carId));
  };

  // Edit handlers
  const startEdit = (item) => {
    setEditingId(getId(item));
    setEditCaption(item.caption || "");
    setEditTestimonial(item.testimonial || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCaption("");
    setEditTestimonial("");
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/gallery/${id}`,
        { caption: editCaption, testimonial: editTestimonial },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const updated = res.data.data;
      setGalleryItems((prev) =>
        prev.map((it) => (getId(it) === id ? updated : it))
      );
      // Also update soldCars testimonial if present
      setSoldCars((prev) =>
        prev.map((c) =>
          getId(c) === updated.car
            ? {
                ...c,
                sold: { ...(c.sold || {}), testimonial: updated.testimonial },
              }
            : c
        )
      );
      cancelEdit();
      alert("Gallery item updated");
    } catch (err) {
      console.error("Update failed", err);
      alert(err.response?.data?.error || "Failed to update");
    }
  };

  const deleteItem = async (id) => {
    if (
      !window.confirm(
        "Delete this gallery item? This will remove the image file and detach it from any car."
      )
    )
      return;
    try {
      await axios.delete(`${API_BASE}/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGalleryItems((prev) => prev.filter((it) => getId(it) !== id));
      // Also refresh soldCars to reflect possible removal
      fetchData();
      alert("Gallery item deleted");
    } catch (err) {
      console.error("Delete failed", err);
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleDirectUpload = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let successCount = 0;
    let failCount = 0;

    // Show initial progress
    alert(`Starting upload of ${totalFiles} photo(s)...`);

    // Upload files one by one
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fd = new FormData();
      fd.append("photo", file);

      try {
        const res = await axios.post(`${API_BASE}/api/gallery`, fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const galleryItem = res.data?.data;
        if (galleryItem) {
          setGalleryItems((prev) => [galleryItem, ...prev]);
          successCount++;
        }
      } catch (err) {
        console.error(`Upload failed for file ${i + 1}:`, err);
        failCount++;
      }
    }

    // Show final result
    if (successCount === totalFiles) {
      alert(`All ${totalFiles} photo(s) uploaded successfully!`);
    } else if (successCount > 0) {
      alert(
        `${successCount} of ${totalFiles} photo(s) uploaded successfully. ${failCount} failed.`
      );
    } else {
      alert(`Failed to upload all ${totalFiles} photo(s). Please try again.`);
    }
  };

  const buildImageUrl = (file) => {
    if (!file) return "/assets/placeholder.png";
    if (file.startsWith("http") || file.startsWith("/")) return file;
    const filename = file.replace("carimages/", "");
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
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

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
                href="/https://www.alfamotorworld.com/happy-customers.html"
                target="_blank"
                style={styles.viewGalleryButton}
              >
                <ExternalLink size={16} />
                View Public Gallery
              </a>
              <button
                style={{
                  ...styles.viewGalleryButton,
                  backgroundColor: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Delete ALL gallery images and testimonials? This cannot be undone."
                    )
                  )
                    return;
                  try {
                    const resp = await axios.delete(`${API_BASE}/api/gallery`, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                    });
                    if (resp.data && resp.data.success) {
                      setGalleryItems([]);
                      // Refresh soldCars to remove references
                      fetchData();
                      alert(
                        `Deleted ${resp.data.deletedCount || 0} gallery files`
                      );
                    } else {
                      alert("Failed to delete all gallery items");
                    }
                  } catch (err) {
                    console.error("Delete all failed", err);
                    alert(
                      err.response?.data?.message ||
                        err.response?.data?.error ||
                        "Failed to delete all gallery items"
                    );
                  }
                }}
              >
                Delete All
              </button>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{soldCars.length}</h3>
              <p style={styles.statLabel}>Cars in Gallery</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>
                {soldCars.filter((car) => car.sold?.testimonial).length}
              </h3>
              <p style={styles.statLabel}>With Testimonials</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>
                {
                  soldCars.filter((car) => car.sold?.customerPhotos?.length > 0)
                    .length
                }
              </h3>
              <p style={styles.statLabel}>With Customer Photos</p>
            </div>
          </div>

          {/* Upload Section */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 12px 0" }}>Upload New Photo</h2>
            <div
              style={{
                padding: 16,
                backgroundColor: "#f8fafc",
                borderRadius: 8,
                border: "2px dashed #cbd5e1",
              }}
            >
              <label
                style={{
                  display: "block",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleDirectUpload(e.target.files);
                    }
                    e.target.value = "";
                  }}
                />
                <div style={{ padding: 20 }}>
                  <Camera
                    size={48}
                    style={{ color: "#94a3b8", marginBottom: 16 }}
                  />
                  <p style={{ margin: 0, color: "#64748b", fontWeight: 500 }}>
                    Click to upload photos to gallery
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                    }}
                  >
                    Select multiple JPG, PNG, WEBP files up to 5MB each
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Management table */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 12px 0" }}>Uploaded Gallery Items</h2>
            {galleryItems.length === 0 ? (
              <p style={{ color: "#64748b" }}>No gallery items yet</p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  background: "#fff",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Preview</th>
                      <th style={styles.th}>Car</th>
                      <th style={styles.th}>Caption</th>
                      <th style={styles.th}>Testimonial</th>
                      <th style={styles.th}>Uploaded By</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {galleryItems.map((item) => (
                      <tr
                        key={item._id}
                        style={{ borderTop: "1px solid #e6eef8" }}
                      >
                        <td style={styles.td}>
                          <img
                            src={buildImageUrl(item.filename)}
                            alt={item.caption || "gallery"}
                            style={{
                              width: 80,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        </td>
                        <td style={styles.td}>
                          {item.car ? `${item.car}` : "—"}
                        </td>
                        <td style={styles.td}>
                          {editingId === item._id ? (
                            <input
                              value={editCaption}
                              onChange={(e) => setEditCaption(e.target.value)}
                              style={{ width: "100%" }}
                            />
                          ) : (
                            item.caption || "—"
                          )}
                        </td>
                        <td style={styles.td}>
                          {editingId === item._id ? (
                            <input
                              value={editTestimonial}
                              onChange={(e) =>
                                setEditTestimonial(e.target.value)
                              }
                              style={{ width: "100%" }}
                            />
                          ) : (
                            item.testimonial || "—"
                          )}
                        </td>
                        <td style={styles.td}>
                          {item.uploadedBy?.username || "—"}
                        </td>
                        <td style={styles.td}>
                          {editingId === item._id ? (
                            <>
                              <button
                                style={styles.smallButton}
                                onClick={() => saveEdit(item._id)}
                              >
                                Save
                              </button>
                              <button
                                style={styles.smallButtonSecondary}
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                style={styles.smallButton}
                                onClick={() => startEdit(item)}
                              >
                                Edit
                              </button>
                              <button
                                style={styles.smallButtonDanger}
                                onClick={() => deleteItem(item._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Happy Customer Gallery</h2>
            {soldCars.length === 0 ? (
              <div style={styles.emptyState}>
                <Camera
                  size={48}
                  style={{ color: "#94a3b8", marginBottom: "16px" }}
                />
                <h3 style={{ color: "#64748b", margin: "0 0 8px 0" }}>
                  No sold cars in gallery yet
                </h3>
                <p style={{ color: "#94a3b8", margin: 0 }}>
                  Mark cars as sold and add customer testimonials to build your
                  gallery
                </p>
              </div>
            ) : (
              <div style={styles.galleryGrid}>
                {soldCars.map((car) => (
                  <div key={car._id} style={styles.galleryCard}>
                    <div style={styles.cardImage}>
                      <img
                        src={buildImageUrl(
                          (car.sold?.customerPhotos &&
                            car.sold.customerPhotos[0]) ||
                            (car.photos && car.photos[0])
                        )}
                        alt={`${car.make} ${car.model}`}
                        style={styles.cardImg}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/placeholder.png";
                        }}
                      />
                      <div style={styles.soldBadge}>SOLD</div>
                    </div>
                    <div style={styles.cardContent}>
                      <h3 style={styles.cardTitle}>
                        {car.make} {car.model} {car.variant} ({car.modelYear})
                      </h3>
                      {car.sold?.customerName && (
                        <p style={styles.customerName}>
                          👤 {car.sold.customerName}
                        </p>
                      )}
                      {car.sold?.testimonial && (
                        <p style={styles.testimonial}>
                          "{car.sold.testimonial}"
                        </p>
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
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0)
                                handleAddSoldPhotos(car._id, e.target.files);
                              e.target.value = "";
                            }}
                          />
                          <button
                            style={styles.uploadButton}
                            disabled={uploadingIds.includes(car._id)}
                          >
                            <Plus size={14} />
                            {uploadingIds.includes(car._id)
                              ? "Uploading..."
                              : "Add Photos"}
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
    borderLeftColor: "#2D2D2D",
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
    borderRight: "3px solid #2D2D2D",
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
    backgroundColor: "#2D2D2D",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  uploadLabel: {
    display: "inline-block",
  },
  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    color: "#334155",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  td: {
    padding: "10px 12px",
    color: "#475569",
    fontSize: "0.9rem",
    verticalAlign: "middle",
  },
  smallButton: {
    padding: "6px 10px",
    marginRight: 8,
    backgroundColor: "#2D2D2D",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  smallButtonSecondary: {
    padding: "6px 10px",
    marginRight: 8,
    backgroundColor: "#94a3b8",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  smallButtonDanger: {
    padding: "6px 10px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
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
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  viewGalleryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#2D2D2D",
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
};

export default GalleryManagement;
