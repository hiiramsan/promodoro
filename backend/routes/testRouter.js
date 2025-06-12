import express from 'express';
import { welcomeMessage } from '../controllers/firstController.js';

const testRouter = express.Router()

testRouter.post('/welcome', welcomeMessage)

export default testRouter