import React from 'react';

const OfflineBanner: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50 text-sm font-semibold animate-fade-in">
      You are currently offline. Showing cached content.
    </div>
  );
};

export default OfflineBanner;
