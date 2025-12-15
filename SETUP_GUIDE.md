# Complete Setup Guide

This guide will walk you through setting up the Focus Time Tracker app from scratch.

## Table of Contents
1. [Azure AD Setup](#azure-ad-setup)
2. [Supabase Setup](#supabase-setup)
3. [Local Development](#local-development)
4. [Deployment](#deployment)

## Azure AD Setup

### Step 1: Create Azure AD App Registration

1. Visit [Azure Portal](https://portal.azure.com)
2. Search for "Azure Active Directory" in the top search bar
3. Click on **App registrations** in the left sidebar
4. Click **+ New registration**

### Step 2: Configure App Registration

**Basic Information:**
- **Name**: Focus Time Tracker
- **Supported account types**: Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"
- **Redirect URI**: 
  - Platform: Web
  - URI: `http://localhost:3000` (for development)

Click **Register**

### Step 3: Note Your Client ID

After registration, you'll see the **Overview** page:
- Copy the **Application (client) ID** - you'll need this for your `.env.local` file

### Step 4: Add API Permissions

1. Click **API permissions** in the left sidebar
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Search and add these permissions:
   - `User.Read` (should already be there)
   - `Tasks.Read`
   - `Tasks.ReadWrite`
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin rights)

### Step 5: Configure Authentication

1. Click **Authentication** in the left sidebar
2. Under **Platform configurations**, click on your Web platform
3. Add additional redirect URIs if needed:
   - For production: `https://your-domain.vercel.app`
4. Under **Implicit grant and hybrid flows**, check:
   - ✅ Access tokens
   - ✅ ID tokens
5. Click **Save**

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click **Start your project**
3. Sign in with GitHub
4. Click **New project**
5. Fill in:
   - **Name**: focus-time-tracker
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
6. Click **Create new project**
7. Wait for project to be provisioned (2-3 minutes)

### Step 2: Create Database Schema

1. Once project is ready, click **SQL Editor** in the left sidebar
2. Click **+ New query**
3. Copy and paste this SQL:

```sql
-- Create focus_sessions table
CREATE TABLE focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id TEXT,
  task_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'break')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_goals table
CREATE TABLE user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  daily_target_minutes INTEGER DEFAULT 240,
  weekly_target_minutes INTEGER DEFAULT 1680,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_start_time ON focus_sessions(start_time);
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);

-- Enable Row Level Security
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on focus_sessions" ON focus_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_goals" ON user_goals
  FOR ALL USING (true) WITH CHECK (true);
```

4. Click **Run** or press `Ctrl+Enter`
5. You should see "Success. No rows returned"

### Step 3: Get API Credentials

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** under Project Settings
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

## Local Development

### Step 1: Clone and Install

```bash
git clone https://github.com/sahoojr09/focus-time-tracker.git
cd focus-time-tracker
npm install
```

### Step 2: Configure Environment Variables

Create `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Microsoft Azure AD Configuration
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_MICROSOFT_AUTHORITY=https://login.microsoftonline.com/common
NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=http://localhost:3000
```

Replace:
- `your-project.supabase.co` with your Supabase Project URL
- `your-anon-key-here` with your Supabase anon key
- `your-client-id-here` with your Azure AD Application (client) ID

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Test the App

1. Click "Sign in with Microsoft"
2. Sign in with your Microsoft account
3. Grant permissions when prompted
4. You should see the dashboard!

## Deployment

### Deploy to Vercel

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click **Add New** > **Project**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**:
   - In Vercel project settings, go to **Environment Variables**
   - Add all variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
     - `NEXT_PUBLIC_MICROSOFT_AUTHORITY`
     - `NEXT_PUBLIC_MICROSOFT_REDIRECT_URI` (use your Vercel domain)

4. **Update Azure AD Redirect URI**:
   - Go back to Azure Portal > Your App Registration
   - Click **Authentication**
   - Add your Vercel domain as a redirect URI:
     - `https://your-app.vercel.app`
   - Click **Save**

5. **Deploy**:
   - Click **Deploy** in Vercel
   - Wait for deployment to complete
   - Visit your app at `https://your-app.vercel.app`

## Troubleshooting

### "AADSTS50011: The redirect URI specified in the request does not match"
- Make sure your redirect URI in Azure AD matches exactly (including http/https)
- Check for trailing slashes

### "Failed to fetch tasks"
- Verify API permissions are granted in Azure AD
- Check that you granted admin consent
- Try signing out and signing in again

### "Supabase error: relation does not exist"
- Make sure you ran the SQL schema in Supabase
- Check that tables were created successfully
- Verify your Supabase URL and key are correct

### Timer not saving sessions
- Check browser console for errors
- Verify Supabase connection
- Check that RLS policies are set correctly

## Next Steps

- Customize the timer durations
- Add more analytics views
- Implement notifications
- Add export functionality
- Create mobile app version

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the [README.md](README.md)
3. Open an issue on GitHub

Happy focusing! 🎯