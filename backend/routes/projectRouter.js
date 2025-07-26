import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { createProject, getProjectCount, getUserProjects, getProjectById, deleteProject, getProjectTasks, getProjectStats, logProjectTime } from '../controllers/projectController.js';

const projectRouter = express.Router();

projectRouter.use(protect);

projectRouter.route('/')
    .get(getUserProjects)
    .post(createProject)

projectRouter.route('/num')
    .get(getProjectCount)

projectRouter.route('/:id')
    .get(getProjectById)
    .delete(deleteProject)

projectRouter.route('/:id/tasks')
    .get(getProjectTasks)

projectRouter.route('/:id/stats')
    .get(getProjectStats)

projectRouter.route('/:id/log-time')
    .patch(logProjectTime)

export default projectRouter;