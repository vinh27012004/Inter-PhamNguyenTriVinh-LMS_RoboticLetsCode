/**
 * Models Section Component
 * Hiển thị các mô hình robot với gallery ảnh/video
 */

import React, { useState } from 'react';
import { Box, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Media {
  id: number;
  url: string;
  media_type: string;
  media_type_display: string;
  caption: string;
  alt_text: string;
}

interface Model {
  id: number;
  title: string;
  description: string;
  media: Media[];
  media_count: number;
  order: number;
}

interface ModelsSectionProps {
  models: Model[];
}

function MediaGallery({ media }: { media: Media[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const isImage = currentMedia.media_type === 'image';
  const isVideo = currentMedia.media_type === 'video';

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % media.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);

  return (
    <div className="relative">
      {/* Main Display */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
        {isImage && (
          <Image
            src={currentMedia.url}
            alt={currentMedia.alt_text || currentMedia.caption}
            fill
            className="object-contain"
          />
        )}
        {isVideo && (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-contain"
          >
            Your browser does not support video.
          </video>
        )}
        {!isImage && !isVideo && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Counter */}
        {media.length > 1 && (
          <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
            {currentIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Caption */}
      {currentMedia.caption && (
        <p className="text-sm text-gray-600 mt-2 text-center">{currentMedia.caption}</p>
      )}

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-brandPurple-600 ring-2 ring-brandPurple-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {item.media_type === 'image' ? (
                <Image
                  src={item.url}
                  alt={item.alt_text || ''}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModelsSection({ models }: ModelsSectionProps) {
  if (!models || models.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Box className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mô hình Robot</h2>
          <p className="text-sm text-gray-600">Các mô hình bạn sẽ xây dựng</p>
        </div>
      </div>

      <div className="space-y-8">
        {models.map((model) => (
          <div key={model.id} className="border-b border-gray-200 pb-8 last:border-0 last:pb-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{model.title}</h3>
            {model.description && (
              <p className="text-gray-700 mb-4">{model.description}</p>
            )}
            <MediaGallery media={model.media} />
          </div>
        ))}
      </div>
    </section>
  );
}
