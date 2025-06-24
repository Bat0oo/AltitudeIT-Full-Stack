import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            Home
          </Link>
          
          {user && (
            <div className="nav-links">
              {isAdmin() ? (
                <>
                  <Link to="/admin/home" className="nav-link">Home</Link>
                  <Link to="/admin/products" className="nav-link">Products</Link>
                  <Link to="/admin/users" className="nav-link">Users</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/user/products" className="nav-link">Products</Link>
                  <Link to="/user/orders" className="nav-link">Orders</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <img 
                  src={user.image || '/default-avatar.png'} 
                  alt="User" 
                  className="user-avatar"
                />
                <span className="user-name">{user.firstName} {user.lastName}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;