import { useState, useEffect, useRef } from "react";
import { useSounds } from "../../assets/context/SoundProvider";
import { useAuth } from "../../context/AuthContext";
import SettingsModal from "./SettingsModal";
import axios from "axios";
import TaskModal from "./TaskModal";

const Timer = () => {

    const { start, pause, pop, ring } = useSounds();

    const TIMER_STATES = {
        FOCUS: 'focus',
        SHORT_BREAK: 'short_break',
        LONG_BREAK: 'long_break'
    };

    const { user } = useAuth();
    const [currentState, setCurrentState] = useState(TIMER_STATES.FOCUS);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [focusSessions, setFocusSessions] = useState(0);
    const [sessionsUntilLongBreak] = useState(4);
    const [isExpanded, setIsExpanded] = useState(false);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);
    const animationFrameRef = useRef(null);
    const backgroundIntervalRef = useRef(null);
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [userPreferences, setUserPreferences] = useState({
        focusTime: 25 * 60,
        shortBreakTime: 5 * 60,
        longBreakTime: 15 * 60
    });
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [userTasks, setUserTasks] = useState([]);
    const productiveStartTimeRef = useRef(null);
    const [showTaskModal, setShowTaskModal] = useState(false);



    const fetchUserPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) {
                console.log('No token or user, using defaults');
                setPreferencesLoaded(true);
                return;
            }

            const response = await axios.get(`${apiBase}/api/auth/preferences`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUserPreferences(response.data);

            // Update current timer if not active
            if (!isActive) {
                setTimeLeft(response.data.focusTime || 25 * 60);
            }

        } catch (error) {
            console.log('Error fetching preferences, using defaults:', error);
        } finally {
            setPreferencesLoaded(true);
        }
    }

    const fetchUserTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) return;

            const response = await axios.get(`${apiBase}/api/tasks`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserTasks(response.data);

            // Check if selected task still exists and is not completed
            if (selectedTask) {
                const currentTask = response.data.find(task => task._id === selectedTask._id);
                
                if (!currentTask || currentTask.completed) {
                    // Task was deleted or completed, stop working on it
                    await stopCurrentTask();
                } else {
                    // Update the selected task with latest data (in case project info changed)
                    setSelectedTask(currentTask);
                }
            }
        } catch (error) {
            console.log('Error fetching tasks:', error);
        }
    }

    const handlePreferencesSubmit = async (newPreferences) => {
        setUserPreferences(newPreferences);

        // Reset timer completely with new preferences
        const wasActive = isActive;

        // Stop the timer if it was running
        if (wasActive) {
            setIsActive(false);
        }

        // Clear all timers and references
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (backgroundIntervalRef.current) {
            clearInterval(backgroundIntervalRef.current);
        }

        localStorage.removeItem('pomodoroStart');
        localStorage.removeItem('pomodoroTimeLeft');
        localStorage.removeItem('pomodoroState');
        localStorage.removeItem('pomodoroActive');

        startTimeRef.current = null;

        const newDuration = getStateDurationFromPreferences(currentState, newPreferences);
        setTimeLeft(newDuration);

        if (wasActive) {
            setTimeout(() => {
                setIsActive(true);
            }, 100);
        }
    }

    const getStateDurationFromPreferences = (state, preferences) => {
        switch (state) {
            case TIMER_STATES.FOCUS:
                return preferences.focusTime || 25 * 60;
            case TIMER_STATES.SHORT_BREAK:
                return preferences.shortBreakTime || 5 * 60;
            case TIMER_STATES.LONG_BREAK:
                return preferences.longBreakTime || 15 * 60;
            default:
                return 25 * 60;
        }
    };

    const openPreferencesModal = () => {
        setShowPreferencesModal(true);
    }

    const stopCurrentTask = async () => {
        // Log any remaining productive time
        if (currentState === TIMER_STATES.FOCUS && selectedTask?.project && productiveStartTimeRef.current) {
            const now = Date.now();
            const productiveTime = Math.floor((now - productiveStartTimeRef.current) / 1000);
            await logTimeToProject(productiveTime);
        }
        
        setSelectedTask(null);
        productiveStartTimeRef.current = null;
    }

    useEffect(() => {
        fetchUserPreferences();
        fetchUserTasks();
    }, [user])

    useEffect(() => {
        const handleFocus = () => {
            if (user) {
                fetchUserTasks();
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden && user) {
                fetchUserTasks();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user])

    useEffect(() => {
        if (!selectedTask || !user) return;

        const checkTaskStatus = setInterval(() => {
            fetchUserTasks();
        }, 30000); 

        return () => clearInterval(checkTaskStatus);
    }, [selectedTask, user])

    const getStateDuration = (state) => {
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

    const skipToNext = async (isAutomatic = false) => {
        const nextState = getNextState();

        // Log productive time if we're finishing a focus session and have a selected task with project
        if (currentState === TIMER_STATES.FOCUS && selectedTask?.project && productiveStartTimeRef.current) {
            const now = Date.now();
            const productiveTime = Math.floor((now - productiveStartTimeRef.current) / 1000);
            await logTimeToProject(productiveTime);
            productiveStartTimeRef.current = null;
        }

        if (currentState === TIMER_STATES.FOCUS) {
            setFocusSessions(prev => prev + 1);
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (backgroundIntervalRef.current) {
            clearInterval(backgroundIntervalRef.current);
        }

        setCurrentState(nextState);
        setTimeLeft(getStateDuration(nextState));
        setIsActive(isAutomatic);

        localStorage.removeItem('pomodoroStart');
        localStorage.removeItem('pomodoroTimeLeft');
        localStorage.removeItem('pomodoroState');

        startTimeRef.current = null;

        if (isAutomatic) {
            startTimeRef.current = Date.now();
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
        if (!preferencesLoaded) return;

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
                    setIsActive(true);
                } else {
                    // Timer expired while away
                    localStorage.removeItem('pomodoroStart');
                    localStorage.removeItem('pomodoroState');
                    localStorage.removeItem('pomodoroActive');
                    ring();
                    setCurrentState(TIMER_STATES.FOCUS);
                    setTimeLeft(getStateDuration(TIMER_STATES.FOCUS));
                }
            }
            // Don't set timeLeft if no saved state - let preferences handle it
        };

        restoreTimerState();

        const handleFocus = () => {
            restoreTimerState();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [preferencesLoaded]);

    const toggleTimer = async () => {
        if (!isActive) {
            if (!startTimeRef.current) {
                const duration = getStateDuration(currentState);
                startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
            }
            
            // Start productive time tracking if we're in focus mode and have a task with project
            if (currentState === TIMER_STATES.FOCUS && selectedTask?.project) {
                productiveStartTimeRef.current = Date.now();
            }
            
            start();
        } else {
            // Log productive time when pausing during focus session
            if (currentState === TIMER_STATES.FOCUS && selectedTask?.project && productiveStartTimeRef.current) {
                const now = Date.now();
                const productiveTime = Math.floor((now - productiveStartTimeRef.current) / 1000);
                await logTimeToProject(productiveTime);
                productiveStartTimeRef.current = null;
            }
            
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

    const logTimeToProject = async (seconds) => {
        if (!selectedTask?.project?._id || !user) return;

        const token = localStorage.getItem('token');

        try {
            await axios.patch(`${apiBase}/api/projects/${selectedTask.project._id}/log-time`, {
                timeSpent: seconds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Logged ${seconds} to project`)
        } catch (error) {
            console.log('failed to add seconds to project, maybe bcuz of the id of the project lol!!!')
        }
    }

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

                        {!isExpanded && (
                            <div className="w-full mt-6 pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={openPreferencesModal}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-all duration-200 cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.807-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        Settings
                                    </button>

                                    <div className="flex-1 flex gap-2">
                                        <button
                                            onClick={() => setShowTaskModal(true)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm border border-white/20 text-left transition-all duration-200 cursor-pointer"
                                        >
                                            {selectedTask
                                                ? `Working on ${selectedTask.title}${selectedTask.project ? ` (${selectedTask.project.name})` : ''}`
                                                : "I'm currently working on..."}
                                        </button>
                                        
                                        {selectedTask && (
                                            <button
                                                onClick={stopCurrentTask}
                                                className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 text-sm border border-red-500/30 transition-all duration-200 cursor-pointer"
                                                title="Stop working on current task"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        )}

                    </>
                )}
            </div>

            <SettingsModal
                isOpen={showPreferencesModal}
                onClose={() => setShowPreferencesModal(false)}
                userPreferences={userPreferences}
                onPreferencesUpdate={handlePreferencesSubmit}
            />

            <TaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onSelect={async (task) => {
                    if (
                        currentState === TIMER_STATES.FOCUS &&
                        isActive &&
                        selectedTask?.project &&
                        productiveStartTimeRef.current
                    ) {
                        const now = Date.now();
                        const productiveTime = Math.floor((now - productiveStartTimeRef.current) / 1000);
                        await logTimeToProject(productiveTime);
                    }

                    setSelectedTask(task);
                    
                    // Start tracking for new task if we're in active focus mode
                    if (currentState === TIMER_STATES.FOCUS && isActive && task?.project) {
                        productiveStartTimeRef.current = Date.now();
                    } else {
                        productiveStartTimeRef.current = null;
                    }
                }}
            />

        </>
    );
}

export default Timer;