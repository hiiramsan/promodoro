import React, { useState, useEffect } from 'react';
import Silk from './Silk';

const ServerLoadingScreen = ({ retryCount, error }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const messages = [
    "Our backend just took a nap — waking it up...",
    "Brewing some fresh server magic...",
    "Dusting off the database...",
    "Warming up the productivity engines...",
    "Almost there! Just a few more seconds...",
    "The server is doing its morning stretches...",
    "Loading your personalized workspace...",
    "Synchronizing with the cloud..."
  ];

  useEffect(() => {
    const currentMsg = messages[currentMessage];
    let charIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (charIndex < currentMsg.length) {
        setDisplayText(currentMsg.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Change message after 5 seconds
        setTimeout(() => {
          setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 5000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentMessage]);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Silk Background */}
      <div className="absolute inset-0">
        <Silk />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* App Name */}
        <h1 className="text-5xl font-bold text-white mb-12 drop-shadow-lg">
          Promodoro
        </h1>
        
        {/* Loading Bar */}
        <div className="mb-8">
          <div className="w-80 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Typing Message */}
        <div className="mb-4">
          <p className="text-xl text-white/90 font-medium h-8 drop-shadow-md">
            {displayText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>

        {/* Retry Info (only show if retrying) */}
        {retryCount > 0 && (
          <p className="text-sm text-white/70 mt-4">
            Attempt {retryCount + 1}
          </p>
        )}
      </div>
    </div>
  );
};

export default ServerLoadingScreen;
