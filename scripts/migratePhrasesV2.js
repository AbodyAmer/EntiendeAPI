/**
 * Complete migration script for PhraseV2 with proper fill-in-blank exercises
 * This includes the text with blanks that was missing before
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');

// Helper to generate ObjectIds
const generateId = () => new ObjectId();

/**
 * Convert old phrase data to new V2 schema with proper exercises
 */
function migrateToV2Schema(oldPhrases) {
  const phrasesV2 = [];

  oldPhrases.forEach((oldPhrase, index) => {
    const phraseId = generateId();

    // Build variations array from old dialects array
    const variations = [];
    oldPhrase.dialects.forEach(dialectData => {
      variations.push({
        dialect: dialectData.dialect.toLowerCase(), // 'msa', 'egyptian', 'saudi'
        gender: null, // These phrases don't have gender variations
        text: dialectData.fulltext,
        tashkeelText: dialectData.fulltashkeelText,
        transliteration: dialectData.fullTransliteration,
        audioUrl: dialectData.audioUrl,
        audioSlowUrl: dialectData.audioSlowUrl
      });
    });

    // Build exercises array from old fillinWords data
    const exercises = [];
    oldPhrase.dialects.forEach(dialectData => {
      // Create a fill-in-blank exercise with ALL the necessary fields
      const exercise = {
        _id: generateId(),
        type: 'fill-in-blank',
        dialect: dialectData.dialect.toLowerCase(),
        gender: null,
        difficulty: oldPhrase.difficulty || 'beginner',

        // Options for filling the blank
        blankWords: dialectData.fillinWords.map(word => ({
          word: word.word,
          tashkeelWord: word.tashkeelWord,
          transliteration: word.transliteration,
          isCorrect: word.isCorrect
        })),

        // Store the text with blank in exerciseData
        exerciseData: {
          // Text with blank placeholder
          textWithBlank: dialectData.text, // e.g., "مع _____"
          tashkeelTextWithBlank: dialectData.tashkeelText, // e.g., "مَعَ _____"
          transliterationWithBlank: dialectData.transliteration, // e.g., "Ma'a _____"

          // Complete correct phrase for reference
          fullText: dialectData.fulltext,
          fullTashkeelText: dialectData.fulltashkeelText,
          fullTransliteration: dialectData.fullTransliteration,

          // Position of the blank (which word index)
          blankPosition: dialectData.text.split(' ').findIndex(word => word.includes('_____'))
        },

        gameContext: {
          scenario: oldPhrase.context.whenToUse,
          hint: `Think about ${oldPhrase.context.formality} expressions`,
          instructions: `Fill in the blank with the correct word`
        }
      };
      exercises.push(exercise);
    });

    // Build follow-up if it exists
    let followUp = null;
    if (oldPhrase.context.followUp) {
      const followUpVariations = [];
      oldPhrase.context.followUp.dialects.forEach(dialectData => {
        followUpVariations.push({
          dialect: dialectData.dialect.toLowerCase(),
          gender: null,
          text: dialectData.fulltext,
          tashkeelText: dialectData.fulltashkeelText,
          transliteration: dialectData.fullTransliteration,
          audioUrl: dialectData.audioUrl,
          audioSlowUrl: null
        });
      });

      followUp = {
        englishTranslation: oldPhrase.context.followUp.englishTranslation,
        whenHeard: oldPhrase.context.followUp.note,
        variations: followUpVariations
      };
    }

    // Build the new PhraseV2 document
    const phraseV2 = {
      _id: phraseId,
      englishTranslation: oldPhrase.englishTranslation,

      // For now, using string values for category/situation
      // These will be updated with ObjectIds after creating those collections
      category: oldPhrase.category || oldPhrase.categoryId,
      situation: oldPhrase.situation || oldPhrase.situationId,

      commonRank: oldPhrase.commonRank,

      context: {
        whenToUse: oldPhrase.context.whenToUse,
        whoToSayTo: oldPhrase.context.whoToSayTo,
        speaker: oldPhrase.context.speaker,
        listener: oldPhrase.context.listener,
        formality: oldPhrase.context.formality,
        emotion: oldPhrase.context.emotion,
        culturalNote: oldPhrase.context.culturalNote
      },

      variations: variations,
      exercises: exercises,
      followUp: followUp,

      hasGenderVariation: false, // None of these phrases have gender variations
      difficulty: oldPhrase.difficulty,
      frequency: oldPhrase.frequency,
      tags: oldPhrase.tags || [],

      isActive: true,
      isApproved: oldPhrase.isApproved !== undefined ? oldPhrase.isApproved : true,

      createdAt: new Date(),
      updatedAt: new Date()
    };

    phrasesV2.push(phraseV2);
  });

  return phrasesV2;
}

/**
 * Extract categories and situations from phrases
 */
function extractCategoriesAndSituations(phrases) {
  const categoriesMap = new Map();
  const situationsMap = new Map();

  phrases.forEach(phrase => {
    const categoryName = phrase.category;
    const situationName = phrase.situation;

    // Add category if not exists
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, {
        _id: generateId(),
        name: categoryName,
        nameAr: getCategoryArabic(categoryName),
        order: getCategoryOrder(categoryName),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add situation if not exists
    const situationKey = `${categoryName}:${situationName}`;
    if (!situationsMap.has(situationKey)) {
      const categoryId = categoriesMap.get(categoryName)._id;
      situationsMap.set(situationKey, {
        _id: generateId(),
        name: situationName,
        nameAr: getSituationArabic(situationName),
        category: categoryId,
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  });

  return {
    categories: Array.from(categoriesMap.values()),
    situations: Array.from(situationsMap.values())
  };
}

// Helper functions for Arabic translations
function getCategoryArabic(category) {
  const translations = {
    'SOCIAL': 'اجتماعي',
    'ESSENTIAL': 'أساسي',
    'CULTURAL': 'ثقافي'
  };
  return translations[category] || category;
}

function getSituationArabic(situation) {
  const translations = {
    'Greetings & Small Talk': 'التحيات والمحادثات القصيرة',
    'Airport': 'المطار',
    'Restaurant': 'المطعم',
    'Shopping': 'التسوق',
    'Emergency': 'الطوارئ',
    'Transportation': 'المواصلات'
  };
  return translations[situation] || situation;
}

function getCategoryOrder(category) {
  const orders = {
    'ESSENTIAL': 1,
    'SOCIAL': 2,
    'CULTURAL': 3
  };
  return orders[category] || 99;
}

/**
 * Update phrase references with actual database IDs
 */
function updatePhraseReferences(phrases, categories, situations) {
  return phrases.map(phrase => {
    // Find matching category
    const category = categories.find(c => c.name === phrase.category);
    // Find matching situation
    const situation = situations.find(s =>
      s.name === phrase.situation &&
      s.category.toString() === category._id.toString()
    );

    return {
      ...phrase,
      category: category._id,
      situation: situation._id
    };
  });
}

/**
 * Main migration function
 */
async function runMigration() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    // Load the old data
    const oldData = require('./oldPhraseData.json');
    console.log(`Starting migration of ${oldData.length} phrases to V2 schema...`);

    // Convert to new schema
    const phrasesV2 = migrateToV2Schema(oldData);

    // Extract categories and situations
    const { categories, situations } = extractCategoriesAndSituations(phrasesV2);

    // Update phrases with proper ObjectId references
    const updatedPhrases = updatePhraseReferences(phrasesV2, categories, situations);

    console.log('\nMigration summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Situations: ${situations.length}`);
    console.log(`- Phrases (V2): ${updatedPhrases.length}`);
    console.log(`- Total Variations: ${updatedPhrases.reduce((sum, p) => sum + p.variations.length, 0)}`);
    console.log(`- Total Exercises: ${updatedPhrases.reduce((sum, p) => sum + p.exercises.length, 0)}`);

    // Connect to MongoDB
    await client.connect();
    console.log('\n✅ Connected to MongoDB');

    const db = client.db('efham');

    // Ask for confirmation before clearing
    if (process.argv.includes('--clear-all')) {
      console.log('\n⚠️  Clearing existing data...');
      await db.collection('categories').deleteMany({});
      await db.collection('situations').deleteMany({});
      await db.collection('phrases').deleteMany({});
      console.log('✅ Existing data cleared');
    }

    // Get existing categories and situations to avoid duplicates
    const existingCategories = await db.collection('categories').find({}).toArray();
    const existingCategoryNames = new Set(existingCategories.map(c => c.name));

    // Insert only new categories
    const newCategories = categories.filter(c => !existingCategoryNames.has(c.name));
    if (newCategories.length > 0) {
      const result = await db.collection('categories').insertMany(newCategories);
      console.log(`✅ Inserted ${result.insertedCount} categories`);
    }

    // Get all categories for reference
    const allCategories = await db.collection('categories').find({}).toArray();

    // Get existing situations
    const existingSituations = await db.collection('situations').find({}).toArray();
    const existingSituationKeys = new Set(
      existingSituations.map(s => `${s.name}:${s.category.toString()}`)
    );

    // Update situations with correct category references
    const situationsWithRefs = situations.map(sit => {
      const dbCategory = allCategories.find(c =>
        c.name === categories.find(cat => cat._id.toString() === sit.category.toString())?.name
      );
      return { ...sit, category: dbCategory._id };
    });

    // Insert only new situations
    const newSituations = situationsWithRefs.filter(s =>
      !existingSituationKeys.has(`${s.name}:${s.category.toString()}`)
    );

    if (newSituations.length > 0) {
      const result = await db.collection('situations').insertMany(newSituations);
      console.log(`✅ Inserted ${result.insertedCount} situations`);
    }

    // Get all situations for phrase references
    const allSituations = await db.collection('situations').find({}).toArray();

    // Update phrase references with actual database IDs
    const phrasesWithCorrectRefs = updatedPhrases.map(phrase => {
      const categoryName = categories.find(c => c._id.toString() === phrase.category.toString())?.name;
      const situationName = situations.find(s => s._id.toString() === phrase.situation.toString())?.name;

      const dbCategory = allCategories.find(c => c.name === categoryName);
      const dbSituation = allSituations.find(s =>
        s.name === situationName && s.category.toString() === dbCategory._id.toString()
      );

      return {
        ...phrase,
        category: dbCategory._id,
        situation: dbSituation._id
      };
    });

    // Insert phrases
    const phrasesResult = await db.collection('phrases').insertMany(phrasesWithCorrectRefs);
    console.log(`✅ Inserted ${phrasesResult.insertedCount} phrases with proper exercises`);

    // Verify one example
    const examplePhrase = await db.collection('phrases').findOne({ englishTranslation: "Goodbye" });
    if (examplePhrase && examplePhrase.exercises[0]) {
      console.log('\n📝 Example of correctly structured exercise:');
      console.log('Phrase:', examplePhrase.englishTranslation);
      console.log('Text with blank:', examplePhrase.exercises[0].exerciseData?.textWithBlank);
      console.log('Full text:', examplePhrase.exercises[0].exerciseData?.fullText);
      console.log('Blank options:', examplePhrase.exercises[0].blankWords.map(w => w.word).join(', '));
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the migration
if (require.main === module) {
  console.log('PhraseV2 Migration Script');
  console.log('========================');
  console.log('Usage: node migratePhrasesV2.js [--clear-all]');
  console.log('  --clear-all: Clear existing data before importing');
  console.log('');

  runMigration();
}