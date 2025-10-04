/**
 * Script to fix the fill-in-blank exercises by adding the missing text with blanks
 *
 * The issue: Exercises have the options (blankWords) but not the actual sentence with blank
 * The fix: Add textWithBlank, tashkeelTextWithBlank, and related fields to exerciseData
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { MongoClient } = require('mongodb');

// Original data mapping to reconstruct the text with blanks
// This would normally come from the original migration data
const phraseTemplates = {
  "Peace be upon you (Hello)": {
    template: "السلام _____",
    tashkeelTemplate: "اَلسَّلَامُ _____",
    transliterationTemplate: "Assalamu _____"
  },
  "Good morning": {
    msa: {
      template: "صباح _____",
      tashkeelTemplate: "صَبَاحُ _____",
      transliterationTemplate: "Sabah _____"
    },
    egyptian: {
      template: "صباح _____",
      tashkeelTemplate: "صَبَاحُ _____",
      transliterationTemplate: "Sabah _____"
    },
    saudi: {
      template: "صباح _____",
      tashkeelTemplate: "صَبَاحُ _____",
      transliterationTemplate: "Sabah _____"
    }
  },
  "Good evening": {
    template: "مساء _____",
    tashkeelTemplate: "مَسَاءُ _____",
    transliterationTemplate: "Masa _____"
  },
  "Hello / Welcome": {
    msa: {
      template: "_____ بك",
      tashkeelTemplate: "_____ بِكَ",
      transliterationTemplate: "_____ bik"
    },
    egyptian: {
      template: "أهلاً _____",
      tashkeelTemplate: "أَهْلًا _____",
      transliterationTemplate: "Ahlan _____"
    },
    saudi: {
      template: "هلا _____",
      tashkeelTemplate: "هَلَا _____",
      transliterationTemplate: "Hala _____"
    }
  },
  "How are you?": {
    msa: {
      template: "كيف _____؟",
      tashkeelTemplate: "كَيْفَ _____؟",
      transliterationTemplate: "Kaifa _____?"
    },
    egyptian: {
      template: "_____؟",
      tashkeelTemplate: "_____؟",
      transliterationTemplate: "_____?"
    },
    saudi: {
      template: "_____؟",
      tashkeelTemplate: "_____؟",
      transliterationTemplate: "_____?"
    }
  },
  "Fine, thank God": {
    msa: {
      template: "بخير، _____ لله",
      tashkeelTemplate: "بِخَيْرٍ، _____ لِلَّهِ",
      transliterationTemplate: "Bikhair, _____ lillah"
    },
    egyptian: {
      template: "تمام، _____ لله",
      tashkeelTemplate: "تَمَامْ، _____ لِلَّهِ",
      transliterationTemplate: "Tamam, _____ lillah"
    },
    saudi: {
      template: "بخير، _____ لله",
      tashkeelTemplate: "بِخَيْرٍ، _____ لِلَّهِ",
      transliterationTemplate: "Bikhair, _____ lillah"
    }
  },
  "What is your name?": {
    msa: {
      template: "ما _____؟",
      tashkeelTemplate: "مَا _____؟",
      transliterationTemplate: "Ma _____?"
    },
    egyptian: {
      template: "اسمك _____؟",
      tashkeelTemplate: "اسْمَكْ _____؟",
      transliterationTemplate: "Ismak _____?"
    },
    saudi: {
      template: "وش _____؟",
      tashkeelTemplate: "وِشْ _____؟",
      transliterationTemplate: "Wesh _____?"
    }
  },
  "My name is...": {
    template: "_____ أحمد",
    tashkeelTemplate: "_____ أَحْمَد",
    transliterationTemplate: "_____ Ahmad"
  },
  "Pleased to meet you": {
    msa: {
      template: "_____",
      tashkeelTemplate: "_____",
      transliterationTemplate: "_____"
    },
    egyptian: {
      template: "_____",
      tashkeelTemplate: "_____",
      transliterationTemplate: "_____"
    },
    saudi: {
      template: "_____",
      tashkeelTemplate: "_____",
      transliterationTemplate: "_____"
    }
  },
  "Goodbye": {
    template: "مع _____",
    tashkeelTemplate: "مَعَ _____",
    transliterationTemplate: "Ma'a _____"
  }
};

async function fixExercises() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('efham');
    const collection = db.collection('phrases');

    // Get all phrases
    const phrases = await collection.find({}).toArray();
    console.log(`Found ${phrases.length} phrases to process`);

    let updatedCount = 0;

    for (const phrase of phrases) {
      let needsUpdate = false;
      const updatedExercises = [];

      // Check if this phrase has exercises that need fixing
      if (phrase.exercises && phrase.exercises.length > 0) {
        for (const exercise of phrase.exercises) {
          if (exercise.type === 'fill-in-blank' && !exercise.exerciseData?.textWithBlank) {
            needsUpdate = true;

            // Get the template for this phrase
            const template = phraseTemplates[phrase.englishTranslation];

            if (template) {
              let textWithBlank, tashkeelTextWithBlank, transliterationWithBlank;

              // Handle dialect-specific templates
              if (template[exercise.dialect]) {
                textWithBlank = template[exercise.dialect].template;
                tashkeelTextWithBlank = template[exercise.dialect].tashkeelTemplate;
                transliterationWithBlank = template[exercise.dialect].transliterationTemplate;
              } else if (template.template) {
                // Use the default template
                textWithBlank = template.template;
                tashkeelTextWithBlank = template.tashkeelTemplate;
                transliterationWithBlank = template.transliterationTemplate;
              }

              // Find the corresponding variation to get the full text
              const variation = phrase.variations.find(v => v.dialect === exercise.dialect);

              // Update the exercise with the missing data
              const updatedExercise = {
                ...exercise,
                exerciseData: {
                  ...exercise.exerciseData,
                  textWithBlank: textWithBlank,
                  tashkeelTextWithBlank: tashkeelTextWithBlank,
                  transliterationWithBlank: transliterationWithBlank,
                  fullText: variation?.text,
                  fullTashkeelText: variation?.tashkeelText,
                  fullTransliteration: variation?.transliteration
                }
              };

              updatedExercises.push(updatedExercise);

              console.log(`✅ Fixed exercise for: "${phrase.englishTranslation}" (${exercise.dialect})`);
            } else {
              console.warn(`⚠️  No template found for: "${phrase.englishTranslation}"`);
              updatedExercises.push(exercise);
            }
          } else {
            // Keep exercise as is
            updatedExercises.push(exercise);
          }
        }

        // Update the phrase if needed
        if (needsUpdate) {
          await collection.updateOne(
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
    }

    console.log(`\n✅ Successfully updated ${updatedCount} phrases`);

    // Verify the fix by checking one example
    const examplePhrase = await collection.findOne({ englishTranslation: "Goodbye" });
    if (examplePhrase && examplePhrase.exercises[0]?.exerciseData?.textWithBlank) {
      console.log('\n📝 Example of fixed exercise:');
      console.log('Phrase:', examplePhrase.englishTranslation);
      console.log('Text with blank:', examplePhrase.exercises[0].exerciseData.textWithBlank);
      console.log('Full text:', examplePhrase.exercises[0].exerciseData.fullText);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the fix
fixExercises();