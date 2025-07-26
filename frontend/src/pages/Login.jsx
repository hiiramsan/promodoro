import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import Navbar from "../components/Navbar";
import Silk from "../components/Silk";

const Login = () => {
    const { login, googleLogin } = useAuth();
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/home');
        } catch (error) {
            console.error("Error logging in:", error);
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

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            await googleLogin(credentialResponse);
            navigate('/home');
        } catch (error) {
            console.error("Error with Google login:", error);
            setErrors({ general: "Failed to login with Google. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error("Google login failed");
        setErrors({ general: "Google login failed. Please try again." });
    };

    const navigateToSignUp = () => {
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
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${errors.email ? 'border-red-500/50' : 'border-white/20'
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
                                    className={`w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border ${errors.password ? 'border-red-500/50' : 'border-white/20'
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
                                className={`w-full px-3 py-2 rounded-lg font-medium transition duration-200 cursor-pointer ${isLoading
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
                        <div className="w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap={false}
                                theme="filled_blue"
                                size="large"
                                width="100%"
                                text="continue_with"
                            />
                        </div>

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
