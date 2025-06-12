import React, { useState } from 'react';
import Silk from '../components/Silk';

const initialTasks = [
    {
        id: 1,
        name: "Write project proposal",
        completed: false,
        tags: ["Work", "Docs"]
    },
    {
        id: 2,
        name: "Read React docs",
        completed: true,
        tags: ["Learning"]
    },
    {
        id: 3,
        name: "Grocery shopping",
        completed: false,
        tags: ["Personal"]
    }
];

const Home = () => {
    const [tasks, setTasks] = useState(initialTasks);

    const toggleTask = (id) => {
        setTasks(tasks =>
            tasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    return (
        <div className="min-h-screen text-white relative overflow-hidden">            {/* Silk Background */}
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
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-15 -z-10"></div>

            {/* Main Content */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
                    <a className="flex items-center space-x-2" href='/'>
                        <span className="text-xl font-inter">promodoro</span>
                    </a>
                    <div className="flex items-center space-x-3">
                        <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-full transition-all duration-200 font-inter border border-gray-700 cursor-pointer">
                            Settings
                        </button>
                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="container mx-auto px-6 lg:px-12 py-8">
                    <div className="text-center mb-12">
                        <h1 className="text-xl lg:text-3xl font-inter leading-tight mb-4">
                            What are you doing today?
                        </h1>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-1/2 max-w-2xl min-w-[350px]">
                            <h2 className="text-xl font-inter-bold mb-8">Tasks</h2>
                            <ul className="space-y-6">
                                {tasks.map(task => (
                                    <li key={task.id} className="flex flex-row items-center justify-between">
                                        <div className="flex flex-row items-center space-x-3 flex-1 min-w-0">
                                            <button
                                                className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                                    task.completed
                                                        ? "bg-green-500 border-green-500"
                                                        : "border-gray-400 bg-transparent"
                                                }`}
                                                aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                                onClick={() => toggleTask(task.id)}
                                            >
                                                {task.completed && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                            <span className={`font-inter text-base break-words ${task.completed ? "line-through text-gray-400" : ""}`}>
                                                {task.name}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                            {task.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-700/30 border border-blue-700/40 text-blue-200"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Timer */}
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-80 max-w-full">
                            <h2 className="text-lg font-semibold mb-2">Right Card</h2>
                            <p className="text-sm text-white/80">This is the right glassmorphism card.</p>

                        </div>
                    </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-20"></div>
            </div>
        </div>
    )
}

export default Home;