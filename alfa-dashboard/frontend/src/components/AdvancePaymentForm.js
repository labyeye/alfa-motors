import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost"
    ? "https://alfa-motors-9bk6.vercel.app"
    : "https://alfa-motors-9bk6.vercel.app");

export default function AdvancePaymentForm() {
  // auth context not used here
  const [sellLetters, setSellLetters] = useState([]);
  const [form, setForm] = useState({
    sellLetter: "",
    amount: "",
    paymentMethod: "cash",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSellLetters();
  }, []);

  const fetchSellLetters = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/sell-letters`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSellLetters(res.data || res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const submit = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      alert("Enter amount");
      return;
    }
    try {
      setSaving(true);
      await axios.post(`${API_BASE}/api/advance-payments`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Payment recorded");
      setForm({ sellLetter: "", amount: "", paymentMethod: "cash", note: "" });
    } catch (err) {
      console.error(err);
      alert("Failed");
    } finally {
      setSaving(false);
    }
  };
  // removed unused formatRupee helper

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Record Advance Payment</h2>
          <p style={styles.subtitle}>
            Quickly record customer advance payments and optionally link them to
            a sell letter.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.formRow}>
            <label style={styles.label}>Sell Letter</label>
            <select
              value={form.sellLetter}
              onChange={(e) =>
                setForm((f) => ({ ...f, sellLetter: e.target.value }))
              }
              style={styles.select}
            >
              <option value="">-- not linked --</option>
              {sellLetters.map((s) => (
                  <option key={s._id} value={s._id}>
                  {s.buyerName} - ₹{s.saleAmount}
                </option>
              ))}
            </select>
          </div>

          {form.sellLetter && (
            <div style={styles.linkedInfo}>
              {(() => {
                const sel = sellLetters.find((x) => x._id === form.sellLetter);
                if (!sel) return null;
                return (
                  <>
                    <div>
                      <strong>Buyer:</strong> {sel.buyerName}
                    </div>
                    <div>
                      <strong>Sale Amount:</strong> ₹{sel.saleAmount?.toString()}
                    </div>
                    <div>
                      <strong>Registration:</strong>{" "}
                      {sel.registrationNumber || sel.regNo || "—"}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div style={styles.formRow}>
            <label style={styles.label}>Amount (INR)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              placeholder="Enter amount"
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((f) => ({ ...f, paymentMethod: e.target.value }))
              }
              style={styles.select}
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="bankTransfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              style={styles.textarea}
              placeholder="Optional note or reference"
            />
          </div>

          <div style={styles.actions}>
            <button
              onClick={submit}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  content: { flex: 1, padding: 24 },
  header: { marginBottom: 16, textAlign: "center", marginTop: 18 },
  title: { margin: 0, fontSize: 20, color: "#0f172a" },
  subtitle: { margin: "6px 0 0", color: "#6b7280" },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(2,6,23,0.06)",
    maxWidth: "100%",
  },
  formRow: { marginBottom: 14, display: "flex", flexDirection: "column" },
  label: { marginBottom: 8, color: "#334155", fontWeight: 600 },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e6edf3",
    width: "95%",
    maxWidth: 360,
    background: "#f8fafc",
  },
  select: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e6edf3",
    width: "100%",
    maxWidth: 420,
    background: "#f8fafc",
  },
  textarea: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e6edf3",
    width: "93%",
    minHeight: 100,
    background: "#f8fafc",
  },
  actions: { marginTop: 8 },
  saveButton: {
    padding: "10px 16px",
    background: "#2D2D2D",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  hint: { marginTop: 6, color: "#64748b", fontSize: 13 },
  linkedInfo: {
    marginBottom: 12,
    padding: 12,
    background: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #edf2f7",
    color: "#334155",
  },
};
