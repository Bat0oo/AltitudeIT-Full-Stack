import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    //'Content-Type': 'multipart/form-data',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
    if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get users'
      };
    }
  },

   getImageUrl(imagePath) {
    if (!imagePath) return null;
    console.log('Original image path:', imagePath);

  let cleanPath = imagePath;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    if (cleanPath.startsWith('api/')) {
      cleanPath = cleanPath.substring(4);
    }
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.substring(8);
    }
    if (cleanPath.startsWith('profiles/')) {
      cleanPath = cleanPath.substring(9);
    }
    const imageUrl = `${API_BASE_URL}/images/uploads/profiles/${cleanPath}`;
    console.log('Constructed image URL:', imageUrl); 

    return imageUrl;
  },


    async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return { 
        success: true, 
        data: {
          ...response.data,
          imageUrl: this.getImageUrl(response.data.image) 
        }
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user'
      };
    }
  },

  async createUser(userData, imageFile) {
    try {
      const formData = new FormData();
      
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('email', userData.email);
      formData.append('contactNumber', userData.contactNumber);
      formData.append('role', userData.role);
      formData.append('password', userData.password);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post('/users', formData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user'
      };
    }
  },

  async updateUser(id, userData, imageFile) {
    try {
      const formData = new FormData();
      
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('email', userData.email);
      formData.append('contactNumber', userData.contactNumber);
      formData.append('role', userData.role);

      if (userData.password && userData.password.trim() !== '') {
        formData.append('password', userData.password);
      }

      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }

      const response = await api.put(`/users/${id}`, formData);

      if (response.data && response.data.success && response.data.data) {
      return {
        success: true,
        data: {
          ...response.data.data,
          imageUrl: this.getImageUrl(response.data.data.image)
        }
      };
    } else {
      return {
        success: true,
        data: {
          ...response.data,
          imageUrl: this.getImageUrl(response.data.image)
        }
      };
    }

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      };
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  },

  async checkEmailExists(email, excludeUserId = null) {
    try {
      const result = await this.getAllUsers();
      if (!result.success) {
        return { success: false, exists: false, error: result.error };
      }

      const exists = result.data.some(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.id !== excludeUserId
      );

      return { success: true, exists };
    } catch (error) {
      return {
        success: false,
        exists: false,
        error: 'Error checking email existence'
      };
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    const token = this.getToken();
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) return false;
    
    return new Date(expiry) > new Date();
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
  }
};

export default userService;