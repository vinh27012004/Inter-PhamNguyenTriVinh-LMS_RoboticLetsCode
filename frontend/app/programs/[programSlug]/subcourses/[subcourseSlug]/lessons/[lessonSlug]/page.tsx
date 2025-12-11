/**
 * Lesson Detail Page
 * Hiển thị nội dung đầy đủ bài học với tất cả sections
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';

// Import lesson section components
import ObjectivesSection from '@/components/lesson/ObjectivesSection';
import ModelsSection from '@/components/lesson/ModelsSection';
import PreparationSection from '@/components/lesson/PreparationSection';
import BuildBlocksSection from '@/components/lesson/BuildBlocksSection';
import LessonContentsSection from '@/components/lesson/LessonContentsSection';
import AttachmentsSection from '@/components/lesson/AttachmentsSection';
import ChallengesSection from '@/components/lesson/ChallengesSection';
import QuizzesSection from '@/components/lesson/QuizzesSection';

interface LessonData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  objective: string;
  knowledge_skills: string;
  content_text: string;
  status: string;
  sort_order: number;
  subcourse: any;
  objectives: any[];
  objectives_count: number;
  models: any[];
  models_count: number;
  preparations: any;
  build_blocks: any[];
  build_blocks_count: number;
  content_blocks: any[];
  content_blocks_count: number;
  attachments: any[];
  attachments_count: number;
  challenges: any[];
  challenges_count: number;
  quizzes: any[];
  quizzes_count: number;
  created_at: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params.programSlug as string;
  const subcourseSlug = params.subcourseSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
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

        // Lấy chi tiết lesson với FULL content
        const { getLessonFullDetail } = await import('@/services/robotics');
        const lessonData = await getLessonFullDetail(lessonSlug);
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push(`/programs/${programSlug}/subcourses/${subcourseSlug}`)}
            className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg text-brandPurple-600 transition-all hover:text-brandPurple-700 hover:bg-brandPurple-50 hover:-translate-x-0.5 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại khóa học
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brandPurple-100 text-brandPurple-700">
                  Bài {lesson.sort_order}
                </span>
                <span className="text-sm text-gray-500">{lesson.subcourse?.title}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              {lesson.subtitle && (
                <p className="text-lg text-gray-600">{lesson.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Objectives Section */}
        <ObjectivesSection objectives={lesson.objectives || []} />

        {/* Models Section */}
        <ModelsSection models={lesson.models || []} />

        {/* Preparation Section */}
        <PreparationSection preparation={lesson.preparations} />

        {/* Build Blocks Section */}
        <BuildBlocksSection buildBlocks={lesson.build_blocks || []} />

        {/* Lesson Contents Section */}
        <LessonContentsSection contentBlocks={lesson.content_blocks || []} />

        {/* Attachments Section */}
        <AttachmentsSection attachments={lesson.attachments || []} />

        {/* Challenges Section */}
        <ChallengesSection challenges={lesson.challenges || []} />

        {/* Quizzes Section */}
        <QuizzesSection quizzes={lesson.quizzes || []} />

        {/* Footer - Mark Complete */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Hoàn thành bài học
              </h3>
              <p className="text-sm text-gray-600">
                Đánh dấu đã hoàn thành để theo dõi tiến độ
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const { markLessonComplete } = await import('@/services/robotics');
                  await markLessonComplete(lesson.id);
                  alert('Đã đánh dấu hoàn thành!');
                } catch (err) {
                  console.error('Error marking complete:', err);
                  alert('Có lỗi xảy ra. Vui lòng thử lại.');
                }
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              ✓ Đánh dấu hoàn thành
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
