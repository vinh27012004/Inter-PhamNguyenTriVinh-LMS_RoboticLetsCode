'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Image from 'next/image';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Assignment {
  id: number;
  subcourse: number;
  subcourse_title: string;
  subcourse_slug: string;
  subcourse_thumbnail?: string;
  subcourse_level?: string;
  subcourse_session_count?: number;
  program_slug: string;
  program_title: string;
  status: string;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const fetchMyAssignments = async () => {
    try {
      // Kiểm tra authentication
      const token = localStorage.getItem('access_token');
      console.log('Token:', token ? 'EXISTS' : 'NOT FOUND');
      if (!token) {
        console.log('No token, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Fetching /auth/assignments/...');
      const response = await axios.get('/auth/assignments/');
      console.log('Raw API response:', response.data);
      
      // Get results from paginated response
      const assignmentsData = response.data.results || response.data;
      
      // Filter only ACTIVE assignments (already filtered by backend but double check)
      const activeAssignments = Array.isArray(assignmentsData) 
        ? assignmentsData.filter((a: any) => a.status === 'ACTIVE')
        : [];
      
      console.log('Active assignments with full data:', activeAssignments);
      
      // API đã trả về đủ thông tin và user đã có assignment = đã có quyền
      setAssignments(activeAssignments);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        console.log('Unauthorized, redirecting to login');
        router.push('/login');
      } else {
        setError('Không thể tải danh sách khóa học');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brandPurple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brandPurple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandPurple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg text-brandPurple-600 transition-all hover:text-brandPurple-700 hover:bg-brandPurple-50 hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại trang chủ
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Khóa học của tôi
          </h1>
          <p className="text-gray-600">
            {assignments.length === 0
              ? 'Bạn chưa đăng ký khóa học nào hoặc không có quyền truy cập'
              : `Bạn đang học ${assignments.length} khóa học`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có khóa học nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy quay lại trang chủ để chọn một khóa học để bắt đầu
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-brandPurple-500 text-white rounded-lg hover:bg-brandPurple-600 transition-colors"
            >
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/programs/${assignment.program_slug}/subcourses/${assignment.subcourse_slug}`}
              >
                <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105">
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-brandPurple-400 to-brandPurple-600 flex items-center justify-center overflow-hidden">
                    {assignment.subcourse_thumbnail ? (
                      <img
                        src={assignment.subcourse_thumbnail}
                        alt={assignment.subcourse_title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-white opacity-50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Program Badge */}
                    <p className="text-xs font-semibold text-brandPurple-600 uppercase tracking-wider mb-2">
                      {assignment.program_title}
                    </p>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-brandPurple-600 transition-colors line-clamp-2">
                      {assignment.subcourse_title}
                    </h3>

                    {/* Level & Session Count */}
                    {(assignment.subcourse_level ||
                      assignment.subcourse_session_count) && (
                      <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                        {assignment.subcourse_level && (
                          <span className="px-2 py-1 bg-brandYellow-100 text-brandYellow-800 rounded-full text-xs font-semibold">
                            {assignment.subcourse_level}
                          </span>
                        )}
                        {assignment.subcourse_session_count && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {assignment.subcourse_session_count} bài
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                      <CheckCircle className="w-4 h-4" />
                      <span>Đang học</span>
                    </div>

                    {/* CTA */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-brandPurple-600 group-hover:text-brandPurple-700">
                        Tiếp tục học →
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mascot Decoration */}
      <div className="hidden lg:flex fixed bottom-0 right-0 opacity-20 pointer-events-none">
        <Image
          src="/images/mascot/leco game 4.png"
          alt="Mascot"
          width={200}
          height={200}
          className="animate-float"
        />
      </div>
    </div>
  );
}
