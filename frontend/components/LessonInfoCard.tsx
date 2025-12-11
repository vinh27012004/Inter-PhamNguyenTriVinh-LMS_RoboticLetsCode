import React from 'react';

interface LessonInfoCardProps {
  title: string;
  content: string | null | undefined;
  icon?: string;
  bgGradient?: string;
  borderColor?: string;
  textColor?: string;
}

export default function LessonInfoCard({
  title,
  content,
  icon = '📚',
  bgGradient = 'from-brandPurple-50 to-brandYellow-50',
  borderColor = 'border-brandPurple-200',
  textColor = 'text-brandPurple-700',
}: LessonInfoCardProps) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-4 border ${borderColor}`}>
      <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-800">
        <span className="text-2xl">{icon}</span>
        {title}
      </h4>
      <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium">
        {content || 'Chưa cập nhật'}
      </div>
    </div>
  );
}