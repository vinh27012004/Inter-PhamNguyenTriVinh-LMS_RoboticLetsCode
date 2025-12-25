/**
 * Preparation Section Component
 * Hiển thị các khối chuẩn bị (BuildBlocks) với hình ảnh JPG, PNG, PDF
 */

import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import Image from 'next/image';

interface BuildBlock {
  id: number;
  title: string;
  description: string;
  pdf_url: string | null;
  order: number;
}

interface PreparationBuildBlock {
  id: number;
  quantity: number;
  build_block: BuildBlock;
}

interface Preparation {
  id: number;
  build_blocks: PreparationBuildBlock[];
  created_at: string;
}

interface PreparationSectionProps {
  preparation: Preparation | null;
}

export default function PreparationSection({ preparation }: PreparationSectionProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  if (!preparation || !preparation.build_blocks || preparation.build_blocks.length === 0) return null;

  const toggleFlip = (cardId: number) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Wrench className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chuẩn bị</h2>
          <p className="text-sm text-gray-600">Click vào thẻ để xem số lượng cần chuẩn bị</p>
        </div>
      </div>

      <style jsx>{`
        .flip-card {
          perspective: 1000px;
          width: 100%;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          transition: transform 0.6s ease-in-out;
          transform-style: preserve-3d;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {preparation.build_blocks
          .sort((a, b) => a.build_block.order - b.build_block.order)
          .map((item) => {
            const block = item.build_block;
            if (!block) return null;

            const isFlipped = flippedCards.has(item.id);

            return (
              <div
                key={item.id}
                className="flip-card cursor-pointer"
                onClick={() => toggleFlip(item.id)}
              >
                <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                  {/* Front side - Image */}
                  <div className="flip-card-front rounded-lg overflow-hidden">
                    <div className="relative w-full h-full border border-gray-200 hover:border-orange-500 transition-colors bg-gray-50">
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

                  {/* Back side - Info */}
                  <div className="flip-card-back rounded-lg overflow-hidden">
                    <div className="w-full h-full border border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4 text-center">
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 font-semibold mb-3">Số lượng cần chuẩn bị:</p>
                        <div className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold text-4xl">
                          {item.quantity}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-4">{block.title}</p>
                      {block.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{block.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

