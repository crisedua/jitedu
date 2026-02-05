# Multi-Expert Voice System Documentation

## Overview

The multi-expert system allows users to interact with different AI personas, each specialized in a specific domain. Each expert has their own personality, knowledge base, and optionally, their own voice.

## Features

### 1. **Expert Profiles**
Each expert has:
- **Name & Avatar**: Visual identity
- **Specialty**: Area of expertise (Digital Marketing, Productivity, Sales, etc.)
- **System Prompt**: AI personality and expertise definition
- **Color Theme**: Brand color for UI consistency
- **Voice ID**: Optional ElevenLabs voice for audio responses
- **Knowledge Base**: Linked transcripts relevant to their expertise
- **Domain Restriction**: Experts ONLY respond to questions within their specialty

### 2. **Pre-Configured Experts**

#### Alex Chen - Digital Marketing
- **Specialty**: SEO, social media, content strategy, growth hacking
- **Color**: Blue (#3B82F6)
- **Personality**: Confident, data-driven, actionable advice

#### Sarah Williams - Productivity
- **Specialty**: Time management, productivity systems, habits
- **Color**: Green (#10B981)
- **Personality**: Encouraging, supportive, practical

#### Marcus Johnson - Sales
- **Specialty**: Sales psychology, negotiation, closing techniques
- **Color**: Red (#EF4444)
- **Personality**: Confident, motivating, persuasive

#### Dr. Emily Rodriguez - Leadership
- **Specialty**: Leadership development, team building, culture
- **Color**: Purple (#8B5CF6)
- **Personality**: Professional, warm, thoughtful

#### Jake Morrison - Entrepreneurship
- **Specialty**: Startups, business models, growth strategies
- **Color**: Orange (#F59E0B)
- **Personality**: Direct, practical, experienced

## Database Schema

### Tables

**experts**
- `id`: UUID primary key
- `name`: Expert's full name
- `slug`: URL-friendly identifier
- `title`: Professional title
- `specialty`: Area of expertise
- `description`: Brief bio
- `system_prompt`: AI personality definition
- `voice_id`: ElevenLabs voice ID (optional)
- `color_theme`: Hex color code
- `is_active`: Boolean
- `sort_order`: Display order

**expert_transcripts**
- Links experts to relevant transcripts
- `expert_id`: Foreign key to experts
- `transcript_id`: Foreign key to transcripts
- `relevance_score`: 0.0 to 1.0

**user_preferences**
- Stores user's selected expert
- `user_id`: User identifier
- `selected_expert_id`: Foreign key to experts

## Setup Instructions

### 1. Database Setup

Run the SQL schema in Supabase:
```bash
# In Supabase SQL Editor, run:
supabase-experts-schema.sql
```

This creates:
- `experts` table with 5 pre-configured experts
- `expert_transcripts` linking table
- `user_preferences` table
- All necessary indexes and RLS policies

### 2. Auto-Assignment

Transcripts are automatically assigned to relevant experts based on keywords:

```javascript
const keywords = {
  'digital-marketing': ['marketing', 'seo', 'social media', 'advertising'],
  'productivity': ['productivity', 'time management', 'focus', 'habits'],
  'sales': ['sales', 'closing', 'negotiation', 'objection'],
  'leadership': ['leadership', 'management', 'team', 'culture'],
  'entrepreneurship': ['startup', 'business', 'entrepreneur', 'funding']
};
```

### 3. Voice Integration (Optional)

To enable voice responses:

1. Get an ElevenLabs API key from https://elevenlabs.io
2. Add to `.env`:
```bash
REACT_APP_ELEVENLABS_API_KEY=your_key_here
```

3. Assign voice IDs to experts in the database or admin panel

**Recommended ElevenLabs Voices:**
- Digital Marketing: Josh (TxGEqnHWrfWFTfGW9XjX)
- Productivity: Rachel (EXAVITQu4vr4xnSDxMaL)
- Sales: Adam (pNInz6obpgDQGcFmaJgB)
- Leadership: Bella (EXAVITQu4vr4xnSDxMaL)
- Entrepreneurship: Antoni (ErXwobaYiN019PkySvjV)

## Usage

### For Users

1. **Select Expert**: Click the expert selector in the top-right corner
2. **Choose Specialty**: Pick the expert that matches your question
3. **Ask Questions**: The AI responds ONLY within that expert's domain
4. **Voice Chat**: If using ElevenLabs widget, the voice will match the expert
5. **Domain Boundaries**: If you ask about unrelated topics, the expert will politely redirect
6. **Switch Anytime**: Change experts to get different perspectives or access different domains

**Important**: Each expert is restricted to their specialty. If you select "Jake Morrison - Entrepreneurship", you'll only get responses about entrepreneurship, startups, and business. Questions about marketing, productivity, etc. will be redirected.

### For Admins

1. **Manage Experts**: Navigate to `/experts`
2. **Create New**: Click "Nuevo Experto"
3. **Edit Existing**: Click "Editar" on any expert card
4. **Configure**:
   - Name, title, specialty
   - Description and system prompt
   - Color theme
   - Voice ID (optional)
   - Active status

### For Developers

**Get all experts:**
```javascript
import { getExperts } from './lib/experts';
const experts = await getExperts();
```

**Chat with expert:**
```javascript
import { chatWithExpert } from './lib/expert-chat';
const response = await chatWithExpert(expert, transcripts, chatHistory, question);
```

**Auto-assign transcript:**
```javascript
import { autoAssignTranscriptToExperts } from './lib/experts';
await autoAssignTranscriptToExperts(transcriptId, transcriptText, analysis);
```

## Customization

### Adding New Experts

1. Go to `/experts` admin panel
2. Click "Nuevo Experto"
3. Fill in all fields:
   - **Name**: Full name
   - **Slug**: URL-friendly (e.g., "data-science")
   - **Title**: Professional title
   - **Specialty**: Area of expertise
   - **Description**: Brief bio (1-2 sentences)
   - **System Prompt**: Define AI personality and expertise
   - **Color**: Choose brand color
   - **Voice ID**: Optional ElevenLabs voice

### Customizing System Prompts

System prompts define the expert's personality AND domain boundaries. Include:
- Who they are
- Their expertise and experience
- **CRITICAL**: What topics they WILL and WON'T discuss
- How they communicate
- What makes them unique
- Instructions for answering questions
- How to handle off-topic questions

Example:
```
You are [Name], a [title] with [X] years of experience.
You specialize EXCLUSIVELY in [areas].
You provide [type of advice].
Your tone is [personality traits].

STRICT RULES:
- ONLY answer questions about [specialty]
- If asked about other topics, redirect to your domain
- Never break character
- Always reference your expertise

When answering, you [specific behaviors].
```

### Linking Transcripts Manually

```javascript
import { linkTranscriptToExpert } from './lib/experts';
await linkTranscriptToExpert(expertId, transcriptId, relevanceScore);
```

## Architecture

### Component Flow

```
GlobalChat
  ├── ExpertSelector (choose expert)
  ├── Chat Input (ask questions)
  └── Messages (display responses)
      └── chatWithExpert()
          ├── Get expert's system prompt
          ├── Filter relevant transcripts
          └── Call OpenAI with expert context
```

### Data Flow

```
User selects expert
  ↓
Expert saved to localStorage & database
  ↓
User asks question
  ↓
System loads expert's transcripts
  ↓
AI responds as that expert
  ↓
Optional: Voice synthesis
```

## Best Practices

### For System Prompts

1. **Be Specific**: Define exact expertise and experience
2. **Set Tone**: Describe communication style clearly
3. **Give Examples**: Show how they should respond
4. **Set Boundaries**: Explain what's in/out of scope
5. **Add Personality**: Make them memorable and distinct

### For Knowledge Assignment

1. **Auto-assign**: Let the system assign based on keywords
2. **Review**: Check assignments in admin panel
3. **Manual Override**: Link specific transcripts when needed
4. **Relevance Scores**: Use 0.0-1.0 to indicate importance

### For Voice Integration

1. **Test Voices**: Try different voices for each expert
2. **Match Personality**: Voice should match written persona
3. **Consider Audience**: Choose appropriate tone and style
4. **Monitor Usage**: ElevenLabs has usage limits

## Troubleshooting

### Expert Not Showing

- Check `is_active` is true in database
- Verify expert has valid `slug` and `name`
- Clear browser cache and reload

### Wrong Transcripts Assigned

- Review keyword matching in `experts.js`
- Manually link/unlink transcripts in database
- Adjust relevance scores

### Voice Not Working

- Verify ELEVENLABS_API_KEY is set
- Check expert has valid `voice_id`
- Test API key with ElevenLabs dashboard
- Check browser console for errors

## Future Enhancements

- [ ] Expert analytics (usage stats, popular experts)
- [ ] Multi-expert conversations (experts discussing together)
- [ ] Expert recommendations based on question
- [ ] Custom expert creation by users
- [ ] Expert knowledge base visualization
- [ ] Voice cloning for custom experts
- [ ] Expert personality fine-tuning
- [ ] A/B testing different system prompts

## API Reference

See `src/lib/experts.js` for complete API documentation.

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in `src/lib/experts.js`
3. Check Supabase logs for database errors
4. Test with default experts first

---

**Version**: 1.0.0  
**Last Updated**: January 2025
