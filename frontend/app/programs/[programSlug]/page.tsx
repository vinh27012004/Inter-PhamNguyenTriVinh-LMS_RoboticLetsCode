/**
 * Program Detail Page với 2 cột
 * Left: Sticky sidebar với thông tin program
 * Right: Danh sách các subcourses (khóa học con)
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProgramDetail, getMySubcourses, getSubcourses } from '@/services/robotics';
import { ArrowLeft, BookOpen, Clock, Users, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import SubcourseCard from '@/components/SubcourseCard';

interface Program {
  id: number;
  slug: string;
  title: string;
  thumbnail_url?: string;
  description: string;
  kit_type: 'SPIKE_ESSENTIAL' | 'SPIKE_PRIME';
  subcourse_count: number;
  total_lessons: number;
}

interface Subcourse {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  coding_language: 'WORD_BLOCKS' | 'PYTHON';
  thumbnail_url?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  level_display: string;
  level_number: number;
  session_count: number;
  lesson_count: number;
  has_access?: boolean;
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params.programSlug as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [subcourses, setSubcourses] = useState<Subcourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thông tin program
        const programData = await getProgramDetail(programSlug);
        console.log('Program data:', programData);
        console.log('Thumbnail URL:', programData.thumbnail_url);
        setProgram(programData);

        // Kiểm tra authentication
        const token = localStorage.getItem('access_token');
        const userRole = localStorage.getItem('user_role');

        if (token) {
          setIsAuthenticated(true);

          // Admin thấy tất cả subcourses
          if (userRole === 'ADMIN') {
            setIsAdmin(true);
            const subcoursesData = await getSubcourses({ program: programData.id });
            const allSubcourses = (subcoursesData.results || []).map((sc: Subcourse) => ({
              ...sc,
              has_access: true
            }));
            setSubcourses(allSubcourses);
          } else {
            // User thường - kiểm tra quyền
            try {
              const mySubcoursesData = await getMySubcourses({ program_id: programData.id });
              const subcourseIds = mySubcoursesData.subcourse_ids || [];
              
              const subcoursesData = await getSubcourses({ program: programData.id });
              
              const allSubcourses = (subcoursesData.results || []).map((sc: Subcourse) => ({
                ...sc,
                has_access: subcourseIds.includes(sc.id)
              }));
              setSubcourses(allSubcourses);
            } catch (err) {
              console.error('Error fetching my subcourses:', err);
              const subcoursesData = await getSubcourses({ program: programData.id });
              setSubcourses(subcoursesData.results || []);
            }
          }
        } else {
          // Không authenticated - hiển thị tất cả với has_access = false
          const subcoursesData = await getSubcourses({ program: programData.id });
          const allSubcourses = (subcoursesData.results || []).map((sc: Subcourse) => ({
            ...sc,
            has_access: false
          }));
          setSubcourses(allSubcourses);
        }
      } catch (err: any) {
        console.error('Error fetching program:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy chương trình này');
        } else {
          setError('Đã có lỗi xảy ra khi tải dữ liệu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programSlug]);

  const handleSubcourseClick = (subcourseSlug: string, hasAccess: boolean) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!hasAccess && !isAdmin) {
      return;
    }
    router.push(`/programs/${programSlug}/subcourses/${subcourseSlug}`);
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

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy dữ liệu'}</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-brandPurple-600 text-white rounded-lg hover:bg-brandPurple-700 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const kitConfig = {
    SPIKE_ESSENTIAL: {
      label: 'SPIKE Essential',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    SPIKE_PRIME: {
      label: 'SPIKE Prime',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
  };

  const config = kitConfig[program.kit_type];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-brandPurple-600 hover:text-brandPurple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN - Sticky Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              {/* Kit Badge */}
              <div className="p-4 border-b border-gray-100">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
                  {config.label}
                </span>
              </div>

              {/* Thumbnail - Cải thiện hiển thị */}
              {program.thumbnail_url ? (
                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={program.thumbnail_url}
                    alt={program.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', program.thumbnail_url);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center"><svg class="w-20 h-20 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>';
                    }}
                  />
                </div>
              ) : (
                // Placeholder nếu không có ảnh
                <div className="relative w-full aspect-video bg-gradient-to-br from-brandPurple-100 to-brandYellow-100 flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-brandPurple-300" />
                </div>
              )}

              {/* Program Info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{program.title}</h1>
                
                {/* Badge ADMIN */}
                {isAdmin && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-800">🔑 Chế độ quản trị viên</p>
                    <p className="text-xs text-red-700 mt-1">Bạn có thể xem tất cả khóa học</p>
                  </div>
                )}

                {/* Description - Rút gọn */}
                <div className="mb-6">
                  <p className={`text-gray-600 leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
                    {program.description}
                  </p>
                  {program.description.length > 100 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-2 text-sm text-brandPurple-600 hover:text-brandPurple-700 font-medium flex items-center gap-1"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Rút gọn <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Mở rộng <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Statistics - Cải thiện layout */}
                <div className="bg-brandPurple-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Thông tin</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <BookOpen className="w-5 h-5 mr-3 text-brandPurple-600" />
                        <span className="text-sm">Số khóa học</span>
                      </div>
                      <span className="font-bold text-brandPurple-600">{program.subcourse_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-5 h-5 mr-3 text-brandPurple-600" />
                        <span className="text-sm">Tổng bài học</span>
                      </div>
                      <span className="font-bold text-brandPurple-600">{program.total_lessons}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                {!isAuthenticated && (
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full py-3 bg-gradient-to-r from-brandPurple-600 to-brandPurple-700 text-white rounded-lg font-semibold hover:from-brandPurple-700 hover:to-brandPurple-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Đăng nhập để học
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mascot Decoration */}
          <div className="hidden lg:flex absolute bottom-0 left-0 opacity-20">
            <Image
              src="/images/mascot/leco game 4.png"
              alt="Mascot"
              width={200}
              height={200}
              className="animate-float"
            />
          </div>

          {/* RIGHT COLUMN - Courses List */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Khóa học</h2>
            </div>

            {/* Courses Grid */}
            {subcourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcourses.map((subcourse) => (
                  <SubcourseCard
                    key={subcourse.id}
                    id={subcourse.id}
                    slug={subcourse.slug}
                    programSlug={programSlug}
                    title={subcourse.title}
                    subtitle={subcourse.subtitle}
                    description={subcourse.description}
                    thumbnail_url={subcourse.thumbnail_url}
                    coding_language={subcourse.coding_language as 'ICON_BLOCKS' | 'WORD_BLOCKS' | 'PYTHON'}
                    level={subcourse.level}
                    level_display={subcourse.level_display}
                    level_number={subcourse.level_number}
                    session_count={subcourse.session_count}
                    lesson_count={subcourse.lesson_count}
                    has_access={subcourse.has_access || isAdmin}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có khóa học</h3>
                <p className="text-gray-600">Chương trình này chưa có khóa học nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
