require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/efham', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    const PhraseV2 = db.collection('phrases');

    const phraseId = new mongoose.Types.ObjectId('68ea4ac49af3e5d5915e7ca0');

    // Define your exercise data here
    const exerciseData = {
  saudi: [
    {
      type: 'fill-in-blank',
      gender: 'neutral',
      difficulty: 'intermediate',
      displaySentence: "متى _____ نتقابل؟",
      displaySentenceTashkeel: "مَتى _____ نِتْقابَل؟",
      displaySentenceTransliteration: "mata _____ nit'aabil?",
      blankWords: [
        { word: "يناسبك", tashkeelWord: "يُناسِبَك", transliteration: "yunaasibak", isCorrect: true },
        { word: "تروح", tashkeelWord: "تِروح", transliteration: "truuh", isCorrect: false },
        { word: "عندك", tashkeelWord: "عِنْدَك", transliteration: "'indak", isCorrect: false }
      ]
    }
  ],
  egyptian: [
    {
      type: 'fill-in-blank',
      gender: 'neutral',
      difficulty: 'intermediate',
      displaySentence: "امتى _____ نتقابل؟",
      displaySentenceTashkeel: "إمْتى _____ نِتْقابِل؟",
      displaySentenceTransliteration: "imta _____ nit'aabil?",
      blankWords: [
        { word: "يناسبك", tashkeelWord: "يُناسِبَك", transliteration: "yunaasibak", isCorrect: true },
        { word: "هتروح", tashkeelWord: "هَتِروح", transliteration: "hatruuh", isCorrect: false },
        { word: "معاك", tashkeelWord: "مَعاك", transliteration: "ma'aak", isCorrect: false }
      ]
    }
  ]
}

    // Update the phrase - either push new exercise or replace existing
    const result = await PhraseV2.updateOne(
      { _id: phraseId },
      {
        $set: { exercises: exerciseData }
        // OR to replace all exercises: { $set: { exercises: [exerciseData] } }
      }
    );

    console.log('Update result:', result);

    if (result.modifiedCount > 0) {
      console.log('✓ Successfully updated exercise for phrase:', phraseId.toString());

      // Fetch and display updated phrase
      const updatedPhrase = await PhraseV2.findOne({ _id: phraseId });
      console.log('\nUpdated phrase exercises:');
      console.log(JSON.stringify(updatedPhrase.exercises, null, 2));
    } else {
      console.log('✗ No document was modified. Check if the ID exists.');
    }

  } catch (error) {
    console.error('Error updating exercise:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
});
