'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';

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

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/classes/');
      setClasses(response.data.results || response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải danh sách lớp');
      console.error('Error fetching classes:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lớp học của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý và theo dõi các lớp học được phân công</p>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp học nào</h3>
            <p className="text-gray-600">Bạn chưa được phân công dạy lớp nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/teacher/classes/${classItem.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-gray-600">Mã: {classItem.code}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        classItem.status
                      )}`}
                    >
                      {classItem.status_display}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {classItem.subcourse_title}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {classItem.current_enrollment_count}/{classItem.max_students} học viên
                        {classItem.is_full && (
                          <span className="ml-2 text-orange-600 font-medium">(Đầy)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(classItem.start_date).toLocaleDateString('vi-VN')}
                        {classItem.end_date && (
                          <> - {new Date(classItem.end_date).toLocaleDateString('vi-VN')}</>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/teacher/classes/${classItem.id}`);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
