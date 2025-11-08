require('dotenv').config();
const mongoose = require('mongoose');
const Phrase = require('../models/Phrase');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

/**
 * Edit/Update an existing phrase in the database
 *
 * This script allows you to:
 * - Find a phrase by ID or English translation
 * - Update any field: translations, variations, exercises, context, metadata
 * - Add new dialect variations or exercises
 * - Modify existing exercises or context
 *
 * @param {Object} searchCriteria - How to find the phrase { id: string } OR { englishTranslation: string }
 * @param {Object} updates - Fields to update (follows Phrase schema structure)
 * @returns {Promise<Object>} - Updated phrase document
 */
async function editPhrase(searchCriteria, updates) {
    try {
        // 1. Find the phrase
        let phrase;
        if (searchCriteria.id) {
            phrase = await Phrase.findById(searchCriteria.id);
            if (!phrase) {
                throw new Error(`Phrase with ID "${searchCriteria.id}" not found`);
            }
        } else if (searchCriteria.englishTranslation) {
            phrase = await Phrase.findOne({ englishTranslation: searchCriteria.englishTranslation });
            if (!phrase) {
                throw new Error(`Phrase "${searchCriteria.englishTranslation}" not found`);
            }
        } else {
            throw new Error('Must provide either "id" or "englishTranslation" in searchCriteria');
        }

        console.log(`\n📝 Found phrase: "${phrase.englishTranslation}"`);
        console.log(`   ID: ${phrase._id}`);
        console.log(`   Category: ${phrase.category}`);
        console.log(`   Situation: ${phrase.situation}`);

        // 2. Handle category/situation updates (convert names to IDs if needed)
        if (updates.category && typeof updates.category === 'string') {
            const category = await Category.findOne({ name: updates.category });
            if (!category) {
                throw new Error(`Category "${updates.category}" not found`);
            }
            updates.category = category._id;
            console.log(`   Updating category to: ${updates.category} (${category.name})`);
        }

        if (updates.situation && typeof updates.situation === 'string') {
            const situation = await Situation.findOne({ name: updates.situation });
            if (!situation) {
                throw new Error(`Situation "${updates.situation}" not found`);
            }
            updates.situation = situation._id;
            console.log(`   Updating situation to: ${updates.situation} (${situation.name})`);
        }

        // 3. Apply updates using different strategies based on what's being updated

        // Direct field updates (simple replacements)
        const directFields = [
            'englishTranslation', 'intent', 'category', 'situation', 'commonRank',
            'hasGenderVariation', 'difficulty', 'frequency', 'isActive', 'isApproved'
        ];

        directFields.forEach(field => {
            if (updates[field] !== undefined) {
                phrase[field] = updates[field];
                console.log(`   ✓ Updated ${field}: ${updates[field]}`);
            }
        });

        // Context updates (merge with existing)
        if (updates.context) {
            phrase.context = {
                ...phrase.context,
                ...updates.context
            };
            console.log(`   ✓ Updated context`);
        }

        // Tags updates (can replace or append)
        if (updates.tags) {
            if (updates.replaceTags) {
                phrase.tags = updates.tags;
                console.log(`   ✓ Replaced tags: ${updates.tags.join(', ')}`);
            } else {
                // Append new tags (avoid duplicates)
                const newTags = updates.tags.filter(tag => !phrase.tags.includes(tag));
                phrase.tags.push(...newTags);
                console.log(`   ✓ Added tags: ${newTags.join(', ')}`);
            }
        }

        // Variations updates (deep merge)
        if (updates.variations) {
            console.log(`   ✓ Updating variations...`);

            ['msa', 'egyptian', 'saudi'].forEach(dialect => {
                if (updates.variations[dialect]) {
                    if (!phrase.variations[dialect]) {
                        phrase.variations[dialect] = {};
                    }

                    ['male', 'female', 'neutral'].forEach(gender => {
                        if (updates.variations[dialect][gender]) {
                            phrase.variations[dialect][gender] = updates.variations[dialect][gender];
                            console.log(`     - ${dialect}.${gender}`);
                        }
                    });
                }
            });

            // Mark as modified for Mongoose
            phrase.markModified('variations');
        }

        // Exercises updates (can replace dialect exercises or merge)
        if (updates.exercises) {
            console.log(`   ✓ Updating exercises...`);

            if (!phrase.exercises) {
                phrase.exercises = { msa: [], egyptian: [], saudi: [] };
            }

            ['msa', 'egyptian', 'saudi'].forEach(dialect => {
                if (updates.exercises[dialect]) {
                    if (updates.replaceExercises) {
                        // Replace all exercises for this dialect
                        phrase.exercises[dialect] = updates.exercises[dialect];
                        console.log(`     - Replaced all ${dialect} exercises (${updates.exercises[dialect].length} total)`);
                    } else {
                        // Append new exercises
                        phrase.exercises[dialect].push(...updates.exercises[dialect]);
                        console.log(`     - Added ${updates.exercises[dialect].length} ${dialect} exercises`);
                    }
                }
            });

            // Mark as modified for Mongoose
            phrase.markModified('exercises');
        }

        // GameContext updates
        if (updates.gameContext) {
            phrase.gameContext = {
                ...phrase.gameContext,
                ...updates.gameContext
            };
            console.log(`   ✓ Updated gameContext`);
            phrase.markModified('gameContext');
        }

        // FollowUp updates
        if (updates.followUp) {
            phrase.followUp = updates.followUp;
            console.log(`   ✓ Updated followUp`);
            phrase.markModified('followUp');
        }

        // 4. Save the updated phrase
        const updatedPhrase = await phrase.save();

        console.log(`\n✅ Successfully updated phrase: "${updatedPhrase.englishTranslation}"`);
        console.log(`   ID: ${updatedPhrase._id}`);
        console.log(`   Last updated: ${updatedPhrase.updatedAt}`);

        return updatedPhrase;

    } catch (error) {
        console.error('❌ Error editing phrase:', error.message);
        throw error;
    }
}

/**
 * Batch edit multiple phrases
 *
 * @param {Array<Object>} edits - Array of { searchCriteria, updates } objects
 * @returns {Promise<Object>} - Results summary
 */
async function editPhrasesBatch(edits) {
    const results = {
        success: [],
        failed: [],
        total: edits.length
    };

    console.log(`\n📝 Editing ${edits.length} phrases...\n`);

    for (let i = 0; i < edits.length; i++) {
        const { searchCriteria, updates } = edits[i];

        try {
            const phrase = await editPhrase(searchCriteria, updates);
            results.success.push({
                id: phrase._id,
                englishTranslation: phrase.englishTranslation
            });
            console.log(`✅ [${i + 1}/${edits.length}] Success\n`);
        } catch (error) {
            console.error(`❌ [${i + 1}/${edits.length}] Failed: ${error.message}\n`);
            results.failed.push({
                searchCriteria,
                error: error.message
            });
        }
    }

    console.log('='.repeat(60));
    console.log('📊 Batch Edit Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📝 Total: ${results.total}`);
    console.log('='.repeat(60));

    if (results.failed.length > 0) {
        console.log('\n❌ Failed edits:');
        results.failed.forEach(f => {
            const identifier = f.searchCriteria.englishTranslation || f.searchCriteria.id;
            console.log(`   - ${identifier}: ${f.error}`);
        });
    }

    return results;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Edit by English translation - Update context
const example1 = {
    searchCriteria: { englishTranslation: "Hello" },
    updates: {
        context: {
            whenToUse: "When greeting someone in any informal setting",
            culturalNote: "Very universal greeting, works in all contexts"
        },
        tags: ['greeting', 'universal', 'informal'],
        difficulty: 'beginner'
    }
};

// Example 2: Edit by ID - Add new dialect variation
const example2 = {
    searchCriteria: { id: "507f1f77bcf86cd799439011" }, // Replace with actual ID
    updates: {
        variations: {
            saudi: {
                male: {
                    text: "مرحبا",
                    tashkeelText: "مَرْحَبَا",
                    transliteration: "marhaba",
                    audioUrl: "https://example.com/audio.mp3"
                }
            }
        }
    }
};

// Example 3: Add new exercises to existing phrase
const example3 = {
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
                        }
                    ]
                }
            ]
        },
        replaceExercises: false // Set to true to replace all exercises instead of appending
    }
};

// Example 4: Update multiple fields at once
const example4 = {
    searchCriteria: { englishTranslation: "Thank you" },
    updates: {
        englishTranslation: "Thank you very much",
        difficulty: 'intermediate',
        frequency: 'very_high',
        commonRank: 5,
        context: {
            whenToUse: "When expressing strong gratitude",
            whoToSayTo: "Anyone",
            formality: 'universal'
        },
        tags: ['gratitude', 'polite', 'common'],
        replaceTags: true // Replace all existing tags
    }
};

// Example 5: Add follow-up phrase
const example5 = {
    searchCriteria: { englishTranslation: "How are you?" },
    updates: {
        followUp: {
            englishTranslation: "I'm fine, thank you",
            whenHeard: "Common response to 'How are you?'",
            isSamePerson: false,
            variations: {
                egyptian: {
                    neutral: {
                        text: "الحمد لله، شكراً",
                        tashkeelText: "الحَمْدُ لِلَّه، شُكْراً",
                        transliteration: "el-hamdu lillah, shukran"
                    }
                },
                saudi: {
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

// Example 6: Batch edit multiple phrases
const batchEditExample = [
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

// ============================================================================
// EXECUTION
// ============================================================================

// Run script if executed directly
if (require.main === module) {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/efham';

    // 🔧 CONFIGURE YOUR EDIT HERE:
    // Option 1: Single edit
    const singleEdit = {
        searchCriteria: { id: new mongoose.Types.ObjectId("690d850ae2fd22e89db27e3c") }, // Change this
        updates: {
  "variations": {
    "msa": null,
    "egyptian": {
      "male": null,
      "female": null,
      "neutral": {
        "text": "ده ممل قوي",
        "tashkeelText": "ده مُمِلّ قَوِي",
        "transliteration": "da mumil awi"
      }
    },
    "saudi": {
      "male": null,
      "female": null,
      "neutral": {
        "text": "مره ممل",
        "tashkeelText": "مَرَّه مُمِلّ",
        "transliteration": "marra mumil"
      }
    }
  },
  "exercises": {
    "msa": [],
    "egyptian": [
      {
        "type": "fill-in-blank",
        "gender": "neutral",
        "difficulty": "beginner",
        "displaySentence": "ده _____ قوي",
        "displaySentenceTashkeel": "ده _____ قَوِي",
        "displaySentenceTransliteration": "da _____ awi",
        "blankWords": [
          {
            "word": "ممل",
            "tashkeelWord": "مُمِلّ",
            "transliteration": "mumil",
            "isCorrect": true,
            "_id": new mongoose.Types.ObjectId( "690d850ae2fd22e89db27e3e")
            
          },
          {
            "word": "جميل",
            "tashkeelWord": "جَمِيل",
            "transliteration": "gameel",
            "isCorrect": false,
            "_id": new mongoose.Types.ObjectId("690d850ae2fd22e89db27e3f")
            
          },
          {
            "word": "مثير",
            "tashkeelWord": "مُثِير",
            "transliteration": "mutheer",
            "isCorrect": false,
            "_id": new mongoose.Types.ObjectId("690d850ae2fd22e89db27e40")
            
          }
        ],
        "_id": new mongoose.Types.ObjectId( "690d850ae2fd22e89db27e3d")
        ,
        "reorderWords": [],
        "matchingPairs": []
      }
    ],
    "saudi": [
      {
        "type": "fill-in-blank",
        "gender": "neutral",
        "difficulty": "beginner",
        "displaySentence": "مره _____",
        "displaySentenceTashkeel": "مَرَّه _____",
        "displaySentenceTransliteration": "marra _____",
        "blankWords": [
          {
            "word": "ممل",
            "tashkeelWord": "مُمِلّ",
            "transliteration": "mumil",
            "isCorrect": true,
            "_id": new mongoose.Types.ObjectId( "690d850ae2fd22e89db27e42")
            
          },
          {
            "word": "جميل",
            "tashkeelWord": "جَمِيل",
            "transliteration": "jameel",
            "isCorrect": false,
            "_id": new mongoose.Types.ObjectId("690d850ae2fd22e89db27e43")
            
          },
          {
            "word": "مثير",
            "tashkeelWord": "مُثِير",
            "transliteration": "mutheer",
            "isCorrect": false,
            "_id": new mongoose.Types.ObjectId( "690d850ae2fd22e89db27e44")
            
          }
        ],
        "_id": new mongoose.Types.ObjectId("690d850ae2fd22e89db27e41")
        ,
        "reorderWords": [],
        "matchingPairs": []
      }
    ]
  }
}
    };

    // Option 2: Batch edits
    const batchEdits = [
        // Add your edits here
        // {
        //     searchCriteria: { englishTranslation: "Hello" },
        //     updates: { difficulty: 'beginner' }
        // }
    ];

    // Choose which to run
    const useBatchEdit = false; // Set to true for batch editing

    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('📦 Connected to MongoDB');
            console.log('='.repeat(60));

            if (useBatchEdit) {
                if (batchEdits.length === 0) {
                    console.error('❌ No edits provided in batchEdits array');
                    process.exit(1);
                }
                return editPhrasesBatch(batchEdits);
            } else {
                return editPhrase(singleEdit.searchCriteria, singleEdit.updates);
            }
        })
        .then(() => {
            console.log('\n✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { editPhrase, editPhrasesBatch };
