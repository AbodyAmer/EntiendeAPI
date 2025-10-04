# CLAUDE.md - Efham Project Context

## Project Overview

**Efham** (افهم - "Understand" in Arabic) is a practical Arabic learning application that teaches users the exact phrases they need for real-life situations. Unlike traditional language learning apps that focus on grammar rules or random sentences, Efham organizes learning by actual scenarios users face - from ordering at restaurants to navigating airports to attending cultural events like weddings.

## Version 1.1.0 Update

We've recently transitioned from v1.0.0 to v1.1.0 with a significant strategic pivot:
- **Removed**: Story-based learning format
- **Added**: Fill-in-the-blank exercises as the primary learning method
- **Focus**: Interactive practice through contextual sentence completion

## What Problem We Solve

People learning Arabic face a critical gap: they can study grammar and vocabulary for years but still freeze when they need to actually speak in real situations. They don't know:
- What to say when entering a restaurant
- How to handle airport immigration questions  
- What's appropriate at a wedding or funeral
- How to ask for help in an emergency
- The cultural context of when/how to use phrases

## Our Solution

Efham provides a **situation-first learning system** where users can:
1. **Browse by real-life situation** (15 core situations like Airport, Restaurant, Wedding, Emergency)
2. **Learn 30-50 practical phrases per situation** that natives actually use
3. **Practice with fill-in-the-blank exercises** that reinforce natural speech patterns
4. **Hear native speaker audio** for every phrase (normal and slow speeds)
5. **Understand cultural context** - not just what to say, but when, how, and to whom

## Target Users

### Primary Audiences:
1. **Travelers** (30%) - Need survival phrases quickly for upcoming trips
2. **Expats/Immigrants** (40%) - Living in Arab countries, need daily communication skills
3. **Heritage Learners** (20%) - Arab diaspora reconnecting with their roots
4. **Professionals** (10%) - Working with Arab clients/colleagues

### User Pain Points:
- "I studied Arabic for months but couldn't order coffee"
- "I don't know if I'm being polite or rude"
- "I need airport phrases for tomorrow's flight"
- "Textbook Arabic doesn't match what people actually say"

## Core Features (v1.1.0)

### 1. Situation Library
- **15 real-life situations** organized into 3 categories:
  - **ESSENTIAL** (Survival): Airport, Restaurant, Shopping, Emergency, Transportation
  - **SOCIAL** (Integration): Greetings, Making Friends, Phone Calls, Workplace, Neighbors
  - **CULTURAL** (Deep Integration): Weddings, Funerals, Religious Settings, Family Gatherings, Holidays
- Each situation contains 30-50 carefully curated phrases

### 2. Fill-in-the-Blank Practice (New in v1.1.0)
- **Context-rich exercises**: "You're at a restaurant, the waiter asks..."
- **Pattern-based learning**: Users learn transferable structures, not just memorization
- **Smart distractors**: Wrong answers that test understanding
- **Immediate feedback**: Learn from mistakes instantly

### 3. Native Speaker Audio
- Every phrase recorded by native Arabic speakers
- Normal speed + slow speed options
- Clear pronunciation for learner imitation

### 4. Cultural Intelligence
- **When to use**: Specific contexts for each phrase
- **Who to say it to**: Formality levels and audience
- **Cultural notes**: Avoid faux pas, understand etiquette
- **What to say next**: Natural conversation flow

### 5. Multi-Dialect Support
- **MSA** (Modern Standard Arabic) as foundation
- **Egyptian** dialect (ready in production)
- **Saudi** dialect (ready in production)
- Future: Levantine and Maghrebi dialects

## What Makes Efham Different

### vs. Competitors (Clozemaster, Duolingo, etc.)
- **No nonsensical sentences**: Every phrase is verified by native speakers as natural and useful
- **Situation-organized**: Not random phrases but organized by when you'll use them
- **Cultural depth**: Not just translation but full context of appropriate usage
- **Just-in-time learning**: Learn what you need for tomorrow's situation today
- **Quality over quantity**: 500 perfect phrases vs 50,000 random sentences

### Our Unique Position
Think of Efham as "**The Lonely Planet Phrasebook reimagined as an intelligent app**" - combining:
- Trusted, curated content
- Situation-based organization
- Interactive practice
- Audio pronunciation
- Cultural intelligence
- Progress tracking

## Content Quality Standards

Every phrase in Efham must be:
1. **Actually used by native speakers** in real life
2. **Culturally appropriate** with proper formality
3. **Immediately practical** for the target situation
4. **Short enough to remember** (3-10 words typically)
5. **Pattern-based** to enable creative language use

## Business Model

- **Paid-only strategy**: No free tier to filter out non-serious users
- **Pricing**: $8.99/month or annual discount
- **Launch strategy**: Introductory pricing for early adopters
- **Value proposition**: Quality content worth paying for

## Success Metrics

- Users can confidently handle real-life situations after using Efham
- Phrases learned translate directly to successful real-world interactions
- Users report feeling prepared and culturally aware
- High retention due to practical value

## Vision

Transform Arabic learning from an academic exercise into a practical skill. Every Efham user should be able to walk into any situation - restaurant, airport, wedding, emergency - and know exactly what to say, how to say it, and feel confident they're being culturally appropriate.

## Current Development Focus (v1.1.0)

The shift to fill-in-the-blank exercises represents our commitment to active learning over passive consumption. Users don't just read phrases - they practice them in context, building muscle memory for real conversations. This interactive approach, combined with our situational organization and cultural depth, creates a complete solution for practical Arabic communication.

## Key Principles

1. **Practical over theoretical** - If you won't say it in real life, we don't teach it
2. **Quality over quantity** - Better to master 500 useful phrases than struggle with 5000 random ones
3. **Context is king** - Every phrase comes with full situational and cultural context
4. **Active practice** - Fill-in-the-blank exercises ensure active engagement, not passive reading
5. **Native verification** - Every phrase personally reviewed by native Arabic speakers

## The Efham Promise

When you use Efham, you're not learning Arabic from a textbook or algorithm. You're learning the exact phrases that native speakers use, organized by the situations where you'll need them, with the cultural intelligence to use them appropriately. Whether you're ordering food, catching a flight, or attending a wedding, Efham ensures you know what to say and how to say it with confidence.


# Technical Architecture

## Database Schema (v1.1.0) - Single Collection Architecture

We've evolved to a **single-collection embedded architecture** that maximizes performance and simplifies data management.

### Main Collection: **PhraseV2**
A comprehensive document that contains everything about a phrase - its meaning, all dialect variations, and all exercises.

**Document Structure:**
```javascript
{
  // Core phrase information
  englishTranslation: String,
  category: ObjectId (ref: Category),
  situation: ObjectId (ref: Situation),
  commonRank: Number,

  // Context and usage
  context: {
    whenToUse: String,
    whoToSayTo: String,
    speaker: String,
    listener: String,
    formality: Enum ['informal', 'semi-formal', 'formal', 'very-formal', 'universal'],
    emotion: String,
    culturalNote: String
  },

  // All dialect variations embedded
  variations: [{
    dialect: Enum ['msa', 'egyptian', 'saudi'],
    gender: Enum ['male', 'female', 'neutral'] or null,
    text: String (Arabic without tashkeel),
    tashkeelText: String (Arabic with tashkeel),
    transliteration: String,
    audioUrl: String,
    audioSlowUrl: String
  }],

  // All exercises embedded
  exercises: [{
    type: Enum ['fill-in-blank', 'reorder', 'multiple-choice', 'matching', 'typing'],
    dialect: String,
    gender: String or null,
    difficulty: Enum ['beginner', 'intermediate', 'advanced'],
    blankWords: Array (for fill-in-blank),
    reorderWords: Array (for reorder),
    matchingPairs: Array (for matching),
    exerciseData: Mixed (flexible for future types),
    gameContext: {
      scenario: String,
      hint: String,
      instructions: String
    }
  }],

  // Follow-up phrase (if any)
  followUp: {
    englishTranslation: String,
    whenHeard: String,
    variations: [Same structure as main variations]
  },

  // Metadata
  hasGenderVariation: Boolean,
  difficulty: String,
  frequency: String,
  tags: [String],
  isActive: Boolean,
  isApproved: Boolean,
  timestamps: true
}
```

### Supporting Collections

**Categories:**
- `_id`: ObjectId
- `name`: String (e.g., "SOCIAL", "ESSENTIAL", "CULTURAL")
- `nameAr`: String (Arabic name)
- `order`: Number
- `isActive`: Boolean

**Situations:**
- `_id`: ObjectId
- `name`: String (e.g., "Greetings & Small Talk", "Airport")
- `nameAr`: String (Arabic name)
- `category`: ObjectId (ref to Category)
- `order`: Number
- `isActive`: Boolean

## Key Architecture Evolution (v1.0.0 → v1.1.0)

### Why Single Collection?

**Previous Architecture (v1.0.0):**
- Mixed structure with `fillin` collection
- Unclear separation of concerns
- Complex nested structures

**Current Architecture (v1.1.0):**
- 1 main collection: PhraseV2
- Everything embedded - zero JOINs needed
- Atomic updates - entire phrase updated at once
- **Performance**: Single query retrieves everything
- **Simplicity**: No referential integrity issues
- **MongoDB-native**: Leverages document model strengths

### Design Benefits

1. **Query Performance**
   - Fetch complete phrase with one query
   - No JOIN operations needed
   - Optimal for read-heavy workloads (99% of operations)

2. **Data Consistency**
   - Atomic updates to entire phrase
   - No orphaned variations or exercises
   - Simpler transaction management

3. **Developer Experience**
   - Single model to work with
   - Cleaner API endpoints
   - Reduced complexity in business logic

4. **Scalability**
   - Document size well within MongoDB's 16MB limit
   - Efficient indexing on embedded arrays
   - Easy horizontal scaling with sharding

### Trade-offs Accepted

- **Update frequency**: Phrases don't change often, making embedding ideal
- **Document size**: Even with all variations and exercises, documents stay under 100KB
- **Query patterns**: 99% reads vs 1% writes justifies optimization for reads

## Data Flow Examples

**Creating new phrase:**
1. Create single PhraseV2 document with all variations and exercises embedded
2. Done - no additional operations needed

**User plays game:**
1. Query PhraseV2 by dialect and difficulty
2. Extract embedded exercise directly
3. Display and track progress

**Content update:**
1. Update single PhraseV2 document
2. All variations and exercises updated atomically

## Migration Path

- **v1.0.0**: Used collection name `fillin` with mixed structure, story-based learning
- **v1.1.0**: Single-collection embedded architecture with PhraseV2 (current)
  - Removed story-based learning
  - Added fill-in-the-blank exercises as primary learning method
  - Everything embedded in single document for performance

## Indexing Strategy

**PhraseV2 Collection:**
- `{ category: 1, situation: 1, difficulty: 1, isActive: 1 }` - Primary browsing
- `{ commonRank: 1, isActive: 1 }` - Ranked queries
- `{ tags: 1 }` - Tag-based filtering
- `{ "variations.dialect": 1 }` - Dialect-specific queries
- `{ "exercises.type": 1, "exercises.difficulty": 1 }` - Game queries

**Categories Collection:**
- `{ name: 1 }` - Unique name lookup
- `{ order: 1 }` - Ordered listing

**Situations Collection:**
- `{ category: 1 }` - Situations by category
- `{ name: 1, category: 1 }` - Unique within category 