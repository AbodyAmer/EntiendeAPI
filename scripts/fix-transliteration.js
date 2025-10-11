require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/efham', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    const PhraseV2 = db.collection('phrases');

    // TODO: Replace with actual ObjectId
    const phraseId = new mongoose.Types.ObjectId('');

    // Update the phrase
    const result = await PhraseV2.updateOne(
      { _id: phraseId },
      {
        $set: {}
      }
    );

    console.log('Update result:', result);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.matchedCount === 0) {
      console.log('⚠️  No document found with that ID. Please check the ObjectId.');
    } else if (result.modifiedCount === 0) {
      console.log('ℹ️  Document found but no changes needed (values already correct).');
    } else {
      console.log('✅ Successfully updated transliterations');
    }
  } catch (error) {
    console.error('Error updating phrase:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
});
