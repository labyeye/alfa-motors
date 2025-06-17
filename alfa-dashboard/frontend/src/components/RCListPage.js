import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  LogOut,
} from "lucide-react";
import {
  Input,
  Table,
  Spin,
  Alert,
  Form,
  Button,
  Modal,
  Select,
  message,
  Checkbox,
} from "antd";
import AuthContext from "../context/AuthContext";
import { ShoppingCart, LayoutDashboard, TrendingUp } from "lucide-react";
import * as XLSX from "xlsx";
import { useMediaQuery } from "react-responsive";
const { Option } = Select;
const { TextArea } = Input;

const RcListPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rcEntries, setRcEntries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState("RC Status");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    rcTransferred: null,
    rtoFeesPaid: null,
    returnedToDealer: null,
  });
  const [form] = Form.useForm();
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      backgroundColor: "#f3f4f6",
      fontFamily: "Arial, sans-serif",
      flexDirection: isMobile ? "column" : "row",
      minHeight: isMobile ? "100vh" : "100vh",
    },
    sidebar: {
      width: isMobile ? "100%" : isTablet ? "250px" : "280px",
      backgroundColor: "#1e293b",
      color: "#f8fafc",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      position: isMobile ? "relative" : "sticky",
      top: 0,
      height: isMobile ? "auto" : "100vh",
      backgroundImage: "linear-gradient(to bottom, #1e293b, #0f172a)",
    },
    sidebarHeader: {
      padding: isMobile ? "12px 16px" : isTablet ? "16px 20px" : "24px",
      borderBottom: "1px solid #334155",
      textAlign: isMobile ? "center" : "left",
    },
    sidebarTitle: {
      fontSize: isMobile ? "1rem" : isTablet ? "1.125rem" : "1.25rem",
      fontWeight: "600",
      color: "#ffffff",
      margin: 0,
    },
    sidebarSubtitle: {
      fontSize: isMobile ? "0.75rem" : isTablet ? "0.8125rem" : "0.875rem",
      color: "#94a3b8",
      margin: "4px 0 0 0",
    },
    nav: {
      padding: isMobile ? "8px 0" : isTablet ? "12px 0" : "16px 0",
      display: isMobile ? "flex" : "block",
      flexWrap: isMobile ? "wrap" : "nowrap",
      gap: isMobile ? "4px" : "0",
      justifyContent: isMobile ? "center" : "flex-start",
      flexDirection: isMobile ? "column" : "column",
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: isMobile ? "center" : "space-between",
      padding: isMobile ? "8px 12px" : isTablet ? "10px 16px" : "12px 24px",
      cursor: "pointer",
      color: "#e2e8f0",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      borderRadius: isMobile ? "6px" : "0",
      margin: isMobile ? "0 4px" : "0",
      minWidth: isMobile ? "100px" : "auto",
      fontSize: isMobile ? "0.875rem" : "1rem",
    },
    menuItemActive: {
      backgroundColor: isMobile ? "#475569" : "#334155",
      borderRight: isMobile ? "none" : "3px solid #3b82f6",
      borderBottom: isMobile ? "3px solid #3b82f6" : "none",
      color: "#ffffff",
    },
    menuItemContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "2px" : "0",
      textAlign: isMobile ? "center" : "left",
    },
    menuIcon: {
      marginRight: isMobile ? "0" : "12px",
      marginBottom: isMobile ? "2px" : "0",
      color: "#94a3b8",
      width: isMobile ? "16px" : "20px",
      height: isMobile ? "16px" : "20px",
    },
    menuText: {
      fontSize: isMobile ? "0.6875rem" : isTablet ? "0.875rem" : "0.9375rem",
      fontWeight: isMobile ? "400" : "500",
    },
    submenu: {
      backgroundColor: "#1a2536",
      display: isMobile ? "none" : "block", // Hide submenus on mobile
    },
    submenuItem: {
      padding: isMobile ? "8px 16px" : "10px 24px 10px 64px",
      cursor: "pointer",
      color: "#cbd5e1",
      fontSize: isMobile ? "0.8125rem" : "0.875rem",
      transition: "all 0.2s ease",
    },
    logoutButton: {
      display: "flex",
      alignItems: "center",
      padding: isMobile ? "8px 12px" : isTablet ? "10px 16px" : "12px 24px",
      cursor: "pointer",
      color: isMobile ? "#ffffff" : "#f87171",
      marginTop: isMobile ? "8px" : "16px",
      borderTop: isMobile ? "none" : "1px solid #334155",
      transition: "all 0.2s ease",
      borderRadius: isMobile ? "6px" : "0",
      margin: isMobile ? "8px 4px 0 4px" : "16px 0 0 0",
      justifyContent: isMobile ? "center" : "flex-start",
      backgroundColor: isMobile ? "#dc2626" : "transparent",
      fontSize: isMobile ? "0.875rem" : "1rem",
    },
    mainContent: {
      flex: 1,
      overflow: "auto",
      width: isMobile ? "100%" : "auto",
    },
    contentPadding: {
      padding: isMobile ? "12px" : isTablet ? "16px" : "32px",
    },
    header: {
      marginBottom: isMobile ? "12px" : isTablet ? "16px" : "24px",
      textAlign: isMobile ? "center" : "left",
    },
    pageTitle: {
      fontSize: isMobile ? "1.25rem" : isTablet ? "1.375rem" : "1.875rem",
      fontWeight: "bold",
      color: "#1f2937",
      margin: 0,
    },
    pageSubtitle: {
      color: "#6b7280",
      marginTop: isMobile ? "4px" : "8px",
      margin: `${isMobile ? "4px" : "8px"} 0 0 0`,
      fontSize: isMobile ? "0.8125rem" : isTablet ? "0.875rem" : "1rem",
    },
    searchContainer: {
      marginBottom: isMobile ? "12px" : isTablet ? "16px" : "24px",
      display: "flex",
      alignItems: "flex-start",
      gap: isMobile ? "8px" : "16px",
      flexWrap: "wrap",
      flexDirection: isMobile ? "column" : "row",
    },
    searchInput: {
      maxWidth: isMobile ? "100%" : "400px",
      width: isMobile ? "100%" : "auto",
    },
    searchControls: {
      display: "flex",
      gap: isMobile ? "8px" : "16px",
      flexWrap: "wrap",
      width: isMobile ? "100%" : "auto",
      flexDirection: isMobile ? "column" : "row",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "300px",
    },
    table: {
      backgroundColor: "#ffffff",
      borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      fontSize: isMobile ? "0.8125rem" : isTablet ? "0.875rem" : "1rem",
      minWidth: isMobile ? "800px" : "auto", // Set a minimum width for mobile
    },
    tableWrapper: {
      overflowX: "auto",
      WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      width: "100%",
      maxWidth: "100vw",
      margin: 0,
      padding: 0,
      display: "block",
    },
    statusContainer: {
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? "2px" : "4px",
    },
    statusActive: {
      color: "#059669",
      fontSize: isMobile ? "9px" : isTablet ? "10px" : "12px",
      backgroundColor: "#d1fae5",
      padding: isMobile ? "2px 4px" : isTablet ? "2px 6px" : "4px 8px",
      borderRadius: "4px",
      display: "inline-block",
    },
    statusInactive: {
      color: "#6b7280",
      fontSize: isMobile ? "9px" : isTablet ? "10px" : "12px",
      backgroundColor: "#f3f4f6",
      padding: isMobile ? "2px 4px" : isTablet ? "2px 6px" : "4px 8px",
      borderRadius: "4px",
      display: "inline-block",
    },
    actionsContainer: {
      display: "flex",
      gap: isMobile ? "4px" : "8px",
    },
    actionButton: {
      backgroundColor: "transparent",
      border: "none",
      color: "#3b82f6",
      cursor: "pointer",
      padding: isMobile ? "2px" : "4px",
      borderRadius: "4px",
    },
    filterDropdown: {
      position: isMobile ? "relative" : "absolute",
      backgroundColor: "#fff",
      padding: isMobile ? "8px" : isTablet ? "12px" : "16px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      zIndex: 10000,
      marginTop: isMobile ? "0" : "8px",
      display: "flex",
      gap: isMobile ? "8px" : isTablet ? "12px" : "16px",
      width: isMobile ? "100%" : "auto",
      flexDirection: isMobile ? "column" : "row",
    },
    filterGroup: {
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? "4px" : "8px",
    },
    filterLabel: {
      fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
      color: "#666",
    },
    responsiveButton: {
      fontSize: isMobile ? "0.8125rem" : isTablet ? "0.875rem" : "1rem",
      padding: isMobile ? "6px 12px" : isTablet ? "8px 16px" : "8px 16px",
      width: isMobile ? "100%" : "auto",
    },
  };
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://rc-track.onrender.com";

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      name: "RC Entry",
      icon: ShoppingCart,
      path: "/rcentry",
    },
    {
      name: "RC Status",
      icon: TrendingUp,
      path: "/rclist",
    },
  ];

  useEffect(() => {
    const fetchRcEntries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/rc`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch RC entries");
        }

        const data = await response.json();
        setRcEntries(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching RC entries:", error);
        setError("Failed to load RC entries. Please try again later.");
        setLoading(false);
      }
    };

    fetchRcEntries();
  }, [API_BASE_URL]);

  const handleMenuClick = (menuName, path) => {
    setActiveMenu(menuName);
    navigate(path);
  };
  const handleStatusFilterChange = (filterName, value) => {
    setStatusFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleExportExcel = () => {
    // Use filteredEntries instead of rcEntries to respect search and filters
    const exportData = filteredEntries.map((entry) => ({
      "Vehicle Reg No.": entry.vehicleRegNo || "-",
      "Vehicle Name": entry.vehicleName || "-",
      "Owner Name": entry.ownerName || "-",
      "Applicant Name": entry.applicantName || "-",
      Work: entry.work || "-",
      "Dealer Name": entry.dealerName || "-",
      "RTO Agent Name": entry.rtoAgentName || "-",
      Remarks: entry.remarks || "-",
      "RC Transferred": entry.status?.rcTransferred ? "Yes" : "No",
      "RTO Fees Paid": entry.status?.rtoFeesPaid ? "Yes" : "No",
      "Returned To Dealer": entry.status?.returnedToDealer ? "Yes" : "No",
      "Created At": new Date(entry.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RC Entries");

    const filename = searchText
      ? `RC_Entries_${searchText}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      : `RC_Entries_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  const filteredEntries = rcEntries.filter((entry) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      (entry.vehicleRegNo &&
        entry.vehicleRegNo.toLowerCase().includes(searchLower)) ||
      (entry.vehicleName &&
        entry.vehicleName.toLowerCase().includes(searchLower)) ||
      (entry.ownerName &&
        entry.ownerName.toLowerCase().includes(searchLower)) ||
      (entry.applicantName &&
        entry.applicantName.toLowerCase().includes(searchLower)) ||
      (entry.dealerName &&
        entry.dealerName.toLowerCase().includes(searchLower)) ||
      (entry.rtoAgentName &&
        entry.rtoAgentName.toLowerCase().includes(searchLower));

    const matchesRcTransferred =
      statusFilters.rcTransferred === null ||
      entry.status?.rcTransferred === statusFilters.rcTransferred;
    const matchesRtoFeesPaid =
      statusFilters.rtoFeesPaid === null ||
      entry.status?.rtoFeesPaid === statusFilters.rtoFeesPaid;
    const matchesReturnedToDealer =
      statusFilters.returnedToDealer === null ||
      entry.status?.returnedToDealer === statusFilters.returnedToDealer;

    return (
      matchesSearch &&
      matchesRcTransferred &&
      matchesRtoFeesPaid &&
      matchesReturnedToDealer
    );
  });

  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      vehicleRegNo: record.vehicleRegNo,
      vehicleName: record.vehicleName,
      ownerName: record.ownerName,
      applicantName: record.applicantName,
      work: record.work,
      dealerName: record.dealerName,
      rtoAgentName: record.rtoAgentName,
      remarks: record.remarks,
      rcTransferred: Boolean(record.status?.rcTransferred),
      rtoFeesPaid: Boolean(record.status?.rtoFeesPaid),
      returnedToDealer: Boolean(record.status?.returnedToDealer),
    });
    setIsEditModalVisible(true);
  };
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateData = {
        vehicleRegNo: values.vehicleRegNo,
        vehicleName: values.vehicleName,
        ownerName: values.ownerName,
        applicantName: values.applicantName,
        work: values.work,
        dealerName: values.dealerName,
        rtoAgentName: values.rtoAgentName,
        remarks: values.remarks,
        status: {
          rcTransferred: Boolean(values.rcTransferred),
          rtoFeesPaid: Boolean(values.rtoFeesPaid),
          returnedToDealer: Boolean(values.returnedToDealer),
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/api/rc/${currentRecord._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update RC entry");
      }

      const updatedData = await response.json();
      setRcEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry._id === currentRecord._id ? updatedData.data : entry
        )
      );
      setIsEditModalVisible(false);
      setCurrentRecord(null);
      form.resetFields();
      setLoading(false);
    } catch (error) {
      console.error("Error updating RC entry:", error);
      setError("Failed to update RC entry. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this RC entry?")) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/rc/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete RC entry";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          switch (response.status) {
            case 404:
              errorMessage = "RC entry not found";
              break;
            case 403:
              errorMessage = "Not authorized to delete this RC entry";
              break;
            case 401:
              errorMessage = "Authentication required. Please login again.";
              localStorage.removeItem("token");
              navigate("/login");
              return;
            default:
              errorMessage = `Delete failed with status: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        setRcEntries((prev) => prev.filter((entry) => entry._id !== id));
        message.success("RC entry deleted successfully");
      } else {
        throw new Error(result.message || "Delete operation failed");
      }
    } catch (error) {
      console.error("Error deleting RC entry:", error);

      if (error.message.includes("fetch")) {
        message.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        message.error(error.message || "Failed to delete RC entry");
      }
      setError(error.message || "Failed to delete RC entry");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Vehicle Reg No.",
      dataIndex: "vehicleRegNo",
      key: "vehicleRegNo",
      render: (text) => text || "-",
      sorter: (a, b) =>
        (a.vehicleRegNo || "").localeCompare(b.vehicleRegNo || ""),
    },
    {
      title: "Vehicle Name",
      dataIndex: "vehicleName",
      key: "vehicleName",
      render: (text) => text || "-",
      sorter: (a, b) =>
        (a.vehicleName || "").localeCompare(b.vehicleName || ""),
    },
    {
      title: "Owner Name",
      dataIndex: "ownerName",
      key: "ownerName",
      render: (text) => text || "-",
      sorter: (a, b) => (a.ownerName || "").localeCompare(b.ownerName || ""),
    },
    {
      title: "Applicant Name",
      dataIndex: "applicantName",
      key: "applicantName",
      render: (text) => text || "-",
      sorter: (a, b) =>
        (a.applicantName || "").localeCompare(b.applicantName || ""),
    },
    {
      title: "Work",
      dataIndex: "work",
      key: "work",
      render: (text) => text || "-",
    },
    {
      title: "Dealer Name",
      dataIndex: "dealerName",
      key: "dealerName",
      render: (text) => text || "-",
      sorter: (a, b) => (a.dealerName || "").localeCompare(b.dealerName || ""), // Fixed this line
    },
    {
      title: "RTO Agent Name",
      dataIndex: "rtoAgentName",
      key: "rtoAgentName",
      render: (text) => text || "-",
      sorter: (a, b) =>
        (a.rtoAgentName || "").localeCompare(b.rtoAgentName || ""),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (text) => text || "-",
      sorter: (a, b) => (a.remarks || "").localeCompare(b.remarks || ""),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <div style={styles.statusContainer}>
          <span
            style={
              record.status?.rcTransferred
                ? styles.statusActive
                : styles.statusInactive
            }
          >
            RC: {record.status?.rcTransferred ? "Yes" : "No"}
          </span>
          <span
            style={
              record.status?.rtoFeesPaid
                ? styles.statusActive
                : styles.statusInactive
            }
          >
            RTO: {record.status?.rtoFeesPaid ? "Yes" : "No"}
          </span>
          <span
            style={
              record.status?.returnedToDealer
                ? styles.statusActive
                : styles.statusInactive
            }
          >
            Returned: {record.status?.returnedToDealer ? "Yes" : "No"}
          </span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={styles.actionsContainer}>
          <button
            onClick={() => handleEdit(record)}
            style={styles.actionButton}
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(record._id)}
            style={{ ...styles.actionButton, color: "#ef4444" }}
            title="Delete"
            disabled={loading}
          >
            {loading ? <Spin size="small" /> : <Trash2 size={18} />}
          </button>
        </div>
      ),
    },
  ];

  const EditModal = () => (
    <Modal
      title="Edit RC Entry"
      visible={isEditModalVisible}
      onCancel={() => setIsEditModalVisible(false)}
      footer={[
        <Button key="back" onClick={() => setIsEditModalVisible(false)}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleUpdate}
        >
          Save Changes
        </Button>,
      ]}
      width={800}
    >
      <Form form={form} layout="vertical">
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <Form.Item name="vehicleRegNo" label="Vehicle Registration No">
              <Input placeholder="Enter vehicle registration number" />
            </Form.Item>

            <Form.Item name="vehicleName" label="Vehicle Name">
              <Input placeholder="Enter vehicle name" />
            </Form.Item>

            <Form.Item name="ownerName" label="Owner Name">
              <Input placeholder="Enter owner name" />
            </Form.Item>

            <Form.Item name="applicantName" label="Applicant Name">
              <Input placeholder="Enter applicant name" />
            </Form.Item>
          </div>

          <div style={{ flex: 1 }}>
            <Form.Item name="work" label="Work Description">
              <TextArea rows={3} placeholder="Enter work description" />
            </Form.Item>

            <Form.Item name="dealerName" label="Dealer Name">
              <Input placeholder="Enter dealer name" />
            </Form.Item>

            <Form.Item name="rtoAgentName" label="RTO Agent Name">
              <Input placeholder="Enter RTO agent name" />
            </Form.Item>
            <Form.Item name="remarks" label="Remarks">
              <TextArea rows={3} placeholder="Enter any remarks" />
            </Form.Item>

            <Form.Item name="rcTransferred" valuePropName="checked">
              <Checkbox>RC Transferred</Checkbox>
            </Form.Item>

            <Form.Item name="rtoFeesPaid" valuePropName="checked">
              <Checkbox>RTO Fees Paid</Checkbox>
            </Form.Item>
            
            <Form.Item name="returnedToDealer" valuePropName="checked">
              <Checkbox>Returned To Dealer</Checkbox>
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <p style={styles.sidebarSubtitle}>Welcome, {user?.name || "User"}</p>
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
                      style={styles.submenuItem}
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
        <div style={styles.contentPadding}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>RC Entries List</h1>
            <p style={styles.pageSubtitle}>View and manage all RC entries</p>
          </div>

          <div style={styles.searchContainer}>
            <Input
              placeholder="Search by vehicle number, name, etc..."
              prefix={<Search size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={styles.searchInput}
              allowClear
            />
            <Button
              type="default"
              onClick={() => setFilterVisible(!filterVisible)}
              style={{ marginLeft: "16px" }}
            >
              Filter
            </Button>
            {filterVisible && (
              <div style={styles.filterDropdown}>
                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>RC Transferred:</span>
                  <Select
                    style={{ width: 120 }}
                    value={statusFilters.rcTransferred}
                    onChange={(value) =>
                      handleStatusFilterChange("rcTransferred", value)
                    }
                    placeholder="All"
                  >
                    <Option value={null}>All</Option>
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                  </Select>
                </div>
                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>RTO Fees Paid:</span>
                  <Select
                    style={{ width: 120 }}
                    value={statusFilters.rtoFeesPaid}
                    onChange={(value) =>
                      handleStatusFilterChange("rtoFeesPaid", value)
                    }
                    placeholder="All"
                  >
                    <Option value={null}>All</Option>
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                  </Select>
                </div>
                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>Returned To Dealer:</span>
                  <Select
                    style={{ width: 120 }}
                    value={statusFilters.returnedToDealer}
                    onChange={(value) =>
                      handleStatusFilterChange("returnedToDealer", value)
                    }
                    placeholder="All"
                  >
                    <Option value={null}>All</Option>
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                  </Select>
                </div>
              </div>
            )}
            <Button
              type="primary"
              onClick={handleExportExcel}
              style={{ marginLeft: "16px" }}
              icon={<Download size={16} />}
            >
              Export to Excel
            </Button>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: "24px" }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredEntries}
              rowKey="_id"
              bordered
              pagination={{ pageSize: 10 }}
              style={styles.table}
              scroll={{ x: isMobile ? true : false }}
              locale={{
                emptyText: "No RC entries found",
              }}
            />
          )}
        </div>
        {isEditModalVisible && <EditModal />}
      </div>
    </div>
  );
};
export default RcListPage;
