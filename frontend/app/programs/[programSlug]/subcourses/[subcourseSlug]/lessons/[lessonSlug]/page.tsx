/**
 * Lesson Detail Page
 * Hiển thị nội dung đầy đủ bài học với sidebar navigation và responsive design
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Target, 
  Box, 
  Package, 
  Wrench, 
  BookOpen, 
  FileText, 
  Trophy, 
  Brain,
  CheckCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Import lesson section components
import ObjectivesSection from '@/components/lesson/ObjectivesSection';
import ModelsSection from '@/components/lesson/ModelsSection';
import PreparationSection from '@/components/lesson/PreparationSection';
import AssemblyGuideSection from '@/components/lesson/AssemblyGuideSection';
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
  assembly_guides: any[];
  assembly_guide_count: number;
  preparation: any;
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
  const [activeSection, setActiveSection] = useState<string>('objectives');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brandPurple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải bài học...</p>
      </div>
    </div>
  );
  }

  if (error || !lesson) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
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

  // Define sections với icons
  const sections = [
    {
      key: 'objectives',
      label: 'Mục tiêu',
      icon: Target,
      count: lesson.objectives_count,
      component: <ObjectivesSection objectives={lesson.objectives || []} />,
    },
    {
      key: 'models',
      label: 'Mô hình',
      icon: Box,
      count: lesson.models_count,
      component: <ModelsSection models={lesson.models || []} />,
    },
    {
      key: 'preparation',
      label: 'Chuẩn bị',
      icon: Package,
      component: <PreparationSection preparation={lesson.preparation} />,
    },
    {
      key: 'assembly',
      label: 'Hướng dẫn lắp ráp',
      icon: Wrench,
      count: lesson.assembly_guide_count,
      component: <AssemblyGuideSection assemblyGuides={lesson.assembly_guides || []} />,
    },
    {
      key: 'contents',
      label: 'Nội dung bài học',
      icon: BookOpen,
      count: lesson.content_blocks_count,
      component: <LessonContentsSection contentBlocks={lesson.content_blocks || []} />,
    },
    {
      key: 'attachments',
      label: 'Tài liệu',
      icon: FileText,
      count: lesson.attachments_count,
      component: <AttachmentsSection attachments={lesson.attachments || []} />,
    },
    {
      key: 'challenges',
      label: 'Thử thách',
      icon: Trophy,
      count: lesson.challenges_count,
      component: <ChallengesSection challenges={lesson.challenges || []} />,
    },
    {
      key: 'quizzes',
      label: 'Quiz',
      icon: Brain,
      count: lesson.quizzes_count,
      component: <QuizzesSection quizzes={lesson.quizzes || []} />,
    },
  ];

  const activeContent = sections.find((s) => s.key === activeSection);

  const handleMarkComplete = async () => {
    try {
      const { markLessonComplete } = await import('@/services/robotics');
      await markLessonComplete(lesson.id);
      setIsCompleted(true);
      alert('Đã đánh dấu hoàn thành!');
    } catch (err) {
      console.error('Error marking complete:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col pt-16">
      {/* Top Header - Compact */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Back button + Sidebar toggle (mobile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => router.push(`/programs/${programSlug}/subcourses/${subcourseSlug}`)}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg text-brandPurple-600 transition-all hover:text-brandPurple-700 hover:bg-brandPurple-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại khóa học</span>
            </button>
          </div>

          {/* Center: Lesson title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
              {lesson.title}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Bài {lesson.sort_order} - {lesson.subcourse?.title}
            </p>
          </div>

          {/* Right: Mark complete button */}
          <button
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isCompleted
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{isCompleted ? 'Đã hoàn thành' : 'Hoàn thành'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          } w-64`}
          style={{ top: '124px' }}
        >
          {/* Collapse/Expand Button (Desktop only) */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-0 bottom-4 z-40 items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 text-gray-600"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => {
                    setActiveSection(section.key);
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg text-left transition-all ${
                    isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-brandPurple-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isSidebarCollapsed ? section.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 font-medium text-sm">{section.label}</span>
                      {typeof section.count === 'number' && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {section.count}
                        </span>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && typeof section.count === 'number' && section.count > 0 && (
                    <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                      isActive ? 'bg-white' : 'bg-brandPurple-600'
                    }`} />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            style={{ top: '124px' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {activeContent && (
                  <>
                    <activeContent.icon className="w-6 h-6 text-brandPurple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">{activeContent.label}</h2>
                    {typeof activeContent.count === 'number' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-brandPurple-100 text-brandPurple-700">
                        {activeContent.count} mục
                      </span>
                    )}
                  </>
                )}
              </div>
              {lesson.subtitle && activeSection === 'objectives' && (
                <p className="text-gray-600">{lesson.subtitle}</p>
              )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeContent?.component}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
