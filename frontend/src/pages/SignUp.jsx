import { useState } from "react";
import Silk from "../components/Silk";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Username validation
        if (!formData.username) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters long";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await register(formData.email, formData.username, formData.password);
            navigate('/home')
        } catch (error) {
            console.error("Error creating account:", error);
        } finally {
            setIsLoading(false);
        }
    }; const handleGoogleSignUp = () => {
        // Here oAuth shit
        console.log("Sign up with Google");
        alert("Google sign-up integration would be implemented here");
    };

    const navigateToLogin = () => {
        window.location.href = '/login';

    };

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <Silk
                    speed={5}
                    scale={1}
                    color="#293132"
                    noiseIntensity={1.5}
                    rotation={0}
                />
            </div>
            <div className="relative z-10">
                <div className="container mx-auto px-6 lg:px-12 py-4">
                    <div className="max-w-md mx-auto mt-10">
                        <h1 className="font-inter text-3xl text-center mb-8">Create an account</h1>

                        {/* Sign Up Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${errors.email ? 'border-red-500/50' : 'border-white/20'
                                        } focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition duration-200 placeholder-white/60 text-white`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${errors.username ? 'border-red-500/50' : 'border-white/20'
                                        } focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition duration-200 placeholder-white/60 text-white`}
                                    placeholder="Choose a username"
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${errors.password ? 'border-red-500/50' : 'border-white/20'
                                        } focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition duration-200 placeholder-white/60 text-white`}
                                    placeholder="Create a password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'
                                        } focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition duration-200 placeholder-white/60 text-white`}
                                    placeholder="Confirm your password"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-3 py-2 rounded-lg font-medium transition duration-200 cursor-pointer ${isLoading
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-white text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900'
                                    }`}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-600"></div>
                            <span className="px-4 text-gray-400 text-sm">OR</span>
                            <div className="flex-1 border-t border-gray-600"></div>
                        </div>

                        {/* Google Sign Up Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-white text-gray-900 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>                        {/* Login Link */}
                        <p className="text-center text-gray-400 text-sm mt-6">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={navigateToLogin}
                                className="text-blue-400 hover:text-blue-300 font-medium transition duration-200 underline cursor-pointer"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>
                </div>
                <div className="h-20"></div>
            </div>
        </div>
    );
}

export default SignUp;