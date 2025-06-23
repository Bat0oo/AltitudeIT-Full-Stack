import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { Plus, Package, Edit, Trash2, X, Upload, Camera, ImagePlus } from 'lucide-react';

const AdminProducts = () => {
  const { user: currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const productsPerPage = 10;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const categories = [
    { value: 0, label: 'Tablets' },
    { value: 1, label: 'Smartphones' },
    { value: 2, label: 'Laptops' },
    { value: 3, label: 'Cameras' },
    { value: 4, label: 'Gaming' },
    { value: 5, label: 'Audio' },
    { value: 6, label: 'Wearables' },
    { value: 7, label: 'Accessories' }
  ];

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

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const result = await productService.deleteProduct(productId);
      if (result.success) {
        setSuccess('Product deleted successfully');
        await fetchProducts();
        
        const newTotalPages = Math.ceil((products.length - 1) / productsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        setError('Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product');
    } finally {
      setDeleting(false);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    fetchProducts();
    setSuccess(editingProduct ? 'Product updated successfully' : 'Product created successfully');
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
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
            src={currentUser?.imageUrl || '/api/placeholder/60/60'}
            alt="Admin"
            className="user-avatar-large"
          />
          <div>
            <h1>Product Management</h1>
            <p>Manage system products</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="dashboard-nav">
          <a href="/home" className="nav-link">Home</a>
          <a href="/products" className="nav-link active">Products</a>
          <a href="/users" className="nav-link">Users</a>
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
        {/* Left side - Active Products List */}
        <div className="users-section">
          <div className="users-header">
            <h2>Active Products</h2>
          </div>
          
          <div className="users-list-card">
            <div className="users-list">
              {currentProducts.map(product => (
                <div key={product.id} className="product-row">
                  <div className="product-image-wrapper">
                    {product.image ? (
                      <img
                        src={productService.getImageUrl(product.image)}
                        alt={product.name}
                        className="product-row-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="product-row-image-fallback">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="product-row-image-fallback" style={{ display: 'none' }}>
                      <Package size={20} />
                    </div>
                  </div>

                  <div className="product-row-info">
                    <div className="product-row-name">{product.name}</div>
                    <div className="product-row-category">{product.categoryName}</div>
                    <div className="product-row-price">{formatPrice(product.price)}</div>
                  </div>

                  <div className="product-row-actions">
                    <button
                      className="product-action-btn edit"
                      onClick={() => handleEditProduct(product)}
                      disabled={deleting}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="product-action-btn delete"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deleting}
                    >
                      <Trash2 size={16} />
                    </button>
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

        {/* Right side - Stats and Actions */}
        <div className="users-sidebar">
          {/* Total Products Card with Purple Number */}
          <div className="users-stat-card" style={{ backgroundColor: '#DFDFDF', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
            <div className="stat-number" style={{ fontSize: '48px', fontWeight: 'bold', color: '#9333EA', margin: '0' }}>
              {products.length}
            </div>
            <div className="stat-label" style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Total
            </div>
          </div>

          {/* Add Products Card with Plus Icon */}
          <div className="users-actions-card" style={{ backgroundColor: '#DFDFDF', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <button 
              className="users-action-btn"
              onClick={handleAddProduct}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '14px', 
                color: '#000',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                width: '100%'
              }}
            >
              <Plus size={32} style={{ color: '#000' }} />
              <span>Add Products</span>
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={handleModalClose}
          onSave={handleProductSaved}
        />
      )}
    </div>
  );
};

const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 0,
    price: product?.price || '',
    image: product?.image,
  });
  const [imageFile, setImageFile] = useState(
    product?.image ? productService.getImageUrl(product.image) : null//
  ); 
  const [imagePreview, setImagePreview] = useState(
    product?.image ? productService.getImageUrl(product.image) : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(product?.image ? productService.getImageUrl(product.image) : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const productData = {
        name: formData.name,
        category: parseInt(formData.category),
        price: parseFloat(formData.price)
      };

      let result;
      if (product) {
        result = await productService.updateProduct(product.id, productData, imageFile);
      } else {
        result = await productService.createProduct(productData, imageFile);
      }

      if (result.success) {
        onSave();
      } else {
        setError(result.error || 'Failed to save product');
      }
    } catch (err) {
      setError('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '32px',
        width: '500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} color="#666" />
        </button>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Product Name Input */}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Product Name"
            required
            style={{
              width: '100%',
              padding: '16px 20px',
              border: 'none',
              borderRadius: '25px',
              backgroundColor: 'white',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />

          {/* Category Select */}
          <div style={{ position: 'relative' }}>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: 'none',
                borderRadius: '25px',
                backgroundColor: 'white',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                appearance: 'none',
                cursor: 'pointer',
                color: formData.category === 0 && !categories.find(c => c.value === 0) ? '#999' : '#000'
              }}
            >
              <option value="" disabled>Select Category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#999'
            }}>
              ▼
            </div>
          </div>

          {/* Price Input */}
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Price"
            step="0.01"
            min="0"
            required
            style={{
              width: '100%',
              padding: '16px 20px',
              border: 'none',
              borderRadius: '25px',
              backgroundColor: 'white',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />

          {/* Add Image Section */}
          <div 
            onClick={handleImageUpload}
            style={{
              width: '100%',
              padding: '20px',
              border: '2px dashed #ddd',
              borderRadius: '25px',
              backgroundColor: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#999';
              e.target.style.backgroundColor = '#fafafa';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#ddd';
              e.target.style.backgroundColor = 'white';
            }}
          >
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="Product preview"
                  style={{
                    maxWidth: '100px',
                    maxHeight: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ×
                </button>
              </>
            ) : (
              <>
                <Plus size={32} color="#999" />
                <span style={{ color: '#999', fontSize: '16px' }}>Add Image</span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: saving ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.target.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.target.style.backgroundColor = '#007bff';
              }
            }}
          >
            {saving ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;