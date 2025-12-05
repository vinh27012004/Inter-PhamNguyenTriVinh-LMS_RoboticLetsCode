/**
 * Lesson Detail Page
 * Hiển thị nội dung bài học với video và code
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessons } from '@/services/robotics';
import { ArrowLeft } from 'lucide-react';
  import Image from 'next/image';

interface Lesson {
  id: number;
  slug: string;
  title: string;
  objective: string;
  knowledge_skills: string;
  content_text: string;
  status: string;
  status_display: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params.programSlug as string;
  const subcourseSlug = params.subcourseSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Kiểm tra authentication
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Lấy chi tiết lesson bằng slug
        const { getLessonDetail } = await import('@/services/robotics');
        const lessonData = await getLessonDetail(lessonSlug);
        setLesson(lessonData);
      } catch (err: any) {
        console.error('Error fetching lesson:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy bài học này');
        } else if (err.response?.status === 403) {
          setError('Bạn không có quyền truy cập bài học này');
        } else {
          setError('Đã có lỗi xảy ra khi tải dữ liệu');
        }
      } finally {
        setLoading(false);
      }
    };

    if (lessonSlug) {
      fetchData();
    }
  }, [lessonSlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy dữ liệu'}</h2>
          <button
            onClick={() => router.push(`/programs/${programSlug}/subcourses/${subcourseSlug}`)}
            className="px-6 py-3 bg-brandPurple-600 text-white rounded-lg transition-all hover:bg-brandPurple-700 hover:shadow-md hover:-translate-y-0.5"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push(`/programs/${programSlug}/subcourses/${subcourseSlug}`)}
            className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg text-brandPurple-600 transition-all hover:text-brandPurple-700 hover:bg-brandPurple-50 hover:-translate-x-0.5 mb-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại khóa học
          </button>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brandPurple-100 text-brandPurple-800">
              Bài {lesson.sort_order}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
          {/* Lesson Objective */}
          {lesson.objective && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">🎯 Mục tiêu bài học</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{lesson.objective}</p>
                </div>
              </div>
            </div>
          )}

          {/* Knowledge & Skills */}
          {lesson.knowledge_skills && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">💡 Kiến thức & Kỹ năng</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{lesson.knowledge_skills}</div>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Content */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-4">📚 Nội dung bài học</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {lesson.content_text || 'Chưa cập nhật nội dung'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
