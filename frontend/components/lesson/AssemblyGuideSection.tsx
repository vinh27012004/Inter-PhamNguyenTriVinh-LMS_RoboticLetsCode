/**
 * Assembly Guide Section Component
 * Hiển thị các bước lắp ráp robot (PDF hoặc slideshow ảnh)
 * Thừa kế Media để hiển thị chi tiết các hình ảnh từng bước
 */

import React, { useState, useEffect } from 'react';
import { Hammer, FileText, ChevronLeft, ChevronRight, ExternalLink, X, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface Media {
  id: number;
  url: string;
  media_type: string;
  media_type_display: string;
  caption: string;
  alt_text: string;
}

interface AssemblyGuide {
  id: number;
  title: string;
  description: string;
  pdf_url: string | null;
  media: Media[];
  media_count: number;
  order: number;
}

interface AssemblyGuideSectionProps {
  assemblyGuides: AssemblyGuide[];
}

// Helper: Encode URL có dấu/khoảng trắng
const toSafeUrl = (url: string) => {
  try {
    return encodeURI(url);
  } catch {
    return url;
  }
};

function AssemblyGuideCard({ guide }: { guide: AssemblyGuide }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = guide.media.filter(m => m.media_type === 'image');

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsModalOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{guide.title}</h3>
        </div>
        {guide.pdf_url && (
          <a
            href={guide.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 text-sm text-brandPurple-600 hover:text-brandPurple-700 hover:bg-brandPurple-50 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            PDF
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Description */}
      {guide.description && (
        <p className="text-gray-700 text-sm mb-4">{guide.description}</p>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div>
          <div 
            className="relative w-full bg-white rounded-lg overflow-hidden border border-gray-300 cursor-pointer hover:shadow-lg transition-shadow"
            style={{ aspectRatio: '16 / 9', minHeight: '500px' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src={toSafeUrl(images[currentImageIndex].url)}
              alt={images[currentImageIndex].alt_text || `Bước ${guide.order}`}
              fill
              className="object-contain"
              unoptimized
              priority
            />

            {/* Fullscreen button */}
            <button
              className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-lg shadow transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Caption */}
          {images[currentImageIndex].caption && (
            <p className="text-sm text-gray-600 mt-3 text-center">
              {images[currentImageIndex].caption}
            </p>
          )}

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all overflow-hidden ${
                    index === currentImageIndex
                      ? 'border-brandPurple-500 ring-2 ring-brandPurple-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={toSafeUrl(image.url)}
                    alt={`Ảnh ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {/* Fullscreen Modal */}
          {isModalOpen && (
            <div 
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setIsModalOpen(false)}
            >
              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Modal content */}
              <div className="relative w-11/12 h-5/6 max-w-6xl" onClick={(e) => e.stopPropagation()}>
                <Image
                  src={toSafeUrl(images[currentImageIndex].url)}
                  alt={images[currentImageIndex].alt_text || `Bước ${guide.order}`}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />

                {/* Navigation buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/70 text-white text-sm rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Caption */}
              {images[currentImageIndex].caption && (
                <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-sm text-center max-w-md">
                  {images[currentImageIndex].caption}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AssemblyGuideSection({ assemblyGuides }: AssemblyGuideSectionProps) {
  if (!assemblyGuides || assemblyGuides.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Hammer className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hướng dẫn Lắp ráp</h2>
          <p className="text-sm text-gray-600">Các bước lắp ráp robot từng phần</p>
        </div>
      </div>

      <div className="space-y-6">
        {assemblyGuides.map((guide) => (
          <AssemblyGuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </section>
  );
}
