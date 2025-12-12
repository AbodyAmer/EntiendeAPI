require('dotenv').config();
const mongoose = require('mongoose');
const Phrase = require('../models/Phrase');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

/**
 * Add multiple phrases to the database in batch
 *
 * @param {Array<Object>} phrasesArray - Array of phrase data objects
 * @param {string} categoryName - Category name (e.g., "SOCIAL", "ESSENTIAL")
 * @param {string} situationName - Situation name (e.g., "greetings")
 * @returns {Promise<Object>} - Results summary
 */
async function addPhrasesBatch(phrasesArray, categoryName, situationName) {
    try {
        // Find category
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            throw new Error(`Category "${categoryName}" not found. Please create it first.`);
        }

        // Find situation
        const situation = await Situation.findOne({ name: situationName, categoryId: category._id });
        if (!situation) {
            throw new Error(`Situation "${situationName}" not found in category "${categoryName}". Please create it first.`);
        }

        const results = {
            success: [],
            failed: [],
            total: phrasesArray.length
        };

        console.log(`\n📝 Adding ${phrasesArray.length} phrases to ${categoryName} > ${situationName}...\n`);

        for (let i = 0; i < phrasesArray.length; i++) {
            const phraseData = phrasesArray[i];

            try {
                // Prepare phrase document
                const phraseDocument = {
                    englishTranslation: phraseData.englishTranslation,
                    intent: phraseData.intent,
                    category: category._id,
                    situation: situation._id,
                    context: phraseData.context,
                    variations: phraseData.variations,
                    commonRank: 1000000,
                    hasGenderVariation: phraseData.hasGenderVariation || false,
                    tags: phraseData.tags || [],
                    difficulty: phraseData.difficulty || 'beginner',
                    frequency: phraseData.frequency || 'medium',
                    isActive: true,
                    isApproved: true
                };

                // Add gameContext if provided
                if (phraseData.gameContext) {
                    phraseDocument.gameContext = phraseData.gameContext;
                }

                // Add exercises if provided
                if (phraseData.exercises) {
                    phraseDocument.exercises = phraseData.exercises;
                }

                // Add followUp if provided
                if (phraseData.followUp) {
                    phraseDocument.followUp = phraseData.followUp;
                }

                // Create and save phrase
                const phrase = new Phrase(phraseDocument);
                await phrase.save();

                console.log(`✅ [${i + 1}/${phrasesArray.length}] "${phraseData.englishTranslation}"`);
                results.success.push({
                    id: phrase._id,
                    englishTranslation: phrase.englishTranslation
                });

            } catch (error) {
                console.error(`❌ [${i + 1}/${phrasesArray.length}] Failed: "${phraseData.englishTranslation}"`);
                console.error(`   Error: ${error.message}`);
                results.failed.push({
                    englishTranslation: phraseData.englishTranslation,
                    error: error.message
                });
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Success: ${results.success.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        console.log(`📝 Total: ${results.total}`);
        console.log('='.repeat(60));

        if (results.failed.length > 0) {
            console.log('\n❌ Failed phrases:');
            results.failed.forEach(f => console.log(`   - ${f.englishTranslation}: ${f.error}`));
        }

        return results;

    } catch (error) {
        console.error('❌ Error in batch operation:', error.message);
        throw error;
    }
}

// Connect to database and run if executed directly
if (require.main === module) {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/efham';

    // Example: Replace this array with your phrases
    const phrasesArray = [
  {
    "englishTranslation": "Where should we meet?",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Asking for the meetup location",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "نتقابل فين؟",
          "tashkeelText": "نِتْقَابِل فِين؟",
          "transliteration": "netʾabel fein?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "وين نتقابل؟",
          "tashkeelText": "وَيْن نِتْقَابَل؟",
          "transliteration": "wein netʾabel?"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ فين؟",
          "displaySentenceTashkeel": "_____ فِين؟",
          "displaySentenceTransliteration": "_____ fein?",
          "blankWords": [
            {
              "word": "نتقابل",
              "tashkeelWord": "نِتْقَابِل",
              "transliteration": "netʾabel",
              "isCorrect": true
            },
            {
              "word": "نروح",
              "tashkeelWord": "نِرُوح",
              "transliteration": "nerūḥ",
              "isCorrect": false
            },
            {
              "word": "نقعد",
              "tashkeelWord": "نِقْعُد",
              "transliteration": "neʾʿod",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "وين _____؟",
          "displaySentenceTashkeel": "وَيْن _____؟",
          "displaySentenceTransliteration": "wein _____?",
          "blankWords": [
            {
              "word": "نتقابل",
              "tashkeelWord": "نِتْقَابَل",
              "transliteration": "netʾabel",
              "isCorrect": true
            },
            {
              "word": "نروح",
              "tashkeelWord": "نِرُوح",
              "transliteration": "nerūḥ",
              "isCorrect": false
            },
            {
              "word": "نقعد",
              "tashkeelWord": "نِقْعُد",
              "transliteration": "neʾʿod",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["planning", "meeting", "location", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "What time works for you?",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Asking what time is good for them",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أي وقت يناسبك؟",
          "tashkeelText": "أَيّ وَقْت يِناسِبَك؟",
          "transliteration": "ayy waʾt yenāsebak?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أي وقت يناسبك؟",
          "tashkeelText": "أَيّ وَقْت يِناسِبَك؟",
          "transliteration": "ayy waʾt yenāsebak?"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أي _____ يناسبك؟",
          "displaySentenceTashkeel": "أَيّ _____ يِناسِبَك؟",
          "displaySentenceTransliteration": "ayy _____ yenāsebak?",
          "blankWords": [
            {
              "word": "وقت",
              "tashkeelWord": "وَقْت",
              "transliteration": "waʾt",
              "isCorrect": true
            },
            {
              "word": "يوم",
              "tashkeelWord": "يَوْم",
              "transliteration": "yōm",
              "isCorrect": false
            },
            {
              "word": "مكان",
              "tashkeelWord": "مَكَان",
              "transliteration": "makān",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أي _____ يناسبك؟",
          "displaySentenceTashkeel": "أَيّ _____ يِناسِبَك؟",
          "displaySentenceTransliteration": "ayy _____ yenāsebak?",
          "blankWords": [
            {
              "word": "وقت",
              "tashkeelWord": "وَقْت",
              "transliteration": "waʾt",
              "isCorrect": true
            },
            {
              "word": "يوم",
              "tashkeelWord": "يَوْم",
              "transliteration": "yōm",
              "isCorrect": false
            },
            {
              "word": "مكان",
              "tashkeelWord": "مَكَان",
              "transliteration": "makān",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["planning", "scheduling", "time", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm on the way",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Telling someone you're coming now",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أنا في السكة",
          "tashkeelText": "أَنا في السِّكَّة",
          "transliteration": "ana fe-ssekka"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أنا في الطريق",
          "tashkeelText": "أَنا في الطَّريق",
          "transliteration": "ana fe-ṭṭarīq"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا في _____",
          "displaySentenceTashkeel": "أَنا في _____",
          "displaySentenceTransliteration": "ana fe _____",
          "blankWords": [
            {
              "word": "السكة",
              "tashkeelWord": "السِّكَّة",
              "transliteration": "ssekka",
              "isCorrect": true
            },
            {
              "word": "البيت",
              "tashkeelWord": "البَيْت",
              "transliteration": "el-beit",
              "isCorrect": false
            },
            {
              "word": "الشغل",
              "tashkeelWord": "الشُّغْل",
              "transliteration": "eshshoɣl",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا في _____",
          "displaySentenceTashkeel": "أَنا في _____",
          "displaySentenceTransliteration": "ana fe _____",
          "blankWords": [
            {
              "word": "الطريق",
              "tashkeelWord": "الطَّريق",
              "transliteration": "aṭṭarīq",
              "isCorrect": true
            },
            {
              "word": "البيت",
              "tashkeelWord": "البَيْت",
              "transliteration": "el-beit",
              "isCorrect": false
            },
            {
              "word": "الشغل",
              "tashkeelWord": "الشُّغْل",
              "transliteration": "eshshoɣl",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["coordination", "meeting", "traveling", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm free today",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Saying you have no plans today",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "أنا فاضي النهاردة",
          "tashkeelText": "أَنا فَاضِي النَّهارْدَه",
          "transliteration": "ana fāḍi ennaharda"
        },
        "female": {
          "text": "أنا فاضية النهاردة",
          "tashkeelText": "أَنا فَاضْيَة النَّهارْدَه",
          "transliteration": "ana fāḍya ennaharda"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "أنا فاضي اليوم",
          "tashkeelText": "أَنا فَاضِي اليَوْم",
          "transliteration": "ana fāḍi elyōm"
        },
        "female": {
          "text": "أنا فاضية اليوم",
          "tashkeelText": "أَنا فَاضْيَة اليَوْم",
          "transliteration": "ana fāḍya elyōm"
        },
        "neutral": null
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "أنا _____ النهاردة",
          "displaySentenceTashkeel": "أَنا _____ النَّهارْدَه",
          "displaySentenceTransliteration": "ana _____ ennaharda",
          "blankWords": [
            {
              "word": "فاضي",
              "tashkeelWord": "فَاضِي",
              "transliteration": "fāḍi",
              "isCorrect": true
            },
            {
              "word": "مشغول",
              "tashkeelWord": "مَشْغُول",
              "transliteration": "mashɣūl",
              "isCorrect": false
            },
            {
              "word": "تعبان",
              "tashkeelWord": "تَعْبَان",
              "transliteration": "taʿbān",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "أنا _____ النهاردة",
          "displaySentenceTashkeel": "أَنا _____ النَّهارْدَه",
          "displaySentenceTransliteration": "ana _____ ennaharda",
          "blankWords": [
            {
              "word": "فاضية",
              "tashkeelWord": "فَاضْيَة",
              "transliteration": "fāḍya",
              "isCorrect": true
            },
            {
              "word": "مشغولة",
              "tashkeelWord": "مَشْغُولَة",
              "transliteration": "mashɣūla",
              "isCorrect": false
            },
            {
              "word": "تعبانة",
              "tashkeelWord": "تَعْبَانَة",
              "transliteration": "taʿbāna",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "أنا _____ اليوم",
          "displaySentenceTashkeel": "أَنا _____ اليَوْم",
          "displaySentenceTransliteration": "ana _____ elyōm",
          "blankWords": [
            {
              "word": "فاضي",
              "tashkeelWord": "فَاضِي",
              "transliteration": "fāḍi",
              "isCorrect": true
            },
            {
              "word": "مشغول",
              "tashkeelWord": "مَشْغُول",
              "transliteration": "mashɣūl",
              "isCorrect": false
            },
            {
              "word": "تعبان",
              "tashkeelWord": "تَعْبَان",
              "transliteration": "taʿbān",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "أنا _____ اليوم",
          "displaySentenceTashkeel": "أَنا _____ اليَوْم",
          "displaySentenceTransliteration": "ana _____ elyōm",
          "blankWords": [
            {
              "word": "فاضية",
              "tashkeelWord": "فَاضْيَة",
              "transliteration": "fāḍya",
              "isCorrect": true
            },
            {
              "word": "مشغولة",
              "tashkeelWord": "مَشْغُولَة",
              "transliteration": "mashɣūla",
              "isCorrect": false
            },
            {
              "word": "تعبانة",
              "tashkeelWord": "تَعْبَانَة",
              "transliteration": "taʿbāna",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["availability", "planning", "free-time", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Long time no see",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Saying you haven't seen them in a while",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "من زمان عنك",
          "tashkeelText": "مِن زَمَان عَنَّك",
          "transliteration": "men zamān ʿannak"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "زمان عنك",
          "tashkeelText": "زَمَان عَنَّك",
          "transliteration": "zamān ʿannak"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ عنك",
          "displaySentenceTashkeel": "_____ عَنَّك",
          "displaySentenceTransliteration": "_____ ʿannak",
          "blankWords": [
            {
              "word": "من زمان",
              "tashkeelWord": "مِن زَمَان",
              "transliteration": "men zamān",
              "isCorrect": true
            },
            {
              "word": "شوية",
              "tashkeelWord": "شُوَيَّة",
              "transliteration": "shwayya",
              "isCorrect": false
            },
            {
              "word": "كثير",
              "tashkeelWord": "كِتِير",
              "transliteration": "ketīr",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ عنك",
          "displaySentenceTashkeel": "_____ عَنَّك",
          "displaySentenceTransliteration": "_____ ʿannak",
          "blankWords": [
            {
              "word": "زمان",
              "tashkeelWord": "زَمَان",
              "transliteration": "zamān",
              "isCorrect": true
            },
            {
              "word": "شوية",
              "tashkeelWord": "شُوَيَّة",
              "transliteration": "shwayya",
              "isCorrect": false
            },
            {
              "word": "كثير",
              "tashkeelWord": "كَثِير",
              "transliteration": "kathīr",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["greeting", "reunion", "time", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "It's okay",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Saying something is fine/acceptable",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "عادي",
          "tashkeelText": "عَادِي",
          "transliteration": "ʿādi"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "عادي",
          "tashkeelText": "عَادِي",
          "transliteration": "ʿādi"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____",
          "displaySentenceTashkeel": "_____",
          "displaySentenceTransliteration": "_____",
          "blankWords": [
            {
              "word": "عادي",
              "tashkeelWord": "عَادِي",
              "transliteration": "ʿādi",
              "isCorrect": true
            },
            {
              "word": "تمام",
              "tashkeelWord": "تَمَام",
              "transliteration": "tamām",
              "isCorrect": false
            },
            {
              "word": "ممتاز",
              "tashkeelWord": "مُمْتَاز",
              "transliteration": "momtāz",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____",
          "displaySentenceTashkeel": "_____",
          "displaySentenceTransliteration": "_____",
          "blankWords": [
            {
              "word": "عادي",
              "tashkeelWord": "عَادِي",
              "transliteration": "ʿādi",
              "isCorrect": true
            },
            {
              "word": "تمام",
              "tashkeelWord": "تَمَام",
              "transliteration": "tamām",
              "isCorrect": false
            },
            {
              "word": "ممتاز",
              "tashkeelWord": "مُمْتَاز",
              "transliteration": "momtāz",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["reassurance", "acceptance", "response", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "No worries",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Telling someone not to worry",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "ما تشيلش هم",
          "tashkeelText": "مَا تِشِيلْش هَمّ",
          "transliteration": "ma tshīlsh hamm"
        },
        "female": {
          "text": "ما تشيليش هم",
          "tashkeelText": "مَا تِشِيلِيش هَمّ",
          "transliteration": "ma tshīlīsh hamm"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "لا تشيل هم",
          "tashkeelText": "لا تِشِيل هَمّ",
          "transliteration": "la tshīl hamm"
        },
        "female": {
          "text": "لا تشيلي هم",
          "tashkeelText": "لا تِشِيلِي هَمّ",
          "transliteration": "la tshīli hamm"
        },
        "neutral": null
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "ما تشيلش _____",
          "displaySentenceTashkeel": "مَا تِشِيلْش _____",
          "displaySentenceTransliteration": "ma tshīlsh _____",
          "blankWords": [
            {
              "word": "هم",
              "tashkeelWord": "هَمّ",
              "transliteration": "hamm",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shoɣl",
              "isCorrect": false
            },
            {
              "word": "حاجة",
              "tashkeelWord": "حَاجَة",
              "transliteration": "ḥāga",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "ما تشيليش _____",
          "displaySentenceTashkeel": "مَا تِشِيلِيش _____",
          "displaySentenceTransliteration": "ma tshīlīsh _____",
          "blankWords": [
            {
              "word": "هم",
              "tashkeelWord": "هَمّ",
              "transliteration": "hamm",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shoɣl",
              "isCorrect": false
            },
            {
              "word": "حاجة",
              "tashkeelWord": "حَاجَة",
              "transliteration": "ḥāga",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "لا تشيل _____",
          "displaySentenceTashkeel": "لا تِشِيل _____",
          "displaySentenceTransliteration": "la tshīl _____",
          "blankWords": [
            {
              "word": "هم",
              "tashkeelWord": "هَمّ",
              "transliteration": "hamm",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shoɣl",
              "isCorrect": false
            },
            {
              "word": "حاجة",
              "tashkeelWord": "حَاجَة",
              "transliteration": "ḥāja",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "لا تشيلي _____",
          "displaySentenceTashkeel": "لا تِشِيلِي _____",
          "displaySentenceTransliteration": "la tshīli _____",
          "blankWords": [
            {
              "word": "هم",
              "tashkeelWord": "هَمّ",
              "transliteration": "hamm",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shoɣl",
              "isCorrect": false
            },
            {
              "word": "حاجة",
              "tashkeelWord": "حَاجَة",
              "transliteration": "ḥāja",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["reassurance", "comfort", "concern", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Let's go",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Suggesting to leave or start now",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "يلا",
          "tashkeelText": "يَلَّا",
          "transliteration": "yalla"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "يلا",
          "tashkeelText": "يَلَّا",
          "transliteration": "yalla"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____",
          "displaySentenceTashkeel": "_____",
          "displaySentenceTransliteration": "_____",
          "blankWords": [
            {
              "word": "يلا",
              "tashkeelWord": "يَلَّا",
              "transliteration": "yalla",
              "isCorrect": true
            },
            {
              "word": "خلاص",
              "tashkeelWord": "خَلَاص",
              "transliteration": "khalāṣ",
              "isCorrect": false
            },
            {
              "word": "ماشي",
              "tashkeelWord": "مَاشِي",
              "transliteration": "māshi",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____",
          "displaySentenceTashkeel": "_____",
          "displaySentenceTransliteration": "_____",
          "blankWords": [
            {
              "word": "يلا",
              "tashkeelWord": "يَلَّا",
              "transliteration": "yalla",
              "isCorrect": true
            },
            {
              "word": "خلاص",
              "tashkeelWord": "خَلَاص",
              "transliteration": "khalāṣ",
              "isCorrect": false
            },
            {
              "word": "ماشي",
              "tashkeelWord": "مَاشِي",
              "transliteration": "māshi",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["invitation", "departure", "action", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Take a picture",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Asking someone to take your photo",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "خذ صورة",
          "tashkeelText": "خُذْ صُورَة",
          "transliteration": "khud ṣūra"
        },
        "female": {
          "text": "خدي صورة",
          "tashkeelText": "خُدِي صُورَة",
          "transliteration": "khudi ṣūra"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "خذ صورة",
          "tashkeelText": "خُذْ صُورَة",
          "transliteration": "khudh ṣūra"
        },
        "female": {
          "text": "خذي صورة",
          "tashkeelText": "خُذِي صُورَة",
          "transliteration": "khudhi ṣūra"
        },
        "neutral": null
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "خذ _____",
          "displaySentenceTashkeel": "خُذْ _____",
          "displaySentenceTransliteration": "khud _____",
          "blankWords": [
            {
              "word": "صورة",
              "tashkeelWord": "صُورَة",
              "transliteration": "ṣūra",
              "isCorrect": true
            },
            {
              "word": "رقم",
              "tashkeelWord": "رَقَم",
              "transliteration": "raʾam",
              "isCorrect": false
            },
            {
              "word": "موبايل",
              "tashkeelWord": "مُوبَايِل",
              "transliteration": "mōbāyel",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "خدي _____",
          "displaySentenceTashkeel": "خُدِي _____",
          "displaySentenceTransliteration": "khudi _____",
          "blankWords": [
            {
              "word": "صورة",
              "tashkeelWord": "صُورَة",
              "transliteration": "ṣūra",
              "isCorrect": true
            },
            {
              "word": "رقم",
              "tashkeelWord": "رَقَم",
              "transliteration": "raʾam",
              "isCorrect": false
            },
            {
              "word": "موبايل",
              "tashkeelWord": "مُوبَايِل",
              "transliteration": "mōbāyel",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "خذ _____",
          "displaySentenceTashkeel": "خُذْ _____",
          "displaySentenceTransliteration": "khudh _____",
          "blankWords": [
            {
              "word": "صورة",
              "tashkeelWord": "صُورَة",
              "transliteration": "ṣūra",
              "isCorrect": true
            },
            {
              "word": "رقم",
              "tashkeelWord": "رَقَم",
              "transliteration": "raʾam",
              "isCorrect": false
            },
            {
              "word": "موبايل",
              "tashkeelWord": "مُوبَايِل",
              "transliteration": "mōbāyel",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "خذي _____",
          "displaySentenceTashkeel": "خُذِي _____",
          "displaySentenceTransliteration": "khudhi _____",
          "blankWords": [
            {
              "word": "صورة",
              "tashkeelWord": "صُورَة",
              "transliteration": "ṣūra",
              "isCorrect": true
            },
            {
              "word": "رقم",
              "tashkeelWord": "رَقَم",
              "transliteration": "raʾam",
              "isCorrect": false
            },
            {
              "word": "موبايل",
              "tashkeelWord": "مُوبَايِل",
              "transliteration": "mōbāyel",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["photography", "request", "command", "social-life"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm bored",
    "category": "SOCIAL",
    "situation": "Social Life",
    "context": {
      "whenToUse": "Expressing that you want to do something",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "أنا زهقان",
          "tashkeelText": "أَنَا زَهْقَان",
          "transliteration": "ana zahʾān"
        },
        "female": {
          "text": "أنا زهقانة",
          "tashkeelText": "أَنَا زَهْقَانَة",
          "transliteration": "ana zahʾāna"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "أنا طفشان",
          "tashkeelText": "أَنَا طَفْشَان",
          "transliteration": "ana ṭafshān"
        },
        "female": {
          "text": "أنا طفشانة",
          "tashkeelText": "أَنَا طَفْشَانَة",
          "transliteration": "ana ṭafshāna"
        },
        "neutral": null
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "أنا _____",
          "displaySentenceTashkeel": "أَنَا _____",
          "displaySentenceTransliteration": "ana _____",
          "blankWords": [
            {
              "word": "زهقان",
              "tashkeelWord": "زَهْقَان",
              "transliteration": "zahʾān",
              "isCorrect": true
            },
            {
              "word": "تعبان",
              "tashkeelWord": "تَعْبَان",
              "transliteration": "taʿbān",
              "isCorrect": false
            },
            {
              "word": "جوعان",
              "tashkeelWord": "جُوعَان",
              "transliteration": "gūʿān",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "أنا _____",
          "displaySentenceTashkeel": "أَنَا _____",
          "displaySentenceTransliteration": "ana _____",
          "blankWords": [
            {
              "word": "زهقانة",
              "tashkeelWord": "زَهْقَانَة",
              "transliteration": "zahʾāna",
              "isCorrect": true
            },
            {
              "word": "تعبانة",
              "tashkeelWord": "تَعْبَانَة",
              "transliteration": "taʿbāna",
              "isCorrect": false
            },
            {
              "word": "جوعانة",
              "tashkeelWord": "جُوعَانَة",
              "transliteration": "gūʿāna",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "أنا _____",
          "displaySentenceTashkeel": "أَنَا _____",
          "displaySentenceTransliteration": "ana _____",
          "blankWords": [
            {
              "word": "طفشان",
              "tashkeelWord": "طَفْشَان",
              "transliteration": "ṭafshān",
              "isCorrect": true
            },
            {
              "word": "تعبان",
              "tashkeelWord": "تَعْبَان",
              "transliteration": "taʿbān",
              "isCorrect": false
            },
            {
              "word": "جوعان",
              "tashkeelWord": "جُوعَان",
              "transliteration": "jūʿān",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "أنا _____",
          "displaySentenceTashkeel": "أَنَا _____",
          "displaySentenceTransliteration": "ana _____",
          "blankWords": [
            {
              "word": "طفشانة",
              "tashkeelWord": "طَفْشَانَة",
              "transliteration": "ṭafshāna",
              "isCorrect": true
            },
            {
              "word": "تعبانة",
              "tashkeelWord": "تَعْبَانَة",
              "transliteration": "taʿbāna",
              "isCorrect": false
            },
            {
              "word": "جوعانة",
              "tashkeelWord": "جُوعَانَة",
              "transliteration": "jūʿāna",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["feelings", "boredom", "state", "social-life"],
    "isActive": true,
    "isApproved": true
  }
]
    const categoryName = 'SOCIAL'; // Change this
    const situationName = 'social-life'; // Change this

    if (phrasesArray.length === 0) {
        console.error('❌ No phrases provided. Please add phrases to the phrasesArray.');
        process.exit(1);
    }

    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('📦 Connected to MongoDB');
            console.log('='.repeat(60));
            return addPhrasesBatch(phrasesArray, categoryName, situationName);
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

module.exports = addPhrasesBatch;
