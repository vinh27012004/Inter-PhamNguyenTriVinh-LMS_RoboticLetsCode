/**
 * Navbar Component
 * Logo bên trái, Menu items bên phải
 * Dùng màu brandPurple và brandYellow từ tailwind config
 */

'use client';

import Link from 'next/link';
import { Home, BookOpen, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [full_name, setFullName] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Kiểm tra authentication status - chạy lại mỗi khi pathname thay đổi
  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = () => {
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    
    // Lấy username và full_name từ localStorage nếu có
    const storedUsername = localStorage.getItem('username');
    const storedFullName = localStorage.getItem('full_name');

    if (storedUsername) {
      setUsername(storedUsername);
    }

    if (storedFullName) {
      setFullName(storedFullName);
    } else if (storedUsername) {
      // Fallback hiển thị username nếu chưa có full_name
      setFullName(storedUsername);
    }
  };

  // Logout function
  const handleLogout = () => {
    // Xóa tokens
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('full_name');
    
    // Update state
    setIsAuthenticated(false);
    setUsername('');
    setFullName('');
    
    // Redirect về trang chủ
    router.push('/');
  };

  const menuItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Khóa học của tôi', href: '/my-courses', icon: BookOpen },
  ];

  return (
    <nav className="bg-brandPurple-400 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo bên trái */}
          <div className="flex-shrink-0">
            <Link href="/">
              <img
                src="\images\logo\Group 1.png"
                alt="Robotics Let's Code"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Menu items bên phải - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all hover:bg-brandPurple-300/80 hover:text-white hover:-translate-y-0.5"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* User Menu */}
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {username && (
                    <span className="text-brandYellow-300 font-medium px-3">
                      Xin chào, {full_name}
                    </span>
                  )}
                  <Link
                    href="/profile"
                    className="p-2 rounded-full transition-all hover:bg-brandPurple-300/70 hover:-translate-y-0.5"
                    title="Hồ sơ"
                  >
                    <User className="w-5 h-5 text-white" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-brandYellow-500 hover:bg-brandYellow-300 transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5 text-brandPurple-600" />
                  </button>
                </>
              ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-brandYellow-500 text-brandPurple-600 rounded-lg transition-all hover:bg-brandYellow-300 hover:-translate-y-0.5 font-medium"
                  >
                    Đăng nhập
                  </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-brandPurple-400"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-brandPurple-400">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all hover:bg-brandPurple-300/80 hover:-translate-y-0.5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              
              <div className="border-t border-brandPurple-400 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    {username && (
                      <div className="px-4 py-2 text-white font-medium">
                        Xin chào, {username}
                      </div>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all hover:bg-brandPurple-300/80 hover:-translate-y-0.5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Hồ sơ</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center p-3 rounded-lg bg-brandYellow-500 text-brandPurple-600 hover:bg-brandYellow-300 transition-colors font-medium"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center space-x-3 px-4 py-3 rounded-lg bg-brandYellow-500 text-brandPurple-600 hover:bg-brandYellow-300 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Đăng nhập</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
