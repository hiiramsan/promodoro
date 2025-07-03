// context/SoundProvider.js
import { createContext, useContext } from 'react';
import useSound from 'use-sound';
import startSound from '../sounds/start.mp3';
import pauseSound from '../sounds/pause.mp3';
import popSound from '../sounds/pop.mp3';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [playStart] = useSound(startSound, { volume: 0.4 });
  const [playPause] = useSound(pauseSound, { volume: 0.4 });
  const [playPop] = useSound(popSound, { volume: 0.4 });


  const sounds = {
    start: playStart,
    pause: playPause,
    pop: playPop
  };

  return (
    <SoundContext.Provider value={sounds}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSounds = () => useContext(SoundContext);
