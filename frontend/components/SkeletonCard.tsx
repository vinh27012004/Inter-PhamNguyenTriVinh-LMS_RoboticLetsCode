/**
 * SkeletonCard Component
 * Loading placeholder cho CourseCard
 */

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="h-48 bg-gray-200"></div>

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

        {/* Description */}
        <div className="h-4 bg-gray-100 rounded mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6 mb-4"></div>

        {/* Stats */}
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-100 rounded w-20"></div>
          <div className="h-4 bg-gray-100 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}
