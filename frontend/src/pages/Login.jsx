import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Silk from "../components/Silk";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);    
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
        // Clear general error when user starts typing
        if (errors.general) {
            setErrors(prev => ({
                ...prev,
                general: ""
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

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        
        try {
            await login(formData.email, formData.password);
            // Navigate to home page after successful login
            navigate('/home');
        } catch (error) {
            console.error("Error logging in:", error);
            // Set error message based on response
            if (error.response?.status === 400) {
                setErrors({ general: "Invalid email or password" });
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: "Failed to login. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Here you would integrate with Google OAuth
        console.log("Login with Google");
        alert("Google login integration would be implemented here");
    };    const navigateToSignUp = () => {
        navigate('/signup');
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
                    <div className="max-w-md mx-auto mt-10">                        <h1 className="font-inter text-3xl text-center mb-8">Welcome back</h1>
                        
                        {/* General Error Message */}
                        {errors.general && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-5">
                                <p className="text-red-400 text-sm text-center">{errors.general}</p>
                            </div>
                        )}
                        
                        {/* Login Form */}
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
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${
                                        errors.email ? 'border-red-500/50' : 'border-white/20'
                                    } focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition duration-200 placeholder-white/60 text-white`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${
                                        errors.password ? 'border-red-500/50' : 'border-white/20'
                                    } focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition duration-200 placeholder-white/60 text-white`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <a
                                    href="#"
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-200"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-3 py-2 rounded-lg font-medium transition duration-200 cursor-pointer ${
                                    isLoading
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-white text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900'
                                }`}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-600"></div>
                            <span className="px-4 text-gray-400 text-sm">OR</span>
                            <div className="flex-1 border-t border-gray-600"></div>
                        </div>

                        {/* Google Login Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-white text-gray-900 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        {/* Sign Up Link */}
                        <p className="text-center text-gray-400 text-sm mt-6">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={navigateToSignUp}
                                className="text-blue-400 hover:text-blue-300 font-medium transition duration-200 underline cursor-pointer"
                            >
                                Create one here
                            </button>
                        </p>
                    </div>
                </div>
                <div className="h-20"></div>
            </div>
        </div>
    );
}

export default Login;
