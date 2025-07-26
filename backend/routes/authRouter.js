import express from 'express';
import { login, register, getMe, verifyToken, getUserPreferences, updateUserPreferences, googleLogin } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/google', googleLogin);
authRouter.get('/me', verifyToken, getMe);
authRouter.get('/preferences', verifyToken, getUserPreferences);
authRouter.post('/preferences', verifyToken, updateUserPreferences);
authRouter.put('/preferences', verifyToken, updateUserPreferences);

export default authRouter;