import React, { useEffect, useState } from 'react';
import clausewiseLogo from '@/assets/clausewise-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center z-50 animate-fade-out">
        <div className="text-center animate-scale-out">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-2xl shadow-2xl animate-pulse overflow-hidden">
              <img src={clausewiseLogo} alt="ClauseWise" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-out">
            ClauseWise
          </h1>
          <p className="text-blue-100 text-lg animate-fade-out">
            Your AI Financial Buddy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl shadow-2xl animate-bounce overflow-hidden">
            <img src={clausewiseLogo} alt="ClauseWise" className="w-full h-full object-cover" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
          ClauseWise
        </h1>
        <p className="text-blue-100 text-lg animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Your AI Financial Buddy
        </p>
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
