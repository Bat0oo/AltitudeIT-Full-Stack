import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, BarChart3, Users, Package } from 'lucide-react';
import { useState,useEffect, } from 'react';
import productService from '../../services/productService';
import userService from '../../services/userService';

const AdminHome = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(()=>{
fetchData();
},[]);

const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResult, productsResult] = await Promise.all([
        userService.getAllUsers(),
        productService.getAllProducts()
      ]);

      if (usersResult.success) {
        setUsers(usersResult.data);
      } else {
        console.error('Failed to fetch users:', usersResult.message);
      }

      if (productsResult.success) {
        setProducts(productsResult.data);
      } else {
        console.error('Failed to fetch products:', productsResult.message);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Products',
      value: loading ? '...' : products.length,
      color: 'purple'
    },
    {
      title: 'Active Users',
      value: loading ? '...' : users.length,
      color: 'orange'
    }
  ];

  const quickActions = [
    {
      title: 'Add Products',
      icon: Plus,
      color:"#DFDFDF"
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      color: "#DFDFDF"
    }
  ];

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <div className="user-welcome">
          <img
            src={userService.getImageUrl(user?.image) || '/api/placeholder/60/60'}
            alt="Admin"
            className="user-avatar-large"
          />
          <div>
            <h1>Admin Home</h1>
            <p>Functions</p>
          </div>
        </div>

        <div className="dashboard-nav">
          <Link to="/admin/home" className="nav-item active">Home</Link>
          <Link to="/admin/products" className="nav-item">Products</Link>
          <Link to="/admin/users" className="nav-item">Users</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
        </div>
      </div>

      <div className="admin-content">
        {error && (
          <div style={{ color: 'red', marginBottom: '16px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
            Error loading data: {error}
          </div>
        )}
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ backgroundColor: '#DFDFDF', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
              <div className="stat-value" style={{ fontSize: '48px', fontWeight: 'bold', color: stat.color === 'purple' ? '#9333EA' : '#FF8C00', margin: '0' }}>
                {stat.value}
              </div>
              <div className="stat-title" style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                {stat.title}
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
          <Link
        key={index}
        to={index === 1 ? "/admin/analytics" : "/admin/products"}
        className={`action-card action-${action.color}`}
        state={{ showModal: index !== 1 }}
        style={{ 
          backgroundColor: '#DFDFDF', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center', 
          textDecoration: 'none', 
          color: 'inherit', 
          display: 'block' 
        }}
      >
                <div className="action-icon">
                  <action.icon size={32} />
                </div>
                <div className="action-title">{action.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;