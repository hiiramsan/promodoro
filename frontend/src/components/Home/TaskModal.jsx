import { useEffect, useState } from "react";
import axios from "axios";

const TaskModal = ({ isOpen, onClose, onSelect }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${apiBase}/api/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTasks(res.data);
            } catch (error) {
                console.error("Failed to load tasks", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) fetchTasks();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-md w-full space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white text-lg font-semibold">Select a task</h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white cursor-pointer">
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="text-white/60">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-white/60">You have no tasks yet.</div>
                ) : (
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {tasks.map(task => (
                            <li key={task._id}>
                                <button
                                    onClick={() => {
                                        onSelect(task);
                                        onClose();
                                    }}
                                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all cursor-pointer"
                                >
                                    <div className="font-medium">{task.title}</div>
                                    {task.project && (
                                        <div className="text-sm text-white/60">Project: {task.project.name}</div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TaskModal;
