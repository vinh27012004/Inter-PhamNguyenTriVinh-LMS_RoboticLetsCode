/**
 * Home Page
 * Trang chủ hiển thị danh sách khóa học
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPrograms } from '@/services/robotics';
import CourseCard from '@/components/CourseCard';
import SkeletonCard from '@/components/SkeletonCard';

interface Program {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  kit_type: 'SPIKE_ESSENTIAL' | 'SPIKE_PRIME';
  subcourse_count: number;
  total_lessons?: number;
}

export default function HomePage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await getPrograms({ status: 'PUBLISHED' });
        setPrograms(data.results || data); // Handle paginated or direct array response
        setError(null);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError('Không thể tải chương trình học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        {/* Mascot Left - Bay tự do quanh trang */}
        <div className="fixed left-6 top-24 -z-10 opacity-30 hidden lg:block pointer-events-none">
          <Image
            src="/images/mascot/Asset 6 (2).png"
            alt="Mascot"
            width={140}
            height={110}
            className="animate-roam"
          />
        </div>

        {/* Mascot Right - Bay tự do quanh trang */}
        <div className="fixed right-6 bottom-16 -z-10 opacity-30 hidden lg:block pointer-events-none">
          <Image
            src="/images/mascot/Asset 7 (2).png"
            alt="Mascot"
            width={140} 
            height={100}
            className="animate-roamSlow"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Chào mừng đến với
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-yellow-600 mt-2">
            Robotics Let's Code
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Nền tảng học Robotics với LEGO Spike Essential và Prime. 
          Khám phá thế giới lập trình và robot một cách thú vị!
        </p>
      </div>

      {/* Programs Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Chương trình học
            </h2>
            <p className="text-gray-600">
              Khám phá các chương trình Robotics với LEGO Spike
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Programs Grid */}
        {!loading && !error && programs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <CourseCard
                key={program.id}
                id={program.id}
                slug={program.slug}
                title={program.title}
                description={program.description}
                thumbnail_url={program.thumbnail_url}
                kit_type={program.kit_type}
                subcourse_count={program.subcourse_count} 
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && programs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có khóa học nào
            </h3>
            <p className="text-gray-600">
              Các khóa học sẽ sớm được cập nhật. Vui lòng quay lại sau!
            </p>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Học từ cơ bản</h3>
          <p className="text-gray-600">
            Bắt đầu với LEGO Spike Essential, phù hợp cho học sinh tiểu học
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Lập trình thực tế</h3>
          <p className="text-gray-600">
            Học Scratch, Python với các dự án robot thú vị
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Theo dõi tiến độ</h3>
          <p className="text-gray-600">
            Hệ thống quản lý tiến độ học tập cá nhân hóa
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Sẵn sàng bắt đầu hành trình Robotics?
        </h2>
        <p className="text-lg mb-6 text-blue-100">
          Truy cập các khóa học được gán cho bạn và bắt đầu học ngay!
        </p>
        <a
          href="/my-courses"
          className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Xem khóa học của tôi
        </a>
      </div>
    </div>
  );
}
