/**
 * Course Detail Page
 * Chi tiết chương trình học theo slug
 * - Chưa login: Hiển thị trang giới thiệu public
 * - Đã login: Hiển thị subcourses được phân quyền
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProgramDetail } from '@/services/robotics';
import Cookies from 'js-cookie';

interface Program {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  kit_type: string;
  kit_type_display: string;
  subcourses: any[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authorizedSubcourses, setAuthorizedSubcourses] = useState<number[]>([]);

  // Kiểm tra authentication
  useEffect(() => {
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const data = await getProgramDetail(slug);
        setProgram(data);
        
        // Nếu đã login, fetch subcourses được phân quyền
        if (isAuthenticated) {
          await fetchAuthorizedSubcourses(data.id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Không thể tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProgram();
    }
  }, [slug, isAuthenticated]);

  const fetchAuthorizedSubcourses = async (programId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/auth/assignments/my_subcourses/?program_id=${programId}`,
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('access_token') || localStorage.getItem('access_token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAuthorizedSubcourses(data.subcourse_ids || []);
      }
    } catch (err) {
      console.error('Error fetching authorized subcourses:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Không tìm thấy khóa học'}</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Quay về trang chủ
        </a>
      </div>
    );
  }

  // Filter subcourses theo quyền nếu đã login
  const displaySubcourses = isAuthenticated && authorizedSubcourses.length > 0
    ? program.subcourses.filter((sc: any) => authorizedSubcourses.includes(sc.id))
    : program.subcourses;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-brandPurple-600 hover:text-brandPurple-700 mb-8 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Program Introduction */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Program Header */}
              <div className="bg-white border-2 border-brandPurple-200 rounded-2xl p-6 shadow-lg">
                {/* Program Title & Badge */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {program.title}
                    </h1>
                  </div>
                  
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-brandPurple-100 to-brandYellow-100 text-brandPurple-700 rounded-full text-sm font-semibold">
                    {program.kit_type_display}
                  </span>
                </div>

                {/* Thumbnail */}
                {program.thumbnail_url && (
                  <img 
                    src={program.thumbnail_url} 
                    alt={program.title}
                    className="w-full rounded-xl shadow-md mb-6"
                  />
                )}

                {/* Description */}
                {program.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Về chương trình</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {program.description}
                    </p>
                  </div>
                )}

                {/* Statistics */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-brandPurple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{program.subcourses?.length || 0} khóa học</span>
                    </div>
                  </div>
                </div>

                {/* Login CTA */}
                {!isAuthenticated && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                      Đăng nhập để xem các khóa học được gán cho bạn
                    </p>
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full px-4 py-3 bg-brandPurple-600 text-white rounded-lg hover:bg-brandPurple-700 transition-colors font-semibold text-sm"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Courses List */}
          <div className="lg:col-span-2">
            {/* Courses Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isAuthenticated ? 'Các khóa học của bạn' : 'Nội dung chương trình'}
              </h2>
              {isAuthenticated && authorizedSubcourses.length > 0 && (
                <p className="text-gray-600">
                  Bạn có quyền truy cập <span className="font-semibold text-brandPurple-600">{authorizedSubcourses.length}</span> khóa học
                </p>
              )}
            </div>

            {/* Courses Content */}
            {program.subcourses && program.subcourses.length > 0 ? (
              <>
                {isAuthenticated && authorizedSubcourses.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Bạn chưa có quyền truy cập
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Vui lòng liên hệ giáo vụ để được cấp quyền truy cập các khóa học trong chương trình này.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displaySubcourses.map((subcourse: any) => (
                      <div 
                        key={subcourse.id} 
                        className={`border-2 rounded-xl p-6 transition-all ${
                          isAuthenticated && authorizedSubcourses.includes(subcourse.id)
                            ? 'bg-white border-brandPurple-200 hover:border-brandPurple-500 hover:shadow-lg cursor-pointer'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => isAuthenticated && authorizedSubcourses.includes(subcourse.id) && router.push(`/subcourses/${subcourse.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {subcourse.title}
                            </h3>
                            {subcourse.subtitle && (
                              <p className="text-brandPurple-600 text-sm font-medium mt-1">
                                {subcourse.subtitle}
                              </p>
                            )}
                          </div>
                          
                          {!isAuthenticated && (
                            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                          
                          {isAuthenticated && !authorizedSubcourses.includes(subcourse.id) && (
                            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
                        
                        {isAuthenticated ? (
                          <>
                            {subcourse.description && (
                              <p className="text-gray-600 text-sm mb-4">{subcourse.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {subcourse.lesson_count || 0} bài học
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                {subcourse.coding_language_display}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Đăng nhập để xem nội dung chi tiết
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Chưa có khóa học nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
