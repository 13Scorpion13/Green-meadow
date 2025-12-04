// components/ProgressBar.tsx
import React from 'react';
import { MediaItem } from '@/types/index';

interface MediaCarouselProps {
  media: MediaItem[];
  autoPlay?: boolean;
  interval?: number;
  height?: string | number;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i + 1 === currentStep
                ? 'bg-blue-500 text-white'
                : i + 1 < currentStep
                ? 'bg-gray-400 text-black'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="h-1 bg-gray-700 rounded">
        <div
          className="h-full bg-blue-500 rounded"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;