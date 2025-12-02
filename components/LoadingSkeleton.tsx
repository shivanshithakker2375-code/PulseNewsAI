import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 p-0 h-full">
    <div className="h-48 bg-gray-200 animate-pulse"></div>
    <div className="p-5">
      <div className="flex gap-2 mb-4">
        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-6 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
      <div className="h-3 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
      <div className="h-3 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
      <div className="h-3 w-5/6 bg-gray-200 rounded mb-4 animate-pulse"></div>
      
      <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between">
         <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
         <div className="flex gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
         </div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-full">
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;