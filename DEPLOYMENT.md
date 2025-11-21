# 🚀 WasteMap Deployment Guide

Complete guide to deploy WasteMap to production.

## 📋 Prerequisites

Before deploying, ensure you have:
- GitHub account
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Render account (for backend)
- Vercel account (for frontend)
- Gmail account (for emails)

---

## 🗄️ Step 1: Setup MongoDB Atlas

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create Cluster**:
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select your closest region
   - Name it `wastemap-cluster`
   - Click "Create"

3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `wastemap-admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: Read and write to any database
   - Click "Add User"

4. **Whitelist IP**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `wastemap`
   - Save this string!

---

## ☁️ Step 2: Setup Cloudinary

1. **Create Account**: Go to [Cloudinary](https://cloudinary.com/users/register/free)

2. **Get Credentials**:
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret
   - Save these!

---

## 📧 Step 3: Setup Gmail App Password

1. **Enable 2-Factor Authentication**:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Turn it on

2. **Create App Password**:
   - Go to Security → 2-Step Verification
   - Scroll to "App passwords"
   - Select app: Mail
   - Select device: Other (Custom name): "WasteMap"
   - Click "Generate"
   - Copy the 16-character password (save it!)

---

## 🖥️ Step 4: Deploy Backend (Render)

1. **Prepare Backend**:
   ```bash
   cd backend
   # Make sure package.json has:
   # "engines": { "node": ">=16.0.0" }
   ```

2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

3. **Create Render Account**: Go to [Render](https://render.com)

4. **Create Web Service**:
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `wastemap-backend`
     - Region: Choose closest
     - Branch: `main`
     - Root Directory: `backend`
     - Runtime: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Instance Type: Free

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   EMAIL_FROM=WasteMap <noreply@wastemap.com>
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy**:
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Copy your backend URL (e.g., `https://wastemap-backend.onrender.com`)

---

## 🌐 Step 5: Deploy Frontend (Vercel)

1. **Update Frontend URLs** (temporarily):
   ```bash
   cd frontend
   # Create .env.production file:
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```

2. **Create Vercel Account**: Go to [Vercel](https://vercel.com)

3. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     VITE_SOCKET_URL=https://your-backend-url.onrender.com
     ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Copy your frontend URL

6. **Update Backend FRONTEND_URL**:
   - Go back to Render
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Save and redeploy

---

## ✅ Step 6: Verify Deployment

### Test Backend:
```bash
# Check health
curl https://your-backend-url.onrender.com

# Should return: {"message":"WasteMap API is running..."}
```

### Test Frontend:
1. Visit your Vercel URL
2. Register a new account
3. Check email for verification
4. Login
5. Create a test report
6. Verify map and images work

---

## 🔧 Step 7: Make Yourself Admin

1. **Connect to MongoDB Atlas**:
   - Go to MongoDB Atlas
   - Click "Browse Collections"
   - Select `wastemap` database
   - Select `users` collection
   - Find your user by email

2. **Update User Role**:
   - Click "Edit" on your user document
   - Change `"role": "user"` to `"role": "admin"`
   - Save

3. **Test Admin Access**:
   - Logout and login again
   - Navigate to `/admin`
   - You should see the admin dashboard

---

## 🐛 Troubleshooting

### Backend Issues:

**Issue**: "Cannot connect to database"
- Check MongoDB Atlas connection string
- Verify IP whitelist (should be 0.0.0.0/0)
- Check database user credentials

**Issue**: "Email not sending"
- Verify Gmail App Password (16 characters, no spaces)
- Check 2FA is enabled on Google account
- Try regenerating app password

**Issue**: "Cloudinary upload failed"
- Verify Cloud Name, API Key, API Secret
- Check Cloudinary account is active

### Frontend Issues:

**Issue**: "Cannot fetch data"
- Check `VITE_API_URL` environment variable
- Verify backend is running and accessible
- Check CORS settings in backend

**Issue**: "Socket not connecting"
- Check `VITE_SOCKET_URL` environment variable
- Verify backend Socket.io is working

### Common Issues:

**Issue**: Render free tier sleeps after 15 minutes
- First request may be slow (cold start)
- Consider upgrading to paid tier for production

**Issue**: Images not uploading
- Check Cloudinary quota (free tier: 25 credits/month)
- Verify API credentials

---

## 📊 Monitoring

### Backend Logs (Render):
- Go to your service dashboard
- Click "Logs" tab
- Monitor for errors

### Frontend Logs (Vercel):
- Go to your project
- Click "Deployments"
- Click on latest deployment
- View "Function Logs"

---

## 🔄 Updating Your App

### Backend Updates:
```bash
cd backend
# Make changes
git add .
git commit -m "Update: description"
git push origin main
# Render auto-deploys on push
```

### Frontend Updates:
```bash
cd frontend
# Make changes
git add .
git commit -m "Update: description"
git push origin main
# Vercel auto-deploys on push
```

---

## 🎯 Custom Domain (Optional)

### Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render (Backend):
1. Go to Service Settings
2. Click "Custom Domains"
3. Add your custom domain
4. Update DNS records

---

## 💰 Cost Breakdown

**Free Tier Limits**:
- MongoDB Atlas: 512MB storage
- Cloudinary: 25 credits/month (~7,500 images)
- Render: 750 hours/month (sleeps after 15 min inactivity)
- Vercel: 100GB bandwidth/month

**Total Monthly Cost**: $0 (Free) 🎉

---

## ✨ Post-Deployment Checklist

- [ ] Backend is accessible
- [ ] Frontend is accessible
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Create report works
- [ ] Image upload works
- [ ] Map displays correctly
- [ ] Admin panel accessible
- [ ] Real-time notifications work
- [ ] CSV export works
- [ ] All environment variables set

---

## 🎉 Success!

Your WasteMap application is now live! 🚀

**Share your links**:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

---

## 📞 Need Help?

If you encounter issues:
1. Check logs in Render/Vercel
2. Verify all environment variables
3. Test API endpoints directly
4. Check MongoDB connection
5. Review this guide again

Good luck! 🍀