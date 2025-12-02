/**
 * Navbar Component
 * Logo bên trái, Menu items bên phải
 */

'use client';

import Link from 'next/link';
import { Home, BookOpen, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Khóa học của tôi', href: '/my-courses', icon: BookOpen },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
      {/* Logo bên trái */}
      <div className="flex-shrink-0">
        <Link href="/">
          <img
            src="/images/LOGO.png"
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
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* User Menu */}
            <div className="ml-4 flex items-center space-x-2">
              <Link
                href="/profile"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Hồ sơ"
              >
                <User className="w-5 h-5 text-gray-700" />
              </Link>
              <button
                onClick={() => {
                  // Logout logic sẽ implement sau
                  console.log('Logout clicked');
                }}
                className="p-2 rounded-full hover:bg-red-100 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
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
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Hồ sơ</span>
                </Link>
                <button
                  onClick={() => {
                    console.log('Logout clicked');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
