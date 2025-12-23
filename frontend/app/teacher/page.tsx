'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
  code: string;
  subcourse: number;
  subcourse_title: string;
  subcourse_slug: string;
  status: string;
  status_display: string;
  start_date: string;
  end_date: string | null;
  max_students: number;
  current_enrollment_count: number;
  is_full: boolean;
}

interface Stats {
  total_classes: number;
  active_classes: number;
  total_students: number;
  avg_completion: number;
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_classes: 0,
    active_classes: 0,
    total_students: 0,
    avg_completion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/classes/');
      const classesData = response.data.results || response.data;
      setClasses(classesData);

      // Tính stats
      const activeCount = classesData.filter((c: Class) => c.status === 'ACTIVE').length;
      const totalStudents = classesData.reduce(
        (sum: number, c: Class) => sum + c.current_enrollment_count,
        0
      );

      setStats({
        total_classes: classesData.length,
        active_classes: activeCount,
        total_students: totalStudents,
        avg_completion: 0, // TODO: fetch from progress endpoint
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải dữ liệu');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'UPCOMING':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Bảng điều khiển giáo viên</h1>
              <p className="text-gray-600 mt-2">Quản lý lớp học và theo dõi tiến độ học viên</p>
            </div>
            <button
              onClick={() => router.push('/teacher')}
              className="flex items-center gap-2 px-6 py-3 bg-brandPurple-600 text-white rounded-lg hover:bg-brandPurple-700 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Bảng điều khiển
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tổng lớp học</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total_classes}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Lớp đang dạy</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.active_classes}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tổng học viên</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total_students}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tiến độ trung bình</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats.avg_completion.toFixed(0)}%
                </p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Lớp học được phân công</h2>
            <span className="text-gray-600 text-sm">{classes.length} lớp</span>
          </div>

          {classes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp học nào</h3>
              <p className="text-gray-600">Bạn chưa được phân công dạy lớp nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group"
                >
                  {/* Status Bar */}
                  <div className={`h-1 ${getStatusColor(classItem.status)}`}></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {classItem.name}
                        </h3>
                        <p className="text-sm text-gray-500">Mã: {classItem.code}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          classItem.status
                        )}`}
                      >
                        {getStatusIcon(classItem.status)}
                        {classItem.status_display}
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <button
                        onClick={() =>
                          router.push(
                            `/programs/lp-trinh-spike-essential-c-bn/subcourses/${classItem.subcourse_slug}`
                          )
                        }
                        className="group/course flex items-center gap-2 text-brandPurple-600 hover:text-brandPurple-700 font-medium text-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        {classItem.subcourse_title}
                        <ArrowRight className="w-4 h-4 group-hover/course:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <Users className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="text-sm">
                          <span className="font-semibold">{classItem.current_enrollment_count}</span>
                          <span className="text-gray-600">/{classItem.max_students} học viên</span>
                          {classItem.is_full && (
                            <span className="ml-2 text-orange-600 font-medium">(Đầy)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="text-sm">
                          {new Date(classItem.start_date).toLocaleDateString('vi-VN')}
                          {classItem.end_date && (
                            <> - {new Date(classItem.end_date).toLocaleDateString('vi-VN')}</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push(`/teacher/classes/${classItem.id}`)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-brandPurple-600 text-white rounded-lg hover:bg-brandPurple-700 transition-colors text-sm font-medium"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Tiến độ
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/programs/lp-trinh-spike-essential-c-bn/subcourses/${classItem.subcourse_slug}`
                          )
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <BookOpen className="w-4 h-4" />
                        Khóa học
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
