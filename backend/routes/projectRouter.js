import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { createProject, getUserProjects } from '../controllers/projectController.js';

const projectRouter = express.Router();

projectRouter.use(protect);

projectRouter.route('/')
    .get(getUserProjects)
    .post(createProject)

export default projectRouter;