/**
 * Course Detail Page
 * Chi tiết chương trình học (sẽ implement sau)
 */

'use client';

import { useParams } from 'next/navigation';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chi tiết khóa học #{courseId}
        </h1>
        <p className="text-gray-600 mb-8">
          Trang này sẽ được phát triển trong giai đoạn tiếp theo
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Quay lại trang chủ
        </a>
      </div>
    </div>
  );
}
