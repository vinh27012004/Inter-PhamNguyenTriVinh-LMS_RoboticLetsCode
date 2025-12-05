/**
 * Lesson Detail Page
 * Hiển thị nội dung bài học với video và code
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessons } from '@/services/robotics';
import { ArrowLeft, Video, Code2, FileText } from 'lucide-react';
import CodeViewer from '@/components/CodeViewer';

interface Lesson {
  id: number;
  slug: string;
  title: string;
  lesson_order: number;
  content: string;
  video_url?: string;
  code_content?: string;
  project_file?: string;
  subcourse: {
    id: number;
    slug: string;
    title: string;
    program?: {
      id: number;
      slug: string;
      title: string;
    };
  };
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
  const [activeTab, setActiveTab] = useState<'video' | 'code' | 'content'>('video');

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
        const { getLessons } = await import('@/services/robotics');
        const lessonsData = await getLessons({ slug: lessonSlug });
        
        if (lessonsData.results && lessonsData.results.length > 0) {
          setLesson(lessonsData.results[0]);
        } else {
          setError('Không tìm thấy bài học này');
        }
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại khóa học
          </button>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Bài {lesson.lesson_order}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-md">
          <div className="flex border-b border-gray-200">
            {lesson.video_url && (
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  activeTab === 'video'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Video className="w-5 h-5 mr-2" />
                Video hướng dẫn
              </button>
            )}
            {lesson.code_content && (
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  activeTab === 'code'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code2 className="w-5 h-5 mr-2" />
                Code mẫu
              </button>
            )}
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeTab === 'content'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Nội dung
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'video' && lesson.video_url && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  src={lesson.video_url}
                >
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            )}

            {activeTab === 'code' && lesson.code_content && (
              <div>
                <CodeViewer code={lesson.code_content} language="python" />
                {lesson.project_file && (
                  <div className="mt-6">
                    <a
                      href={lesson.project_file}
                      download
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Tải file dự án
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="prose max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Project File Download (if exists) */}
        {lesson.project_file && activeTab !== 'code' && (
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File dự án</h3>
            <a
              href={lesson.project_file}
              download
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Tải file dự án
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
