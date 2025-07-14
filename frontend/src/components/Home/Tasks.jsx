import axios from 'axios';
import { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useSounds } from '../../assets/context/SoundProvider';
import colorMap, { getColorMapping } from '../../utils/colorMap';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [loading, setLoading] = useState(true);
    const [tasksCompleted, setTasksCompleted] = useState(false);
    const { pop } = useSounds();
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchTasksAndProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) {
                    setLoading(false);
                    return;
                }

                // Fetch tasks and projects in parallel
                const [tasksResponse, projectsResponse] = await Promise.all([
                    axios.get(`${apiBase}/api/tasks`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${apiBase}/api/projects`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const transformedTasks = tasksResponse.data.map(task => ({
                    id: task._id,
                    name: task.title,
                    completed: task.isCompleted,
                    project: task.project
                }));

                setTasks(transformedTasks);
                setProjects(projectsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasksAndProjects();
    }, [user]);

    useEffect(() => {
        setTasksCompleted(false);
        tasks.map((task) => {
            if (task.completed) {
                setTasksCompleted(true);
            }
        })
    }, [tasks])

    const handleTaskNameChange = (e) => {
        setNewTaskName(e.target.value);
    };



    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowAddTask(false);
            setNewTaskName('');
            setSelectedProject('');
        } else if (e.key === 'Enter') {
            addTask(e);
        }
    };

    const toggleTask = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const previousTasks = [...tasks];

        setTasks(tasks =>
            tasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );

        try {
            await axios.put(`${apiBase}/api/tasks/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error toggling task:', error);
            setTasks(previousTasks);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const tempId = uuidv4();
        const selectedProjectData = selectedProject ? projects.find(p => p._id === selectedProject) : null;
        const optimisticTask = {
            id: tempId,
            name: newTaskName.trim(),
            completed: false,
            project: selectedProjectData,
            isTemporary: true
        };

        setTasks(prev => [optimisticTask, ...prev]);
        setNewTaskName('');
        setSelectedProject('');
        setShowAddTask(false);

        try {
            const response = await axios.post(`${apiBase}/api/tasks`, {
                title: newTaskName.trim(),
                projectId: selectedProject || null
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const createdTask = {
                id: response.data._id,
                name: response.data.title,
                completed: response.data.isCompleted,
                project: response.data.project
            };

            setTasks(prev => prev.map(task => task.id === tempId ? createdTask : task));
        } catch (error) {
            console.error('Error creating task:', error);
            setTasks(prev => prev.filter(task => task.id !== tempId));
        }
    };

    useEffect(() => {
        if (showAddTask) {
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [showAddTask, handleKeyDown, addTask]);


    const cancelAddTask = (e) => {
        e.preventDefault();
        setNewTaskName('');
        setSelectedProject('');
        setShowAddTask(false);
    };

    const handleDeleteCompletedTasks = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        const previousTasks = [...tasks];

        setTasks(prev => prev.filter(task => !task.completed));
        pop();

        try {
            await axios.delete(`${apiBase}/api/tasks/completed`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

        } catch (error) {
            console.error('Error deleting tasks', error);
            setTasks(previousTasks);
        }
    };

    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 max-w-2xl min-w-[350px] w-full">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-inter-bold">Tasks</h2>
                {tasksCompleted && (
                    <button
                        onClick={handleDeleteCompletedTasks}
                        className="text-sm text-white/40 hover:text-white/60 transition-colors duration-200 cursor-pointer underline"
                    >
                        Clear completed
                    </button>
                )}
            </div>
            {loading ? (
                <div className="text-center text-white/60">Loading tasks...</div>
            ) : !user ? (
                <div className="text-center text-white/60">Please log in to view your tasks.</div>
            ) : (
                <ul className="space-y-6">
                    {tasks.map(task => (
                        <li key={task.id} className="flex flex-row items-center justify-between ml-2">
                            <div className="flex flex-row items-center space-x-3 flex-1 min-w-0">
                                <button
                                    className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${task.completed
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
                                {task.project && (
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                                        style={{
                                            backgroundColor: getColorMapping(task.project.color).backgroundColor,
                                            borderColor: getColorMapping(task.project.color).borderColor,
                                            color: getColorMapping(task.project.color).color,
                                            border: `1px solid ${getColorMapping(task.project.color).borderColor}`,
                                        }}
                                    >
                                        {task.project.name}
                                    </span>
                                )}
                            </div>



                        </li>
                    ))}
                    {tasks.length === 0 && (
                        <li className="text-center text-white/60 py-2">
                            What do you need to get done today?
                        </li>
                    )}
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

                        <div>
                            <div className="mb-2 m-3">
                                <span className="text-white/70 text-sm font-medium">Project (optional)</span>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedProject('')}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200 ${selectedProject === ''
                                        ? 'bg-white/30 border-white/50 text-white ring-2 ring-white/50 scale-105'
                                        : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white/80 hover:scale-105'
                                        }`}
                                >
                                    No Project
                                </button>
                                {projects.map(project => (
                                    <button
                                        key={project._id}
                                        type="button"
                                        onClick={() => setSelectedProject(project._id)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200 shadow-sm ${selectedProject === project._id
                                            ? 'ring-2 ring-white/50 scale-105'
                                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                                            }`}
                                        style={{
                                            backgroundColor: getColorMapping(project.color).backgroundColor,
                                            borderColor: getColorMapping(project.color).borderColor,
                                            color: getColorMapping(project.color).color,
                                            border: `1px solid ${getColorMapping(project.color).borderColor}`,
                                        }}
                                    >
                                        {project.name}
                                    </button>
                                ))}
                            </div>
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
    )
}

export default Tasks;
