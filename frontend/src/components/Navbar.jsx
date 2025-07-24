import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const settingsMenuRef = useRef(null);
    const settingsButtonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                settingsMenuRef.current &&
                !settingsMenuRef.current.contains(event.target) &&
                !settingsButtonRef.current.contains(event.target)
            ) {
                setIsAnimating(true);
                setTimeout(() => {
                    setIsSettingsOpen(false);
                    setIsAnimating(false);
                }, 200);
            }
        };

        if (isSettingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSettingsOpen]); const handleSettingsClick = () => {
        if (isSettingsOpen) {
            setIsAnimating(true);
            setTimeout(() => {
                setIsSettingsOpen(false);
                setIsAnimating(false);
            }, 200);
        } else {
            setIsSettingsOpen(true);
        }
    };

    const handleCloseMenu = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsSettingsOpen(false);
            setIsAnimating(false);
        }, 200);    
    };    const handleLogout = () => {
        logout();
        navigate('/');
        setIsAnimating(true);
        setTimeout(() => {
            setIsSettingsOpen(false);
            setIsAnimating(false);
        }, 200);
    };

    return (
        <nav className="flex items-center justify-between px-6 lg:px-12 py-6 relative">
            <a className="flex items-center space-x-2" href='/'>
                <span className="text-xl font-inter">promodoro</span>
            </a>
            <div className="flex items-center space-x-3 relative">                <button
                ref={settingsButtonRef}
                onClick={handleSettingsClick}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-full transition-all duration-200 font-inter border border-gray-700 cursor-pointer"
            >
                Menu
            </button>
                {/* Floating Settings Menu */}
                {isSettingsOpen && (
                    <div
                        ref={settingsMenuRef}
                        className={`absolute top-12 right-0 bg-gray-900/80 backdrop-blur-md border border-gray-600/50 rounded-lg shadow-2xl p-6 min-w-80 z-50 transition-all duration-200 ease-out transform origin-top-right ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                            }`}
                    >{/* Close Button */}
                        <div className="flex justify-end mb-3">
                            <button
                                onClick={handleCloseMenu}
                                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center cursor-pointer"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="text-gray-300"
                                >
                                    <path
                                        d="M12 4L4 12M4 4L12 12"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* User Info */}
                        {user && (
                            <div className="mb-4 pb-4 border-b border-gray-700">
                                <div className="text-white font-medium mb-1">
                                    {user.username || 'Username'}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {user.email || 'user@example.com'}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200 font-inter text-white cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

