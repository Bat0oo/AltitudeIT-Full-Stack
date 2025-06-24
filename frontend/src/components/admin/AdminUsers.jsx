import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { Trash2, User, Check, X } from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const usersPerPage = 10;
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getAllUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteMode(!deleteMode);
    setSelectedUsers(new Set());
  };

  const handleUserSelect = (userId) => {
    if (userId === currentUser?.id) return;
    
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    setDeleting(true);
    setError('');
    let deletedCount = 0;
    let failedCount = 0;

    try {
      for (const userId of selectedUsers) {
        const result = await userService.deleteUser(userId);
        if (result.success) {
          deletedCount++;
        } else {
          failedCount++;
        }
      }

      if (deletedCount > 0) {
        setSuccess(`Successfully deleted ${deletedCount} user(s)`);
        await fetchUsers();
        
        const newTotalPages = Math.ceil((users.length - deletedCount) / usersPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      }

      if (failedCount > 0) {
        setError(`Failed to delete ${failedCount} user(s)`);
      }

      setSelectedUsers(new Set());
      setDeleteMode(false);
    } catch (err) {
      setError('Error during bulk delete operation');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
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
            <h1>User Management</h1>
            <p>Manage system users</p>
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <a href="/admin/home" className="nav-link">Home</a>
          <a href="/admin/products" className="nav-link">Products</a>
          <a href="/admin/users" className="nav-link active">Users</a>
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
            <h2>Active Users</h2>
          </div>
          
          <div className="users-list-card">
            <div className="users-list">
              {currentUsers.map(user => (
                <div key={user.id} className={`user-row ${selectedUsers.has(user.id) ? 'selected' : ''}`}>
                  {deleteMode && (
                    <div className="user-select-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        disabled={user.id === currentUser?.id}
                      />
                    </div>
                  )}
                  
                  <div className="user-avatar-wrapper">
                    {user.image ? (
                      <img
                        src={userService.getImageUrl(user.image)}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="user-row-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="user-row-avatar-fallback">
                        <User size={20} />
                      </div>
                    )}
                    <div className="user-row-avatar-fallback" style={{ display: 'none' }}>
                      <User size={20} />
                    </div>
                  </div>

                  <div className="user-row-info">
                    <div className="user-row-name">
                      {user.firstName} {user.lastName}
                      {user.id === currentUser?.id && (
                        <span className="current-user-indicator">You</span>
                      )}
                    </div>
                    <div className="user-row-email">{user.email}</div>
                    <div className="user-row-date">{formatDate(user.createdAt || new Date())}</div>
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

        <div className="users-sidebar">
          <div className="users-stat-card" style={{ backgroundColor: '#DFDFDF', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
            <div className="stat-number" style={{ fontSize: '48px', fontWeight: 'bold', color: '#FF8C00', margin: '0' }}>
              {users.length}
            </div>
            <div className="stat-label" style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Total
            </div>
          </div>

          <div className="users-actions-card" style={{ backgroundColor: '#DFDFDF', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <button 
              className={`users-action-btn ${deleteMode ? 'cancel' : 'delete'}`}
              onClick={handleDeleteClick}
              disabled={deleting}
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
              <Trash2 size={32} style={{ color: '#000' }} />
              <span>{deleteMode ? 'Cancel' : 'Delete Users'}</span>
            </button>
            
            {deleteMode && selectedUsers.size > 0 && (
              <button 
                className="users-delete-btn"
                onClick={handleBulkDelete}
                disabled={deleting}
                style={{
                  marginTop: '12px',
                  backgroundColor: '#FF4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {deleting ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>Delete</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;