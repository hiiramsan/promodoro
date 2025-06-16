import express from 'express';
import { login, register, getMe, verifyToken } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', verifyToken, getMe);

export default authRouter;