/**
 * Script to reduce fill-in-blank options from 4 to 3 in the database
 * Removes one INCORRECT option from each exercise's blankWords array
 * IMPORTANT: Keeps the correct option (isCorrect: true) and only removes from wrong options
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { MongoClient } = require('mongodb');

async function reduceOptionsTo3() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('efham');
    const phrasesCollection = db.collection('phrases');

    // Find all phrases with exercises that have 4 options
    const phrases = await phrasesCollection.find({
      'exercises.blankWords.3': { $exists: true } // Has 4th element (index 3)
    }).toArray();

    console.log(`\nFound ${phrases.length} phrases with exercises containing 4 options`);

    let updatedCount = 0;
    let exercisesUpdated = 0;

    for (const phrase of phrases) {
      let needsUpdate = false;
      const updatedExercises = [];

      for (const exercise of phrase.exercises) {
        if (exercise.blankWords && exercise.blankWords.length === 4) {
          // Find the correct option
          const correctIndex = exercise.blankWords.findIndex(w => w.isCorrect === true);

          if (correctIndex === -1) {
            console.warn(`⚠️  No correct option found in phrase: "${phrase.englishTranslation}" (${exercise.dialect})`);
            updatedExercises.push(exercise);
            continue;
          }

          // Get all incorrect options
          const incorrectOptions = exercise.blankWords.filter(w => !w.isCorrect);

          if (incorrectOptions.length < 3) {
            console.warn(`⚠️  Less than 3 incorrect options in phrase: "${phrase.englishTranslation}" (${exercise.dialect})`);
            updatedExercises.push(exercise);
            continue;
          }

          // Keep the correct option and only 2 incorrect options (remove the last incorrect one)
          const newBlankWords = [
            exercise.blankWords[correctIndex], // Keep correct option
            ...incorrectOptions.slice(0, 2)    // Keep first 2 incorrect options
          ];

          // Create updated exercise
          const updatedExercise = {
            ...exercise,
            blankWords: newBlankWords
          };

          updatedExercises.push(updatedExercise);
          needsUpdate = true;
          exercisesUpdated++;

          console.log(`✓ Updated exercise for "${phrase.englishTranslation}" (${exercise.dialect}): 4 → 3 options`);
        } else {
          updatedExercises.push(exercise);
        }
      }

      // Update the phrase if needed
      if (needsUpdate) {
        await phrasesCollection.updateOne(
          { _id: phrase._id },
          {
            $set: {
              exercises: updatedExercises,
              updatedAt: new Date()
            }
          }
        );
        updatedCount++;
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} phrases`);
    console.log(`✅ Total exercises reduced: ${exercisesUpdated}`);

    // Verify by checking a sample
    const samplePhrase = await phrasesCollection.findOne({
      'exercises.0': { $exists: true }
    });

    if (samplePhrase && samplePhrase.exercises[0]) {
      console.log('\n📝 Sample verification:');
      console.log(`Phrase: "${samplePhrase.englishTranslation}"`);
      console.log(`Exercise dialect: ${samplePhrase.exercises[0].dialect}`);
      console.log(`Number of options: ${samplePhrase.exercises[0].blankWords.length}`);
      console.log(`Options:`, samplePhrase.exercises[0].blankWords.map(w =>
        `${w.word} (${w.isCorrect ? 'CORRECT' : 'wrong'})`
      ).join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

// Run the script
reduceOptionsTo3();
