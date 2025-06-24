import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import analyticsService from '../../services/analyticsService';
import { Package, Users, X } from 'lucide-react';
import userService from '../../services/userService';

const AdminAnalytics = () => {
  const { user: currentUser } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const result = await analyticsService.getAnalyticsData();
      console.log('Analytics result:', result); 
      if (result.success) {
        console.log('Analytics data:', result.data); 
        setAnalyticsData(result.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Analytics error:', err); 
      setError('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Tablets': '#4F46E5',
      'Smartphones': '#EF4444',
      'Laptops': '#3B82F6', 
      'Cameras': '#8B5CF6',
      'Gaming': '#10B981',
      'Audio': '#059669',
      'Wearables': '#F59E0B',
      'Accessories': '#6B7280'
    };
    return colors[category] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="dashboard-container">
        <div className="admin-loading">
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-welcome">
          <img
            src={userService.getImageUrl(currentUser?.image) || '/api/placeholder/60/60'}
            alt="Admin"
            className="user-avatar-large"
          />
          <div>
            <h1>Analytics Dashboard</h1>
            <p>System analytics and insights</p>
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <a href="/admin/home" className="nav-link">Home</a>
          <a href="/admin/products" className="nav-link">Products</a>
          <a href="/admin/users" className="nav-link">Users</a>
          <a href="/profile" className="nav-link">Profile</a>
        </nav>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess('')} className="success-close">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="admin-users-layout">
        <div className="users-section">
          <div className="users-header">
          </div>
          
          <div className="users-list-card" style={{ marginBottom: '20px', height: '320px' }}>
            <div style={{ padding: '15px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Top Categories Performance</h3>
              <div className="users-list" style={{ maxHeight: '240px', overflow: 'auto' }}>
                {analyticsData.categoryPerformance.map((item, index) => (
                  <div key={item.category} className="user-row" style={{ padding: '12px 0' }}>
                    <div className="user-avatar-wrapper">
                      <div 
                        className="user-row-avatar-fallback"
                        style={{ backgroundColor: getCategoryColor(item.category), width: '30px', height: '30px' }}
                      >
                        <Package size={16} color="white" />
                      </div>
                    </div>

                    <div className="user-row-info">
                      <div className="user-row-name" style={{ fontSize: '13px' }}>
                        {item.category}
                      </div>
                      <div className="user-row-email" style={{ fontSize: '11px' }}>{item.count} products</div>
                      <div className="user-row-date" style={{ fontSize: '11px' }}>{item.percentage}% of total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="users-list-card" style={{ height: '320px' }}>
            <div style={{ padding: '15px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Price Distribution</h3>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={analyticsData.priceDistribution} 
                    margin={{ top: 10, right: 15, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="range" 
                      stroke="#6b7280"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <Bar 
                      dataKey="count" 
                      fill="#4F46E5" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="users-sidebar">
          <div className="users-stat-card" style={{ backgroundColor: '#DFDFDF', padding: '20px', borderRadius: '8px', height: '150px', textAlign: 'center', marginBottom: '16px' }}>
            <div className="stat-number" style={{ fontSize: '48px', fontWeight: 'bold', color: '#4F46E5', margin: '0' }}>
              {analyticsData.totalProducts}
            </div>
            <div className="stat-label" style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Total Products
            </div>
          </div>

          <div className="users-actions-card" style={{ backgroundColor: '#DFDFDF', padding: '20px', borderRadius: '8px', textAlign: 'center', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              width: '100%'
            }}>
              <Users size={32} style={{ color: '#F59E0B' }} />
              <div className="stat-number" style={{ fontSize: '48px', fontWeight: 'bold', color: '#F59E0B', margin: '0' }}>
                {analyticsData.totalUsers}
              </div>
              <div className="stat-label" style={{ fontSize: '14px', color: '#666' }}>
                Active Users
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;