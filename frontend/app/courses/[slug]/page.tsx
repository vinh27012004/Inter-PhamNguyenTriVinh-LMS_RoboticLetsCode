/**
 * Course Detail Page
 * Chi tiết chương trình học theo slug
 */

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProgramDetail } from '@/services/robotics';

interface Program {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  kit_type: string;
  subcourses: any[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const data = await getProgramDetail(slug);
        setProgram(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Không thể tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProgram();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Không tìm thấy khóa học'}</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Quay về trang chủ
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {program.title}
      </h1>
      <p className="text-gray-600 mb-8">{program.description}</p>
      
      {program.thumbnail_url && (
        <img 
          src={program.thumbnail_url} 
          alt={program.title}
          className="w-full max-w-2xl rounded-lg mb-8"
        />
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Danh sách khóa con</h2>
        {program.subcourses && program.subcourses.length > 0 ? (
          <div className="grid gap-4">
            {program.subcourses.map((subcourse: any) => (
              <div key={subcourse.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg">{subcourse.title}</h3>
                {subcourse.subtitle && (
                  <p className="text-gray-600 text-sm">{subcourse.subtitle}</p>
                )}
                {subcourse.description && (
                  <p className="text-gray-500 mt-2">{subcourse.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có khóa con nào</p>
        )}
      </div>
    </div>
  );
}
