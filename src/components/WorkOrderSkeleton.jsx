function WorkOrderSkeleton() {
  return (
    <div className="flex items-center px-6 py-2 border-b border-gray-700 animate-pulse">
      {/* ID Skeleton */}
      <div className="w-32 h-4 bg-gray-700 rounded"></div>
      
      {/* Priority Badge Skeleton */}
      <div className="w-24 ml-4">
        <div className="h-6 w-16 bg-gray-700 rounded"></div>
      </div>
      
      {/* Title & Description Skeleton */}
      <div className="flex-1 px-4 min-w-0">
        <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
      
      {/* Assignee Skeleton */}
      <div className="w-40 h-4 bg-gray-700 rounded"></div>
      
      {/* Department Skeleton */}
      <div className="w-32 h-4 bg-gray-700 rounded"></div>
      
      {/* Status Skeleton */}
      <div className="w-32 h-4 bg-gray-700 rounded"></div>
      
      {/* Date Skeleton */}
      <div className="w-32 h-4 bg-gray-700 rounded"></div>
    </div>
  );
}

export default WorkOrderSkeleton;
