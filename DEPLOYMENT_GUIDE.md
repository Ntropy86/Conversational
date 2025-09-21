# Backend Deployment Guide - Render.com

## Files Created for Deployment

✅ **render.yaml** - Deployment configuration (created in repository root)
✅ **Updated CORS settings** - Modified `api_server.py` to allow your frontend domain
✅ **Environment variables documented** - Updated `.env.example` with production settings

## What You Need to Do:

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Deploy on Render.com

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New" → "Blueprint"**
4. **Connect your GitHub repository** (`Conversational`)
5. **Render will automatically detect** the `render.yaml` file
6. **Click "Apply"** to start deployment

### Step 3: Set Environment Variables

After deployment starts, you need to set your API key:

1. **Go to your Render dashboard**
2. **Click on your service** (conversational-ai-backend)
3. **Go to "Environment" tab**
4. **Add these variables:**
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ENVIRONMENT=production
   ```

### Step 4: Update Frontend Configuration

Once deployed, Render will give you a URL like: `https://conversational-ai-backend.onrender.com`

Update your frontend's environment variables:
```env
NEXT_PUBLIC_API_URL=https://conversational-ai-backend.onrender.com
```

### Step 5: Update CORS (Optional - More Secure)

Once you know your exact Vercel URL, you can make CORS more restrictive by editing `api_server.py`:

```python
allow_origins=[
    "http://localhost:3000",  # Development
    "https://your-exact-vercel-url.vercel.app",  # Your actual frontend URL
],
```

## Important Notes:

### ⚠️ Cold Starts
- Your backend will "sleep" after 15 minutes of inactivity
- First request after sleeping takes 20-30 seconds to wake up
- This is normal for free tier

### 🔒 Security
- Never commit your actual `.env` file with real API keys
- Only set environment variables through Render's dashboard

### 🚀 Deployment Status
- Deployment takes 2-5 minutes
- You can watch logs in Render dashboard
- Green "Live" badge means it's ready

### 🐛 Troubleshooting
- If deployment fails, check the "Logs" tab in Render dashboard
- Common issues: missing dependencies, wrong Python version
- The `render.yaml` handles most configuration automatically

## Your Backend Will Be Available At:
`https://conversational-ai-backend.onrender.com`

## Testing Your Deployment:
Once live, test these endpoints:
- `https://your-backend-url.onrender.com/` (should return "AI Assistant API is running")
- `https://your-backend-url.onrender.com/session/create` (should create a session)

---

**That's it!** Your backend will be deployed and ready to handle requests from your frontend. The free tier gives you unlimited hours with the only downside being cold starts after inactivity.