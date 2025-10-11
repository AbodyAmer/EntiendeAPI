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
    englishTranslation: "Send me the location",
    context: {
      whenToUse: "Need directions/location pin. Via WhatsApp/maps.",
      formality: "informal"
    },
    variations: {
      saudi: {
        male: { 
          text: "ارسل لي الموقع",
          tashkeelText: "إرْسِل لي المَوْقِع",
          transliteration: "irsil lii il-maw'i'"
        },
        female: { 
          text: "ارسلي لي الموقع",
          tashkeelText: "إرْسِلي لي المَوْقِع",
          transliteration: "irsilii lii il-maw'i'"
        }
      },
      egyptian: {
        male: { 
          text: "ابعت لي الموقع",
          tashkeelText: "ابْعَت لي المَوْقِع",
          transliteration: "ib'at lii il-maw'i'"
        },
        female: { 
          text: "ابعتي لي الموقع",
          tashkeelText: "ابْعَتي لي المَوْقِع",
          transliteration: "ib'atii lii il-maw'i'"
        }
      }
    },
    followUp: {
      englishTranslation: "Okay, right now",
      isSamePerson: false,
      variations: {
        saudi: { 
          neutral: { 
            text: "حاضر، الحين",
            tashkeelText: "حاضِر، الحين",
            transliteration: "haadır, il-heen"
          }
        },
        egyptian: { 
          neutral: { 
            text: "حاضر، دلوقتي",
            tashkeelText: "حاضِر، دِلْوَقْتي",
            transliteration: "haadır, dilwa'tii"
          }
        }
      }
    },
    hasGenderVariation: true,
    tags: ["request", "navigation", "imperative"],
    exercises: {
  saudi: [
    {
      type: 'fill-in-blank',
      gender: 'male',
      difficulty: 'beginner',
      displaySentence: "_____ لي الموقع",
      displaySentenceTashkeel: "_____ لي المَوْقِع",
      displaySentenceTransliteration: "_____ lii il-maw'i'",
      blankWords: [
        { word: "ارسل", tashkeelWord: "إرْسِل", transliteration: "irsil", isCorrect: true },
        { word: "اتصل", tashkeelWord: "إتَّصِل", transliteration: "ittasil", isCorrect: false },
        { word: "اعطي", tashkeelWord: "أعْطي", transliteration: "a'ti", isCorrect: false }
      ]
    },
    {
      type: 'fill-in-blank',
      gender: 'female',
      difficulty: 'beginner',
      displaySentence: "_____ لي الموقع",
      displaySentenceTashkeel: "_____ لي المَوْقِع",
      displaySentenceTransliteration: "_____ lii il-maw'i'",
      blankWords: [
        { word: "ارسلي", tashkeelWord: "إرْسِلي", transliteration: "irsilii", isCorrect: true },
        { word: "اتصلي", tashkeelWord: "إتَّصِلي", transliteration: "ittasilii", isCorrect: false },
        { word: "اعطي", tashkeelWord: "أعْطي", transliteration: "a'ti", isCorrect: false }
      ]
    }
  ],
  egyptian: [
    {
      type: 'fill-in-blank',
      gender: 'male',
      difficulty: 'beginner',
      displaySentence: "_____ لي الموقع",
      displaySentenceTashkeel: "_____ لي المَوْقِع",
      displaySentenceTransliteration: "_____ lii il-maw'i'",
      blankWords: [
        { word: "ابعت", tashkeelWord: "ابْعَت", transliteration: "ib'at", isCorrect: true },
        { word: "اتصل", tashkeelWord: "إتَّصِل", transliteration: "ittasil", isCorrect: false },
        { word: "ادي", tashkeelWord: "إدّي", transliteration: "iddi", isCorrect: false }
      ]
    },
    {
      type: 'fill-in-blank',
      gender: 'female',
      difficulty: 'beginner',
      displaySentence: "_____ لي الموقع",
      displaySentenceTashkeel: "_____ لي المَوْقِع",
      displaySentenceTransliteration: "_____ lii il-maw'i'",
      blankWords: [
        { word: "ابعتي", tashkeelWord: "ابْعَتي", transliteration: "ib'atii", isCorrect: true },
        { word: "اتصلي", tashkeelWord: "إتَّصِلي", transliteration: "ittasilii", isCorrect: false },
        { word: "ادي", tashkeelWord: "إدّي", transliteration: "iddi", isCorrect: false }
      ]
    }
  ]
}
  }

            // Add the phrase
            return addPhrase(examplePhrase, 'ESSENTIAL', 'transportation');
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
