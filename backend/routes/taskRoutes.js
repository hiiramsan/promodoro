import express from 'express'
import { createTask, deleteAllTasks, deleteTask, getUserTasks, toggleTask, deleteCompletedTasksForProject } from '../controllers/tasksController.js';
import { protect } from '../middleware/authMiddleware.js';

const tasksRouter = express.Router();

// use auth middleware to avoid unlogged users to access
tasksRouter.use(protect)

tasksRouter.route('/')
  .get(getUserTasks)   
  .post(createTask); 

tasksRouter.route('/completed')
  .delete(deleteAllTasks)

tasksRouter.route('/completed/:projectId')
  .delete(deleteCompletedTasksForProject)

tasksRouter.route('/:id')
  .put(toggleTask)
  .delete(deleteTask);

export default tasksRouter;