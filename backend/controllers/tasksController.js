import Task from "../models/Task.js";
import Project from "../models/Project.js";

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description || null,
      date: Date.now(),
      user: req.user._id,
      project: req.body.projectId || null
    });

    // Populate the project data before sending response
    await task.populate('project', 'name color');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .sort('-date')
      .populate('project', 'name color');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user: req.user._id
      },
      [
        { 
          $set: { isCompleted: { $not: "$isCompleted" } } 
        }
      ],
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling task', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

export const deleteAllTasks = async (req, res) => {
  try {
    const completedTasks = await Task.deleteMany({
      isCompleted: true,
      user: req.user._id
    });

    if (completedTasks.deletedCount === 0) {
      return res.status(404).json({ message: "No completed tasks!" });
    }

    res.json({ message: 'Tasks completed deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tasks completed', error: error.message });
  }
};

export const deleteCompletedTasksForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify project exists and belongs to user
    const project = await Project.findOne({ 
      _id: projectId, 
      owner: req.user._id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const completedTasks = await Task.deleteMany({
      isCompleted: true,
      user: req.user._id,
      project: projectId
    });

    if (completedTasks.deletedCount === 0) {
      return res.status(404).json({ message: "No completed tasks found for this project!" });
    }

    res.json({ 
      message: 'Completed tasks deleted successfully', 
      deletedCount: completedTasks.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting completed tasks', error: error.message });
  }
};