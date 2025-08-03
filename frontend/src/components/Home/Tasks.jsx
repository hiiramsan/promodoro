import axios from 'axios';
import { useState, useEffect, useRef } from "react";
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { pop } = useSounds();
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewTaskName(value);

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        const mentions = value.match(/@"[^"]*"|@[^\s@]+/g) || [];
        const hasValidMention = mentions.some(mention => {
            let projectName;
            if (mention.startsWith('@"') && mention.endsWith('"')) {
                projectName = mention.slice(2, -1);
            } else {
                projectName = mention.substring(1); 
            }
            return projects.some(p => p.name.toLowerCase() === projectName.toLowerCase());
        });

        if (!hasValidMention) {
            setSelectedProject('');
        }

        if (lastAtIndex !== -1 && lastAtIndex < cursorPosition) {
            const searchTerm = textBeforeCursor.substring(lastAtIndex + 1);
            const filtered = projects.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProjects(filtered);
            setShowSuggestions(filtered.length > 0);
            setMentionStartIndex(lastAtIndex);
            setSelectedIndex(0);
        } else {
            setShowSuggestions(false);
            setMentionStartIndex(-1);
        }
    };


    useEffect(() => {
        const fetchTasksAndProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) {
                    setLoading(false);
                    return;
                }

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
        if (showSuggestions && filteredProjects.length > 0) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredProjects.length);
                    return;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredProjects.length) % filteredProjects.length);
                    return;
                case 'Enter':
                    e.preventDefault();
                    selectProject(filteredProjects[selectedIndex]);
                    return; // CRITICAL: return here to prevent any further processing
                case 'Escape':
                    e.preventDefault();
                    setShowSuggestions(false);
                    setMentionStartIndex(-1);
                    return;
            }
        }

        // Handle ESC to cancel task creation (when suggestions are not visible)
        if (e.key === 'Escape' && !showSuggestions) {
            e.preventDefault();
            cancelAddTask(e);
            return;
        }

        // Only handle Enter for task creation if suggestions are NOT visible
        if (e.key === 'Enter' && !e.shiftKey && !showSuggestions) {
            e.preventDefault();
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

        // Remove @project mentions from the task title
        const cleanTaskName = newTaskName.replace(/@"[^"]*"|@[^\s@]+/g, '').trim();
        if (!cleanTaskName) return; // Don't create empty tasks

        const tempId = uuidv4();
        const selectedProjectData = selectedProject ? projects.find(p => p._id === selectedProject) : null;
        const optimisticTask = {
            id: tempId,
            name: cleanTaskName,
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
                title: cleanTaskName,
                projectId: selectedProject ? selectedProject : null
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

    const selectProject = (project) => {
        if (mentionStartIndex !== -1 && inputRef.current) {
            const beforeMention = newTaskName.substring(0, mentionStartIndex);
            const afterMention = newTaskName.substring(mentionStartIndex + 1);

            const endOfMention = afterMention.search(/\s|@|$/);
            const afterComplete = endOfMention !== -1 ? afterMention.substring(endOfMention) : '';

            const newValue = `${beforeMention}@"${project.name}"  ${afterComplete}`;
            setNewTaskName(newValue);
            setSelectedProject(project._id);
            setShowSuggestions(false);
            setMentionStartIndex(-1);

            setTimeout(() => {
                if (inputRef.current) {
                    const newCursorPos = beforeMention.length + project.name.length + 7;
                    inputRef.current.focus();
                    inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);
        }
    };


    useEffect(() => {
        // No need for window event listener since we handle keydown directly on the textarea
    }, [showAddTask, handleKeyDown, addTask]);


    const cancelAddTask = (e) => {
        e.preventDefault();
        setNewTaskName('');
        setSelectedProject('');
        setShowAddTask(false);
        setShowSuggestions(false);
        setMentionStartIndex(-1);
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
        <div className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg max-w-2xl min-w-[350px] w-full transition-all duration-300 ease-in-out ${isCollapsed ? 'p-6' : 'p-8'}`}>
            <div className={`flex justify-between items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'mb-0' : 'mb-8'}`}>
                <h2 className="text-xl font-inter-bold">Tasks</h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer"
                        title={isCollapsed ? "Expand tasks" : "Collapse tasks"}
                    >
                        <svg 
                            className={`w-4 h-4 text-white transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth={2} 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    {!isCollapsed && tasksCompleted && (
                        <button
                            onClick={handleDeleteCompletedTasks}
                            className="text-sm text-white/40 hover:text-white/60 transition-colors duration-200 cursor-pointer underline"
                        >
                            Clear completed
                        </button>
                    )}
                </div>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                {loading ? (
                    <div className="text-center text-white/60">Loading tasks...</div>
                ) : !user ? (
                    <div className="text-center text-white/60">Please log in to view your tasks.</div>
                ) : (
                <ul className="space-y-6">
                    {tasks.map(task => {
                        const projectColor = task.project ? getColorMapping(task.project.color) : null;
                        return (
                            <li
                                key={task.id}
                                className="flex flex-row items-center justify-between ml-2 p-2 rounded-lg transition-all duration-200"
                            >
                                <div className="flex flex-row items-center space-x-3 flex-1 min-w-0">
                                    <button
                                        className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${task.completed
                                            ? "bg-green-500 border-green-500"
                                            : task.project
                                                ? `border-2`
                                                : "border-gray-400 bg-transparent"
                                            }`}
                                        style={task.project && !task.completed ? {
                                            borderColor: projectColor.backgroundColor
                                        } : {}}
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
                                                backgroundColor: projectColor.backgroundColor,
                                                borderColor: projectColor.borderColor,
                                                color: projectColor.color,
                                                border: `1px solid ${projectColor.borderColor}`,
                                            }}
                                        >
                                            {task.project.name}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
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
                        <div className="relative">
                            <div
                                className="absolute inset-0 px-3 py-2 text-lg font-inter-bold pointer-events-none whitespace-pre-wrap break-words"
                                style={{
                                    color: 'transparent',
                                    overflow: 'hidden',
                                    zIndex: 1
                                }}
                            >
                                {newTaskName.split(/(@"[^"]*"|@[^\s@]+)/g).map((part, index) => {
                                    if (part.startsWith('@')) {
                                        let projectName;
                                        if (part.startsWith('@"') && part.endsWith('"')) {
                                            projectName = part.slice(2, -1); // Remove @" and "
                                        } else {
                                            projectName = part.slice(1); // Remove @
                                        }
                                        const project = projects.find(
                                            (p) => p.name.toLowerCase() === projectName.toLowerCase()
                                        );

                                        if (project) {
                                            const bg = getColorMapping(project.color).color;

                                            return (
                                                <span
                                                    key={index}
                                                    className="rounded py-0.5"
                                                    style={{
                                                        backgroundColor: bg,
                                                        display: 'inline-block',
                                                        lineHeight: '1.5',
                                                        paddingLeft: '2px',
                                                        paddingRight: '2px',
                                                    }}
                                                >
                                                    {part}
                                                </span>
                                            );
                                        }
                                    }

                                    return <span key={index}>{part}</span>;
                                })}

                            </div>
                            <textarea
                                ref={inputRef}
                                value={newTaskName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="What do you need to do? Type @ for project"
                                className="w-full min-h-[40px] px-3 py-2 bg-transparent border-none text-white placeholder-white/50 focus:outline-none text-lg font-inter-bold resize-none relative"
                                autoFocus
                                rows={1}
                                style={{
                                    overflow: 'hidden',
                                    wordWrap: 'break-word',
                                    zIndex: 2,
                                    backgroundColor: 'transparent'
                                }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />
                            {showSuggestions && (
                                <div
                                    ref={suggestionsRef}
                                    className="absolute top-full left-3 right-3 mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                                >
                                    {filteredProjects.map((project, index) => (
                                        <div
                                            key={project._id}
                                            className={`p-3 cursor-pointer hover:bg-white/20 transition-colors duration-200 ${index === selectedIndex ? 'bg-white/20' : ''
                                                }`}
                                            onClick={() => selectProject(project)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: getColorMapping(project.color).backgroundColor }}
                                                />
                                                <span className="text-sm text-white">{project.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Old project selector */}
                        {/* <div>
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
                        </div> */}

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
    )
}

export default Tasks;
