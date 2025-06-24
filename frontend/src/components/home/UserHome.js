import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { Package, X } from 'lucide-react';
import userService from '../../services/userService';

const UserHome = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await productService.getAllProducts();
      if (result.success) {
        setProducts(result.data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryName = (categoryEnum) => {
    const categoryMap = {
      0: 'Tablets',
      1: 'Smartphones', 
      2: 'Laptops',
      3: 'Cameras',
      4: 'Gaming',
      5: 'Audio',
      6: 'Wearables',
      7: 'Accessories'
    };
    return categoryMap[categoryEnum] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-welcome">
          <img 
            src={userService.getImageUrl ? userService.getImageUrl(user?.image) : '/api/placeholder/60/60'} 
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

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              {product.image ? (
                <img 
                  src={productService.getImageUrl(product.image)} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="product-image-fallback">
                  <Package size={40} />
                </div>
              )}
              <div className="product-image-fallback" style={{ display: 'none' }}>
                <Package size={40} />
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">{getCategoryName(product.category)}</p>
              <div className="product-footer">
                <span className="product-price">{formatPrice(product.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHome;