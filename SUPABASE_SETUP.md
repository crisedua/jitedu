# Supabase Setup Guide

This guide will help you set up Supabase for the Marketing Analyzer IA application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `marketing-analyzer-ia`
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" 
4. Copy the following values:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Replace the placeholder values:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy and paste the entire content from `supabase-schema.sql`
5. Click "Run" to execute the schema

This will create all the necessary tables:
- `projects` - Store analysis projects
- `videos` - Store video information and transcripts
- `techniques` - Store marketing techniques
- `video_techniques` - Link videos to detected techniques
- `tags` - Store tags for organization
- `technique_tags` - Link techniques to tags

## 5. Configure Row Level Security (RLS)

The schema includes basic RLS policies that allow all operations. For production, you should:

1. Set up proper authentication
2. Create user-specific policies
3. Restrict access based on user roles

## 6. Test the Connection

1. Start your React app: `npm start`
2. Open the browser console
3. Check for any Supabase connection errors
4. Try creating a new analysis to test the database operations

## 7. Optional: Set Up Real-time Subscriptions

The app includes real-time features for monitoring analysis progress. These should work automatically once your database is set up.

## 8. Database Views and Functions

The schema includes helpful views:
- `technique_stats` - Statistics about technique usage
- `project_stats` - Statistics about projects

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check that your environment variables are correct
   - Restart your development server after changing `.env`

2. **"relation does not exist"**
   - Make sure you ran the complete schema from `supabase-schema.sql`
   - Check the SQL Editor for any errors

3. **"RLS policy violation"**
   - The schema includes permissive policies for development
   - Check that RLS is properly configured

4. **Connection timeout**
   - Check your internet connection
   - Verify the Supabase project URL is correct

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Discord](https://discord.supabase.com)
- Check the browser console for detailed error messages

## Production Considerations

Before deploying to production:

1. **Security**: Implement proper RLS policies
2. **Authentication**: Set up user authentication
3. **Backup**: Configure automated backups
4. **Monitoring**: Set up monitoring and alerts
5. **Performance**: Add appropriate indexes for your queries

## Database Schema Overview

```
projects
├── id (UUID, Primary Key)
├── name (Text)
├── description (Text)
├── settings (JSONB)
├── created_at (Timestamp)
└── updated_at (Timestamp)

videos
├── id (UUID, Primary Key)
├── project_id (UUID, Foreign Key → projects.id)
├── title (Text)
├── channel (Text)
├── url (Text)
├── transcript (Text)
├── summary (Text)
├── status (Text: pending|processing|completed|error)
├── error_message (Text)
├── duration (Integer)
├── published_at (Timestamp)
├── created_at (Timestamp)
└── updated_at (Timestamp)

techniques
├── id (UUID, Primary Key)
├── name (Text)
├── category (Text: conversion|credibility|engagement|awareness)
├── description (Text)
├── objective (Text)
├── funnel_stage (Text: awareness|consideration|conversion|retention)
├── confidence_score (Decimal 0-1)
├── created_at (Timestamp)
└── updated_at (Timestamp)

video_techniques
├── id (UUID, Primary Key)
├── video_id (UUID, Foreign Key → videos.id)
├── technique_id (UUID, Foreign Key → techniques.id)
├── evidence (Text)
├── timestamp_start (Integer)
├── timestamp_end (Integer)
├── confidence_score (Decimal 0-1)
└── created_at (Timestamp)
```

This schema supports the full functionality of the Marketing Analyzer IA application with proper relationships and constraints.