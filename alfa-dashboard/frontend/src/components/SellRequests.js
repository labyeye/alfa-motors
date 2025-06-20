import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SellRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellRequests = async () => {
      try {
        const response = await axios.get('http://localhost:2500/api/sell-requests', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRequests(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching sell requests:", err);
        setError("Failed to load sell requests");
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchSellRequests();
  }, [navigate]);

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.patch(
        `http://localhost:2500/api/sell-requests/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setRequests(requests.map(request => 
        request._id === id ? response.data : request
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app-container">
      {/* Sidebar - unchanged from your original */}
      
      {/* Main Content */}
      <div className="main-content">
        {/* Topbar - unchanged from your original */}
        
        {/* Content Wrapper */}
        <div className="content-wrapper">
          <div className="table-container">
            <div className="table-header">
              <h1 className="table-title">Sell Requests</h1>
            </div>

            <div className="table-body">
              <table>
                <thead>
                  <tr>
                    <th>Bike</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Images</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request._id}>
                      <td>
                        <strong>{request.brand}</strong><br />
                        {request.model} ({request.year})
                      </td>
                      <td>
                        {request.sellerName}<br />
                        {request.sellerPhone}<br />
                        {request.sellerEmail}
                      </td>
                      <td>₹{request.expectedPrice.toLocaleString()}</td>
                      <td>
                        {request.images && request.images.length > 0 ? (
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {request.images.map((image, index) => (
                              <img
                                key={index}
                                src={`/uploads/${image}`}
                                style={{
                                  maxWidth: '50px',
                                  maxHeight: '50px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => window.open(`/uploads/${image}`, '_blank')}
                                alt={`Bike ${index + 1}`}
                              />
                            ))}
                          </div>
                        ) : 'No images'}
                      </td>
                      <td>
                        <span className={`status-badge status-${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {request.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => updateStatus(request._id, 'Approved')}
                                className="btn btn-success btn-sm"
                              >
                                <i className="material-icons btn-icon">check</i>
                                <span>Approve</span>
                              </button>
                              <button 
                                onClick={() => updateStatus(request._id, 'Rejected')}
                                className="btn btn-error btn-sm"
                              >
                                <i className="material-icons btn-icon">close</i>
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          <Link to={`/admin/sell-requests/${request._id}`} className="btn btn-primary btn-sm">
                            <i className="material-icons btn-icon">visibility</i>
                            <span>View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellRequests;