/**
 * Subcourse Detail Page
 * Hiển thị chi tiết khóa học con với danh sách lessons
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSubcourseDetail, getLessons } from '@/services/robotics';
import { ArrowLeft, BookOpen, Code, DollarSign, Clock, Target, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface Lesson {
  id: number;
  slug: string;
  title: string;
  objective: string;
  content_text: string;
  sort_order: number;
  status: string;
  status_display: string;
  created_at: string;
  updated_at: string;
}

interface Subcourse {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  objective?: string;
  thumbnail_url?: string;
  coding_language: 'WORD_BLOCKS' | 'PYTHON';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  level_display: string;
  level_number: number;
  session_count: number;
  lesson_count: number;
  lessons?: Lesson[];
  program?: {
    id: number;
    slug: string;
    title: string;
  };
}

export default function SubcourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params.programSlug as string;
  const subcourseSlug = params.subcourseSlug as string;

  const [subcourse, setSubcourse] = useState<Subcourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Kiểm tra authentication
        const token = localStorage.getItem('access_token');
        console.log('Token:', token ? 'EXISTS' : 'NOT FOUND');
        if (!token) {
          router.push('/login');
          return;
        }

        // Lấy chi tiết subcourse bằng slug
        const { getSubcourses } = await import('@/services/robotics');
        console.log('Fetching subcourse with slug:', subcourseSlug);
        const subcoursesData = await getSubcourses({ slug: subcourseSlug });
        console.log('Subcourses data:', subcoursesData);
        
        if (subcoursesData.results && subcoursesData.results.length > 0) {
          const selectedSubcourse = subcoursesData.results[0];
          console.log('Selected subcourse:', selectedSubcourse);
          
          // Fetch ALL lessons for this subcourse with large page_size
          const lessonsData = await getLessons({ 
            subcourse: selectedSubcourse.id,
            page_size: 100  // Load up to 100 lessons
          });
          console.log('Lessons data:', lessonsData);
          
          // Add lessons to subcourse object
          selectedSubcourse.lessons = lessonsData.results || [];
          
          setSubcourse(selectedSubcourse);
        } else {
          setError('Không tìm thấy khóa học này');
        }
      } catch (err: any) {
        console.error('Error fetching subcourse:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy khóa học này');
        } else if (err.response?.status === 403) {
          setError('Bạn không có quyền truy cập khóa học này');
        } else {
          setError('Đã có lỗi xảy ra khi tải dữ liệu');
        }
      } finally {
        setLoading(false);
      }
    };

    if (subcourseSlug) {
      fetchData();
    }
  }, [subcourseSlug, router]);

  const handleLessonClick = (lessonSlug: string) => {
    router.push(`/programs/${programSlug}/subcourses/${subcourseSlug}/lessons/${lessonSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brandPurple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !subcourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy dữ liệu'}</h2>
          <button
            onClick={() => router.push(`/programs/${programSlug}`)}
            className="px-6 py-3 bg-brandPurple-600 text-white rounded-lg hover:bg-brandPurple-700 transition-colors"
          >
            Quay lại chương trình
          </button>
        </div>
      </div>
    );
  }

  const languageConfig: Record<string, any> = {
    WORD_BLOCKS: {
      label: 'Word Blocks',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: Code,
    },
    PYTHON: {
      label: 'Python',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: Code,
    },
  };

  const getLanguageConfig = (lang: string) => {
    return languageConfig[lang] || {
      label: 'Unknown',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: Code,
    };
  };

  const config = getLanguageConfig(subcourse.coding_language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push(`/programs/${programSlug}`)}
            className="flex items-center text-brandPurple-600 hover:text-brandPurple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại chương trình
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN - Course Info */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              {/* Thumbnail */}
              {subcourse.thumbnail_url ? (
                <div className="relative w-full aspect-video bg-gray-100">
                  <Image
                    src={subcourse.thumbnail_url}
                    alt={subcourse.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-gradient-to-br from-brandPurple-100 to-brandYellow-100 flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-brandPurple-300" />
                </div>
              )}

              <div className="p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    subcourse.level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    subcourse.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {subcourse.level_display}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Level {subcourse.level_number}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{subcourse.title}</h1>
                {subcourse.subtitle && (
                  <p className="text-sm text-gray-600 mb-4">{subcourse.subtitle}</p>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed text-justify">{subcourse.description || 'Chưa cập nhật'}</p>
                </div>

                {/* Objectives */}
                {subcourse.objective && (
                  <div className="mb-6 bg-gradient-to-br from-brandPurple-50 to-brandYellow-50 rounded-xl p-5 border border-brandPurple-100">
                    <div className="flex items-center mb-4">
                      <Target className="w-5 h-5 text-brandPurple-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mục tiêu học tập</h3>
                    </div>
                    <div className="space-y-2">
                      {subcourse.objective.split('\n').filter(line => line.trim()).map((objective, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brandPurple-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 text-sm leading-relaxed">{objective.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-brandPurple-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <BookOpen className="w-5 h-5 mr-3 text-brandPurple-600" />
                      <span className="text-sm">Số bài học</span>
                    </div>
                    <span className="font-bold text-brandPurple-600">{subcourse.lesson_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-3 text-brandPurple-600" />
                      <span className="text-sm">Số buổi học</span>
                    </div>
                    <span className="font-bold text-brandPurple-600">{subcourse.session_count} buổi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mascot Decoration */}
            <div className="hidden lg:flex absolute bottom-0 left-0 opacity-20">
              <Image
                src="/images/mascot/leco game 6.png"
                alt="Mascot"
                width={180}
                height={180}
                className="animate-float"
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Lessons List */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Danh sách bài học</h2>
            </div>

            {subcourse.lessons && subcourse.lessons.length > 0 ? (
              <div className="space-y-4">
                {subcourse.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.slug)}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Lesson number badge */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brandPurple-100 text-brandPurple-600 flex items-center justify-center font-bold text-lg">
                            {lesson.sort_order}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                              {lesson.title}
                            </h3>
                            
                            {/* Metadata */}
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              {lesson.objective && (
                                <div className="flex items-center text-gray-600 line-clamp-1">
                                  <span>{lesson.objective}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrow icon */}
                        <ArrowLeft className="w-6 h-6 text-gray-400 transform rotate-180 flex-shrink-0 ml-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có bài học</h3>
                <p className="text-gray-600">Khóa học này chưa có bài học nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
