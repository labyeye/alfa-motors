import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Sidebar from "./Sidebar";
import { Trash, PlusCircle } from "lucide-react";

const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-5yfh.vercel.app"
    : "https://alfa-motors-5yfh.vercel.app");

export default function Refurbishment() {
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(false);
  const [cars, setCars] = useState([]);
  const [refurbs, setRefurbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    car: "",
    items: [{ description: "", quantity: 1, rate: 0 }],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carsRes, refRes] = await Promise.all([
        axios.get(`${API_BASE}/api/cars`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${API_BASE}/api/refurbishments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setCars(carsRes.data.data || carsRes.data || []);
      setRefurbs(refRes.data.data || refRes.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: "", quantity: 1, rate: 0 }],
    }));
  const updateItem = (idx, key, val) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, [key]: val } : it)),
    }));
  const removeItem = (idx) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const totalCost = () =>
    form.items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
      0
    );

  const submit = async () => {
    if (!form.car) {
      alert("Select a car");
      return;
    }
    if (!form.items || form.items.length === 0) {
      alert("Add at least one item");
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(`${API_BASE}/api/refurbishments`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRefurbs((r) => [res.data.data, ...r]);
      setForm({
        car: "",
        items: [{ description: "", quantity: 1, rate: 0 }],
        notes: "",
      });
      alert("Refurbishment saved");
    } catch (err) {
      console.error("Error saving", err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteRefurb = async (id) => {
    if (!window.confirm("Delete this refurbishment entry?")) return;
    try {
      await axios.delete(`${API_BASE}/api/refurbishments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRefurbs((r) => r.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: isMobile ? 16 : 28 }}>
          <div style={{ fontSize: 18, color: "#374151" }}>
            Loading refurbishment data...
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
        overflowX: "hidden",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, padding: isMobile ? 16 : 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 8 : 0,
          }}
        >
          <div style={{ width: "100%" }}>
            <h2 style={{ margin: 0, color: "#0f172a", textAlign: "center" }}>
              Refurbishment
            </h2>
            <div
              style={{ color: "#6b7280", marginTop: 6, textAlign: "center" }}
            >
              Record parts & labour used for refurbishing vehicles
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: isMobile ? 14 : 24,
            alignItems: "flex-start",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: isMobile ? 14 : 20,
              borderRadius: 10,
              boxShadow: "0 4px 10px rgba(2,6,23,0.06)",
              width: "92%",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Create Refurbishment</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Car</label>
              <select
                value={form.car}
                onChange={(e) =>
                  setForm((f) => ({ ...f, car: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e6edf3",
                }}
              >
                <option value="">-- select car --</option>
                {cars.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.make} {c.model} ({c.modelYear})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Items</label>
              {form.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: isMobile ? "stretch" : "center",
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <input
                    placeholder="description"
                    value={it.description}
                    onChange={(e) =>
                      updateItem(idx, "description", e.target.value)
                    }
                    style={{
                      flex: isMobile ? undefined : 2,
                      width: isMobile ? "93%" : undefined,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6edf3",
                    }}
                  />
                  <input
                    type="number"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                    style={{
                      width: isMobile ? "93%" : 80,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6edf3",
                    }}
                  />
                  <input
                    type="number"
                    value={it.rate}
                    onChange={(e) => updateItem(idx, "rate", e.target.value)}
                    style={{
                      width: isMobile ? "93%" : 120,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6edf3",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: isMobile ? "space-between" : "flex-end",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? "auto" : 100,
                        textAlign: isMobile ? "left" : "right",
                        fontWeight: 600,
                      }}
                    >
                      ₹
                      {(
                        (Number(it.quantity) || 0) * (Number(it.rate) || 0)
                      ).toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "6px 8px",
                        borderRadius: 6,
                      }}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addItem}
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  gap: 8,
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <PlusCircle /> Add item
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                style={{
                  width: "93%",
                  minHeight: 80,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e6edf3",
                }}
              />
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 10 : 0,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "#0f172a",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                Total: <strong>₹{totalCost().toLocaleString()}</strong>
              </div>
              <button
                onClick={submit}
                disabled={saving}
                style={{
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  width: isMobile ? "93%" : "auto",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div
            style={{
              width: isMobile ? "100%" : 420,
              marginTop: isMobile ? 8 : 0,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Recent Refurbishments</h3>
            <div
              style={{
                background: "#fff",
                padding: 12,
                borderRadius: 8,
                boxShadow: "0 4px 8px rgba(2,6,23,0.04)",
              }}
            >
              {refurbs.length === 0 ? (
                <div style={{ color: "#6b7280" }}>No entries</div>
              ) : (
                <div
                  style={{
                    maxHeight: isMobile ? 360 : 520,
                    overflowY: "auto",
                    paddingRight: 8,
                  }}
                >
                  {refurbs.map((r) => (
                    <div
                      key={r._id}
                      style={{
                        borderBottom: "1px solid #eef2f7",
                        padding: "8px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <strong style={{ display: "block" }}>
                            {r.car
                              ? `${r.car.make} ${r.car.model}`
                              : "Unknown car"}
                          </strong>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {new Date(r.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {(user?.role === "admin" ||
                            (r.user && r.user === user?._id)) && (
                            <button
                              onClick={() => deleteRefurb(r._id)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "6px 8px",
                                borderRadius: 6,
                              }}
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        {r.items.map((it, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 13,
                            }}
                          >
                            <div>
                              {it.description} x{it.quantity}
                            </div>
                            <div>
                              ₹
                              {(
                                it.amount || it.quantity * it.rate
                              ).toLocaleString()}
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop: 6, fontWeight: 600 }}>
                          Total: ₹
                          {(
                            r.totalCost ||
                            r.items.reduce(
                              (s, it) => s + it.quantity * it.rate,
                              0
                            )
                          ).toLocaleString()}
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
    </div>
  );
}
