# CLAUDE.md - Efham Project Context

## Project Overview

**Efham** (افهم - "Understand" in Arabic) is a mobile application (React Native/iOS & Android) that teaches **conversational Arabic dialects** through practical, context-based phrases. We teach how people **actually speak** in daily life, not formal Modern Standard Arabic (MSA).

## Core Concept

**Situational phrase learning**: Users learn phrases organized by real-life situations they'll encounter (airport, restaurant, making friends, etc.) - not random vocabulary lists or grammar drills.

## What Makes Efham Unique

### 1. Dialect-First Approach
- **Egyptian Arabic** (Cairo dialect)
- **Saudi Arabic** (Hijazi/Jeddad dialect)
- **Zero MSA** - only authentic conversational language
- We teach how people actually speak, not textbook Arabic

### 2. Gender-Adaptive Learning
- Users select their gender (male/female)
- App teaches appropriate phrase variations for the speaker
- Critical feature for Arabic where verb conjugations and adjectives change by speaker gender
- Every phrase has male/female/neutral variations where applicable

### 3. Context-Driven Organization
- **25 situations** organized across **3 categories**:
  - **SOCIAL**: Greetings, Making Friends, Phone Calls, etc.
  - **ESSENTIAL**: Airport, Restaurant, Shopping, Emergency, Transportation
  - **CULTURAL**: Weddings, Funerals, Religious Settings, Family Gatherings
- Each phrase includes:
  - **When to use it** (specific context and situation)
  - **Both dialect variations** with full tashkeel (diacritics)
  - **Transliteration** for pronunciation guidance
  - **Fill-in-blank exercises** for active practice
  - **Optional follow-up responses** for conversation flow
  - **Cultural context** (formality level, who to say it to)

## Tech Stack

- **Mobile App**: React Native (iOS & Android)
- **Backend API**: Node.js / Express
- **Database**: MongoDB
- **Payment**: RevenueCat (planned for in-app subscriptions)
- **Landing Page**: Next.js (this web app repository)

## Landing Page Purpose

This repository contains the **marketing landing page** for Efham. The website is NOT a login portal or web version of the app - it's purely for:
- Marketing and app promotion
- Explaining the value proposition
- Directing users to download the iOS/Android apps
- App Store and Google Play download links

**Important**: There is NO user login, NO web-based learning interface. Everything happens in the mobile apps.

## Quality Standard

**Authenticity over correctness**: Every phrase must pass the test "Would a native speaker actually say this in real conversation today?"

We reject bookish/formal words that exist in dictionaries but nobody uses in daily speech.

**Examples:**
- ✅ **عايز** (Egyptian) / **أبغى** (Saudi) - "I want" (how people actually speak)
- ❌ **أريد** - formal MSA, sounds unnatural and textbook-like

## Current Status (as of v1.1.0)

- **~250+ phrases** completed and reviewed
- **6 situations** fully built with exercises
- Working **gender variation system**
- **Dialect switching** functional
- Building toward **1,000-phrase milestone**

## The Mission

Enable learners to have real conversations in Arabic by teaching the phrases people actually use, organized by the situations where they'll need them.

---

# Technical Architecture (Backend API)

## Database Schema - Single Collection Architecture

We use a **single-collection embedded architecture** that maximizes performance and simplifies data management for the mobile apps.

### Main Collection: **Phrase**

A comprehensive document that contains everything about a phrase - its meaning, all dialect variations, exercises, and cultural context.

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

  // Context and cultural guidance
  context: {
    whenToUse: String,
    whoToSayTo: String,
    speaker: String,
    listener: String,
    formality: Enum ['informal', 'semi-formal', 'formal', 'very-formal', 'universal', 'neutral'],
    emotion: String,
    culturalNote: String
  },

  // All dialect variations embedded (nested by dialect then gender)
  variations: {
    egyptian: {
      male: {
        text: String,
        tashkeelText: String,
        transliteration: String
      },
      female: {
        text: String,
        tashkeelText: String,
        transliteration: String
      },
      neutral: {
        text: String,
        tashkeelText: String,
        transliteration: String
      }
    },
    saudi: {
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
    egyptian: [{
      type: Enum ['fill-in-blank', 'reorder', 'multiple-choice', 'matching', 'typing'],
      gender: Enum ['male', 'female', 'neutral'],
      difficulty: Enum ['beginner', 'intermediate', 'advanced'],
      displaySentence: String,
      displaySentenceTashkeel: String,
      displaySentenceTransliteration: String,
      blankWords: [{
        word: String,
        tashkeelWord: String,
        transliteration: String,
        isCorrect: Boolean
      }]
    }],
    saudi: [/* same structure */]
  },

  // Follow-up phrase (optional)
  followUp: {
    englishTranslation: String,
    whenHeard: String,
    isSamePerson: Boolean,
    variations: {
      egyptian: { /* same as main variations */ },
      saudi: { /* same as main variations */ }
    }
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

### Supporting Collections

**Categories:**
```javascript
{
  _id: ObjectId,
  name: String,        // e.g., "SOCIAL", "ESSENTIAL", "CULTURAL"
  nameAr: String,      // Arabic name
  order: Number,
  isActive: Boolean
}
```

**Situations:**
```javascript
{
  _id: ObjectId,
  name: String,        // e.g., "Greetings & Small Talk", "Airport"
  nameAr: String,      // Arabic name
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
  exerciseType: Enum ['fill-in-blank', ...],
  dialect: Enum ['egyptian', 'saudi'],
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
   - Document size well within MongoDB's limits (~100KB per phrase)
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
- `{ category: 1, situation: 1, difficulty: 1, isActive: 1 }` - Primary browsing
- `{ commonRank: 1, isActive: 1 }` - Ranked queries
- `{ tags: 1 }` - Tag-based filtering

**BlankHistory Collection:**
- `{ user: 1, phrase: 1 }` - User progress lookup
- `{ user: 1, situation: 1 }` - Progress by situation
- `{ user: 1, 'mastery.nextReview': 1 }` - Spaced repetition queries
- `{ user: 1, dialect: 1, difficulty: 1 }` - Filtered practice sessions

## Key Principles

1. **Dialect Authenticity** - Every phrase must be verified by native speakers
2. **Gender Accuracy** - All gender variations must be linguistically correct
3. **Context is King** - Never teach a phrase without explaining when/how to use it
4. **Mobile-First** - All technical decisions prioritize mobile app performance
5. **Quality over Quantity** - Better 500 perfect phrases than 5,000 mediocre ones

## Content Guidelines

### What Gets Approved
- Phrases native speakers use daily
- Natural, conversational Arabic
- Gender-appropriate variations
- Clear contextual usage
- Culturally relevant scenarios

### What Gets Rejected
- Formal MSA that sounds bookish
- Phrases only found in textbooks
- Grammatically correct but unnatural speech
- Overly formal words nobody actually says
- Context-free vocabulary lists

## The Efham Promise

When users learn from Efham, they're not learning Arabic from a textbook or algorithm. They're learning the exact phrases that native speakers use in Cairo and Jeddah, organized by the situations where they'll need them, with the cultural intelligence to use them appropriately.
