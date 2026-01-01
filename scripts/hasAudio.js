// MongoDB Update Script
require('dotenv').config();
const mongoose = require('mongoose');
const Phrase = require('../models/Phrase');
const fs = require('fs');
const path = require('path');

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = process.env.MONGO_URI

async function updateHasAudio() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Read audio files from the Audio folder
        const audioFolderPath = path.join(__dirname, 'Audio');
        const audioFiles = fs.readdirSync(audioFolderPath)
            .filter(file => file.endsWith('.mp3'));

        // Extract variation IDs from audio file names
        const variationIds = audioFiles.map(file => {
            // Remove .mp3 extension to get the variation _id
            return file.replace('.mp3', '');
        });

        console.log(`📊 Found ${variationIds.length} audio files`);

        // Convert string IDs to ObjectIds
        const objectIds = variationIds.map(id => new mongoose.Types.ObjectId(id));

        let updatedCount = 0;

        // Update phrases - check all dialects and genders
        console.log('📝 Fetching phrases from database...');
        const phrases = await Phrase.find({});
        console.log(`📝 Checking ${phrases.length} phrases...`);

        for (const phrase of phrases) {
            let phraseUpdated = false;

            // Check all dialects
            for (const dialect of ['egyptian', 'saudi', 'msa']) {
                if (phrase.variations[dialect]) {
                    // Check all genders
                    for (const gender of ['male', 'female', 'neutral']) {
                        const variation = phrase.variations[dialect][gender];

                        if (variation && variation._id) {
                            // Check if this variation ID is in our audio list
                            const hasAudio = objectIds.some(audioId =>
                                audioId.equals(variation._id)
                            );

                            if (hasAudio && !variation.hasAudio) {
                                // Set hasAudio to true
                                variation.hasAudio = true;
                                phraseUpdated = true;
                                console.log(`  ✓ Updated ${dialect}.${gender} for phrase: ${phrase.englishTranslation}`);
                            }
                        }
                    }
                }
            }

            // Save if any variation was updated
            if (phraseUpdated) {
                await phrase.save();
                updatedCount++;
            }
        }

        console.log(`\n✅ Update complete!`);
        console.log(`📊 Updated ${updatedCount} phrases with hasAudio flags`);

    } catch (error) {
        console.error('❌ Error updating hasAudio:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the update if this script is executed directly
if (require.main === module) {
    updateHasAudio();
}