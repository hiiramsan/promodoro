import { useState, useEffect } from 'react';
import { createApiUrl } from '../utils/api';

export const useServerReady = () => {
  const [isServerReady, setIsServerReady] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkServer = async () => {
    try {
      const apiUrl = createApiUrl('ping');
      console.log('Checking server at:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Server response:', response.status, response.statusText);

      if (response.ok) {
        console.log('Server is ready!');
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
      console.log(`Retrying in ${retryDelay}ms (attempt ${retryCount + 1})`);
      setTimeout(() => {
        checkServer();
      }, retryDelay);
    }
  };

  useEffect(() => {
    // In development mode, skip the server check or make it much faster
    const isDevelopment = import.meta.env.MODE === 'development';
    
    if (isDevelopment) {
      // In development, assume server is ready after a short delay
      const timeout = setTimeout(() => {
        console.log('Development mode: skipping server check');
        setIsServerReady(true);
      }, 100);
      
      return () => clearTimeout(timeout);
    } else {
      // In production, do the actual server check
      checkServer();
    }
  }, []);

  return { isServerReady, error, retryCount };
};
