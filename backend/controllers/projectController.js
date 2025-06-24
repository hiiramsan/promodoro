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

