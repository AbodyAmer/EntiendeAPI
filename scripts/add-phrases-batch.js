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
    "englishTranslation": "I'm from the south",
    "context": {
      "whenToUse": "Describing your geographic origin.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أنا من الجنوب",
          "tashkeelText": "أَنَا مِن الجَنُوب",
          "transliteration": "ana min al-janūb"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أنا من الجنوب",
          "tashkeelText": "أَنَا مِن الجَنُوب",
          "transliteration": "ana min al-janūb"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا من _____",
          "displaySentenceTashkeel": "أَنَا مِن _____",
          "displaySentenceTransliteration": "ana min _____",
          "blankWords": [
            {
              "word": "الجنوب",
              "tashkeelWord": "الجَنُوب",
              "transliteration": "al-janūb",
              "isCorrect": true
            },
            {
              "word": "الشمال",
              "tashkeelWord": "الشَّمَال",
              "transliteration": "ash-shamāl",
              "isCorrect": false
            },
            {
              "word": "الشرق",
              "tashkeelWord": "الشَّرْق",
              "transliteration": "ash-sharq",
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
          "displaySentence": "أنا من _____",
          "displaySentenceTashkeel": "أَنَا مِن _____",
          "displaySentenceTransliteration": "ana min _____",
          "blankWords": [
            {
              "word": "الجنوب",
              "tashkeelWord": "الجَنُوب",
              "transliteration": "al-janūb",
              "isCorrect": true
            },
            {
              "word": "الشمال",
              "tashkeelWord": "الشَّمَال",
              "transliteration": "ash-shamāl",
              "isCorrect": false
            },
            {
              "word": "الغرب",
              "tashkeelWord": "الغَرْب",
              "transliteration": "al-gharb",
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
    "tags": ["location", "origin", "cardinal-directions"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "The north is very cold",
    "context": {
      "whenToUse": "Describing regional climate characteristics.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "الشمال بارد قوي",
          "tashkeelText": "الشَّمَال بَارِد قَوِي",
          "transliteration": "ash-shamāl bārid awi"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "الشمال بارد مرة",
          "tashkeelText": "الشَّمَال بَارِد مَرَّة",
          "transliteration": "ash-shamāl bārid marra"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ بارد قوي",
          "displaySentenceTashkeel": "_____ بَارِد قَوِي",
          "displaySentenceTransliteration": "_____ bārid awi",
          "blankWords": [
            {
              "word": "الشمال",
              "tashkeelWord": "الشَّمَال",
              "transliteration": "ash-shamāl",
              "isCorrect": true
            },
            {
              "word": "الجنوب",
              "tashkeelWord": "الجَنُوب",
              "transliteration": "al-janūb",
              "isCorrect": false
            },
            {
              "word": "الشرق",
              "tashkeelWord": "الشَّرْق",
              "transliteration": "ash-sharq",
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
          "displaySentence": "_____ بارد مرة",
          "displaySentenceTashkeel": "_____ بَارِد مَرَّة",
          "displaySentenceTransliteration": "_____ bārid marra",
          "blankWords": [
            {
              "word": "الشمال",
              "tashkeelWord": "الشَّمَال",
              "transliteration": "ash-shamāl",
              "isCorrect": true
            },
            {
              "word": "الجنوب",
              "tashkeelWord": "الجَنُوب",
              "transliteration": "al-janūb",
              "isCorrect": false
            },
            {
              "word": "الغرب",
              "tashkeelWord": "الغَرْب",
              "transliteration": "al-gharb",
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
    "tags": ["weather", "description", "cardinal-directions"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I live in the west",
    "context": {
      "whenToUse": "Stating where you currently reside.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "أنا عايش في الغرب",
          "tashkeelText": "أَنَا عَايِش فِي الغَرْب",
          "transliteration": "ana 3āyish fil-gharb"
        },
        "female": {
          "text": "أنا عايشة في الغرب",
          "tashkeelText": "أَنَا عَايْشَة فِي الغَرْب",
          "transliteration": "ana 3āysha fil-gharb"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "أنا ساكن في الغرب",
          "tashkeelText": "أَنَا سَاكِن فِي الغَرْب",
          "transliteration": "ana sākin fil-gharb"
        },
        "female": {
          "text": "أنا ساكنة في الغرب",
          "tashkeelText": "أَنَا سَاكِنَة فِي الغَرْب",
          "transliteration": "ana sākna fil-gharb"
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
          "displaySentence": "أنا عايش في _____",
          "displaySentenceTashkeel": "أَنَا عَايِش فِي _____",
          "displaySentenceTransliteration": "ana 3āyish fi _____",
          "blankWords": [
            {
              "word": "الغرب",
              "tashkeelWord": "الغَرْب",
              "transliteration": "al-gharb",
              "isCorrect": true
            },
            {
              "word": "الشرق",
              "tashkeelWord": "الشَّرْق",
              "transliteration": "ash-sharq",
              "isCorrect": false
            },
            {
              "word": "الشمال",
              "tashkeelWord": "الشَّمَال",
              "transliteration": "ash-shamāl",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "أنا عايشة في _____",
          "displaySentenceTashkeel": "أَنَا عَايْشَة فِي _____",
          "displaySentenceTransliteration": "ana 3āysha fi _____",
          "blankWords": [
            {
              "word": "الغرب",
              "tashkeelWord": "الغَرْب",
              "transliteration": "al-gharb",
              "isCorrect": true
            },
            {
              "word": "الشرق",
              "tashkeelWord": "الشَّرْق",
              "transliteration": "ash-sharq",
              "isCorrect": false
            },
            {
              "word": "الجنوب",
              "tashkeelWord": "الجَنُوب",
              "transliteration": "al-janūb",
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
          "displaySentence": "أنا ساكن في _____",
          "displaySentenceTashkeel": "أَنَا سَاكِن فِي _____",
          "displaySentenceTransliteration": "ana sākin fi _____",
          "blankWords": [
            {
              "word": "الغرب",
              "tashkeelWord": "الغَرْب",
              "transliteration": "al-gharb",
              "isCorrect": true
            },
            {
              "word": "الشرق",
              "tashkeelWord": "الشَّرْق",
              "transliteration": "ash-sharq",
              "isCorrect": false
            },
            {
              "word": "الشمال",
              "tashkeelWord": "الشَّمَال",
              "transliteration": "ash-shamāl",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "أنا ساكنة في _____",
          "displaySentenceTashkeel": "أَنَا سَاكِنَة فِي _____",
          "displaySentenceTransliteration": "ana sākna fi _____",
          "blankWords": [
            {
              "word": "الغرب",
              "tashkeelWord": "الغَرْب",
              "transliteration": "al-gharb",
              "isCorrect": true
            },
            {
              "word": "الشرق",
              "tashkeelWord": "الشَّرْق",
              "transliteration": "ash-sharq",
              "isCorrect": false
            },
            {
              "word": "الجنوب",
              "tashkeelWord": "الجَنُوب",
              "transliteration": "al-janūb",
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
    "tags": ["residence", "location", "cardinal-directions"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "The school is east of the city",
    "context": {
      "whenToUse": "Describing a location using cardinal directions.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "المدرسة في شرق المدينة",
          "tashkeelText": "المَدْرَسَة فِي شَرْق المَدِينَة",
          "transliteration": "al-madrasa fi sharq al-madīna"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "المدرسة في شرق المدينة",
          "tashkeelText": "المَدْرَسَة فِي شَرْق المَدِينَة",
          "transliteration": "al-madrasa fi sharq al-madīna"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "المدرسة في _____ المدينة",
          "displaySentenceTashkeel": "المَدْرَسَة فِي _____ المَدِينَة",
          "displaySentenceTransliteration": "al-madrasa fi _____ al-madīna",
          "blankWords": [
            {
              "word": "شرق",
              "tashkeelWord": "شَرْق",
              "transliteration": "sharq",
              "isCorrect": true
            },
            {
              "word": "غرب",
              "tashkeelWord": "غَرْب",
              "transliteration": "gharb",
              "isCorrect": false
            },
            {
              "word": "جنوب",
              "tashkeelWord": "جَنُوب",
              "transliteration": "janūb",
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
          "displaySentence": "المدرسة في _____ المدينة",
          "displaySentenceTashkeel": "المَدْرَسَة فِي _____ المَدِينَة",
          "displaySentenceTransliteration": "al-madrasa fi _____ al-madīna",
          "blankWords": [
            {
              "word": "شرق",
              "tashkeelWord": "شَرْق",
              "transliteration": "sharq",
              "isCorrect": true
            },
            {
              "word": "غرب",
              "tashkeelWord": "غَرْب",
              "transliteration": "gharb",
              "isCorrect": false
            },
            {
              "word": "شمال",
              "tashkeelWord": "شَمَال",
              "transliteration": "shamāl",
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
    "tags": ["location", "directions", "cardinal-directions"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "It's on the corner",
    "context": {
      "whenToUse": "Indicating a corner location.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "على الناصية",
          "tashkeelText": "عَلَى النَّاصِيَة",
          "transliteration": "3ala an-nāṣya"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "على الزاوية",
          "tashkeelText": "عَلَى الزَّاوِيَة",
          "transliteration": "3ala az-zāwya"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "على _____",
          "displaySentenceTashkeel": "عَلَى _____",
          "displaySentenceTransliteration": "3ala _____",
          "blankWords": [
            {
              "word": "الناصية",
              "tashkeelWord": "النَّاصِيَة",
              "transliteration": "an-nāṣya",
              "isCorrect": true
            },
            {
              "word": "الشارع",
              "tashkeelWord": "الشَّارِع",
              "transliteration": "ash-shāri3",
              "isCorrect": false
            },
            {
              "word": "الميدان",
              "tashkeelWord": "المَيْدَان",
              "transliteration": "al-maydān",
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
          "displaySentence": "على _____",
          "displaySentenceTashkeel": "عَلَى _____",
          "displaySentenceTransliteration": "3ala _____",
          "blankWords": [
            {
              "word": "الزاوية",
              "tashkeelWord": "الزَّاوِيَة",
              "transliteration": "az-zāwya",
              "isCorrect": true
            },
            {
              "word": "الشارع",
              "tashkeelWord": "الشَّارِع",
              "transliteration": "ash-shāri3",
              "isCorrect": false
            },
            {
              "word": "الدوار",
              "tashkeelWord": "الدَّوَّار",
              "transliteration": "ad-dawwār",
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
    "tags": ["location", "directions", "street"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "It's inside the building",
    "context": {
      "whenToUse": "Describing interior location.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "جوا العمارة",
          "tashkeelText": "جُوَّا العِمَارَة",
          "transliteration": "guwwa al-3imāra"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "داخل المبنى",
          "tashkeelText": "دَاخِل المَبْنَى",
          "transliteration": "dākhil al-mabna"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ العمارة",
          "displaySentenceTashkeel": "_____ العِمَارَة",
          "displaySentenceTransliteration": "_____ al-3imāra",
          "blankWords": [
            {
              "word": "جوا",
              "tashkeelWord": "جُوَّا",
              "transliteration": "guwwa",
              "isCorrect": true
            },
            {
              "word": "برة",
              "tashkeelWord": "بَرَّة",
              "transliteration": "barra",
              "isCorrect": false
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "uddām",
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
          "displaySentence": "_____ المبنى",
          "displaySentenceTashkeel": "_____ المَبْنَى",
          "displaySentenceTransliteration": "_____ al-mabna",
          "blankWords": [
            {
              "word": "داخل",
              "tashkeelWord": "دَاخِل",
              "transliteration": "dākhil",
              "isCorrect": true
            },
            {
              "word": "برا",
              "tashkeelWord": "بَرَّا",
              "transliteration": "barra",
              "isCorrect": false
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "guddām",
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
    "tags": ["location", "directions", "position"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "It's outside the mall",
    "context": {
      "whenToUse": "Describing exterior location.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "برة المول",
          "tashkeelText": "بَرَّة المُول",
          "transliteration": "barra al-mōl"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "برا المول",
          "tashkeelText": "بَرَّا المُول",
          "transliteration": "barra al-mōl"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ المول",
          "displaySentenceTashkeel": "_____ المُول",
          "displaySentenceTransliteration": "_____ al-mōl",
          "blankWords": [
            {
              "word": "برة",
              "tashkeelWord": "بَرَّة",
              "transliteration": "barra",
              "isCorrect": true
            },
            {
              "word": "جوا",
              "tashkeelWord": "جُوَّا",
              "transliteration": "guwwa",
              "isCorrect": false
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "uddām",
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
          "displaySentence": "_____ المول",
          "displaySentenceTashkeel": "_____ المُول",
          "displaySentenceTransliteration": "_____ al-mōl",
          "blankWords": [
            {
              "word": "برا",
              "tashkeelWord": "بَرَّا",
              "transliteration": "barra",
              "isCorrect": true
            },
            {
              "word": "داخل",
              "tashkeelWord": "دَاخِل",
              "transliteration": "dākhil",
              "isCorrect": false
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "guddām",
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
    "tags": ["location", "directions", "position"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "It's across from the mosque",
    "context": {
      "whenToUse": "Indicating opposite side location.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "قدام الجامع",
          "tashkeelText": "قُدَّام الجَامِع",
          "transliteration": "uddām al-jāmi3"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "قدام المسجد",
          "tashkeelText": "قُدَّام المَسْجِد",
          "transliteration": "guddām al-masjid"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ الجامع",
          "displaySentenceTashkeel": "_____ الجَامِع",
          "displaySentenceTransliteration": "_____ al-jāmi3",
          "blankWords": [
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "uddām",
              "isCorrect": true
            },
            {
              "word": "جنب",
              "tashkeelWord": "جَنْب",
              "transliteration": "ganb",
              "isCorrect": false
            },
            {
              "word": "ورا",
              "tashkeelWord": "وَرَا",
              "transliteration": "wara",
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
          "displaySentence": "_____ المسجد",
          "displaySentenceTashkeel": "_____ المَسْجِد",
          "displaySentenceTransliteration": "_____ al-masjid",
          "blankWords": [
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "guddām",
              "isCorrect": true
            },
            {
              "word": "جنب",
              "tashkeelWord": "جَنْب",
              "transliteration": "janb",
              "isCorrect": false
            },
            {
              "word": "ورا",
              "tashkeelWord": "وَرَا",
              "transliteration": "wara",
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
    "tags": ["location", "directions", "landmarks"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "It's between the pharmacy and the café",
    "context": {
      "whenToUse": "Describing location between two places.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "بين الصيدلية والقهوة",
          "tashkeelText": "بَيْن الصَّيْدَلِيَّة وَالقَهْوَة",
          "transliteration": "bēn aṣ-ṣaydaliyya wal-ahwa"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "بين الصيدلية والمقهى",
          "tashkeelText": "بَيْن الصَّيْدَلِيَّة وَالمَقْهَى",
          "transliteration": "bēn aṣ-ṣaydaliyya wal-maqha"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ الصيدلية والقهوة",
          "displaySentenceTashkeel": "_____ الصَّيْدَلِيَّة وَالقَهْوَة",
          "displaySentenceTransliteration": "_____ aṣ-ṣaydaliyya wal-ahwa",
          "blankWords": [
            {
              "word": "بين",
              "tashkeelWord": "بَيْن",
              "transliteration": "bēn",
              "isCorrect": true
            },
            {
              "word": "جنب",
              "tashkeelWord": "جَنْب",
              "transliteration": "ganb",
              "isCorrect": false
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "uddām",
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
          "displaySentence": "_____ الصيدلية والمقهى",
          "displaySentenceTashkeel": "_____ الصَّيْدَلِيَّة وَالمَقْهَى",
          "displaySentenceTransliteration": "_____ aṣ-ṣaydaliyya wal-maqha",
          "blankWords": [
            {
              "word": "بين",
              "tashkeelWord": "بَيْن",
              "transliteration": "bēn",
              "isCorrect": true
            },
            {
              "word": "جنب",
              "tashkeelWord": "جَنْب",
              "transliteration": "janb",
              "isCorrect": false
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "guddām",
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
    "tags": ["location", "directions", "landmarks"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "It's around the corner",
    "context": {
      "whenToUse": "Indicating nearby location just past a corner.",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "وراء الناصية",
          "tashkeelText": "وَرَاء النَّاصِيَة",
          "transliteration": "warā an-nāṣya"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "وراء الزاوية",
          "tashkeelText": "وَرَاء الزَّاوِيَة",
          "transliteration": "warā az-zāwya"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ الناصية",
          "displaySentenceTashkeel": "_____ النَّاصِيَة",
          "displaySentenceTransliteration": "_____ an-nāṣya",
          "blankWords": [
            {
              "word": "وراء",
              "tashkeelWord": "وَرَاء",
              "transliteration": "warā",
              "isCorrect": true
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "uddām",
              "isCorrect": false
            },
            {
              "word": "جنب",
              "tashkeelWord": "جَنْب",
              "transliteration": "ganb",
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
          "displaySentence": "_____ الزاوية",
          "displaySentenceTashkeel": "_____ الزَّاوِيَة",
          "displaySentenceTransliteration": "_____ az-zāwya",
          "blankWords": [
            {
              "word": "وراء",
              "tashkeelWord": "وَرَاء",
              "transliteration": "warā",
              "isCorrect": true
            },
            {
              "word": "قدام",
              "tashkeelWord": "قُدَّام",
              "transliteration": "guddām",
              "isCorrect": false
            },
            {
              "word": "جنب",
              "tashkeelWord": "جَنْب",
              "transliteration": "janb",
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
    "tags": ["location", "directions", "proximity"],
    "isActive": true,
    "isApproved": true
  }
]

    const categoryName = 'ESSENTIAL'; // Change this
    const situationName = 'directions'; // Change this

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
