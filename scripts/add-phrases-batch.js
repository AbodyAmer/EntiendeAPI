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
    "englishTranslation": "I broke my arm",
    "context": {
      "whenToUse": "Telling medical staff you broke a bone",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "كسرت إيدي",
          "tashkeelText": "كَسَرْت إِيدِي",
          "transliteration": "kasart eedi"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "كسرت يدي",
          "tashkeelText": "كَسَرْت يَدِي",
          "transliteration": "kasart yadi"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____ إيدي",
          "displaySentenceTashkeel": "_____ إِيدِي",
          "displaySentenceTransliteration": "_____ eedi",
          "blankWords": [
            {
              "word": "كسرت",
              "tashkeelWord": "كَسَرْت",
              "transliteration": "kasart",
              "isCorrect": true
            },
            {
              "word": "وقعت",
              "tashkeelWord": "وَقَعْت",
              "transliteration": "we'e't",
              "isCorrect": false
            },
            {
              "word": "حرقت",
              "tashkeelWord": "حَرَقْت",
              "transliteration": "haraqt",
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
          "displaySentence": "_____ يدي",
          "displaySentenceTashkeel": "_____ يَدِي",
          "displaySentenceTransliteration": "_____ yadi",
          "blankWords": [
            {
              "word": "كسرت",
              "tashkeelWord": "كَسَرْت",
              "transliteration": "kasart",
              "isCorrect": true
            },
            {
              "word": "طحت",
              "tashkeelWord": "طِحْت",
              "transliteration": "taht",
              "isCorrect": false
            },
            {
              "word": "حرقت",
              "tashkeelWord": "حَرَقْت",
              "transliteration": "haraqt",
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
    "tags": ["emergency", "medical", "injury", "bone", "fracture"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I burned myself",
    "context": {
      "whenToUse": "Explaining you got burned and need treatment",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "انا اتحرقت",
          "tashkeelText": "أَنَا اتْحَرَقْت",
          "transliteration": "ana etharaqt"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "انحرقت",
          "tashkeelText": "انْحَرَقْت",
          "transliteration": "inharaqt"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا _____",
          "displaySentenceTashkeel": "أَنَا _____",
          "displaySentenceTransliteration": "ana _____",
          "blankWords": [
            {
              "word": "اتحرقت",
              "tashkeelWord": "اتْحَرَقْت",
              "transliteration": "etharaqt",
              "isCorrect": true
            },
            {
              "word": "اتجرحت",
              "tashkeelWord": "اتْجَرَحْت",
              "transliteration": "etgaraht",
              "isCorrect": false
            },
            {
              "word": "اتكسرت",
              "tashkeelWord": "اتْكَسَرْت",
              "transliteration": "etkasart",
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
          "displaySentence": "_____",
          "displaySentenceTashkeel": "_____",
          "displaySentenceTransliteration": "_____",
          "blankWords": [
            {
              "word": "انحرقت",
              "tashkeelWord": "انْحَرَقْت",
              "transliteration": "inharaqt",
              "isCorrect": true
            },
            {
              "word": "انجرحت",
              "tashkeelWord": "انْجَرَحْت",
              "transliteration": "injaraht",
              "isCorrect": false
            },
            {
              "word": "انكسرت",
              "tashkeelWord": "انْكَسَرْت",
              "transliteration": "inkasart",
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
    "tags": ["emergency", "medical", "injury", "burn"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm bleeding",
    "context": {
      "whenToUse": "Alerting someone you're bleeding from injury",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أنا بنزف",
          "tashkeelText": "أَنَا بَنْزِف",
          "transliteration": "ana banzif"
        }
      },
      "saudi": {
        "male": {
          "text": "جالس أنزف",
          "tashkeelText": "جَالِس أَنْزِف",
          "transliteration": "jaalis anzif"
        },
        "female": {
          "text": "جالسة أنزف",
          "tashkeelText": "جَالِسَة أَنْزِف",
          "transliteration": "jaalsa anzif"
        },
        "neutral": null
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا _____",
          "displaySentenceTashkeel": "أَنَا _____",
          "displaySentenceTransliteration": "ana _____",
          "blankWords": [
            {
              "word": "بنزف",
              "tashkeelWord": "بَنْزِف",
              "transliteration": "banzif",
              "isCorrect": true
            },
            {
              "word": "برجع",
              "tashkeelWord": "بَرْجَع",
              "transliteration": "batraga'",
              "isCorrect": false
            },
            {
              "word": "بتعب",
              "tashkeelWord": "بَتْعَب",
              "transliteration": "bat'ab",
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
          "displaySentence": "جالس _____",
          "displaySentenceTashkeel": "جَالِس _____",
          "displaySentenceTransliteration": "jaalis _____",
          "blankWords": [
            {
              "word": "أنزف",
              "tashkeelWord": "أَنْزِف",
              "transliteration": "anzif",
              "isCorrect": true
            },
            {
              "word": "أستفرغ",
              "tashkeelWord": "أَسْتَفْرِغ",
              "transliteration": "astafrighh",
              "isCorrect": false
            },
            {
              "word": "أتعب",
              "tashkeelWord": "أَتْعَب",
              "transliteration": "at'ab",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "جالسة _____",
          "displaySentenceTashkeel": "جَالِسَة _____",
          "displaySentenceTransliteration": "jaalsa _____",
          "blankWords": [
            {
              "word": "أنزف",
              "tashkeelWord": "أَنْزِف",
              "transliteration": "anzif",
              "isCorrect": true
            },
            {
              "word": "أستفرغ",
              "tashkeelWord": "أَسْتَفْرِغ",
              "transliteration": "astafrighh",
              "isCorrect": false
            },
            {
              "word": "أتعب",
              "tashkeelWord": "أَتْعَب",
              "transliteration": "at'ab",
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
    "tags": ["emergency", "medical", "injury", "blood"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Where is the pharmacy?",
    "context": {
      "whenToUse": "Asking for pharmacy location to get medicine",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "فين الصيدلية؟",
          "tashkeelText": "فِين الصَّيْدَلِيَّة؟",
          "transliteration": "feen el-saydaleyya?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "وين الصيدلية؟",
          "tashkeelText": "وِين الصَّيْدَلِيَّة؟",
          "transliteration": "wayn as-saydaliyya?"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "فين _____؟",
          "displaySentenceTashkeel": "فِين _____؟",
          "displaySentenceTransliteration": "feen _____?",
          "blankWords": [
            {
              "word": "الصيدلية",
              "tashkeelWord": "الصَّيْدَلِيَّة",
              "transliteration": "el-saydaleyya",
              "isCorrect": true
            },
            {
              "word": "المستشفى",
              "tashkeelWord": "المُسْتَشْفَى",
              "transliteration": "el-mostashfa",
              "isCorrect": false
            },
            {
              "word": "العيادة",
              "tashkeelWord": "العِيَادَة",
              "transliteration": "el-'iyaada",
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
          "displaySentence": "وين _____؟",
          "displaySentenceTashkeel": "وِين _____؟",
          "displaySentenceTransliteration": "wayn _____?",
          "blankWords": [
            {
              "word": "الصيدلية",
              "tashkeelWord": "الصَّيْدَلِيَّة",
              "transliteration": "as-saydaliyya",
              "isCorrect": true
            },
            {
              "word": "المستشفى",
              "tashkeelWord": "المُسْتَشْفَى",
              "transliteration": "al-mostashfa",
              "isCorrect": false
            },
            {
              "word": "العيادة",
              "tashkeelWord": "العِيَادَة",
              "transliteration": "al-'iyaada",
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
    "tags": ["medical", "pharmacy", "directions", "question"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "Do you have a prescription?",
    "context": {
      "whenToUse": "Pharmacist checking if doctor gave you prescription",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "معاك روشتة؟",
          "tashkeelText": "مَعَاك رُوشِتَّة؟",
          "transliteration": "ma'aak roshetta?"
        },
        "female": {
          "text": "معاكي روشتة؟",
          "tashkeelText": "مَعَاكِي رُوشِتَّة؟",
          "transliteration": "ma'aaki roshetta?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "عندك وصفة طبية؟",
          "tashkeelText": "عِنْدَك وَصْفَة طِبِّيَّة؟",
          "transliteration": "'indak wasfah tibbiyya?"
        },
        "female": {
          "text": "عندك وصفة طبية؟",
          "tashkeelText": "عِنْدِك وَصْفَة طِبِّيَّة؟",
          "transliteration": "'indik wasfah tibbiyya?"
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
          "displaySentence": "معاك _____؟",
          "displaySentenceTashkeel": "مَعَاك _____؟",
          "displaySentenceTransliteration": "ma'aak _____?",
          "blankWords": [
            {
              "word": "روشتة",
              "tashkeelWord": "رُوشِتَّة",
              "transliteration": "roshetta",
              "isCorrect": true
            },
            {
              "word": "عذر طبي",
              "tashkeelWord": "عُذْر طِبِّي",
              "transliteration": "'ozr tibbi",
              "isCorrect": false
            },
            {
              "word": "ملف طبي",
              "tashkeelWord": "مَلَف طِبِّي",
              "transliteration": "malaf tibbi",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "معاكي _____؟",
          "displaySentenceTashkeel": "مَعَاكِي _____؟",
          "displaySentenceTransliteration": "ma'aaki _____?",
          "blankWords": [
            {
              "word": "روشتة",
              "tashkeelWord": "رُوشِتَّة",
              "transliteration": "roshetta",
              "isCorrect": true
            },
            {
              "word": "عذر طبي",
              "tashkeelWord": "عُذْر طِبِّي",
              "transliteration": "'ozr tibbi",
              "isCorrect": false
            },
            {
              "word": "ملف طبي",
              "tashkeelWord": "مَلَف طِبِّي",
              "transliteration": "malaf tibbi",
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
          "displaySentence": "عندك _____؟",
          "displaySentenceTashkeel": "عِنْدَك _____؟",
          "displaySentenceTransliteration": "'indak _____?",
          "blankWords": [
            {
              "word": "وصفة طبية",
              "tashkeelWord": "وَصْفَة طِبِّيَّة",
              "transliteration": "wasfah tibbiyya",
              "isCorrect": true
            },
            {
              "word": "عذر طبي",
              "tashkeelWord": "عُذْر طِبِّي",
              "transliteration": "'ozr tibbi",
              "isCorrect": false
            },
            {
              "word": "ملف طبي",
              "tashkeelWord": "مَلَف طِبِّي",
              "transliteration": "malaf tibbi",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "عندك _____؟",
          "displaySentenceTashkeel": "عِنْدِك _____؟",
          "displaySentenceTransliteration": "'indik _____?",
          "blankWords": [
            {
              "word": "وصفة طبية",
              "tashkeelWord": "وَصْفَة طِبِّيَّة",
              "transliteration": "wasfah tibbiyya",
              "isCorrect": true
            },
            {
              "word": "عذر طبي",
              "tashkeelWord": "عُذْر طِبِّي",
              "transliteration": "'ozr tibbi",
              "isCorrect": false
            },
            {
              "word": "ملف طبي",
              "tashkeelWord": "مَلَف طِبِّي",
              "transliteration": "malaf tibbi",
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
    "tags": ["medical", "pharmacy", "prescription", "question"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I need bandages",
    "context": {
      "whenToUse": "Asking pharmacist for bandages for wound",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "محتاج شاش",
          "tashkeelText": "مُحْتَاج شَاش",
          "transliteration": "mehtaag shaash"
        },
        "female": {
          "text": "محتاجة شاش",
          "tashkeelText": "مُحْتَاجَة شَاش",
          "transliteration": "mehtaaga shaash"
        },
        "neutral": null
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أبغى شاش",
          "tashkeelText": "أَبْغَى شَاش",
          "transliteration": "abgha shaash"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "محتاج _____",
          "displaySentenceTashkeel": "مُحْتَاج _____",
          "displaySentenceTransliteration": "mehtaag _____",
          "blankWords": [
            {
              "word": "شاش",
              "tashkeelWord": "شَاش",
              "transliteration": "shaash",
              "isCorrect": true
            },
            {
              "word": "دوا",
              "tashkeelWord": "دَوَا",
              "transliteration": "dawa",
              "isCorrect": false
            },
            {
              "word": "علاج",
              "tashkeelWord": "عِلَاج",
              "transliteration": "'elaag",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "محتاجة _____",
          "displaySentenceTashkeel": "مُحْتَاجَة _____",
          "displaySentenceTransliteration": "mehtaaga _____",
          "blankWords": [
            {
              "word": "شاش",
              "tashkeelWord": "شَاش",
              "transliteration": "shaash",
              "isCorrect": true
            },
            {
              "word": "دوا",
              "tashkeelWord": "دَوَا",
              "transliteration": "dawa",
              "isCorrect": false
            },
            {
              "word": "علاج",
              "tashkeelWord": "عِلَاج",
              "transliteration": "'elaag",
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
              "word": "شاش",
              "tashkeelWord": "شَاش",
              "transliteration": "shaash",
              "isCorrect": true
            },
            {
              "word": "دوا",
              "tashkeelWord": "دَوَا",
              "transliteration": "dawa",
              "isCorrect": false
            },
            {
              "word": "علاج",
              "tashkeelWord": "عِلَاج",
              "transliteration": "'ilaaj",
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
    "tags": ["medical", "pharmacy", "bandages", "supplies"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I fell down",
    "context": {
      "whenToUse": "Explaining you fell and might be injured",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "وقعت",
          "tashkeelText": "وَقَعْت",
          "transliteration": "we'e't"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "طحت",
          "tashkeelText": "طِحْت",
          "transliteration": "taht"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "_____",
          "displaySentenceTashkeel": "_____",
          "displaySentenceTransliteration": "_____",
          "blankWords": [
            {
              "word": "وقعت",
              "tashkeelWord": "وَقَعْت",
              "transliteration": "we'e't",
              "isCorrect": true
            },
            {
              "word": "كسرت",
              "tashkeelWord": "كَسَرْت",
              "transliteration": "kasart",
              "isCorrect": false
            },
            {
              "word": "جرحت",
              "tashkeelWord": "جَرَحْت",
              "transliteration": "garaht",
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
          "displaySentence": "_____",
          "displaySentenceTashkeel": "_____",
          "displaySentenceTransliteration": "_____",
          "blankWords": [
            {
              "word": "طحت",
              "tashkeelWord": "طِحْت",
              "transliteration": "taht",
              "isCorrect": true
            },
            {
              "word": "كسرت",
              "tashkeelWord": "كَسَرْت",
              "transliteration": "kasart",
              "isCorrect": false
            },
            {
              "word": "جرحت",
              "tashkeelWord": "جَرَحْت",
              "transliteration": "jaraht",
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
    "tags": ["emergency", "medical", "injury", "accident"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I'm vomiting",
    "context": {
      "whenToUse": "Telling doctor you're throwing up/vomiting",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "انا برجع",
          "tashkeelText": "أَنَا بَرْجَع",
          "transliteration": "ana batraga'"
        }
      },
      "saudi": {
        "male": {
          "text": "جالس أستفرغ",
          "tashkeelText": "جَالِس أَسْتَفْرِغ",
          "transliteration": "jaalis astafrighh"
        },
        "female": {
          "text": "جالسة أستفرغ",
          "tashkeelText": "جَالِسَة أَسْتَفْرِغ",
          "transliteration": "jaalsa astafrighh"
        },
        "neutral": null
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "أنا _____",
          "displaySentenceTashkeel": "أَنَا _____",
          "displaySentenceTransliteration": "ana _____",
          "blankWords": [
            {
              "word": "برجع",
              "tashkeelWord": "بَرْجَع",
              "transliteration": "batraga'",
              "isCorrect": true
            },
            {
              "word": "بنزف",
              "tashkeelWord": "بَنْزِف",
              "transliteration": "banzif",
              "isCorrect": false
            },
            {
              "word": "بتألم",
              "tashkeelWord": "بَتْأَلَّم",
              "transliteration": "bata'allam",
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
          "displaySentence": "جالس _____",
          "displaySentenceTashkeel": "جَالِس _____",
          "displaySentenceTransliteration": "jaalis _____",
          "blankWords": [
            {
              "word": "أستفرغ",
              "tashkeelWord": "أَسْتَفْرِغ",
              "transliteration": "astafrighh",
              "isCorrect": true
            },
            {
              "word": "أنزف",
              "tashkeelWord": "أَنْزِف",
              "transliteration": "anzif",
              "isCorrect": false
            },
            {
              "word": "أتألم",
              "tashkeelWord": "أَتْأَلَّم",
              "transliteration": "ata'allam",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "جالسة _____",
          "displaySentenceTashkeel": "جَالِسَة _____",
          "displaySentenceTransliteration": "jaalsa _____",
          "blankWords": [
            {
              "word": "أستفرغ",
              "tashkeelWord": "أَسْتَفْرِغ",
              "transliteration": "astafrighh",
              "isCorrect": true
            },
            {
              "word": "أنزف",
              "tashkeelWord": "أَنْزِف",
              "transliteration": "anzif",
              "isCorrect": false
            },
            {
              "word": "أتألم",
              "tashkeelWord": "أَتْأَلَّم",
              "transliteration": "ata'allam",
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
    "tags": ["emergency", "medical", "symptoms", "illness"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I have an injury in my back",
    "context": {
      "whenToUse": "Describing back injury location to doctor",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "عندي إصابة في ظهري",
          "tashkeelText": "عَنْدِي إِصَابَة فِي ظَهْرِي",
          "transliteration": "'andi isaaba fe dahri"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "عندي إصابة في ظهري",
          "tashkeelText": "عِنْدِي إِصَابَة فِي ظَهْرِي",
          "transliteration": "'indi isaaba fe dhahri"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "عندي _____ في ظهري",
          "displaySentenceTashkeel": "عَنْدِي _____ فِي ظَهْرِي",
          "displaySentenceTransliteration": "'andi _____ fe dahri",
          "blankWords": [
            {
              "word": "إصابة",
              "tashkeelWord": "إِصَابَة",
              "transliteration": "isaaba",
              "isCorrect": true
            },
            {
              "word": "جرح",
              "tashkeelWord": "جُرْح",
              "transliteration": "gorh",
              "isCorrect": false
            },
            {
              "word": "كسر",
              "tashkeelWord": "كَسْر",
              "transliteration": "kasr",
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
          "displaySentence": "عندي _____ في ظهري",
          "displaySentenceTashkeel": "عِنْدِي _____ فِي ظَهْرِي",
          "displaySentenceTransliteration": "'indi _____ fe dhahri",
          "blankWords": [
            {
              "word": "إصابة",
              "tashkeelWord": "إِصَابَة",
              "transliteration": "isaaba",
              "isCorrect": true
            },
            {
              "word": "جرح",
              "tashkeelWord": "جُرْح",
              "transliteration": "jurh",
              "isCorrect": false
            },
            {
              "word": "كسر",
              "tashkeelWord": "كَسْر",
              "transliteration": "kasr",
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
    "tags": ["medical", "injury", "body-parts", "pain"],
    "isActive": true,
    "isApproved": true
  },
  {
    "englishTranslation": "I need treatment",
    "context": {
      "whenToUse": "Requesting medical treatment at hospital",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "محتاج علاج",
          "tashkeelText": "مُحْتَاج عِلَاج",
          "transliteration": "mehtaag 'elaag"
        },
        "female": {
          "text": "محتاجة علاج",
          "tashkeelText": "مُحْتَاجَة عِلَاج",
          "transliteration": "mehtaaga 'elaag"
        },
        "neutral": null
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "أبغى علاج",
          "tashkeelText": "أَبْغَى عِلَاج",
          "transliteration": "abgha 'ilaaj"
        }
      }
    },
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "محتاج _____",
          "displaySentenceTashkeel": "مُحْتَاج _____",
          "displaySentenceTransliteration": "mehtaag _____",
          "blankWords": [
            {
              "word": "علاج",
              "tashkeelWord": "عِلَاج",
              "transliteration": "'elaag",
              "isCorrect": true
            },
            {
              "word": "راحة",
              "tashkeelWord": "رَاحَة",
              "transliteration": "raaha",
              "isCorrect": false
            },
            {
              "word": "نوم",
              "tashkeelWord": "نَوْم",
              "transliteration": "nawm",
              "isCorrect": false
            }
          ]
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "محتاجة _____",
          "displaySentenceTashkeel": "مُحْتَاجَة _____",
          "displaySentenceTransliteration": "mehtaaga _____",
          "blankWords": [
            {
              "word": "علاج",
              "tashkeelWord": "عِلَاج",
              "transliteration": "'elaag",
              "isCorrect": true
            },
            {
              "word": "راحة",
              "tashkeelWord": "رَاحَة",
              "transliteration": "raaha",
              "isCorrect": false
            },
            {
              "word": "نوم",
              "tashkeelWord": "نَوْم",
              "transliteration": "nawm",
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
              "word": "علاج",
              "tashkeelWord": "عِلَاج",
              "transliteration": "'ilaaj",
              "isCorrect": true
            },
            {
              "word": "راحة",
              "tashkeelWord": "رَاحَة",
              "transliteration": "raaha",
              "isCorrect": false
            },
            {
              "word": "نوم",
              "tashkeelWord": "نَوْم",
              "transliteration": "nawm",
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
    "tags": ["medical", "treatment", "hospital", "healthcare"],
    "isActive": true,
    "isApproved": true
  }
]
    const categoryName = 'ESSENTIAL'; // Change this
    const situationName = 'emergency-medical'; // Change this

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
