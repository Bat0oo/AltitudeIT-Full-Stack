import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserHome = () => {
  const { user } = useAuth();

  const products = [
    {
      id: 1,
      name: 'Phone',
      price: '$999',
      image: '/api/placeholder/150/150',
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Laptop',
      price: '$1299',
      image: '/api/placeholder/150/150',
      category: 'Electronics'
    },
    {
      id: 3,
      name: 'Headphones',
      price: '$199',
      image: '/api/placeholder/150/150',
      category: 'Audio'
    },
    {
      id: 4,
      name: 'Camera',
      price: '$599',
      image: '/api/placeholder/150/150',
      category: 'Photography'
    },
    {
      id: 5,
      name: 'Watch',
      price: '$299',
      image: '/api/placeholder/150/150',
      category: 'Accessories'
    },
    {
      id: 6,
      name: 'Tablet',
      price: '$499',
      image: '/api/placeholder/150/150',
      category: 'Electronics'
    },
    {
      id: 7,
      name: 'Gaming Console',
      price: '$399',
      image: '/api/placeholder/150/150',
      category: 'Gaming'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-welcome">
          <img 
            src={user?.image || '/api/placeholder/60/60'} 
            alt="User" 
            className="user-avatar-large"
          />
          <div>
            <h1>Welcome, {user?.firstName}!</h1>
            <p>Discover amazing products</p>
          </div>
        </div>
        
        <div className="dashboard-nav">
          <Link to="/user/home" className="nav-item">Home</Link>
          <Link to="/user/products" className="nav-item">Products</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
        </div>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <div className="product-footer">
                <span className="product-price">{product.price}</span>
                <button className="btn btn-sm btn-primary">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHome;