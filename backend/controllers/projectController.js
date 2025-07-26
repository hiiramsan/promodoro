import Project from "../models/Project.js"
import Task from "../models/Task.js"

export const createProject = async (req, res) => {
    try {
        const project = await Project.create({
            name: req.body.name,
            owner: req.user._id,
            color: req.body.color
        });

        res.status(201).json(project);

    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error })
    }
}

export const getUserProjects = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        const projects = await Project.find({ owner: req.user._id }).sort('-createdAt');

        res.json(projects);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error })
    }
}

export const getProjectCount = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        const count = await Project.countDocuments({ owner: req.user._id });
        res.json({ count })
    } catch (error) {
        res.status(500).json({ message: 'Error getting count of projects' });
    }
}

export const getProjectById = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error })
    }
}

export const deleteProject = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await Task.deleteMany({
            project: req.params.id,
            user: req.user._id
        });

        res.json({ message: 'Project deleted successfully', project });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error })
    }
}

export const getProjectTasks = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const tasks = await Task.find({
            project: req.params.id,
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.json(tasks);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching project tasks', error });
    }
}

export const getProjectStats = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const totalTasks = await Task.countDocuments({
            project: req.params.id,
            user: req.user._id
        });

        const completedTasks = await Task.countDocuments({
            project: req.params.id,
            user: req.user._id,
            isCompleted: true
        });

        const stats = {
            totalTasks,
            completedTasks,
            pendingTasks: totalTasks - completedTasks,
            timeSpent: Math.floor(project.timeSpent / 60)
        };

        res.json(stats);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching project stats', error });
    }
}

export const logProjectTime = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const { timeSpent } = req.body;

    if (!timeSpent || typeof timeSpent !== 'number' || timeSpent <= 0) {
        return res.status(400).json({ message: 'Invalid timeSpent value' });
    }

    try {

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { $inc: { timeSpent: timeSpent } },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        return res.status(200).json({ message: 'Time logged successfully', project });

    } catch (error) {
        console.error("Error logging time:", error);
        return res.status(500).json({ message: 'Server error logging time' });
    }
}

