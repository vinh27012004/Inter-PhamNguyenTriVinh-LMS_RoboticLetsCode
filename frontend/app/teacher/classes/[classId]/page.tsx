'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  CheckCircle,
  Calendar,
  BookOpen,
  Award,
} from 'lucide-react';

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  subcourse_title: string;
  status: string;
  status_display: string;
  start_date: string;
  end_date: string | null;
  current_enrollment_count: number;
  max_students: number;
}

interface StudentProgress {
  student_id: number;
  student_username: string;
  student_name: string;
  enrollment_status: string;
  enrolled_at: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  last_activity: string | null;
  last_lesson: string | null;
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress'>('overview');

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchStudentProgress();
    }
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      const response = await axios.get(`/classes/${classId}/`);
      setClassDetail(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải thông tin lớp học');
      console.error('Error fetching class:', err);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/classes/${classId}/student_progress/`);
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể tải tiến độ học sinh');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const avgCompletion =
    students.length > 0
      ? (students.reduce((sum, s) => sum + s.completion_percentage, 0) / students.length).toFixed(
          1
        )
      : 0;

  if (loading && !classDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-300 rounded w-1/4"></div>
            <div className="bg-white rounded-xl p-8 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !classDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/teacher')}
            className="flex items-center text-brandPurple-600 hover:text-brandPurple-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/teacher')}
          className="flex items-center text-brandPurple-600 hover:text-brandPurple-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>

        {classDetail && (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{classDetail.name}</h1>
                  <p className="text-gray-600">Mã lớp: {classDetail.code}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                    classDetail.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {classDetail.status_display}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                <BookOpen className="w-5 h-5 text-brandPurple-600" />
                <p className="text-lg font-semibold text-gray-900">{classDetail.subcourse_title}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Tổng học viên
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {classDetail.current_enrollment_count}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">/ {classDetail.max_students}</p>
                </div>

                <div className="bg-gradient-to-br from-brandPurple-50 to-brandPurple-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Tiến độ trung bình
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{avgCompletion}%</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Hoàn thành
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {students.filter((s) => s.completion_percentage === 100).length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Khai giảng
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(classDetail.start_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === 'overview'
                        ? 'border-brandPurple-600 text-brandPurple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Tổng quan
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === 'progress'
                        ? 'border-brandPurple-600 text-brandPurple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Tiến độ học sinh
                  </button>
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thông tin lớp học
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Mã lớp</p>
                          <p className="font-semibold text-gray-900">{classDetail.code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                          <p className="font-semibold text-gray-900">
                            {classDetail.status_display}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Sức chứa</p>
                          <p className="font-semibold text-gray-900">
                            {classDetail.max_students} học viên
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Tình hình lớp học
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">
                              Sĩ số: {classDetail.current_enrollment_count}/
                              {classDetail.max_students}
                            </p>
                            <p className="text-sm font-semibold text-brandPurple-600">
                              {(
                                (classDetail.current_enrollment_count / classDetail.max_students) *
                                100
                              ).toFixed(0)}
                              %
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-brandPurple-600 h-3 rounded-full transition-all"
                              style={{
                                width: `${(classDetail.current_enrollment_count / classDetail.max_students) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">
                              Tiến độ trung bình: {students.length > 0 ? avgCompletion : 0}%
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all"
                              style={{
                                width: `${students.length > 0 ? avgCompletion : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'progress' && (
                  <div>
                    {students.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Chưa có học sinh nào trong lớp</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {students.map((student) => (
                          <div
                            key={student.student_id}
                            className={`p-4 rounded-lg border border-gray-200 ${getProgressBgColor(student.completion_percentage)} hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {student.student_name}
                                </p>
                                <p className="text-sm text-gray-600">@{student.student_username}</p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-2xl font-bold ${getProgressColor(student.completion_percentage)}`}
                                >
                                  {student.completion_percentage.toFixed(0)}%
                                </p>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all ${getProgressBarColor(student.completion_percentage)}`}
                                  style={{
                                    width: `${student.completion_percentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                                <span>
                                  <span className="font-semibold text-gray-900">
                                    {student.completed_lessons}
                                  </span>
                                  /{student.total_lessons} bài học
                                </span>
                                {student.last_activity && (
                                  <span>
                                    Lần cuối: {new Date(student.last_activity).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {student.last_lesson && (
                              <div className="mt-2 pt-2 border-t border-gray-300">
                                <p className="text-xs text-gray-600">
                                  Bài cuối cùng: <span className="font-medium">{student.last_lesson}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
