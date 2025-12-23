/**
 * Login Page
 * Trang đăng nhập cho học viên và giáo viên
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Lưu tokens
        Cookies.set('access_token', data.access, { expires: 1 });
        Cookies.set('refresh_token', data.refresh, { expires: 7 });
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', formData.username);
        // Lưu tạm full_name bằng username, sẽ cập nhật sau khi lấy profile
        localStorage.setItem('full_name', formData.username);

        // Lấy thông tin profile để biết role
        try {
          const profileResponse = await fetch('http://localhost:8000/api/auth/profile/me/', {
            headers: {
              'Authorization': `Bearer ${data.access}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            localStorage.setItem('full_name', profileData.full_name || formData.username);
            localStorage.setItem('user_role', profileData.role || 'STUDENT');
          } else {
            localStorage.setItem('user_role', 'STUDENT');
          }
        } catch (profileErr) {
          console.error('Error fetching profile:', profileErr);
          localStorage.setItem('full_name', formData.username);
          localStorage.setItem('user_role', 'STUDENT');
        }

        // Redirect về trang chủ
        router.push('/');
        router.refresh();
      } else {
        const errorData = await response.json();
        console.log('Login error response:', errorData);
        setError(errorData.detail || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
            <img
              src="/images/logo/Profile banner - 1.png"
              alt="Robotics Let's Code"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-600">
            Truy cập vào nền tảng học Robotics
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Nhập mật khẩu"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Chưa có tài khoản? Liên hệ giáo vụ để được cấp quyền truy cập.</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
