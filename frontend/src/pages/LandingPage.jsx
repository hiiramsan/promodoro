import React, { memo } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import Silk from '../components/Silk';
import { Link } from 'react-router';

// Memoized components for better performance
const Navigation = memo(() => (
    <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center space-x-2">
            <span className="text-xl font-inter">promodoro</span>
        </div>

        <div className="flex items-center space-x-3">
            <Link to="/home" className="px-3 py-1.5 text-sm border border-gray-600 rounded-full hover:bg-gray-800 transition-colors font-inter cursor-pointer">
                Start
            </Link>
            <Link to={"/signup"} className="px-3 py-1.5 text-sm bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-full transition-all duration-200 font-inter border border-gray-700 cursor-pointer">
                Create account
            </Link>
        </div>
    </nav>
));

const HeroSection = memo(() => (
    <>
        {/* Beta Badge */}
        <div className="flex justify-center mt-0">
            <div className="flex items-center space-x-2 bg-slate-800/40 backdrop-blur border border-slate-700 rounded-full px-4 py-2">
                <span className="text-purple-400/80">✨</span>
                <span className="text-sm text-purple-200/80">Welcome to the beta version!</span>
            </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto px-6 mt-10">
            <h1 className="text-5xl lg:text-7xl font-inter leading-tight mb-8">
                Master Time. <br />
                Reclaim Your Mind. <br />
                Build the Life You Want.
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                It’s not just about getting things done. Our focus system helps you break free from distraction and build a life of intentional productivity
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <div className="relative inline-block">
                    <div className="animated-border-wrapper rounded-full p-[2px]">
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-black to-blue-900 hover:from-gray-900 hover:to-blue-800 rounded-full text-white font-medium transition-colors relative cursor-pointer z-10">
                            <span>Get started for free</span>
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex -space-x-4">
                        <a
                            href="https://github.com/edtarsz"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="edtarsz"
                        >
                            <img
                                src="https://avatars.githubusercontent.com/edtarsz"
                                alt="edtarsz"
                                className="w-10 h-10 rounded-full border-2 border-slate-900"
                            />
                        </a>
                        <a
                            href="https://github.com/777Styx"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="777Styx"
                        >
                            <img
                                src="https://avatars.githubusercontent.com/777Styx"
                                alt="777Styx"
                                className="w-10 h-10 rounded-full border-2 border-slate-900"
                            />
                        </a>
                        <a
                            href="https://github.com/hiiramsan"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="hiiramsan"
                        >
                            <img
                                src="https://avatars.githubusercontent.com/hiiramsan"
                                alt="hiiramsan"
                                className="w-10 h-10 rounded-full border-2 border-slate-900"
                            />
                        </a>
                    </div>
                    <div className="text-sm text-gray-400">
                        <div className="font-semibold text-white">Trusted by</div>
                        <div>me and a couple of friends</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col m-0">
                <p className='font-inter'>
                    Built with hate by 
                        <a href='https://hiramsanchez.vercel.app' target='_blank' className='underline font-inter'>
                             @hiiramsan
                        </a>
                    </p>
            </div>
        </div>    
        </>
));

const LandingPage = () => {
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

            {/* Gradient Overlays */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2 -z-10"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-15 -z-10"></div>            <div className="relative z-10">
                <Navigation />
                <HeroSection />
                {/* Bottom Spacing */}
                <div className="h-20"></div>
            </div>
        </div>
    );
};

// Set display names for debugging
Navigation.displayName = 'Navigation';
HeroSection.displayName = 'HeroSection';

export default memo(LandingPage);