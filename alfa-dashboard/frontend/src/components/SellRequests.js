import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Check,
  X,
  Eye,
  Car,
  Filter,
  Search,
  RefreshCw,
  Trash,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import Sidebar from "./Sidebar";

const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-5yfh.vercel.app"
    : "https://alfa-motors-5yfh.vercel.app");

const SellRequests = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Sell Queries");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSellRequests();
  }, []);

  const fetchSellRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/sell-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRequests(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching sell requests:", err);
      setError("Failed to load sell requests");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/api/sell-requests/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRequests(
        requests.map((request) =>
          request._id === id ? response.data : request
        )
      );
      
      const statusMsg = status === "Approved" ? "approved" : "rejected";
      alert(`Request ${statusMsg} successfully!`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const deleteRequest = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this sell request? This action cannot be undone."
    );
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/api/sell-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setRequests((prev) => prev.filter((r) => r._id !== id));
      alert("Sell request deleted");
      if (selectedRequest && selectedRequest._id === id) {
        setShowModal(false);
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Error deleting sell request:", err);
      alert("Failed to delete request. Please try again.");
    }
  };

  const viewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const buildImageUrl = (imagePath) => {
    if (!imagePath) return "/assets/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}/uploads/${imagePath}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#f59e0b";
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.sellerPhone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      request.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div style={styles.mainContent}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p>Loading sell requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div style={styles.mainContent}>
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retryButton} onClick={fetchSellRequests}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div style={styles.mainContent}>
        <div style={styles.contentPadding}>
          
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Sell Queries</h1>
              <p style={styles.pageSubtitle}>
                Manage customer vehicle sell requests and inquiries
              </p>
            </div>
          </div>

          
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{requests.length}</h3>
              <p style={styles.statLabel}>Total Requests</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={{ ...styles.statNumber, color: "#f59e0b" }}>
                {requests.filter((r) => r.status === "Pending").length}
              </h3>
              <p style={styles.statLabel}>Pending</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={{ ...styles.statNumber, color: "#10b981" }}>
                {requests.filter((r) => r.status === "Approved").length}
              </h3>
              <p style={styles.statLabel}>Approved</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={{ ...styles.statNumber, color: "#ef4444" }}>
                {requests.filter((r) => r.status === "Rejected").length}
              </h3>
              <p style={styles.statLabel}>Rejected</p>
            </div>
          </div>

          
          <div style={styles.filtersContainer}>
            <div style={styles.searchContainer}>
              <Search size={20} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by brand, model, seller name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.filterContainer}>
              <Filter size={16} style={styles.filterIcon} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          
          <div style={styles.section}>
            {filteredRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <Car
                  size={48}
                  style={{ color: "#94a3b8", marginBottom: "16px" }}
                />
                <h3 style={{ color: "#64748b", margin: "0 0 8px 0" }}>
                  {requests.length === 0
                    ? "No sell requests yet"
                    : "No requests match your filters"}
                </h3>
                <p style={{ color: "#94a3b8", margin: 0 }}>
                  {requests.length === 0
                    ? "Customer sell requests will appear here"
                    : "Try adjusting your search or filter criteria"}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>#</th>
                      <th style={styles.tableHeader}>Images</th>
                      <th style={styles.tableHeader}>Vehicle</th>
                      <th style={styles.tableHeader}>Year</th>
                      <th style={styles.tableHeader}>Seller</th>
                      <th style={styles.tableHeader}>Phone</th>
                      <th style={styles.tableHeader}>Email</th>
                      <th style={styles.tableHeader}>Expected Price</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request, idx) => (
                      <tr key={request._id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{idx + 1}</td>
                        <td style={styles.tableCell}>
                          {request.images && request.images.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <img
                                src={buildImageUrl(request.images[0])}
                                alt={`${request.brand} ${request.model}`}
                                style={styles.vehicleImage}
                                onClick={() =>
                                  window.open(
                                    buildImageUrl(request.images[0]),
                                    "_blank"
                                  )
                                }
                              />
                              {request.images.length > 1 && (
                                <div style={styles.moreImages}>
                                  +{request.images.length - 1}
                                </div>
                              )}
                            </div>
                          ) : (
                            <img
                              src="/assets/placeholder.png"
                              style={styles.vehicleImage}
                              alt="placeholder"
                            />
                          )}
                        </td>
                        <td style={styles.tableCell}>
                          {request.brand} {request.model}
                        </td>
                        <td style={styles.tableCell}>{request.year}</td>
                        <td style={styles.tableCell}>{request.sellerName}</td>
                        <td style={styles.tableCell}>{request.sellerPhone}</td>
                        <td style={styles.tableCell}>{request.sellerEmail}</td>
                        <td style={styles.tableCell}>
                          ₹{request.expectedPrice?.toLocaleString()}
                        </td>
                        <td style={styles.tableCell}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: getStatusColor(request.status),
                            }}
                          >
                            {request.status || "Pending"}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={styles.viewButton}
                              onClick={() => viewRequest(request)}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            {(user?.isAdmin || user?.role === "admin") && (
                              <button
                                style={styles.deleteButton}
                                onClick={() => deleteRequest(request._id)}
                              >
                                <Trash size={14} />
                                Delete
                              </button>
                            )}
                            {request.status === "Pending" && (
                              <>
                                <button
                                  style={styles.approveButton}
                                  onClick={() =>
                                    updateStatus(request._id, "Approved")
                                  }
                                >
                                  <Check size={14} />
                                  Approve
                                </button>
                                <button
                                  style={styles.rejectButton}
                                  onClick={() =>
                                    updateStatus(request._id, "Rejected")
                                  }
                                >
                                  <X size={14} />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
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

      {/* Modal for viewing request details */}
      {showModal && selectedRequest && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {selectedRequest.brand} {selectedRequest.model} (
                {selectedRequest.year})
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalContent}>
              {/* Images */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div style={styles.modalImagesContainer}>
                  <h3 style={styles.modalSectionTitle}>Vehicle Images</h3>
                  <div style={styles.modalImagesGrid}>
                    {selectedRequest.images.map((image, index) => (
                      <img
                        key={index}
                        src={buildImageUrl(image)}
                        alt={`${selectedRequest.brand} ${selectedRequest.model}`}
                        style={styles.modalImage}
                        onClick={() =>
                          window.open(buildImageUrl(image), "_blank")
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div style={styles.modalDetailsGrid}>
                <div>
                  <h3 style={styles.modalSectionTitle}>Vehicle Details</h3>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Brand:</span>
                    <span>{selectedRequest.brand}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Model:</span>
                    <span>{selectedRequest.model}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Year:</span>
                    <span>{selectedRequest.year}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Expected Price:</span>
                    <span>
                      ₹{selectedRequest.expectedPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 style={styles.modalSectionTitle}>Seller Information</h3>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Name:</span>
                    <span>{selectedRequest.sellerName}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Phone:</span>
                    <span>{selectedRequest.sellerPhone}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Email:</span>
                    <span>{selectedRequest.sellerEmail}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Status:</span>
                    <span
                      style={{
                        ...styles.statusBadgeSmall,
                        backgroundColor: getStatusColor(selectedRequest.status),
                      }}
                    >
                      {selectedRequest.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              {selectedRequest.status === "Pending" && (
                <>
                  <button
                    style={styles.modalApproveButton}
                    onClick={() => {
                      updateStatus(selectedRequest._id, "Approved");
                      setShowModal(false);
                    }}
                  >
                    <Check size={16} />
                    Approve Request
                  </button>
                  <button
                    style={styles.modalRejectButton}
                    onClick={() => {
                      updateStatus(selectedRequest._id, "Rejected");
                      setShowModal(false);
                    }}
                  >
                    <X size={16} />
                    Reject Request
                  </button>
                </>
              )}
              {(user?.isAdmin || user?.role === "admin") && (
                <button
                  style={styles.modalDeleteButton}
                  onClick={() => {
                    deleteRequest(selectedRequest._id);
                  }}
                >
                  <Trash size={16} />
                  Delete
                </button>
              )}
              <button
                style={styles.modalCloseButton}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
    height: "50vh",
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
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "50vh",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "1.1rem",
    marginBottom: "16px",
  },
  retryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
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
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    margin: "8px 0 0 0",
    textAlign: "center",
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s",
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
  filtersContainer: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchContainer: {
    position: "relative",
    flex: 1,
    minWidth: "300px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },
  searchInput: {
    width: "85%",
    padding: "12px 12px 12px 40px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "white",
    padding: "8px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
  },
  filterIcon: {
    color: "#6b7280",
  },
  filterSelect: {
    border: "none",
    outline: "none",
    fontSize: "0.875rem",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  requestsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
  },
  requestCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  cardYear: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "white",
  },
  statusBadgeSmall: {
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "white",
  },
  imagesContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  vehicleImage: {
    width: "60px",
    height: "45px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  moreImages: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "60px",
    height: "45px",
    backgroundColor: "#e5e7eb",
    borderRadius: "6px",
    fontSize: "0.75rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  sellerInfo: {
    marginBottom: "16px",
  },
  sellerDetail: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  sellerName: {
    fontWeight: "600",
    color: "#1e293b",
  },
  icon: {
    color: "#6b7280",
    flexShrink: 0,
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  viewButton: {
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
  approveButton: {
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
    transition: "background-color 0.2s",
  },
  rejectButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: 0,
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90%",
    overflow: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
  },
  modalContent: {
    padding: "24px",
  },
  modalImagesContainer: {
    marginBottom: "24px",
  },
  modalSectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  modalImagesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px",
  },
  modalImage: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  modalDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "0.875rem",
  },
  detailLabel: {
    fontWeight: "500",
    color: "#6b7280",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  modalApproveButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  modalRejectButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  modalCloseButton: {
    padding: "10px 16px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  deleteButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  modalDeleteButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  /* Table styles */
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    textAlign: "left",
    padding: "12px",
    fontSize: "0.875rem",
    color: "#475569",
    borderBottom: "2px solid #e6edf3",
    backgroundColor: "#fbfdff",
  },
  tableRow: {
    borderBottom: "1px solid #eef2f7",
  },
  tableCell: {
    padding: "12px",
    verticalAlign: "middle",
    fontSize: "0.9rem",
    color: "#334155",
  },
};

export default SellRequests;
