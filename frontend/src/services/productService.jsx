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

export const productService = {
  async getAllProducts() {
    try {
      const response = await api.get('/products');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get products'
      };
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return { 
        success: true, 
        data: {
          ...response.data,
          imageUrl: this.getImageUrl(response.data.image) 
        }
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product'
      };
    }
  },

  async getProductsByCategory(category) {
    try {
      const response = await api.get(`/products/category/${category}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get products by category'
      };
    }
  },

  async createProduct(productData, imageFile) {
    try {
      const formData = new FormData();
      
    if (productData.name) formData.append('Name', productData.name);
    if (productData.category) formData.append('Category', productData.category);
    if (productData.price != null) formData.append('Price', productData.price); 

      if (imageFile) {
        formData.append('Image', imageFile);
      }

      const response = await api.post('/products', formData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create product'
      };
    }
  },

  async updateProduct(id, productData, imageFile) {
    try {
      const formData = new FormData();

    if (productData.name) formData.append('name', productData.name);
    if (productData.category) formData.append('category', productData.category);
    if (productData.price != null) formData.append('price', productData.price); 

      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }

      const response = await api.put(`/products/${id}`, formData);

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
        error: error.response?.data?.message || 'Failed to update product'
      };
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete product'
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
    if (cleanPath.startsWith('products/')) {
      cleanPath = cleanPath.substring(9);
    }
    const imageUrl = `${API_BASE_URL}/images/uploads/products/${cleanPath}`;
    console.log('Constructed image URL:', imageUrl); 

    return imageUrl;
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

export default productService;