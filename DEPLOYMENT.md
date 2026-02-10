# 🚀 Deployment Guide - ColdCraftAI

## Deploy to Render + Vercel (Recommended - Free)

### Step 1: Deploy Backend on Render

1. Go to https://render.com and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect repository: `lakshita-01/ColdCraftAI`
4. Configure:
   - **Name**: `coldcraft-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
5. Click **"Create Web Service"**
6. **Copy the deployed URL** (e.g., `https://coldcraft-backend.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import repository: `lakshita-01/ColdCraftAI`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://coldcraft-backend.onrender.com` (your Render URL from Step 1)
6. Click **"Deploy"**

### Done! 🎉

Your app is now live:
- **Frontend**: Provided by Vercel
- **Backend**: Provided by Render

## Alternative: Deploy to Railway

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `lakshita-01/ColdCraftAI`
4. Railway auto-detects and deploys both services
5. Set `VITE_API_URL` in frontend service to backend URL

## Post-Deployment Checklist

✅ Test AI email generation  
✅ Check dashboard analytics (1,200+ records)  
✅ Verify SMTP settings (optional)  
✅ Confirm Puter.js AI loads correctly

## Troubleshooting

- **CORS errors**: Verify `VITE_API_URL` matches backend URL exactly
- **Database empty**: Check Render logs - SQLite auto-seeds on first run
- **AI not working**: Puter.js requires internet connection (client-side)
