require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

/**
 * Complete structure for all categories and situations
 * Based on 1000 phrases distribution across Essential, Social, and Cultural categories
 */
const categoriesAndSituations = [
  {
    category: {
      name: 'ESSENTIAL',
      displayName: 'Essential',
      description: 'Essential phrases for survival - airport, restaurant, emergencies, and basic communication needs',
      order: 1
    },
    situations: [
      { name: 'greetings-small-talk', displayName: 'Greetings & Small Talk', arabicName: 'التحيات والمحادثات القصيرة', description: 'Common greetings, introductions, and casual conversation starters', order: 1, phraseCount: 60 },
      { name: 'airport-travel', displayName: 'Airport & Travel', arabicName: 'المطار والسفر', description: 'Essential phrases for airports, flights, customs, and travel situations', order: 2, phraseCount: 80 },
      { name: 'restaurant-food', displayName: 'Restaurant & Food', arabicName: 'المطعم والطعام', description: 'Ordering food, making reservations, dietary requests, and dining etiquette', order: 3, phraseCount: 80 },
      { name: 'shopping-markets', displayName: 'Shopping & Markets', arabicName: 'التسوق والأسواق', description: 'Shopping phrases, bargaining, asking for prices, and market interactions', order: 4, phraseCount: 80 },
      { name: 'transportation', displayName: 'Transportation', arabicName: 'المواصلات', description: 'Taking taxis, buses, trains, asking for directions', order: 5, phraseCount: 70 },
      { name: 'emergency-medical', displayName: 'Emergency & Medical', arabicName: 'الطوارئ والطب', description: 'Emergency situations, medical needs, pharmacy, doctor visits', order: 6, phraseCount: 70 },
      { name: 'hotel-accommodation', displayName: 'Hotel & Accommodation', arabicName: 'الفندق والإقامة', description: 'Hotel check-in, room requests, amenities, and accommodation needs', order: 7, phraseCount: 60 },
      { name: 'asking-for-help', displayName: 'Asking for Help', arabicName: 'طلب المساعدة', description: 'How to politely ask for help, clarifications, and assistance', order: 8, phraseCount: 60 }
    ]
  },
  {
    category: {
      name: 'SOCIAL',
      displayName: 'Social',
      description: 'Social integration phrases - making friends, workplace, sports, and neighborhood interactions',
      order: 2
    },
    situations: [
      { name: 'making-friends', displayName: 'Making Friends', arabicName: 'تكوين صداقات', description: 'Building friendships, social invitations, and casual hangouts', order: 1, phraseCount: 70 },
      { name: 'sports-hobbies', displayName: 'Sports & Hobbies', arabicName: 'الرياضة والهوايات', description: 'Talking about sports, hobbies, interests, and recreational activities', order: 2, phraseCount: 80 },
      { name: 'workplace', displayName: 'Workplace', arabicName: 'مكان العمل', description: 'Professional interactions, office communication, and work relationships', order: 3, phraseCount: 70 },
      { name: 'neighbors', displayName: 'Neighbors', arabicName: 'الجيران', description: 'Interacting with neighbors, building community, and local etiquette', order: 4, phraseCount: 60 }
    ]
  },
  {
    category: {
      name: 'CULTURAL',
      displayName: 'Cultural',
      description: 'Deep cultural integration - weddings, family events, religious settings, and traditional occasions',
      order: 3
    },
    situations: [
      { name: 'weddings', displayName: 'Weddings', arabicName: 'الأفراح والزواج', description: 'Wedding celebrations, congratulations, and ceremonial phrases', order: 1, phraseCount: 50 },
      { name: 'family-gatherings', displayName: 'Family Gatherings', arabicName: 'اللقاءات العائلية', description: 'Family visits, gatherings, and traditional family interactions', order: 2, phraseCount: 50 },
      { name: 'religious-settings', displayName: 'Religious Settings', arabicName: 'الأماكن الدينية', description: 'Mosque etiquette, religious occasions, and respectful phrases', order: 3, phraseCount: 30 },
      { name: 'holidays', displayName: 'Holidays', arabicName: 'الأعياد والمناسبات', description: 'Holiday greetings, celebrations, and festive occasions', order: 4, phraseCount: 30 }
    ]
  }
];

async function setupCategoriesAndSituations() {
  try {
    console.log('🚀 Starting setup of categories and situations...\n');

    const stats = {
      categories: { created: 0, existing: 0 },
      situations: { created: 0, existing: 0 }
    };

    for (const data of categoriesAndSituations) {
      console.log('='.repeat(70));
      console.log(`📁 Category: ${data.category.name} (${data.category.displayName})`);
      console.log('='.repeat(70));

      // Find or create category
      let category = await Category.findOne({ name: data.category.name });

      if (!category) {
        category = await Category.create({
          name: data.category.name,
          displayName: data.category.displayName,
          description: data.category.description,
          order: data.category.order,
          isActive: true
        });
        stats.categories.created++;
        console.log(`✅ Category created: ${data.category.name}\n`);
      } else {
        stats.categories.existing++;
        console.log(`✅ Category found: ${data.category.name}\n`);
      }

      // Calculate total phrases for this category
      const totalPhrases = data.situations.reduce((sum, s) => sum + s.phraseCount, 0);
      console.log(`📊 Total phrases planned for this category: ${totalPhrases}\n`);

      // Add situations
      for (const situationData of data.situations) {
        const existing = await Situation.findOne({
          name: situationData.name,
          categoryId: category._id
        });

        if (existing) {
          stats.situations.existing++;
          console.log(`   ⏭️  ${situationData.displayName} (${situationData.arabicName}) - ${situationData.phraseCount} phrases [EXISTS]`);
        } else {
          await Situation.create({
            name: situationData.name,
            displayName: situationData.displayName,
            arabicName: situationData.arabicName,
            description: situationData.description,
            categoryId: category._id,
            order: situationData.order,
            isActive: true
          });
          stats.situations.created++;
          console.log(`   ✅ ${situationData.displayName} (${situationData.arabicName}) - ${situationData.phraseCount} phrases [CREATED]`);
        }
      }

      console.log(); // Empty line between categories
    }

    // Print final summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log('\n📁 Categories:');
    console.log(`   ✅ Created: ${stats.categories.created}`);
    console.log(`   ⏭️  Already existed: ${stats.categories.existing}`);
    console.log(`   📦 Total: ${stats.categories.created + stats.categories.existing}`);

    console.log('\n📝 Situations:');
    console.log(`   ✅ Created: ${stats.situations.created}`);
    console.log(`   ⏭️  Already existed: ${stats.situations.existing}`);
    console.log(`   📦 Total: ${stats.situations.created + stats.situations.existing}`);

    // Calculate total phrase distribution
    console.log('\n📈 Phrase Distribution:');
    categoriesAndSituations.forEach(data => {
      const total = data.situations.reduce((sum, s) => sum + s.phraseCount, 0);
      console.log(`   ${data.category.name}: ${total} phrases`);
    });

    const grandTotal = categoriesAndSituations.reduce((sum, data) => {
      return sum + data.situations.reduce((s, sit) => s + sit.phraseCount, 0);
    }, 0);
    console.log(`   \n   🎯 TOTAL: ${grandTotal} phrases\n`);

    console.log('='.repeat(70));

    return stats;

  } catch (error) {
    console.error('❌ Error setting up categories and situations:', error.message);
    throw error;
  }
}

// Connect to database and run if executed directly
if (require.main === module) {
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/efham';

  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('📦 Connected to MongoDB\n');
      return setupCategoriesAndSituations();
    })
    .then(() => {
      console.log('✅ Setup completed successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupCategoriesAndSituations;
