import { useState } from "react";
import Silk from "../components/Silk";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

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
    const { register, googleLogin } = useAuth();

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
            if (error.response?.status === 400) {
                setErrors({ general: error.response.data.message || "Registration failed" });
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: "Failed to create account. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            await googleLogin(credentialResponse);
            navigate('/home');
        } catch (error) {
            console.error("Error with Google signup:", error);
            setErrors({ general: "Failed to sign up with Google. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error("Google signup failed");
        setErrors({ general: "Google signup failed. Please try again." });
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

                        {/* General Error Message */}
                        {errors.general && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-5">
                                <p className="text-red-400 text-sm text-center">{errors.general}</p>
                            </div>
                        )}

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
                        <div className="w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap={false}
                                theme="filled_blue"
                                size="large"
                                width="100%"
                                text="signup_with"
                            />
                        </div>                        {/* Login Link */}
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