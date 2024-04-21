const fs = require('fs');

// Load the word list from a file
function loadWordList(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.split('\n').map(word => word.trim().toLowerCase());
}

// Filter the word list to include only words up to a certain length
function filterWordListByLength(wordList, maxLength) {
    return wordList.filter(word => word.length <= maxLength);
}

// Example usage
const wordListFilePath = 'words.txt';
const maxLength = 16;

const allWords = loadWordList(wordListFilePath);
const validWordsUpToMaxLength = filterWordListByLength(allWords, maxLength);

console.log(validWordsUpToMaxLength.length); // Number of valid words up to maxLength
