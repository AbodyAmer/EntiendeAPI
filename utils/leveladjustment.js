const Users = require('../models/User');
const ReadHistory = require('../models/ReadHistory');

// Level configuration defining the requirements for each level
const LEVEL_CONFIG = {
    // Beginner Levels (1-5): 1 question, pass 1/1, fail 0/1
    1: { questions: 1, passThreshold: 1, failThreshold: 0 },
    2: { questions: 1, passThreshold: 1, failThreshold: 0 },
    3: { questions: 1, passThreshold: 1, failThreshold: 0 },
    4: { questions: 1, passThreshold: 1, failThreshold: 0 },
    5: { questions: 1, passThreshold: 1, failThreshold: 0, specialTransition: true },
    
    // Elementary Levels (6-8): 2 questions, pass 2/2, fail 0-1/2
    6: { questions: 2, passThreshold: 2, failThreshold: 1 },
    7: { questions: 2, passThreshold: 2, failThreshold: 1 },
    8: { questions: 2, passThreshold: 2, failThreshold: 1, specialTransition: true },
    
    // Intermediate Levels (9-14): 3 questions, pass 2+/3, fail 0-1/3
    9: { questions: 3, passThreshold: 2, failThreshold: 1 },
    10: { questions: 3, passThreshold: 2, failThreshold: 1 },
    11: { questions: 3, passThreshold: 2, failThreshold: 1, specialTransition: true, perfectRequired: true },
    12: { questions: 3, passThreshold: 2, failThreshold: 1 },
    13: { questions: 3, passThreshold: 2, failThreshold: 1 },
    14: { questions: 3, passThreshold: 2, failThreshold: 1, specialTransition: true, perfectRequired: true },
    
    // Advanced Levels (15-19): 4 questions, pass 3+/4, fail 0-1/4
    15: { questions: 4, passThreshold: 3, failThreshold: 1 },
    16: { questions: 4, passThreshold: 3, failThreshold: 1 },
    17: { questions: 4, passThreshold: 3, failThreshold: 1 },
    18: { questions: 4, passThreshold: 3, failThreshold: 1 },
    19: { questions: 4, passThreshold: 3, failThreshold: 1 }
};

// Constants for level limits
const MIN_LEVEL = 1;
const MAX_LEVEL = 19;

// Helper function to check if activity passes the level criteria
const activityPassed = (readHistory, level) => {
    const config = LEVEL_CONFIG[level];
    if (!config) return false;
    
    // Get correct answers count
    const correctCount = countCorrectAnswers(readHistory.answers);
    
    // Check if the score meets the pass threshold
    const isPassed = correctCount >= config.passThreshold;
    
    // For special transitions that require perfect scores
    if (config.specialTransition && config.perfectRequired) {
        return correctCount === config.questions; // Perfect score required
    }
    
    return isPassed;
};

// Helper function to check if activity fails the level criteria
const activityFailed = (readHistory, level) => {
    const config = LEVEL_CONFIG[level];
    if (!config) return false;
    
    // Get correct answers count
    const correctCount = countCorrectAnswers(readHistory.answers);
    
    // Check if the score is below or equal to the fail threshold
    return correctCount <= config.failThreshold;
};

/**
 * Helper function to count correct answers in an activity
 * @param {Array} answers - The answers array from ReadHistory
 * @returns {number} - The count of correct answers
 */
const countCorrectAnswers = (answers) => {
    if (!answers || !Array.isArray(answers)) return 0;
    
    let correctCount = 0;
    
    answers.forEach(answer => {
        if (!answer.options || !Array.isArray(answer.options)) return;
        
        // Find the correct option
        const correctOption = answer.options.find(option => option.correct === true);
        if (!correctOption) return;
        
        // Check if user selected the correct answer
        if (answer.answered === correctOption._id) {
            correctCount++;
        }
    });
    
    return correctCount;
};

/**
 * Adjusts a user's level based on their recent quiz performance
 * @param {string} userId - The user ID to adjust level for
 * @returns {Object|null} The updated user or null if user not found
 */
const adjustLevel = async (userId) => {
    const user = await Users.findById(userId);
    if (!user) {
        return null;
    }
    
    const currentLevel = user.level || MIN_LEVEL;
    
    // Get recent activity history for this user, sorted by most recent first
    const recentActivity = await ReadHistory.find({ 
        userId: userId,
        ended: true // Only consider completed activities
    }).sort({ readAt: -1 }).limit(3); // We need at most 3 for our rules
    
    if (recentActivity.length === 0) {
        return user; // No activities to evaluate
    }
    
    // Filter activities at current level (we only compare activities at the same level)
    const currentLevelActivity = recentActivity.filter(activity => activity.level === currentLevel);
    
    // Check for 2 consecutive passes to level up
    if (currentLevelActivity.length >= 2 && 
        activityPassed(currentLevelActivity[0], currentLevel) && 
        activityPassed(currentLevelActivity[1], currentLevel)) {
        
        // Special transition check (requires 2 consecutive passes at certain levels)
        const config = LEVEL_CONFIG[currentLevel];
        if (config.specialTransition) {
            // For special transitions, both passes need to meet criteria
            if (config.perfectRequired) {
                // Need perfect scores at level 11->12 and 14->15
                const perfectScore1 = countCorrectAnswers(currentLevelActivity[0].answers) === config.questions;
                const perfectScore2 = countCorrectAnswers(currentLevelActivity[1].answers) === config.questions;
                
                if (perfectScore1 && perfectScore2) {
                    // Level up if both have perfect scores
                    user.level = Math.min(currentLevel + 1, MAX_LEVEL);
                    await user.save();
                }
            } else {
                // For level 5->6 and 8->9, just need 2 consecutive 100% passes
                user.level = Math.min(currentLevel + 1, MAX_LEVEL);
                await user.save();
            }
        } else {
            // Normal level up for non-special transitions
            user.level = Math.min(currentLevel + 1, MAX_LEVEL);
            await user.save();
        }
    }
    
    // Check for 3 consecutive fails to level down
    if (currentLevelActivity.length >= 3 && 
        activityFailed(currentLevelActivity[0], currentLevel) && 
        activityFailed(currentLevelActivity[1], currentLevel) && 
        activityFailed(currentLevelActivity[2], currentLevel)) {
        
        user.level = Math.max(currentLevel - 1, MIN_LEVEL);
        await user.save();
    }
    
    return user;
};

module.exports = {
    adjustLevel,
    LEVEL_CONFIG,
    MIN_LEVEL,
    MAX_LEVEL
};