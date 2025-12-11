/**
 * Build Blocks Section Component
 * Hiển thị các bước xây dựng robot (PDF hoặc slideshow ảnh)
 */

import React, { useState } from 'react';
import { Hammer, FileText, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Media {
  id: number;
  url: string;
  media_type: string;
  media_type_display: string;
  caption: string;
  alt_text: string;
}

interface BuildBlock {
  id: number;
  title: string;
  description: string;
  pdf_url: string | null;
  media: Media[];
  media_count: number;
  order: number;
}

interface BuildBlocksSectionProps {
  buildBlocks: BuildBlock[];
}

function BuildBlockCard({ block }: { block: BuildBlock }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = block.media.filter(m => m.media_type === 'image');

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brandPurple-100 text-brandPurple-600 font-bold text-sm">
            {block.order}
          </span>
          <h3 className="font-semibold text-gray-900">{block.title}</h3>
        </div>
        {block.pdf_url && (
          <a
            href={block.pdf_url}
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
      {block.description && (
        <p className="text-gray-700 text-sm mb-4">{block.description}</p>
      )}

      {/* Image Slideshow */}
      {images.length > 0 && (
        <div className="relative">
          <div className="relative aspect-video bg-white rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt_text || `Bước ${block.order}`}
              fill
              className="object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {images[currentImageIndex].caption && (
            <p className="text-xs text-gray-600 mt-2 text-center">
              {images[currentImageIndex].caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function BuildBlocksSection({ buildBlocks }: BuildBlocksSectionProps) {
  if (!buildBlocks || buildBlocks.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Hammer className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hướng dẫn Xây dựng</h2>
          <p className="text-sm text-gray-600">Các bước lắp ráp robot từng phần</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {buildBlocks.map((block) => (
          <BuildBlockCard key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
}
