/**
 * Count words in Arabic text that may contain HTML tags
 * 
 * @param {string} htmlText - The input text which may contain HTML markup
 * @return {number} The number of words in the text
 */
function countArabicWords(htmlText) {
    // 1. Remove HTML tags
    const cleanText = htmlText.replace(/<[^>]*>/g, ' ');
    
    // 2. Normalize whitespace
    const normalizedText = cleanText.replace(/\s+/g, ' ').trim();
    
    // 3. Special handling for Arabic text
    // - Remove diacritics (harakat)
    const withoutDiacritics = normalizedText.replace(/[\u064B-\u065F\u0670]/g, '');
    
    // 4. Split by whitespace and count non-empty items
    const words = withoutDiacritics.split(' ').filter(word => word.length > 0);
    
    // 5. Return word count
    return words.length;
  }
  
  // Example usage:
  // const wordCount = countArabicWords(htmlText);
  // console.log(`Total Arabic words: ${wordCount}`);

module.exports = countArabicWords