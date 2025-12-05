/**
 * SubcourseCard Component
 * Hiển thị thông tin khóa học con dưới dạng card
 * Bao gồm: Cấp độ, Level, Số buổi học, Số bài học
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Zap, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface SubcourseCardProps {
  id: number;
  slug: string;
  programSlug: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail_url?: string;
  coding_language: 'ICON_BLOCKS' | 'WORD_BLOCKS' | 'PYTHON';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  level_display: string;
  level_number: number;
  session_count: number;
  lesson_count: number;
  has_access?: boolean;
}

export default function SubcourseCard({
  id,
  slug,
  programSlug,
  title,
  subtitle,
  description,
  thumbnail_url,
  coding_language,
  level,
  level_display,
  level_number,
  session_count,
  lesson_count,
  has_access = true,
}: SubcourseCardProps) {
  // Cấu hình màu cho cấp độ
  const levelConfig = {
    BEGINNER: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
    },
    INTERMEDIATE: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
    },
    ADVANCED: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
    },
  };

  // Cấu hình cho ngôn ngữ lập trình
  const languageConfig = {
    ICON_BLOCKS: {
      label: 'Icon Blocks',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    WORD_BLOCKS: {
      label: 'Word Blocks',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    PYTHON: {
      label: 'Python',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  };

  const levelCfg = levelConfig[level];
  const langCfg = languageConfig[coding_language];
  const [isExpanded, setIsExpanded] = useState(false);

  // Xử lý không có quyền truy cập
  if (!has_access) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-60 cursor-not-allowed relative">
        {/* Overlay khóa */}
        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-12 h-12 text-white mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">Cần quyền để truy cập</p>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover grayscale"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {/* Badge - Cấp độ */}
          <div className="absolute top-2 left-2">
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-semibold ${levelCfg.bgColor} ${levelCfg.textColor} ${levelCfg.borderColor} backdrop-blur-sm`}
            >
              <span>●</span>
              <span>{level_display}</span>
            </div>
          </div>

          {/* Badge - Level Number */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full border border-blue-300 bg-blue-100 text-blue-800 text-xs font-semibold backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              <span>Level {level_number}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <div className="mb-3">
              <p className={`text-xs text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                {description}
              </p>
              {description.length > 80 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      Rút gọn <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Mở rộng <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Language & Session Info */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${langCfg.bgColor} ${langCfg.textColor}`}
            >
              {langCfg.label}
            </span>
          </div>

          {/* Stats - Bài học & Buổi học */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <span>{lesson_count} bài học</span>
              </div>
              <span className="font-semibold text-gray-900">{lesson_count}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600 border-t pt-2">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{session_count} buổi</span>
              </div>
              <span className="font-semibold text-gray-900">{session_count}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị bình thường nếu có quyền truy cập
  return (
    <Link href={`/programs/${programSlug}/subcourses/${slug}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group">
        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {/* Badge - Cấp độ */}
          <div className="absolute top-2 left-2">
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-semibold ${levelCfg.bgColor} ${levelCfg.textColor} ${levelCfg.borderColor} backdrop-blur-sm`}
            >
              <span>●</span>
              <span>{level_display}</span>
            </div>
          </div>

          {/* Badge - Level Number */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full border border-blue-300 bg-blue-100 text-blue-800 text-xs font-semibold backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              <span>Level {level_number}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <div className="mb-3">
              <p className={`text-xs text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                {description}
              </p>
              {description.length > 80 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      Rút gọn <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Mở rộng <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Language & Session Info */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${langCfg.bgColor} ${langCfg.textColor}`}
            >
              {langCfg.label}
            </span>
          </div>

          {/* Stats - Bài học & Buổi học */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <span>{lesson_count} bài học</span>
              </div>
              <span className="font-semibold text-gray-900">{lesson_count}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600 border-t pt-2">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{session_count} buổi</span>
              </div>
              <span className="font-semibold text-gray-900">{session_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
