import React from 'react';

const ServerLoadingScreen = ({ retryCount, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
      <div className="text-center max-w-md px-6">
        {/* Logo or App Name */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Promodoro</h1>
          <p className="text-blue-200">Getting everything ready...</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4">
          <p className="text-lg text-blue-100">
            {error ? 'Connecting to server...' : 'Initializing application...'}
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-blue-300 mt-2">
              Attempt {retryCount + 1} - The server might be starting up
            </p>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-blue-300">
          <p>This may take a few moments if the server is starting up.</p>
          {retryCount > 5 && (
            <p className="mt-2 text-yellow-300">
              Taking longer than expected... Please wait a moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerLoadingScreen;
