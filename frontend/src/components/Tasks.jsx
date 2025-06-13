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
    ];

    const [tasks, setTasks] = useState(initialTasks);

    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-8 w-1/2 max-w-2xl min-w-[350px]">
            <h2 className="text-xl font-inter-bold mb-8">Tasks</h2>
            <ul className="space-y-6">
                {tasks.map(task => (
                    <li key={task.id} className="flex flex-row items-center justify-between">
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
            </ul>
        </div>
    )
}

export default Tasks;
