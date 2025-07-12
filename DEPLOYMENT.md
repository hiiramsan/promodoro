# Deployment Guide for Promodoro App

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Fill in your actual values in the .env files
```

### 2. Local Development
```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

## 📦 Deployment Options

### Option 1: Vercel (Recommended for Full-Stack)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your generated JWT secret
   - `CORS_ORIGIN`: Your frontend URL

### Option 2: Netlify + Heroku
**Frontend (Netlify):**
1. Push to GitHub
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `frontend/dist`

**Backend (Heroku):**
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set CORS_ORIGIN=https://your-netlify-app.netlify.app
   ```
4. Deploy: `git push heroku main`

### Option 3: Railway
**Full-Stack Deployment:**
1. Push to GitHub
2. Connect to Railway
3. Deploy backend and frontend as separate services
4. Set environment variables in Railway dashboard

## 🔧 Pre-Deployment Checklist

### Backend
- [ ] Update JWT_SECRET to a strong random string
- [ ] Configure CORS_ORIGIN for your frontend domain
- [ ] Set NODE_ENV to 'production'
- [ ] Ensure MongoDB Atlas IP whitelist includes your deployment platform
- [ ] Test API endpoints

### Frontend
- [ ] Set VITE_API_URL to your backend URL
- [ ] Update hardcoded localhost URLs to use environment variables
- [ ] Test build process: `npm run build`
- [ ] Verify all routes work in production build

### Database
- [ ] MongoDB Atlas cluster is active
- [ ] Database user has correct permissions
- [ ] IP whitelist includes deployment platform IPs
- [ ] Connection string is secure

### Security
- [ ] All sensitive data is in environment variables
- [ ] .env files are in .gitignore
- [ ] JWT secret is strong and unique
- [ ] CORS is properly configured

## 🌐 Platform-Specific Notes

### Vercel
- Serverless functions have size limits
- Set `maxLambdaSize: "50mb"` in vercel.json
- Environment variables set in dashboard

### Netlify
- Static frontend hosting
- Redirects configured for SPA routing
- API proxy to backend service

### Heroku
- Procfile: `web: npm start`
- Environment variables via CLI or dashboard
- Automatic deployment from GitHub

### Railway
- Modern deployment platform
- Automatic builds from GitHub
- Built-in environment variable management

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Database Connection**: Verify MongoDB Atlas IP whitelist
3. **API URLs**: Ensure VITE_API_URL is set correctly
4. **Build Failures**: Check Node.js version compatibility

### Debug Commands:
```bash
# Check environment variables
npm run dev --prefix backend  # Should show environment
npm run build --prefix frontend  # Should build successfully

# Test API endpoints
curl https://your-backend-url.com/api/messages
```

## 📝 Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-64-character-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```
