/**
 * Root Layout
 * Layout chung cho toàn bộ app với Navbar và font Inter
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

// Cấu hình font Inter
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Robotics Let\'s Code - LEGO Spike Learning Platform',
  description: 'Nền tảng học Robotics với LEGO Spike Essential và Prime dành cho học sinh',
  keywords: ['robotics', 'lego', 'spike', 'education', 'coding', 'stem'],
  authors: [{ name: 'E-Robotic Let\'s Code Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen bg-gray-50`}>
        <Navbar />

        <main>
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                © 2025 Robotics Let's Code. Nền tảng học Robotics với LEGO Spike.
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Được phát triển bởi E-Robotic Let's Code Team
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
