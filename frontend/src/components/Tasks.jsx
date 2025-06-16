import { useState } from "react";

const Tasks = () => {

    // API call instead
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
            completed: false,
            tags: ["Learning"]
        },
        {
            id: 3,
            name: "Grocery shopping",
            completed: false,
            tags: ["Personal"]
        }
    ]; const [tasks, setTasks] = useState(initialTasks);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskTags, setNewTaskTags] = useState('');

    const toggleTask = (id) => {
        setTasks(tasks =>
            tasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }; const addTask = (e) => {
        e.preventDefault();
        if (newTaskName.trim()) {
            const newTask = {
                id: Date.now(), // Simple ID generation
                name: newTaskName.trim(),
                completed: false,
                tags: newTaskTags.trim() ? newTaskTags.split(',').map(tag => tag.trim()) : []
            };
            setTasks(prev => [...prev, newTask]);
            setNewTaskName('');
            setNewTaskTags('');
            setShowAddTask(false);
        }
    };

    const cancelAddTask = (e) => {
        e.preventDefault();
        setNewTaskName('');
        setNewTaskTags('');
        setShowAddTask(false);
    }; return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-1/2 max-w-2xl min-w-[350px] w-full">
            <h2 className="text-xl font-inter-bold mb-8">Tasks</h2>

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

                {/* Add Task Button */}
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
            </ul>            {/* Add Task Container - freestyle form */}
            {showAddTask && (
                <div className="mt-6 p-4 bg-white/5 border border-white/20 rounded-xl">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="What do you need to do?"
                            className="w-full px-3 py-3 bg-transparent border-none text-white placeholder-white/50 focus:outline-none text-lg font-inter-bold"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={newTaskTags}
                            onChange={(e) => setNewTaskTags(e.target.value)}
                            placeholder="Add tags: work, personal, urgent..."
                            className="w-full px-3 py-2 bg-transparent border-none text-white placeholder-white/40 focus:outline-none text-sm" />
                        <div className="flex justify-end items-center space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={cancelAddTask}
                                className="text-white/60 hover:text-white font-medium transition-all duration-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addTask}
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

export default Tasks;
