# 🌸 LinguaPlay - Japanese Language Learning Platform

A full-stack MERN application for learning Japanese through interactive flashcards and quizzes.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB account (Atlas recommended for production)
- Git

---

## 📁 Project Structure

```
linguaplay-fixed/
├── backend/          # Express.js API server
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── scripts/
│   ├── data/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/         # React application
    ├── public/
    ├── src/
    ├── package.json
    └── .env.example
```

---

## 🔧 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/linguaplay.git
cd linguaplay
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your credentials:
# - MONGO_URI (your MongoDB connection string)
# - JWT_SECRET (generate a random secure string)
# - PORT=5000
# - FRONTEND_URL=http://localhost:3000

# Start backend server
npm start
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env:
# REACT_APP_API_URL=http://localhost:5000

# Start frontend
npm start
```

Frontend will run on `http://localhost:3000`

### 4. Seed Database (Optional)
```bash
cd backend
npm run seed
```

---

## 🌐 Deployment on Render

### Prerequisites
1. Create a [Render account](https://render.com)
2. Create a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas)
3. Push your code to GitHub

---

### Step 1: Deploy Backend

1. **Create New Web Service** on Render
   - Connect your GitHub repository
   - Name: `linguaplay-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`

2. **Add Environment Variables**:
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/linguaplay
   JWT_SECRET = your-super-secret-random-string-here
   PORT = 5000
   FRONTEND_URL = https://linguaplay-frontend.onrender.com
   NODE_ENV = production
   ```

3. **Deploy** - Wait for deployment to complete
4. **Copy the backend URL** (e.g., `https://linguaplay-backend.onrender.com`)

---

### Step 2: Deploy Frontend

1. **Create New Static Site** on Render
   - Connect your GitHub repository
   - Name: `linguaplay-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

2. **Add Environment Variables**:
   ```
   REACT_APP_API_URL = https://linguaplay-backend.onrender.com
   ```
   ⚠️ **IMPORTANT**: Use your actual backend URL from Step 1

3. **Deploy** - Wait for deployment to complete

---

### Step 3: Update Backend CORS

Go back to your backend service on Render:
1. Go to **Environment** tab
2. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL = https://linguaplay-frontend.onrender.com
   ```
3. Save and redeploy

---

### Step 4: Seed Production Database

1. Connect to your backend shell on Render
2. Run: `npm run seed`

OR use MongoDB Compass to import data from `backend/data/jlpt/` folder

---

## 🔑 Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/linguaplay` |
| JWT_SECRET | Secret key for JWT tokens | `my-super-secret-key-12345` |
| PORT | Server port | `5000` |
| FRONTEND_URL | Frontend URL for CORS | `https://linguaplay.onrender.com` |
| NODE_ENV | Environment mode | `production` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | `https://linguaplay-api.onrender.com` |

---

## ✅ All Fixed Issues

### Critical Fixes Applied:
1. ✅ **Duplicate `/register` route removed** - Fixed security vulnerability
2. ✅ **Hardcoded localhost removed** - `progressService.js` now uses environment variable
3. ✅ **Environment variable files added** - Both `.env.example` files included
4. ✅ **Proper project structure** - Separated frontend and backend
5. ✅ **Error handler moved** - Now loads before server start
6. ✅ **CORS configured properly** - Uses environment variable in production
7. ✅ **Success message display** - Now shows when account is created
8. ✅ **Social login disabled** - Buttons marked as "Coming Soon"
9. ✅ **React version downgraded** - Now uses stable React 18
10. ✅ **Consistent API clients** - Both use same configuration

---

## 📝 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Import JLPT flashcards to database

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

---

## 🧪 Testing the Deployment

After deployment, test these features:

1. **Registration**: Create a new account
2. **Login**: Login with created account
3. **Flashcards**: View and flip cards
4. **Progress Tracking**: Mark cards as "Known" and earn XP
5. **Level Selection**: Switch between N5-N1 levels
6. **Admin Dashboard**: Login as admin (if applicable)

---

## 🐛 Troubleshooting

### "Failed to fetch flashcards"
- Check backend URL in frontend `.env`
- Verify backend is running
- Check browser console for CORS errors

### "MongoDB Connection Error"
- Verify MONGO_URI is correct
- Check MongoDB Atlas whitelist (allow all IPs: 0.0.0.0/0)
- Ensure database user has read/write permissions

### "JWT token invalid"
- Check JWT_SECRET matches between deployments
- Clear localStorage and login again

### "Cannot POST /api/auth/login"
- Backend server not running
- Check Render backend logs
- Verify start command is `node server.js`

---

## 📊 Features

- ✨ User Authentication (JWT)
- 📚 JLPT Flashcards (N5 to N1)
- 🎯 Progress Tracking with XP System
- 🔊 Sound Effects (flip & correct)
- 👑 Admin Dashboard
- 🎨 Beautiful UI with animations
- 📱 Responsive Design

---

## 🛡️ Security Features

- Rate limiting on auth routes
- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable protection
- Input validation

---

## 👨‍💻 Tech Stack

**Frontend:**
- React 18
- React Router
- Axios
- Chart.js

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt

---

## 📧 Support

For issues or questions:
1. Check troubleshooting section above
2. Review Render deployment logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

## 🎉 Success!

If you see the login page and can create an account, you're all set! 🚀

**Live Demo**: https://linguaplay.onrender.com (update with your URL)

---

Made with ❤️ for Japanese learners
