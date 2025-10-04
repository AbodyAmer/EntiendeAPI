require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
    {
        name: 'ESSENTIAL',
        displayName: 'Essential',
        description: 'Survival phrases for essential daily situations. Master these first for basic communication.',
        icon: '🎯',
        order: 1,
        isActive: true
    },
    {
        name: 'SOCIAL',
        displayName: 'Social',
        description: 'Integration phrases for building relationships and social interactions.',
        icon: '👥',
        order: 2,
        isActive: true
    },
    {
        name: 'CULTURAL',
        displayName: 'Cultural',
        description: 'Deep integration phrases for cultural events and traditional occasions.',
        icon: '🕌',
        order: 3,
        isActive: true
    }
];

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('✓ Cleared existing categories');

        // Insert new categories
        const result = await Category.insertMany(categories);
        console.log(`✓ Inserted ${result.length} categories:`);

        result.forEach(cat => {
            console.log(`  ${cat.icon} ${cat.displayName} (${cat.name})`);
        });

        console.log('\n✅ Categories seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding categories:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✓ Database connection closed');
        process.exit(0);
    }
};

seedCategories();
