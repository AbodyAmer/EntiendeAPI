const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/efham', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', async () => {
    console.log('Connected to MongoDB');

    try {
        // Get the raw collection (bypass Mongoose to see actual database data)
        const phrasesCollection = db.collection('phrases');

        // Find all phrases
        const phrases = await phrasesCollection.find({}).toArray();
        console.log(`Found ${phrases.length} phrases to process`);

        let updatedCount = 0;
        let variationsUpdated = 0;

        const dialects = ['msa', 'egyptian', 'saudi'];
        const genders = ['male', 'female', 'neutral'];

        for (const phrase of phrases) {
            const updateFields = {};

            // Check each dialect and gender combination
            for (const dialect of dialects) {
                if (phrase.variations && phrase.variations[dialect]) {
                    for (const gender of genders) {
                        const variation = phrase.variations[dialect][gender];
                        const fieldPath = `variations.${dialect}.${gender}._id`;

                        // If variation exists but doesn't have _id in the database
                        if (variation && !variation._id) {
                            // Generate new ObjectId and add to update
                            updateFields[fieldPath] = new mongoose.Types.ObjectId();
                            variationsUpdated++;
                            console.log(`  Will add _id to ${dialect}/${gender} variation`);
                        }
                    }
                }
            }

            // Check follow-up variations
            if (phrase.followUp && phrase.followUp.variations) {
                for (const dialect of dialects) {
                    if (phrase.followUp.variations[dialect]) {
                        for (const gender of genders) {
                            const variation = phrase.followUp.variations[dialect][gender];
                            const fieldPath = `followUp.variations.${dialect}.${gender}._id`;

                            if (variation && !variation._id) {
                                updateFields[fieldPath] = new mongoose.Types.ObjectId();
                                variationsUpdated++;
                                console.log(`  Will add _id to followUp ${dialect}/${gender} variation`);
                            }
                        }
                    }
                }
            }

            // If we have fields to update, do the update
            if (Object.keys(updateFields).length > 0) {
                await phrasesCollection.updateOne(
                    { _id: phrase._id },
                    { $set: updateFields }
                );
                updatedCount++;
                console.log(`✓ Updated phrase: "${phrase.englishTranslation}"`);
            }
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Phrases updated: ${updatedCount}`);
        console.log(`Total variations with new _id: ${variationsUpdated}`);

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
});
