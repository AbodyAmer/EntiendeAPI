require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

const socialSituations = [
{
  name: "weather",
  displayName: "Weather",
  arabicName: "الطقس",
  description: "Phrases for talking about weather conditions and daily forecasts.",
  icon: "☀️",
  order: 6
}

];

async function addSocialSituations() {
    try {
        // Find or create the SOCIAL category
        let category = await Category.findOne({ name: 'SOCIAL' });

        if (!category) {
            console.log('📁 Creating SOCIAL category...');
            category = await Category.create({
                name: 'SOCIAL',
                nameAr: 'اجتماعيات',
                order: 2,
                isActive: true
            });
            console.log('✅ SOCIAL category created');
        } else {
            console.log('✅ SOCIAL category found');
        }

        console.log(`\n📝 Adding ${socialSituations.length} situations to SOCIAL category...\n`);

        const results = {
            created: [],
            skipped: [],
            updated: []
        };

        for (const situationData of socialSituations) {
            // Check if situation already exists
            const existing = await Situation.findOne({
                name: situationData.name,
                categoryId: category._id
            });

            if (existing) {
                console.log(`⏭️  Skipped: "${situationData.displayName}" (already exists)`);
                results.skipped.push(situationData.displayName);
            } else {
                const situation = await Situation.create({
                    categoryId: category._id,
                    name: situationData.name,
                    displayName: situationData.displayName,
                    arabicName: situationData.arabicName,
                    description: situationData.description,
                    icon: situationData.icon,
                    order: situationData.order,
                    phraseCount: 0,
                    isActive: true,
                    tags: []
                });
                console.log(`✅ Created: "${situationData.displayName}" (${situationData.arabicName})`);
                results.created.push(situationData.displayName);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Created: ${results.created.length}`);
        console.log(`⏭️  Skipped: ${results.skipped.length}`);
        console.log('='.repeat(60));

        if (results.created.length > 0) {
            console.log('\n🎉 New situations created:');
            results.created.forEach(name => console.log(`   - ${name}`));
        }

        if (results.skipped.length > 0) {
            console.log('\n⏭️  Situations that already existed:');
            results.skipped.forEach(name => console.log(`   - ${name}`));
        }

        return results;

    } catch (error) {
        console.error('❌ Error adding situations:', error.message);
        throw error;
    }
}

// Connect to database and run if executed directly
if (require.main === module) {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/efham';

    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('📦 Connected to MongoDB');
            console.log('='.repeat(60));
            return addSocialSituations();
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

module.exports = addSocialSituations;
