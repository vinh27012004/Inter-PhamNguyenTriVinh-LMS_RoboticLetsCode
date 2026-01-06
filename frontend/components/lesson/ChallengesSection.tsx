/**
 * Challenges Section Component
 * Hiển thị các thử thách/bài tập cho học viên
 */

import React, { useState } from 'react';
import { Trophy, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

interface Media {
  id: number;
  url: string;
  media_type: string;
  caption: string;
  alt_text: string;
}

interface Challenge {
  id: number;
  title: string;
  subtitle: string;
  instructions: string;
  expected_output: string;
  difficulty: string;
  difficulty_display: string;
  points: number;
  time_limit_minutes: number | null;
  media: Media[];
  media_count: number;
  status: string;
  order: number;
}

interface ChallengesSectionProps {
  challenges: Challenge[];
}

const difficultyConfig = {
  easy: { color: 'bg-green-100 text-green-700 border-green-300', label: 'Dễ' },
  medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Trung bình' },
  hard: { color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Khó' },
  expert: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Chuyên gia' },
};

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = difficultyConfig[challenge.difficulty as keyof typeof difficultyConfig] || difficultyConfig.medium;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-grow">
            <h3 className="font-bold text-xl text-gray-900 mb-1">{challenge.title}</h3>
            {challenge.subtitle && (
              <p className="text-gray-600 text-sm">{challenge.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
              <Star className="w-4 h-4" />
              {challenge.points}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
            {config.label}
          </span>
          {challenge.time_limit_minutes && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {challenge.time_limit_minutes} phút
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Toggle Details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-brandPurple-600 hover:text-brandPurple-700 font-medium text-sm"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Thu gọn chi tiết
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Xem hướng dẫn chi tiết
            </>
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-gray-200">
            {/* Instructions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                📋 Hướng dẫn thực hiện:
              </h4>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                <p className="text-gray-800 whitespace-pre-line text-sm">{challenge.instructions}</p>
              </div>
            </div>

            {/* Expected Output */}
            {challenge.expected_output && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  ✅ Kết quả mong đợi:
                </h4>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                  <p className="text-gray-800 whitespace-pre-line text-sm">{challenge.expected_output}</p>
                </div>
              </div>
            )}

            {/* Media */}
            {challenge.media && challenge.media.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🖼️ Hình ảnh / Video hướng dẫn:</h4>
                <div className="grid gap-3">
                  {challenge.media.map((media) => (
                    <div key={media.id} className="relative aspect-video rounded-lg overflow-hidden border border-gray-300">
                      {media.media_type === 'image' ? (
                        <Image
                          src={media.url}
                          alt={media.alt_text || media.caption}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <video src={media.url} controls className="w-full h-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChallengesSection({ challenges }: ChallengesSectionProps) {
  if (!challenges || challenges.length === 0) return null;

  // Only show published challenges
  const publishedChallenges = challenges.filter(c => c.status === 'published');
  if (publishedChallenges.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Trophy className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thử thách</h2>
          <p className="text-sm text-gray-600">
            {publishedChallenges.length} thử thách để kiểm tra kỹ năng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1">
        {publishedChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </section>
  );
}
