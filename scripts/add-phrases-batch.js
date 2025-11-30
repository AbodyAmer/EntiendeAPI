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
    "englishTranslation": "Can I have a fork?",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "When asking waiter for a fork at restaurant",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "ممكن شوكة؟",
          "tashkeelText": "مُمْكِن شَوْكَة؟",
          "transliteration": "mumkin shawka?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "ممكن شوكة؟",
          "tashkeelText": "مُمْكِن شَوْكَة؟",
          "transliteration": "mumkin shawka?"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "ممكن _____؟",
          "displaySentenceTashkeel": "مُمْكِن _____؟",
          "displaySentenceTransliteration": "mumkin _____?",
          "blankWords": [
            {
              "word": "شوكة",
              "tashkeelWord": "شَوْكَة",
              "transliteration": "shawka",
              "isCorrect": true
            },
            {
              "word": "معلقة",
              "tashkeelWord": "مَعْلَقَة",
              "transliteration": "ma3la2a",
              "isCorrect": false
            },
            {
              "word": "سكينة",
              "tashkeelWord": "سِكِّينَة",
              "transliteration": "sikkeena",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "ممكن _____؟",
          "displaySentenceTashkeel": "مُمْكِن _____؟",
          "displaySentenceTransliteration": "mumkin _____?",
          "blankWords": [
            {
              "word": "شوكة",
              "tashkeelWord": "شَوْكَة",
              "transliteration": "shawka",
              "isCorrect": true
            },
            {
              "word": "ملعقة",
              "tashkeelWord": "مِلْعَقَة",
              "transliteration": "mil3aqa",
              "isCorrect": false
            },
            {
              "word": "سكينة",
              "tashkeelWord": "سِكِّينَة",
              "transliteration": "sikkeena",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["restaurant", "utensils", "request"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Here or takeaway?",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Waiter asking if you'll eat at restaurant or takeaway",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "هنا ولا تيك أواي؟",
          "tashkeelText": "هِنَا وَلّا تِيك أَوَاي؟",
          "transliteration": "hena walla take away?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "هنا ولا سفري؟",
          "tashkeelText": "هِنَا وَلّا سَفْرِي؟",
          "transliteration": "hena walla safari?"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "هنا ولا _____؟",
          "displaySentenceTashkeel": "هِنَا وَلّا _____؟",
          "displaySentenceTransliteration": "hena walla _____?",
          "blankWords": [
            {
              "word": "تيك أواي",
              "tashkeelWord": "تِيك أَوَاي",
              "transliteration": "take away",
              "isCorrect": true
            },
            {
              "word": "توصيل",
              "tashkeelWord": "تَوْصِيل",
              "transliteration": "tawseel",
              "isCorrect": false
            },
            {
              "word": "جوه",
              "tashkeelWord": "جُوَّه",
              "transliteration": "guwwa",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "هنا ولا _____؟",
          "displaySentenceTashkeel": "هِنَا وَلّا _____؟",
          "displaySentenceTransliteration": "hena walla _____?",
          "blankWords": [
            {
              "word": "سفري",
              "tashkeelWord": "سَفْرِي",
              "transliteration": "safari",
              "isCorrect": true
            },
            {
              "word": "توصيل",
              "tashkeelWord": "تَوْصِيل",
              "transliteration": "tawseel",
              "isCorrect": false
            },
            {
              "word": "داخل",
              "tashkeelWord": "دَاخِل",
              "transliteration": "dakhil",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["restaurant", "ordering", "question"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Takeaway, please",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Telling waiter you want takeaway, not eating at restaurant",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "تيك أواي لو سمحت",
          "tashkeelText": "تِيك أَوَاي لَوْ سَمَحْت",
          "transliteration": "take away law sama7t"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "سفري، لو سمحت",
          "tashkeelText": "سَفْرِي، لَوْ سَمَحْت",
          "transliteration": "safari, law sama7t"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ لو سمحت",
          "displaySentenceTashkeel": "_____ لَوْ سَمَحْت",
          "displaySentenceTransliteration": "_____ law sama7t",
          "blankWords": [
            {
              "word": "تيك أواي",
              "tashkeelWord": "تِيك أَوَاي",
              "transliteration": "take away",
              "isCorrect": true
            },
            {
              "word": "توصيل",
              "tashkeelWord": "تَوْصِيل",
              "transliteration": "tawseel",
              "isCorrect": false
            },
            {
              "word": "هنا",
              "tashkeelWord": "هِنَا",
              "transliteration": "hena",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____، لو سمحت",
          "displaySentenceTashkeel": "_____، لَوْ سَمَحْت",
          "displaySentenceTransliteration": "_____, law sama7t",
          "blankWords": [
            {
              "word": "سفري",
              "tashkeelWord": "سَفْرِي",
              "transliteration": "safari",
              "isCorrect": true
            },
            {
              "word": "توصيل",
              "tashkeelWord": "تَوْصِيل",
              "transliteration": "tawseel",
              "isCorrect": false
            },
            {
              "word": "هنا",
              "tashkeelWord": "هِنَا",
              "transliteration": "hena",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["restaurant", "ordering", "request"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I didn't order this",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "When waiter brings wrong dish to your table",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أنا ما طلبتش ده",
          "tashkeelText": "أَنَا مَا طَلَبْتِش دَه",
          "transliteration": "ana ma talabteesh da"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أنا ما طلبت هذا",
          "tashkeelText": "أَنَا مَا طَلَبْت هَذَا",
          "transliteration": "ana ma talabat hadha"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا ما _____ ده",
          "displaySentenceTashkeel": "أَنَا مَا _____ دَه",
          "displaySentenceTransliteration": "ana ma _____ da",
          "blankWords": [
            {
              "word": "طلبتش",
              "tashkeelWord": "طَلَبْتِش",
              "transliteration": "talabteesh",
              "isCorrect": true
            },
            {
              "word": "أكلتش",
              "tashkeelWord": "أَكَلْتِش",
              "transliteration": "akalteesh",
              "isCorrect": false
            },
            {
              "word": "شفتش",
              "tashkeelWord": "شُفْتِش",
              "transliteration": "shufteesh",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا ما _____ هذا",
          "displaySentenceTashkeel": "أَنَا مَا _____ هَذَا",
          "displaySentenceTransliteration": "ana ma _____ hadha",
          "blankWords": [
            {
              "word": "طلبت",
              "tashkeelWord": "طَلَبْت",
              "transliteration": "talabat",
              "isCorrect": true
            },
            {
              "word": "أكلت",
              "tashkeelWord": "أَكَلْت",
              "transliteration": "akalat",
              "isCorrect": false
            },
            {
              "word": "شفت",
              "tashkeelWord": "شُفْت",
              "transliteration": "shuft",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["restaurant", "problem", "correction"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I want rice with chicken",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Ordering your meal at restaurant, specifying rice and chicken",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "عايز رز و فراخ",
          "tashkeelText": "عَايِز رُز وْ فِرَاخ",
          "transliteration": "3ayez roz w ferakh"
        },
        "female": {
          "text": "عايزة رز و فراخ",
          "tashkeelText": "عَايْزَة رُز وْ فِرَاخ",
          "transliteration": "3ayza roz w ferakh"
        },
        "neutral": null
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أبغى رز و دجاج",
          "tashkeelText": "أَبْغَى رُز وْ دَجَاج",
          "transliteration": "abgha roz w dajaj"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "عايز _____ و فراخ",
          "displaySentenceTashkeel": "عَايِز _____ وْ فِرَاخ",
          "displaySentenceTransliteration": "3ayez _____ w ferakh",
          "blankWords": [
            {
              "word": "رز",
              "tashkeelWord": "رُز",
              "transliteration": "roz",
              "isCorrect": true
            },
            {
              "word": "عيش",
              "tashkeelWord": "عِيش",
              "transliteration": "3eesh",
              "isCorrect": false
            },
            {
              "word": "مكرونة",
              "tashkeelWord": "مَكْرُونَة",
              "transliteration": "makrona",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "عايزة _____ و فراخ",
          "displaySentenceTashkeel": "عَايْزَة _____ وْ فِرَاخ",
          "displaySentenceTransliteration": "3ayza _____ w ferakh",
          "blankWords": [
            {
              "word": "رز",
              "tashkeelWord": "رُز",
              "transliteration": "roz",
              "isCorrect": true
            },
            {
              "word": "عيش",
              "tashkeelWord": "عِيش",
              "transliteration": "3eesh",
              "isCorrect": false
            },
            {
              "word": "مكرونة",
              "tashkeelWord": "مَكْرُونَة",
              "transliteration": "makrona",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أبغى _____ و دجاج",
          "displaySentenceTashkeel": "أَبْغَى _____ وْ دَجَاج",
          "displaySentenceTransliteration": "abgha _____ w dajaj",
          "blankWords": [
            {
              "word": "رز",
              "tashkeelWord": "رُز",
              "transliteration": "roz",
              "isCorrect": true
            },
            {
              "word": "خبز",
              "tashkeelWord": "خُبْز",
              "transliteration": "khubz",
              "isCorrect": false
            },
            {
              "word": "مكرونة",
              "tashkeelWord": "مَكْرُونَة",
              "transliteration": "makrona",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["restaurant", "ordering", "food"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "One french fries",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Ordering one portion of french fries at restaurant",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "واحد بطاطس مقلية",
          "tashkeelText": "وَاحِد بَطَاطِس مَقْلِيَّة",
          "transliteration": "wa7ed batates ma2liyya"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "واحد بطاطس مقلي",
          "tashkeelText": "وَاحِد بَطَاطِس مَقْلِي",
          "transliteration": "wa7ed batates ma2li"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "واحد _____",
          "displaySentenceTashkeel": "وَاحِد _____",
          "displaySentenceTransliteration": "wa7ed _____",
          "blankWords": [
            {
              "word": "بطاطس مقلية",
              "tashkeelWord": "بَطَاطِس مَقْلِيَّة",
              "transliteration": "batates ma2liyya",
              "isCorrect": true
            },
            {
              "word": "رز",
              "tashkeelWord": "رُز",
              "transliteration": "roz",
              "isCorrect": false
            },
            {
              "word": "سلطة",
              "tashkeelWord": "سَلَطَة",
              "transliteration": "salata",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "واحد _____",
          "displaySentenceTashkeel": "وَاحِد _____",
          "displaySentenceTransliteration": "wa7ed _____",
          "blankWords": [
            {
              "word": "بطاطس مقلي",
              "tashkeelWord": "بَطَاطِس مَقْلِي",
              "transliteration": "batates ma2li",
              "isCorrect": true
            },
            {
              "word": "رز",
              "tashkeelWord": "رُز",
              "transliteration": "roz",
              "isCorrect": false
            },
            {
              "word": "سلطة",
              "tashkeelWord": "سَلَطَة",
              "transliteration": "salata",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "high",
    "tags": ["restaurant", "ordering", "food"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I want vegetable soup",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Ordering vegetable soup as starter or main dish",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "عايز شوربة خضار",
          "tashkeelText": "عَايِز شُوْرْبَة خُضَار",
          "transliteration": "3ayez shorbet khodar"
        },
        "female": {
          "text": "عايزة شوربة خضار",
          "tashkeelText": "عَايْزَة شُوْرْبَة خُضَار",
          "transliteration": "3ayza shorbet khodar"
        },
        "neutral": null
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أبغى شوربة خضار",
          "tashkeelText": "أَبْغَى شُوْرْبَة خُضَار",
          "transliteration": "abgha shorbat khodar"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "عايز _____",
          "displaySentenceTashkeel": "عَايِز _____",
          "displaySentenceTransliteration": "3ayez _____",
          "blankWords": [
            {
              "word": "شوربة خضار",
              "tashkeelWord": "شُوْرْبَة خُضَار",
              "transliteration": "shorbet khodar",
              "isCorrect": true
            },
            {
              "word": "شوربة فراخ",
              "tashkeelWord": "شُوْرْبَة فِرَاخ",
              "transliteration": "shorbet ferakh",
              "isCorrect": false
            },
            {
              "word": "سلطة",
              "tashkeelWord": "سَلَطَة",
              "transliteration": "salata",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "عايزة _____",
          "displaySentenceTashkeel": "عَايْزَة _____",
          "displaySentenceTransliteration": "3ayza _____",
          "blankWords": [
            {
              "word": "شوربة خضار",
              "tashkeelWord": "شُوْرْبَة خُضَار",
              "transliteration": "shorbet khodar",
              "isCorrect": true
            },
            {
              "word": "شوربة فراخ",
              "tashkeelWord": "شُوْرْبَة فِرَاخ",
              "transliteration": "shorbet ferakh",
              "isCorrect": false
            },
            {
              "word": "سلطة",
              "tashkeelWord": "سَلَطَة",
              "transliteration": "salata",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أبغى _____",
          "displaySentenceTashkeel": "أَبْغَى _____",
          "displaySentenceTransliteration": "abgha _____",
          "blankWords": [
            {
              "word": "شوربة خضار",
              "tashkeelWord": "شُوْرْبَة خُضَار",
              "transliteration": "shorbat khodar",
              "isCorrect": true
            },
            {
              "word": "شوربة دجاج",
              "tashkeelWord": "شُوْرْبَة دَجَاج",
              "transliteration": "shorbat dajaj",
              "isCorrect": false
            },
            {
              "word": "سلطة",
              "tashkeelWord": "سَلَطَة",
              "transliteration": "salata",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["restaurant", "ordering", "soup"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Eat with your right hand",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Cultural advice about eating manners in Arab culture",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "كُل بإيدك اليمين",
          "tashkeelText": "كُلْ بِإِيدَك اليَمِين",
          "transliteration": "kol b-eedak el yameen"
        },
        "female": {
          "text": "كُلي بإيدك اليمين",
          "tashkeelText": "كُلِي بِإِيدِك اليَمِين",
          "transliteration": "koli b-eedek el yameen"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "كُل بيدك اليمين",
          "tashkeelText": "كُلْ بِيَدَك اليَمِين",
          "transliteration": "kol b-yadak el yameen"
        },
        "female": {
          "text": "كُلي بيدك اليمين",
          "tashkeelText": "كُلِي بِيَدِك اليَمِين",
          "transliteration": "koli b-yadek el yameen"
        },
        "neutral": null
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "_____ بإيدك اليمين",
          "displaySentenceTashkeel": "_____ بِإِيدَك اليَمِين",
          "displaySentenceTransliteration": "_____ b-eedak el yameen",
          "blankWords": [
            {
              "word": "كُل",
              "tashkeelWord": "كُلْ",
              "transliteration": "kol",
              "isCorrect": true
            },
            {
              "word": "اشرب",
              "tashkeelWord": "اِشْرَب",
              "transliteration": "eshrab",
              "isCorrect": false
            },
            {
              "word": "امسك",
              "tashkeelWord": "اِمْسِك",
              "transliteration": "emsek",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "_____ بإيدك اليمين",
          "displaySentenceTashkeel": "_____ بِإِيدِك اليَمِين",
          "displaySentenceTransliteration": "_____ b-eedek el yameen",
          "blankWords": [
            {
              "word": "كُلي",
              "tashkeelWord": "كُلِي",
              "transliteration": "koli",
              "isCorrect": true
            },
            {
              "word": "اشربي",
              "tashkeelWord": "اِشْرَبِي",
              "transliteration": "eshrabi",
              "isCorrect": false
            },
            {
              "word": "امسكي",
              "tashkeelWord": "اِمْسِكِي",
              "transliteration": "emseki",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "_____ بيدك اليمين",
          "displaySentenceTashkeel": "_____ بِيَدَك اليَمِين",
          "displaySentenceTransliteration": "_____ b-yadak el yameen",
          "blankWords": [
            {
              "word": "كُل",
              "tashkeelWord": "كُلْ",
              "transliteration": "kol",
              "isCorrect": true
            },
            {
              "word": "اشرب",
              "tashkeelWord": "اِشْرَب",
              "transliteration": "eshrab",
              "isCorrect": false
            },
            {
              "word": "امسك",
              "tashkeelWord": "اِمْسِك",
              "transliteration": "emsek",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "_____ بيدك اليمين",
          "displaySentenceTashkeel": "_____ بِيَدِك اليَمِين",
          "displaySentenceTransliteration": "_____ b-yadek el yameen",
          "blankWords": [
            {
              "word": "كُلي",
              "tashkeelWord": "كُلِي",
              "transliteration": "koli",
              "isCorrect": true
            },
            {
              "word": "اشربي",
              "tashkeelWord": "اِشْرَبِي",
              "transliteration": "eshrabi",
              "isCorrect": false
            },
            {
              "word": "امسكي",
              "tashkeelWord": "اِمْسِكِي",
              "transliteration": "emseki",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": true,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["restaurant", "culture", "manners"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "The food is a lot",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Commenting when portion size is very large or too much",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "الأكل كتير",
          "tashkeelText": "الأَكْل كِتِير",
          "transliteration": "el akl keteer"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "الأكل كثير",
          "tashkeelText": "الأَكْل كَثِير",
          "transliteration": "el akl katheer"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ كتير",
          "displaySentenceTashkeel": "_____ كِتِير",
          "displaySentenceTransliteration": "_____ keteer",
          "blankWords": [
            {
              "word": "الأكل",
              "tashkeelWord": "الأَكْل",
              "transliteration": "el akl",
              "isCorrect": true
            },
            {
              "word": "الميه",
              "tashkeelWord": "المِيَّه",
              "transliteration": "el mayya",
              "isCorrect": false
            },
            {
              "word": "الناس",
              "tashkeelWord": "النَّاس",
              "transliteration": "el nas",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ كثير",
          "displaySentenceTashkeel": "_____ كَثِير",
          "displaySentenceTransliteration": "_____ katheer",
          "blankWords": [
            {
              "word": "الأكل",
              "tashkeelWord": "الأَكْل",
              "transliteration": "el akl",
              "isCorrect": true
            },
            {
              "word": "الماء",
              "tashkeelWord": "المَاء",
              "transliteration": "el ma'",
              "isCorrect": false
            },
            {
              "word": "الناس",
              "tashkeelWord": "النَّاس",
              "transliteration": "el nas",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["restaurant", "quantity", "comment"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "My favorite dish is pasta",
    "category": "ESSENTIAL",
    "situation": "Restaurant & Food",
    "impact": "high",
    "context": {
      "whenToUse": "Tell your favorite food",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أكلتي المفضلة مكرونة",
          "tashkeelText": "أَكْلَتِي المُفَضَّلَة مَكْرُونَة",
          "transliteration": "aklati el mofaddala makrona"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أكلتي المفضلة مكرونة",
          "tashkeelText": "أَكْلَتِي المُفَضَّلَة مَكْرُونَة",
          "transliteration": "aklati el mofaddala makrona"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أكلتي المفضلة _____",
          "displaySentenceTashkeel": "أَكْلَتِي المُفَضَّلَة _____",
          "displaySentenceTransliteration": "aklati el mofaddala _____",
          "blankWords": [
            {
              "word": "مكرونة",
              "tashkeelWord": "مَكْرُونَة",
              "transliteration": "makrona",
              "isCorrect": true
            },
            {
              "word": "رز",
              "tashkeelWord": "رُز",
              "transliteration": "roz",
              "isCorrect": false
            },
            {
              "word": "فراخ",
              "tashkeelWord": "فِرَاخ",
              "transliteration": "ferakh",
              "isCorrect": false
            }
          ]
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أكلتي المفضلة _____",
          "displaySentenceTashkeel": "أَكْلَتِي المُفَضَّلَة _____",
          "displaySentenceTransliteration": "aklati el mofaddala _____",
          "blankWords": [
            {
              "word": "مكرونة",
              "tashkeelWord": "مَكْرُونَة",
              "transliteration": "makrona",
              "isCorrect": true
            },
            {
              "word": "رز",
              "tashkeelWord": "رُز",
              "transliteration": "roz",
              "isCorrect": false
            },
            {
              "word": "دجاج",
              "tashkeelWord": "دَجَاج",
              "transliteration": "dajaj",
              "isCorrect": false
            }
          ]
        }
      ],
      "msa": []
    },
    "hasGenderVariation": false,
    "difficulty": "beginner",
    "frequency": "medium",
    "tags": ["restaurant", "preference", "food"],
    "isActive": true,
    "isApproved": true
  }
]
    const categoryName = 'ESSENTIAL'; // Change this
    const situationName = 'restaurant-food'; // Change this

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
