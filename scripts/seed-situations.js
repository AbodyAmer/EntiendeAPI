require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

const situationsData = [
    // ESSENTIAL Category
    {
        categoryName: 'ESSENTIAL',
        name: 'Airport',
        displayName: 'Airport',
        arabicName: 'المطار',
        description: 'Navigate immigration, customs, baggage claim, and flight information',
        icon: '✈️',
        order: 1,
        tags: ['travel', 'immigration', 'flight', 'essential']
    },
    {
        categoryName: 'ESSENTIAL',
        name: 'Restaurant',
        displayName: 'Restaurant',
        arabicName: 'المطعم',
        description: 'Order food, ask about menu items, request the bill, and compliment meals',
        icon: '🍽️',
        order: 2,
        tags: ['food', 'dining', 'ordering', 'essential']
    },
    {
        categoryName: 'ESSENTIAL',
        name: 'Shopping',
        displayName: 'Shopping',
        arabicName: 'التسوق',
        description: 'Ask about prices, negotiate, try things on, and make purchases',
        icon: '🛒',
        order: 3,
        tags: ['shopping', 'market', 'bargaining', 'essential']
    },
    {
        categoryName: 'ESSENTIAL',
        name: 'Emergency',
        displayName: 'Emergency',
        arabicName: 'طوارئ',
        description: 'Get help in medical, safety, or urgent situations',
        icon: '🚨',
        order: 4,
        tags: ['emergency', 'medical', 'help', 'urgent', 'essential']
    },
    {
        categoryName: 'ESSENTIAL',
        name: 'Transportation',
        displayName: 'Transportation',
        arabicName: 'المواصلات',
        description: 'Use taxis, buses, trains, and give/receive directions',
        icon: '🚕',
        order: 5,
        tags: ['transport', 'taxi', 'directions', 'essential']
    },
    // SOCIAL Category
    {
        categoryName: 'SOCIAL',
        name: 'Greetings & Small Talk',
        displayName: 'Greetings & Small Talk',
        arabicName: 'التحيات والمحادثات القصيرة',
        description: 'Greet people, ask how they are, make polite conversation',
        icon: '👋',
        order: 1,
        tags: ['greetings', 'hello', 'conversation', 'social']
    },
    {
        categoryName: 'SOCIAL',
        name: 'Making Friends',
        displayName: 'Making Friends',
        arabicName: 'تكوين صداقات',
        description: 'Introduce yourself, exchange contact info, make plans to meet',
        icon: '🤝',
        order: 2,
        tags: ['friends', 'introductions', 'socializing', 'social']
    },
    // CULTURAL Category
    {
        categoryName: 'CULTURAL',
        name: 'Weddings',
        displayName: 'Weddings',
        arabicName: 'الأفراح',
        description: 'Congratulate the couple, navigate wedding customs, socialize appropriately',
        icon: '💍',
        order: 1,
        tags: ['wedding', 'celebration', 'marriage', 'cultural']
    },
    {
        categoryName: 'CULTURAL',
        name: 'Religious Settings',
        displayName: 'Religious Settings',
        arabicName: 'الأماكن الدينية',
        description: 'Visit mosques, participate in prayers, show appropriate respect',
        icon: '🕌',
        order: 2,
        tags: ['mosque', 'prayer', 'religious', 'cultural']
    },
    {
        categoryName: 'CULTURAL',
        name: 'Family Gatherings',
        displayName: 'Family Gatherings',
        arabicName: 'التجمعات العائلية',
        description: 'Navigate family events, show respect to elders, interact appropriately',
        icon: '👨‍👩‍👧‍👦',
        order: 3,
        tags: ['family', 'gatherings', 'relatives', 'cultural']
    },
    {
        categoryName: 'CULTURAL',
        name: 'Holidays',
        displayName: 'Holidays',
        arabicName: 'الأعياد',
        description: 'Celebrate Eid, Ramadan, and other cultural holidays appropriately',
        icon: '🌙',
        order: 4,
        tags: ['eid', 'ramadan', 'holidays', 'celebration', 'cultural']
    }
];

const seedSituations = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Get all categories
        const categories = await Category.find({});
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        console.log('✓ Found categories:', Object.keys(categoryMap));

        // Clear existing situations
        await Situation.deleteMany({});
        console.log('✓ Cleared existing situations');

        // Prepare situations with category IDs
        const situations = situationsData.map(sit => ({
            categoryId: categoryMap[sit.categoryName],
            name: sit.name,
            displayName: sit.displayName,
            arabicName: sit.arabicName,
            description: sit.description,
            icon: sit.icon,
            order: sit.order,
            phraseCount: 0,
            isActive: true,
            tags: sit.tags
        }));

        // Insert situations
        const result = await Situation.insertMany(situations);
        console.log(`✓ Inserted ${result.length} situations\n`);

        // Display by category
        console.log('📋 Situations by Category:\n');

        for (const category of categories) {
            const catSituations = result.filter(s => s.categoryId.toString() === category._id.toString());
            console.log(`${category.icon} ${category.displayName.toUpperCase()}`);
            catSituations.forEach(sit => {
                console.log(`  ${sit.icon} ${sit.displayName} (${sit.arabicName})`);
            });
            console.log('');
        }

        console.log('✅ Situations seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding situations:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✓ Database connection closed');
        process.exit(0);
    }
};

seedSituations();
