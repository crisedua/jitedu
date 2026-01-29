# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `.env` and add your credentials:
- **Supabase URL & Key**: Get from https://supabase.com (create a free project)
- **OpenRouter API Key**: Get from https://openrouter.ai (sign up and create API key)

### 2. Setup Database

Run the SQL schema in your Supabase project:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL

This creates all necessary tables: projects, videos, techniques, video_techniques, tags, technique_tags.

### 3. Start the App

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 📝 How to Use

### Analyze Your First Transcript

1. **Click "Nuevo Análisis"** (New Analysis) in the navigation

2. **Fill in the form** (4 simple steps):
   - **Step 1**: Project name and description
   - **Step 2**: Video title, channel name, URL (optional)
   - **Step 3**: Paste the full transcript (50-10,000 words)
   - **Step 4**: Select language and review summary

3. **Click "Iniciar Análisis IA"** (Start AI Analysis)
   - The AI will analyze the transcript
   - Detects marketing techniques in 4 categories
   - Extracts evidence with context
   - Generates executive summary

4. **View Results**
   - See all detected techniques
   - Read evidence and confidence scores
   - Explore recommendations
   - Save to your library

### Explore Your Library

- **Dashboard**: See all your analyzed videos
- **Technique Library**: Browse all detected techniques
- **Search & Filter**: Find specific techniques by category, funnel stage, or keyword
- **Technique Detail**: Deep dive into specific techniques with all evidence

---

## 🎯 What Gets Analyzed

The AI detects techniques in 4 main categories:

### 1. CONVERSION
Techniques to convert audience into customers:
- Urgency (deadlines, limited offers)
- Scarcity (limited availability, exclusivity)
- CTAs (direct calls to action)
- Objection handling
- Guarantees and risk reduction

### 2. CREDIBILITY
Techniques to build trust:
- Social proof (testimonials, numbers, success stories)
- Authority (credentials, experience, data)
- Transparency and authenticity
- Evidence and proof

### 3. ENGAGEMENT
Techniques to maintain attention:
- Hooks (first 5-10 seconds)
- Storytelling (narratives, emotional arcs)
- Pattern interrupts (rhythm changes)
- Rhetorical questions
- Curiosity and information gaps

### 4. AWARENESS
Techniques to generate knowledge:
- Brand positioning
- Unique value proposition
- Market education
- Competitive differentiation

---

## 💡 Tips for Best Results

### Transcript Quality
- **Minimum 50 words**: Too short won't provide enough context
- **Maximum 10,000 words**: Very long transcripts may take longer to process
- **Clean text**: Remove timestamps if they're inline with text
- **Complete sentences**: Better results with full sentences vs fragments

### Video Information
- **Accurate title**: Helps AI understand context
- **Channel name**: Provides additional context about the creator
- **URL**: Optional but useful for reference

### Language Selection
- **Spanish**: Best for Spanish content
- **English**: Best for English content
- **Auto-detect**: Let the AI figure it out (works well but less precise)

---

## 🔧 Troubleshooting

### "API key is required for AI analysis"
- Check that `REACT_APP_OPENROUTER_API_KEY` is set in `.env`
- Restart the development server after changing `.env`

### "Supabase error"
- Verify `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are correct
- Make sure you ran the SQL schema in your Supabase project
- Check Supabase dashboard for any errors

### "Transcript is too short/long"
- Minimum: 50 words
- Maximum: 10,000 words
- Check word count in the UI before submitting

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📊 Example Transcript

Here's a sample transcript you can use to test:

```
Welcome to this video where we're going to talk about the 10 most effective marketing strategies for 2024. 

First, let's talk about the importance of creating urgency in your offers. You only have until midnight to take advantage of this unique opportunity. This is not something that will be available forever.

Second, social proof is crucial. We've helped over 10,000 businesses increase their sales by 300% in just 6 months. Don't just take my word for it - check out the testimonials from our satisfied customers.

Third, storytelling is key. Let me tell you about Sarah, who was struggling with her business until she discovered this one simple technique. Within 30 days, she had doubled her revenue.

The secret is to combine urgency with social proof and wrap it all in a compelling story. This is exactly what the top marketers are doing right now.

If you want to learn more, click the link in the description and sign up for our free masterclass. But hurry - we only have 50 spots available and they're filling up fast.

Remember, the difference between success and failure is often just one decision. Make that decision today.
```

This transcript contains multiple techniques:
- Urgency ("until midnight", "not available forever")
- Social proof ("10,000 businesses", "300% increase")
- Storytelling (Sarah's story)
- CTAs ("click the link", "sign up")
- Scarcity ("only 50 spots")

---

## 🎓 Next Steps

1. **Analyze more transcripts**: Build your technique library
2. **Explore patterns**: See which techniques appear most often
3. **Compare videos**: Identify what works best
4. **Apply insights**: Use detected techniques in your own content

Happy analyzing! 🚀
