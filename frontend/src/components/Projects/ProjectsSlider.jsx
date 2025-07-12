import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ProjectsSlider() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectColor, setNewProjectColor] = useState('#3b82f6');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const predefinedColors = [
        'blue', 'red', 'yellow', 'orange', 'purple',
        'pink', 'cyan',
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${apiBase}/api/projects`, {
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

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && showAddProject) {
                cancelAddProject();
            }
        };

        if (showAddProject) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showAddProject]);

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
            const response = await axios.post(`${apiBase}/api/projects`, {
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
            setNewProjectColor('blue');
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

    const handleModalBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            cancelAddProject();
        }
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
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                            className="group relative backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div
                                                    className={`w-4 h-4 rounded-full flex-shrink-0 bg-${project.color}-700`}
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
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={handleModalBackdropClick}
                >
                    <div className="relative max-w-md w-full backdrop-blur-lg bg-white/15 border border-white/15 rounded-2xl shadow-2xl p-6 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
                        {/* Close button */}
                        <button
                            onClick={cancelAddProject}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* Header */}
                        <div className="mb-6">
                            <h3 className="text-xl font-inter-bold text-white mb-2">Create New Project</h3>
                            <p className="text-sm text-white/60 font-inter">Add a new project to organize your tasks</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 font-inter mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="Enter project name..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-white/60 font-inter mb-3">Choose a color</label>
                                <div className="flex flex-wrap gap-3">
                                    {predefinedColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNewProjectColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-110 ${
                                                newProjectColor === color 
                                                    ? 'border-white scale-115 shadow-lg' 
                                                    : 'border-white/20 hover:border-white/40'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex justify-end items-center space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cancelAddProject}
                                    className="px-4 py-2 text-white/60 hover:text-white font-medium transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={addProject}
                                    disabled={!newProjectName.trim()}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 cursor-pointer border border-white/20 hover:border-white/30"
                                >
                                    Create Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
