/**
 * Axios Instance Configuration
 * Cấu hình Axios với baseURL từ env và Auto-attach Bearer Token
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL từ environment variable
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ Cookie hoặc localStorage
    let token = Cookies.get('access_token');
    
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }

    // Đính kèm token vào header nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý lỗi và auto-refresh token (nếu cần)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý 401 Unauthorized - Token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lấy refresh token
        const refreshToken = Cookies.get('refresh_token') || 
          (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

        if (refreshToken) {
          // Gọi API refresh token
          const response = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // Lưu token mới
          Cookies.set('access_token', access);
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access);
          }

          // Retry request với token mới
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh thất bại -> Đăng xuất
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Xử lý lỗi khác
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Helper functions để quản lý token
export const authHelpers = {
  /**
   * Lưu tokens vào Cookie và localStorage
   */
  setTokens: (accessToken, refreshToken) => {
    Cookies.set('access_token', accessToken, { expires: 1 }); // 1 day
    Cookies.set('refresh_token', refreshToken, { expires: 7 }); // 7 days
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  },

  /**
   * Xóa tokens (đăng xuất)
   */
  clearTokens: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  /**
   * Lấy access token
   */
  getAccessToken: () => {
    return Cookies.get('access_token') || 
      (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return !!authHelpers.getAccessToken();
  },
};
