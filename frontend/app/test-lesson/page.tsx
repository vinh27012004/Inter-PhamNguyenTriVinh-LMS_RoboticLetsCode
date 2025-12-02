/**
 * Test Lesson Page
 * Để test giao diện lesson detail với sample data
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TestLessonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Test Lesson Detail Page
          </h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hướng dẫn test:
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>
                  <strong>Tạo dữ liệu test trong Django Admin:</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                    <li>Truy cập: http://127.0.0.1:8000/admin/</li>
                    <li>Vào Content → Lessons → Chọn 1 lesson</li>
                    <li>Thêm Video URL (YouTube/Vimeo embed link)</li>
                    <li>Thêm Code Snippet (Python code)</li>
                    <li>Thêm Project File URL</li>
                    <li>Save</li>
                  </ul>
                </li>

                <li className="mt-4">
                  <strong>Test lesson detail page:</strong>
                  <div className="mt-2 space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        URL format: <code className="bg-blue-100 px-2 py-1 rounded">/lessons/[id]</code>
                      </p>
                      <p className="text-sm text-gray-700">
                        Ví dụ: <code className="bg-blue-100 px-2 py-1 rounded">/lessons/1</code>
                      </p>
                    </div>

                    <div className="flex flex-col space-y-2 mt-4">
                      <a
                        href="/lessons/1"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Test Lesson ID = 1
                      </a>
                      <a
                        href="/lessons/2"
                        className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Test Lesson ID = 2
                      </a>
                    </div>
                  </div>
                </li>

                <li className="mt-4">
                  <strong>Các tính năng cần test:</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                    <li>✅ Video player hoạt động</li>
                    <li>✅ Tabs (Tổng quan, Lắp ráp, Thử thách) chuyển đổi mượt</li>
                    <li>✅ Code viewer hiển thị syntax highlighting</li>
                    <li>✅ Nút Copy code hoạt động</li>
                    <li>✅ Nút Download file project</li>
                    <li>✅ Nút "Hoàn thành bài học"</li>
                    <li>✅ Animation Framer Motion (slide từ phải sang trái)</li>
                    <li>✅ Responsive (Mobile/Desktop)</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Lưu ý:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Backend Django phải đang chạy tại http://127.0.0.1:8000</li>
                <li>• Đã tạo ít nhất 1 lesson trong database</li>
                <li>• Video URL phải là embed link (không phải link watch thông thường)</li>
                <li>• Code snippet nên có syntax Python để test highlighting</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-green-800 mb-2">✨ Sample Data:</h3>
              <div className="text-sm text-green-700 space-y-3">
                <div>
                  <strong>Video URL mẫu (YouTube):</strong>
                  <code className="block bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
                    https://www.youtube.com/embed/dQw4w9WgXcQ
                  </code>
                </div>
                <div>
                  <strong>Code Snippet mẫu (Python):</strong>
                  <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
{`from spike import PrimeHub, Motor

# Khởi tạo hub
hub = PrimeHub()

# Khởi tạo motor
motor = Motor('A')

# Di chuyển motor
motor.run_for_degrees(360)

print("Done!")`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
