import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

export default function ProjectsSlider() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectColor, setNewProjectColor] = useState('#3b82f6');

    const predefinedColors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
        '#f97316', '#6366f1', '#14b8a6', '#eab308'
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:3000/api/projects', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const transformedProjects = response.data.map(project => ({
                    id: project._id,
                    name: project.name,
                    color: project.color,
                    createdAt: project.createdAt
                }));

                setProjects(transformedProjects);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user]);

    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(projects.length / itemsPerSlide);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const addProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.post('http://localhost:3000/api/projects', {
                name: newProjectName.trim(),
                color: newProjectColor
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const newProject = {
                id: response.data._id,
                name: response.data.name,
                color: response.data.color,
                createdAt: response.data.createdAt
            };

            setProjects(prev => [...prev, newProject]);
            setNewProjectName('');
            setNewProjectColor('#3b82f6');
            setShowAddProject(false);
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    const cancelAddProject = () => {
        setNewProjectName('');
        setNewProjectColor('#3b82f6');
        setShowAddProject(false);
    };

    const getCurrentSlideProjects = () => {
        const startIndex = currentSlide * itemsPerSlide;
        return projects.slice(startIndex, startIndex + itemsPerSlide);
    };

    if (loading) {
        return (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-full">
                <div className="text-center text-white/60">Loading projects...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-full">
                <div className="text-center text-white/60">Please log in to view your projects.</div>
            </div>
        );
    }

    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-full">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-inter-bold">My Projects</h2>
                <div className="flex items-center space-x-3">
                    {totalSlides > 1 && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={prevSlide}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-sm text-white/60 font-inter">
                                {currentSlide + 1} / {totalSlides}
                            </span>
                            <button
                                onClick={nextSlide}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-hidden">
                <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {projects.length === 0 ? (
                        <div className="w-full flex-shrink-0">
                            <div className="text-center text-white/60 py-8">
                                <p className="mb-4">No projects yet. Create your first project!</p>
                                <button
                                    onClick={() => setShowAddProject(true)}
                                    className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer border border-white/20"
                                >
                                    Add Project
                                </button>
                            </div>
                        </div>
                    ) : (
                        Array.from({ length: totalSlides }, (_, slideIndex) => (
                            <div key={slideIndex} className="w-full flex-shrink-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {projects.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map(project => (
                                        <div
                                            key={project.id}
                                            className="group relative backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: project.color }}
                                                />
                                                <div className="text-xs text-white/40 font-inter">
                                                    {new Date(project.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-inter-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                                                {project.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-white/60 font-inter">
                                                    View details
                                                </span>
                                                <svg className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Add Project Card */}
                                    {slideIndex === totalSlides - 1 && (
                                        <div
                                            onClick={() => setShowAddProject(true)}
                                            className="group backdrop-blur-md bg-white/5 border-2 border-dashed border-white/20 rounded-xl shadow-lg p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                                                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-inter-bold text-white/80 mb-2">
                                                Add Project
                                            </h3>
                                            <p className="text-sm text-white/50 font-inter">
                                                Create a new project
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showAddProject && (
                <div className="mt-6 p-4 bg-white/5 border border-white/20 rounded-xl">
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="Project name..."
                            className="w-full px-3 py-3 bg-transparent border-none text-white placeholder-white/50 focus:outline-none text-lg font-inter-bold"
                            autoFocus
                        />
                        
                        <div className="space-y-2">
                            <label className="text-sm text-white/60 font-inter">Choose a color:</label>
                            <div className="flex flex-wrap gap-2">
                                {predefinedColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewProjectColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                                            newProjectColor === color 
                                                ? 'border-white scale-110' 
                                                : 'border-white/20 hover:border-white/40'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-end items-center space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={cancelAddProject}
                                className="text-white/60 hover:text-white font-medium transition-all duration-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addProject}
                                className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer border border-white/20"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
