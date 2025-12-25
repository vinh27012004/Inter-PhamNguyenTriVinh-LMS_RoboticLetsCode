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
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Import services directly
import { getLessonFullDetail } from '@/services/robotics';

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
  status: string;
  sort_order: number;
  subcourse: any;
  objectives: any[];
  models: any[];
  assembly_guides: any[];
  preparation: any;
  content_blocks: any[];
  attachments: any[];
  challenges: any[];
  quizzes: any[];
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
      icon: Target,
      label: 'Mục tiêu bài học',
      component: <ObjectivesSection objectives={lesson.objectives || []} />,
    },
    {
      key: 'models',
      label: 'Mô hình',
      icon: Box,
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
      component: <AssemblyGuideSection assemblyGuides={lesson.assembly_guides || []} />,
    },
    {
      key: 'contents',
      label: 'Nội dung bài học',
      icon: BookOpen,
      component: <LessonContentsSection contentBlocks={lesson.content_blocks || []} />,
    },
    {
      key: 'attachments',
      label: 'Tài liệu',
      icon: FileText,
      component: <AttachmentsSection attachments={lesson.attachments || []} />,
    },
    {
      key: 'challenges',
      label: 'Thử thách',
      icon: Trophy,
      component: <ChallengesSection challenges={lesson.challenges || []} />,
    },
    {
      key: 'quizzes',
      label: 'Quiz',
      icon: Brain,
      component: <QuizzesSection quizzes={lesson.quizzes || []} />,
    },
  ];

  const activeContent = sections.find((s) => s.key === activeSection);

  // Không có handler đánh dấu hoàn thành trên trang học sinh

  return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          } w-64 max-h-[calc(100vh-64px)]`}
          style={{ top: '64px', bottom: '0' }}
        >
          {/* Header Section in Sidebar */}
          <div className="border-b border-gray-200 p-4 space-y-3">
            {/* Back button + Sidebar toggle */}
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
                className="group flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-brandPurple-600 transition-all hover:text-brandPurple-700 hover:bg-brandPurple-50"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                <span className={isSidebarCollapsed ? 'hidden' : 'text-sm'}>Quay lại</span>
              </button>
            </div>

            {/* Lesson title */}
            {!isSidebarCollapsed && (
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-gray-900 line-clamp-2">
                  {lesson.title}
                </h2>
              </div>
            )}
          </div>

          {/* Collapse/Expand Button (Desktop only) */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-4 top-32 z-40 items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-all"
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
                  {!isSidebarCollapsed && <span className="flex-1 font-medium text-sm">{section.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            style={{ top: '64px' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {activeContent?.component}
          </div>
        </main>
      </div>
    </div>
  );
}
