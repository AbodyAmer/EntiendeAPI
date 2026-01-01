# CLAUDE.md - Entiende Project Context

## Project Overview

**Entiende** ("Understand" in Spanish) is a mobile application (React Native/iOS & Android) that teaches **conversational Spanish dialects** through practical, context-based phrases. We teach the "Natural Standard" - how normal people **actually speak** in daily life, not textbook Spanish or slang.

## Core Concept

**Category-based phrase learning**: Users learn phrases organized by real-life categories (Transport, Food, Emotions, etc.) through fill-in-the-blank exercises. The goal is to help learners "blend in" and sound local.

## What Makes Entiende Unique

### 1. Dialect-First Approach
- **Spain** (Castilian)
- **Mexico**
- **Argentina**
- **Puerto Rico**
- **Colombia**
- We teach how people actually speak regionally, not generic textbook Spanish

### 2. Gender-Adaptive Learning
- Users select their gender (male/female)
- App teaches appropriate phrase variations for the speaker
- Critical feature for Spanish where adjectives change by speaker gender
- Every phrase has male/female/neutral variations where applicable

**Gender Examples:**
- "I'm tired" → *Estoy cansado* (male) / *Estoy cansada* (female)
- "I'm ready" → *Estoy listo* (male) / *Estoy lista* (female)
- "I take the bus" → *Tomo el bus* (neutral - no gender variation)

### 3. Category-Driven Organization
- **7 main categories** with focused phrase collections:
  - **Transport**: Taking the bus, driving, tickets, sidewalk
  - **Food & Dining**: Ordering, the bill, waiter, straw
  - **Clothing**: Sneakers, jacket, t-shirt
  - **Emotions**: Angry, tired, happy, just kidding
  - **Money**: I don't have money, how much, expensive
  - **Greetings**: What's up, nice to meet you, goodbye
  - **Basic Phrases**: I don't understand, can you repeat, I'm learning Spanish

- Each phrase includes:
  - **When to use it** (specific context)
  - **All 5 dialect variations**
  - **Fill-in-blank exercises** for active practice
  - **Formality level** (informal/formal)

## Tech Stack

- **Mobile App**: React Native (iOS & Android)
- **Backend API**: Node.js / Express
- **Database**: MongoDB
- **Payment**: RevenueCat (planned for in-app subscriptions)
- **Landing Page**: Next.js (separate repository)

## Landing Page Purpose

This repository contains the **backend API** for Entiende. The API serves:
- Phrase content organized by category and dialect
- User authentication and progress tracking
- Exercise generation and validation
- Dialect comparison data

**Important**: The mobile apps consume this API. There is NO web-based learning interface.

## Quality Standard - The "Natural Standard"

**Authenticity over textbook correctness**: Every phrase must pass the test "Would a native speaker actually say this in normal conversation today?"

We reject both textbook formality AND vulgar slang. We teach the **Natural Standard** - polite, correct, but regionally specific language.

**Examples:**
- ✅ **Tomo el camión** (Mexico) - "I take the bus" (natural, local)
- ✅ **Tomo el colectivo** (Argentina) - "I take the bus" (natural, local)
- ❌ **Tomar el autobús** - sounds robotic/textbook
- ❌ Vulgar slang - too informal, risky

**The Test:** Would a native speaker use this exact phrase when talking to a neighbor, shopkeeper, or colleague?

## Learning Philosophy

**Learn phrases, not isolated words.**

Traditional apps teach *vengo* = "I come" in isolation. Entiende teaches complete sentences:
- *Yo vengo de Nueva York* - "I come from New York"
- *Actualmente vivo en Madrid* - "I currently live in Madrid"
- *Trabajo como ingeniero* - "I work as an engineer"

**The Power of Patterns:**
After learning *Yo vengo de...*, users can create:
- *Yo vengo de Malasia*
- *Yo vengo de una familia grande*
- *Yo vengo del trabajo*

**This is sentence mining** - we did the mining for you. Instead of watching 100 hours of content hoping to catch useful phrases, Entiende gives you the most common, practical sentences organized by category.

## Current Status (Phase 1)

- **5 dialects** supported (Spain, Mexico, Argentina, Puerto Rico, Colombia)
- **7 core categories** defined
- **Gender variation system** designed
- **Dialect switching** architecture in place
- Building initial phrase library

## The Mission

Enable learners to sound natural and local in Spanish-speaking countries by teaching the exact phrases native speakers use, organized by practical categories, with regional authenticity.

---

# Technical Architecture (Backend API)

## Database Schema - Single Collection Architecture

We use a **single-collection embedded architecture** that maximizes performance and simplifies data management for the mobile apps.

### Main Collection: **Phrase**

A comprehensive document that contains everything about a phrase - its meaning, all dialect variations, and exercises.

**Document Structure:**
```javascript
{
  // Core phrase information
  englishTranslation: String,
  intent: String,

  // Organization
  category: ObjectId (ref: Category),
  situation: ObjectId (ref: Situation),
  commonRank: Number,

  // Context guidance
  context: {
    whenToUse: String,
    formality: Enum ['informal', 'semi-formal', 'formal', 'universal', 'neutral']
  },

  // All dialect variations embedded (nested by dialect then gender)
  variations: {
    spain: {
      male: {
        text: String,
        hasAudio: Boolean
      },
      female: {
        text: String,
        hasAudio: Boolean
      },
      neutral: {
        text: String,
        hasAudio: Boolean
      }
    },
    mexico: {
      male: { /* same structure */ },
      female: { /* same structure */ },
      neutral: { /* same structure */ }
    },
    argentina: {
      male: { /* same structure */ },
      female: { /* same structure */ },
      neutral: { /* same structure */ }
    },
    puerto_rico: {
      male: { /* same structure */ },
      female: { /* same structure */ },
      neutral: { /* same structure */ }
    },
    colombia: {
      male: { /* same structure */ },
      female: { /* same structure */ },
      neutral: { /* same structure */ }
    }
  },

  // Game context for exercises
  gameContext: {
    scenario: String,
    hint: String,
    instructions: Map
  },

  // All exercises embedded (nested by dialect)
  exercises: {
    spain: [{
      type: Enum ['fill-in-blank', 'reorder', 'multiple-choice', 'matching', 'typing'],
      gender: Enum ['male', 'female', 'neutral'],
      difficulty: Enum ['beginner', 'intermediate', 'advanced'],
      displaySentence: String,
      blankWords: [{
        word: String,
        isCorrect: Boolean
      }]
    }],
    mexico: [/* same structure */],
    argentina: [/* same structure */],
    puerto_rico: [/* same structure */],
    colombia: [/* same structure */]
  },

  // Metadata
  hasGenderVariation: Boolean,
  difficulty: Enum ['beginner', 'intermediate', 'advanced'],
  frequency: Enum ['very_high', 'high', 'medium', 'low', 'very_low'],
  tags: [String],
  isActive: Boolean,
  isApproved: Boolean,
  showme: Boolean,
  timestamps: true
}
```

**Example: Neutral Phrase (No Gender Variation)**
```javascript
{
  "englishTranslation": "I take the bus",
  "category": ObjectId("transport"),
  "context": {
    "whenToUse": "Talking about daily commute or transportation",
    "formality": "informal"
  },
  "variations": {
    "spain": {
      "male": null,
      "female": null,
      "neutral": {
        "text": "Cojo el autobús",
        "hasAudio": false
      }
    },
    "mexico": {
      "male": null,
      "female": null,
      "neutral": {
        "text": "Tomo el camión",
        "hasAudio": false
      }
    },
    "argentina": {
      "male": null,
      "female": null,
      "neutral": {
        "text": "Tomo el colectivo",
        "hasAudio": false
      }
    },
    "puerto_rico": {
      "male": null,
      "female": null,
      "neutral": {
        "text": "Cojo la guagua",
        "hasAudio": false
      }
    },
    "colombia": {
      "male": null,
      "female": null,
      "neutral": {
        "text": "Tomo el bus",
        "hasAudio": false
      }
    }
  },
  "exercises": {
    "spain": [{
      "type": "fill-in-blank",
      "gender": "neutral",
      "displaySentence": "Cojo el _____",
      "blankWords": [
        { "word": "autobús", "isCorrect": true },
        { "word": "camión", "isCorrect": false },
        { "word": "colectivo", "isCorrect": false },
        { "word": "guagua", "isCorrect": false }
      ]
    }]
    // ... exercises for other dialects
  },
  "hasGenderVariation": false
}
```

**Example: Gendered Phrase**
```javascript
{
  "englishTranslation": "I'm tired",
  "category": ObjectId("emotions"),
  "context": {
    "whenToUse": "Expressing fatigue",
    "formality": "informal"
  },
  "variations": {
    "spain": {
      "male": {
        "text": "Estoy cansado",
        "hasAudio": false
      },
      "female": {
        "text": "Estoy cansada",
        "hasAudio": false
      },
      "neutral": null
    },
    "mexico": {
      "male": {
        "text": "Estoy cansado",
        "hasAudio": false
      },
      "female": {
        "text": "Estoy cansada",
        "hasAudio": false
      },
      "neutral": null
    }
    // ... same pattern for other dialects
  },
  "exercises": {
    "spain": [
      {
        "type": "fill-in-blank",
        "gender": "male",
        "displaySentence": "Estoy _____",
        "blankWords": [
          { "word": "cansado", "isCorrect": true },
          { "word": "cansada", "isCorrect": false },
          { "word": "contento", "isCorrect": false },
          { "word": "listo", "isCorrect": false }
        ]
      },
      {
        "type": "fill-in-blank",
        "gender": "female",
        "displaySentence": "Estoy _____",
        "blankWords": [
          { "word": "cansada", "isCorrect": true },
          { "word": "cansado", "isCorrect": false },
          { "word": "contenta", "isCorrect": false },
          { "word": "lista", "isCorrect": false }
        ]
      }
    ]
    // ... exercises for other dialects
  },
  "hasGenderVariation": true
}
```

### Supporting Collections

**Categories:**
```javascript
{
  _id: ObjectId,
  name: String,        // e.g., "Transport", "Food & Dining", "Emotions"
  nameEs: String,      // Spanish name (optional)
  order: Number,
  isActive: Boolean
}
```

**Situations:**
```javascript
{
  _id: ObjectId,
  name: String,        // e.g., "Daily Commute", "Restaurant Ordering"
  nameEs: String,      // Spanish name (optional)
  category: ObjectId,  // ref to Category
  order: Number,
  isActive: Boolean
}
```

**User Progress: BlankHistory**
Tracks user performance and learning progress for fill-in-blank exercises.

```javascript
{
  user: ObjectId (ref: User),
  phrase: ObjectId (ref: Phrase),
  exerciseType: Enum ['fill-in-blank', 'reorder', 'multiple-choice', 'matching', 'typing'],
  dialect: Enum ['spain', 'mexico', 'argentina', 'puerto_rico', 'colombia'],
  gender: Enum ['male', 'female', 'neutral'],
  difficulty: Enum ['beginner', 'intermediate', 'advanced'],

  isCorrect: Boolean,

  attempt: {
    userAnswer: String,
    correctAnswer: String,
    blankIndices: [Number],
    timeSpent: Number,
    attemptNumber: Number,
    hintsUsed: Number
  },

  situation: ObjectId,
  category: ObjectId,

  mastery: {
    level: Number (0-100),
    practiceCount: Number,
    correctCount: Number,
    lastPracticed: Date,
    nextReview: Date  // for spaced repetition
  },

  timestamps: true
}
```

## Architecture Benefits

### Why Single Collection for Phrases?

1. **Query Performance**
   - Fetch complete phrase with one query
   - No JOIN operations needed
   - Optimal for mobile apps (minimal network requests)

2. **Data Consistency**
   - Atomic updates to entire phrase
   - No orphaned variations or exercises

3. **Mobile-First Design**
   - Reduced API calls
   - Better offline support potential
   - Smaller payload sizes with targeted queries

4. **Scalability**
   - Document size well within MongoDB's limits (~50KB per phrase)
   - Efficient indexing on embedded arrays
   - Easy horizontal scaling

## API Design Philosophy

The backend API is designed for **mobile app consumption**:
- RESTful endpoints organized by feature
- JWT authentication for users
- Dialect and gender filtering at query level
- Pagination and progressive loading support
- Minimal data transfer for mobile networks

## Indexing Strategy

**Phrase Collection:**
- `{ category: 1, difficulty: 1, isActive: 1 }` - Primary browsing
- `{ commonRank: 1, isActive: 1 }` - Ranked queries
- `{ tags: 1 }` - Tag-based filtering

**BlankHistory Collection:**
- `{ user: 1, phrase: 1 }` - User progress lookup
- `{ user: 1, category: 1 }` - Progress by category
- `{ user: 1, 'mastery.nextReview': 1 }` - Spaced repetition queries
- `{ user: 1, dialect: 1, difficulty: 1 }` - Filtered practice sessions

## Key Principles

1. **Dialect Authenticity** - Every phrase must be verified by native speakers
2. **Gender Accuracy** - All gender variations must be linguistically correct
3. **Context is King** - Never teach a phrase without explaining when/how to use it
4. **Mobile-First** - All technical decisions prioritize mobile app performance
5. **Quality over Quantity** - Better 500 perfect phrases than 5,000 mediocre ones
6. **The Natural Standard** - Teach how people actually speak: polite, correct, and regionally authentic

## Content Guidelines

### What Gets Approved
- Phrases native speakers use daily
- Natural, conversational Spanish
- Gender-appropriate variations
- Clear contextual usage
- Regionally authentic vocabulary

### What Gets Rejected
- Textbook Spanish that sounds robotic
- Phrases only found in language learning books
- Grammatically correct but unnatural speech
- Overly formal phrases nobody actually says
- Vulgar slang or inappropriate language
- Context-free vocabulary lists

## Content Organization Philosophy

**Phrases are grouped by category, not random.**

Unlike apps like Clozemaster that present random phrases, Entiende users select a category first (e.g., "Food & Dining"). All phrases in that session relate to the same topic.

**Benefits:**
- **Build vocabulary clusters** - all food words together, all transport words together
- **Mental preparation** - user knows the context before playing
- **Faster learning** - related words reinforce each other
- **Predictable experience** - no random surprises, user feels in control

## The Entiende Promise

When users learn from Entiende, they're not learning Spanish from a textbook or algorithm. They're learning the exact phrases that native speakers use in Madrid, Mexico City, Buenos Aires, San Juan, and Bogotá - organized by practical categories, with the cultural and regional intelligence to use them naturally.

**After learning 100 phrases, you can form 1000+ sentences by remixing the patterns.**
