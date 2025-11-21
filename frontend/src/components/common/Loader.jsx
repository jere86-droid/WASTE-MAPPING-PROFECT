import React from 'react';
const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const loader = (
    <div
      className={`${sizeClasses[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {loader}
      </div>
    );
  }

  return <div className="flex justify-center items-center p-4">{loader}</div>;
};

export default Loader;