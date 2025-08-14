import { Spinner } from '@heroui/react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-default-500">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;