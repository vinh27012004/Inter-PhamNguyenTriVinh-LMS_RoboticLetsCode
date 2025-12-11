/**
 * Attachments Section Component
 * Hiển thị các file đính kèm có thể download
 */

import React from 'react';
import { Download, FileText, File, Archive, Music, Video } from 'lucide-react';

interface Attachment {
  id: number;
  file_url: string;
  name: string;
  description: string;
  file_type: string;
  file_type_display: string;
  file_size_kb: number | null;
  order: number;
}

interface AttachmentsSectionProps {
  attachments: Attachment[];
}

const fileTypeIcons = {
  code: { icon: FileText, color: 'text-green-600 bg-green-50' },
  document: { icon: FileText, color: 'text-blue-600 bg-blue-50' },
  spreadsheet: { icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
  archive: { icon: Archive, color: 'text-orange-600 bg-orange-50' },
  media: { icon: Video, color: 'text-purple-600 bg-purple-50' },
  other: { icon: File, color: 'text-gray-600 bg-gray-50' },
};

function formatFileSize(sizeKb: number | null): string {
  if (!sizeKb) return 'N/A';
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const config = fileTypeIcons[attachment.file_type as keyof typeof fileTypeIcons] || fileTypeIcons.other;
  const Icon = config.icon;

  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-brandPurple-300 transition-all group"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-3 rounded-lg ${config.color}`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <h4 className="font-semibold text-gray-900 group-hover:text-brandPurple-600 transition-colors truncate">
          {attachment.name}
        </h4>
        {attachment.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{attachment.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="px-2 py-0.5 bg-gray-100 rounded">{attachment.file_type_display}</span>
          <span>{formatFileSize(attachment.file_size_kb)}</span>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex-shrink-0">
        <div className="p-2 rounded-lg bg-brandPurple-100 text-brandPurple-600 group-hover:bg-brandPurple-600 group-hover:text-white transition-colors">
          <Download className="w-5 h-5" />
        </div>
      </div>
    </a>
  );
}

export default function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-100 rounded-lg">
          <Download className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tài liệu đính kèm</h2>
          <p className="text-sm text-gray-600">
            {attachments.length} file có sẵn để tải về
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attachments.map((attachment) => (
          <AttachmentCard key={attachment.id} attachment={attachment} />
        ))}
      </div>
    </section>
  );
}
