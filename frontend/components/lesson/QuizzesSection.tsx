/**
 * Quizzes Section Component
 * Hiển thị bài kiểm tra với các loại câu hỏi: single/multiple/open
 */

import React, { useState } from 'react';
import { ClipboardCheck, HelpCircle, CheckCircle2, XCircle, Clock, Award } from 'lucide-react';

interface QuestionOption {
  id: number;
  option_text: string;
  is_correct: boolean;
  order: number;
}

interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: string;
  question_type_display: string;
  explanation: string;
  points: number;
  options: QuestionOption[];
  order: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string;
  quiz_type_display: string;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes: number | null;
  questions: QuizQuestion[];
  questions_count: number;
  total_points: number;
  status: string;
  order: number;
}

interface QuizzesSectionProps {
  quizzes: Quiz[];
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleOptionSelect = (questionId: number, optionId: number, isSingle: boolean) => {
    if (submitted) return;

    setAnswers((prev) => {
      if (isSingle) {
        return { ...prev, [questionId]: [optionId] };
      } else {
        const current = prev[questionId] || [];
        const isSelected = current.includes(optionId);
        return {
          ...prev,
          [questionId]: isSelected
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let totalScore = 0;
    quiz.questions.forEach((question) => {
      const userAnswers = answers[question.id] || [];
      const correctOptions = question.options.filter((opt) => opt.is_correct).map((opt) => opt.id);
      
      // Check if answer is correct
      const isCorrect =
        userAnswers.length === correctOptions.length &&
        userAnswers.every((ans) => correctOptions.includes(ans));

      if (isCorrect) {
        totalScore += question.points;
      }
    });

    setScore((totalScore / quiz.total_points) * 100);
    setSubmitted(true);
    setCurrentQuestionIndex(0);
  };

  if (!isStarted) {
    return (
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg border-2 border-indigo-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-xl text-gray-900 mb-2">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-gray-700 mb-4">{quiz.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-2xl font-bold text-brandPurple-600">{quiz.questions_count}</div>
            <div className="text-xs text-gray-600">Câu hỏi</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{quiz.passing_score}%</div>
            <div className="text-xs text-gray-600">Điểm đạt</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{quiz.total_points}</div>
            <div className="text-xs text-gray-600">Tổng điểm</div>
          </div>
          {quiz.time_limit_minutes && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{quiz.time_limit_minutes}</div>
              <div className="text-xs text-gray-600">Phút</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsStarted(true)}
          className="w-full py-3 px-6 bg-brandPurple-600 hover:bg-brandPurple-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Bắt đầu làm bài
        </button>
      </div>
    );
  }

  if (submitted) {
    const passed = score >= quiz.passing_score;

    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="text-center mb-6">
          {passed ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
          </h3>
          <div className="text-5xl font-bold text-brandPurple-600 mb-2">
            {score.toFixed(0)}%
          </div>
          <p className="text-gray-600">
            Điểm yêu cầu: {quiz.passing_score}%
          </p>
        </div>

        {/* Review Answers */}
        <div className="space-y-4 mb-6">
          {quiz.questions.map((question, idx) => {
            const userAnswers = answers[question.id] || [];
            const correctOptions = question.options.filter((opt) => opt.is_correct).map((opt) => opt.id);
            const isCorrect =
              userAnswers.length === correctOptions.length &&
              userAnswers.every((ans) => correctOptions.includes(ans));

            return (
              <div key={question.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <p className="font-medium text-gray-900">
                    Câu {idx + 1}: {question.question_text}
                  </p>
                </div>
                {question.explanation && (
                  <p className="text-sm text-gray-700 ml-7 mt-2 italic">
                    💡 {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setIsStarted(false);
            setSubmitted(false);
            setAnswers({});
            setCurrentQuestionIndex(0);
          }}
          className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
        >
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Câu {currentQuestionIndex + 1} / {quiz.questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {currentQuestion.points} điểm
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brandPurple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-brandPurple-600 mt-1" />
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {currentQuestion.question_text}
            </p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {currentQuestion.question_type_display}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
            const isSingle = currentQuestion.question_type === 'single';

            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id, isSingle)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-brandPurple-500 bg-brandPurple-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-brandPurple-600 bg-brandPurple-600'
                        : 'border-gray-400'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-gray-800">{option.option_text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Trước
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau →
        </button>
        <button
          onClick={handleSubmit}
          className="ml-auto px-6 py-2 bg-brandPurple-600 hover:bg-brandPurple-700 text-white font-semibold rounded-lg transition-colors"
        >
          Nộp bài
        </button>
      </div>
    </div>
  );
}

export default function QuizzesSection({ quizzes }: QuizzesSectionProps) {
  if (!quizzes || quizzes.length === 0) return null;

  // Only show published quizzes
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published');
  if (publishedQuizzes.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <ClipboardCheck className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bài kiểm tra</h2>
          <p className="text-sm text-gray-600">
            {publishedQuizzes.length} bài kiểm tra để đánh giá hiểu biết
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {publishedQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </section>
  );
}
