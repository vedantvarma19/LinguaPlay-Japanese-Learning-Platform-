# 🚀 Deployment Checklist for LinguaPlay

## Before You Deploy

### ✅ Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and running
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for Render)
- [ ] GitHub repository created and code pushed
- [ ] Render account created

---

## Backend Deployment Steps

### 1. Create Backend Web Service on Render

- [ ] Go to Render Dashboard → New → Web Service
- [ ] Connect GitHub repository
- [ ] Configure settings:
  ```
  Name: linguaplay-backend
  Region: Oregon (US West) or closest to you
  Branch: main
  Root Directory: backend
  Environment: Node
  Build Command: npm install
  Start Command: node server.js
  ```

### 2. Add Backend Environment Variables

- [ ] Click "Advanced" → "Add Environment Variable"
- [ ] Add these variables:

```
MONGO_URI = mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/linguaplay?retryWrites=true&w=majority

JWT_SECRET = [Generate a random string - use: openssl rand -base64 32]

PORT = 5000

FRONTEND_URL = https://linguaplay-frontend.onrender.com
(⚠️ Update this after frontend deployment)

NODE_ENV = production
```

### 3. Deploy Backend

- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete (~3-5 minutes)
- [ ] Check logs for "✅ MongoDB Connected" and "🚀 Server running"
- [ ] Copy your backend URL (e.g., `https://linguaplay-backend-xxxx.onrender.com`)
- [ ] Test health endpoint: `https://YOUR-BACKEND-URL.onrender.com/api/health`

---

## Frontend Deployment Steps

### 1. Create Frontend Static Site on Render

- [ ] Go to Render Dashboard → New → Static Site
- [ ] Connect same GitHub repository
- [ ] Configure settings:
  ```
  Name: linguaplay-frontend
  Region: Same as backend
  Branch: main
  Root Directory: frontend
  Build Command: npm install && npm run build
  Publish Directory: build
  ```

### 2. Add Frontend Environment Variables

- [ ] Add this variable:
```
REACT_APP_API_URL = https://YOUR-BACKEND-URL.onrender.com
```
⚠️ **CRITICAL**: Replace with your ACTUAL backend URL from step above

### 3. Deploy Frontend

- [ ] Click "Create Static Site"
- [ ] Wait for build to complete (~5-10 minutes)
- [ ] Copy your frontend URL (e.g., `https://linguaplay-frontend.onrender.com`)

---

## Post-Deployment Configuration

### 1. Update Backend CORS

- [ ] Go back to backend service on Render
- [ ] Go to Environment tab
- [ ] Update `FRONTEND_URL` with your actual frontend URL
- [ ] Click "Save Changes"
- [ ] Wait for auto-redeploy

### 2. Seed the Database

**Option A: Via Render Shell**
- [ ] Go to backend service on Render
- [ ] Click "Shell" tab
- [ ] Run: `npm run seed`
- [ ] Wait for completion

**Option B: Via MongoDB Compass**
- [ ] Download MongoDB Compass
- [ ] Connect using your MONGO_URI
- [ ] Import JSON files from `backend/data/jlpt/` folder
- [ ] Import to `linguaplay` database, `flashcards` collection

---

## Testing Checklist

### ✅ Test Your Deployed App

- [ ] Frontend loads at your Render URL
- [ ] No console errors in browser DevTools
- [ ] Registration works (create a new account)
- [ ] Success message appears after registration
- [ ] Login works with created account
- [ ] Redirects to flashcards page after login
- [ ] Flashcards load and display correctly
- [ ] Can flip flashcards (click on card)
- [ ] Sound effects play (flip & correct)
- [ ] "Known +10 XP" button works
- [ ] XP increases when marking cards as known
- [ ] Progress bar updates
- [ ] Can switch between N5-N1 levels
- [ ] Logout works and redirects to login

---

## Common Issues & Solutions

### ❌ "Failed to fetch flashcards"
**Solution:**
- Check `REACT_APP_API_URL` in frontend environment variables
- Verify backend is running (check Render dashboard)
- Check browser console for exact error

### ❌ "CORS Error"
**Solution:**
- Verify `FRONTEND_URL` in backend matches your frontend URL exactly
- No trailing slash in URLs
- Redeploy backend after changing CORS settings

### ❌ "MongoDB Connection Failed"
**Solution:**
- Check `MONGO_URI` is correct (no extra spaces)
- Verify MongoDB Atlas network access allows 0.0.0.0/0
- Check database user has correct permissions
- Verify password doesn't contain special characters (or is URL-encoded)

### ❌ "JWT Invalid"
**Solution:**
- Verify `JWT_SECRET` is set in backend
- Clear browser localStorage
- Try logging in again

### ❌ "Application Error" on Render
**Solution:**
- Check Render logs for specific error
- Verify `Start Command` is exactly: `node server.js`
- Verify all environment variables are set
- Check `package.json` exists in backend folder

---

## Performance Optimization

### After Deployment Works:

- [ ] Enable "Auto-Deploy" for both services (in Settings)
- [ ] Set up custom domain (optional)
- [ ] Monitor logs for errors
- [ ] Set up health check alerts (Render Pro feature)

---

## Environment Variable Generator

### Generate JWT_SECRET:

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Online:**
- Visit: https://randomkeygen.com/
- Use "Fort Knox Passwords" section

---

## MongoDB Atlas Setup Guide

1. **Create Account**: https://www.mongodb.com/cloud/atlas/register

2. **Create Cluster**:
   - Free tier (M0) is sufficient
   - Choose closest region
   - Cluster name: linguaplay-cluster

3. **Create Database User**:
   - Database Access → Add New Database User
   - Username: linguaplay-user
   - Password: (Generate secure password)
   - Built-in Role: Read and write to any database

4. **Network Access**:
   - Network Access → Add IP Address
   - Allow Access from Anywhere: 0.0.0.0/0
   - (Required for Render deployments)

5. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `linguaplay`

---

## Final Verification

### ✅ Everything Should Be:

- [ ] Backend service shows "Live" status on Render
- [ ] Frontend site shows "Live" status on Render
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Frontend loads without errors
- [ ] Login/Registration works
- [ ] Flashcards load and are interactive
- [ ] Progress tracking works (XP increases)
- [ ] All JLPT levels accessible (N5-N1)

---

## 🎉 Success Criteria

If all the following work, you're successfully deployed:

1. ✅ Can visit frontend URL and see login page
2. ✅ Can create new account
3. ✅ Can login with created account
4. ✅ See flashcards after login
5. ✅ XP increases when marking cards as known
6. ✅ No errors in browser console
7. ✅ Backend logs show "MongoDB Connected"

---

## Need Help?

### Check These First:
1. Render deployment logs (for errors)
2. Browser console (F12 → Console tab)
3. Network tab (F12 → Network tab)
4. Backend health endpoint response

### Deployment Logs Location:
- Backend: Render Dashboard → linguaplay-backend → Logs
- Frontend: Render Dashboard → linguaplay-frontend → Logs

---

**Estimated Total Deployment Time**: 30-45 minutes

**Free Tier Limitations on Render**:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~1 minute to wake up
- Consider upgrading to paid plan for production use

---

Good luck! 🚀
