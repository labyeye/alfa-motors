import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import AuthContext from "../context/AuthContext";
import { Trash, Eye } from "lucide-react";

const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-5yfh.vercel.app"
    : "https://alfa-motors-5yfh.vercel.app");

export default function AdvancePaymentHistory() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/advance-payments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await axios.delete(`${API_BASE}/api/advance-payments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: 24 }}>Loading...</div>
      </div>
    );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24 }}>
        <h2>Advance Payments</h2>
        <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
          {payments.length === 0 ? (
            <div style={{ padding: 24 }}>No payments</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: 8 }}>#</th>
                  <th style={{ padding: 8 }}>Sell Letter</th>
                  <th style={{ padding: 8 }}>Amount</th>
                  <th style={{ padding: 8 }}>Method</th>
                  <th style={{ padding: 8 }}>Received</th>
                  <th style={{ padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #eef2f7" }}>
                    <td style={{ padding: 8 }}>{idx + 1}</td>
                    <td style={{ padding: 8 }}>
                      {p.sellLetter
                        ? `${p.sellLetter.buyerName} - ₹${p.sellLetter.saleAmount}`
                        : "—"}
                    </td>
                    <td style={{ padding: 8 }}>₹{p.amount.toLocaleString()}</td>
                    <td style={{ padding: 8 }}>{p.paymentMethod}</td>
                    <td style={{ padding: 8 }}>
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: 8 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setSelected(p)}
                          style={{
                            padding: 6,
                            border: "1px solid #e6edf3",
                            background: "#f3f4f6",
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        {(user?.role === "admin" ||
                          (p.receivedBy && p.receivedBy === user?._id)) && (
                          <button
                            onClick={() => deletePayment(p._id)}
                            style={{
                              padding: 6,
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div
            style={{
              marginTop: 12,
              background: "#fff",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <h3>Payment Details</h3>
            <div>Amount: ₹{selected.amount.toLocaleString()}</div>
            <div>Method: {selected.paymentMethod}</div>
            <div>Note: {selected.note || "—"}</div>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  padding: 6,
                  border: "1px solid #e6edf3",
                  background: "#f3f4f6",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
