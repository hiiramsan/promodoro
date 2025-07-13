import { useState, useEffect } from 'react';
import { createApiUrl } from '../utils/api';

export const useServerReady = () => {
  const [isServerReady, setIsServerReady] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkServer = async () => {
    try {
      const response = await fetch(createApiUrl('ping'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsServerReady(true);
        setError(null);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (err) {
      console.log('Server check failed:', err.message);
      setError(err.message);
      
      // Retry logic
      setRetryCount(prev => prev + 1);
      
      // Retry after 2 seconds, with exponential backoff (max 10 seconds)
      const retryDelay = Math.min(2000 * Math.pow(1.5, retryCount), 10000);
      setTimeout(() => {
        checkServer();
      }, retryDelay);
    }
  };

  useEffect(() => {
    checkServer();
  }, []);

  return { isServerReady, error, retryCount };
};
