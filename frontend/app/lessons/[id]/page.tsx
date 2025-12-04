/**
 * Lesson Detail Page
 * Trang chi tiết bài học với layout 2 cột
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Download, 
  CheckCircle2,
  BookOpen,
  Wrench,
  Target,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { getLessonDetail, markLessonComplete } from '@/services/robotics';
import CodeViewer from '@/components/CodeViewer';
import Cookies from 'js-cookie';

interface Lesson {
  id: number;
  title: string;
  description: string;
  video_url: string;
  project_file_url: string;
  code_snippet: string;
  estimated_duration: number;
  subcourse: {
    id: number;
    title: string;
    program: {
      id: number;
      title: string;
    };
  };
}

type TabType = 'overview' | 'assembly' | 'challenge';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
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
    const fetchLesson = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const data = await getLessonDetail(Number(lessonId));
        setLesson(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching lesson:', err);
        if (err.response?.status === 403) {
          setError('Bạn không có quyền truy cập bài học này.');
        } else {
          setError('Không thể tải thông tin bài học. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && isAuthenticated) {
      fetchLesson();
    }
  }, [lessonId, isAuthenticated]);

  const handleMarkComplete = async () => {
    if (!lesson || isMarking) return;

    try {
      setIsMarking(true);
      await markLessonComplete(lesson.id);
      setIsCompleted(true);
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    } finally {
      setIsMarking(false);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-xl mb-6"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy bài học
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Tổng quan', icon: BookOpen },
    { id: 'assembly' as TabType, label: 'Lắp ráp', icon: Wrench },
    { id: 'challenge' as TabType, label: 'Thử thách', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Link>
          <div className="mt-2 text-sm text-gray-500">
            {lesson.subcourse.program.title} / {lesson.subcourse.title}
          </div>
        </div>

        {/* Main Layout - 2 Columns */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content (65%) */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-black rounded-xl overflow-hidden mb-6 shadow-lg"
            >
              {lesson.video_url ? (
                <div className="relative" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={lesson.video_url}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                  <div className="text-center text-gray-400">
                    <Play className="w-16 h-16 mx-auto mb-4" />
                    <p>Video chưa có sẵn</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Lesson Title & Meta */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {lesson.title}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.estimated_duration} phút</span>
                </div>
                {isCompleted && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã hoàn thành</span>
                  </div>
                )}
              </div>

              {/* Complete Button */}
              {!isCompleted && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isMarking}
                  className="mb-6 inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isMarking ? 'Đang xử lý...' : 'Hoàn thành bài học'}</span>
                </button>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors relative ${
                          activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Tổng quan bài học
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {lesson.description || 'Nội dung tổng quan bài học.'}
                    </p>
                  </div>
                )}

                {activeTab === 'assembly' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Hướng dẫn lắp ráp
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Làm theo các bước trong video để lắp ráp mô hình LEGO Spike.
                      Đảm bảo các chi tiết được kết nối chắc chắn.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Mẹo:</strong> Kiểm tra kỹ các cổng kết nối motor và sensor
                        trước khi bắt đầu lập trình.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'challenge' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Thử thách
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Sau khi hoàn thành bài học cơ bản, hãy thử những thử thách sau:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          1
                        </span>
                        <span className="text-gray-700">
                          Thay đổi tốc độ di chuyển của robot
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          2
                        </span>
                        <span className="text-gray-700">
                          Thêm âm thanh khi robot hoạt động
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          3
                        </span>
                        <span className="text-gray-700">
                          Lập trình robot tránh chướng ngại vật
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Tools (35%) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-8 space-y-6"
            >
              {/* Code Snippet */}
              {lesson.code_snippet && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span>Code mẫu</span>
                  </h3>
                  <CodeViewer code={lesson.code_snippet} language="python" />
                </div>
              )}

              {/* Download Project File */}
              {lesson.project_file_url && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tài liệu bài học
                  </h3>
                  <a
                    href={lesson.project_file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span>Tải file bài học</span>
                  </a>
                  <p className="text-sm text-gray-500 mt-3">
                    File project có thể mở bằng LEGO Education SPIKE App
                  </p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  💡 Gợi ý học tập
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>Xem video nhiều lần để nắm rõ nội dung</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>Thử nghiệm code trên robot thực tế</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>Hoàn thành thử thách để nâng cao kỹ năng</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
