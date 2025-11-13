import { useState, useEffect, useContext, useCallback } from "react";
import {
  ShoppingCart,
  TrendingUp,
  FileText,
  Target,
  RefreshCw,
  Car,
  Bike,
  PenTool,
  CarFront,
} from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Sidebar from "../components/Sidebar";
import AuthContext from "../context/AuthContext";
const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-5yfh.vercel.app"
    : "https://alfa-motors-5yfh.vercel.app");

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
      service: [],
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
      rcFeeToBeTaken: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [isOwnerView] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeMenu === "Dashboard") {
      fetchDashboardData();
    }
  }, [activeMenu, fetchDashboardData]);

  const fetchDashboardData = useCallback(async () => {
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
          rcFeeToBeTaken: data.data.carStats?.rcFeeToBeTaken || 0,
        },
      };

      setDashboardData(completeData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error.message ||
          "Failed to load dashboard data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [isOwnerView]);

  // Chart data configuration
  const monthlyChartData = {
    labels: dashboardData.monthlyData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Buy Letters",
        data: dashboardData.monthlyData?.map((item) => item.buy) || [],
        backgroundColor: "#B3B3B3",
      },
      {
        label: "Sell Letters",
        data: dashboardData.monthlyData?.map((item) => item.sell) || [],
        backgroundColor: "#D4D4D4",
      },
    ],
  };

  const profitChartData = {
    labels: dashboardData.monthlyData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Profit",
        data: dashboardData.monthlyData?.map((item) => item.profit) || [],
        backgroundColor:
          dashboardData.monthlyData?.map((item) =>
            item.profit >= 0 ? "#B3B3B3" : "#2B2B2B"
          ) || [],
      },
    ],
  };

  const transactionTypeData = {
    labels: ["Buy", "Sell", "Service"],
    datasets: [
      {
        data: [
          dashboardData.totalBuyLetters || 0,
          dashboardData.totalSellLetters || 0,
          dashboardData.recentTransactions?.service?.length || 0,
        ],
        backgroundColor: ["#B3B3B3", "#D4D4D4", "#FFFFFF"],
        borderColor: ["#2B2B2B", "#2B2B2B", "#2B2B2B"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
    },
    maintainAspectRatio: false,
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
                        borderLeft: `4px solid ${[
                          "#B3B3B3",
                          "#D4D4D4",
                          "#B3B3B3",
                          "#D4D4D4",
                          "#2B2B2B",
                          "#B3B3B3",
                          "#D4D4D4",
                          "#B3B3B3",
                        ][index]}`,
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
                              "#D4D4D4",
                              "#D4D4D4",
                              "#D4D4D4",
                              "#D4D4D4",
                              "#D4D4D4",
                              "#D4D4D4",
                              "#D4D4D4",
                              "#D4D4D4",
                            ][index],
                  }}
                >
                  {
                    [
                              <FileText size={32} color="#2B2B2B" />,
                              <TrendingUp size={32} color="#2B2B2B" />,
                              <ShoppingCart size={32} color="#2B2B2B" />,
                              <Target size={32} color="#2B2B2B" />,
                              <Car size={32} color="#2B2B2B" />,
                              <CarFront size={32} color="#2B2B2B" />,
                              <PenTool size={32} color="#2B2B2B" />,
                              <Bike size={32} color="#2B2B2B" />,
                    ][index]
                  }
                </div>
              </div>
            </div>
          ))
      ) : error ? (
        <div
          style={{
            ...styles.card,
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <p style={{ color: "#2B2B2B" }}>{error}</p>
          <button
            onClick={fetchDashboardData}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Existing cards */}
          <div style={{ ...styles.card, borderLeft: "4px solid #B3B3B3" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>Total Cars</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.totalCars}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <Car size={32} color="#2B2B2B" />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, borderLeft: "4px solid #D4D4D4" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>Sold Cars</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.soldCars}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <CarFront size={32} color="#2B2B2B" />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, borderLeft: "4px solid #B3B3B3" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>Available Cars</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.availableCars}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <Car size={32} color="#2B2B2B" />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, borderLeft: "4px solid #D4D4D4" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>Total RCs</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.totalRCs}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <FileText size={32} color="#2B2B2B" />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, borderLeft: "4px solid #2B2B2B" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>RCs Transferred</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.rcTransferred}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <PenTool size={32} color="#2B2B2B" />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, borderLeft: "4px solid #B3B3B3" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>RC Fee Done</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.rcFeeDone}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <FileText size={32} color="#2B2B2B" />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, borderLeft: "4px solid #D4D4D4" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>RCs Available to Transfer</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.rcAvailableToTransfer}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <PenTool size={32} color="#2B2B2B" />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, borderLeft: "4px solid #B3B3B3" }}>
            <div style={styles.cardContent}>
              <div>
                <p style={styles.cardLabel}>RC Fee to be Taken</p>
                <p style={styles.cardValue}>
                  {dashboardData.carStats.rcFeeToBeTaken}
                </p>
              </div>
              <div style={{ ...styles.cardIcon, backgroundColor: "#D4D4D4" }}>
                <FileText size={32} color="#2B2B2B" />
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
          {Array(3)
            .fill()
            .map((_, index) => (
              <div key={index} style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Loading...</h3>
                <div
                  style={{
                    ...styles.chartWrapper,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <RefreshCw
                    size={24}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                </div>
              </div>
            ))}
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.chartsContainer}>
          <div
            style={{
              ...styles.chartCard,
              gridColumn: "1 / -1",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#ef4444" }}>{error}</p>
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
                <p
                  style={{
                    textAlign: "center",
                    color: "#B3B3B3",
                    padding: "20px",
                  }}
                >
                No transaction data available
              </p>
            )}
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Profit</h3>
          <div style={styles.chartWrapper}>
            {dashboardData.monthlyData?.length > 0 ? (
              <Bar data={profitChartData} options={chartOptions} />
            ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#B3B3B3",
                    padding: "20px",
                  }}
                >
                No profit data available
              </p>
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
                <h1>Dashboard</h1>
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
            </div>
          </div>

          {activeMenu === "Dashboard" && (
            <>
              <DashboardCards />
              {/* <RevenueCard /> */}
              <ChartsSection />
              
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
    backgroundColor: "#FFFFFF",
    fontFamily: "Arial, sans-serif",
  },
  // Sidebar Styles
  sidebar: {
    width: "280px",
    backgroundColor: "#2B2B2B",
    color: "#FFFFFF",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    height: "100vh",
    backgroundImage: "linear-gradient(to bottom, #2B2B2B, #122236)",
  },
  sidebarHeader: {
    padding: "24px",
    borderBottom: "1px solid #334155",
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
    color: "#FFFFFF",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
    backgroundColor: "#D4D4D4",
  },
  submenuItem: {
    padding: "10px 24px 10px 64px",
    cursor: "pointer",
    color: "#2B2B2B",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#B3B3B3",
    },
  },
  submenuItemActive: {
    backgroundColor: "#B3B3B3",
    color: "#2B2B2B",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    cursor: "pointer",
    color: "#FFFFFF",
    marginTop: "16px",
    borderTop: "1px solid #334155",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#B3B3B3",
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
    color: "#2B2B2B",
    margin: 0,
    textAlign: "center",
  },
  pageSubtitle: {
    color: "#B3B3B3",
    marginTop: "8px",
    margin: "8px 0 0 0",
    textAlign: "center",
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
    color: "#B3B3B3",
    margin: 0,
  },
  cardValue: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    color: "#2B2B2B",
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
    color: "#2B2B2B",
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
  backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    transition: "transform 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
    },
  },
  revenueLabel: {
    fontSize: "0.875rem",
    color: "#B3B3B3",
    margin: 0,
  },
  revenueValue: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#2B2B2B",
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
  backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
  },
  chartTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#2B2B2B",
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
  backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
  },
  transactionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#2B2B2B",
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
  backgroundColor: "#D4D4D4",
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
    color: "#2B2B2B",
    margin: 0,
  },
  transactionCustomer: {
    fontSize: "0.75rem",
    color: "#B3B3B3",
    margin: "2px 0 0 0",
  },
  transactionService: {
    fontSize: "0.75rem",
    color: "#B3B3B3",
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
    color: "#B3B3B3",
    margin: 0,
  },
  transactionAmount: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#2B2B2B",
    margin: "2px 0 0 0",
  },
  quickActionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "24px",
  },
  quickActionsTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#2B2B2B",
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
    color: "#2B2B2B",
    margin: 0,
  },
  quickActionSubtitle: {
    fontSize: "0.875rem",
    color: "#B3B3B3",
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
    color: "#2B2B2B",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  placeholderText: {
    color: "#B3B3B3",
    margin: 0,
  },
};

export default AdminPage;
