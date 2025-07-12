# 🍅 Promodoro - Pomodoro Timer with Project Management

A modern full-stack Pomodoro timer application with project management features, built with React, Node.js, and MongoDB.

## ✨ Features

- **Pomodoro Timer**: Classic 25-minute work sessions with breaks
- **Project Management**: Organize tasks by projects with color coding
- **Task Tracking**: Create, complete, and manage tasks
- **User Authentication**: Secure user accounts with JWT
- **Responsive Design**: Works on desktop and mobile devices
- **Sound Notifications**: Audio alerts for timer events

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Three Fiber** - 3D components
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/promodoro.git
   cd promodoro
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```

4. **Configure your environment files**
   - Update `backend/.env` with your MongoDB connection string and JWT secret
   - Update `frontend/.env` with your API URL

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend at `http://localhost:5173`
   - Backend at `http://localhost:3000`

## 📦 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run start` - Start production backend
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## 🔧 Configuration

### Environment Variables

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=3000
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/promodoro
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3000/api
```

## 🌐 Deployment

Detailed deployment instructions are available in [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deploy Options:
- **Vercel**: Full-stack deployment with serverless functions
- **Netlify + Heroku**: Static frontend + backend hosting
- **Railway**: Modern deployment platform

## 📱 Usage

1. **Sign up** for a new account or **login** to existing one
2. **Create projects** to organize your work
3. **Add tasks** to your projects
4. **Start the timer** and work in focused 25-minute sessions
5. **Take breaks** between sessions
6. **Track your progress** and completed tasks

## 🎨 Screenshots

*Add screenshots of your application here*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Pomodoro Technique® by Francesco Cirillo
- Sound effects from [source]
- Icons from React Icons

## 📧 Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/promodoro
