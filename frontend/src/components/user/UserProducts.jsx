import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { Package, User, X } from 'lucide-react';
import userService from '../../services/userService';

const UserProducts = () => {
  const { user: currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  
  const productsPerPage = 10;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

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
            src={userService.getImageUrl ? userService.getImageUrl(currentUser?.image) : '/api/placeholder/60/60'}
            alt="User"
            className="user-avatar-large"
          />
          <div>
            <h1>Products</h1>
            <p>Browse our product catalog</p>
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <a href="/user/home" className="nav-link">Home</a>
          <a href="/user/products" className="nav-link active">Products</a>
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

      <div className="admin-users-layout">
        <div className="users-section">
          <div className="users-header">
            <h2>Available Products</h2>
          </div>
          
          <div className="users-list-card">
            <div className="users-list">
              {currentProducts.map(product => (
                <div key={product.id} className="user-row">
                  <div className="user-avatar-wrapper">
                    {product.image ? (
                      <img
                        src={productService.getImageUrl(product.image)}
                        alt={product.name}
                        className="user-row-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="user-row-avatar-fallback">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="user-row-avatar-fallback" style={{ display: 'none' }}>
                      <Package size={20} />
                    </div>
                  </div>

                  <div className="user-row-info">
                    <div className="user-row-name">
                      {product.name}
                    </div>
                    <div className="user-row-email">
                      Category: {getCategoryName(product.category)}
                    </div>
                    <div className="user-row-date" style={{ fontWeight: 'bold', color: '#FF8C00' }}>
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="users-pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProducts;