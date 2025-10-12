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
    "englishTranslation": "I'm traveling for tourism",
    "intent": "Say I'm traveling for tourism",
    "context": {
      "whenToUse": "When explaining purpose of travel at airport/visa",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "مسافر سياحة",
          "tashkeelText": "مُسَافِر سِيَاحَة",
          "transliteration": "musafir siyaha"
        },
        "female": {
          "text": "مسافرة سياحة",
          "tashkeelText": "مُسَافْرَة سِيَاحَة",
          "transliteration": "musafra siyaha"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "مسافر سياحة",
          "tashkeelText": "مُسَافِر سِيَاحَة",
          "transliteration": "musafir siyaha"
        },
        "female": {
          "text": "مسافرة سياحة",
          "tashkeelText": "مُسَافْرَة سِيَاحَة",
          "transliteration": "musafra siyaha"
        },
        "neutral": null
      }
    },
    "followUp": {
      "englishTranslation": "Arrive safely",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": {
            "text": "توصل بالسلامة",
            "tashkeelText": "تُوصَل بِالسَّلَامَة",
            "transliteration": "toosal bis-salama"
          },
          "female": {
            "text": "توصلي بالسلامة",
            "tashkeelText": "تُوصَلِي بِالسَّلَامَة",
            "transliteration": "toosali bis-salama"
          },
          "neutral": null
        },
        "saudi": {
          "male": {
            "text": "توصل بالسلامة",
            "tashkeelText": "تُوصَل بِالسَّلَامَة",
            "transliteration": "toosal bis-salama"
          },
          "female": {
            "text": "توصلي بالسلامة",
            "tashkeelText": "تُوصَلِي بِالسَّلَامَة",
            "transliteration": "toosali bis-salama"
          },
          "neutral": null
        }
      }
    },
    "hasGenderVariation": true,
    "tags": [
      "statement",
      "travel",
      "identity",
      "logistics"
    ],
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____",
          "displaySentenceTashkeel": "مُسَافِر _____",
          "displaySentenceTransliteration": "musafir _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____",
          "displaySentenceTashkeel": "مُسَافْرَة _____",
          "displaySentenceTransliteration": "musafra _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____",
          "displaySentenceTashkeel": "مُسَافِر _____",
          "displaySentenceTransliteration": "musafir _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____",
          "displaySentenceTashkeel": "مُسَافْرَة _____",
          "displaySentenceTransliteration": "musafra _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "Do I need a visa?",
    "intent": "Ask if I need a visa",
    "context": {
      "whenToUse": "When checking visa requirements before travel",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "محتاج تأشيرة؟",
          "tashkeelText": "مُحْتَاج تَأْشِيرَة؟",
          "transliteration": "muhtag ta'shira?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "هل احتاج تأشيرة؟",
          "tashkeelText": "هَل أحْتَاج تَأْشِيرَة؟",
          "transliteration": "hal ahtaj ta'shira?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Yes, you need one",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوة، لازم",
            "tashkeelText": "أَيْوَة، لَازِم",
            "transliteration": "aywa, lazim"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوه، لازم",
            "tashkeelText": "أَيْوَه، لَازِم",
            "transliteration": "aywa, lazim"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": [
      "question",
      "travel",
      "logistics",
      "request"
    ],
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "محتاج _____؟",
          "displaySentenceTashkeel": "مُحْتَاج _____؟",
          "displaySentenceTransliteration": "muhtag _____?",
          "blankWords": [
            {
              "word": "تأشيرة",
              "tashkeelWord": "تَأْشِيرَة",
              "transliteration": "ta'shira",
              "isCorrect": true
            },
            {
              "word": "فلوس",
              "tashkeelWord": "فُلُوس",
              "transliteration": "fulus",
              "isCorrect": false
            },
            {
              "word": "جواز",
              "tashkeelWord": "جَوَاز",
              "transliteration": "gawaz",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "هل احتاج _____؟",
          "displaySentenceTashkeel": "هَل أحْتَاج _____؟",
          "displaySentenceTransliteration": "hal ahtaj _____?",
          "blankWords": [
            {
              "word": "تأشيرة",
              "tashkeelWord": "تَأْشِيرَة",
              "transliteration": "ta'shira",
              "isCorrect": true
            },
            {
              "word": "فلوس",
              "tashkeelWord": "فُلُوس",
              "transliteration": "fulus",
              "isCorrect": false
            },
            {
              "word": "جواز",
              "tashkeelWord": "جَوَاز",
              "transliteration": "gawaz",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "How long does the visa take?",
    "intent": "Ask how long the visa takes",
    "context": {
      "whenToUse": "When inquiring about visa processing time",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التأشيرة تاخد قد ايه؟",
          "tashkeelText": "التَّأْشِيرَة تَاخُد قَدْ إِيه؟",
          "transliteration": "it-ta'shira takhud add eh?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التأشيرة تاخذ كم يوم؟",
          "tashkeelText": "التَّأْشِيرَة تَاخُذ كَم يَوْم؟",
          "transliteration": "it-ta'shira takhudh kam yom?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "About a week",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "حوالي أسبوع",
            "tashkeelText": "حَوَالِي أُسْبُوع",
            "transliteration": "hawali usbu'"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "تقريباً أسبوع",
            "tashkeelText": "تَقْرِيبَاً أُسْبُوع",
            "transliteration": "taqriban usbu'"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": [
      "question",
      "travel",
      "time",
      "logistics"
    ],
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "التأشيرة تاخد _____ ايه؟",
          "displaySentenceTashkeel": "التَّأْشِيرَة تَاخُد _____ إِيه؟",
          "displaySentenceTransliteration": "it-ta'shira takhud _____ eh?",
          "blankWords": [
            {
              "word": "قد",
              "tashkeelWord": "قَدْ",
              "transliteration": "add",
              "isCorrect": true
            },
            {
              "word": "ليه",
              "tashkeelWord": "لِيه",
              "transliteration": "leih",
              "isCorrect": false
            },
            {
              "word": "فين",
              "tashkeelWord": "فِين",
              "transliteration": "fein",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "التأشيرة تاخذ _____ يوم؟",
          "displaySentenceTashkeel": "التَّأْشِيرَة تَاخُذ _____ يَوْم؟",
          "displaySentenceTransliteration": "it-ta'shira takhudh _____ yom?",
          "blankWords": [
            {
              "word": "كم",
              "tashkeelWord": "كَم",
              "transliteration": "kam",
              "isCorrect": true
            },
            {
              "word": "وين",
              "tashkeelWord": "وَيْن",
              "transliteration": "wein",
              "isCorrect": false
            },
            {
              "word": "متى",
              "tashkeelWord": "مَتَى",
              "transliteration": "mata",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "Can I get visa on arrival?",
    "intent": "Ask if it's visa on arrival",
    "context": {
      "whenToUse": "When checking if you can get visa at airport",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "اقدر اخد التأشيرة من المطار؟",
          "tashkeelText": "أقْدَر آخُد التَّأْشِيرَة مِن المَطَار؟",
          "transliteration": "a'dar akhud it-ta'shira min il-matar?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "يعطوني التأشيرة من المطار؟",
          "tashkeelText": "يِعْطُونِي التَّأْشِيرَة مِن المَطَار؟",
          "transliteration": "yi'tooni it-ta'shira min il-matar?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Yes, you can get it there",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوة، تقدر تاخدها هناك",
            "tashkeelText": "أَيْوَة، تِقْدَر تَاخُدْهَا هِنَاك",
            "transliteration": "aywa, ti'dar takhudhha hinak"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوه، تقدر تاخذها هناك",
            "tashkeelText": "أَيْوَه، تِقْدَر تَاخُذْهَا هِنَاك",
            "transliteration": "aywa, ti'dar takhudhha hinak"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": [
      "question",
      "travel",
      "logistics",
      "location"
    ],
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "اقدر اخد التأشيرة من _____؟",
          "displaySentenceTashkeel": "أقْدَر آخُد التَّأْشِيرَة مِن _____؟",
          "displaySentenceTransliteration": "a'dar akhud it-ta'shira min _____?",
          "blankWords": [
            {
              "word": "المطار",
              "tashkeelWord": "المَطَار",
              "transliteration": "il-matar",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "البنك",
              "tashkeelWord": "البَنْك",
              "transliteration": "il-bank",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "يعطوني التأشيرة من _____؟",
          "displaySentenceTashkeel": "يِعْطُونِي التَّأْشِيرَة مِن _____؟",
          "displaySentenceTransliteration": "yi'tooni it-ta'shira min _____?",
          "blankWords": [
            {
              "word": "المطار",
              "tashkeelWord": "المَطَار",
              "transliteration": "il-matar",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "البنك",
              "tashkeelWord": "البَنْك",
              "transliteration": "il-bank",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "How much weight is allowed?",
    "intent": "Ask how much weight is allowed",
    "context": {
      "whenToUse": "When checking baggage weight limit",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "كام الوزن المسموح؟",
          "tashkeelText": "كَام الوَزْن المَسْمُوح؟",
          "transliteration": "kam il-wazn il-masmuh?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "كم الوزن المسموح؟",
          "tashkeelText": "كَم الوَزْن المَسْمُوح؟",
          "transliteration": "kam il-wazn il-masmuh?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Twenty-three kilos",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ثلاثة وعشرين كيلو",
            "tashkeelText": "ثَلَاثَة وَعِشْرِين كِيلُو",
            "transliteration": "talata wi-'ishreen kilo"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ثلاثة وعشرين كيلو",
            "tashkeelText": "ثَلَاثَة وَعِشْرِين كِيلُو",
            "transliteration": "thalatha wi-'ishreen kilo"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": [
      "question",
      "travel",
      "logistics",
      "request"
    ],
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "كام _____ المسموح؟",
          "displaySentenceTashkeel": "كَام _____ المَسْمُوح؟",
          "displaySentenceTransliteration": "kam _____ il-masmuh?",
          "blankWords": [
            {
              "word": "الوزن",
              "tashkeelWord": "الوَزْن",
              "transliteration": "il-wazn",
              "isCorrect": true
            },
            {
              "word": "السعر",
              "tashkeelWord": "السِّعْر",
              "transliteration": "is-se'r",
              "isCorrect": false
            },
            {
              "word": "الوقت",
              "tashkeelWord": "الوَقْت",
              "transliteration": "il-wa't",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "كم _____ المسموح؟",
          "displaySentenceTashkeel": "كَم _____ المَسْمُوح؟",
          "displaySentenceTransliteration": "kam _____ il-masmuh?",
          "blankWords": [
            {
              "word": "الوزن",
              "tashkeelWord": "الوَزْن",
              "transliteration": "il-wazn",
              "isCorrect": true
            },
            {
              "word": "السعر",
              "tashkeelWord": "السِّعْر",
              "transliteration": "is-se'r",
              "isCorrect": false
            },
            {
              "word": "الوقت",
              "tashkeelWord": "الوَقْت",
              "transliteration": "il-wa't",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "Do I need to weigh my bag?",
    "intent": "Ask if I need to weigh my bag",
    "context": {
      "whenToUse": "When unsure about baggage weight check requirement",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "لازم اوزن الشنطة؟",
          "tashkeelText": "لَازِم أوَزِّن الشَّنْطَة؟",
          "transliteration": "lazim awazzin il-shanta?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "لازم اوزن الشنطة؟",
          "tashkeelText": "لَازِم أوَزِّن الشَّنْطَة؟",
          "transliteration": "lazim awazzin il-shanta?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Yes, at the desk",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوة، عند الشباك",
            "tashkeelText": "أَيْوَة، عِنْد الشُّبَّاك",
            "transliteration": "aywa, 'ind il-shubbak"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوه، عند المكتب",
            "tashkeelText": "أَيْوَه، عِنْد المَكْتَب",
            "transliteration": "aywa, 'ind il-maktab"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": [
      "question",
      "travel",
      "logistics",
      "request"
    ],
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "لازم _____ الشنطة؟",
          "displaySentenceTashkeel": "لَازِم _____ الشَّنْطَة؟",
          "displaySentenceTransliteration": "lazim _____ il-shanta?",
          "blankWords": [
            {
              "word": "اوزن",
              "tashkeelWord": "أوَزِّن",
              "transliteration": "awazzin",
              "isCorrect": true
            },
            {
              "word": "اشتري",
              "tashkeelWord": "أشْتَري",
              "transliteration": "ashtari",
              "isCorrect": false
            },
            {
              "word": "افتح",
              "tashkeelWord": "أفْتَح",
              "transliteration": "aftah",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "لازم _____ الشنطة؟",
          "displaySentenceTashkeel": "لَازِم _____ الشَّنْطَة؟",
          "displaySentenceTransliteration": "lazim _____ il-shanta?",
          "blankWords": [
            {
              "word": "اوزن",
              "tashkeelWord": "أوَزِّن",
              "transliteration": "awazzin",
              "isCorrect": true
            },
            {
              "word": "اشتري",
              "tashkeelWord": "أشْتَري",
              "transliteration": "ashtari",
              "isCorrect": false
            },
            {
              "word": "افتح",
              "tashkeelWord": "أفْتَح",
              "transliteration": "aftah",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
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
