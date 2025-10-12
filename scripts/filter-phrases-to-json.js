const fs = require('fs');
const path = require('path');

/**
 * Filter phrases array by formality level and write to JSON file
 *
 * @param {Array} phrasesArray - Array of phrase objects
 * @param {string} formality - Formality level to filter ('informal', 'formal', 'neutral', etc.)
 * @param {string} outputFileName - Output file name (will be saved in scripts/output/)
 */
function filterAndWritePhrases(phrasesArray, formality, outputFileName) {
    try {
        // Filter phrases by formality
        const filteredPhrases = phrasesArray.filter(phrase => {
            return phrase.context && phrase.context.formality === formality;
        });

        console.log(`\n📊 Filtering Results:`);
        console.log(`   Total phrases: ${phrasesArray.length}`);
        console.log(`   Formality filter: "${formality}"`);
        console.log(`   Matched phrases: ${filteredPhrases.length}`);

        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`\n📁 Created output directory: ${outputDir}`);
        }

        // Write to JSON file
        const outputPath = path.join(outputDir, outputFileName);
        fs.writeFileSync(outputPath, JSON.stringify(filteredPhrases, null, 2), 'utf8');

        console.log(`\n✅ Successfully wrote ${filteredPhrases.length} phrases to:`);
        console.log(`   ${outputPath}`);

        return {
            total: phrasesArray.length,
            filtered: filteredPhrases.length,
            outputPath
        };

    } catch (error) {
        console.error('❌ Error filtering and writing phrases:', error.message);
        throw error;
    }
}

// Example usage when run directly
if (require.main === module) {
    // Sample input array (replace with your actual data)

        const phrasesArray = [
  {
    "englishTranslation": "When are you traveling?",
    "intent": "Ask when someone is traveling",
    "context": {
      "whenToUse": "When you want to know someone's travel dates",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "متى مسافر؟",
          "tashkeelText": "مَتَى مُسَافِر؟",
          "transliteration": "mata musafir?"
        },
        "female": {
          "text": "متى مسافرة؟",
          "tashkeelText": "مَتَى مُسَافْرَة؟",
          "transliteration": "mata musafra?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "متى مسافر؟",
          "tashkeelText": "مَتَى مُسَافِر؟",
          "transliteration": "mata musafir?"
        },
        "female": {
          "text": "متى مسافرة؟",
          "tashkeelText": "مَتَى مُسَافْرَة؟",
          "transliteration": "mata musafra?"
        },
        "neutral": null
      }
    },
    "followUp": {
      "englishTranslation": "Next Friday",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "الجمعة الجاية",
            "tashkeelText": "الجُمْعَة الجَايَة",
            "transliteration": "il-gum'a il-gayya"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "الجمعة الجاي",
            "tashkeelText": "الجُمْعَة الجَاي",
            "transliteration": "il-jum'a il-jay"
          }
        }
      }
    },
    "hasGenderVariation": true,
    "tags": ["question", "travel", "logistics", "time"],
      "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "متى _____؟",
          "displaySentenceTashkeel": "مَتَى _____؟",
          "displaySentenceTransliteration": "mata _____?",
          "blankWords": [
            {
              "word": "مسافر",
              "tashkeelWord": "مُسَافِر",
              "transliteration": "musafir",
              "isCorrect": true
            },
            {
              "word": "راجع",
              "tashkeelWord": "رَاجِع",
              "transliteration": "ragi'",
              "isCorrect": false
            },
            {
              "word": "واصل",
              "tashkeelWord": "وَاصِل",
              "transliteration": "wasil",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "متى _____؟",
          "displaySentenceTashkeel": "مَتَى _____؟",
          "displaySentenceTransliteration": "mata _____?",
          "blankWords": [
            {
              "word": "مسافرة",
              "tashkeelWord": "مُسَافْرَة",
              "transliteration": "musafra",
              "isCorrect": true
            },
            {
              "word": "راجعة",
              "tashkeelWord": "رَاجْعَة",
              "transliteration": "rag'a",
              "isCorrect": false
            },
            {
              "word": "واصلة",
              "tashkeelWord": "وَاصْلَة",
              "transliteration": "wasla",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "متى _____؟",
          "displaySentenceTashkeel": "مَتَى _____؟",
          "displaySentenceTransliteration": "mata _____?",
          "blankWords": [
            {
              "word": "مسافر",
              "tashkeelWord": "مُسَافِر",
              "transliteration": "musafir",
              "isCorrect": true
            },
            {
              "word": "راجع",
              "tashkeelWord": "رَاجِع",
              "transliteration": "ragi'",
              "isCorrect": false
            },
            {
              "word": "واصل",
              "tashkeelWord": "وَاصِل",
              "transliteration": "wasil",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "متى _____؟",
          "displaySentenceTashkeel": "مَتَى _____؟",
          "displaySentenceTransliteration": "mata _____?",
          "blankWords": [
            {
              "word": "مسافرة",
              "tashkeelWord": "مُسَافْرَة",
              "transliteration": "musafra",
              "isCorrect": true
            },
            {
              "word": "راجعة",
              "tashkeelWord": "رَاجْعَة",
              "transliteration": "rag'a",
              "isCorrect": false
            },
            {
              "word": "واصلة",
              "tashkeelWord": "وَاصْلَة",
              "transliteration": "wasla",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "I'm flying tomorrow",
    "intent": "Say I'm flying tomorrow",
    "context": {
      "whenToUse": "When informing someone about imminent travel",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "مسافر بكرة",
          "tashkeelText": "مُسَافِر بُكْرَة",
          "transliteration": "musafir bukra"
        },
        "female": {
          "text": "مسافرة بكرة",
          "tashkeelText": "مُسَافْرَة بُكْرَة",
          "transliteration": "musafra bukra"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "مسافر بكرة",
          "tashkeelText": "مُسَافِر بُكْرَة",
          "transliteration": "musafir bukra"
        },
        "female": {
          "text": "مسافرة بكرة",
          "tashkeelText": "مُسَافْرَة بُكْرَة",
          "transliteration": "musafra bukra"
        },
        "neutral": null
      }
    },
    "followUp": {
  "englishTranslation": "Arrive safely",
  "isSamePerson": false,
  "variations": {
    "msa": null,
    "egyptian": {
      "male": {
        "text": "توصل بالسلامة",
        "tashkeelText": "تُوصَل بِالسَّلَامَة",
        "transliteration": "toosal bis-salama"
      },
      "female": {
        "text": "توصلي بالسلامة",
        "tashkeelText": "تُوصَلِي بِالسَّلَامَة",
        "transliteration": "toosali bis-salama"
      },
      "neutral": null
    },
    "saudi": {
      "male": {
        "text": "توصل بالسلامة",
        "tashkeelText": "تُوصَل بِالسَّلَامَة",
        "transliteration": "toosal bis-salama"
      },
      "female": {
        "text": "توصلي بالسلامة",
        "tashkeelText": "تُوصَلِي بِالسَّلَامَة",
        "transliteration": "toosali bis-salama"
      },
      "neutral": null
    }
  }
},
    "hasGenderVariation": true,
    "tags": ["statement", "travel", "time", "urgent"],
        "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____",
          "displaySentenceTashkeel": "مُسَافِر _____",
          "displaySentenceTransliteration": "musafir _____",
          "blankWords": [
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": true
            },
            {
              "word": "امبارح",
              "tashkeelWord": "إمْبَارِح",
              "transliteration": "imbarih",
              "isCorrect": false
            },
            {
              "word": "دلوقتي",
              "tashkeelWord": "دِلْوَقْتِي",
              "transliteration": "dilwa'ti",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____",
          "displaySentenceTashkeel": "مُسَافْرَة _____",
          "displaySentenceTransliteration": "musafra _____",
          "blankWords": [
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": true
            },
            {
              "word": "امبارح",
              "tashkeelWord": "إمْبَارِح",
              "transliteration": "imbarih",
              "isCorrect": false
            },
            {
              "word": "دلوقتي",
              "tashkeelWord": "دِلْوَقْتِي",
              "transliteration": "dilwa'ti",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____",
          "displaySentenceTashkeel": "مُسَافِر _____",
          "displaySentenceTransliteration": "musafir _____",
          "blankWords": [
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": true
            },
            {
              "word": "امس",
              "tashkeelWord": "أَمْس",
              "transliteration": "ams",
              "isCorrect": false
            },
            {
              "word": "الحين",
              "tashkeelWord": "الحِين",
              "transliteration": "il-heen",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____",
          "displaySentenceTashkeel": "مُسَافْرَة _____",
          "displaySentenceTransliteration": "musafra _____",
          "blankWords": [
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": true
            },
            {
              "word": "امس",
              "tashkeelWord": "أَمْس",
              "transliteration": "ams",
              "isCorrect": false
            },
            {
              "word": "الحين",
              "tashkeelWord": "الحِين",
              "transliteration": "il-heen",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "I need to pack tonight",
    "intent": "Say I need to pack tonight",
    "context": {
      "whenToUse": "When you have to prepare luggage urgently",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "لازم أجهز الشنطة الليلة",
          "tashkeelText": "لَازِم أجَهِّز الشَّنْطَة اللَّيْلَة",
          "transliteration": "lazim agahhiz il-shanta il-leila"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "لازم أجهز الشنطة الليلة",
          "tashkeelText": "لَازِم أجَهِّز الشَّنْطَة اللَّيْلَة",
          "transliteration": "lazim agahhiz il-shanta il-leila"
        }
      }
    },
    "followUp": null,
    "hasGenderVariation": false,
    "tags": ["statement", "travel", "urgent", "logistics"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "لازم أجهز _____ الليلة",
          "displaySentenceTashkeel": "لَازِم أجَهِّز _____ اللَّيْلَة",
          "displaySentenceTransliteration": "lazim agahhiz _____ il-leila",
          "blankWords": [
            {
              "word": "الشنطة",
              "tashkeelWord": "الشَّنْطَة",
              "transliteration": "il-shanta",
              "isCorrect": true
            },
            {
              "word": "الاكل",
              "tashkeelWord": "الأَكْل",
              "transliteration": "il-akl",
              "isCorrect": false
            },
            {
              "word": "الغرفة",
              "tashkeelWord": "الغُرْفَة",
              "transliteration": "il-ghurfa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "لازم أجهز _____ الليلة",
          "displaySentenceTashkeel": "لَازِم أجَهِّز _____ اللَّيْلَة",
          "displaySentenceTransliteration": "lazim agahhiz _____ il-leila",
          "blankWords": [
            {
              "word": "الشنطة",
              "tashkeelWord": "الشَّنْطَة",
              "transliteration": "il-shanta",
              "isCorrect": true
            },
            {
              "word": "الاكل",
              "tashkeelWord": "الأَكْل",
              "transliteration": "il-akl",
              "isCorrect": false
            },
            {
              "word": "الغرفة",
              "tashkeelWord": "الغُرْفَة",
              "transliteration": "il-ghurfa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "What time is the flight?",
    "intent": "Ask what time the flight is",
    "context": {
      "whenToUse": "When asking about departure time",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "الطيارة الساعة كام؟",
          "tashkeelText": "الطَّيَّارَة السَّاعَة كَام؟",
          "transliteration": "il-tayyara is-sa'a kam?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "الطيارة الساعة كم؟",
          "tashkeelText": "الطَّيَّارَة السَّاعَة كَم؟",
          "transliteration": "il-tayyara is-sa'a kam?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Six in the evening",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "الساعة ستة المغرب",
            "tashkeelText": "السَّاعَة سِتَّة المَغْرِب",
            "transliteration": "is-sa'a sitta il-maghrib"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "الساعة ستة المغرب",
            "tashkeelText": "السَّاعَة سِتَّة المَغْرِب",
            "transliteration": "is-sa'a sitta il-maghrib"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["question", "travel", "time", "logistics"],
      "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "الطيارة الساعة _____؟",
          "displaySentenceTashkeel": "الطَّيَّارَة السَّاعَة _____؟",
          "displaySentenceTransliteration": "il-tayyara is-sa'a _____?",
          "blankWords": [
            {
              "word": "كام",
              "tashkeelWord": "كَام",
              "transliteration": "kam",
              "isCorrect": true
            },
            {
              "word": "فين",
              "tashkeelWord": "فِين",
              "transliteration": "fein",
              "isCorrect": false
            },
            {
              "word": "امتى",
              "tashkeelWord": "إمْتَى",
              "transliteration": "imta",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "الطيارة الساعة _____؟",
          "displaySentenceTashkeel": "الطَّيَّارَة السَّاعَة _____؟",
          "displaySentenceTransliteration": "il-tayyara is-sa'a _____?",
          "blankWords": [
            {
              "word": "كم",
              "tashkeelWord": "كَم",
              "transliteration": "kam",
              "isCorrect": true
            },
            {
              "word": "وين",
              "tashkeelWord": "وَيْن",
              "transliteration": "wein",
              "isCorrect": false
            },
            {
              "word": "متى",
              "tashkeelWord": "مَتَى",
              "transliteration": "mata",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "I'm traveling to Dubai next week",
    "intent": "Say I'm traveling to Dubai next week",
    "context": {
      "whenToUse": "When sharing upcoming travel plans",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "مسافر دبي الأسبوع الجاي",
          "tashkeelText": "مُسَافِر دُبَي الأُسْبُوع الجَاي",
          "transliteration": "musafir dubai il-usbu' il-gay"
        },
        "female": {
          "text": "مسافرة دبي الأسبوع الجاي",
          "tashkeelText": "مُسَافْرَة دُبَي الأُسْبُوع الجَاي",
          "transliteration": "musafra dubai il-usbu' il-gay"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "مسافر دبي الأسبوع الجاي",
          "tashkeelText": "مُسَافِر دُبَي الأُسْبُوع الجَاي",
          "transliteration": "musafir dubai il-usbu' il-jay"
        },
        "female": {
          "text": "مسافرة دبي الأسبوع الجاي",
          "tashkeelText": "مُسَافْرَة دُبَي الأُسْبُوع الجَاي",
          "transliteration": "musafra dubai il-usbu' il-jay"
        },
        "neutral": null
      }
    },
    "followUp": null,
    "hasGenderVariation": true,
    "tags": ["statement", "travel", "location", "time"],
      "exercises": {
    "egyptian": [
      {
        "type": "fill-in-blank",
        "gender": "male",
        "difficulty": "intermediate",
        "displaySentence": "_____ دبي الأسبوع الجاي",
        "displaySentenceTashkeel": "_____ دُبَي الأُسْبُوع الجَاي",
        "displaySentenceTransliteration": "_____ dubai il-usbu' il-gay",
        "blankWords": [
          {
            "word": "مسافر",
            "tashkeelWord": "مُسَافِر",
            "transliteration": "musafir",
            "isCorrect": true
          },
          {
            "word": "وصلت",
            "tashkeelWord": "وَصَلْت",
            "transliteration": "wasalt",
            "isCorrect": false
          },
          {
            "word": "ساكن",
            "tashkeelWord": "سَاكِن",
            "transliteration": "sakin",
            "isCorrect": false
          }
        ],
        "reorderWords": [],
        "matchingPairs": []
      },
      {
        "type": "fill-in-blank",
        "gender": "female",
        "difficulty": "intermediate",
        "displaySentence": "_____ دبي الأسبوع الجاي",
        "displaySentenceTashkeel": "_____ دُبَي الأُسْبُوع الجَاي",
        "displaySentenceTransliteration": "_____ dubai il-usbu' il-gay",
        "blankWords": [
          {
            "word": "مسافرة",
            "tashkeelWord": "مُسَافْرَة",
            "transliteration": "musafra",
            "isCorrect": true
          },
          {
            "word": "وصلت",
            "tashkeelWord": "وَصَلْت",
            "transliteration": "wasalt",
            "isCorrect": false
          },
          {
            "word": "ساكنة",
            "tashkeelWord": "سَاكْنَة",
            "transliteration": "sakna",
            "isCorrect": false
          }
        ],
        "reorderWords": [],
        "matchingPairs": []
      }
    ],
    "saudi": [
      {
        "type": "fill-in-blank",
        "gender": "male",
        "difficulty": "intermediate",
        "displaySentence": "_____ دبي الأسبوع الجاي",
        "displaySentenceTashkeel": "_____ دُبَي الأُسْبُوع الجَاي",
        "displaySentenceTransliteration": "_____ dubai il-usbu' il-jay",
        "blankWords": [
          {
            "word": "مسافر",
            "tashkeelWord": "مُسَافِر",
            "transliteration": "musafir",
            "isCorrect": true
          },
          {
            "word": "وصلت",
            "tashkeelWord": "وَصَلْت",
            "transliteration": "wasalt",
            "isCorrect": false
          },
          {
            "word": "ساكن",
            "tashkeelWord": "سَاكِن",
            "transliteration": "sakin",
            "isCorrect": false
          }
        ],
        "reorderWords": [],
        "matchingPairs": []
      },
      {
        "type": "fill-in-blank",
        "gender": "female",
        "difficulty": "intermediate",
        "displaySentence": "_____ دبي الأسبوع الجاي",
        "displaySentenceTashkeel": "_____ دُبَي الأُسْبُوع الجَاي",
        "displaySentenceTransliteration": "_____ dubai il-usbu' il-jay",
        "blankWords": [
          {
            "word": "مسافرة",
            "tashkeelWord": "مُسَافْرَة",
            "transliteration": "musafra",
            "isCorrect": true
          },
          {
            "word": "وصلت",
            "tashkeelWord": "وَصَلْت",
            "transliteration": "wasalt",
            "isCorrect": false
          },
          {
            "word": "ساكنة",
            "tashkeelWord": "سَاكْنَة",
            "transliteration": "sakna",
            "isCorrect": false
          }
        ],
        "reorderWords": [],
        "matchingPairs": []
      }
    ],
    "msa": []
  }
  },
  {
    "englishTranslation": "Are you traveling alone?",
    "intent": "Ask if they're traveling alone",
    "context": {
      "whenToUse": "When asking about travel companions",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "مسافر لوحدك؟",
          "tashkeelText": "مُسَافِر لِوَحْدَك؟",
          "transliteration": "musafir liwahdak?"
        },
        "female": {
          "text": "مسافرة لوحدك؟",
          "tashkeelText": "مُسَافْرَة لِوَحْدِك؟",
          "transliteration": "musafra liwahdik?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "مسافر لحالك؟",
          "tashkeelText": "مُسَافِر لِحَالَك؟",
          "transliteration": "musafir lihalak?"
        },
        "female": {
          "text": "مسافرة لحالك؟",
          "tashkeelText": "مُسَافْرَة لِحَالِك؟",
          "transliteration": "musafra lihalik?"
        },
        "neutral": null
      }
    },
    "followUp": {
      "englishTranslation": "No, with my family",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "لا، مع عيلتي",
            "tashkeelText": "لَا، مَع عِيلْتِي",
            "transliteration": "la, ma'a 'eilti"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "لا، مع عيالي",
            "tashkeelText": "لَا، مَع عِيَالِي",
            "transliteration": "la, ma'a 'iyali"
          }
        }
      }
    },
    "hasGenderVariation": true,
    "tags": ["question", "travel", "social", "logistics"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____؟",
          "displaySentenceTashkeel": "مُسَافِر _____؟",
          "displaySentenceTransliteration": "musafir _____?",
          "blankWords": [
            {
              "word": "لوحدك",
              "tashkeelWord": "لِوَحْدَك",
              "transliteration": "liwahdak",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": false
            },
            {
              "word": "دبي",
              "tashkeelWord": "دُبَي",
              "transliteration": "dubai",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____؟",
          "displaySentenceTashkeel": "مُسَافْرَة _____؟",
          "displaySentenceTransliteration": "musafra _____?",
          "blankWords": [
            {
              "word": "لوحدك",
              "tashkeelWord": "لِوَحْدِك",
              "transliteration": "liwahdik",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": false
            },
            {
              "word": "دبي",
              "tashkeelWord": "دُبَي",
              "transliteration": "dubai",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____؟",
          "displaySentenceTashkeel": "مُسَافِر _____؟",
          "displaySentenceTransliteration": "musafir _____?",
          "blankWords": [
            {
              "word": "لحالك",
              "tashkeelWord": "لِحَالَك",
              "transliteration": "lihalak",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": false
            },
            {
              "word": "دبي",
              "tashkeelWord": "دُبَي",
              "transliteration": "dubai",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____؟",
          "displaySentenceTashkeel": "مُسَافْرَة _____؟",
          "displaySentenceTransliteration": "musafra _____?",
          "blankWords": [
            {
              "word": "لحالك",
              "tashkeelWord": "لِحَالِك",
              "transliteration": "lihalik",
              "isCorrect": true
            },
            {
              "word": "بكرة",
              "tashkeelWord": "بُكْرَة",
              "transliteration": "bukra",
              "isCorrect": false
            },
            {
              "word": "دبي",
              "tashkeelWord": "دُبَي",
              "transliteration": "dubai",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "I'm traveling for tourism",
    "intent": "Say I'm traveling for tourism",
    "context": {
      "whenToUse": "When explaining purpose of travel at airport/visa",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "مسافر سياحة",
          "tashkeelText": "مُسَافِر سِيَاحَة",
          "transliteration": "musafir siyaha"
        },
        "female": {
          "text": "مسافرة سياحة",
          "tashkeelText": "مُسَافْرَة سِيَاحَة",
          "transliteration": "musafra siyaha"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "مسافر سياحة",
          "tashkeelText": "مُسَافِر سِيَاحَة",
          "transliteration": "musafir siyaha"
        },
        "female": {
          "text": "مسافرة سياحة",
          "tashkeelText": "مُسَافْرَة سِيَاحَة",
          "transliteration": "musafra siyaha"
        },
        "neutral": null
      }
    },
    "followUp": {
  "englishTranslation": "Arrive safely",
  "isSamePerson": false,
  "variations": {
    "msa": null,
    "egyptian": {
      "male": {
        "text": "توصل بالسلامة",
        "tashkeelText": "تُوصَل بِالسَّلَامَة",
        "transliteration": "toosal bis-salama"
      },
      "female": {
        "text": "توصلي بالسلامة",
        "tashkeelText": "تُوصَلِي بِالسَّلَامَة",
        "transliteration": "toosali bis-salama"
      },
      "neutral": null
    },
    "saudi": {
      "male": {
        "text": "توصل بالسلامة",
        "tashkeelText": "تُوصَل بِالسَّلَامَة",
        "transliteration": "toosal bis-salama"
      },
      "female": {
        "text": "توصلي بالسلامة",
        "tashkeelText": "تُوصَلِي بِالسَّلَامَة",
        "transliteration": "toosali bis-salama"
      },
      "neutral": null
    }
  }
},
    "hasGenderVariation": true,
    "tags": ["statement", "travel", "identity", "logistics"],
      "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____",
          "displaySentenceTashkeel": "مُسَافِر _____",
          "displaySentenceTransliteration": "musafir _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____",
          "displaySentenceTashkeel": "مُسَافْرَة _____",
          "displaySentenceTransliteration": "musafra _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "male",
          "difficulty": "beginner",
          "displaySentence": "مسافر _____",
          "displaySentenceTashkeel": "مُسَافِر _____",
          "displaySentenceTransliteration": "musafir _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        },
        {
          "type": "fill-in-blank",
          "gender": "female",
          "difficulty": "beginner",
          "displaySentence": "مسافرة _____",
          "displaySentenceTashkeel": "مُسَافْرَة _____",
          "displaySentenceTransliteration": "musafra _____",
          "blankWords": [
            {
              "word": "سياحة",
              "tashkeelWord": "سِيَاحَة",
              "transliteration": "siyaha",
              "isCorrect": true
            },
            {
              "word": "شغل",
              "tashkeelWord": "شُغْل",
              "transliteration": "shughl",
              "isCorrect": false
            },
            {
              "word": "دراسة",
              "tashkeelWord": "دِرَاسَة",
              "transliteration": "dirasa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "Do I need a visa?",
    "intent": "Ask if I need a visa",
    "context": {
      "whenToUse": "When checking visa requirements before travel",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "محتاج تأشيرة؟",
          "tashkeelText": "مُحْتَاج تَأْشِيرَة؟",
          "transliteration": "muhtag ta'shira?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "هل احتاج تأشيرة؟",
          "tashkeelText": "هَل أحْتَاج تَأْشِيرَة؟",
          "transliteration": "hal ahtaj ta'shira?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Yes, you need one",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوة، لازم",
            "tashkeelText": "أَيْوَة، لَازِم",
            "transliteration": "aywa, lazim"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوه، لازم",
            "tashkeelText": "أَيْوَه، لَازِم",
            "transliteration": "aywa, lazim"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["question", "travel", "logistics", "request"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "محتاج _____؟",
          "displaySentenceTashkeel": "مُحْتَاج _____؟",
          "displaySentenceTransliteration": "muhtag _____?",
          "blankWords": [
            {
              "word": "تأشيرة",
              "tashkeelWord": "تَأْشِيرَة",
              "transliteration": "ta'shira",
              "isCorrect": true
            },
            {
              "word": "فلوس",
              "tashkeelWord": "فُلُوس",
              "transliteration": "fulus",
              "isCorrect": false
            },
            {
              "word": "جواز",
              "tashkeelWord": "جَوَاز",
              "transliteration": "gawaz",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "هل احتاج _____؟",
          "displaySentenceTashkeel": "هَل أحْتَاج _____؟",
          "displaySentenceTransliteration": "hal ahtaj _____?",
          "blankWords": [
            {
              "word": "تأشيرة",
              "tashkeelWord": "تَأْشِيرَة",
              "transliteration": "ta'shira",
              "isCorrect": true
            },
            {
              "word": "فلوس",
              "tashkeelWord": "فُلُوس",
              "transliteration": "fulus",
              "isCorrect": false
            },
            {
              "word": "جواز",
              "tashkeelWord": "جَوَاز",
              "transliteration": "gawaz",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "My visa is approved",
    "intent": "Say my visa is approved",
    "context": {
      "whenToUse": "When sharing good news about visa status",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التأشيرة طلعت",
          "tashkeelText": "التَّأْشِيرَة طَلَعَت",
          "transliteration": "it-ta'shira tala'at"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التأشيرة طلعت",
          "tashkeelText": "التَّأْشِيرَة طَلَعَت",
          "transliteration": "it-ta'shira tala'at"
        }
      }
    },
    "followUp": null,
    "hasGenderVariation": false,
    "tags": ["statement", "travel", "happy", "logistics"],
    "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "التأشيرة _____",
          "displaySentenceTashkeel": "التَّأْشِيرَة _____",
          "displaySentenceTransliteration": "it-ta'shira _____",
          "blankWords": [
            {
              "word": "طلعت",
              "tashkeelWord": "طَلَعَت",
              "transliteration": "tala'at",
              "isCorrect": true
            },
            {
              "word": "اتأخرت",
              "tashkeelWord": "إتْأَخَّرَت",
              "transliteration": "it'akhkharat",
              "isCorrect": false
            },
            {
              "word": "اترفضت",
              "tashkeelWord": "إتْرُفِضَت",
              "transliteration": "itrufidat",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "التأشيرة _____",
          "displaySentenceTashkeel": "التَّأْشِيرَة _____",
          "displaySentenceTransliteration": "it-ta'shira _____",
          "blankWords": [
            {
              "word": "طلعت",
              "tashkeelWord": "طَلَعَت",
              "transliteration": "tala'at",
              "isCorrect": true
            },
            {
              "word": "اتأخرت",
              "tashkeelWord": "إتْأَخَّرَت",
              "transliteration": "it'akhkharat",
              "isCorrect": false
            },
            {
              "word": "انرفضت",
              "tashkeelWord": "إنْرُفِضَت",
              "transliteration": "inrufidat",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "How long does the visa take?",
    "intent": "Ask how long the visa takes",
    "context": {
      "whenToUse": "When inquiring about visa processing time",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التأشيرة تاخد قد ايه؟",
          "tashkeelText": "التَّأْشِيرَة تَاخُد قَدْ إِيه؟",
          "transliteration": "it-ta'shira takhud add eh?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التأشيرة تاخذ كم يوم؟",
          "tashkeelText": "التَّأْشِيرَة تَاخُذ كَم يَوْم؟",
          "transliteration": "it-ta'shira takhudh kam yom?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "About a week",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "حوالي أسبوع",
            "tashkeelText": "حَوَالِي أُسْبُوع",
            "transliteration": "hawali usbu'"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "تقريباً أسبوع",
            "tashkeelText": "تَقْرِيبَاً أُسْبُوع",
            "transliteration": "taqriban usbu'"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["question", "travel", "time", "logistics"],
     "exercises": {
    "egyptian": [
      {
        "type": "fill-in-blank",
        "gender": "neutral",
        "difficulty": "intermediate",
        "displaySentence": "التأشيرة تاخد _____ ايه؟",
        "displaySentenceTashkeel": "التَّأْشِيرَة تَاخُد _____ إِيه؟",
        "displaySentenceTransliteration": "it-ta'shira takhud _____ eh?",
        "blankWords": [
          {
            "word": "قد",
            "tashkeelWord": "قَدْ",
            "transliteration": "add",
            "isCorrect": true
          },
          {
            "word": "ليه",
            "tashkeelWord": "لِيه",
            "transliteration": "leih",
            "isCorrect": false
          },
          {
            "word": "فين",
            "tashkeelWord": "فِين",
            "transliteration": "fein",
            "isCorrect": false
          }
        ],
        "reorderWords": [],
        "matchingPairs": []
      }
    ],
    "saudi": [
      {
        "type": "fill-in-blank",
        "gender": "neutral",
        "difficulty": "intermediate",
        "displaySentence": "التأشيرة تاخذ _____ يوم؟",
        "displaySentenceTashkeel": "التَّأْشِيرَة تَاخُذ _____ يَوْم؟",
        "displaySentenceTransliteration": "it-ta'shira takhudh _____ yom?",
        "blankWords": [
          {
            "word": "كم",
            "tashkeelWord": "كَم",
            "transliteration": "kam",
            "isCorrect": true
          },
          {
            "word": "وين",
            "tashkeelWord": "وَيْن",
            "transliteration": "wein",
            "isCorrect": false
          },
          {
            "word": "متى",
            "tashkeelWord": "مَتَى",
            "transliteration": "mata",
            "isCorrect": false
          }
        ],
        "reorderWords": [],
        "matchingPairs": []
      }
    ],
    "msa": []
  }
  },
  {
    "englishTranslation": "I'm waiting for my visa",
    "intent": "Say I'm waiting for my visa",
    "context": {
      "whenToUse": "When explaining travel delay due to visa",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "مستني التأشيرة",
          "tashkeelText": "مُسْتَنِّي التَّأْشِيرَة",
          "transliteration": "mustanni it-ta'shira"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "منتظر التأشيرة",
          "tashkeelText": "مُنْتَظِر التَّأْشِيرَة",
          "transliteration": "muntadhir it-ta'shira"
        }
      }
    },
    "followUp": null,
    "hasGenderVariation": false,
    "tags": ["statement", "travel", "logistics", "time"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "مستني _____",
          "displaySentenceTashkeel": "مُسْتَنِّي _____",
          "displaySentenceTransliteration": "mustanni _____",
          "blankWords": [
            {
              "word": "التأشيرة",
              "tashkeelWord": "التَّأْشِيرَة",
              "transliteration": "it-ta'shira",
              "isCorrect": true
            },
            {
              "word": "الطيارة",
              "tashkeelWord": "الطَّيَّارَة",
              "transliteration": "it-tayyara",
              "isCorrect": false
            },
            {
              "word": "الجواز",
              "tashkeelWord": "الجَوَاز",
              "transliteration": "il-gawaz",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "منتظر _____",
          "displaySentenceTashkeel": "مُنْتَظِر _____",
          "displaySentenceTransliteration": "muntadhir _____",
          "blankWords": [
            {
              "word": "التأشيرة",
              "tashkeelWord": "التَّأْشِيرَة",
              "transliteration": "it-ta'shira",
              "isCorrect": true
            },
            {
              "word": "الطيارة",
              "tashkeelWord": "الطَّيَّارَة",
              "transliteration": "it-tayyara",
              "isCorrect": false
            },
            {
              "word": "الجواز",
              "tashkeelWord": "الجَوَاز",
              "transliteration": "il-gawaz",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "Can I get visa on arrival?",
    "intent": "Ask if it's visa on arrival",
    "context": {
      "whenToUse": "When checking if you can get visa at airport",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "اقدر اخد التأشيرة من المطار؟",
          "tashkeelText": "أقْدَر آخُد التَّأْشِيرَة مِن المَطَار؟",
          "transliteration": "a'dar akhud it-ta'shira min il-matar?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "يعطوني التأشيرة من المطار؟",
          "tashkeelText": "يِعْطُونِي التَّأْشِيرَة مِن المَطَار؟",
          "transliteration": "yi'tooni it-ta'shira min il-matar?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Yes, you can get it there",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوة، تقدر تاخدها هناك",
            "tashkeelText": "أَيْوَة، تِقْدَر تَاخُدْهَا هِنَاك",
            "transliteration": "aywa, ti'dar takhudhha hinak"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوه، تقدر تاخذها هناك",
            "tashkeelText": "أَيْوَه، تِقْدَر تَاخُذْهَا هِنَاك",
            "transliteration": "aywa, ti'dar takhudhha hinak"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["question", "travel", "logistics", "location"],
      "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "اقدر اخد التأشيرة من _____؟",
          "displaySentenceTashkeel": "أقْدَر آخُد التَّأْشِيرَة مِن _____؟",
          "displaySentenceTransliteration": "a'dar akhud it-ta'shira min _____?",
          "blankWords": [
            {
              "word": "المطار",
              "tashkeelWord": "المَطَار",
              "transliteration": "il-matar",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "البنك",
              "tashkeelWord": "البَنْك",
              "transliteration": "il-bank",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "يعطوني التأشيرة من _____؟",
          "displaySentenceTashkeel": "يِعْطُونِي التَّأْشِيرَة مِن _____؟",
          "displaySentenceTransliteration": "yi'tooni it-ta'shira min _____?",
          "blankWords": [
            {
              "word": "المطار",
              "tashkeelWord": "المَطَار",
              "transliteration": "il-matar",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "البنك",
              "tashkeelWord": "البَنْك",
              "transliteration": "il-bank",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "Did you book the ticket?",
    "intent": "Ask if they booked the flight",
    "context": {
      "whenToUse": "When checking if someone reserved their ticket",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": {
          "text": "حجزت التذكرة؟",
          "tashkeelText": "حَجَزْت التَّذْكِرَة؟",
          "transliteration": "hagazt it-tadhkira?"
        },
        "female": {
          "text": "حجزتي التذكرة؟",
          "tashkeelText": "حَجَزْتِي التَّذْكِرَة؟",
          "transliteration": "hagazti it-tadhkira?"
        },
        "neutral": null
      },
      "saudi": {
        "male": {
          "text": "حجزت التذكرة؟",
          "tashkeelText": "حَجَزْت التَّذْكِرَة؟",
          "transliteration": "hajazt it-tadhkira?"
        },
        "female": {
          "text": "حجزتي التذكرة؟",
          "tashkeelText": "حَجَزْتِي التَّذْكِرَة؟",
          "transliteration": "hajazti it-tadhkira?"
        },
        "neutral": null
      }
    },
    "followUp": {
      "englishTranslation": "Yes, yesterday",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوة، امبارح",
            "tashkeelText": "أَيْوَة، إمْبَارِح",
            "transliteration": "aywa, imbarih"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوه، امس",
            "tashkeelText": "أَيْوَه، أَمْس",
            "transliteration": "aywa, ams"
          }
        }
      }
    },
    "hasGenderVariation": true,
    "tags": ["question", "travel", "logistics", "request"],
      "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "حجزت _____",
          "displaySentenceTashkeel": "حَجَزْت _____",
          "displaySentenceTransliteration": "hagazt _____",
          "blankWords": [
            {
              "word": "التذكرة",
              "tashkeelWord": "التَّذْكِرَة",
              "transliteration": "it-tadhkira",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "العربية",
              "tashkeelWord": "العَرَبِيَّة",
              "transliteration": "il-'arabiyya",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "حجزت _____",
          "displaySentenceTashkeel": "حَجَزْت _____",
          "displaySentenceTransliteration": "hajazt _____",
          "blankWords": [
            {
              "word": "التذكرة",
              "tashkeelWord": "التَّذْكِرَة",
              "transliteration": "it-tadhkira",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "السيارة",
              "tashkeelWord": "السَّيَّارَة",
              "transliteration": "is-sayyara",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }

  },
  {
    "englishTranslation": "I booked my ticket",
    "intent": "Say I booked my ticket",
    "context": {
      "whenToUse": "When confirming flight reservation is done",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "حجزت التذكرة",
          "tashkeelText": "حَجَزْت التَّذْكِرَة",
          "transliteration": "hagazt it-tadhkira"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "حجزت التذكرة",
          "tashkeelText": "حَجَزْت التَّذْكِرَة",
          "transliteration": "hajazt it-tadhkira"
        }
      }
    },
    "followUp": null,
    "hasGenderVariation": false,
    "tags": ["statement", "travel", "logistics", "confirmation"],
      "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "حجزت _____",
          "displaySentenceTashkeel": "حَجَزْت _____",
          "displaySentenceTransliteration": "hagazt _____",
          "blankWords": [
            {
              "word": "التذكرة",
              "tashkeelWord": "التَّذْكِرَة",
              "transliteration": "it-tadhkira",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "العربية",
              "tashkeelWord": "العَرَبِيَّة",
              "transliteration": "il-'arabiyya",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "حجزت _____",
          "displaySentenceTashkeel": "حَجَزْت _____",
          "displaySentenceTransliteration": "hajazt _____",
          "blankWords": [
            {
              "word": "التذكرة",
              "tashkeelWord": "التَّذْكِرَة",
              "transliteration": "it-tadhkira",
              "isCorrect": true
            },
            {
              "word": "الفندق",
              "tashkeelWord": "الفُنْدُق",
              "transliteration": "il-funduq",
              "isCorrect": false
            },
            {
              "word": "السيارة",
              "tashkeelWord": "السَّيَّارَة",
              "transliteration": "is-sayyara",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "How much is the ticket?",
    "intent": "Ask how much the ticket costs",
    "context": {
      "whenToUse": "When asking about flight price",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التذكرة بكام؟",
          "tashkeelText": "التَّذْكِرَة بِكَام؟",
          "transliteration": "it-tadhkira bikam?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التذكرة بكم؟",
          "tashkeelText": "التَّذْكِرَة بِكَم؟",
          "transliteration": "it-tadhkira bikam?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Two thousand riyals",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ألفين جنيه",
            "tashkeelText": "أَلْفَيْن جُنَيْه",
            "transliteration": "alfein guineh"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ألفين ريال",
            "tashkeelText": "أَلْفَيْن رِيَال",
            "transliteration": "alfein riyal"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["question", "price", "travel", "logistics"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "التذكرة _____؟",
          "displaySentenceTashkeel": "التَّذْكِرَة _____؟",
          "displaySentenceTransliteration": "it-tadhkira _____?",
          "blankWords": [
            {
              "word": "بكام",
              "tashkeelWord": "بِكَام",
              "transliteration": "bikam",
              "isCorrect": true
            },
            {
              "word": "فين",
              "tashkeelWord": "فِين",
              "transliteration": "fein",
              "isCorrect": false
            },
            {
              "word": "امتى",
              "tashkeelWord": "إمْتَى",
              "transliteration": "imta",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "التذكرة _____؟",
          "displaySentenceTashkeel": "التَّذْكِرَة _____؟",
          "displaySentenceTransliteration": "it-tadhkira _____?",
          "blankWords": [
            {
              "word": "بكم",
              "tashkeelWord": "بِكَم",
              "transliteration": "bikam",
              "isCorrect": true
            },
            {
              "word": "وين",
              "tashkeelWord": "وَيْن",
              "transliteration": "wein",
              "isCorrect": false
            },
            {
              "word": "متى",
              "tashkeelWord": "مَتَى",
              "transliteration": "mata",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "The ticket is expensive",
    "intent": "Say the ticket is expensive",
    "context": {
      "whenToUse": "When complaining about high flight costs",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التذكرة غالية",
          "tashkeelText": "التَّذْكِرَة غَالْيَة",
          "transliteration": "it-tadhkira ghalya"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "التذكرة غالية",
          "tashkeelText": "التَّذْكِرَة غَالْيَة",
          "transliteration": "it-tadhkira ghalya"
        }
      }
    },
    "followUp": {
      "englishTranslation": "I didn't find a good price",
      "isSamePerson": true,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ما لقيتش سعر كويس",
            "tashkeelText": "مَا لَقِيتِش سِعْر كُوَيِّس",
            "transliteration": "ma la'etsh se'r kuwayyis"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ما لقيت سعر حلو",
            "tashkeelText": "مَا لَقِيت سِعْر حِلْو",
            "transliteration": "ma la'et se'r hilw"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["statement", "opinion", "price", "travel"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "التذكرة _____",
          "displaySentenceTashkeel": "التَّذْكِرَة _____",
          "displaySentenceTransliteration": "it-tadhkira _____",
          "blankWords": [
            {
              "word": "غالية",
              "tashkeelWord": "غَالْيَة",
              "transliteration": "ghalya",
              "isCorrect": true
            },
            {
              "word": "رخيصة",
              "tashkeelWord": "رَخِيصَة",
              "transliteration": "rakhisa",
              "isCorrect": false
            },
            {
              "word": "حلوة",
              "tashkeelWord": "حِلْوَة",
              "transliteration": "hilwa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "التذكرة _____",
          "displaySentenceTashkeel": "التَّذْكِرَة _____",
          "displaySentenceTransliteration": "it-tadhkira _____",
          "blankWords": [
            {
              "word": "غالية",
              "tashkeelWord": "غَالْيَة",
              "transliteration": "ghalya",
              "isCorrect": true
            },
            {
              "word": "رخيصة",
              "tashkeelWord": "رَخِيصَة",
              "transliteration": "rakhisa",
              "isCorrect": false
            },
            {
              "word": "حلوة",
              "tashkeelWord": "حِلْوَة",
              "transliteration": "hilwa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "I'm preparing my bag now",
    "intent": "Say I'm preparing my bag now",
    "context": {
      "whenToUse": "When actively packing before travel",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "بجهز الشنطة دلوقتي",
          "tashkeelText": "بِجَهِّز الشَّنْطَة دِلْوَقْتِي",
          "transliteration": "bagahhiz il-shanta dilwa'ti"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "بجهز الشنطة الحين",
          "tashkeelText": "بِجَهِّز الشَّنْطَة الحِين",
          "transliteration": "bagahhiz il-shanta il-heen"
        }
      }
    },
    "followUp": null,
    "hasGenderVariation": false,
    "tags": ["statement", "travel", "logistics", "urgent"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "بجهز _____ دلوقتي",
          "displaySentenceTashkeel": "بِجَهِّز _____ دِلْوَقْتِي",
          "displaySentenceTransliteration": "bagahhiz _____ dilwa'ti",
          "blankWords": [
            {
              "word": "الشنطة",
              "tashkeelWord": "الشَّنْطَة",
              "transliteration": "il-shanta",
              "isCorrect": true
            },
            {
              "word": "الاكل",
              "tashkeelWord": "الأَكْل",
              "transliteration": "il-akl",
              "isCorrect": false
            },
            {
              "word": "الشاي",
              "tashkeelWord": "الشَّاي",
              "transliteration": "ish-shay",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "intermediate",
          "displaySentence": "بجهز _____ الحين",
          "displaySentenceTashkeel": "بِجَهِّز _____ الحِين",
          "displaySentenceTransliteration": "bagahhiz _____ il-heen",
          "blankWords": [
            {
              "word": "الشنطة",
              "tashkeelWord": "الشَّنْطَة",
              "transliteration": "il-shanta",
              "isCorrect": true
            },
            {
              "word": "الاكل",
              "tashkeelWord": "الأَكْل",
              "transliteration": "il-akl",
              "isCorrect": false
            },
            {
              "word": "القهوة",
              "tashkeelWord": "القَهْوَة",
              "transliteration": "il-qahwa",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "How much weight is allowed?",
    "intent": "Ask how much weight is allowed",
    "context": {
      "whenToUse": "When checking baggage weight limit",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "كام الوزن المسموح؟",
          "tashkeelText": "كَام الوَزْن المَسْمُوح؟",
          "transliteration": "kam il-wazn il-masmuh?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "كم الوزن المسموح؟",
          "tashkeelText": "كَم الوَزْن المَسْمُوح؟",
          "transliteration": "kam il-wazn il-masmuh?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Twenty-three kilos",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ثلاثة وعشرين كيلو",
            "tashkeelText": "ثَلَاثَة وَعِشْرِين كِيلُو",
            "transliteration": "talata wi-'ishreen kilo"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ثلاثة وعشرين كيلو",
            "tashkeelText": "ثَلَاثَة وَعِشْرِين كِيلُو",
            "transliteration": "thalatha wi-'ishreen kilo"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["question", "travel", "logistics", "request"],
      "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "كام _____ المسموح؟",
          "displaySentenceTashkeel": "كَام _____ المَسْمُوح؟",
          "displaySentenceTransliteration": "kam _____ il-masmuh?",
          "blankWords": [
            {
              "word": "الوزن",
              "tashkeelWord": "الوَزْن",
              "transliteration": "il-wazn",
              "isCorrect": true
            },
            {
              "word": "السعر",
              "tashkeelWord": "السِّعْر",
              "transliteration": "is-se'r",
              "isCorrect": false
            },
            {
              "word": "الوقت",
              "tashkeelWord": "الوَقْت",
              "transliteration": "il-wa't",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "كم _____ المسموح؟",
          "displaySentenceTashkeel": "كَم _____ المَسْمُوح؟",
          "displaySentenceTransliteration": "kam _____ il-masmuh?",
          "blankWords": [
            {
              "word": "الوزن",
              "tashkeelWord": "الوَزْن",
              "transliteration": "il-wazn",
              "isCorrect": true
            },
            {
              "word": "السعر",
              "tashkeelWord": "السِّعْر",
              "transliteration": "is-se'r",
              "isCorrect": false
            },
            {
              "word": "الوقت",
              "tashkeelWord": "الوَقْت",
              "transliteration": "il-wa't",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "msa": []
    }
  },
  {
    "englishTranslation": "I'm done packing",
    "intent": "Say I'm done packing",
    "context": {
      "whenToUse": "When finished preparing luggage",
      "formality": "informal"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "جهزت الشنطة",
          "tashkeelText": "جَهَّزْت الشَّنْطَة",
          "transliteration": "gahhizt il-shanta"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "جهزت الشنطة",
          "tashkeelText": "جَهَّزْت الشَّنْطَة",
          "transliteration": "gahhizt il-shanta"
        }
      }
    },
    "followUp": null,
    "hasGenderVariation": false,
    "tags": ["statement", "travel", "logistics", "confirmation"],

  },
  {
    "englishTranslation": "Do I need to weigh my bag?",
    "intent": "Ask if I need to weigh my bag",
    "context": {
      "whenToUse": "When unsure about baggage weight check requirement",
      "formality": "neutral"
    },
    "variations": {
      "msa": null,
      "egyptian": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "لازم اوزن الشنطة؟",
          "tashkeelText": "لَازِم أوَزِّن الشَّنْطَة؟",
          "transliteration": "lazim awazzin il-shanta?"
        }
      },
      "saudi": {
        "male": null,
        "female": null,
        "neutral": {
          "text": "لازم اوزن الشنطة؟",
          "tashkeelText": "لَازِم أوَزِّن الشَّنْطَة؟",
          "transliteration": "lazim awazzin il-shanta?"
        }
      }
    },
    "followUp": {
      "englishTranslation": "Yes, at the desk",
      "isSamePerson": false,
      "variations": {
        "msa": null,
        "egyptian": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوة، عند الشباك",
            "tashkeelText": "أَيْوَة، عِنْد الشُّبَّاك",
            "transliteration": "aywa, 'ind il-shubbak"
          }
        },
        "saudi": {
          "male": null,
          "female": null,
          "neutral": {
            "text": "ايوه، عند المكتب",
            "tashkeelText": "أَيْوَه، عِنْد المَكْتَب",
            "transliteration": "aywa, 'ind il-maktab"
          }
        }
      }
    },
    "hasGenderVariation": false,
    "tags": ["question", "travel", "logistics", "request"],
     "exercises": {
      "egyptian": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "لازم _____ الشنطة؟",
          "displaySentenceTashkeel": "لَازِم _____ الشَّنْطَة؟",
          "displaySentenceTransliteration": "lazim _____ il-shanta?",
          "blankWords": [
            {
              "word": "اوزن",
              "tashkeelWord": "أوَزِّن",
              "transliteration": "awazzin",
              "isCorrect": true
            },
            {
              "word": "اشتري",
              "tashkeelWord": "أشْتَري",
              "transliteration": "ashtari",
              "isCorrect": false
            },
            {
              "word": "افتح",
              "tashkeelWord": "أفْتَح",
              "transliteration": "aftah",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
        }
      ],
      "saudi": [
        {
          "type": "fill-in-blank",
          "gender": "neutral",
          "difficulty": "beginner",
          "displaySentence": "لازم _____ الشنطة؟",
          "displaySentenceTashkeel": "لَازِم _____ الشَّنْطَة؟",
          "displaySentenceTransliteration": "lazim _____ il-shanta?",
          "blankWords": [
            {
              "word": "اوزن",
              "tashkeelWord": "أوَزِّن",
              "transliteration": "awazzin",
              "isCorrect": true
            },
            {
              "word": "اشتري",
              "tashkeelWord": "أشْتَري",
              "transliteration": "ashtari",
              "isCorrect": false
            },
            {
              "word": "افتح",
              "tashkeelWord": "أفْتَح",
              "transliteration": "aftah",
              "isCorrect": false
            }
          ],
          "reorderWords": [],
          "matchingPairs": []
    }],
      "msa": []
    }
  }
];

    const formality = 'neutral'; // Change this to filter by different formality
    const outputFileName = 'filtered-phrases-neutral.json'; // Output file name

    filterAndWritePhrases(phrasesArray, formality, outputFileName);
}

module.exports = filterAndWritePhrases;
