/**
 * Objectives Section Component
 * Hiển thị mục tiêu bài học theo 4 loại: Knowledge, Skills, Thinking, Attitude
 */

import React from 'react';
import { Target, Lightbulb, Brain, Heart, Check } from 'lucide-react';

interface Objective {
  id: number;
  objective_type: string;
  objective_type_display: string;
  text: string;
  order: number;
}

interface ObjectivesSectionProps {
  objectives: Objective[];
}

const objectiveIcons = {
  knowledge: { icon: Lightbulb, color: 'bg-blue-100 text-blue-600', label: 'Kiến thức' },
  skills: { icon: Target, color: 'bg-green-100 text-green-600', label: 'Kỹ năng' },
  thinking: { icon: Brain, color: 'bg-purple-100 text-purple-600', label: 'Tư duy' },
  attitude: { icon: Heart, color: 'bg-pink-100 text-pink-600', label: 'Thái độ' },
};

export default function ObjectivesSection({ objectives }: ObjectivesSectionProps) {
  if (!objectives || objectives.length === 0) return null;

  // Group objectives by type
  const groupedObjectives = objectives.reduce((acc, obj) => {
    const type = obj.objective_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(obj);
    return acc;
  }, {} as Record<string, Objective[]>);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brandPurple-100 rounded-lg">
          <Target className="w-6 h-6 text-brandPurple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mục tiêu bài học</h2>
          <p className="text-sm text-gray-600">Sau bài học này, bạn sẽ đạt được</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(objectiveIcons).map(([type, config]) => {
          const typeObjectives = groupedObjectives[type] || [];
          if (typeObjectives.length === 0) return null;

          const Icon = config.icon;

          return (
            <div key={type} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{config.label}</h3>
              </div>
              <ul className="space-y-2">
                {typeObjectives.map((obj) => {
                  // Tách nội dung theo dòng (split by newline)
                  const lines = obj.text.split('\n').filter(line => line.trim() !== '');
                  
                  return lines.map((line, index) => (
                    <li key={`${obj.id}-${index}`} className="text-sm text-gray-700 flex items-start gap-2">
                      <Check className="w-4 h-4 text-brandPurple-300 mt-0.5 flex-shrink-0" />
                      <span>{line.trim()}</span>
                    </li>
                  ));
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
