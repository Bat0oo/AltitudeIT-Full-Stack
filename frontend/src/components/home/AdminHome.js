import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, BarChart3, Users, Package } from 'lucide-react';

const AdminHome = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Products',
      value: '96',
      color: 'purple'
    },
    {
      title: 'Active Users',
      value: '164',
      color: 'orange'
    }
  ];

  const quickActions = [
    {
      title: 'Add Products',
      icon: Plus,
      link: '/admin/products/add',
      color: 'purple'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'gray'
    }
  ];

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <div className="user-welcome">
          <img 
            src={user?.image || '/api/placeholder/60/60'} 
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
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.link} 
                className={`action-card action-${action.color}`}
              >
                <div className="action-icon">
                  <action.icon size={32} />
                </div>
                <div className="action-title">{action.title}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <Package size={20} />
              </div>
              <div className="activity-content">
                <p><strong>New product added:</strong> iPhone 15 Pro</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Users size={20} />
              </div>
              <div className="activity-content">
                <p><strong>New user registered:</strong> john.doe@email.com</p>
                <span className="activity-time">4 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <BarChart3 size={20} />
              </div>
              <div className="activity-content">
                <p><strong>Sales report generated</strong></p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;