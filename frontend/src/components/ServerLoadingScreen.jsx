import React, { useState, useEffect } from 'react';
import Silk from './Silk';

const ServerLoadingScreen = ({ retryCount, error }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const messages = [
    "Our backend just took a nap, waking it up...",
    "This doesn't take too long, I hope...",
    "What is holding you from being happy?",
    "I should pay for a cloud server...",
    "Almost there! Just a few more seconds...",
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

        {/* Typing Message */}
        <div className="mb-4">
          <p className="text-xl text-white/90 font-inter h-8 drop-shadow-md">
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
