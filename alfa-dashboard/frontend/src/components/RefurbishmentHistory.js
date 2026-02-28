import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import AuthContext from "../context/AuthContext";
import { Trash, Eye, Search } from "lucide-react";
import { formatIndian } from "../utils/formatIndian";

const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-9bk6.vercel.app"
    : "https://alfa-motors-9bk6.vercel.app");

export default function RefurbishmentHistory() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/refurbishments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this refurbishment?")) return;
    try {
      await axios.delete(`${API_BASE}/api/refurbishments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems((prev) => prev.filter((x) => x._id !== id));
      if (selected && selected._id === id) setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const filtered = items.filter((i) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const car = i.car ? `${i.car.make} ${i.car.model}`.toLowerCase() : "";
    return (
      car.includes(q) ||
      (i.items || []).some((it) =>
        (it.description || "").toLowerCase().includes(q)
      )
    );
  });

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Refurbishment History</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{ position: "absolute", left: 8, top: 8, color: "#9ca3af" }}
              />
              <input
                placeholder="Search by car or item..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ padding: "8px 8px 8px 32px", borderRadius: 8, border: "1px solid #e6edf3" }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, color: "#6b7280" }}>No refurbishments found</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eef2f7" }}>
                  <th style={{ padding: 10 }}>#</th>
                  <th style={{ padding: 10 }}>Car</th>
                  <th style={{ padding: 10 }}>Items</th>
                  <th style={{ padding: 10 }}>Total</th>
                  <th style={{ padding: 10 }}>Created</th>
                  <th style={{ padding: 10 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{idx + 1}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ fontWeight: 700 }}>{r.car ? `${r.car.make} ${r.car.model}` : "Unknown"}</div>
                    </td>
                    <td style={{ padding: 10 }}>
                      {r.items && r.items.slice(0, 3).map((it, i) => <div key={i}>{it.description} x{it.quantity}</div>)}
                      {r.items && r.items.length > 3 && <div style={{ color: "#6b7280" }}>+{r.items.length - 3} more</div>}
                    </td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>₹{formatIndian(r.totalCost || 0)}</td>
                    <td style={{ padding: 10 }}>{new Date(r.createdAt).toLocaleString()}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setSelected(r)} style={{ background: "#f3f4f6", border: "1px solid #e6edf3", padding: "6px 8px", borderRadius: 6 }}>
                          <Eye size={14} />
                        </button>
                        {(user?.role === "admin" || (r.user && r.user === user?._id)) && (
                          <button onClick={() => deleteItem(r._id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: 6 }}>
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
          <div style={{ marginTop: 12, background: "#fff", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: 0 }}>{selected.car ? `${selected.car.make} ${selected.car.model}` : "Unknown"}</h3>
                <div style={{ color: "#6b7280" }}>{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={() => setSelected(null)} style={{ background: "#f3f4f6", border: "1px solid #e6edf3", padding: "6px 8px", borderRadius: 6 }}>Close</button>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              {selected.items.map((it, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <div>{it.description} x{it.quantity}</div>
                  <div>₹{formatIndian(it.amount || it.quantity * it.rate)}</div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontWeight: 700 }}>Total: ₹{formatIndian(selected.totalCost || 0)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
