# Focus Time Tracker

A powerful productivity app that integrates with Microsoft To Do to track your focus time, analyze study patterns, and boost productivity with detailed weekly and monthly analytics.

## Features

- **⏱️ Focus Timer**: Pomodoro-style timer with customizable focus and break sessions
- **📋 Microsoft To Do Integration**: Seamlessly connect with your existing tasks
- **📊 Analytics Dashboard**: Comprehensive weekly and monthly productivity insights
- **🎯 Goal Setting**: Set and track daily and weekly focus targets
- **📈 Productivity Score**: Get a calculated score based on your focus patterns
- **🔔 Session Tracking**: Automatic logging of all focus sessions with task association

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Microsoft Azure AD (MSAL)
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Microsoft Azure account (for Azure AD app registration)
- Supabase account (for database)

### 1. Clone the Repository

```bash
git clone https://github.com/sahoojr09/focus-time-tracker.git
cd focus-time-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Microsoft Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Name: "Focus Time Tracker"
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI: `http://localhost:3000` (for development)
7. Click **Register**
8. Copy the **Application (client) ID**
9. Go to **API permissions** > **Add a permission** > **Microsoft Graph**
10. Add these permissions:
    - `User.Read`
    - `Tasks.Read`
    - `Tasks.ReadWrite`
11. Grant admin consent

### 4. Set Up Supabase

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run this schema:

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

-- Create indexes
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_start_time ON focus_sessions(start_time);
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
```

4. Copy your **Project URL** and **anon public key** from Settings > API

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_azure_client_id
NEXT_PUBLIC_MICROSOFT_AUTHORITY=https://login.microsoftonline.com/common
NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=http://localhost:3000
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Update Azure AD redirect URI to your Vercel domain
6. Deploy!

## Usage

1. **Sign In**: Click "Sign in with Microsoft" to authenticate
2. **Select Task**: Choose a task from your Microsoft To Do lists
3. **Start Timer**: Click Start to begin a focus session
4. **Track Progress**: View your analytics in the Analytics tab
5. **Set Goals**: Configure your daily and weekly targets in Settings

## Features in Detail

### Focus Timer
- 25-minute focus sessions (Pomodoro technique)
- 5-minute break sessions
- Task association with Microsoft To Do
- Automatic session logging

### Analytics
- **Weekly View**: Daily breakdown, most productive day, average session length
- **Monthly View**: Total hours, productivity score, daily average
- **Visual Charts**: Bar charts and progress indicators
- **Task Completion**: Track tasks completed during focus sessions

### Settings
- Customizable daily and weekly goals
- Account information display
- Future: Notification preferences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

## Acknowledgments

- Inspired by productivity apps like Regain, Forest, and Focus@Will
- Built with modern web technologies
- Microsoft Graph API for To Do integration

---

**Made with ❤️ for productivity enthusiasts**