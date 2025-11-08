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
    "englishTranslation": "Where is the foreigners queue?",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 1,
    "context": {
      "whenToUse": "When looking for the immigration line at the airport.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "فين طابور الأجانب؟",
          "tashkeelText": "فِين طابُور الأَجانِب؟",
          "transliteration": "feenTaboor el-aganeb?"
        },
        "female": {
          "text": "فين طابور الأجانب؟",
          "tashkeelText": "فِين طابُور الأَجانِب؟",
          "transliteration": "feen Taboor el-aganeb?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "وين طابور الأجانب؟",
          "tashkeelText": "وِين طابُور الأَجانِب؟",
          "transliteration": "ween Taboor el-aganeb?"
        },
        "female": {
          "text": "وين طابور الأجانب؟",
          "tashkeelText": "وِين طابُور الأَجانِب؟",
          "transliteration": "ween Taboor el-aganeb?"
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
          "displaySentence": "فين _____ الأجانب؟",
          "displaySentenceTashkeel": "فِين _____ الأَجانِب؟",
          "displaySentenceTransliteration": "feen _____ el-aganeb?",
          "blankWords": [
            {
              "word": "طابور",
              "tashkeelWord": "طابُور",
              "transliteration": "Taboor",
              "isCorrect": true
            },
            {
              "word": "مطار",
              "tashkeelWord": "مَطار",
              "transliteration": "maTaar",
              "isCorrect": false
            },
            {
              "word": "بوابة",
              "tashkeelWord": "بَوّابة",
              "transliteration": "bawwaaba",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "فين _____ الأجانب؟",
          "displaySentenceTashkeel": "فِين _____ الأَجانِب؟",
          "displaySentenceTransliteration": "feen _____ el-aganeb?",
          "blankWords": [
            {
              "word": "طابور",
              "tashkeelWord": "طابُور",
              "transliteration": "Taboor",
              "isCorrect": true
            },
            {
              "word": "مطار",
              "tashkeelWord": "مَطار",
              "transliteration": "maTaar",
              "isCorrect": false
            },
            {
              "word": "بوابة",
              "tashkeelWord": "بَوّابة",
              "transliteration": "bawwaaba",
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
          "displaySentence": "وين _____ الأجانب؟",
          "displaySentenceTashkeel": "وِين _____ الأَجانِب؟",
          "displaySentenceTransliteration": "ween _____ el-aganeb?",
          "blankWords": [
            {
              "word": "طابور",
              "tashkeelWord": "طابُور",
              "transliteration": "Taboor",
              "isCorrect": true
            },
            {
              "word": "مطار",
              "tashkeelWord": "مَطار",
              "transliteration": "maTaar",
              "isCorrect": false
            },
            {
              "word": "بوابة",
              "tashkeelWord": "بَوّابة",
              "transliteration": "bawwaaba",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "وين _____ الأجانب؟",
          "displaySentenceTashkeel": "وِين _____ الأَجانِب؟",
          "displaySentenceTransliteration": "ween _____ el-aganeb?",
          "blankWords": [
            {
              "word": "طابور",
              "tashkeelWord": "طابُور",
              "transliteration": "Taboor",
              "isCorrect": true
            },
            {
              "word": "مطار",
              "tashkeelWord": "مَطار",
              "transliteration": "maTaar",
              "isCorrect": false
            },
            {
              "word": "بوابة",
              "tashkeelWord": "بَوّابة",
              "transliteration": "bawwaaba",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["immigration", "queue", "airport", "navigation"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "What is the purpose of your visit?",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 2,
    "context": {
      "whenToUse": "Immigration officer asking about your reason for visiting.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "ايه سبب زيارتك؟",
          "tashkeelText": "إِيه سَبَب زِيارَتَك؟",
          "transliteration": "eh sabab zeyartak?"
        },
        "female": {
          "text": "ايه سبب زيارتك؟",
          "tashkeelText": "إِيه سَبَب زِيارَتِك؟",
          "transliteration": "eh sabab zeyartik?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "ايش سبب زيارتك؟",
          "tashkeelText": "إِيش سَبَب زِيارَتَك؟",
          "transliteration": "esh sabab zeyartak?"
        },
        "female": {
          "text": "ايش سبب زيارتك؟",
          "tashkeelText": "إِيش سَبَب زِيارَتِك؟",
          "transliteration": "esh sabab zeyartik?"
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
          "displaySentence": "ايه سبب _____؟",
          "displaySentenceTashkeel": "إِيه سَبَب _____؟",
          "displaySentenceTransliteration": "eh sabab _____?",
          "blankWords": [
            {
              "word": "زيارتك",
              "tashkeelWord": "زِيارَتَك",
              "transliteration": "zeyartak",
              "isCorrect": true
            },
            {
              "word": "رحلتك",
              "tashkeelWord": "رِحْلَتَك",
              "transliteration": "re7ltak",
              "isCorrect": false
            },
            {
              "word": "سفرك",
              "tashkeelWord": "سَفَرَك",
              "transliteration": "safarak",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "ايه سبب _____؟",
          "displaySentenceTashkeel": "إِيه سَبَب _____؟",
          "displaySentenceTransliteration": "eh sabab _____?",
          "blankWords": [
            {
              "word": "زيارتك",
              "tashkeelWord": "زِيارَتِك",
              "transliteration": "zeyartik",
              "isCorrect": true
            },
            {
              "word": "رحلتك",
              "tashkeelWord": "رِحْلَتِك",
              "transliteration": "re7ltik",
              "isCorrect": false
            },
            {
              "word": "سفرك",
              "tashkeelWord": "سَفَرِك",
              "transliteration": "safarik",
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
          "displaySentence": "ايش سبب _____؟",
          "displaySentenceTashkeel": "إِيش سَبَب _____؟",
          "displaySentenceTransliteration": "esh sabab _____?",
          "blankWords": [
            {
              "word": "زيارتك",
              "tashkeelWord": "زِيارَتَك",
              "transliteration": "zeyartak",
              "isCorrect": true
            },
            {
              "word": "رحلتك",
              "tashkeelWord": "رِحْلَتَك",
              "transliteration": "re7ltak",
              "isCorrect": false
            },
            {
              "word": "سفرك",
              "tashkeelWord": "سَفَرَك",
              "transliteration": "safarak",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "ايش سبب _____؟",
          "displaySentenceTashkeel": "إِيش سَبَب _____؟",
          "displaySentenceTransliteration": "esh sabab _____?",
          "blankWords": [
            {
              "word": "زيارتك",
              "tashkeelWord": "زِيارَتِك",
              "transliteration": "zeyartik",
              "isCorrect": true
            },
            {
              "word": "رحلتك",
              "tashkeelWord": "رِحْلَتِك",
              "transliteration": "re7ltik",
              "isCorrect": false
            },
            {
              "word": "سفرك",
              "tashkeelWord": "سَفَرِك",
              "transliteration": "safarik",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": {
      "englishTranslation": "I'm here for tourism",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": {
            "text": "جاي سياحة",
            "tashkeelText": "جاي سِياحة",
            "transliteration": "gay seyaa7a"
          },
          "female": {
            "text": "جاية سياحة",
            "tashkeelText": "جاية سِياحة",
            "transliteration": "gaya seyaa7a"
          },
          "neutral": null
        },
        "saudi": {
          "male": {
            "text": "جيت سياحة",
            "tashkeelText": "جِيت سِياحة",
            "transliteration": "jeet seyaa7a"
          },
          "female": {
            "text": "جيت سياحة",
            "tashkeelText": "جِيت سِياحة",
            "transliteration": "jeet seyaa7a"
          },
          "neutral": null
        }
      }
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["immigration", "purpose", "question", "officer"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "How long are you staying?",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 3,
    "context": {
      "whenToUse": "Immigration officer asking about duration of stay.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "هتقعد قد ايه؟",
          "tashkeelText": "هَتِقعُد قَدّ إِيه؟",
          "transliteration": "hate23od add eh?"
        },
        "female": {
          "text": "هتقعدي قد ايه؟",
          "tashkeelText": "هَتِقعُدي قَدّ إِيه؟",
          "transliteration": "hate23odi add eh?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "كم مدة إقامتك؟",
          "tashkeelText": "كَم مُدَّة إِقامَتَك؟",
          "transliteration": "kam muddat e2amatak?"
        },
        "female": {
          "text": "كم مدة إقامتك؟",
          "tashkeelText": "كَم مُدَّة إِقامَتِك؟",
          "transliteration": "kam muddat e2amatik?"
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
          "displaySentence": "هتقعد _____؟",
          "displaySentenceTashkeel": "هَتِقعُد _____؟",
          "displaySentenceTransliteration": "hate23od _____?",
          "blankWords": [
            {
              "word": "قد ايه",
              "tashkeelWord": "قَدّ إِيه",
              "transliteration": "add eh",
              "isCorrect": true
            },
            {
              "word": "كام يوم",
              "tashkeelWord": "كام يوم",
              "transliteration": "kam yoom",
              "isCorrect": false
            },
            {
              "word": "لحد امتى",
              "tashkeelWord": "لِحَدّ إِمْتَى",
              "transliteration": "le7add emta",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "هتقعدي _____؟",
          "displaySentenceTashkeel": "هَتِقعُدي _____؟",
          "displaySentenceTransliteration": "hate23odi _____?",
          "blankWords": [
            {
              "word": "قد ايه",
              "tashkeelWord": "قَدّ إِيه",
              "transliteration": "add eh",
              "isCorrect": true
            },
            {
              "word": "كام يوم",
              "tashkeelWord": "كام يوم",
              "transliteration": "kam yoom",
              "isCorrect": false
            },
            {
              "word": "لحد امتى",
              "tashkeelWord": "لِحَدّ إِمْتَى",
              "transliteration": "le7add emta",
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
          "displaySentence": "كم _____ إقامتك؟",
          "displaySentenceTashkeel": "كَم _____ إِقامَتَك؟",
          "displaySentenceTransliteration": "kam _____ e2amatak?",
          "blankWords": [
            {
              "word": "مدة",
              "tashkeelWord": "مُدَّة",
              "transliteration": "mudda",
              "isCorrect": true
            },
            {
              "word": "وقت",
              "tashkeelWord": "وَقْت",
              "transliteration": "wa2t",
              "isCorrect": false
            },
            {
              "word": "تاريخ",
              "tashkeelWord": "تارِيخ",
              "transliteration": "tareekh",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "كم _____ إقامتك؟",
          "displaySentenceTashkeel": "كَم _____ إِقامَتِك؟",
          "displaySentenceTransliteration": "kam _____ e2amatik?",
          "blankWords": [
            {
              "word": "مدة",
              "tashkeelWord": "مُدَّة",
              "transliteration": "mudda",
              "isCorrect": true
            },
            {
              "word": "وقت",
              "tashkeelWord": "وَقْت",
              "transliteration": "wa2t",
              "isCorrect": false
            },
            {
              "word": "تاريخ",
              "tashkeelWord": "تارِيخ",
              "transliteration": "tareekh",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": {
      "englishTranslation": "I'm staying for two weeks",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": {
            "text": "هقعد أسبوعين",
            "tashkeelText": "هَقعُد أُسْبوعين",
            "transliteration": "ha23od osboo3een"
          },
          "female": {
            "text": "هقعد أسبوعين",
            "tashkeelText": "هَقعُد أُسْبوعين",
            "transliteration": "ha23od osboo3een"
          },
          "neutral": null
        },
        "saudi": {
          "male": {
            "text": "بقعد أسبوعين",
            "tashkeelText": "بَأقعُد أُسْبُوعَيْن",
            "transliteration": "ba2a3od osboo3ayn"
          },
          "female": {
            "text": "بقعد أسبوعين",
            "tashkeelText": "بَأقعُد أُسْبُوعَيْن",
            "transliteration": "ba2a3od osboo3ayn"
          },
          "neutral": null
        }
      }
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["immigration", "duration", "question", "officer"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Look at the camera",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 4,
    "context": {
      "whenToUse": "Officer instructing passenger during biometric check.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "بص للكاميرا",
          "tashkeelText": "بُصّ لِلكاميرا",
          "transliteration": "boSS lel-camera"
        },
        "female": {
          "text": "بصي للكاميرا",
          "tashkeelText": "بُصّي لِلكاميرا",
          "transliteration": "boSSi lel-camera"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "طالع الكاميرا",
          "tashkeelText": "طالِع الكاميرا",
          "transliteration": "Taale3 el-camera"
        },
        "female": {
          "text": "طالعي الكاميرا",
          "tashkeelText": "طالِعي الكاميرا",
          "transliteration": "Taale3i el-camera"
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
          "displaySentence": "بص _____",
          "displaySentenceTashkeel": "بُصّ _____",
          "displaySentenceTransliteration": "boSS _____",
          "blankWords": [
            {
              "word": "للكاميرا",
              "tashkeelWord": "لِلكاميرا",
              "transliteration": "lel-camera",
              "isCorrect": true
            },
            {
              "word": "للشاشة",
              "tashkeelWord": "لِلشاشة",
              "transliteration": "lel-shasha",
              "isCorrect": false
            },
            {
              "word": "فوق",
              "tashkeelWord": "فوق",
              "transliteration": "foo2",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "بصي _____",
          "displaySentenceTashkeel": "بُصّي _____",
          "displaySentenceTransliteration": "boSSi _____",
          "blankWords": [
            {
              "word": "للكاميرا",
              "tashkeelWord": "لِلكاميرا",
              "transliteration": "lel-camera",
              "isCorrect": true
            },
            {
              "word": "للشاشة",
              "tashkeelWord": "لِلشاشة",
              "transliteration": "lel-shasha",
              "isCorrect": false
            },
            {
              "word": "فوق",
              "tashkeelWord": "فوق",
              "transliteration": "foo2",
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
          "displaySentence": "طالع _____",
          "displaySentenceTashkeel": "طالِع _____",
          "displaySentenceTransliteration": "Taale3 _____",
          "blankWords": [
            {
              "word": "الكاميرا",
              "tashkeelWord": "الكاميرا",
              "transliteration": "el-camera",
              "isCorrect": true
            },
            {
              "word": "الشاشة",
              "tashkeelWord": "الشاشة",
              "transliteration": "el-shasha",
              "isCorrect": false
            },
            {
              "word": "الجهاز",
              "tashkeelWord": "الجِهاز",
              "transliteration": "el-jehaaz",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "طالعي _____",
          "displaySentenceTashkeel": "طالِعي _____",
          "displaySentenceTransliteration": "Taale3i _____",
          "blankWords": [
            {
              "word": "الكاميرا",
              "tashkeelWord": "الكاميرا",
              "transliteration": "el-camera",
              "isCorrect": true
            },
            {
              "word": "الشاشة",
              "tashkeelWord": "الشاشة",
              "transliteration": "el-shasha",
              "isCorrect": false
            },
            {
              "word": "الجهاز",
              "tashkeelWord": "الجِهاز",
              "transliteration": "el-jehaaz",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["immigration", "biometrics", "camera", "command"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Put your finger here",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 5,
    "context": {
      "whenToUse": "Officer instructing for fingerprint scan.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "حط صباعك هنا",
          "tashkeelText": "حُطّ صُباعَك هِنا",
          "transliteration": "7oTT Sobaa3ak hena"
        },
        "female": {
          "text": "حطي صباعك هنا",
          "tashkeelText": "حُطّي صُباعِك هِنا",
          "transliteration": "7oTTi Sobaa3ik hena"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "حط إصبعك هنا",
          "tashkeelText": "حُطّ إِصْبَعَك هِنا",
          "transliteration": "7oTT eSba3ak hena"
        },
        "female": {
          "text": "حطي إصبعك هنا",
          "tashkeelText": "حُطّي إِصْبَعِك هِنا",
          "transliteration": "7oTTi eSba3ik hena"
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
          "displaySentence": "حط _____ هنا",
          "displaySentenceTashkeel": "حُطّ _____ هِنا",
          "displaySentenceTransliteration": "7oTT _____ hena",
          "blankWords": [
            {
              "word": "صباعك",
              "tashkeelWord": "صُباعَك",
              "transliteration": "Sobaa3ak",
              "isCorrect": true
            },
            {
              "word": "ايدك",
              "tashkeelWord": "إيدَك",
              "transliteration": "eedak",
              "isCorrect": false
            },
            {
              "word": "الباسبور",
              "tashkeelWord": "الباسبور",
              "transliteration": "el-passport",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "حطي _____ هنا",
          "displaySentenceTashkeel": "حُطّي _____ هِنا",
          "displaySentenceTransliteration": "7oTTi _____ hena",
          "blankWords": [
            {
              "word": "صباعك",
              "tashkeelWord": "صُباعِك",
              "transliteration": "Sobaa3ik",
              "isCorrect": true
            },
            {
              "word": "ايدك",
              "tashkeelWord": "إيدِك",
              "transliteration": "eedik",
              "isCorrect": false
            },
            {
              "word": "الباسبور",
              "tashkeelWord": "الباسبور",
              "transliteration": "el-passport",
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
          "displaySentence": "حط _____ هنا",
          "displaySentenceTashkeel": "حُطّ _____ هِنا",
          "displaySentenceTransliteration": "7oTT _____ hena",
          "blankWords": [
            {
              "word": "إصبعك",
              "tashkeelWord": "إِصْبَعَك",
              "transliteration": "eSba3ak",
              "isCorrect": true
            },
            {
              "word": "يدك",
              "tashkeelWord": "يَدَك",
              "transliteration": "yadak",
              "isCorrect": false
            },
            {
              "word": "جوازك",
              "tashkeelWord": "جَوازَك",
              "transliteration": "jawaazak",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "حطي _____ هنا",
          "displaySentenceTashkeel": "حُطّي _____ هِنا",
          "displaySentenceTransliteration": "7oTTi _____ hena",
          "blankWords": [
            {
              "word": "إصبعك",
              "tashkeelWord": "إِصْبَعِك",
              "transliteration": "eSba3ik",
              "isCorrect": true
            },
            {
              "word": "يدك",
              "tashkeelWord": "يَدِك",
              "transliteration": "yadik",
              "isCorrect": false
            },
            {
              "word": "جوازك",
              "tashkeelWord": "جَوازِك",
              "transliteration": "jawaazik",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["immigration", "biometrics", "fingerprint", "command"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Go to inspection",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 6,
    "context": {
      "whenToUse": "Officer directing passenger to customs inspection area.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "روح على التفتيش",
          "tashkeelText": "رُوح عَلى التَّفْتِيش",
          "transliteration": "roo7 3ala el-tafteesh"
        },
        "female": {
          "text": "روحي على التفتيش",
          "tashkeelText": "رُوحي عَلى التَّفْتِيش",
          "transliteration": "roo7i 3ala el-tafteesh"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "روح للتفتيش",
          "tashkeelText": "رُوح لِلتَّفْتِيش",
          "transliteration": "roo7 lel-tafteesh"
        },
        "female": {
          "text": "روحي للتفتيش",
          "tashkeelText": "رُوحي لِلتَّفْتِيش",
          "transliteration": "roo7i lel-tafteesh"
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
          "displaySentence": "روح _____ التفتيش",
          "displaySentenceTashkeel": "رُوح _____ التَّفْتِيش",
          "displaySentenceTransliteration": "roo7 _____ el-tafteesh",
          "blankWords": [
            {
              "word": "على",
              "tashkeelWord": "عَلى",
              "transliteration": "3ala",
              "isCorrect": true
            },
            {
              "word": "من",
              "tashkeelWord": "مِن",
              "transliteration": "min",
              "isCorrect": false
            },
            {
              "word": "في",
              "tashkeelWord": "في",
              "transliteration": "fee",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "روحي _____ التفتيش",
          "displaySentenceTashkeel": "رُوحي _____ التَّفْتِيش",
          "displaySentenceTransliteration": "roo7i _____ el-tafteesh",
          "blankWords": [
            {
              "word": "على",
              "tashkeelWord": "عَلى",
              "transliteration": "3ala",
              "isCorrect": true
            },
            {
              "word": "من",
              "tashkeelWord": "مِن",
              "transliteration": "min",
              "isCorrect": false
            },
            {
              "word": "في",
              "tashkeelWord": "في",
              "transliteration": "fee",
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
          "displaySentence": "روح _____",
          "displaySentenceTashkeel": "رُوح _____",
          "displaySentenceTransliteration": "roo7 _____",
          "blankWords": [
            {
              "word": "للتفتيش",
              "tashkeelWord": "لِلتَّفْتِيش",
              "transliteration": "lel-tafteesh",
              "isCorrect": true
            },
            {
              "word": "للجمرك",
              "tashkeelWord": "لِلجُمْرُك",
              "transliteration": "lel-jumruk",
              "isCorrect": false
            },
            {
              "word": "للبوابة",
              "tashkeelWord": "لِلبَوّابة",
              "transliteration": "lel-bawwaaba",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "روحي _____",
          "displaySentenceTashkeel": "رُوحي _____",
          "displaySentenceTransliteration": "roo7i _____",
          "blankWords": [
            {
              "word": "للتفتيش",
              "tashkeelWord": "لِلتَّفْتِيش",
              "transliteration": "lel-tafteesh",
              "isCorrect": true
            },
            {
              "word": "للجمرك",
              "tashkeelWord": "لِلجُمْرُك",
              "transliteration": "lel-jumruk",
              "isCorrect": false
            },
            {
              "word": "للبوابة",
              "tashkeelWord": "لِلبَوّابة",
              "transliteration": "lel-bawwaaba",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["immigration", "inspection", "customs", "command"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Random inspection",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 7,
    "context": {
      "whenToUse": "Officer announcing selection for random bag check.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "تفتيش عشوائي",
          "tashkeelText": "تَفْتِيش عَشْوائِي",
          "transliteration": "tafteesh 3ashwa2i"
        },
        "female": {
          "text": "تفتيش عشوائي",
          "tashkeelText": "تَفْتِيش عَشْوائِي",
          "transliteration": "tafteesh 3ashwa2i"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "تفتيش عشوائي",
          "tashkeelText": "تَفْتِيش عَشْوائِي",
          "transliteration": "tafteesh 3ashwa2i"
        },
        "female": {
          "text": "تفتيش عشوائي",
          "tashkeelText": "تَفْتِيش عَشْوائِي",
          "transliteration": "tafteesh 3ashwa2i"
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
          "displaySentence": "_____ عشوائي",
          "displaySentenceTashkeel": "_____ عَشْوائِي",
          "displaySentenceTransliteration": "_____ 3ashwa2i",
          "blankWords": [
            {
              "word": "تفتيش",
              "tashkeelWord": "تَفْتِيش",
              "transliteration": "tafteesh",
              "isCorrect": true
            },
            {
              "word": "فحص",
              "tashkeelWord": "فَحْص",
              "transliteration": "fa7S",
              "isCorrect": false
            },
            {
              "word": "جمرك",
              "tashkeelWord": "جُمْرُك",
              "transliteration": "jumruk",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "_____ عشوائي",
          "displaySentenceTashkeel": "_____ عَشْوائِي",
          "displaySentenceTransliteration": "_____ 3ashwa2i",
          "blankWords": [
            {
              "word": "تفتيش",
              "tashkeelWord": "تَفْتِيش",
              "transliteration": "tafteesh",
              "isCorrect": true
            },
            {
              "word": "فحص",
              "tashkeelWord": "فَحْص",
              "transliteration": "fa7S",
              "isCorrect": false
            },
            {
              "word": "جمرك",
              "tashkeelWord": "جُمْرُك",
              "transliteration": "jumruk",
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
          "displaySentence": "_____ عشوائي",
          "displaySentenceTashkeel": "_____ عَشْوائِي",
          "displaySentenceTransliteration": "_____ 3ashwa2i",
          "blankWords": [
            {
              "word": "تفتيش",
              "tashkeelWord": "تَفْتِيش",
              "transliteration": "tafteesh",
              "isCorrect": true
            },
            {
              "word": "فحص",
              "tashkeelWord": "فَحْص",
              "transliteration": "fa7S",
              "isCorrect": false
            },
            {
              "word": "جمرك",
              "tashkeelWord": "جُمْرُك",
              "transliteration": "jumruk",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "_____ عشوائي",
          "displaySentenceTashkeel": "_____ عَشْوائِي",
          "displaySentenceTransliteration": "_____ 3ashwa2i",
          "blankWords": [
            {
              "word": "تفتيش",
              "tashkeelWord": "تَفْتِيش",
              "transliteration": "tafteesh",
              "isCorrect": true
            },
            {
              "word": "فحص",
              "tashkeelWord": "فَحْص",
              "transliteration": "fa7S",
              "isCorrect": false
            },
            {
              "word": "جمرك",
              "tashkeelWord": "جُمْرُك",
              "transliteration": "jumruk",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["inspection", "customs", "random", "announcement"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Open your bag",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 8,
    "context": {
      "whenToUse": "Inspection officer requesting to check luggage.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "افتح شنطتك",
          "tashkeelText": "اِفْتَح شَنْطِتَك",
          "transliteration": "efta7 shanTitak"
        },
        "female": {
          "text": "افتحي شنطتك",
          "tashkeelText": "اِفْتَحِي شَنْطِتِك",
          "transliteration": "efta7i shanTitik"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "افتح شنطتك",
          "tashkeelText": "اِفْتَح شَنْطَتَك",
          "transliteration": "efta7 shanTatak"
        },
        "female": {
          "text": "افتحي شنطتك",
          "tashkeelText": "اِفْتَحِي شَنْطَتِك",
          "transliteration": "efta7i shanTatik"
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
          "displaySentence": "افتح _____",
          "displaySentenceTashkeel": "اِفْتَح _____",
          "displaySentenceTransliteration": "efta7 _____",
          "blankWords": [
            {
              "word": "شنطتك",
              "tashkeelWord": "شَنْطِتَك",
              "transliteration": "shanTitak",
              "isCorrect": true
            },
            {
              "word": "الباسبور بتاعك",
              "tashkeelWord": "الباسبور بِتاعَك",
              "transliteration": "el-passport beta3ak",
              "isCorrect": false
            },
            {
              "word": "الشنط الكبيرة",
              "tashkeelWord": "الشَنَط الكِبيرة",
              "transliteration": "el-shanaT el-kebeera",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "افتحي _____",
          "displaySentenceTashkeel": "اِفْتَحِي _____",
          "displaySentenceTransliteration": "efta7i _____",
          "blankWords": [
            {
              "word": "شنطتك",
              "tashkeelWord": "شَنْطِتِك",
              "transliteration": "shanTitik",
              "isCorrect": true
            },
            {
              "word": "الباسبور بتاعك",
              "tashkeelWord": "الباسبور بِتاعِك",
              "transliteration": "el-passport beta3ik",
              "isCorrect": false
            },
            {
              "word": "الشنط الكبيرة",
              "tashkeelWord": "الشَنَط الكِبيرة",
              "transliteration": "el-shanaT el-kebeera",
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
          "displaySentence": "افتح _____",
          "displaySentenceTashkeel": "اِفْتَح _____",
          "displaySentenceTransliteration": "efta7 _____",
          "blankWords": [
            {
              "word": "شنطتك",
              "tashkeelWord": "شَنْطَتَك",
              "transliteration": "shanTatak",
              "isCorrect": true
            },
            {
              "word": "جوازك",
              "tashkeelWord": "جَوازَك",
              "transliteration": "jawaazak",
              "isCorrect": false
            },
            {
              "word": "حقيبتك",
              "tashkeelWord": "حَقيبَتَك",
              "transliteration": "7a2eebatak",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "افتحي _____",
          "displaySentenceTashkeel": "اِفْتَحِي _____",
          "displaySentenceTransliteration": "efta7i _____",
          "blankWords": [
            {
              "word": "شنطتك",
              "tashkeelWord": "شَنْطَتِك",
              "transliteration": "shanTatik",
              "isCorrect": true
            },
            {
              "word": "جوازك",
              "tashkeelWord": "جَوازِك",
              "transliteration": "jawaazik",
              "isCorrect": false
            },
            {
              "word": "حقيبتك",
              "tashkeelWord": "حَقيبَتِك",
              "transliteration": "7a2eebatik",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["inspection", "customs", "luggage", "command"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Do you have anything prohibited?",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 9,
    "context": {
      "whenToUse": "Customs officer checking for illegal items.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "معاك ممنوعات؟",
          "tashkeelText": "مَعاك مَمْنوعات؟",
          "transliteration": "ma3aak mamno3aat?"
        },
        "female": {
          "text": "معاكي ممنوعات؟",
          "tashkeelText": "مَعاكي مَمْنوعات؟",
          "transliteration": "ma3aaki mamno3aat?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "عندك ممنوعات؟",
          "tashkeelText": "عِندَك مَمْنوعات؟",
          "transliteration": "3endak mamno3aat?"
        },
        "female": {
          "text": "عندك ممنوعات؟",
          "tashkeelText": "عِندِك مَمْنوعات؟",
          "transliteration": "3endik mamno3aat?"
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
          "displaySentence": "معاك _____؟",
          "displaySentenceTashkeel": "مَعاك _____؟",
          "displaySentenceTransliteration": "ma3aak _____?",
          "blankWords": [
            {
              "word": "ممنوعات",
              "tashkeelWord": "مَمْنوعات",
              "transliteration": "mamno3aat",
              "isCorrect": true
            },
            {
              "word": "شنط",
              "tashkeelWord": "شُنَط",
              "transliteration": "shunaT",
              "isCorrect": false
            },
            {
              "word": "حاجات",
              "tashkeelWord": "حاجات",
              "transliteration": "7agaat",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "معاكي _____؟",
          "displaySentenceTashkeel": "مَعاكي _____؟",
          "displaySentenceTransliteration": "ma3aaki _____?",
          "blankWords": [
            {
              "word": "ممنوعات",
              "tashkeelWord": "مَمْنوعات",
              "transliteration": "mamno3aat",
              "isCorrect": true
            },
            {
              "word": "شنط",
              "tashkeelWord": "شُنَط",
              "transliteration": "shunaT",
              "isCorrect": false
            },
            {
              "word": "حاجات",
              "tashkeelWord": "حاجات",
              "transliteration": "7agaat",
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
          "displaySentence": "عندك _____؟",
          "displaySentenceTashkeel": "عِندَك _____؟",
          "displaySentenceTransliteration": "3endak _____?",
          "blankWords": [
            {
              "word": "ممنوعات",
              "tashkeelWord": "مَمْنوعات",
              "transliteration": "mamno3aat",
              "isCorrect": true
            },
            {
              "word": "أمتعة",
              "tashkeelWord": "أَمْتِعة",
              "transliteration": "amte3a",
              "isCorrect": false
            },
            {
              "word": "مشتريات",
              "tashkeelWord": "مُشْتَرَيات",
              "transliteration": "mushtarayaat",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "عندك _____؟",
          "displaySentenceTashkeel": "عِندِك _____؟",
          "displaySentenceTransliteration": "3endik _____?",
          "blankWords": [
            {
              "word": "ممنوعات",
              "tashkeelWord": "مَمْنوعات",
              "transliteration": "mamno3aat",
              "isCorrect": true
            },
            {
              "word": "أمتعة",
              "tashkeelWord": "أَمْتِعة",
              "transliteration": "amte3a",
              "isCorrect": false
            },
            {
              "word": "مشتريات",
              "tashkeelWord": "مُشْتَرَيات",
              "transliteration": "mushtarayaat",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["inspection", "customs", "prohibited", "question"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Welcome to Saudi Arabia",
    "category": "ESSENTIAL",
    "situation": "Airport & Travel",
    "commonRank": 10,
    "context": {
      "whenToUse": "Officer welcoming after clearing immigration.",
      "formality": "formal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "أهلا وسهلا بيك في مصر",
          "tashkeelText": "أَهْلًا وَسَهْلًا بيك فِي مِصْر",
          "transliteration": "ahlan wa sahlan beek fi maSr"
        },
        "female": {
          "text": "أهلا وسهلا بيكي في مصر",
          "tashkeelText": "أَهْلًا وَسَهْلًا بيكي فِي مِصْر",
          "transliteration": "ahlan wa sahlan beeki fi maSr"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "أهلا وسهلا بك في السعودية",
          "tashkeelText": "أَهْلًا وَسَهْلًا بِك فِي السُّعُودِيَّة",
          "transliteration": "ahlan wa sahlan bek fi el-sa3oodeya"
        },
        "female": {
          "text": "أهلا وسهلا بك في السعودية",
          "tashkeelText": "أَهْلًا وَسَهْلًا بِك فِي السُّعُودِيَّة",
          "transliteration": "ahlan wa sahlan bek fi el-sa3oodeya"
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
          "displaySentence": "_____ في مصر",
          "displaySentenceTashkeel": "_____ فِي مِصْر",
          "displaySentenceTransliteration": "_____ fi maSr",
          "blankWords": [
            {
              "word": "أهلا وسهلا بيك",
              "tashkeelWord": "أَهْلًا وَسَهْلًا بيك",
              "transliteration": "ahlan wa sahlan beek",
              "isCorrect": true
            },
            {
              "word": "روح على التفتيش",
              "tashkeelWord": "رُوح عَلى التَّفْتِيش",
              "transliteration": "roo7 3ala el-tafteesh",
              "isCorrect": false
            },
            {
              "word": "افتح شنطتك",
              "tashkeelWord": "اِفْتَح شَنْطِتَك",
              "transliteration": "efta7 shanTitak",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "_____ في مصر",
          "displaySentenceTashkeel": "_____ فِي مِصْر",
          "displaySentenceTransliteration": "_____ fi maSr",
          "blankWords": [
            {
              "word": "أهلا وسهلا بيكي",
              "tashkeelWord": "أَهْلًا وَسَهْلًا بيكي",
              "transliteration": "ahlan wa sahlan beeki",
              "isCorrect": true
            },
            {
              "word": "روحي على التفتيش",
              "tashkeelWord": "رُوحي عَلى التَّفْتِيش",
              "transliteration": "roo7i 3ala el-tafteesh",
              "isCorrect": false
            },
            {
              "word": "افتحي شنطتك",
              "tashkeelWord": "اِفْتَحِي شَنْطِتِك",
              "transliteration": "efta7i shanTitik",
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
          "displaySentence": "_____ في السعودية",
          "displaySentenceTashkeel": "_____ فِي السُّعُودِيَّة",
          "displaySentenceTransliteration": "_____ fi el-sa3oodeya",
          "blankWords": [
            {
              "word": "أهلا وسهلا بك",
              "tashkeelWord": "أَهْلًا وَسَهْلًا بِك",
              "transliteration": "ahlan wa sahlan bek",
              "isCorrect": true
            },
            {
              "word": "روح للتفتيش",
              "tashkeelWord": "رُوح لِلتَّفْتِيش",
              "transliteration": "roo7 lel-tafteesh",
              "isCorrect": false
            },
            {
              "word": "افتح شنطتك",
              "tashkeelWord": "اِفْتَح شَنْطَتَك",
              "transliteration": "efta7 shanTatak",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "_____ في السعودية",
          "displaySentenceTashkeel": "_____ فِي السُّعُودِيَّة",
          "displaySentenceTransliteration": "_____ fi el-sa3oodeya",
          "blankWords": [
            {
              "word": "أهلا وسهلا بك",
              "tashkeelWord": "أَهْلًا وَسَهْلًا بِك",
              "transliteration": "ahlan wa sahlan bek",
              "isCorrect": true
            },
            {
              "word": "روحي للتفتيش",
              "tashkeelWord": "رُوحي لِلتَّفْتِيش",
              "transliteration": "roo7i lel-tafteesh",
              "isCorrect": false
            },
            {
              "word": "افتحي شنطتك",
              "tashkeelWord": "اِفْتَحِي شَنْطَتِك",
              "transliteration": "efta7i shanTatik",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["immigration", "welcome", "greeting", "clearance"],
    "isActive": true,
    "isApproved": true
  },
    {
    "englishTranslation": "Thank God for your safe arrival",
    "category": "SOCIAL",
    "situation": "Airport & Travel",
    "commonRank": 11,
    "context": {
      "whenToUse": "Greeting someone who just arrived from travel.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "الحمدلله على السلامة",
          "tashkeelText": "الحَمْدُلله عَلى السَّلامة",
          "transliteration": "el-7amdulellah 3ala el-salama"
        },
        "female": {
          "text": "الحمدلله على السلامة",
          "tashkeelText": "الحَمْدُلله عَلى السَّلامة",
          "transliteration": "el-7amdulellah 3ala el-salama"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "الحمدلله على السلامة",
          "tashkeelText": "الحَمْدُلله عَلى السَّلامة",
          "transliteration": "el-7amdulellah 3ala el-salama"
        },
        "female": {
          "text": "الحمدلله على السلامة",
          "tashkeelText": "الحَمْدُلله عَلى السَّلامة",
          "transliteration": "el-7amdulellah 3ala el-salama"
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
          "displaySentence": "الحمدلله على _____",
          "displaySentenceTashkeel": "الحَمْدُلله عَلى _____",
          "displaySentenceTransliteration": "el-7amdulellah 3ala _____",
          "blankWords": [
            {
              "word": "السلامة",
              "tashkeelWord": "السَّلامة",
              "transliteration": "el-salama",
              "isCorrect": true
            },
            {
              "word": "الوصول",
              "tashkeelWord": "الوُصول",
              "transliteration": "el-wuSool",
              "isCorrect": false
            },
            {
              "word": "الرحلة",
              "tashkeelWord": "الرِّحْلة",
              "transliteration": "el-re7la",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "الحمدلله على _____",
          "displaySentenceTashkeel": "الحَمْدُلله عَلى _____",
          "displaySentenceTransliteration": "el-7amdulellah 3ala _____",
          "blankWords": [
            {
              "word": "السلامة",
              "tashkeelWord": "السَّلامة",
              "transliteration": "el-salama",
              "isCorrect": true
            },
            {
              "word": "الوصول",
              "tashkeelWord": "الوُصول",
              "transliteration": "el-wuSool",
              "isCorrect": false
            },
            {
              "word": "الرحلة",
              "tashkeelWord": "الرِّحْلة",
              "transliteration": "el-re7la",
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
          "displaySentence": "الحمدلله على _____",
          "displaySentenceTashkeel": "الحَمْدُلله عَلى _____",
          "displaySentenceTransliteration": "el-7amdulellah 3ala _____",
          "blankWords": [
            {
              "word": "السلامة",
              "tashkeelWord": "السَّلامة",
              "transliteration": "el-salama",
              "isCorrect": true
            },
            {
              "word": "الوصول",
              "tashkeelWord": "الوُصول",
              "transliteration": "el-wuSool",
              "isCorrect": false
            },
            {
              "word": "الرحلة",
              "tashkeelWord": "الرِّحْلة",
              "transliteration": "el-re7la",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "الحمدلله على _____",
          "displaySentenceTashkeel": "الحَمْدُلله عَلى _____",
          "displaySentenceTransliteration": "el-7amdulellah 3ala _____",
          "blankWords": [
            {
              "word": "السلامة",
              "tashkeelWord": "السَّلامة",
              "transliteration": "el-salama",
              "isCorrect": true
            },
            {
              "word": "الوصول",
              "tashkeelWord": "الوُصول",
              "transliteration": "el-wuSool",
              "isCorrect": false
            },
            {
              "word": "الرحلة",
              "tashkeelWord": "الرِّحْلة",
              "transliteration": "el-re7la",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["greeting", "arrival", "safety", "welcome"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Arrive safely",
    "category": "SOCIAL",
    "situation": "Airport & Travel",
    "commonRank": 12,
    "context": {
      "whenToUse": "Wishing someone safe travels before departure.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "توصل بالسلامة",
          "tashkeelText": "تُوصَل بِالسَّلامة",
          "transliteration": "tewSal bel-salama"
        },
        "female": {
          "text": "توصلي بالسلامة",
          "tashkeelText": "تُوصَلي بِالسَّلامة",
          "transliteration": "tewSali bel-salama"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "توصل بالسلامة",
          "tashkeelText": "تُوصَل بِالسَّلامة",
          "transliteration": "tewSal bel-salama"
        },
        "female": {
          "text": "توصلي بالسلامة",
          "tashkeelText": "تُوصَلي بِالسَّلامة",
          "transliteration": "tewSali bel-salama"
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
          "displaySentence": "توصل _____",
          "displaySentenceTashkeel": "تُوصَل _____",
          "displaySentenceTransliteration": "tewSal _____",
          "blankWords": [
            {
              "word": "بالسلامة",
              "tashkeelWord": "بِالسَّلامة",
              "transliteration": "bel-salama",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرة",
              "transliteration": "bokra",
              "isCorrect": false
            },
            {
              "word": "المطار",
              "tashkeelWord": "المَطار",
              "transliteration": "el-maTaar",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "توصلي _____",
          "displaySentenceTashkeel": "تُوصَلي _____",
          "displaySentenceTransliteration": "tewSali _____",
          "blankWords": [
            {
              "word": "بالسلامة",
              "tashkeelWord": "بِالسَّلامة",
              "transliteration": "bel-salama",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرة",
              "transliteration": "bokra",
              "isCorrect": false
            },
            {
              "word": "المطار",
              "tashkeelWord": "المَطار",
              "transliteration": "el-maTaar",
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
          "displaySentence": "توصل _____",
          "displaySentenceTashkeel": "تُوصَل _____",
          "displaySentenceTransliteration": "tewSal _____",
          "blankWords": [
            {
              "word": "بالسلامة",
              "tashkeelWord": "بِالسَّلامة",
              "transliteration": "bel-salama",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرة",
              "transliteration": "bokra",
              "isCorrect": false
            },
            {
              "word": "المطار",
              "tashkeelWord": "المَطار",
              "transliteration": "el-maTaar",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "توصلي _____",
          "displaySentenceTashkeel": "تُوصَلي _____",
          "displaySentenceTransliteration": "tewSali _____",
          "blankWords": [
            {
              "word": "بالسلامة",
              "tashkeelWord": "بِالسَّلامة",
              "transliteration": "bel-salama",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرة",
              "transliteration": "bokra",
              "isCorrect": false
            },
            {
              "word": "المطار",
              "tashkeelWord": "المَطار",
              "transliteration": "el-maTaar",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "followUp": null,
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["farewell", "departure", "safety", "blessing"],
    "isActive": true,
    "isApproved": true
  }
]

    const categoryName = 'ESSENTIAL'; // Change this
    const situationName = 'airport-travel'; // Change this

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
