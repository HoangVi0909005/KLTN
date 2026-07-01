import axios from 'axios';

// Base URL của backend API
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  responseType: 'json',
  transformResponse: [function (data) {
    // Nếu response là string, parse nó
    if (typeof data === 'string') {
      try {
        console.log('🔄 Axios transforming string to JSON...');
        return JSON.parse(data);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        console.error('❌ Raw data:', data);
        // Trả về object với message từ string
        return { success: false, message: data };
      }
    }
    return data;
  }]
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để debug và handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url);
    console.log('   - Status:', response.status);
    console.log('   - Data type:', typeof response.data);
    console.log('   - Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    if (error.response) {
      // Server trả về error response
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
      console.error('   - Headers:', error.response.headers);
      
      // Nếu 401 Unauthorized, có thể redirect về login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login'; // Uncomment nếu muốn auto redirect
      }
    } else if (error.request) {
      console.error('   - No response received');
      console.error('   - Request:', error.request);
    } else {
      console.error('   - Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;