import { useState, useEffect, useRef } from "react";

const Timer = () => {
    // Timer states
    const TIMER_STATES = {
        FOCUS: 'focus',
        SHORT_BREAK: 'short_break',
        LONG_BREAK: 'long_break'
    };

    // Pomodoro timer state
    const [currentState, setCurrentState] = useState(TIMER_STATES.FOCUS);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [focusSessions, setFocusSessions] = useState(0);
    const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
    const intervalRef = useRef(null);

    // Get timer duration for each state
    const getStateDuration = (state) => {
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
    };

    // Skip to next state
    const skipToNext = () => {
        const nextState = getNextState();

        // Update focus sessions count if completing a focus session
        if (currentState === TIMER_STATES.FOCUS) {
            setFocusSessions(prev => prev + 1);
        }

        switchToState(nextState);
    };    // Timer effect
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished, automatically skip to next
            skipToNext();
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
    }; const toggleTask = (id) => {
        setTasks(tasks =>
            tasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );

    };
    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-1/2 flex flex-col items-center justify-center min-h-[500px]">            {/* State Tabs */}
            <div className="flex w-full mb-8 bg-white/5 rounded-xl p-1 gap-1">
                {Object.values(TIMER_STATES).map((state) => (
                    <button
                        key={state}
                        onClick={() => switchToState(state)}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${currentState === state
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                            }`}
                    >
                        {getStateLabel(state)}
                    </button>
                ))}
            </div>

            {/* Circular Progress Timer */}
            <div className="relative w-64 h-64 mb-8">
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
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
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-5xl font-mono font-inter mb-2">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-md text-white/60">
                            {currentState === TIMER_STATES.FOCUS ? 'Stay focused' : 'Take a break'}
                        </div>
                    </div>
                </div>
            </div>            {/* Control buttons */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={toggleTimer}
                    className="px-12 py-4 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white transition-all duration-200 cursor-pointer border border-white/20"
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={skipToNext}
                    className="p-4 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white transition-all duration-200 cursor-pointer border border-white/20"
                    title="Skip to next session"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                    {sessionsUntilLongBreak - (focusSessions % sessionsUntilLongBreak)} left
                </span>
            </div>
        </div>
    );
}

export default Timer;