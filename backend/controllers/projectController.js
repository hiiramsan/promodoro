import Project from "../models/Project.js"

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
        console.log('count on back: ', count);
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

        res.json({ message: 'Project deleted successfully', project });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error })
    }
}

