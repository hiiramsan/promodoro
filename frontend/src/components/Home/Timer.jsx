import { useState, useEffect, useRef } from "react";
import { useSounds } from "../../assets/context/SoundProvider";
import { useAuth } from "../../context/AuthContext";
import SettingsModal from "./SettingsModal";
import axios from "axios";
import TaskModal from "./TaskModal";

const Timer = () => {
    const { start, pause, pop, ring } = useSounds();
    const { user } = useAuth();
    
    const TIMER_STATES = {
        FOCUS: 'focus',
        SHORT_BREAK: 'short_break',
        LONG_BREAK: 'long_break'
    };

    // Core state
    const [currentState, setCurrentState] = useState(TIMER_STATES.FOCUS);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [focusSessions, setFocusSessions] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Single timer reference
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const productiveStartTimeRef = useRef(null);
    
    // Settings and data
    const [userPreferences, setUserPreferences] = useState({
        focusTime: 25 * 60,
        shortBreakTime: 5 * 60,
        longBreakTime: 15 * 60,
        sessionsUntilLongBreak: 4
    });
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [userTasks, setUserTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Get duration for current state
    const getStateDuration = (state = currentState) => {
        switch (state) {
            case TIMER_STATES.FOCUS: return userPreferences.focusTime;
            case TIMER_STATES.SHORT_BREAK: return userPreferences.shortBreakTime;
            case TIMER_STATES.LONG_BREAK: return userPreferences.longBreakTime;
            default: return userPreferences.focusTime;
        }
    };

    // Clear all timers
    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Single timer function
    const startTimer = () => {
        clearTimer();
        
        timerRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimeRef.current) / 1000);
            const duration = getStateDuration();
            const remaining = Math.max(0, duration - elapsed);
            
            setTimeLeft(remaining);
            
            if (remaining === 0) {
                completeSession();
            }
        }, 100);
    };

    // Complete current session and move to next
    const completeSession = async () => {
        clearTimer();
        ring();
        
        await logProductiveTime('session_complete');
        
        let newFocusSessions = focusSessions;
        let nextState;
        
        if (currentState === TIMER_STATES.FOCUS) {
            newFocusSessions = focusSessions + 1;
            setFocusSessions(newFocusSessions);
            
            // Determine next break type
            const shouldBeLongBreak = newFocusSessions % userPreferences.sessionsUntilLongBreak === 0;
            nextState = shouldBeLongBreak ? TIMER_STATES.LONG_BREAK : TIMER_STATES.SHORT_BREAK;
        } else {
            nextState = TIMER_STATES.FOCUS;
        }
        
        // Transition to next state
        setCurrentState(nextState);
        setTimeLeft(getStateDuration(nextState));
        startTimeRef.current = Date.now();
        
        // Auto-start next session
        startTimer();
        
        // Start productive time tracking for focus sessions
        if (nextState === TIMER_STATES.FOCUS && selectedTask?.project) {
            productiveStartTimeRef.current = Date.now();
        }
        
        // Clear localStorage (will be set again by effect)
        localStorage.removeItem('pomodoroState');
    };

    // Manual state switch
    const switchToState = async (newState) => {
        clearTimer();
        pop();
        
        await logProductiveTime('manual_switch');
        
        setIsActive(false);
        setCurrentState(newState);
        setTimeLeft(getStateDuration(newState));
        startTimeRef.current = null;
        productiveStartTimeRef.current = null;
        
        localStorage.removeItem('pomodoroState');
    };

    // Skip to next session
    const skipToNext = async () => {
        if (!isActive) return;
        await completeSession();
    };

    // Toggle timer
    const toggleTimer = async () => {
        if (!isActive) {
            // Starting timer
            if (!startTimeRef.current) {
                const elapsed = getStateDuration() - timeLeft;
                startTimeRef.current = Date.now() - (elapsed * 1000);
            }
            
            if (currentState === TIMER_STATES.FOCUS && selectedTask?.project) {
                productiveStartTimeRef.current = Date.now();
            }
            
            startTimer();
            start();
        } else {
            // Pausing timer
            clearTimer();
            await logProductiveTime('pause');
            pause();
        }
        
        setIsActive(!isActive);
    };

    // Log productive time
    const logProductiveTime = async (context) => {
        if (currentState === TIMER_STATES.FOCUS && 
            selectedTask?.project && 
            productiveStartTimeRef.current) {
            
            const now = Date.now();
            const productiveTime = Math.floor((now - productiveStartTimeRef.current) / 1000);
            
            if (productiveTime >= 5) {
                try {
                    await logTimeToProject(productiveTime);
                    console.log(`Logged ${productiveTime}s [${context}]`);
                } catch (error) {
                    console.error(`Error logging time [${context}]:`, error);
                }
            }
            
            productiveStartTimeRef.current = null;
        }
    };

    // API functions (unchanged)
    const fetchUserPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) {
                setPreferencesLoaded(true);
                return;
            }

            const response = await axios.get(`${apiBase}/api/auth/preferences`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUserPreferences(response.data);
            if (!isActive) {
                setTimeLeft(response.data.focusTime || 25 * 60);
            }
        } catch (error) {
            console.log('Error fetching preferences:', error);
        } finally {
            setPreferencesLoaded(true);
        }
    };

    const fetchUserTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) return;

            const response = await axios.get(`${apiBase}/api/tasks`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserTasks(response.data);

            if (selectedTask) {
                const currentTask = response.data.find(task => task._id === selectedTask._id);
                if (!currentTask || currentTask.completed) {
                    await stopCurrentTask();
                } else {
                    setSelectedTask(currentTask);
                }
            }
        } catch (error) {
            console.log('Error fetching tasks:', error);
        }
    };

    const logTimeToProject = async (seconds) => {
        if (!selectedTask?.project?._id || !user || seconds <= 0) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.patch(`${apiBase}/api/projects/${selectedTask.project._id}/log-time`, {
                timeSpent: seconds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to log time to project:', error);
            throw error;
        }
    };

    const stopCurrentTask = async () => {
        await logProductiveTime('stop_task');
        setSelectedTask(null);
    };

    const handlePreferencesSubmit = async (newPreferences) => {
        setUserPreferences(newPreferences);
        
        clearTimer();
        setIsActive(false);
        startTimeRef.current = null;
        
        const newDuration = getStateDurationFromPreferences(currentState, newPreferences);
        setTimeLeft(newDuration);
        
        localStorage.removeItem('pomodoroState');
    };

    const getStateDurationFromPreferences = (state, preferences) => {
        switch (state) {
            case TIMER_STATES.FOCUS: return preferences.focusTime;
            case TIMER_STATES.SHORT_BREAK: return preferences.shortBreakTime;
            case TIMER_STATES.LONG_BREAK: return preferences.longBreakTime;
            default: return preferences.focusTime;
        }
    };

    // Effects
    useEffect(() => {
        fetchUserPreferences();
        fetchUserTasks();
    }, [user]);

    // State persistence
    useEffect(() => {
        if (isActive && startTimeRef.current) {
            const state = {
                currentState,
                startTime: startTimeRef.current,
                focusSessions
            };
            localStorage.setItem('pomodoroState', JSON.stringify(state));
        }
    }, [isActive, currentState, focusSessions]);

    // State restoration
    useEffect(() => {
        if (!preferencesLoaded) return;

        const savedState = localStorage.getItem('pomodoroState');
        if (savedState) {
            try {
                const { currentState: savedCurrentState, startTime, focusSessions: savedSessions } = JSON.parse(savedState);
                
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const duration = getStateDuration(savedCurrentState);
                const remaining = Math.max(0, duration - elapsed);
                
                if (remaining > 0) {
                    setCurrentState(savedCurrentState);
                    setFocusSessions(savedSessions);
                    setTimeLeft(remaining);
                    startTimeRef.current = startTime;
                    setIsActive(true);
                    startTimer();
                } else {
                    localStorage.removeItem('pomodoroState');
                    ring();
                }
            } catch (error) {
                localStorage.removeItem('pomodoroState');
            }
        }
    }, [preferencesLoaded]);

    // Cleanup
    useEffect(() => {
        return () => clearTimer();
    }, []);

    // Update title
    useEffect(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const stateLabel = getStateLabel(currentState);
        document.title = `${stateLabel} - ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeLeft, currentState]);

    // Utility functions
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const totalTime = getStateDuration();
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    const getStateColor = (state) => {
        switch (state) {
            case TIMER_STATES.FOCUS: return '#3B82F6';
            case TIMER_STATES.SHORT_BREAK: return '#10B981';
            case TIMER_STATES.LONG_BREAK: return '#8B5CF6';
            default: return '#3B82F6';
        }
    };

    const getStateLabel = (state) => {
        switch (state) {
            case TIMER_STATES.FOCUS: return 'Focus';
            case TIMER_STATES.SHORT_BREAK: return 'Short Break';
            case TIMER_STATES.LONG_BREAK: return 'Long Break';
            default: return 'Focus';
        }
    };

    return (
        <>
            {isExpanded && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"></div>
            )}
            
            <div className={`backdrop-blur-md border border-white/20 rounded-2xl shadow-lg flex flex-col items-center transition-all duration-300 ${isExpanded
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
                                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                                <circle
                                    cx="50" cy="50" r="45"
                                    stroke={getStateColor(currentState)}
                                    strokeWidth="3" fill="none" strokeLinecap="round"
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
                                {[...Array(userPreferences.sessionsUntilLongBreak || 4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full ${i < (focusSessions % (userPreferences.sessionsUntilLongBreak || 4))
                                            ? 'bg-blue-500'
                                            : 'bg-white/20'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-blue-400 ml-2">
                                {(userPreferences.sessionsUntilLongBreak || 4) - (focusSessions % (userPreferences.sessionsUntilLongBreak || 4))} left
                            </span>
                        </div>

                        {!isExpanded && (
                            <div className="w-full mt-6 pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => setShowPreferencesModal(true)}
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
                    await logProductiveTime('task_switch');
                    setSelectedTask(task);
                    
                    if (currentState === TIMER_STATES.FOCUS && isActive && task?.project) {
                        productiveStartTimeRef.current = Date.now();
                    }
                }}
            />
        </>
    );
};

export default Timer;