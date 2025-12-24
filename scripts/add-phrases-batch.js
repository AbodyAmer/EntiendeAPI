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
    const phrasesArray = [{
  "englishTranslation": "Stop here please",
  "commonRank": 1000000,
  "context": {
    "whenToUse": "Asking driver to pull over or stop.",
    "formality": "informal"
  },
  "variations": {
    "msa": null,
    "egyptian": {
      "male": {
        "text": "على جنبك هنا يا أسطى",
        "tashkeelText": "عَلَى جَنْبَك هِنَا يَا أُسْطَى",
        "transliteration": "'ala gambak hina ya osta",
      },
      "female": {
        "text": "على جنبك هنا لو سمحتي",
        "tashkeelText": "عَلَى جَنْبِك هِنَا لَو سَمَحْتِي",
        "transliteration": "'ala gambik hina law sama7ti",
      },
      "neutral": null
    },
    "saudi": {
      "male": {
        "text": "على جنبك هنا يا كابتن",
        "tashkeelText": "عَلَى جَنْبَك هِنَا يَا كَابْتِن",
        "transliteration": "'ala janbak hina ya captain",
      },
      "female": {
        "text": "على جنبك هنا لو سمحتي",
        "tashkeelText": "عَلَى جَنْبِك هِنَا لَو سَمَحْتِي",
        "transliteration": "'ala janbik hina law sama7ti",
      },
      "neutral": null
    }
  },
  "gameContext": null,
  "exercises": {
    "msa": [],
    "egyptian": [
      {
        "type": "fill-in-blank",
        "gender": "male",
        "difficulty": "beginner",
        "displaySentence": "_____ هنا يا أسطى",
        "displaySentenceTashkeel": "_____ هِنَا يَا أُسْطَى",
        "displaySentenceTransliteration": "_____ hina ya osta",
        "blankWords": [
          {
            "word": "على جنبك",
            "tashkeelWord": "عَلَى جَنْبَك",
            "transliteration": "'ala gambak",
            "isCorrect": true,
          },
          {
            "word": "فوق السطوح",
            "tashkeelWord": "فُوق السُّطُوح",
            "transliteration": "foo' el sotoo7",
            "isCorrect": false,
          },
          {
            "word": "تحت الكبري",
            "tashkeelWord": "تَحْت الكُبْرِي",
            "transliteration": "ta7t el kobri",
            "isCorrect": false,
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
        "displaySentence": "_____ هنا يا كابتن",
        "displaySentenceTashkeel": "_____ هِنَا يَا كَابْتِن",
        "displaySentenceTransliteration": "_____ hina ya captain",
        "blankWords": [
          {
            "word": "على جنبك",
            "tashkeelWord": "عَلَى جَنْبَك",
            "transliteration": "'ala janbak",
            "isCorrect": true,
          }
        ],
        "reorderWords": [],
        "matchingPairs": []
      }
    ]
  },
  "followUp": null,
  "hasGenderVariation": true,
  "difficulty": "beginner",
  "frequency": "high",
  "tags": [
    "taxi",
    "request",
    "location",
    "insider"
  ],
  "isActive": true,
  "isApproved": true,
  "showme": false,
  "createdAt": {
    "$date": "2025-11-12T16:49:42.353Z"
  },
  "updatedAt": {
    "$date": "2025-12-23T18:00:00.000Z"
  },
  "__v": 0
}]







    const categoryName = 'ESSENTIAL'; // Change this
    const situationName = 'getting-around'; // Change this

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
