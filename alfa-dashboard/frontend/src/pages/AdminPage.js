import { useState, useEffect, useContext } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Wrench,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
  Target,
  RefreshCw,
    Car,
    Bike,
    PenTool,
    CarFront,

} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import logo from '../images/company.png';
import Sidebar from "../components/Sidebar";
import AuthContext from "../context/AuthContext";
const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' ? 'https://alfa-motors.onrender.com' : 'https://alfa-motors.onrender.com');

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [dashboardData, setDashboardData] = useState({
  totalBuyLetters: 0,
  totalSellLetters: 0,
  totalBuyValue: 0,
  totalSellValue: 0,
  profit: 0,
  ownerName: user?.name || "",
  recentTransactions: {
    buy: [],
    sell: [],
    service: []
  },
  monthlyData: [],
  carStats: {
    totalCars: 0,
    soldCars: 0,
    availableCars: 0,
    totalRCs: 0,
    rcTransferred: 0,
    rcFeeDone: 0,
    rcFeeReturned: 0,
    rcAvailableToTransfer: 0,
    rcFeeToBeTaken: 0
  }
});
  const [loading, setLoading] = useState(true);
  const [isOwnerView, setIsOwnerView] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeMenu === "Dashboard") {
      fetchDashboardData();
    }
  }, [activeMenu, isOwnerView]);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);
    const endpoint = isOwnerView
      ? `${API_BASE}/api/dashboard/owner`
      : `${API_BASE}/api/dashboard`;

    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || 
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Ensure carStats exists with all required fields
    const completeData = {
      ...data.data,
      carStats: {
        totalCars: data.data.carStats?.totalCars || 0,
        soldCars: data.data.carStats?.soldCars || 0,
        availableCars: data.data.carStats?.availableCars || 0,
        totalRCs: data.data.carStats?.totalRCs || 0,
        rcTransferred: data.data.carStats?.rcTransferred || 0,
        rcFeeDone: data.data.carStats?.rcFeeDone || 0,
        rcFeeReturned: data.data.carStats?.rcFeeReturned || 0,
        rcAvailableToTransfer: data.data.carStats?.rcAvailableToTransfer || 0,
        rcFeeToBeTaken: data.data.carStats?.rcFeeToBeTaken || 0
      }
    };
    
    setDashboardData(completeData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    setError(error.message || "Failed to load dashboard data. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const toggleOwnerView = () => {
    setIsOwnerView(!isOwnerView);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (menuName, path) => {
    setActiveMenu(menuName);
    const actualPath = typeof path === 'function' ? path(user?.role) : path;
    navigate(actualPath);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  // Chart data configuration
  const monthlyChartData = {
    labels: dashboardData.monthlyData?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Buy Letters',
        data: dashboardData.monthlyData?.map(item => item.buy) || [],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Sell Letters',
        data: dashboardData.monthlyData?.map(item => item.sell) || [],
        backgroundColor: '#10b981',
      }
    ],
  };

  const profitChartData = {
    labels: dashboardData.monthlyData?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Profit',
        data: dashboardData.monthlyData?.map(item => item.profit) || [],
        backgroundColor: dashboardData.monthlyData?.map(item => 
          item.profit >= 0 ? '#10b981' : '#ef4444'
        ) || [],
      }
    ],
  };

  const transactionTypeData = {
    labels: ['Buy', 'Sell', 'Service'],
    datasets: [
      {
        data: [
          dashboardData.totalBuyLetters || 0,
          dashboardData.totalSellLetters || 0,
          dashboardData.recentTransactions?.service?.length || 0
        ],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b'
        ],
        borderColor: [
          '#2563eb',
          '#059669',
          '#d97706'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    maintainAspectRatio: false
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
    maintainAspectRatio: false
  };


  const DashboardCards = () => (
  <div style={styles.cardsGrid}>
    {loading ? (
      Array(8)
        .fill()
        .map((_, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              borderLeft: `4px solid ${
                ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#f97316", "#8b5cf6", "#14b8a6"][index]
              }`,
              opacity: 0.7,
            }}
          >
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>Loading...</p>
                <p style={styles.cardValue}>-</p>
              </div>
              <div
                style={{
                  ...styles.cardIcon,
                  backgroundColor: [
                    "#dbeafe", "#d1fae5", "#ede9fe", "#fef3c7", "#fee2e2", "#ffedd5", "#ede9fe", "#ccfbf1"
                  ][index],
                }}
              >
                {
                  [
                    <FileText size={32} color="#2563eb" />,
                    <TrendingUp size={32} color="#059669" />,
                    <ShoppingCart size={32} color="#7c3aed" />,
                    <Target size={32} color="#d97706" />,
                    <Car size={32} color="#dc2626" />,
                    <CarFront size={32} color="#ea580c" />,
                    <PenTool size={32} color="#7c3aed" />,
                    <Bike size={32} color="#0d9488" />,
                  ][index]
                }
              </div>
            </div>
          </div>
        ))
    ) : error ? (
      <div style={{ ...styles.card, gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button 
          onClick={fetchDashboardData}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            marginTop: '10px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    ) : (
      <>
        {/* Existing cards */}
        <div style={{ ...styles.card, borderLeft: "4px solid #3b82f6" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Total Cars</p>
              <p style={styles.cardValue}>{dashboardData.carStats.totalCars}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#dbeafe" }}>
              <Car size={32} color="#2563eb" />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #10b981" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Sold Cars</p>
              <p style={styles.cardValue}>{dashboardData.carStats.soldCars}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#d1fae5" }}>
              <CarFront size={32} color="#059669" />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #8b5cf6" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Available Cars</p>
              <p style={styles.cardValue}>{dashboardData.carStats.availableCars}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#ede9fe" }}>
              <Car size={32} color="#7c3aed" />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #f59e0b" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Total RCs</p>
              <p style={styles.cardValue}>{dashboardData.carStats.totalRCs}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#fef3c7" }}>
              <FileText size={32} color="#d97706" />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #ef4444" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>RCs Transferred</p>
              <p style={styles.cardValue}>{dashboardData.carStats.rcTransferred}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#fee2e2" }}>
              <PenTool size={32} color="#dc2626" />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #f97316" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>RC Fee Done</p>
              <p style={styles.cardValue}>{dashboardData.carStats.rcFeeDone}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#ffedd5" }}>
              <FileText size={32} color="#ea580c" />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #8b5cf6" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>RCs Available to Transfer</p>
              <p style={styles.cardValue}>{dashboardData.carStats.rcAvailableToTransfer}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#ede9fe" }}>
              <PenTool size={32} color="#7c3aed" />
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #14b8a6" }}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>RC Fee to be Taken</p>
              <p style={styles.cardValue}>{dashboardData.carStats.rcFeeToBeTaken}</p>
            </div>
            <div style={{ ...styles.cardIcon, backgroundColor: "#ccfbf1" }}>
              <FileText size={32} color="#0d9488" />
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);

  const ChartsSection = () => {
    if (loading) {
      return (
        <div style={styles.chartsContainer}>
          {Array(3).fill().map((_, index) => (
            <div key={index} style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Loading...</h3>
              <div style={{ ...styles.chartWrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.chartsContainer}>
          <div style={{ ...styles.chartCard, gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.chartsContainer}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Transactions</h3>
          <div style={styles.chartWrapper}>
            {dashboardData.monthlyData?.length > 0 ? (
              <Bar data={monthlyChartData} options={chartOptions} />
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No transaction data available</p>
            )}
          </div>
        </div>
        
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Profit</h3>
          <div style={styles.chartWrapper}>
            {dashboardData.monthlyData?.length > 0 ? (
              <Bar data={profitChartData} options={chartOptions} />
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No profit data available</p>
            )}
          </div>
        </div>
        
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Transaction Types</h3>
          <div style={styles.chartWrapper}>
            <Pie data={transactionTypeData} options={pieOptions} />
          </div>
        </div>
      </div>
    );
  };


  return (
    <div style={styles.container}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentPadding}>
          <div style={styles.header}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h1 style={styles.pageTitle}>Dashboard</h1>
                <p style={styles.pageSubtitle}>
                  {isOwnerView ? (
                    <>
                      Personal financial overview for{" "}
                      <strong>{dashboardData.ownerName || user?.name}</strong>
                    </>
                  ) : (
                    "Monitor your business performance and manage operations"
                  )}
                </p>
              </div>
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <button
                  onClick={toggleOwnerView}
                  style={{
                    backgroundColor: isOwnerView ? "#10b981" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    ":hover": {
                      backgroundColor: isOwnerView ? "#059669" : "#2563eb",
                    },
                  }}
                >
                  {isOwnerView ? "Business View" : "Owner View"}
                </button>
                <button
                  onClick={fetchDashboardData}
                  style={{
                    backgroundColor: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    ":hover": {
                      backgroundColor: "#d97706",
                    },
                  }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {activeMenu === "Dashboard" && (
            <>
              <DashboardCards />
              {/* <RevenueCard /> */}
              <ChartsSection />
              {!loading && !error && (
                <div style={styles.quickActionsCard}>
                  <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
                  <div style={styles.quickActionsGrid}>
                    
                    <button
                      style={{
                        ...styles.quickActionButton,
                        backgroundColor: "#f0fdf4",
                      }}
                      onClick={() => navigate("/sell/create")}
                    >
                      <TrendingUp
                        size={24}
                        color="#059669"
                        style={styles.quickActionIcon}
                      />
                      <p style={styles.quickActionTitle}>Create Sell Letter</p>
                      <p style={styles.quickActionSubtitle}>Record new sale</p>
                    </button>
                    <button
                      style={{
                        ...styles.quickActionButton,
                        backgroundColor: "#faf5ff",
                      }}
                      onClick={() => navigate("/service/create")}
                    >
                      <Wrench
                        size={24}
                        color="#7c3aed"
                        style={styles.quickActionIcon}
                      />
                      <p style={styles.quickActionTitle}>Service Bill</p>
                      <p style={styles.quickActionSubtitle}>
                        Create service record
                      </p>
                    </button>
                    <button
                      style={{
                        ...styles.quickActionButton,
                        backgroundColor: "#fffbeb",
                      }}
                      onClick={() => navigate("/staff/create")}
                    >
                      <Users
                        size={24}
                        color="#d97706"
                        style={styles.quickActionIcon}
                      />
                      <p style={styles.quickActionTitle}>Add Staff</p>
                      <p style={styles.quickActionSubtitle}>Register new staff</p>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeMenu !== "Dashboard" && (
            <div style={styles.placeholderCard}>
              <h2 style={styles.placeholderTitle}>{activeMenu}</h2>
              <p style={styles.placeholderText}>
                This section is under development. Content for {activeMenu} will
                be implemented here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles remain the same as in your original file
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },
  // Sidebar Styles
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
  },
  contentPadding: {
    padding: "32px",
  },
  header: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    color: "#1f2937",
    margin: 0,
  },
  pageSubtitle: {
    color: "#6b7280",
    marginTop: "8px",
    margin: "8px 0 0 0",
  },
  
  cardsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px",
  marginBottom: "32px",
},
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
    transition: "transform 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
    },
  },
  cardContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6b7280",
    margin: 0,
  },
  cardValue: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "4px 0 0 0",
  },
  cardIcon: {
    padding: "12px",
    borderRadius: "50%",
  },
  revenueCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
    marginBottom: "24px",
  },
  revenueTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  revenueGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  revenueItem: {
    textAlign: "center",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    transition: "transform 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
    },
  },
  revenueLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
  revenueValue: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    margin: "4px 0 0 0",
  },
  // Charts Styles
  chartsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
  },
  chartTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 16px 0",
  },
  chartWrapper: {
    height: "300px",
    width: "100%",
  },
  // Transactions Styles
  transactionsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  transactionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
  },
  transactionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
  },
  transactionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  transactionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  transactionInfo: {
    display: "flex",
    flexDirection: "column",
  },
  transactionBike: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#1f2937",
    margin: 0,
  },
  transactionCustomer: {
    fontSize: "0.75rem",
    color: "#6b7280",
    margin: "2px 0 0 0",
  },
  transactionService: {
    fontSize: "0.75rem",
    color: "#6b7280",
    fontStyle: "italic",
    margin: "2px 0 0 0",
  },
  transactionDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  transactionDate: {
    fontSize: "0.75rem",
    color: "#6b7280",
    margin: 0,
  },
  transactionAmount: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#1f2937",
    margin: "2px 0 0 0",
  },
  quickActionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
  },
  quickActionsTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  quickActionButton: {
    padding: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "transform 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
    },
  },
  quickActionIcon: {
    marginBottom: "8px",
  },
  quickActionTitle: {
    fontWeight: "500",
    color: "#1f2937",
    margin: 0,
  },
  quickActionSubtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "4px 0 0 0",
  },
  placeholderCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "32px",
    textAlign: "center",
  },
  placeholderTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  placeholderText: {
    color: "#6b7280",
    margin: 0,
  },
};

export default AdminPage;