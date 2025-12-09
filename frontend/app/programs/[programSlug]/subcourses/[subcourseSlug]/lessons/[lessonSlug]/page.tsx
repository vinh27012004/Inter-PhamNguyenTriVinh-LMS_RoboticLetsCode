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
import LessonInfoCard from '@/components/LessonInfoCard';

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brandPurple-600 mx-auto"></div>
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
            className="px-6 py-3 bg-brandPurple-600 text-white rounded-lg transition-all hover:bg-brandPurple-600 hover:shadow-md hover:-translate-y-0.5"
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
            className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg text-brandPurple-600 transition-all hover:text-brandPurple-600 hover:bg-brandPurple-50 hover:-translate-x-0.5 mb-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại khóa học
          </button>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brandPurple-50 text-brandPurple-600">
              Bài {lesson.sort_order}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LessonInfoCard
          title="🎯 Mục tiêu bài học"
          content={lesson.objective}
          bgGradient="from-brandPurple-50 to-brandYellow-50"
          borderColor="border-brandPurple-200"
          iconBgColor="bg-brandPurple-100"
          defaultExpanded={false}
        />
        <LessonInfoCard
          title="💡 Kiến thức & Kỹ năng"
          content={lesson.knowledge_skills}
          bgGradient="from-brandYellow-50 to-brandPurple-50"
          borderColor="border-brandYellow-200"
          iconBgColor="bg-brandYellow-100"
          defaultExpanded={false}
        />
        <LessonInfoCard
          title="📚 Nội dung bài học"
          content={lesson.content_text}
          bgGradient="from-brandPurple-50 to-brandYellow-50"
          borderColor="border-brandPurple-200"
          iconBgColor="bg-brandPurple-100"
          defaultExpanded={false}
        />
      </div>
    </div>
  );
}
