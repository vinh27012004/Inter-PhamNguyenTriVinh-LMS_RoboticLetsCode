"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface LessonInfoCardProps {
  title: string;
  content: string;
  bgGradient: string;
  borderColor: string;
  iconBgColor: string;
  defaultExpanded?: boolean;
}

export default function LessonInfoCard({
  title,
  content,
  bgGradient,
  borderColor,
  iconBgColor,
  defaultExpanded = false,
}: LessonInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!content) return null;

  return (
    <div
      className={`bg-gradient-to-br ${bgGradient} rounded-xl border ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-md`}
    >
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center gap-3 text-left transition-colors hover:bg-white/30"
      >
        <h2 className="flex-1 text-lg font-bold text-gray-900">{title}</h2>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button> 

      {/* Content - Expandable */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-0">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}