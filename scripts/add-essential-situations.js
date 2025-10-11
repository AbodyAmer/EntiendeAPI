require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

const essentialSituations = [
  {
    name: "Airport & Travel",
    nameAr: "المطار والسفر",
    order: 2
  },
  {
    name: "Restaurant & Food",
    nameAr: "المطعم والطعام",
    order: 3
  },
  {
    name: "Shopping & Markets",
    nameAr: "التسوق والأسواق",
    order: 4
  },
  {
    name: "Transportation",
    nameAr: "المواصلات",
    order: 5
  },
  {
    name: "Emergency & Medical",
    nameAr: "الطوارئ والطب",
    order: 6
  },
  {
    name: "Hotel & Accommodation",
    nameAr: "الفندق والإقامة",
    order: 7
  },
  {
    name: "Asking for Help",
    nameAr: "طلب المساعدة",
    order: 8
  }
];

async function addEssentialSituations() {
    try {
        // Find or create the ESSENTIAL category
        let category = await Category.findOne({ name: 'ESSENTIAL' });

        if (!category) {
            console.log('📁 Creating ESSENTIAL category...');
            category = await Category.create({
                name: 'ESSENTIAL',
                nameAr: 'أساسيات',
                order: 1,
                isActive: true
            });
            console.log('✅ ESSENTIAL category created');
        } else {
            console.log('✅ ESSENTIAL category found');
        }

        console.log(`\n📝 Adding ${essentialSituations.length} situations to ESSENTIAL category...\n`);

        const results = {
            created: [],
            skipped: [],
            updated: []
        };

        for (const situationData of essentialSituations) {
            // Check if situation already exists
            const existing = await Situation.findOne({
                name: situationData.name,
                category: category._id
            });

            if (existing) {
                console.log(`⏭️  Skipped: "${situationData.name}" (already exists)`);
                results.skipped.push(situationData.name);
            } else {
                const situation = await Situation.create({
                    name: situationData.name,
                    nameAr: situationData.nameAr,
                    category: category._id,
                    order: situationData.order,
                    isActive: true
                });
                console.log(`✅ Created: "${situationData.name}" (${situationData.nameAr})`);
                results.created.push(situationData.name);
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
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/efham';

    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('📦 Connected to MongoDB');
            console.log('='.repeat(60));
            return addEssentialSituations();
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

module.exports = addEssentialSituations;
