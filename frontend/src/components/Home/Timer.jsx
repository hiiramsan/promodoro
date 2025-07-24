import { useState, useEffect, useRef } from "react";
import { useSounds } from "../../assets/context/SoundProvider";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Timer = () => {

    const { start, pause, pop, ring } = useSounds();

    const TIMER_STATES = {
        FOCUS: 'focus',
        SHORT_BREAK: 'short_break',
        LONG_BREAK: 'long_break'
    };

    const { user } = useAuth();
    const [currentState, setCurrentState] = useState(TIMER_STATES.FOCUS);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Default fallback
    const [isActive, setIsActive] = useState(false);
    const [focusSessions, setFocusSessions] = useState(0);
    const [sessionsUntilLongBreak] = useState(4);
    const [isExpanded, setIsExpanded] = useState(false);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);
    const animationFrameRef = useRef(null);
    const backgroundIntervalRef = useRef(null);
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [userPreferences, setUserPreferences] = useState(null);
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);


    const fetchUserPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token || !user ) {
                setUserPreferences({
                    focusTime: 25 * 60,
                    shortBreakTime: 5 * 60,
                    longBreakTime: 15 * 60
                });
                setPreferencesLoaded(true);
                return;
            }
            const response = await axios.get(`${apiBase}/api/auth/preferences`, 
                { headers: {Authorization: `Bearer ${token}`} }
            )
            console.log('Fetched preferences:', response.data);
            setUserPreferences(response.data);
            setPreferencesLoaded(true);
        } catch (error) {
            console.log('Error!!! while fetching preferences, using defaults:', error);
            setUserPreferences({
                focusTime: 25 * 60,
                shortBreakTime: 5 * 60,
                longBreakTime: 15 * 60
            });
            setPreferencesLoaded(true);
        }
    }

    useEffect(() => {
        fetchUserPreferences();
    }, [user])

    useEffect(() => {
        if (preferencesLoaded && userPreferences && !isActive) {
            console.log('Setting timeLeft with preferences:', userPreferences);
            setTimeLeft(getStateDuration(currentState));
        }
    }, [preferencesLoaded, userPreferences, currentState])

    const getStateDuration = (state) => {
        if (!preferencesLoaded || !userPreferences) {
            switch (state) {
                case TIMER_STATES.FOCUS:
                    return 25 * 60;
                case TIMER_STATES.SHORT_BREAK:
                    return 5 * 60;
                case TIMER_STATES.LONG_BREAK:
                    return 15 * 60;
                default:
                    return 25 * 60;
            }
        }

        // Use loaded preferences
        switch (state) {
            case TIMER_STATES.FOCUS:
                return userPreferences.focusTime || 25 * 60;
            case TIMER_STATES.SHORT_BREAK:
                return userPreferences.shortBreakTime || 5 * 60;
            case TIMER_STATES.LONG_BREAK:
                return userPreferences.longBreakTime || 15 * 60;
            default:
                return 25 * 60;
        }
    };

    const getNextState = () => {
        ring();
        if (currentState === TIMER_STATES.FOCUS) {
            const nextFocusSessions = focusSessions + 1;
            if (nextFocusSessions % sessionsUntilLongBreak === 0) {
                return TIMER_STATES.LONG_BREAK;
            } else {
                return TIMER_STATES.SHORT_BREAK;
            }
        } else {
            return TIMER_STATES.FOCUS;
        }
    };

    const switchToState = (newState) => {
        pop();
        setIsActive(false);
        setCurrentState(newState);
        setTimeLeft(getStateDuration(newState));
        localStorage.removeItem('pomodoroStart');
        localStorage.removeItem('pomodoroTimeLeft');
        localStorage.removeItem('pomodoroState');
        startTimeRef.current = null;

        // Clear all timers
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (backgroundIntervalRef.current) {
            clearInterval(backgroundIntervalRef.current);
        }
    };

    const skipToNext = (isAutomatic = false) => {
        const nextState = getNextState();
        if (currentState === TIMER_STATES.FOCUS) {
            setFocusSessions(prev => prev + 1);
        }

        const newDuration = getStateDuration(nextState);

        // Clear all timers first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (backgroundIntervalRef.current) {
            clearInterval(backgroundIntervalRef.current);
        }

        // Update state
        setCurrentState(nextState);
        setTimeLeft(newDuration);
        setIsActive(isAutomatic);

        // Clear localStorage
        localStorage.removeItem('pomodoroStart');
        localStorage.removeItem('pomodoroTimeLeft');
        localStorage.removeItem('pomodoroState');

        // Reset start time reference
        startTimeRef.current = null;

        // If automatically moving to next state, start the timer immediately
        if (isAutomatic) {
            // Set start time to now since we're starting with full duration
            startTimeRef.current = Date.now();

            // Set up timers with the new state
            setupTimersForState(nextState);
        }
    };

    const calculateTimeLeft = (forState = null) => {
        const stateToUse = forState || currentState;
        if (!startTimeRef.current) return getStateDuration(stateToUse);

        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        const duration = getStateDuration(stateToUse);
        return Math.max(0, duration - elapsed);
    };

    const setupTimersForState = (forState = null) => {
        const stateToUse = forState || currentState;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (backgroundIntervalRef.current) {
            clearInterval(backgroundIntervalRef.current);
        }

        // Animation frame for smooth UI updates (works when tab is active)
        const updateTimerFrame = () => {
            if (!isActive) return;

            const newTimeLeft = calculateTimeLeft(stateToUse);
            setTimeLeft(newTimeLeft);

            if (newTimeLeft === 0) {
                skipToNext(true);
                return;
            }

            animationFrameRef.current = requestAnimationFrame(updateTimerFrame);
        };

        // Background interval for when tab is inactive (every 200ms for better precision)
        const updateTimerInterval = () => {
            if (!isActive) return;

            const newTimeLeft = calculateTimeLeft(stateToUse);
            setTimeLeft(newTimeLeft);

            if (newTimeLeft === 0) {
                skipToNext(true);
                return;
            }
        };

        // Start both timers
        animationFrameRef.current = requestAnimationFrame(updateTimerFrame);
        backgroundIntervalRef.current = setInterval(updateTimerInterval, 200);
    };

    const setupTimers = () => {
        setupTimersForState(currentState);
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab became inactive - rely on background interval
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            } else {
                // Tab became active - restart animation frame
                if (isActive) {
                    const updateTimerFrame = () => {
                        if (!isActive) return;

                        const newTimeLeft = calculateTimeLeft();
                        setTimeLeft(newTimeLeft);

                        if (newTimeLeft === 0) {
                            skipToNext(true);
                            return;
                        }

                        animationFrameRef.current = requestAnimationFrame(updateTimerFrame);
                    };
                    animationFrameRef.current = requestAnimationFrame(updateTimerFrame);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive, currentState]);

    useEffect(() => {
        if (isActive) {
            if (!startTimeRef.current) {
                const duration = getStateDuration(currentState);
                startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
            }
            setupTimers();
        } else {
            // Clear all timers when not active
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (backgroundIntervalRef.current) {
                clearInterval(backgroundIntervalRef.current);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (backgroundIntervalRef.current) {
                clearInterval(backgroundIntervalRef.current);
            }
        };
    }, [isActive]);

    useEffect(() => {
        if (isActive && startTimeRef.current) {
            localStorage.setItem('pomodoroStart', startTimeRef.current.toString());
            localStorage.setItem('pomodoroState', currentState);
            localStorage.setItem('pomodoroActive', 'true');
        } else {
            localStorage.removeItem('pomodoroActive');
        }
    }, [isActive, currentState]);

    useEffect(() => {
        const restoreTimerState = () => {
            const savedStart = localStorage.getItem('pomodoroStart');
            const savedState = localStorage.getItem('pomodoroState');
            const wasActive = localStorage.getItem('pomodoroActive') === 'true';

            if (savedStart && savedState && wasActive) {
                const now = Date.now();
                const savedStartTime = parseInt(savedStart);
                const elapsed = Math.floor((now - savedStartTime) / 1000);
                const duration = getStateDuration(savedState);
                const calculatedTimeLeft = Math.max(0, duration - elapsed);

                if (calculatedTimeLeft > 0) {
                    setCurrentState(savedState);
                    setTimeLeft(calculatedTimeLeft);
                    startTimeRef.current = savedStartTime;
                    setIsActive(true); // Resume the timer
                } else {
                    // Timer expired while away
                    localStorage.removeItem('pomodoroStart');
                    localStorage.removeItem('pomodoroState');
                    localStorage.removeItem('pomodoroActive');

                    // Determine what state we should be in and play sound
                    const sessionsPassedWhileAway = Math.floor(elapsed / (25 * 60)); // Rough estimate
                    ring(); // Play completion sound

                    // Reset to default state
                    setCurrentState(TIMER_STATES.FOCUS);
                    setTimeLeft(getStateDuration(TIMER_STATES.FOCUS));
                }
            } else {
                const duration = getStateDuration(currentState);
                setTimeLeft(duration);
            }
        };

        restoreTimerState();

        // Also restore state when page regains focus
        const handleFocus = () => {
            restoreTimerState();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const toggleTimer = () => {
        if (!isActive) {
            if (!startTimeRef.current) {
                const duration = getStateDuration(currentState);
                startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
            }
            start();
        } else {
            pause();
        }
        setIsActive(!isActive);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const totalTime = getStateDuration(currentState);
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    const getStateColor = (state) => {
        switch (state) {
            case TIMER_STATES.FOCUS:
                return '#3B82F6';
            case TIMER_STATES.SHORT_BREAK:
                return '#10B981';
            case TIMER_STATES.LONG_BREAK:
                return '#8B5CF6';
            default:
                return '#3B82F6';
        }
    };

    const getStateLabel = (state) => {
        switch (state) {
            case TIMER_STATES.FOCUS:
                return 'Focus';
            case TIMER_STATES.SHORT_BREAK:
                return 'Short Break';
            case TIMER_STATES.LONG_BREAK:
                return 'Long Break';
            default:
                return 'Focus';
        }
    };

    useEffect(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        let state = "";

        switch (currentState) {
            case "focus":
                state = "Focus";
                break;
            case "short_break":
                state = "Short Break";
                break;
            case "long_break":
                state = "Long Break";
                break;
        }

        document.title = `${state} - ${minutes}:${seconds.toString().padStart(2, '0')}`
    }, [timeLeft, currentState]);

    return (
        <>
            {isExpanded && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"></div>
            )}            <div className={`backdrop-blur-md border border-white/20 rounded-2xl shadow-lg flex flex-col items-center transition-all duration-300 ${isExpanded
                ? 'fixed inset-4 z-50 justify-start bg-white/5 backdrop-blur-lg border-white/25 shadow-xl p-4 sm:p-6 max-h-screen overflow-y-auto'
                : 'min-h-[400px] justify-center bg-white/10 p-6 w-full'
                }`}>
                <div className="flex justify-between items-center w-full mb-6">
                    <h2 className={`font-inter-bold ${isExpanded ? 'text-xl text-white' : 'text-xl'}`}>Timer</h2>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-1.5 rounded-lg bg-transparent transition-all duration-200 cursor-pointer ${isExpanded ? 'hover:bg-white/15 text-white' : 'hover:bg-white/10 text-white'}`}
                        title={isExpanded ? "Exit fullscreen" : "Expand to fullscreen"}
                    >
                        {isExpanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize-icon lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize-icon lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                        )}
                    </button>
                </div>

                {!preferencesLoaded ? (
                    <div className="flex flex-col items-center justify-center flex-1">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50 mb-4"></div>
                        <p className="text-white/60">Loading preferences...</p>
                    </div>
                ) : (
                    <>
                        <div className={`flex w-full mb-6 rounded-xl p-1 gap-1 ${isExpanded ? 'bg-white/8' : 'bg-white/5'}`}>
                    {Object.values(TIMER_STATES).map((state) => (
                        <button
                            key={state}
                            onClick={() => switchToState(state)}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${currentState === state
                                ? (isExpanded ? 'bg-white/25 text-white shadow-sm' : 'bg-white/20 text-white shadow-sm')
                                : (isExpanded ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-white/60 hover:text-white/80 hover:bg-white/10')
                                }`}
                        >
                            {getStateLabel(state)}
                        </button>
                    ))}
                </div>
                <div className={`relative mb-6 flex-shrink-0 ${isExpanded ? 'w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80' : 'w-52 h-52'}`}>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                            fill="none"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke={getStateColor(currentState)}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`font-mono font-inter mb-1 ${isExpanded ? 'text-5xl sm:text-6xl lg:text-7xl' : 'text-4xl'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className={`text-white/60 ${isExpanded ? 'text-base sm:text-lg' : 'text-sm'}`}>
                                {currentState === TIMER_STATES.FOCUS ? 'Stay focused' : 'Take a break'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative flex justify-center mb-4">
                    <button
                        onClick={toggleTimer}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${isExpanded
                            ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            }`}
                    >
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                    <button
                        onClick={skipToNext}
                        className={`ml-3 p-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${isExpanded
                            ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            }`}
                        title="Skip to next session"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-white/60">Until long break:</span>
                    <div className="flex space-x-1">
                        {[...Array(sessionsUntilLongBreak)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < (focusSessions % sessionsUntilLongBreak)
                                    ? 'bg-blue-500'
                                    : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-blue-400 ml-2">
                        {sessionsUntilLongBreak - (focusSessions % sessionsUntilLongBreak)} left
                    </span>
                </div>

                    </>
                )}
            </div>
        </>
    );
}

export default Timer;