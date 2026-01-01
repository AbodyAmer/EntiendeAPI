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
                    hasGenderVariation: phraseData.hasGenderVariation || false,
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
    "englishTranslation": "I have two brothers",
    "category": "about-me",
    "situation": "family",
    "context": {
      "whenToUse": "Talking about your siblings",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Tengo dos hermanos",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Tengo dos hermanos",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Tengo dos hermanos",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Tengo dos hermanos",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Tengo dos hermanos",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Tengo dos _____",
          "blankWords": [
            { "word": "hermanos", "isCorrect": true },
            { "word": "hermanas", "isCorrect": false },
            { "word": "hijos", "isCorrect": false },
            { "word": "primos", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Tengo dos _____",
          "blankWords": [
            { "word": "hermanos", "isCorrect": true },
            { "word": "hermanas", "isCorrect": false },
            { "word": "hijos", "isCorrect": false },
            { "word": "primos", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Tengo dos _____",
          "blankWords": [
            { "word": "hermanos", "isCorrect": true },
            { "word": "hermanas", "isCorrect": false },
            { "word": "hijos", "isCorrect": false },
            { "word": "primos", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Tengo dos _____",
          "blankWords": [
            { "word": "hermanos", "isCorrect": true },
            { "word": "hermanas", "isCorrect": false },
            { "word": "hijos", "isCorrect": false },
            { "word": "primos", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Tengo dos _____",
          "blankWords": [
            { "word": "hermanos", "isCorrect": true },
            { "word": "hermanas", "isCorrect": false },
            { "word": "hijos", "isCorrect": false },
            { "word": "primos", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm the only child",
    "category": "about-me",
    "situation": "family",
    "context": {
      "whenToUse": "Telling someone you have no siblings",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": {
          "text": "Soy hijo único",
          "hasAudio": false
        },
        "female": {
          "text": "Soy hija única",
          "hasAudio": false
        },
        "neutral": null
      },
      "mexico": {
        "male": {
          "text": "Soy hijo único",
          "hasAudio": false
        },
        "female": {
          "text": "Soy hija única",
          "hasAudio": false
        },
        "neutral": null
      },
      "argentina": {
        "male": {
          "text": "Soy hijo único",
          "hasAudio": false
        },
        "female": {
          "text": "Soy hija única",
          "hasAudio": false
        },
        "neutral": null
      },
      "puerto_rico": {
        "male": {
          "text": "Soy hijo único",
          "hasAudio": false
        },
        "female": {
          "text": "Soy hija única",
          "hasAudio": false
        },
        "neutral": null
      },
      "colombia": {
        "male": {
          "text": "Soy hijo único",
          "hasAudio": false
        },
        "female": {
          "text": "Soy hija única",
          "hasAudio": false
        },
        "neutral": null
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hijo único", "isCorrect": true },
            { "word": "hija única", "isCorrect": false },
            { "word": "hijo mayor", "isCorrect": false },
            { "word": "hermano", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hija única", "isCorrect": true },
            { "word": "hijo único", "isCorrect": false },
            { "word": "hija mayor", "isCorrect": false },
            { "word": "hermana", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hijo único", "isCorrect": true },
            { "word": "hija única", "isCorrect": false },
            { "word": "hijo mayor", "isCorrect": false },
            { "word": "hermano", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hija única", "isCorrect": true },
            { "word": "hijo único", "isCorrect": false },
            { "word": "hija mayor", "isCorrect": false },
            { "word": "hermana", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hijo único", "isCorrect": true },
            { "word": "hija única", "isCorrect": false },
            { "word": "hijo mayor", "isCorrect": false },
            { "word": "hermano", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hija única", "isCorrect": true },
            { "word": "hijo único", "isCorrect": false },
            { "word": "hija mayor", "isCorrect": false },
            { "word": "hermana", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hijo único", "isCorrect": true },
            { "word": "hija única", "isCorrect": false },
            { "word": "hijo mayor", "isCorrect": false },
            { "word": "hermano", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hija única", "isCorrect": true },
            { "word": "hijo único", "isCorrect": false },
            { "word": "hija mayor", "isCorrect": false },
            { "word": "hermana", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hijo único", "isCorrect": true },
            { "word": "hija única", "isCorrect": false },
            { "word": "hijo mayor", "isCorrect": false },
            { "word": "hermano", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Soy _____",
          "blankWords": [
            { "word": "hija única", "isCorrect": true },
            { "word": "hijo único", "isCorrect": false },
            { "word": "hija mayor", "isCorrect": false },
            { "word": "hermana", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm married",
    "category": "about-me",
    "situation": "family",
    "context": {
      "whenToUse": "Telling someone your marital status",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": {
          "text": "Estoy casado",
          "hasAudio": false
        },
        "female": {
          "text": "Estoy casada",
          "hasAudio": false
        },
        "neutral": null
      },
      "mexico": {
        "male": {
          "text": "Estoy casado",
          "hasAudio": false
        },
        "female": {
          "text": "Estoy casada",
          "hasAudio": false
        },
        "neutral": null
      },
      "argentina": {
        "male": {
          "text": "Estoy casado",
          "hasAudio": false
        },
        "female": {
          "text": "Estoy casada",
          "hasAudio": false
        },
        "neutral": null
      },
      "puerto_rico": {
        "male": {
          "text": "Estoy casado",
          "hasAudio": false
        },
        "female": {
          "text": "Estoy casada",
          "hasAudio": false
        },
        "neutral": null
      },
      "colombia": {
        "male": {
          "text": "Estoy casado",
          "hasAudio": false
        },
        "female": {
          "text": "Estoy casada",
          "hasAudio": false
        },
        "neutral": null
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casado", "isCorrect": true },
            { "word": "casada", "isCorrect": false },
            { "word": "soltero", "isCorrect": false },
            { "word": "divorciado", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casada", "isCorrect": true },
            { "word": "casado", "isCorrect": false },
            { "word": "soltera", "isCorrect": false },
            { "word": "divorciada", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casado", "isCorrect": true },
            { "word": "casada", "isCorrect": false },
            { "word": "soltero", "isCorrect": false },
            { "word": "divorciado", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casada", "isCorrect": true },
            { "word": "casado", "isCorrect": false },
            { "word": "soltera", "isCorrect": false },
            { "word": "divorciada", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casado", "isCorrect": true },
            { "word": "casada", "isCorrect": false },
            { "word": "soltero", "isCorrect": false },
            { "word": "divorciado", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casada", "isCorrect": true },
            { "word": "casado", "isCorrect": false },
            { "word": "soltera", "isCorrect": false },
            { "word": "divorciada", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casado", "isCorrect": true },
            { "word": "casada", "isCorrect": false },
            { "word": "soltero", "isCorrect": false },
            { "word": "divorciado", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casada", "isCorrect": true },
            { "word": "casado", "isCorrect": false },
            { "word": "soltera", "isCorrect": false },
            { "word": "divorciada", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casado", "isCorrect": true },
            { "word": "casada", "isCorrect": false },
            { "word": "soltero", "isCorrect": false },
            { "word": "divorciado", "isCorrect": false }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "displaySentence": "Estoy _____",
          "blankWords": [
            { "word": "casada", "isCorrect": true },
            { "word": "casado", "isCorrect": false },
            { "word": "soltera", "isCorrect": false },
            { "word": "divorciada", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "My parents live in Madrid",
    "category": "about-me",
    "situation": "family",
    "context": {
      "whenToUse": "Talking about where your family lives",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Mis padres viven en Madrid",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Mis papás viven en Madrid",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Mis viejos viven en Madrid",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Mis papás viven en Madrid",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Mis papás viven en Madrid",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Mis _____ viven en Madrid",
          "blankWords": [
            { "word": "padres", "isCorrect": true },
            { "word": "hermanos", "isCorrect": false },
            { "word": "abuelos", "isCorrect": false },
            { "word": "tíos", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Mis _____ viven en Madrid",
          "blankWords": [
            { "word": "papás", "isCorrect": true },
            { "word": "hermanos", "isCorrect": false },
            { "word": "abuelos", "isCorrect": false },
            { "word": "tíos", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Mis _____ viven en Madrid",
          "blankWords": [
            { "word": "viejos", "isCorrect": true },
            { "word": "hermanos", "isCorrect": false },
            { "word": "abuelos", "isCorrect": false },
            { "word": "tíos", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Mis _____ viven en Madrid",
          "blankWords": [
            { "word": "papás", "isCorrect": true },
            { "word": "hermanos", "isCorrect": false },
            { "word": "abuelos", "isCorrect": false },
            { "word": "tíos", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Mis _____ viven en Madrid",
          "blankWords": [
            { "word": "papás", "isCorrect": true },
            { "word": "hermanos", "isCorrect": false },
            { "word": "abuelos", "isCorrect": false },
            { "word": "tíos", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I get along well with my sister",
    "category": "about-me",
    "situation": "family",
    "context": {
      "whenToUse": "Describing your relationship with family",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me llevo bien con mi hermana",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me llevo bien con mi hermana",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me llevo bien con mi hermana",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me llevo bien con mi hermana",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me llevo bien con mi hermana",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me _____ con mi hermana",
          "blankWords": [
            { "word": "llevo bien", "isCorrect": true },
            { "word": "llevo mal", "isCorrect": false },
            { "word": "peleo", "isCorrect": false },
            { "word": "hablo", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me _____ con mi hermana",
          "blankWords": [
            { "word": "llevo bien", "isCorrect": true },
            { "word": "llevo mal", "isCorrect": false },
            { "word": "peleo", "isCorrect": false },
            { "word": "hablo", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me _____ con mi hermana",
          "blankWords": [
            { "word": "llevo bien", "isCorrect": true },
            { "word": "llevo mal", "isCorrect": false },
            { "word": "peleo", "isCorrect": false },
            { "word": "hablo", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me _____ con mi hermana",
          "blankWords": [
            { "word": "llevo bien", "isCorrect": true },
            { "word": "llevo mal", "isCorrect": false },
            { "word": "peleo", "isCorrect": false },
            { "word": "hablo", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me _____ con mi hermana",
          "blankWords": [
            { "word": "llevo bien", "isCorrect": true },
            { "word": "llevo mal", "isCorrect": false },
            { "word": "peleo", "isCorrect": false },
            { "word": "hablo", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I like to play football",
    "category": "about-me",
    "situation": "hobbies",
    "context": {
      "whenToUse": "Talking about your hobbies",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta jugar al fútbol",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta jugar fútbol",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta jugar al fútbol",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta jugar fútbol",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta jugar fútbol",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____ al fútbol",
          "blankWords": [
            { "word": "jugar", "isCorrect": true },
            { "word": "ver", "isCorrect": false },
            { "word": "practicar", "isCorrect": false },
            { "word": "mirar", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____ fútbol",
          "blankWords": [
            { "word": "jugar", "isCorrect": true },
            { "word": "ver", "isCorrect": false },
            { "word": "practicar", "isCorrect": false },
            { "word": "mirar", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____ al fútbol",
          "blankWords": [
            { "word": "jugar", "isCorrect": true },
            { "word": "ver", "isCorrect": false },
            { "word": "practicar", "isCorrect": false },
            { "word": "mirar", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____ fútbol",
          "blankWords": [
            { "word": "jugar", "isCorrect": true },
            { "word": "ver", "isCorrect": false },
            { "word": "practicar", "isCorrect": false },
            { "word": "mirar", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____ fútbol",
          "blankWords": [
            { "word": "jugar", "isCorrect": true },
            { "word": "ver", "isCorrect": false },
            { "word": "practicar", "isCorrect": false },
            { "word": "mirar", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I watch movies on the weekend",
    "category": "about-me",
    "situation": "hobbies",
    "context": {
      "whenToUse": "Describing your weekend routine",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Veo películas el fin de semana",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Veo películas el fin de semana",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Veo películas el finde",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Veo películas el fin de semana",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Veo películas el fin de semana",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Veo _____ el fin de semana",
          "blankWords": [
            { "word": "películas", "isCorrect": true },
            { "word": "series", "isCorrect": false },
            { "word": "deportes", "isCorrect": false },
            { "word": "noticias", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Veo _____ el fin de semana",
          "blankWords": [
            { "word": "películas", "isCorrect": true },
            { "word": "series", "isCorrect": false },
            { "word": "deportes", "isCorrect": false },
            { "word": "noticias", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Veo _____ el finde",
          "blankWords": [
            { "word": "películas", "isCorrect": true },
            { "word": "series", "isCorrect": false },
            { "word": "deportes", "isCorrect": false },
            { "word": "noticias", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Veo _____ el fin de semana",
          "blankWords": [
            { "word": "películas", "isCorrect": true },
            { "word": "series", "isCorrect": false },
            { "word": "deportes", "isCorrect": false },
            { "word": "noticias", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Veo _____ el fin de semana",
          "blankWords": [
            { "word": "películas", "isCorrect": true },
            { "word": "series", "isCorrect": false },
            { "word": "deportes", "isCorrect": false },
            { "word": "noticias", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm learning Spanish",
    "category": "about-me",
    "situation": "hobbies",
    "context": {
      "whenToUse": "Telling someone you're a language learner",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Estoy aprendiendo español",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Estoy aprendiendo español",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Estoy aprendiendo español",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Estoy aprendiendo español",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Estoy aprendiendo español",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Estoy _____ español",
          "blankWords": [
            { "word": "aprendiendo", "isCorrect": true },
            { "word": "hablando", "isCorrect": false },
            { "word": "estudiando", "isCorrect": false },
            { "word": "enseñando", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Estoy _____ español",
          "blankWords": [
            { "word": "aprendiendo", "isCorrect": true },
            { "word": "hablando", "isCorrect": false },
            { "word": "estudiando", "isCorrect": false },
            { "word": "enseñando", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Estoy _____ español",
          "blankWords": [
            { "word": "aprendiendo", "isCorrect": true },
            { "word": "hablando", "isCorrect": false },
            { "word": "estudiando", "isCorrect": false },
            { "word": "enseñando", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Estoy _____ español",
          "blankWords": [
            { "word": "aprendiendo", "isCorrect": true },
            { "word": "hablando", "isCorrect": false },
            { "word": "estudiando", "isCorrect": false },
            { "word": "enseñando", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Estoy _____ español",
          "blankWords": [
            { "word": "aprendiendo", "isCorrect": true },
            { "word": "hablando", "isCorrect": false },
            { "word": "estudiando", "isCorrect": false },
            { "word": "enseñando", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I go to the gym every day",
    "category": "about-me",
    "situation": "hobbies",
    "context": {
      "whenToUse": "Talking about your fitness routine",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Voy al gimnasio todos los días",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Voy al gimnasio todos los días",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Voy al gimnasio todos los días",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Voy al gym todos los días",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Voy al gimnasio todos los días",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Voy al _____ todos los días",
          "blankWords": [
            { "word": "gimnasio", "isCorrect": true },
            { "word": "parque", "isCorrect": false },
            { "word": "trabajo", "isCorrect": false },
            { "word": "cine", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Voy al _____ todos los días",
          "blankWords": [
            { "word": "gimnasio", "isCorrect": true },
            { "word": "parque", "isCorrect": false },
            { "word": "trabajo", "isCorrect": false },
            { "word": "cine", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Voy al _____ todos los días",
          "blankWords": [
            { "word": "gimnasio", "isCorrect": true },
            { "word": "parque", "isCorrect": false },
            { "word": "trabajo", "isCorrect": false },
            { "word": "cine", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Voy al _____ todos los días",
          "blankWords": [
            { "word": "gym", "isCorrect": true },
            { "word": "parque", "isCorrect": false },
            { "word": "trabajo", "isCorrect": false },
            { "word": "cine", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Voy al _____ todos los días",
          "blankWords": [
            { "word": "gimnasio", "isCorrect": true },
            { "word": "parque", "isCorrect": false },
            { "word": "trabajo", "isCorrect": false },
            { "word": "cine", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I like to travel",
    "category": "about-me",
    "situation": "hobbies",
    "context": {
      "whenToUse": "Talking about your interests",
      "formality": "informal"
    },
    "variations": {
      "spain": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta viajar",
          "hasAudio": false
        }
      },
      "mexico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta viajar",
          "hasAudio": false
        }
      },
      "argentina": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta viajar",
          "hasAudio": false
        }
      },
      "puerto_rico": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta viajar",
          "hasAudio": false
        }
      },
      "colombia": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "Me gusta viajar",
          "hasAudio": false
        }
      }
    },
    "exercises": {
      "spain": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____",
          "blankWords": [
            { "word": "viajar", "isCorrect": true },
            { "word": "comer", "isCorrect": false },
            { "word": "dormir", "isCorrect": false },
            { "word": "trabajar", "isCorrect": false }
          ]
        }
      ],
      "mexico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____",
          "blankWords": [
            { "word": "viajar", "isCorrect": true },
            { "word": "comer", "isCorrect": false },
            { "word": "dormir", "isCorrect": false },
            { "word": "trabajar", "isCorrect": false }
          ]
        }
      ],
      "argentina": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____",
          "blankWords": [
            { "word": "viajar", "isCorrect": true },
            { "word": "comer", "isCorrect": false },
            { "word": "dormir", "isCorrect": false },
            { "word": "trabajar", "isCorrect": false }
          ]
        }
      ],
      "puerto_rico": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____",
          "blankWords": [
            { "word": "viajar", "isCorrect": true },
            { "word": "comer", "isCorrect": false },
            { "word": "dormir", "isCorrect": false },
            { "word": "trabajar", "isCorrect": false }
          ]
        }
      ],
      "colombia": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "displaySentence": "Me gusta _____",
          "blankWords": [
            { "word": "viajar", "isCorrect": true },
            { "word": "comer", "isCorrect": false },
            { "word": "dormir", "isCorrect": false },
            { "word": "trabajar", "isCorrect": false }
          ]
        }
      ]
    },
    "isActive": true,
    "isApproved": true
  }
]







    const categoryName = 'ESSENTIAL'; // Change this
    const situationName = 'sobre-ti'; // Change this

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
