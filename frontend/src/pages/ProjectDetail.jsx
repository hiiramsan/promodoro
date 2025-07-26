import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Silk from '../components/Silk'
import { getColorMapping } from '../utils/colorMap'
import { v4 as uuidv4 } from 'uuid'
import { useSounds } from '../assets/context/SoundProvider'

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, timeSpent: 0 });
    const [projectTasks, setProjectTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [tasksCompleted, setTasksCompleted] = useState(false);
    const [error, setError] = useState(null);
    const { pop } = useSounds();
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) {
                    navigate('/login');
                    return;
                }

                const [projectResponse, statsResponse, tasksResponse] = await Promise.all([
                    axios.get(`${apiBase}/api/projects/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${apiBase}/api/projects/${id}/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${apiBase}/api/projects/${id}/tasks`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setProject(projectResponse.data);
                setStats(statsResponse.data);
                setProjectTasks(tasksResponse.data)
            } catch (error) {
                console.error('Error fetching project data:', error);
                if (error.response?.status === 404) {
                    setError('Project not found');
                } else {
                    setError('Error loading project');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [id, user, navigate]);

    // method to delete project
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${apiBase}/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            navigate('/projects');
        } catch (error) {
            console.error('Error deleting project:', error);
            setError('Error deleting project');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // open delete box
    const handleModalBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowDeleteModal(false);
        }
    };

    // Check if tasks are completed
    useEffect(() => {
        setTasksCompleted(false);
        projectTasks.forEach((task) => {
            if (task.isCompleted) {
                setTasksCompleted(true);
            }
        });
    }, [projectTasks]);

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowAddTask(false);
            setNewTaskName('');
        } else if (e.key === 'Enter') {
            addTask(e);
        }
    };

    // Add task functionality
    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const tempId = uuidv4();
        const optimisticTask = {
            _id: tempId,
            title: newTaskName.trim(),
            isCompleted: false,
            project: project,
            isTemporary: true
        };

        setProjectTasks(prev => [optimisticTask, ...prev]);
        setNewTaskName('');
        setShowAddTask(false);

        try {
            const response = await axios.post(`${apiBase}/api/tasks`, {
                title: newTaskName.trim(),
                projectId: project._id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const createdTask = response.data;
            setProjectTasks(prev => prev.map(task => task._id === tempId ? createdTask : task));
            
            // Update stats
            setStats(prev => ({
                ...prev,
                totalTasks: prev.totalTasks + 1
            }));
        } catch (error) {
            console.error('Error creating task:', error);
            setProjectTasks(prev => prev.filter(task => task._id !== tempId));
        }
    };

    const toggleTask = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const previousTasks = [...projectTasks];
        const taskToToggle = projectTasks.find(task => task._id === id);

        setProjectTasks(tasks =>
            tasks.map(task =>
                task._id === id ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );

        try {
            await axios.put(`${apiBase}/api/tasks/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update stats
            setStats(prev => ({
                ...prev,
                completedTasks: taskToToggle.isCompleted 
                    ? prev.completedTasks - 1 
                    : prev.completedTasks + 1,
                completionRate: prev.totalTasks > 0 
                    ? Math.round(((taskToToggle.isCompleted ? prev.completedTasks - 1 : prev.completedTasks + 1) / prev.totalTasks) * 100)
                    : 0
            }));
        } catch (error) {
            console.error('Error toggling task:', error);
            setProjectTasks(previousTasks);
        }
    };

    // Delete completed tasks
    const handleDeleteCompletedTasks = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        const previousTasks = [...projectTasks];
        const completedCount = projectTasks.filter(task => task.isCompleted).length;

        setProjectTasks(prev => prev.filter(task => !task.isCompleted));
        pop();

        try {
            await axios.delete(`${apiBase}/api/tasks/completed/${project._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update stats
            setStats(prev => ({
                ...prev,
                totalTasks: prev.totalTasks - completedCount,
                completedTasks: 0,
                completionRate: prev.totalTasks - completedCount > 0 
                    ? Math.round((0 / (prev.totalTasks - completedCount)) * 100) 
                    : 0
            }));
        } catch (error) {
            console.error('Error deleting completed tasks:', error);
            setProjectTasks(previousTasks);
        }
    };

    // Cancel add task
    const cancelAddTask = (e) => {
        e.preventDefault();
        setNewTaskName('');
        setShowAddTask(false);
    };

    // Handle task name change
    const handleTaskNameChange = (e) => {
        setNewTaskName(e.target.value);
    };

    // Keyboard event listener
    useEffect(() => {
        if (showAddTask) {
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [showAddTask, newTaskName]);

    if (loading) {
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
                    <Navbar />
                    <div className="container mx-auto px-4 py-8">
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-full">
                            <div className="text-center text-white/60">Loading project...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
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
                    <Navbar />
                    <div className="container mx-auto px-4 py-8">
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-full">
                            <div className="text-center">
                                <div className="text-red-400 mb-4">{error}</div>
                                <button
                                    onClick={() => navigate('/projects')}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer border border-white/20"
                                >
                                    Back to Projects
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

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
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={() => navigate('/projects')}
                                className="flex items-center text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Projects
                            </button>
                        </div>

                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 mb-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-white/20"
                                        style={{ backgroundColor: getColorMapping(project.color).hex }}
                                    />
                                    <div>
                                        <h1 className="text-3xl font-inter-bold text-white mb-2">
                                            {project.name}
                                        </h1>
                                        <p className="text-white/60 font-inter">
                                            Created on {new Date(project.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Project Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="text-2xl font-inter-bold text-white mb-1">{stats.totalTasks}</div>
                                    <div className="text-sm text-white/60 font-inter">Total Tasks</div>
                                </div>
                                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="text-2xl font-inter-bold text-white mb-1">{stats.completedTasks}</div>
                                    <div className="text-sm text-white/60 font-inter">Completed</div>
                                </div>
                                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="text-2xl font-inter-bold text-white mb-1">{stats.timeSpent} min</div>
                                    <div className="text-sm text-white/60 font-inter">Time spent</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                                >
                                    Delete Project
                                </button>
                                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-lg font-medium transition-all duration-200 cursor-pointer">
                                    Edit Project
                                </button>
                            </div>
                        </div>

                        {/* Tasks Section */}
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-inter-bold text-white">Tasks</h2>
                                {tasksCompleted && (
                                    <button
                                        onClick={handleDeleteCompletedTasks}
                                        className="text-sm text-white/40 hover:text-white/60 transition-colors duration-200 cursor-pointer underline"
                                    >
                                        Clear completed
                                    </button>
                                )}
                            </div>
                            
                            {projectTasks.length === 0 && !showAddTask && (
                                <div className="text-center text-white/60 py-8">
                                    <p>No tasks yet. Start by adding your first task!</p>
                                </div>
                            )}
                            
                            {projectTasks.length > 0 && (
                                <ul className="space-y-6">
                                    {projectTasks.map(task => (
                                        <li key={task._id} className="flex flex-row items-center justify-between ml-2">
                                            <div className="flex flex-row items-center space-x-3 flex-1 min-w-0">
                                                <button
                                                    className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${task.isCompleted
                                                        ? "bg-green-500 border-green-500"
                                                        : "border-gray-400 bg-transparent"
                                                        }`}
                                                    aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                                                    onClick={() => toggleTask(task._id)}
                                                >
                                                    {task.isCompleted && (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <span className={`font-inter text-base break-words ${task.isCompleted ? "line-through text-gray-400" : "text-white"}`}>
                                                    {task.title}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                    <li className="flex flex-row items-center justify-between">
                                        <button
                                            onClick={() => setShowAddTask(true)}
                                            className="flex flex-row items-center space-x-3 flex-1 min-w-0 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all duration-200"
                                        >
                                            <div className="w-6 h-6 flex-shrink-0 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <span className="font-inter text-base text-gray-400">
                                                Add new task...
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            )}
                            
                            {projectTasks.length === 0 && !showAddTask && (
                                <div className="text-center">
                                    <button
                                        onClick={() => setShowAddTask(true)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer border border-white/20"
                                    >
                                        Add Task
                                    </button>
                                </div>
                            )}
                            
                            {showAddTask && (
                                <div className="mt-6 p-4 bg-white/5 border border-white/20 rounded-xl relative">
                                    <div className="space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={newTaskName}
                                                onChange={handleTaskNameChange}
                                                placeholder="What do you need to do?"
                                                className="w-full px-3 py-2 bg-transparent border-none text-white placeholder-white/50 focus:outline-none text-lg font-inter-bold"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="flex justify-end items-center space-x-4 pt-2">
                                            <button
                                                type="button"
                                                onClick={cancelAddTask}
                                                className="text-white/60 hover:text-white font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2"
                                            >
                                                <span>Cancel</span>
                                                <kbd className="inline-flex items-center px-1 py-0.5 rounded text-xs font-mono bg-white/10 border border-white/20 text-white/70">
                                                    Esc
                                                </kbd>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addTask}
                                                className="px-4 py-1.5 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer border border-white/20 flex items-center space-x-2"
                                            >
                                                <span>Save task</span>
                                                <kbd className="inline-flex items-center px-1 py-0.5 rounded text-xs font-mono bg-white/10 border border-white/20 text-white/70">
                                                    Enter
                                                </kbd>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={handleModalBackdropClick}
                    >
                        <div className="relative max-w-md w-full backdrop-blur-lg bg-white/15 border border-white/15 rounded-2xl shadow-2xl p-6 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
                            {/* Close button */}
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-inter-bold text-white mb-2">Delete Project</h3>
                                <p className="text-sm text-white/60 font-inter">
                                    Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently delete all associated tasks.
                                </p>
                            </div>

                            <div className="flex justify-end items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                    className="px-4 py-2 text-white/60 hover:text-white font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 text-red-400 disabled:text-red-400/50 rounded-lg font-medium transition-all duration-200 cursor-pointer border border-red-500/30 hover:border-red-500/50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {deleting && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                    )}
                                    <span>{deleting ? 'Deleting...' : 'Delete Project'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
