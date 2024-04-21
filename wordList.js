const fs = require('fs');

function loadWordList(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.split('\n').map(word => word.trim().toLowerCase());
}

function filterWordListByLength(wordList, length) {
    return wordList.filter(word => word.length === length);
}

const wordListFilePath = 'wordlist.txt';
const wordLength = 3;

const allWords = loadWordList(wordListFilePath);
const validWordsOfLength = filterWordListByLength(allWords, wordLength);

module.exports = validWordsOfLength;
