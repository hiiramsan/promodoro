import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import testRouter from './routes/testRouter.js'; 
import authRouter from './routes/authRouter.js'
import tasksRouter from './routes/taskRoutes.js';
import projectRouter from './routes/projectRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// DB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ MongoDB Atlas Connected');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

// Middleware
const allowedOrigins = [
  'http://localhost:5173',    
  'https://promodoro-rho.vercel.app'
];

app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin like mobile apps or curl
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // if you need cookies or auth headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/messages', testRouter);
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter)
app.use('/api/projects', projectRouter)

// ping route
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'PROMODORO API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with DB`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
