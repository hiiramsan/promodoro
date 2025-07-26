import { useState, useEffect } from "react";
import axios from "axios";

const SettingsModal = ({
    isOpen,
    onClose,
    userPreferences,
    onPreferencesUpdate
}) => {
    const [tempPreferences, setTempPreferences] = useState({
        focusTime: Math.floor(userPreferences.focusTime / 60),
        shortBreakTime: Math.floor(userPreferences.shortBreakTime / 60),
        longBreakTime: Math.floor(userPreferences.longBreakTime / 60),
        sessionsUntilLongBreak: userPreferences.sessionsUntilLongBreak
    });

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const focusTime = tempPreferences.focusTime === '' ? 25 : parseInt(tempPreferences.focusTime);
            const shortBreakTime = tempPreferences.shortBreakTime === '' ? 5 : parseInt(tempPreferences.shortBreakTime);
            const longBreakTime = tempPreferences.longBreakTime === '' ? 15 : parseInt(tempPreferences.longBreakTime);
            const sessionsUntilLongBreak = tempPreferences.sessionsUntilLongBreak === '' ? 4 : tempPreferences.sessionsUntilLongBreak;

            const preferencesTransformed = {
                focusTime: Math.max(1, Math.min(120, focusTime)) * 60,
                shortBreakTime: Math.max(1, Math.min(30, shortBreakTime)) * 60,
                longBreakTime: Math.max(1, Math.min(60, longBreakTime)) * 60,
                sessionsUntilLongBreak: sessionsUntilLongBreak
            };

            const response = await axios.put(`${apiBase}/api/auth/preferences`,
                preferencesTransformed,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onPreferencesUpdate(response.data);
            onClose();
        } catch (error) {
            console.log('Error updating preferences:', error);
        }
    };

    const openModal = () => {
        setTempPreferences({
            focusTime: Math.floor(userPreferences.focusTime / 60),
            shortBreakTime: Math.floor(userPreferences.shortBreakTime / 60),
            longBreakTime: Math.floor(userPreferences.longBreakTime / 60),
            sessionsUntilLongBreak: userPreferences.sessionsUntilLongBreak

        });
    };

    useEffect(() => {
        if (isOpen) {
            openModal();
        }
    }, [isOpen, userPreferences]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Timer Settings</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2 text-center">
                                Focus
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={tempPreferences.focusTime}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        setTempPreferences(prev => ({ ...prev, focusTime: '' }));
                                    } else {
                                        const num = parseInt(value);
                                        if (num >= 1 && num <= 120) {
                                            setTempPreferences(prev => ({ ...prev, focusTime: num }));
                                        }
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                        setTempPreferences(prev => ({ ...prev, focusTime: 25 }));
                                    }
                                }}
                                placeholder="25"
                                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-center border border-white/20 focus:border-white/40 focus:outline-none"
                            />
                            <p className="text-xs text-white/50 text-center mt-1">min</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2 text-center">
                                Short Break
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={tempPreferences.shortBreakTime}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        setTempPreferences(prev => ({ ...prev, shortBreakTime: '' }));
                                    } else {
                                        const num = parseInt(value);
                                        if (num >= 1 && num <= 120) {
                                            setTempPreferences(prev => ({ ...prev, shortBreakTime: num }));
                                        }
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                        setTempPreferences(prev => ({ ...prev, shortBreakTime: 5 }));
                                    }
                                }}
                                placeholder="5"
                                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-center border border-white/20 focus:border-white/40 focus:outline-none"
                            />
                            <p className="text-xs text-white/50 text-center mt-1">min</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2 text-center">
                                Long Break
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={tempPreferences.longBreakTime}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        setTempPreferences(prev => ({ ...prev, longBreakTime: '' }));
                                    } else {
                                        const num = parseInt(value);
                                        if (num >= 1 && num <= 120) {
                                            setTempPreferences(prev => ({ ...prev, longBreakTime: num }));
                                        }
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                        setTempPreferences(prev => ({ ...prev, longBreakTime: 15 }));
                                    }
                                }}
                                placeholder="15"
                                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-center border border-white/20 focus:border-white/40 focus:outline-none"
                            />
                            <p className="text-xs text-white/50 text-center mt-1">min</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center content-center">
                        <label className="block text-sm font-medium text-white/80 mb-2 text-center">
                            Sessions Until Long Break
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="8"
                            value={tempPreferences.sessionsUntilLongBreak}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                    setTempPreferences(prev => ({ ...prev, sessionsUntilLongBreak: '' }));
                                } else {
                                    const num = parseInt(value);
                                    if (num >= 1 && num <= 8) {
                                        setTempPreferences(prev => ({ ...prev, sessionsUntilLongBreak: num }));
                                    }
                                }
                            }}
                            onBlur={(e) => {
                                if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                    setTempPreferences(prev => ({ ...prev, sessionsUntilLongBreak: 4 }));
                                }
                            }}
                            placeholder="4"
                            className="w-auto px-3 py-2 rounded-lg bg-white/10 text-white text-center border border-white/20 focus:border-white/40 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;
