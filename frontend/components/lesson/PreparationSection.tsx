/**
 * Preparation Section Component
 * Hiển thị nội dung chuẩn bị cho bài học
 */

import React from 'react';
import { Wrench } from 'lucide-react';
import Image from 'next/image';

interface Media {
  id: number;
  url: string;
  media_type: string;
  caption: string;
  alt_text: string;
}

interface Preparation {
  id: number;
  text: string;
  media: Media[];
  created_at: string;
}

interface PreparationSectionProps {
  preparation: Preparation | null;
}

export default function PreparationSection({ preparation }: PreparationSectionProps) {
  if (!preparation) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Wrench className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chuẩn bị</h2>
          <p className="text-sm text-gray-600">Những gì bạn cần trước khi bắt đầu</p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none">
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg mb-4">
          <p className="text-gray-800 whitespace-pre-line">{preparation.text}</p>
        </div>

        {/* Display preparation media if any */}
        {preparation.media && preparation.media.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {preparation.media.map((media) => (
              <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                {media.media_type === 'image' ? (
                  <Image
                    src={media.url}
                    alt={media.alt_text || media.caption}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{media.media_type}</span>
                  </div>
                )}
                {media.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                    {media.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
