/**
 * Preparation Section Component
 * Hiển thị các khối chuẩn bị (BuildBlocks) với hình ảnh JPG, PNG, PDF
 */

import React from 'react';
import { Wrench, FileText, Download } from 'lucide-react';
import Image from 'next/image';

interface BuildBlock {
  id: number;
  title: string;
  description: string;
  pdf_url: string | null;
  order: number;
}

interface Preparation {
  id: number;
  build_blocks: BuildBlock[];
  created_at: string;
}

interface PreparationSectionProps {
  preparation: Preparation | null;
}

export default function PreparationSection({ preparation }: PreparationSectionProps) {
  if (!preparation || !preparation.build_blocks || preparation.build_blocks.length === 0) return null;

  // Helper function to check if URL is an image
  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Wrench className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chuẩn bị</h2>
          <p className="text-sm text-gray-600">Các tài liệu cần chuẩn bị cho bài học</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {preparation.build_blocks
          .sort((a, b) => a.order - b.order)
          .map((block) => {
            const hasPdfUrl = block.pdf_url;
            const isPdfUrlImage = hasPdfUrl ? isImageUrl(block.pdf_url!) : false;

            return (
              <div key={block.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-orange-500 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">{block.title}</h3>
                </div>
                
                {block.description && (
                  <p className="text-sm text-gray-600 mb-3">{block.description}</p>
                )}

                {/* Hiển thị ảnh từ pdf_url */}
                {isPdfUrlImage && (
                  <div className="mt-4">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all">
                      <Image
                        src={block.pdf_url!}
                        alt={block.title}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          console.error('Image load error:', block.pdf_url);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* PDF Link nếu không phải ảnh */}
                {hasPdfUrl && !isPdfUrlImage && (
                  <a
                    href={block.pdf_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải PDF</span>
                  </a>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
}

