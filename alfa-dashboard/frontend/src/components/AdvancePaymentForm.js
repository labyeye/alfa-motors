import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Sidebar from './Sidebar';

const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' ? 'https://alfa-motors.onrender.com' : 'https://alfa-motors.onrender.com');

export default function AdvancePaymentForm(){
  const { user } = useContext(AuthContext);
  const [sellLetters, setSellLetters] = useState([]);
  const [form, setForm] = useState({ sellLetter: '', amount: '', paymentMethod: 'cash', note: '' });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ fetchSellLetters(); }, []);

  const fetchSellLetters = async ()=>{
    try{
      const res = await axios.get(`${API_BASE}/api/sell-letters`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSellLetters(res.data || res.data.data || []);
    }catch(err){ console.error(err); }
  };

  const submit = async ()=>{
    if(!form.amount || Number(form.amount) <= 0){ alert('Enter amount'); return; }
    try{
      setSaving(true);
      const res = await axios.post(`${API_BASE}/api/advance-payments`, form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert('Payment recorded');
      setForm({ sellLetter: '', amount: '', paymentMethod: 'cash', note: '' });
    }catch(err){ console.error(err); alert('Failed'); }
    finally{ setSaving(false); }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <div style={{ flex:1, padding:24 }}>
        <h2>Record Advance Payment</h2>
        <div style={{ background:'#fff', padding:16, borderRadius:8, maxWidth:720 }}>
          <div style={{ marginBottom:12 }}>
            <label>Sell Letter (optional)</label>
            <select value={form.sellLetter} onChange={e=> setForm(f=> ({ ...f, sellLetter: e.target.value }))} style={{ width:'100%', padding:8 }}>
              <option value=''>-- not linked --</option>
              {sellLetters.map(s => <option key={s._id} value={s._id}>{s.buyerName} - ₹{s.saleAmount}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label>Amount</label>
            <input type='number' value={form.amount} onChange={e=> setForm(f=> ({ ...f, amount: e.target.value }))} style={{ width:200, padding:8 }} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label>Method</label>
            <select value={form.paymentMethod} onChange={e=> setForm(f=> ({ ...f, paymentMethod: e.target.value }))} style={{ padding:8 }}>
              <option value='cash'>Cash</option>
              <option value='check'>Check</option>
              <option value='bankTransfer'>Bank Transfer</option>
              <option value='upi'>UPI</option>
              <option value='other'>Other</option>
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label>Note</label>
            <textarea value={form.note} onChange={e=> setForm(f=> ({ ...f, note: e.target.value }))} style={{ width:'100%', minHeight:80 }} />
          </div>
          <div>
            <button onClick={submit} disabled={saving} style={{ padding:'8px 12px', background:'#10b981', color:'#fff', border:'none', borderRadius:6 }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
