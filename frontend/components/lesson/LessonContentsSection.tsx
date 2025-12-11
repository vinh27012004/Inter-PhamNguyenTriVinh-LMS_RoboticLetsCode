/**
 * Lesson Content Blocks Section Component
 * Hiển thị các khối nội dung học tập chính (text + media)
 */

import React from 'react';
import { BookOpen, Play, Code2, Lightbulb } from 'lucide-react';
import Image from 'next/image';

interface Media {
  id: number;
  url: string;
  media_type: string;
  media_type_display: string;
  caption: string;
  alt_text: string;
}

interface ContentBlock {
  id: number;
  title: string;
  subtitle: string;
  content_type: string;
  content_type_display: string;
  description: string;
  usage_text: string;
  example_text: string;
  media: Media[];
  media_count: number;
  order: number;
}

interface LessonContentsSectionProps {
  contentBlocks: ContentBlock[];
}

const contentTypeConfig = {
  text: { icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  text_media: { icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
  video: { icon: Play, color: 'bg-red-100 text-red-600' },
  example: { icon: Code2, color: 'bg-green-100 text-green-600' },
  tips: { icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600' },
  summary: { icon: BookOpen, color: 'bg-gray-100 text-gray-600' },
};

function ContentBlockCard({ block }: { block: ContentBlock }) {
  const config = contentTypeConfig[block.content_type as keyof typeof contentTypeConfig] || contentTypeConfig.text;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1.5 rounded ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-gray-600">{block.content_type_display}</span>
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">{block.title}</h3>
        {block.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{block.subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        {block.description && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{block.description}</p>
          </div>
        )}

        {/* Media */}
        {block.media && block.media.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {block.media.map((media) => (
              <div key={media.id} className="relative">
                {media.media_type === 'image' && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={media.url}
                      alt={media.alt_text || media.caption}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                {media.media_type === 'video' && (
                  <video
                    src={media.url}
                    controls
                    className="w-full rounded-lg"
                  >
                    Your browser does not support video.
                  </video>
                )}
                {media.caption && (
                  <p className="text-xs text-gray-600 mt-1 italic">{media.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Usage Text */}
        {block.usage_text && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <p className="text-sm font-medium text-blue-900 mb-1">💡 Cách sử dụng:</p>
            <p className="text-sm text-blue-800 whitespace-pre-line">{block.usage_text}</p>
          </div>
        )}

        {/* Example Text / Code */}
        {block.example_text && (
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400 font-medium">Ví dụ Code</span>
            </div>
            <pre className="text-sm text-gray-100 font-mono">
              <code>{block.example_text}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonContentsSection({ contentBlocks }: LessonContentsSectionProps) {
  if (!contentBlocks || contentBlocks.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <BookOpen className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nội dung Bài học</h2>
          <p className="text-sm text-gray-600">Kiến thức và kỹ năng cần học</p>
        </div>
      </div>

      <div className="space-y-4">
        {contentBlocks.map((block) => (
          <ContentBlockCard key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
}
