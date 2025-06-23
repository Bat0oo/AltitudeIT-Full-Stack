import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Upload, X, Save, Phone, Mail, UserCircle, AlertTriangle, LogOut  } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import userService, { getImageUrl } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user: currentUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'http://localhost:8080/api';
  const ROLE_USER = 1;
  const ROLE_ADMIN = 2;
  
  const [user, setUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    role: ROLE_USER,
    image: null
  });
  
  const [formData, setFormData] = useState({ ...user });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    console.log('Current user from context:', currentUser); // Debug log
    if (currentUser && currentUser.id) {
      loadUserProfile();
    } else {
      // If no user from context, try to get from service
      const storedUser = userService.getUser();
      console.log('Stored user from service:', storedUser); // Debug log
      if (storedUser && storedUser.id) {
        loadUserProfileById(storedUser.id);
      } else {
        setError('No user information found. Please login again.');
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser || !currentUser.id) {
      setError('User information not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      console.log('Loading profile for user ID:', currentUser.id); // Debug log
      const result = await userService.getUserById(currentUser.id);
      
      console.log('Service response:', result); // Debug log
      
      if (result.success && result.data) {
        setUser(result.data);
        setFormData(result.data);
        console.log('Profile loaded successfully:', result.data); // Debug log
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
      
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfileById = async (userId) => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Loading profile for user ID:', userId); // Debug log
      const result = await userService.getUserById(userId);
      
      if (result.success && result.data) {
        setUser(result.data);
        setFormData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
      
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.contactNumber?.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.contactNumber)) {
      errors.contactNumber = 'Please enter a valid contact number';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
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

  const handleCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
        return;
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Unable to access camera. Please use file upload instead.');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors before saving');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      if (formData.email !== user.email) {
        const emailCheckResult = await userService.checkEmailExists(formData.email, user.id);
        if (emailCheckResult.success && emailCheckResult.exists) {
          setValidationErrors(prev => ({
            ...prev,
            email: 'This email is already in use'
          }));
          setError('Email already exists');
          return;
        }
      }
        /*
      const updatedUser = await userService.updateUser(user.id, formData, imageFile);
      
      setUser(updatedUser);
      setFormData(updatedUser);
      setIsEditing(false); 
      setImageFile(null);
      setImagePreview(null);
      setSuccess('Profile updated successfully!');
      
      if (updateUser) {
        updateUser(updatedUser);
      }
      setTimeout(() => setSuccess(''), 3000);
*/

const result = await userService.updateUser(user.id, formData, imageFile);
      
      if (result.success) {
        // Refresh user data after successful update
        const updatedResult = await userService.getUserById(user.id);
        if (updatedResult.success) {
          setUser(updatedResult.data);
          setFormData(updatedResult.data);
          
          if (updateUser) {
            updateUser(updatedResult.data);
          }
        }
        
        setIsEditing(false); 
        setImageFile(null);
        setImagePreview(null);
        setSuccess('Profile updated successfully!');
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
    setValidationErrors({});
    setError('');
    setSuccess('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        userService.logout();
      }
      navigate('/login'); 
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };
const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.style.display = 'none';
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = 'flex';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user data
  if (!user.id && error) {
    return (
      <div className="dashboard-container">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-welcome">
          <img
            src={userService.getImageUrl(user?.image) || '/api/placeholder/60/60'}
            alt="User"
            className="user-avatar-large"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="user-avatar-fallback" style={{ display: 'none' }}>
            <UserCircle className="w-15 h-15 text-gray-400" />
          </div>
          <div>
            <h1>Personal Information Settings</h1>
            <p>Manage your profile information</p>
          </div>
        </div>
        
        <div className="dashboard-nav">
          {(currentUser?.role === ROLE_ADMIN || user?.role === ROLE_ADMIN) ? (
            <>
              <Link to="/admin/home" className="nav-item">Home</Link>
              <Link to="/admin/products" className="nav-item">Products</Link>
              <Link to="/admin/users" className="nav-item">Users</Link>
              <Link to="/profile" className="nav-item active">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/user/home" className="nav-item">Home</Link>
              <Link to="/user/products" className="nav-item">Products</Link>
              <Link to="/profile" className="nav-item active">Profile</Link>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-sidebar">
          <div className="profile-nav-card">
            <h3>Personal Information Settings</h3>
            <div className="profile-nav-item active">
              <User className="w-5 h-5" />
              <span>Profile Settings</span>
            </div>
            <div className="profile-nav-item logout-item" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-card">
            <div className="profile-header">
              <h2>{isEditing ? 'Edit Profile' : 'User Profile'}</h2>
              <div className="profile-actions">
                {!isEditing && (
                  <button onClick={handleEdit} className="btn btn-outline">
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
                <div className="profile-avatar-small">
                  {user?.image ? (
                    <img 
                      src={userService.getImageUrl(user.image)} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <User className="w-6 h-6" style={{ display: user?.image ? 'none' : 'block' }} />
                </div>
              </div>
            </div>

            <div className="profile-image-section">
              <div className="profile-image-container">
                <div className="profile-image-large">
                  {imagePreview || user.image ? (
                    <img 
                      src={imagePreview || userService.getImageUrl(user.image)} 
                      alt="Profile" 
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      <UserCircle className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="profile-image-controls">
                  <div className="image-upload-buttons">
                    <label className="btn btn-primary btn-sm">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <button 
                      type="button"
                      onClick={handleCameraCapture}
                      className="btn btn-outline btn-sm"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  {(imagePreview || imageFile) && (
                    <button
                      onClick={removeImage}
                      className="remove-photo-btn"
                    >
                      <X className="w-4 h-4" />
                      Remove Photo
                    </button>
                  )}
                  
                  <p className="image-help-text">
                    Upload photo from your device (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`form-input ${validationErrors.firstName ? 'error' : ''}`}
                    />
                  </div>
                  {validationErrors.firstName && (
                    <p className="error-text">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`form-input ${validationErrors.lastName ? 'error' : ''}`}
                    />
                  </div>
                  {validationErrors.lastName && (
                    <p className="error-text">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`form-input ${validationErrors.email ? 'error' : ''}`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="error-text">{validationErrors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`form-input ${validationErrors.contactNumber ? 'error' : ''}`}
                    />
                  </div>
                  {validationErrors.contactNumber && (
                    <p className="error-text">{validationErrors.contactNumber}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    placeholder="Enter new password (leave blank to keep current)"
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.password ? 'error' : ''}`}
                  />
                  {validationErrors.password && (
                    <p className="error-text">{validationErrors.password}</p>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="profile-actions-footer">
                <button onClick={handleCancel} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;