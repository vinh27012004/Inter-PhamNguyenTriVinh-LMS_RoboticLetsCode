/**
 * CourseCard Component
 * Hiển thị thông tin khóa học dưới dạng card
 */

'use client';

import Link from 'next/link';
import { Cpu, Sparkles } from 'lucide-react';

interface CourseCardProps {
  id: number;
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  kit_type: 'SPIKE_ESSENTIAL' | 'SPIKE_PRIME';
  subcourse_count?: number;
  total_lessons?: number;
}

export default function CourseCard({
  id,
  slug,
  title,
  description,
  thumbnail_url,
  kit_type,
  subcourse_count,
  total_lessons,
}: CourseCardProps) {
  // Cấu hình badge theo loại Kit
  const kitConfig = {
    SPIKE_ESSENTIAL: {
      label: 'SPIKE Essential',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      icon: Sparkles,
    },
    SPIKE_PRIME: {
      label: 'SPIKE Prime',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      icon: Cpu,
    },
  };

  const config = kitConfig[kit_type];
  const Icon = config.icon;

  return (
    <Link href={`/programs/${slug}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            // Placeholder nếu không có thumbnail
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-20 h-20 text-gray-300" />
            </div>
          )}
          
          {/* Badge Kit Type */}
          <div className="absolute top-3 right-3">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} backdrop-blur-sm`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{config.label}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {subcourse_count !== undefined && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>{subcourse_count} khóa học</span>
              </div>
            )}
            
            {total_lessons !== undefined && (
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>{total_lessons} bài học</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
