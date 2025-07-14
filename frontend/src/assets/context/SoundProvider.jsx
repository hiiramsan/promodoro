// context/SoundProvider.js
import { createContext, useContext, useEffect, useState } from 'react';
import useSound from 'use-sound';
import startSound from '../sounds/start.mp3';
import pauseSound from '../sounds/pause.mp3';
import popSound from '../sounds/pop.mp3';
import ringSound from '../sounds/ring.mp3';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [playStart] = useSound(startSound, { volume: 0.2 });
  const [playPause] = useSound(pauseSound, { volume: 0.2 });
  const [playPop] = useSound(popSound, { volume: 0.2 });
  const [playRing] = useSound(ringSound, { volume: 0.2 });
  const [audioPermission, setAudioPermission] = useState(false);

  // Request audio permission and enable background audio
  useEffect(() => {
    const requestAudioPermission = async () => {
      try {
        // Request notification permission for alerts
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
        }

        // Enable audio to work in background
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
        }
        
        setAudioPermission(true);
      } catch (error) {
        console.log('Audio permission error:', error);
      }
    };

    requestAudioPermission();
  }, []);

  const playRingWithNotification = () => {
    // Play sound
    playRing();
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Promodoro Timer', {
        body: 'Time\'s up! Take a break or start the next session.',
        icon: '/tabicon.png',
        badge: '/tabicon.png'
      });
    }
  };

  const sounds = {
    start: playStart,
    pause: playPause,
    pop: playPop,
    ring: playRingWithNotification
  };

  return (
    <SoundContext.Provider value={sounds}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSounds = () => useContext(SoundContext);
