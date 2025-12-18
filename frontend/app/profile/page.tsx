'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  school: string;
  role: string;
  role_display: string;
  phone: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form data cho cập nhật profile
  const [formData, setFormData] = useState({
    full_name: '',
    school: '',
    phone: '',
    avatar_url: '',
    bio: '',
  });

  // Form data cho đổi password
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/profile/me/');
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        school: response.data.school || '',
        phone: response.data.phone || '',
        avatar_url: response.data.avatar_url || '',
        bio: response.data.bio || '',
      });
      setLoading(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Không thể tải thông tin profile');
        setLoading(false);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.put('/auth/profile/update_profile/', formData);
      setProfile(response.data);
      setEditing(false);
      setMessage('Cập nhật thông tin thành công!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await axios.post('/auth/profile/change_password/', passwordData);
      setChangingPassword(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
      setMessage('Đổi mật khẩu thành công!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.old_password || 
                       err.response?.data?.confirm_password ||
                       err.response?.data?.detail || 
                       'Có lỗi xảy ra khi đổi mật khẩu';
      setError(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Không tìm thấy thông tin profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg text-brandPurple-600 transition-all hover:text-brandPurple-700 hover:bg-brandPurple-50 hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại trang chủ
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Thông tin cá nhân</h1>

        {/* Thông báo */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header với Avatar */}
          <div className="bg-gradient-to-r from-brandPurple-400 to-brandPurple-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-white overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-brandPurple-400">
                    {profile.full_name?.[0] || profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.full_name || profile.username}</h2>
                <p className="text-brandPurple-50">{profile.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {profile.role_display}
                </span>
              </div>
            </div>
          </div>

          {/* Nội dung */}
          <div className="p-8">
            {!editing && !changingPassword && (
              <div>
                {/* Hiển thị thông tin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên đăng nhập
                    </label>
                    <p className="text-gray-900">{profile.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <p className="text-gray-900">{profile.full_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trường học
                    </label>
                    <p className="text-gray-900">{profile.school || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <p className="text-gray-900">{profile.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <p className="text-gray-900">{profile.role_display}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới thiệu
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {profile.bio || 'Chưa có thông tin'}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2 bg-brandPurple-400 text-white rounded hover:bg-brandPurple-600 transition-colors"
                  >
                    Chỉnh sửa thông tin
                  </button>
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Đổi mật khẩu
                  </button>
                </div>

              </div>
            )}

            {/* Form chỉnh sửa */}
            {editing && (
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brandPurple-400 focus:border-brandPurple-400 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trường học
                    </label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brandPurple-400 focus:border-brandPurple-400 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brandPurple-400 focus:border-brandPurple-400 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới thiệu
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brandPurple-400 focus:border-brandPurple-400 text-gray-900 bg-white"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brandYellow-500 text-gray-900 font-semibold rounded hover:bg-brandYellow-300 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        full_name: profile.full_name || '',
                        school: profile.school || '',
                        phone: profile.phone || '',
                        avatar_url: profile.avatar_url || '',
                        bio: profile.bio || '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* Form đổi mật khẩu */}
            {changingPassword && (
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu cũ
                    </label>
                    <input
                      type="password"
                      value={passwordData.old_password}
                      onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brandPurple-400 focus:border-brandPurple-400 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu mới (tối thiểu 8 ký tự)
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brandPurple-400 focus:border-brandPurple-400 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brandPurple-400 focus:border-brandPurple-400 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brandYellow-500 text-gray-900 font-semibold rounded hover:bg-brandYellow-300 transition-colors"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({
                        old_password: '',
                        new_password: '',
                        confirm_password: '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Mascot Decoration */}
        <div className="hidden lg:flex fixed bottom-0 right-0 opacity-20 pointer-events-none">
          <Image
            src="/images/mascot/leco game 4.png"
            alt="Mascot"
            width={200}
            height={200}
            className="animate-float"
          />
        </div>
      </div>
    </div>
  );
}
