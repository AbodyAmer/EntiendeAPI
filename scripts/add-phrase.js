require('dotenv').config();
const mongoose = require('mongoose');
const Phrase = require('../models/Phrase');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

/**
 * Add a new phrase to the database
 *
 * @param {Object} phraseData - The phrase data object
 * @param {string} categoryName - Category name (e.g., "SOCIAL", "ESSENTIAL")
 * @param {string} situationName - Situation name (e.g., "Greetings & Small Talk")
 * @returns {Promise<Object>} - Created phrase document
 */
async function addPhrase(phraseData, categoryName, situationName) {
    try {
        // Find category
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            throw new Error(`Category "${categoryName}" not found. Please create it first.`);
        }

        // Find situation
        console.log({ name: situationName, categoryId: category._id })
        const situation = await Situation.findOne({ name: situationName, categoryId: category._id });
        if (!situation) {
            throw new Error(`Situation "${situationName}" not found in category "${categoryName}". Please create it first.`);
        }
        // Prepare phrase document
        const phraseDocument = {
            englishTranslation: phraseData.englishTranslation,
            category: category._id,
            situation: situation._id,
            intent: phraseData.intent,
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

        console.log('✅ Phrase added successfully!');
        console.log(`   ID: ${phrase._id}`);
        console.log(`   English: "${phrase.englishTranslation}"`);
        console.log(`   Category: ${categoryName}`);
        console.log(`   Situation: ${situationName}`);
        console.log(`   Rank: ${phrase.commonRank}`);

        return phrase;

    } catch (error) {
        console.error('❌ Error adding phrase:', error.message);
        throw error;
    }
}

// Connect to database and run if executed directly
if (require.main === module) {
    const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/efham';

    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('📦 Connected to MongoDB');

            // Example phrase data
            const examplePhrase =   {
    "englishTranslation": "Call me when you arrive",
    "context": {
      "whenToUse": "Planning to meet someone at your place or specific location",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "كلمني لما توصل",
          "tashkeelText": "كَلِّمْني لَمّا تْوَصَّل",
          "transliteration": "kallemni lamma tosal"
        },
        "female": {
          "text": "كلميني لما توصلي",
          "tashkeelText": "كَلِّميني لَمّا تْوَصَّلي",
          "transliteration": "kallemini lamma tosali"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "اتصل علي لما توصل",
          "tashkeelText": "اتَّصِل عَلَيَّ لَمّا تْوَصَّل",
          "transliteration": "ittasil alay lamma tosal"
        },
        "female": {
          "text": "اتصلي علي لما توصلين",
          "tashkeelText": "اتَّصِلي عَلَيَّ لَمّا تْوَصَّلين",
          "transliteration": "ittasili alay lamma tosaleen"
        },
        "neutral": null
      }
    },
    "followUp": {
      "englishTranslation": "Will do",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "حاضر",
            "tashkeelText": "حاضِر",
            "transliteration": "hadir"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "تمام",
            "tashkeelText": "تَمام",
            "transliteration": "tamam"
          }
        }
      }
    },
    "hasGenderVariation": true,
    "tags": ["coordinating", "phone-calls", "meeting-up"],
        "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "intermediate",
          "displaySentence": "كلمني لما _____",
          "displaySentenceTashkeel": "كَلِّمْني لَمّا _____",
          "displaySentenceTransliteration": "kallemni lamma _____",
          "blankWords": [
            {
              "word": "توصل",
              "tashkeelWord": "تْوَصَّل",
              "transliteration": "tosal",
              "isCorrect": true
            },
            {
              "word": "تنام",
              "tashkeelWord": "تْنام",
              "transliteration": "tnam",
              "isCorrect": false
            },
            {
              "word": "تاكل",
              "tashkeelWord": "تاكُل",
              "transliteration": "takul",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "intermediate",
          "displaySentence": "كلميني لما _____",
          "displaySentenceTashkeel": "كَلِّميني لَمّا _____",
          "displaySentenceTransliteration": "kallemini lamma _____",
          "blankWords": [
            {
              "word": "توصلي",
              "tashkeelWord": "تْوَصَّلي",
              "transliteration": "tosali",
              "isCorrect": true
            },
            {
              "word": "تنامي",
              "tashkeelWord": "تْنامي",
              "transliteration": "tnami",
              "isCorrect": false
            },
            {
              "word": "تاكلي",
              "tashkeelWord": "تاكُلي",
              "transliteration": "takuli",
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
          "difficulty": "intermediate",
          "displaySentence": "_____ علي لما توصل",
          "displaySentenceTashkeel": "_____ عَلَيَّ لَمّا تْوَصَّل",
          "displaySentenceTransliteration": "_____ alay lamma tosal",
          "blankWords": [
            {
              "word": "اتصل",
              "tashkeelWord": "اتَّصِل",
              "transliteration": "ittasil",
              "isCorrect": true
            },
            {
              "word": "ارسل",
              "tashkeelWord": "إرْسِل",
              "transliteration": "irsil",
              "isCorrect": false
            },
            {
              "word": "رد",
              "tashkeelWord": "رُدّ",
              "transliteration": "rudd",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "intermediate",
          "displaySentence": "_____ علي لما توصلين",
          "displaySentenceTashkeel": "_____ عَلَيَّ لَمّا تْوَصَّلين",
          "displaySentenceTransliteration": "_____ alay lamma tosaleen",
          "blankWords": [
            {
              "word": "اتصلي",
              "tashkeelWord": "اتَّصِلي",
              "transliteration": "ittasili",
              "isCorrect": true
            },
            {
              "word": "ارسلي",
              "tashkeelWord": "إرْسِلي",
              "transliteration": "irsili",
              "isCorrect": false
            },
            {
              "word": "ردي",
              "tashkeelWord": "رُدّي",
              "transliteration": "ruddi",
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

            return addPhrase(examplePhrase, 'SOCIAL', 'making-friends');
        })
        .then(() => {
            console.log('\n✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = addPhrase;
