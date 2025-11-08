# Edit Phrase Script Guide

## Overview
The `edit-phrase.js` script allows you to update any field of existing phrases in the database. It supports both single edits and batch edits.

## Basic Usage

### Running the Script
```bash
node scripts/edit-phrase.js
```

### Finding a Phrase
You can find a phrase by either:

1. **English Translation:**
```javascript
searchCriteria: { englishTranslation: "Hello" }
```

2. **Phrase ID:**
```javascript
searchCriteria: { id: "507f1f77bcf86cd799439011" }
```

## Common Update Scenarios

### 1. Update Basic Fields
```javascript
const edit = {
    searchCriteria: { englishTranslation: "Hello" },
    updates: {
        difficulty: 'beginner',
        frequency: 'very_high',
        commonRank: 1,
        isApproved: true,
        isActive: true
    }
};
```

### 2. Update Context
```javascript
const edit = {
    searchCriteria: { englishTranslation: "Hello" },
    updates: {
        context: {
            whenToUse: "When greeting someone casually",
            whoToSayTo: "Friends, peers, family",
            formality: 'informal',
            culturalNote: "Very common greeting in all Arab countries"
        }
    }
};
```

### 3. Add/Update Tags
```javascript
// Append new tags (default behavior)
const edit = {
    searchCriteria: { englishTranslation: "Hello" },
    updates: {
        tags: ['greeting', 'casual', 'common']
    }
};

// Replace all tags
const edit = {
    searchCriteria: { englishTranslation: "Hello" },
    updates: {
        tags: ['greeting', 'casual', 'common'],
        replaceTags: true  // Important!
    }
};
```

### 4. Add New Dialect Variation
```javascript
const edit = {
    searchCriteria: { englishTranslation: "Hello" },
    updates: {
        variations: {
            saudi: {
                male: {
                    text: "مرحبا",
                    tashkeelText: "مَرْحَبَا",
                    transliteration: "marhaba",
                    audioUrl: "https://storage.efham.app/audio/saudi-hello-male.mp3",
                    audioSlowUrl: "https://storage.efham.app/audio/saudi-hello-male-slow.mp3"
                }
            }
        }
    }
};
```

### 5. Add New Exercise
```javascript
const edit = {
    searchCriteria: { englishTranslation: "Good morning" },
    updates: {
        exercises: {
            egyptian: [
                {
                    type: 'fill-in-blank',
                    gender: 'neutral',
                    difficulty: 'beginner',
                    displaySentence: "_____ يا أحمد",
                    displaySentenceTashkeel: "_____ يَا أَحْمَد",
                    displaySentenceTransliteration: "_____ ya Ahmed",
                    blankWords: [
                        {
                            word: "صباح الخير",
                            tashkeelWord: "صَبَاح الخَيْر",
                            transliteration: "sabah el-kheir",
                            isCorrect: true
                        },
                        {
                            word: "مساء الخير",
                            tashkeelWord: "مَسَاء الخَيْر",
                            transliteration: "masa el-kheir",
                            isCorrect: false
                        },
                        {
                            word: "تصبح على خير",
                            tashkeelWord: "تِصْبَح عَلَى خَيْر",
                            transliteration: "tesba7 3ala kheir",
                            isCorrect: false
                        }
                    ]
                }
            ]
        },
        replaceExercises: false  // false = append, true = replace all
    }
};
```

### 6. Update Game Context
```javascript
const edit = {
    searchCriteria: { englishTranslation: "How are you?" },
    updates: {
        gameContext: {
            scenario: "You meet a friend at a café",
            hint: "This is a common daily greeting",
            instructions: {
                'fill-in-blank': "Choose the correct word to complete the greeting"
            }
        }
    }
};
```

### 7. Add Follow-up Phrase
```javascript
const edit = {
    searchCriteria: { englishTranslation: "How are you?" },
    updates: {
        followUp: {
            englishTranslation: "I'm fine, thank you",
            whenHeard: "Most common response to 'How are you?'",
            isSamePerson: false,  // The other person is speaking
            variations: {
                egyptian: {
                    neutral: {
                        text: "الحمد لله، شكراً",
                        tashkeelText: "الحَمْدُ لِلَّه، شُكْراً",
                        transliteration: "el-hamdu lillah, shukran"
                    }
                }
            }
        }
    }
};
```

### 8. Move Phrase to Different Category/Situation
```javascript
const edit = {
    searchCriteria: { englishTranslation: "Hello" },
    updates: {
        category: 'SOCIAL',           // Category name (auto-converts to ID)
        situation: 'greetings'        // Situation name (auto-converts to ID)
    }
};
```

## Batch Editing

Edit multiple phrases at once:

```javascript
const batchEdits = [
    {
        searchCriteria: { englishTranslation: "Hello" },
        updates: { difficulty: 'beginner', isApproved: true }
    },
    {
        searchCriteria: { englishTranslation: "Goodbye" },
        updates: { difficulty: 'beginner', isApproved: true }
    },
    {
        searchCriteria: { englishTranslation: "Thank you" },
        updates: { difficulty: 'beginner', isApproved: true }
    }
];

// In the script, set:
const useBatchEdit = true;
```

## Field Reference

### Basic Fields
- `englishTranslation` (String)
- `intent` (String)
- `commonRank` (Number)
- `difficulty` ('beginner' | 'intermediate' | 'advanced')
- `frequency` ('very_high' | 'high' | 'medium' | 'low' | 'very_low')
- `hasGenderVariation` (Boolean)
- `isActive` (Boolean)
- `isApproved` (Boolean)

### Context Fields
- `context.whenToUse` (String)
- `context.whoToSayTo` (String)
- `context.speaker` (String)
- `context.listener` (String)
- `context.formality` ('informal' | 'semi-formal' | 'formal' | 'very-formal' | 'universal' | 'neutral')
- `context.emotion` (String)
- `context.culturalNote` (String)

### Variations Structure
```javascript
variations: {
    [dialect]: {  // 'msa' | 'egyptian' | 'saudi'
        [gender]: {  // 'male' | 'female' | 'neutral'
            text: String,
            tashkeelText: String,
            transliteration: String,
            audioUrl: String,
            audioSlowUrl: String
        }
    }
}
```

### Exercise Types
- `fill-in-blank` - Choose correct word to fill blank
- `reorder` - Arrange words in correct order
- `multiple-choice` - Choose from multiple options
- `matching` - Match pairs
- `typing` - Type the complete phrase

## Tips & Best Practices

1. **Always test with one phrase first** before batch editing
2. **Use `replaceExercises: false`** to append new exercises (default)
3. **Use `replaceExercises: true`** to completely replace exercises
4. **Use `replaceTags: false`** to append tags (default)
5. **Use `replaceTags: true`** to completely replace tags
6. **Context merges** by default - only updates fields you specify
7. **Variations merge** - you can update one dialect/gender without affecting others
8. **Always backup** before batch editing many phrases

## Example Workflow

1. Find the phrase ID or note the exact English translation
2. Decide what you want to update
3. Create your update object
4. Test with single edit first
5. If successful, proceed with batch if needed

## Troubleshooting

**Error: "Phrase not found"**
- Double-check the English translation (case-sensitive)
- Or verify the phrase ID is correct

**Error: "Category not found"**
- Make sure the category name is exactly right (e.g., 'SOCIAL', 'ESSENTIAL')

**Error: "Situation not found"**
- Verify the situation name matches database (e.g., 'greetings', 'airport')

**Updates not saving**
- Check that fields match the schema exactly
- Verify enum values are correct (e.g., difficulty must be 'beginner', 'intermediate', or 'advanced')
