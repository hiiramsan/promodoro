import { useState, useEffect, useRef } from "react";

const Timer = () => {
    // Timer states
    const TIMER_STATES = {
        FOCUS: 'focus',
        SHORT_BREAK: 'short_break',
        LONG_BREAK: 'long_break'
    };    // Pomodoro timer state
    const [currentState, setCurrentState] = useState(TIMER_STATES.FOCUS);
    const [timeLeft, setTimeLeft] = useState(25);
    const [isActive, setIsActive] = useState(false);
    const [focusSessions, setFocusSessions] = useState(0);
    const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
    const [isExpanded, setIsExpanded] = useState(false);
    const intervalRef = useRef(null);

    const getStateDuration = (state) => {
        switch (state) {
            case TIMER_STATES.FOCUS:
                return 25;
            case TIMER_STATES.SHORT_BREAK:
                return 5;
            case TIMER_STATES.LONG_BREAK:
                return 15;
            default:
                return 25;
        }
    };

    // Get next state in the cycle
    const getNextState = () => {
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

    // Switch to a specific state
    const switchToState = (newState) => {
        setIsActive(false);
        setCurrentState(newState);
        setTimeLeft(getStateDuration(newState));
        clearInterval(intervalRef.current);
    };    // Skip to next state
    const skipToNext = (isAutomatic = false) => {
        const nextState = getNextState();

        // Update focus sessions count if completing a focus session
        if (currentState === TIMER_STATES.FOCUS) {
            setFocusSessions(prev => prev + 1);
        }

        // Switch to new state
        setCurrentState(nextState);
        setTimeLeft(getStateDuration(nextState));
        clearInterval(intervalRef.current);

        // If it's an automatic transition, keep the timer running
        if (isAutomatic) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    };// Timer effect
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished, automatically skip to next and keep running
            skipToNext(true);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
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
                return '#3B82F6'; // Blue
            case TIMER_STATES.SHORT_BREAK:
                return '#10B981'; // Green
            case TIMER_STATES.LONG_BREAK:
                return '#8B5CF6'; // Purple
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
    };    return (        <>
            {/* Subtle backdrop overlay when expanded */}
            {isExpanded && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"></div>
            )}
            
            <div className={`backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 flex flex-col items-center transition-all duration-300 ${isExpanded
                    ? 'fixed inset-x-4 top-4 bottom-4 z-50 w-auto h-auto justify-start bg-white/5 backdrop-blur-lg border-white/25 shadow-xl'
                    : 'w-1/2 min-h-[400px] justify-center bg-white/10'
                }`}>            {/* Header with title and expand button */}
            <div className="flex justify-between items-center w-full mb-6">
                <h2 className={`font-inter-bold ${isExpanded ? 'text-xl text-white' : 'text-xl'}`}>Timer</h2>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-1.5 rounded-lg bg-transparent transition-all duration-200 cursor-pointer ${isExpanded ? 'hover:bg-white/15 text-white' : 'hover:bg-white/10 text-white'}`}
                    title={isExpanded ? "Exit fullscreen" : "Expand to fullscreen"}
                >
                    {isExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-icon lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-icon lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                    )}
                </button>
            </div>            <div className={`flex w-full mb-6 rounded-xl p-1 gap-1 ${isExpanded ? 'bg-white/8' : 'bg-white/5'}`}>
                {Object.values(TIMER_STATES).map((state) => (
                    <button
                        key={state}
                        onClick={() => switchToState(state)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${currentState === state
                            ? (isExpanded ? 'bg-white/25 text-white shadow-sm' : 'bg-white/20 text-white shadow-sm')
                            : (isExpanded ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-white/60 hover:text-white/80 hover:bg-white/10')
                            }`}
                    >
                        {getStateLabel(state)}
                    </button>
                ))}              
                </div>

        

            {/* Circular Progress Timer */}
            <div className={`relative mb-6 ${isExpanded ? 'w-80 h-80' : 'w-52 h-52'}`}>
                <svg className={`transform -rotate-90 ${isExpanded ? 'w-80 h-80' : 'w-52 h-52'}`} viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                        fill="none"
                    />
                    {/* Progress circle */}
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

                {/* Timer display */}
                <div className="absolute inset-0 flex items-center justify-center">                    <div className="text-center">
                    <div className={`font-mono font-inter mb-1 ${isExpanded ? 'text-7xl' : 'text-4xl'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <div className={`text-white/60 ${isExpanded ? 'text-lg' : 'text-sm'}`}>
                        {currentState === TIMER_STATES.FOCUS ? 'Stay focused' : 'Take a break'}
                    </div>
                </div>
                </div>
            </div>            {/* Control buttons */}
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

            {/* Session progress indicator */}
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
                    {sessionsUntilLongBreak - (focusSessions % sessionsUntilLongBreak)} left                </span>
            </div>
        </div>
        </>
    );
}

export default Timer;