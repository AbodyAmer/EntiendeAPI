/**
 * Script to reduce fill-in-blank options from 4 to 3
 * Removes the 4th option (last incorrect option) from each fillinWords array
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'oldPhraseData.json');

// Read the data
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`Processing ${data.length} phrases...`);

let totalOptionsReduced = 0;

// Process each phrase
data.forEach((phrase, phraseIndex) => {
  phrase.dialects.forEach((dialect, dialectIndex) => {
    if (dialect.fillinWords && dialect.fillinWords.length === 4) {
      // Remove the last option (4th option)
      dialect.fillinWords = dialect.fillinWords.slice(0, 3);
      totalOptionsReduced++;

      console.log(`✓ Phrase ${phraseIndex + 1}, ${dialect.dialect}: Reduced from 4 to 3 options`);
    }
  });
});

// Write the updated data back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ Complete! Reduced ${totalOptionsReduced} dialect variations from 4 to 3 options`);
console.log(`Updated file: ${dataPath}`);
