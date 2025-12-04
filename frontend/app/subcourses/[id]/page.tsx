/**
 * Subcourse Detail Page
 * Chi tiết khóa học con với danh sách bài học
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSubcourseDetail } from '@/services/robotics';
import Cookies from 'js-cookie';

interface Lesson {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  sort_order: number;
  estimated_duration: number;
  video_url: string;
  project_file_url: string;
}

interface Subcourse {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  coding_language: string;
  coding_language_display: string;
  thumbnail_url: string;
  price: number;
  lesson_count: number;
  lessons: Lesson[];
  program: number;
}

export default function SubcourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subcourseId = params.id as string;
  
  const [subcourse, setSubcourse] = useState<Subcourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra authentication
  useEffect(() => {
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    const fetchSubcourse = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const data = await getSubcourseDetail(subcourseId);
        setSubcourse(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching subcourse:', err);
        setError('Không thể tải thông tin khóa học. Bạn có thể không có quyền truy cập.');
      } finally {
        setLoading(false);
      }
    };

    if (subcourseId && isAuthenticated) {
      fetchSubcourse();
    }
  }, [subcourseId, isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Đang redirect
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !subcourse) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể truy cập</h3>
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy khóa học'}</p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              {subcourse.coding_language_display}
            </span>
            {subcourse.price > 0 && (
              <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                {subcourse.price.toLocaleString('vi-VN')} VNĐ
              </span>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-2">{subcourse.title}</h1>
          
          {subcourse.subtitle && (
            <p className="text-xl text-blue-100 mb-4">{subcourse.subtitle}</p>
          )}
          
          {subcourse.description && (
            <p className="text-blue-50 mb-6">{subcourse.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{subcourse.lesson_count} bài học</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
