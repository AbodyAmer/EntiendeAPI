require('dotenv').config();
const mongoose = require('mongoose');
const Phrase = require('../models/Phrase');
const Category = require('../models/Category');
const Situation = require('../models/Situation');

/**
 * Add multiple phrases to the database in batch
 *
 * @param {Array<Object>} phrasesArray - Array of phrase data objects
 * @param {string} categoryName - Category name (e.g., "SOCIAL", "ESSENTIAL")
 * @param {string} situationName - Situation name (e.g., "greetings")
 * @returns {Promise<Object>} - Results summary
 */
async function addPhrasesBatch(phrasesArray, categoryName, situationName) {
    try {
        // Find category
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            throw new Error(`Category "${categoryName}" not found. Please create it first.`);
        }

        // Find situation
        const situation = await Situation.findOne({ name: situationName, categoryId: category._id });
        if (!situation) {
            throw new Error(`Situation "${situationName}" not found in category "${categoryName}". Please create it first.`);
        }

        const results = {
            success: [],
            failed: [],
            total: phrasesArray.length
        };

        console.log(`\n📝 Adding ${phrasesArray.length} phrases to ${categoryName} > ${situationName}...\n`);

        for (let i = 0; i < phrasesArray.length; i++) {
            const phraseData = phrasesArray[i];

            try {
                // Prepare phrase document
                const phraseDocument = {
                    englishTranslation: phraseData.englishTranslation,
                    intent: phraseData.intent,
                    category: category._id,
                    situation: situation._id,
                    context: phraseData.context,
                    variations: phraseData.variations,
                    commonRank: 1000000,
                    hasGenderVariation: phraseData.hasGenderVariation || false,
                    tags: phraseData.tags || [],
                    difficulty: phraseData.difficulty || 'beginner',
                    frequency: phraseData.frequency || 'medium',
                    isActive: true,
                    isApproved: true
                };

                // Add gameContext if provided
                if (phraseData.gameContext) {
                    phraseDocument.gameContext = phraseData.gameContext;
                }

                // Add exercises if provided
                if (phraseData.exercises) {
                    phraseDocument.exercises = phraseData.exercises;
                }

                // Add followUp if provided
                if (phraseData.followUp) {
                    phraseDocument.followUp = phraseData.followUp;
                }

                // Create and save phrase
                const phrase = new Phrase(phraseDocument);
                await phrase.save();

                console.log(`✅ [${i + 1}/${phrasesArray.length}] "${phraseData.englishTranslation}"`);
                results.success.push({
                    id: phrase._id,
                    englishTranslation: phrase.englishTranslation
                });

            } catch (error) {
                console.error(`❌ [${i + 1}/${phrasesArray.length}] Failed: "${phraseData.englishTranslation}"`);
                console.error(`   Error: ${error.message}`);
                results.failed.push({
                    englishTranslation: phraseData.englishTranslation,
                    error: error.message
                });
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Success: ${results.success.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        console.log(`📝 Total: ${results.total}`);
        console.log('='.repeat(60));

        if (results.failed.length > 0) {
            console.log('\n❌ Failed phrases:');
            results.failed.forEach(f => console.log(`   - ${f.englishTranslation}: ${f.error}`));
        }

        return results;

    } catch (error) {
        console.error('❌ Error in batch operation:', error.message);
        throw error;
    }
}

// Connect to database and run if executed directly
if (require.main === module) {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/efham';

    // Example: Replace this array with your phrases
    const phrasesArray = [
  {
    "englishTranslation": "Don’t worry",
    "context": {
      "whenToUse": "Reassuring someone so they don’t worry about a problem.",
      "formality": "informal"
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["comforting", "reassurance", "emotions"],
    "variations": {
      "egyptian": {
        "male": {
          "text": "متقلقش",
          "tashkeelText": "مَا تْقَلَقْش",
          "transliteration": "ma-tqala’ash"
        },
        "female": {
          "text": "متقلقيش",
          "tashkeelText": "مَا تْقَلَقِيش",
          "transliteration": "ma-tqala’eesh"
        }
      },
      "saudi": {
        "male": {
          "text": "لا تشيل هم",
          "tashkeelText": "لَا تْشِيلْ هَمّ",
          "transliteration": "la tsheel hamm"
        },
        "female": {
          "text": "لا تشيلي هم",
          "tashkeelText": "لَا تْشِيلِي هَمّ",
          "transliteration": "la tsheelee hamm"
        }
      }
    }
  },
  {
    "englishTranslation": "It’s okay",
    "context": {
      "whenToUse": "Calming someone and saying the situation is okay.",
      "formality": "informal"
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["comforting", "reassurance"],
    "variations": {
      "egyptian": {
        "neutral": {
          "text": "عادي",
          "tashkeelText": "عَادِي",
          "transliteration": "ʿaadi"
        }
      },
      "saudi": {
        "neutral": {
          "text": "عادي",
          "tashkeelText": "عَادِي",
          "transliteration": "ʿaadi"
        }
      }
    }
  },
  {
    "englishTranslation": "I’m here with you",
    "context": {
      "whenToUse": "Letting someone know you’re with them emotionally.",
      "formality": "informal"
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["support", "comforting"],
    "variations": {
      "egyptian": {
        "male": {
          "text": "أنا معاك",
          "tashkeelText": "أَنَا مَعَاك",
          "transliteration": "ana maʿaak"
        },
        "female": {
          "text": "أنا معاكي",
          "tashkeelText": "أَنَا مَعَاكِي",
          "transliteration": "ana maʿaaki"
        }
      },
      "saudi": {
        "male": {
          "text": "أنا معاك",
          "tashkeelText": "أَنَا مَعَاك",
          "transliteration": "ana maʿaak"
        },
        "female": {
          "text": "أنا معاكي",
          "tashkeelText": "أَنَا مَعَاكِي",
          "transliteration": "ana maʿaaki"
        }
      }
    }
  },
  {
    "englishTranslation": "You’re not alone",
    "context": {
      "whenToUse": "Reassuring someone they are not alone in this.",
      "formality": "informal"
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["comforting", "support"],
    "variations": {
      "saudi": {
        "male": {
          "text": "منت لحالك",
          "tashkeelText": "مَنْتْ لِحَالَك",
          "transliteration": "mant li-haalak"
        },
        "female": {
          "text": "منت لحالك",
          "tashkeelText": "مَنْتْ لِحَالِك",
          "transliteration": "mant li-haalik"
        }
      },
      "egyptian": {
        "male": {
          "text": "إنت مش لوحدك",
          "tashkeelText": "إِنْتَ مِشْ لَوَحْدَك",
          "transliteration": "enta mish lewaḥdak"
        },
        "female": {
          "text": "إنت مش لوحدك",
          "tashkeelText": "إِنْتِ مِشْ لَوَحْدِك",
          "transliteration": "enti mish lewaḥdik"
        }
      }
    }
  },
  {
    "englishTranslation": "It’s not your fault",
    "context": {
      "whenToUse": "Reassuring someone that the mistake isn’t their fault.",
      "formality": "informal"
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["comforting", "reassurance"],
    "variations": {
      "saudi": {
        "male": {
          "text": "ما هي غلطتك",
          "tashkeelText": "مَا هِي غَلْطَتَك",
          "transliteration": "ma hi ghaltatak"
        },
        "female": {
          "text": "ما هي غلطتك",
          "tashkeelText": "مَا هِي غَلْطَتِك",
          "transliteration": "ma hi ghaltatik"
        }
      },
      "egyptian": {
        "male": {
          "text": "دي مش غلطتك",
          "tashkeelText": "دِي مِشْ غَلْطَتَك",
          "transliteration": "di mish ghaltatak"
        },
        "female": {
          "text": "دي مش غلطتك",
          "tashkeelText": "دِي مِشْ غَلْطَتِك",
          "transliteration": "di mish ghaltatik"
        }
      }
    }
  },
  {
    "englishTranslation": "That must be hard",
    "context": {
      "whenToUse": "Showing empathy when someone is going through something hard.",
      "formality": "informal"
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["empathy", "comforting"],
    "variations": {
      "egyptian": {
        "neutral": {
          "text": "أكيد الموضوع صعب",
          "tashkeelText": "أَكِيدْ المَوْضُوعْ صَعْب",
          "transliteration": "akeed el-mawdooʿ saʿb"
        }
      },
      "saudi": {
        "neutral": {
          "text": "أكيد الموضوع صعب",
          "tashkeelText": "أَكِيدْ المَوْضُوعْ صَعْب",
          "transliteration": "akeed el-mawdooʿ saʿb"
        }
      }
    }
  },
  {
    "englishTranslation": "I understand you",
    "context": {
      "whenToUse": "Showing understanding of how someone feels.",
      "formality": "informal"
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["empathy", "comforting"],
    "variations": {
      "egyptian": {
        "male": {
          "text": "فاهمك",
          "tashkeelText": "فَاهِمَك",
          "transliteration": "faahmak"
        },
        "female": {
          "text": "فاهمتك",
          "tashkeelText": "فَاهِمْتِك",
          "transliteration": "faahmitik"
        }
      },
      "saudi": {
        "male": {
          "text": "فاهمك",
          "tashkeelText": "فَاهِمَك",
          "transliteration": "faahmak"
        },
        "female": {
          "text": "فاهمتك",
          "tashkeelText": "فَاهِمْتِك",
          "transliteration": "faahmitik"
        }
      }
    }
  },
  {
    "englishTranslation": "I feel you",
    "context": {
      "whenToUse": "Expressing that you deeply relate to their feelings.",
      "formality": "informal"
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["empathy", "comforting"],
    "variations": {
      "saudi": {
        "male": {
          "text": "حاس فيك",
          "tashkeelText": "حَاسّ فِيك",
          "transliteration": "ḥaass feek"
        },
        "female": {
          "text": "حاسة فيك",
          "tashkeelText": "حَاسَّة فِيك",
          "transliteration": "ḥaassa feek"
        }
      },
      "egyptian": {
        "male": {
          "text": "حاسس بيك",
          "tashkeelText": "حَاسِسْ بِيْك",
          "transliteration": "ḥaases beek"
        },
        "female": {
          "text": "حاسة بيك",
          "tashkeelText": "حَاسَّة بِيْك",
          "transliteration": "ḥaassa beek"
        }
      }
    }
  },
  {
    "englishTranslation": "Everything will be okay",
    "context": {
      "whenToUse": "Reassuring someone that things will turn out okay.",
      "formality": "informal"
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["reassurance", "comforting"],
    "variations": {
      "saudi": {
        "neutral": {
          "text": "كل شيء بيكون تمام",
          "tashkeelText": "كُلّ شَيْ بِيْكُونْ تَمَام",
          "transliteration": "kul shay bikoon tamaam"
        }
      },
      "egyptian": {
        "neutral": {
          "text": "كل حاجة هتبقى كويسة",
          "tashkeelText": "كُلّ حَاجَة هَتِبْقَى كُوَيِّسَة",
          "transliteration": "kul ḥaaga hatib’a kwayyesa"
        }
      }
    }
  },
  {
    "englishTranslation": "Stay strong",
    "context": {
      "whenToUse": "Encouraging someone to stay strong emotionally.",
      "formality": "informal"
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["encouragement", "comforting"],
    "variations": {
      "saudi": {
        "male": {
          "text": "خليك قوي",
          "tashkeelText": "خَلِّيكْ قَوِيّ",
          "transliteration": "khallik qawiyy"
        },
        "female": {
          "text": "خليكي قوية",
          "tashkeelText": "خَلِّيكِي قَوِيَّة",
          "transliteration": "khalliki qawiyya"
        }
      },
      "egyptian": {
        "male": {
          "text": "خليك جامد",
          "tashkeelText": "خَلِّيكْ جَامِد",
          "transliteration": "khallik gaamed"
        },
        "female": {
          "text": "خليكي جامدة",
          "tashkeelText": "خَلِّيكِي جَامِدَة",
          "transliteration": "khalliki gaamda"
        }
      }
    }
  }
]

    const categoryName = 'SOCIAL'; // Change this
    const situationName = ''; // Change this

    if (phrasesArray.length === 0) {
        console.error('❌ No phrases provided. Please add phrases to the phrasesArray.');
        process.exit(1);
    }

    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('📦 Connected to MongoDB');
            console.log('='.repeat(60));
            return addPhrasesBatch(phrasesArray, categoryName, situationName);
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

module.exports = addPhrasesBatch;
