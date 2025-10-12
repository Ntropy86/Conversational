# 🚀 Supabase Database Setup Guide

## Overview
This guide will help you set up a **private Supabase database** for your Hugging Face Spaces deployment. The database will store:
- **Guestbook signatures** (persistent storage)
- **AI session logs** (prompts and responses per session)

## Why Supabase?
✅ **Private**: Completely separate from your public HF repo  
✅ **Free**: 500MB database, 2 projects  
✅ **PostgreSQL**: Full SQL database  
✅ **HF Compatible**: Works perfectly with public repos  
✅ **Easy Setup**: Just environment variables  

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Choose your organization
5. Enter project details:
   - **Name**: `conversational-ai-db`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click **"Create new project"**
7. Wait for setup to complete (~2 minutes)

## Step 2: Get Database Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase_schema.sql`
3. Click **"Run"** to create tables

This creates:
- `guestbook_signatures` table
- `ai_sessions` table  
- `ai_interactions` table
- Indexes and security policies

## Step 4: Configure Environment Variables

### For Hugging Face Spaces:
1. Go to your HF Space settings
2. Add these **Secret** environment variables:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### For Local Development:
1. Copy `env.example` to `.env`
2. Add your Supabase credentials:

```bash
# Supabase Database Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
USE_DATABASE=true
FALLBACK_TO_JSON=false
```

## Step 5: Test the Setup

### Test Database Connection:
```bash
cd backend
python -c "
from database_service import db_service
print('✅ Database connection successful!')
print('Supabase URL:', db_service.supabase_url)
"
```

### Test Guestbook API:
```bash
curl -X POST http://localhost:8000/api/guestbook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "emoji": "🎨",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

### Test Session Logging:
```bash
curl http://localhost:8000/api/session/stats
```

## Step 6: Deploy to Hugging Face

1. **Push your changes** to the HF repo:
   ```bash
   git add .
   git commit -m "Add Supabase database integration"
   git push
   ```

2. **Set environment variables** in HF Space settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

3. **Restart your Space** - it will automatically use the database!

## Database Schema Details

### Tables Created:

#### `guestbook_signatures`
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `emoji` (VARCHAR)
- `image_data` (TEXT - Base64)
- `created_at` (TIMESTAMP)

#### `ai_sessions`
- `id` (UUID, Primary Key)
- `user_id` (VARCHAR, Optional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `ai_interactions`
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key)
- `prompt` (TEXT)
- `response` (TEXT)
- `model_used` (VARCHAR)
- `tokens_used` (INTEGER)
- `created_at` (TIMESTAMP)

## Security Features

✅ **Row Level Security (RLS)** enabled  
✅ **Public read access** to guestbook signatures  
✅ **Public insert access** to guestbook signatures  
✅ **Public access** to AI logging tables  
✅ **Automatic timestamp updates**  

## Fallback System

If Supabase is unavailable, the system automatically falls back to:
- **JSON file storage** for guestbook signatures
- **Console logging** for AI sessions

## Monitoring & Analytics

### View Data in Supabase:
1. Go to **Table Editor** in Supabase dashboard
2. Browse your tables:
   - `guestbook_signatures` - All signatures
   - `ai_sessions` - Session metadata
   - `ai_interactions` - All prompts/responses

### API Endpoints:
- `GET /api/guestbook` - Get all signatures
- `POST /api/guestbook` - Save signature
- `GET /api/session/stats` - Current session stats
- `POST /api/session/end` - End session & get stats

## Troubleshooting

### Common Issues:

**1. "Database service unavailable"**
- Check environment variables are set correctly
- Verify Supabase project is active
- Check network connectivity

**2. "Failed to log AI interaction"**
- Database is optional - system continues working
- Check Supabase logs in dashboard

**3. "Guestbook signatures not saving"**
- Falls back to JSON file automatically
- Check Supabase table permissions

### Debug Commands:
```bash
# Check environment variables
python -c "import os; print('SUPABASE_URL:', os.getenv('SUPABASE_URL'))"

# Test database connection
python -c "from database_service import db_service; print('Connected!')"

# View recent signatures
curl http://localhost:8000/api/guestbook
```

## Cost & Limits

### Supabase Free Tier:
- **500MB** database storage
- **2GB** bandwidth per month
- **2** projects
- **50MB** file storage

### Estimated Usage:
- **Guestbook signatures**: ~50KB each (with image)
- **AI interactions**: ~1KB each
- **100 signatures + 1000 interactions** = ~150MB total

## Next Steps

1. ✅ **Set up Supabase project**
2. ✅ **Configure environment variables**
3. ✅ **Deploy to Hugging Face**
4. ✅ **Test guestbook functionality**
5. ✅ **Monitor AI session logs**

Your database is now **private**, **persistent**, and **completely separate** from your public HF repo! 🎉

## Support

If you need help:
1. Check Supabase dashboard logs
2. Verify environment variables
3. Test with curl commands above
4. Check HF Space logs

The system is designed to **gracefully degrade** - if the database is unavailable, it falls back to file storage automatically.
