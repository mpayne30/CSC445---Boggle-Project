class Stack {
    constructor() {
        this.items = [];
    }

    // Returns if the stack is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Push an element onto the stack
    push(element) {
        this.items.push(element);
    }

    // Pop the top element from the stack
    pop() {
        if (this.isEmpty()) {
            return null; // Stack is empty
        }
        return this.items.pop();
    }

    // Return the top element without removing it
    peek() {
        if (this.isEmpty()) {
            return null; // Stack is empty
        }
        return this.items[this.items.length - 1];
    }

    // Get the size of the stack
    size() {
        return this.items.length;
    }

    // Clear all elements from the stack
    clear() {
        this.items = [];
    }

    // Joins all of the items into one string
    join() {
        return (this.items).join('');
    }
}

let timerActive = false;

let playerID;

let player1Points = 0;
let player2Points  = 0;

let submitArray = [];

let wordList = document.getElementById('wordList');
let wordArray = [];
let wordArray2 = [];

let currentWordID = new Stack();
let currentWordContent = new Stack();

let gridCells = []; // Array to store references to all grid cells of player 1

let letterGeneration = [];

const numRows = 4;
const numCols = 4;

let gameMode;

let timerInterval;
let seconds = 20;

const alphabet = "abcdefghijklmnopqrstuvwxyz";

function generateBoggleBoard(initial) {
    //Boggle dice regulation generation for a 4 x 4 board
    const generationMap = [["R","I","F","B","X"],["I","F","E","H","E","Y"],["D","E","N","O","W","S"],["U","T","O","K","N","D"],["H","M","S","R","A","O"],["L","U","P","E","T","S"],["A","C","I","T","O","A"],["Y","L","G","K","U","E"],["QU","B","M","J","O","A"],["E","H","I","S","P","N"],["V","E","T","I","G","N"],["B","A","L","I","Y","T"],["E","Z","A","V","N","D"],["R","A","L","E","S","C"],["U","W","I","L","R","G"],["P","A","C","E","M","D"]];

    const board = [];

    // Loop through each row
    if (initial === true){
        let row = [];

        for (let i= 1; i <= 16; i++){
            //Generates random letters based on the generation array
            const randomIndex = Math.floor(Math.random() * generationMap[i-1].length);
            const randomLetter = generationMap[i-1][randomIndex];
            row.push(randomLetter)

            if (i%4 === 0){
                //Pushes new row to the board every 4 elements
                board.push(row);
                row = [];
            }
        }

    } else {
        for (let i = 0; i < numRows; i++) {
            const row = [];

            // Loop through each column in the current row
            for (let j = 0; j < numCols; j++) {
                row.push(""); // Push empty string
            }

            board.push(row); // Push the row to the 2D array (board)
        }
    }
    createGrid(board, "grid")
}

// Function to create the grid from the letters list
function createGrid(letters, gridID) {
    const grid = document.getElementById(gridID);

    // Clear existing content
    grid.innerHTML = '';
    gridCells = []; // Reset gridCells array

    // Loop through each row in the letters list
    letters.forEach((rowData, rowIndex) => {
        const row = document.createElement('tr');

        // Loop through each letter in the row
        rowData.forEach((letter, colIndex) => {
            const cell = document.createElement('td');
            const cellContent = document.createElement('div'); // Create a <div> for cell content, acessible through cell.querySelector('div')
            cellContent.textContent = letter; // Set the text content of the <div>

            // Add styles to the cell content <div>
            cellContent.style.width = '100%';
            cellContent.style.height = '100%';
            cellContent.style.display = 'flex';
            cellContent.style.alignItems = 'center';
            cellContent.style.justifyContent = 'center';
            cellContent.style.backgroundColor = "rgb(115,205,230)";

            // Assign a unique ID to each cell based on its position
            const cellId = `cell-${rowIndex}-${colIndex}`;
            cell.setAttribute('id', cellId);
            cell.setAttribute('data-gridID', gridID);
            cell.setAttribute('data-on', false);
            cell.setAttribute('data-x', colIndex);
            cell.setAttribute('data-y', rowIndex);

            // Click listener
            cell.addEventListener('click', () => {
                const cellContent = cell.querySelector('div');
                    if (cell.getAttribute('data-on') === 'false' && isAdjacent(cell) && timerActive) {
                        cellContent.style.backgroundColor = "rgb(255, 225, 145)";
                        cell.setAttribute('data-on', 'true');

                        currentWordID.push(cell);
                        currentWordContent.push(cellContent.textContent);

                        document.getElementById("currentWord").textContent = ("Current Word: "+currentWordContent.join());
                    } else if (cell.getAttribute('data-on') === 'true' && cell.id === currentWordID.peek().id && timerActive) {
                        cell.setAttribute('data-on', 'false');
                        cellContent.style.backgroundColor = "rgb(115,205,230)";

                        currentWordID.pop();
                        currentWordContent.pop();

                        document.getElementById("currentWord").textContent = ("Current Word: "+currentWordContent.join());
                    }
            });

            cell.appendChild(cellContent); // Append the <div> to the cell
            row.appendChild(cell); // Append the cell to the row

            // Store reference to the cell in gridCells array
            if (!gridCells[rowIndex]) {
                gridCells[rowIndex] = [];
            }
            gridCells[rowIndex][colIndex] = cell;
        });

        grid.appendChild(row); // Append the row to the table
    });
}

function resestGridColor() {
    // Reset background color of all cells of the given player grid
    gridCells.forEach(row => {
        row.forEach(cell => {
            const cellContent = cell.querySelector('div');
            cellContent.style.backgroundColor = "rgb(115,205,230)";
            cell.setAttribute('data-on', false);
        });
    });
}

async function aiTurn() {

    //This introduces a random degree of difficulty with a minmum of 200 attempts and a max of 1200
    let wordAttempts = Math.floor(Math.random() * 1000) + 200;
    //let wordAttempts = 10000;
    console.log("AI Words Attemps Allowance: "+wordAttempts);
    for (let i = 0; i < wordAttempts; i++){
        // Clear the submitArray
        currentWordID.clear();
        currentWordContent.clear();

        let visited = new Set();  // To keep track of visited cells
        let path = [];  // To store the path of selected cells
        let word = "";

        // Start with a random cell
        let currentCell = {
            x: Math.floor(Math.random() * numCols),
            y: Math.floor(Math.random() * numRows)
        };
        visited.add(`${currentCell.x}-${currentCell.y}`);
        path.push(currentCell);
        word += gridCells[currentCell.y][currentCell.x].textContent;

        gridCells[currentCell.y][currentCell.x].querySelector('div').style.backgroundColor = "red";
        await new Promise(resolve => setTimeout(resolve, (seconds-1*1000)/(wordAttempts*0.9)));
        // randomly picks a length of either 3,4, or 5 to be checked
        let charactersChecked = Math.floor(Math.random() * 3) + 3;
        // Iteratively pick adjacent cells and form a word
       
        for (let i = 1; i < charactersChecked; i++) {  
            let adjacentCells = getAdjacentCells(currentCell.x, currentCell.y, visited);
            if (adjacentCells.length === 0) break;  // No more adjacent cells to explore

            // Select a random adjacent cell from those available
            currentCell = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
            gridCells[currentCell.y][currentCell.x].querySelector('div').style.backgroundColor = "red";
            visited.add(`${currentCell.x}-${currentCell.y}`);
            path.push(currentCell);
            word += gridCells[currentCell.y][currentCell.x].textContent;
            currentWordContent.push(gridCells[currentCell.y][currentCell.x].textContent);
            currentWordID.push(gridCells[currentCell.y][currentCell.x])
        }

        // Validate and score the word internally because of the alerts in submitWord
        submitWord();

        //Ends ai attemps at time limit reguardless of remaining attempts
        if (!timerActive){
            break;
        }
    }
}

function getAdjacentCells(x, y, visited) {
    let adjacentCells = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;  // Skip the current cell
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < numRows && ny >= 0 && ny < numCols && !visited.has(`${nx}-${ny}`)) {
                adjacentCells.push({ x: nx, y: ny });
            }
        }
    }
    return adjacentCells;
}

function showNotification(message) {
    const notificationBox = document.getElementById("notificationBox");
    notificationBox.textContent = message; // Set the message text
    notificationBox.style.display = 'block'; // Make the box visible

    // Hide the notification after 1 second (1000 milliseconds)
    setTimeout(() => {
        notificationBox.style.display = 'none';
    }, 1000);
}




function submitWord() {
    let word = currentWordContent.join();

    if (currentWordID.size() > 2 && wordValidation(word) && (wordArray.includes(word.toLowerCase()) != true)){
            //Get current players id, update appropriate score, reset board state.
            if (playerID === '01'){
                player1Points += calculateScore(word);
                document.querySelectorAll('.player1Score').forEach(element => {
                    if (gameMode === "singlePlayer"){
                        element.textContent = "Score: ".concat(player1Points);
                        
                    }
                    else if (gameMode === "twoPlayer") {
                        element.textContent = "Player 1's Score: ".concat(player1Points);
                    }
                });
            } else {
                if (wordArray2.includes(word.toLowerCase())) {
                    player1Points -= calculateScore(word);
                    document.querySelectorAll('.player1Score').forEach(element => { 
                    element.textContent = "Player 1's Score: ".concat(player1Points);
                    
                    showNotification("You've got a duplicate word there, score has been canceled.");
                    })
                    
                }
                else{
                player2Points += calculateScore(word);
                document.querySelectorAll('.player2Score').forEach(element => {
                if (gameMode === "twoPlayer")
                    element.textContent = "Player 2's Score: ".concat(player2Points);
                else if (gameMode === "playerVsAI") {
                    element.textContent = "Computer's Score: ".concat(player2Points);
                }
                });
            }
            }

            // Add valid submitted word to word list.
            const listItem = document.createElement('li');
            listItem.textContent = word;
            wordList.appendChild(listItem);
            wordArray.push(word.toLowerCase());

            // Reset text box
            currentWordID.clear();
            currentWordContent.clear();
            document.getElementById("currentWord").textContent = "Current Word: ";

            resestGridColor();
        } else {
            if (gameMode != "playerVsAI") {
                console.log("Failed to submit");
                alert("Word is invalid: failed to submit");
            }
            //console.log("AI Tried");
            resestGridColor();

            // Clear the submitArray
            currentWordID.clear();
            currentWordContent.clear();
            document.getElementById("currentWord").textContent = ("Current Word: "+currentWordContent.join());
    }
}

function wordValidation(word) {
    return validWords[alphabet.indexOf(word[0].toLowerCase())].includes(word.toLowerCase());
}

// Call after validity check called on word submit
function calculateScore(word) {
    const length = word.length;

    if (length >= 3 && length <= 4) {
        return 1;
    } else if (length === 5) {
        return 2;
    } else if (length === 6) {
        return 3;
    } else if (length === 7) {
        return 5;
    } else if (length >= 8) {
        return 11;
    } else {
        return 0; // Not in scoring range & should be unreachable
    }
}

function isAdjacent(cell){
    //If current word is empty any cell is able to be clicked
    if (currentWordID.isEmpty()){
        return true;
    }

    const x = parseInt(cell.getAttribute('data-x'));
    const y = parseInt(cell.getAttribute('data-y'));

    const lastCell = currentWordID.peek();
    const lastX = parseInt(lastCell.getAttribute('data-x'));
    const lastY = parseInt(lastCell.getAttribute('data-y'));

    // Check if the clicked cell is adjacent to the last clicked cell
    if (Math.abs(x - lastX) <= 1 && Math.abs(y - lastY) <= 1) {
        return true;
    } else {
        return false;
    }
}

function startTimer(){
    //Closes popup (should only matter at turn end and start of a new game after another just finished)
    const dialog = document.getElementById("turnEndDialog");
    dialog.close();
    //Cells should not be clickable when timer is not active, set to false by default
    timerActive = true;
    timer = seconds;

    document.getElementById("startButton").disabled = true;
    document.getElementById("endButton").disabled = false;

    timerInterval = setInterval(updateTimer, 1000) //Updates timer ever 1000 miliseconds
}

function updateTimer() {
    document.getElementById("timer").textContent = "Seconds Remaing: "+timer;
    timer = timer - 1;

    if (timer <= 0){
        clearInterval(timerInterval);
        document.getElementById("timer").textContent = "Seconds Remaing: "+timer;
        timer = seconds;
        timerActive = false;
        document.getElementById("startButton").disabled = false;
        document.getElementById("endButton").disabled = true;

        //Since playerID changes at turn end this check allows me to see if it is the first or second turn of a game instance.
        if (playerID === "01"){
            showTurnEnd();
        } else {
            showGameEnd();
        }
    }
}

function showTurnEnd() {
    // Clear the submitArray
    currentWordID.clear();
    currentWordContent.clear();
    wordArray2= [...wordArray];
        console.log(wordArray2);
    wordArray = [];
    timerActive = false;

    if (gameMode === "twoPlayer"){
        document.getElementById("endOfTurnText").textContent = "End of Player 1's Turn";
        document.getElementById("endOfTurnScore").textContent = "Score: "+player1Points;
        document.getElementById("endOfTurnButton").textContent = "Player 2's Turn";
        document.getElementById("currentWord").textContent = "Current Word: ";

        

        while (wordList.hasChildNodes()) {
            wordList.removeChild(wordList.firstChild);
        }

        const turnDialog = document.getElementById("turnEndDialog");
        turnDialog.showModal();
        playerID = "02";
    } else if (gameMode === "playerVsAI") {
        document.getElementById("endOfTurnText").textContent = "End of Player's Turn";
        document.getElementById("endOfTurnScore").textContent = "Score: " + player1Points;
        document.getElementById("endOfTurnButton").textContent = "Computer's Turn";
        document.getElementById("currentWord").textContent = "Current Word: ";

        while (wordList.hasChildNodes()) {
            wordList.removeChild(wordList.firstChild);
        }

        const turnDialog = document.getElementById("turnEndDialog");
        turnDialog.showModal();
        playerID = "Computer";
        turnDialog.addEventListener('close', aiTurn);  // Call AI turn when the dialog closes
    } else {
        showGameEnd();
    }

    resestGridColor();
}

function showGameEnd(){
    if (gameMode === "twoPlayer"){
        document.getElementById("endOfGameText").textContent = (player1Points === player2Points) ? "Its a tie!" : (player1Points > player2Points) ? "Player 1 Wins!" : "Player 2 Wins!";
        document.getElementById("endOfGameScore").textContent = "Scores: "+player1Points+" : "+player2Points;
        wordArray2 = [];
    } else if (gameMode === "playerVsAI"){
        document.getElementById("endOfGameText").textContent = (player1Points === player2Points) ? "Its a tie!" : (player1Points > player2Points) ? "Player Wins!" : "Computer Wins!";
        document.getElementById("endOfGameScore").textContent = "Scores: "+player1Points+" : "+player2Points;
        wordArray2 = [];
    } else {
        document.getElementById("endOfGameScore").textContent = "Score: "+player1Points;
        wordArray2 = [];
    }
    const endDialog = document.getElementById("gameEndDialog");
    wordArray2 = [];
    endDialog.showModal();
}

function resetTextBoxes(){
    document.getElementById("gridAndWordContainer").style.marginTop = "2.5%";
    wordArray2 = [];
    document.getElementById("singlePlayerScore").textContent = "Score: ";
    document.getElementById("player1").textContent = "Player 1's Score: ";
    document.getElementById("player2").textContent = "Player 2's Score: ";
    document.getElementById("AIScore").textContent = "Computer's Score: ";
    document.getElementById("currentWord").textContent = "Current Word: ";
    document.getElementById("wordList").textContent = "";

    document.getElementById("singlePlayerScore").style.display = "";
    document.getElementById("player1").style.display = "";
    document.getElementById("player2").style.display = "";
    document.getElementById("AIScore").style.display = "";
    document.getElementById("currentWord").style.display = "";
    document.getElementById("wordList").style.display = "";
}

function blockAllScoreBoxes() {
    document.getElementById("gridAndWordContainer").style.marginTop = "5%";
    document.getElementById("singlePlayerScore").style.display = "none";
    document.getElementById("player1").style.display = "none";
    document.getElementById("player2").style.display = "none";
    document.getElementById("AIScore").style.display = "none";
}

function setGameMode(gm) {
    gameMode = gm;
    if (gameMode === "twoPlayer") {
        // Start turn of player 1 after click input, show both score items, show turn end overlay, start player 2 turn, and dispaly score overlay at the end of the time.
        console.log("Player Vs. Player");
        document.getElementById("singlePlayerScore").style.display = "none";
        document.getElementById("AIScore").style.display = "none";

        playerID = "01";
        startTimer();
    } else if (gameMode === "playerVsAI") {
        // Start turn of player 1 after click input, show both score items, show turn end overlay, start AI Player turn.
        console.log("Player Vs. AI");
        document.getElementById("singlePlayerScore").style.display = "none";
        document.getElementById("player2").style.display = "none";

        playerID = "01";
        startTimer();
    } else {
        // Start the timer and only display one player score item, dispaly score over lay at the end of timer
        console.log("Single Player");
        document.getElementById("player1").style.display = "none";
        document.getElementById("player2").style.display = "none";
        document.getElementById("AIScore").style.display = "none";

        playerID = "01";
        startTimer();
    }
}

//Implemented for demo and testing purposes
function skipTurn() {
    timer = 1;
    document.getElementById("skipTurnButton").disabled = true;
}

blockAllScoreBoxes();
generateBoggleBoard(false);

function startGame() {
    player1Points = 0;
    player2Points  = 0;
    wordArray2 = [];
    document.getElementById("turnEndDialog").close();
    document.getElementById("gameEndDialog").close();
    clearInterval(timerInterval);
    resetTextBoxes();
    generateBoggleBoard(true);
    setGameMode(document.getElementById("gameModeSelector").value);
    document.getElementById("skipTurnButton").disabled = false;
}

function stopGame() {
    document.getElementById("turnEndDialog").close();
    document.getElementById("gameEndDialog").close();
    document.getElementById("endButton").disabled = true;
    document.getElementById("startButton").disabled = false;
    document.getElementById("skipTurnButton").disabled = true;

    document.getElementById("timer").textContent = "Seconds Remaining: ";
    clearInterval(timerInterval);
    resetTextBoxes();
    blockAllScoreBoxes();
    generateBoggleBoard(false);
}

let validWords = [["and", "all", "about", "anything", "any", "again", "away", "after", "around", "always", "actually", "another", "ask", "already", "alone", "anyone", "anyway", "anymore", "ago", "afraid", "anybody", "alright", "able", "against", "almost", "answer", "also", "ahead", "along", "alive", "anywhere", "act", "admit", "apartment", "accident", "angry", "angel", "agree", "attention", "aunt", "apart", "accept", "advice", "afternoon", "apologise", "across", "age", "awful", "agent", "attack", "arrest", "although", "amber", "area", "are", "add", "above", "addition", "among", "amount", "angle", "animal", "appear", "apple", "art", "autumn", "Archaic", "arm", "assume", "asleep", "action", "allow", "aware", "address", "airport", "afford", "army", "account", "attitude", "advantage", "available", "aside", "affair", "assistant", "anytime", "awake", "avoid", "access", "ate", "apology", "anger", "ashame", "awesome", "argue", "alarm", "argument", "agreement", "article", "alcohol", "ability", "abuse", "accurate", "acquire", "absence", "apricot", "attribute", "awhile", "artist", "ambulance", "assure", "accuse", "ash", "audience", "adult", "awfully", "agency", "alien", "ancient", "anxious", "actual", "attract", "attempt", "approach", "actor", "attic", "armed", "affect", "authority", "admire", "abandon", "agenda", "annoying", "assault", "alley", "award", "attached", "aisle", "amen", "arrange", "annulment", "afterward", "adventure", "anti", "average", "announce", "abroad", "absorb", "academic", "accompany", "achieve", "acid", "adapt", "adequate", "adjust", "adopt", "advance", "advise", "amazing", "attorney", "awkward", "approve", "absolute", "adorable", "alike", "audition", "alert", "activity", "attend", "aid", "arrive", "apply", "air", "appeal", "aids", "aboard", "allergic", "approval", "auction", "appetite", "anyhow", "ashes", "ally", "ace", "absurd", "adoption", "associate", "actress", "amusing", "altar", "active", "avenue", "ankle", "amnesia", "auto", "arrogant", "advanced", "August", "aspirin", "academy", "analysis", "aim", "airplane", "arson", "April", "alliance", "album", "accent", "affection", "adore", "annual", "asset", "alibi", "alcoholic", "anxiety", "arrow", "abbey", "ant", "ancestor", "abnormal", "absent", "abstract", "abundant", "acute", "addicted", "aesthetic", "agile", "ambiguous", "ambitious", "ample", "anonymous", "artistic", "assertive", "automatic", "advertise", "attain", "avail", "according", "autograph", "allright", "airline", "attending", "abortion", "assist", "arrival", "antique", "ads", "anchor", "addict", "almighty", "arriving", "adding", "amendment", "appliance", "amateur", "amulet", "addiction", "agreeing", "agony", "adorn", "ambition", "alternate", "axe", "admission", "abduct", "alter", "assassin", "antidote", "analyze", "allowance", "adjourn", "author", "amongst", "aspen", "anyplace", "accessory", "assembly", "admired", "amend", "advisor", "appealing", "asking", "apparent", "arctic", "allergy", "await", "ambush", "abort", "apron", "amusement", "awareness", "adamant", "aspect", "abusive", "assurance", "amuse", "alienate", "abdomen", "arbitrary", "abode", "abolish", "abound", "abrupt", "accord", "accustom", "acquaint", "adhere", "adjective", "adverb", "adversary", "affirm", "agrarian", "allege", "allot", "alloy", "allude", "allusion", "aloud", "alphabet", "altitude", "aluminium", "amass", "amid", "amnesty", "amorous", "anaemia", "analogy", "anatomy", "anew", "animate", "animosity", "annex", "anomalous", "anthem", "antipathy", "apathetic", "apostle", "apparatus", "appease", "appendix", "appoint", "appraise", "apt", "Arab", "arc", "archives", "ardent", "armchair", "armistice", "armpit", "aroma", "arouse", "arrears", "artful", "ascend", "ascertain", "ashore", "asparagus", "assent", "assert", "astray", "atheism", "atrocious", "audible", "austerity", "auxiliary", "avalanche", "aversion", "aviation", "autopsy", "artery", "auntie", "admiral", "architect", "applause", "alongside", "ale", "asylum", "authentic", "aircraft", "adjusted", "agitate", "athletic", "awe", "arena", "audio", "acre", "alias", "aging", "ark", "annoyance", "admirer", "admirable", "activate", "amazingly", "annoy", "arcade", "attendant", "athlete", "amaze", "ache", "awaiting", "assign", "arrogance", "arsonist", "atomic", "asthma", "arise", "ashtray", "arch", "advocate", "applaud", "appalling", "argon", "aura", "ape", "abide", "artillery", "apiece", "abduction", "astronaut", "aiming", "aching", "armour", "alimony", "archer", "ante", "aggravate", "aback", "abash", "abate", "abdicate", "abject", "absolve", "abstain", "abundance", "acclaim", "accrue", "accuracy", "acerbity", "acorn", "acquit", "acrid", "adjacent", "adjoin", "admonish", "adroit", "adultery", "aerial", "affinity", "affront", "aghast", "alight", "alignment", "alleviate", "amiable", "antler", "arable", "arid", "asunder", "audacious", "augment", "abattoir", "abbot", "abed", "abberance", "abberant", "abet", "abhor", "abhorrent", "abjection", "abjure", "ablative", "ablaze", "ably", "abnegate", "abortive", "abrasive", "abreast", "abridge", "absently", "absorbing", "abyss", "accede", "accolade", "accuser", "acheless", "achy", "acne", "addressee", "adept", "adherence", "ado", "adornment", "adulate", "adulatory", "adulthood", "adverse", "adversity", "advisedly", "advocacy", "affable", "affluence", "affluent", "afloat", "aggregate", "agreeable", "ail", "ailment", "aimless", "airless", "airy", "akin", "alacrity", "albeit", "alcove", "alertness", "allay", "allocate", "allure", "aloof", "ambient", "ambiguity", "amendable", "amenity", "amoral", "amorphous", "amplify", "amplitude", "anchovy", "angrily", "anguish", "angular", "anoitment", "antarctic", "antenna", "anteroom", "apathy", "aplenty", "appal", "append", "applicant", "appraisal", "aptitude", "aptly", "archery", "archly", "ardently", "arduous", "armament", "armature", "armless", "armory", "array", "artless", "artsy", "ascension", "ashy", "askew", "asperity", "aspirant", "assail", "assort", "assuage", "astound", "atonement", "atrocity", "attentive", "attenuate", "attest", "attire", "attrition", "attune", "aubergine", "audacity", "audibly", "auditory", "auspice", "avenge", "avert", "avid", "avouch", "avow", "aweless", "axis"] , ["but", "back", "because", "before", "better", "believe", "big", "bad", "baby", "best", "both", "business", "bye", "bring", "beautiful", "between", "bit", "break", "bed", "behind", "bet", "blood", "buy", "body", "boy", "besides", "busy", "black", "broke", "blame", "become", "buddy", "boyfriend", "birthday", "bill", "building", "beat", "bar", "box", "blow", "bag", "ball", "blue", "bother", "broken", "boss", "born", "boat", "brain", "breakfast", "board", "bunch", "bell", "beer", "book", "begin", "bottom", "bathroom", "bus", "build", "birth", "bird", "bee", "bank", "base", "bear", "belong", "block", "bone", "brown", "bacon", "breaking", "bedroom", "bigger", "breath", "band", "bottle", "beyond", "barely", "biggest", "burn", "bite", "beach", "bright", "blind", "bride", "brilliant", "beg", "bomb", "bout", "bloody", "beauty", "became", "boring", "badly", "built", "brave", "basically", "bullet", "bridge", "bike", "borrow", "battle", "bail", "bleeding", "bury", "brother", "basement", "bust", "bond", "becoming", "bath", "bread", "butter", "basket", "balance", "beef", "blanket", "bake", "barrier", "battery", "beard", "behave", "beside", "bicycle", "bin", "biscuit", "bonus", "brush", "bucket", "budget", "butcher", "beetle", "bracket", "bug", "button", "bull", "benefit", "bored", "bat", "bless", "blonde", "brains", "brand", "bowl", "bound", "boom", "belt", "bay", "badge", "barn", "brandy", "backup", "blast", "basic", "bang", "boots", "below", "bum", "boxing", "burger", "bean", "bush", "blink", "backwards", "behalf", "beneath", "bid", "bloke", "boil", "boiler", "border", "bounce", "branch", "breast", "brick", "brief", "briefly", "broad", "bump", "buyer", "blackmail", "barb", "bargain", "British", "bitter", "beast", "bizarre", "basis", "betray", "bunny", "bracelet", "bow", "booth", "bench", "Bible", "belief", "blank", "blessing", "billion", "bait", "burst", "booze", "bulldog", "bra", "bend", "bubble", "beloved", "bent", "bowling", "belly", "bachelor", "balcony", "bare", "burden", "blade", "bureau", "breakdown", "bald", "baker", "briefcase", "beacon", "beaten", "bribe", "boot", "banana", "bleed", "barbecue", "brass", "barrel", "balloon", "broadcast", "brutal", "burnt", "betrayal", "bustle", "buff", "bore", "beep", "bedtime", "bloom", "banking", "balanced", "backyard", "baggage", "ballet", "barbarian", "barber", "barefoot", "bark", "bathe", "beak", "been", "beginner", "beginning", "beige", "being", "biased", "bikini", "billboard", "billiards", "bind", "biography", "biology", "bishop", "blend", "blossom", "blouse", "blown", "blush", "bold", "boundary", "brag", "breadth", "breakup", "breathe", "breed", "breeze", "bribery", "bronze", "browse", "bruise", "buffet", "bumper", "bundle", "burglar", "burp", "boast", "bob", "breathing", "begging", "baseball", "buzz", "bullying", "bogus", "banner", "bailed", "bolt", "betting", "briefing", "bluff", "butler", "bully", "barge", "balm", "bearing", "brook", "boutique", "boob", "bodyguard", "beam", "babble", "broom", "butt", "batch", "behold", "banging", "bouquet", "bailey", "blocking", "backpack", "backstage", "breach", "boost", "bliss", "brake", "bounty", "bloodless", "beware", "brace", "blunt", "broker", "burka", "bun", "burial", "bookstore", "bummer", "ballistic", "blizzard", "behead", "bridal", "bedside", "buckle", "bouncing", "bass", "baking", "betraying", "bruised", "bankrupt", "bulb", "blueberry", "boredom", "bandage", "brainwash", "booking", "bossy", "bacteria", "bale", "bamboo", "barley", "barracks", "barren", "barricade", "barter", "beech", "beetroot", "bereave", "berch", "bilateral", "birch", "bladder", "bleat", "blister", "blot", "boar", "bonfire", "bonnet", "botany", "boycott", "boyish", "brim", "brisk", "brooch", "brood", "brow", "bulk", "bulletin", "buoyancy", "bastard", "burns", "bathtub", "brunch", "barrister", "booty", "blushing", "breaker", "bakery", "bunk", "bitten", "butterfly", "biopsy", "bragging", "blackout", "backfire", "bagel", "bottled", "bash", "brochure", "behaviour", "bypass", "breeding", "boxer", "binding", "bygone", "buzzing", "budge", "belonging", "brink", "berry", "banker", "ballroom", "believer", "brighten", "banquet", "brunette", "beverage", "brightest", "banned", "bubbly", "beeper", "baptism", "brew", "borrowing", "boiling", "bate", "burglary", "bumpy", "blaze", "bursting", "breather", "bending", "blur", "bleach", "beck", "ban", "backseat", "bunker", "bud", "baloney", "blender", "bitty", "bead", "badger", "beaver", "bearer", "banish", "bowel", "benign", "boulevard", "bookie", "baptize", "bane", "bailiff", "bodily", "bleak", "blacked", "batter", "bayonet", "beehive", "beseech", "besiege", "bile", "blemish", "blunder", "bough", "brazen", "brevity", "bristle", "brittle", "broth", "buck", "bulging", "backache", "baggy", "bagpipe", "balk", "ballot", "banal", "banter", "baseless", "bashful", "basin", "bask", "bazaar", "beastly", "beautify", "bedding", "bedevil", "bedridden", "beefy", "befriend", "beggarly", "begrudge", "bellow", "benignity", "berth", "beset", "bestial", "bestow", "bewitch", "bigot", "bilingual", "blackness", "blameless", "blare", "blaspheme", "blindly", "blindness", "blissful", "bloat", "blotch", "blubber", "bluffy", "bluish", "bluster", "boastful", "bog", "bookcase", "bookworm", "borough", "braid", "brainless", "brash", "brute", "bystander"] ,["can", "come", "call", "care", "course", "came", "car", "cause", "chance", "case", "check", "crazy", "couple", "close", "cool", "child", "cut", "children", "clear", "coffee", "Christmas", "company", "control", "change", "certainly", "choice", "crane", "city", "class", "catch", "country", "club", "calm", "court", "clean", "charity", "careful", "count", "college", "cute", "clothe", "certain", "cover", "captain", "card", "crime", "cell", "concern", "charge", "chief", "cat", "consider", "cash", "complete", "closely", "church", "contact", "cry", "cake", "computer", "chicken", "chat", "cup", "cannot", "capital", "carry", "centre", "century", "circle", "cloud", "cost", "cold", "column", "common", "compere", "condition", "contain", "continue", "cook", "copy", "cow", "create", "cross", "crowd", "choose", "credit", "crap", "crying", "camera", "cream", "convince", "client", "chair", "confused", "cousin", "code", "corner", "champagne", "carrying", "coat", "clearly", "celebrate", "custody", "center", "cheese", "covered", "colour", "capable", "correct", "clue", "criminal", "couch", "chocolate", "character", "crash", "curious", "closet", "candy", "community", "contract", "cheap", "clock", "changing", "career", "chest", "camp", "committed", "ceremony", "Chinese", "campaign", "chose", "comfort", "crack", "connected", "chase", "cast", "cancer", "crew", "cabin", "chef", "counting", "cleaning", "charming", "claim", "cancel", "crisis", "clinic", "carrot", "cope", "compound", "carpet", "cereal", "champion", "chemical", "cheque", "cherry", "cigarette", "cinema", "citizen", "classroom", "concise", "con", "cooking", "coach", "carter", "cruel", "crush", "commit", "cheer", "clever", "confess", "chip", "chill", "cure", "covering", "coast", "cheating", "curse", "cloth", "concert", "chain", "charm", "classic", "civil", "county", "contest", "carefully", "courage", "costume", "cable", "chosen", "china", "counter", "channel", "creep", "council", "clown", "customer", "creature", "comment", "candle", "castle", "cooper", "childhood", "causless", "central", "cookie", "creepy", "clay", "current", "chips", "collect", "confident", "climb", "crawl", "convicted", "counsel", "creative", "cage", "cabinet", "calculate", "calendar", "candidate", "cap", "capacity", "capture", "catalogue", "category", "cease", "ceiling", "chairman", "chap", "chapter", "chart", "cheek", "chemist", "chemistry", "clerk", "click", "climate", "coal", "coin", "collapse", "collar", "colleague", "consent", "crocodile", "challenge", "cave", "committee", "campus", "cowboy", "concept", "cheat", "catching", "circus", "Canadian", "cruise", "cottage", "corporate", "chop", "costs", "cliff", "corn", "confirm", "crystal", "constant", "connect", "critical", "coward", "complex", "compare", "cocktail", "corky", "complain", "chaos", "chin", "clothing", "contrary", "cotton", "cooked", "chapel", "core", "cooperate", "coke", "cafeteria", "conscious", "carver", "coffin", "chamber", "casino", "cascade", "crossing", "cozy", "culture", "closest", "conflict", "crawling", "congress", "casual", "conduct", "comic", "confront", "catholic", "comedy", "courtesy", "caller", "curiosity", "cough", "crushed", "cosmetics", "cent", "crown", "creek", "camping", "creation", "condo", "cemetery", "Christian", "compete", "currently", "chew", "corpse", "chopper", "cart", "cursed", "content", "combat", "corporal", "could", "choir", "chess", "confusion", "cutter", "correctly", "complaint", "curtain", "choke", "cock", "clip", "climbing", "cigar", "cycle", "celebrity", "clearance", "coverage", "corridor", "confide", "custom", "cement", "cologne", "corrupt", "conquer", "criticism", "coupon", "canvas", "currency", "cab", "cabbage", "calf", "calorie", "camel", "canal", "cane", "cannon", "canyon", "cape", "caption", "carbon", "cardboard", "careless", "cargo", "carpenter", "carriage", "carsick", "cartoon", "cashier", "cassette", "casualty", "cattle", "caught", "caution", "cautious", "cellar", "Celsius", "censor", "chalk", "chilly", "chimney", "chore", "circuit", "civilian", "civilize", "clap", "clarify", "clash", "classical", "classify", "classmate", "clause", "cleaner", "clockwise", "clinical", "cloudy", "clumsy", "coalition", "coastline", "cocoa", "coconut", "coercive", "cogent", "coherence", "coherent", "colonel", "colonist", "colony", "colourful", "columnist", "comb", "comma", "command", "commerce", "commodity", "companion", "compass", "compute", "consist", "construct", "cucumber", "cuisine", "charges", "coma", "commander", "constable", "courtroom", "cooler", "cult", "consult", "classy", "charging", "captured", "cherish", "convict", "contempt", "crib", "concrete", "cuff", "coloured", "clearing", "crucial", "cheesy", "cranky", "cord", "curb", "continued", "caffeine", "condom", "coolest", "casting", "cracking", "compact", "clueless", "crappy", "crab", "chunk", "chandler", "confuse", "closure", "comfy", "caviar", "carnival", "chewing", "childish", "cardiac", "casket", "curve", "cone", "cracker", "clan", "cinnamon", "centered", "catering", "claw", "chopped", "curl", "comedian", "cynical", "coup", "chauffeur", "crop", "consulate", "chronic", "cedar", "cheering", "carved", "context", "copper", "cultural", "crude", "criticize", "candid", "cradle", "cremate", "crust", "conductor", "convert", "combine", "cushion", "crossroad", "crave", "craft", "conceal", "calory", "component", "conceited", "consonant", "consumer", "contented", "contrast", "copier", "cram", "crayon", "cricket", "cube", "cue", "culprit", "cupboard", "customs", "cylinder", "calamity", "camomile", "canary", "candied", "canteen", "canvass", "caprice", "captivity", "caravan", "cardinal", "caress", "carp", "cartrige", "cask", "cataract", "cathedral", "cavalry", "cede", "celery", "census", "cessation", "chaste", "chatter", "chirp", "chisel", "chord", "cipher", "clad", "clang", "clasp", "clatter", "clench", "clod", "clove", "clutch", "coarse", "coax", "cobbler", "cod", "cognition", "coil", "colt", "comet", "commence", "commotion", "compel", "compile", "compose", "compress", "comprise", "concord", "condensed", "confer", "conform", "consensus", "constrain", "construe", "consume", "contend", "continual", "convey", "coral", "cosy", "countess", "crater", "crayfish", "crease", "creche", "credulous", "crescent", "crest", "croak", "crochet", "crockery", "crumple", "crusade", "cudgel", "currant", "cutlery", "cutlet", "cyber", "cypress", "crock", "clamp", "canned", "carrier", "convent", "captive", "crow", "cocky", "chained", "comeback", "cheaper", "charter", "calling", "crate", "competent", "crunch", "cramp", "corny", "cellular", "curly", "cupid", "comrade", "cola", "crooked", "crook", "colon", "critic", "crummy", "carve", "cubicle", "certified", "crimson", "continent", "cider", "cranberry", "covert", "chorus", "caterer", "cruelty", "countdown", "crushing", "clinging", "checkbook", "cashmere", "calmly", "conceive", "clone", "caliber", "cosmic", "cheerful", "cornered", "cork", "copied", "crippled", "craving", "connote", "clam", "colonial", "carton", "cunning", "cripple", "cove", "clubhouse", "clot", "cheater", "coy", "countless", "conjure", "confine", "chateau", "cuter", "container", "cavity", "Capricorn", "cuckoo", "craziness", "creeping", "classics", "crisp", "cling", "cloak", "casserole", "cryptic", "creed", "condemn", "colossal", "clipper", "clarity", "cupcake", "console", "chimera", "cheery", "cadet", "curry", "crumb", "courier", "conclude", "cockroach", "cuddle", "cub", "collector", "collision", "chic", "callous", "caprize", "caraway", "cloister", "coexist", "confound", "covetous", "cower", "crag", "crevice", "crutch", "calmness", "calumny", "candour", "capacious", "captivate", "carious", "catchy", "cater", "cattish", "caw", "ceasless", "ceramic", "chafe", "chagrin", "chancy", "chastise", "cheapen", "cheerless", "chestnut", "circular", "civic", "clack", "cleave", "cleaver", "cleft", "clemency", "clement", "clergy", "clergyman", "climax", "clinch", "cloakroom", "clog", "closeness", "clotted", "cloudless", "clout", "cluster", "clutter", "cockpit", "cogitate", "cognate", "cohabit", "cohere", "cohort", "colander", "coldness", "collide", "comely", "concede", "concourse", "concur", "condiment", "condole", "congest", "congruous", "connate", "conserve", "cosign", "constrict", "contagion", "contemn", "convene", "cookery", "corpulent", "cordial", "credulity", "crimpy", "culinary"] ,["down", "dad", "dead", "deal", "day", "daughter", "door", "doctor", "different", "die", "dinner", "date", "death", "drink", "dear", "drive", "drop", "dream", "dance", "dog", "decision", "deserve", "dress", "dark", "dollar", "doubt", "deep", "difficult", "driving", "dying", "decide", "double", "during", "discuss", "destroy", "demon", "drunk", "danger", "drug", "divorce", "dry", "describe", "desert", "design", "detail", "direction", "defense", "dare", "dirty", "dressed", "desk", "desperate", "damage", "duty", "drag", "dump", "depend", "deny", "dig", "draw", "decent", "disappear", "drove", "doll", "devil", "dawn", "driver", "distance", "disease", "dirt", "damn", "deliver", "disaster", "director", "dozen", "duck", "data", "darling", "deaf", "delay", "diary", "dish", "decay", "doze", "defend", "discovery", "district", "divorced", "despite", "degree", "direct", "dessert", "dust", "destiny", "delivery", "downtown", "directly", "deeply", "deck", "diner", "demand", "drama", "digging", "drawn", "device", "depressed", "darn", "debt", "darkness", "designer", "daft", "daily", "database", "debate", "decade", "declare", "decline", "define", "democracy", "dentist", "departure", "dependent", "deposit", "depth", "derive", "desire", "detect", "diet", "discount", "disk", "dismiss", "display", "dialect", "dangerous", "diagram", "delicious", "drawer", "dated", "drawing", "donor", "denial", "dial", "discover", "disagree", "developed", "dense", "due", "dignity", "dealt", "dressing", "division", "drill", "dive", "ditch", "dining", "driven", "deputy", "drank", "dancer", "dull", "diamond", "devoted", "dealer", "defendant", "dramatic", "delicate", "doomed", "disturb", "distract", "damaged", "drops", "dizzy", "draft", "document", "drugged", "dodge", "denying", "dip", "detective", "deadly", "ding", "develop", "dearest", "drown", "drain", "dock", "determine", "dragon", "defeat", "dough", "dedicated", "defensive", "dug", "delighted", "daylight", "deer", "domestic", "divine", "deadline", "detention", "daisy", "distress", "dot", "distant", "dope", "dimension", "deed", "driveway", "deserted", "definite", "despise", "diagnosis", "December", "dash", "delight", "divide", "donkey", "dairy", "dam", "decorate", "daring", "deceive", "dedicate", "daytime", "debut", "decoy", "decrease", "deduct", "defective", "delegate", "descend", "detest", "diagnose", "diameter", "does", "dazzle", "debris", "dexterity", "disclose", "dispel", "drunken", "duchess", "disorder", "dental", "dried", "dose", "demonic", "deception", "destined", "decency", "donation", "drake", "disposal", "detector", "doom", "drum", "drift", "dreadful", "doorstep", "dreamt", "dice", "disco", "dearly", "devotion", "dryer", "delayed", "diaper", "deceased", "disgrace", "distinct", "directed", "dame", "donate", "despair", "digital", "dynamite", "doorman", "discreet", "diving", "discharge", "doughnut", "diversion", "dale", "dresser", "dispute", "dwell", "dent", "doggie", "dilemma", "disc", "drip", "differ", "doorbell", "detailed", "dictate", "dinosaur", "dialogue", "damaging", "dishonest", "divided", "diabete", "disable", "diver", "dole", "deviate", "dwelling", "damp", "detached", "dictator", "digestion", "disguise", "diversity", "download", "daffodil", "dainty", "dandelion", "Dane", "dangle", "daze", "debit", "deceit", "deduce", "default", "defer", "defiance", "deform", "defrost", "deity", "dejection", "delicacy", "deluge", "demolish", "demure", "deport", "deride", "desirable", "desolate", "despot", "deter", "detergent", "detriment", "diarrhoea", "dilate", "diligence", "diminish", "disbelief", "discard", "disciple", "discredit", "dismal", "dispatch", "domicile", "dormitory", "dowry", "drape", "drizzle", "drone", "drought", "drowsy", "dusk", "Dutch", "dynasty", "dysentery", "dumb", "doorway", "donut", "drastic", "dolly", "dim", "duct", "democrat", "dove", "decorated", "doubtful", "designing", "dislike", "diploma", "delude", "delirious", "downright", "digest", "dire", "deceiving", "doubly", "dispose", "dagger", "dungeon", "disgust", "devious", "destruct", "demise", "dripping", "ditto", "defence", "defeated", "dye", "demented", "dine", "dean", "drummer", "dandy", "disgusted", "delusion", "dart", "dumbest", "duly", "dusty", "defy", "deacon", "dumpling", "dosage", "disrupt", "dipping", "derange", "detain", "defender", "disregard", "dunk", "desist", "deprive", "duplicate", "dome", "designate", "dread", "doodle", "dealing", "duke", "dashing", "detour", "dodgy", "dwarf", "doggy", "dew", "dictation", "dilute", "dissolve", "doctrine", "dolphin", "dominant", "dominate", "downward", "drench", "dub", "dynamic", "daub", "decadence", "den", "depict", "depot", "destitute", "deterrent", "devise", "devoid", "devour", "devout", "diffident", "digress", "dimple", "din", "disarm", "discern", "discord", "disdain", "disembark", "disfigure", "dishonour", "dismantle", "dismount", "dispense", "disperse", "displace", "displease", "disquiet", "dissipate", "distil", "distort", "distrust", "diverge", "doleful", "droop", "dropper", "drudgery", "drunkard", "dual", "dubious", "dummy", "dune", "dung", "durable", "dashboard", "daunt", "dauntless", "Daydream", "debark", "debatable", "debauch", "decimal", "decisive", "decoction", "decompose", "decree", "deem", "deface", "deference", "deficit", "demeanour", "demote", "denote", "denounce", "density", "depart", "deplete", "deprave", "derelict", "dietary", "diffuse", "digestive", "dignify", "dike", "dill", "dilution", "dimness", "dingy", "dirtiness", "disarray", "disavow", "discourse", "disembody", "disloyal", "dismay", "disobey", "disparage", "disparity", "disprove", "dissemble", "diverse", "divert", "divinity", "doable", "doer", "domain", "doormant", "draught", "drawback"] ,["even", "ever", "else", "every", "enough", "exactly", "excuse", "each", "end", "everyone", "everybody", "either", "easy", "eat", "explain", "except", "expect", "evil", "eye", "evening", "entire", "early", "eight", "enjoy", "eve", "earth", "extra", "easier", "excited", "excellent", "error", "ear", "east", "edge", "effect", "egg", "element", "energy", "engine", "England", "English", "example", "express", "emergency", "empty", "escape", "exciting", "enemy", "engage", "exact", "exist", "emotional", "extremely", "entirely", "expensive", "easily", "Europe", "eleven", "exchange", "earn", "event", "exercise", "eighteen", "everyday", "emotion", "eastern", "economic", "email", "employ", "enable", "expert", "estate", "education", "effort", "exhaust", "enter", "election", "eighty", "ease", "eaten", "ego", "envelope", "essay", "elephant", "economics", "economy", "edition", "editor", "effective", "elderly", "electric", "elsewhere", "emerge", "emphasis", "empire", "employer", "employee", "encounter", "encourage", "engineer", "enhance", "enormous", "evidence", "equipment", "explosion", "escort", "exit", "entrance", "executive", "exam", "eternity", "episode", "entitled", "extreme", "explicit", "expose", "existence", "earl", "explode", "entering", "eager", "embarrass", "executed", "examine", "expense", "elder", "erase", "eyesight", "equal", "elect", "entry", "envy", "explore", "ethic", "eternal", "exclusive", "exception", "earring", "eagle", "esteem", "execution", "eighth", "efficient", "elegant", "elbow", "essential", "educate", "eject", "enforce", "enlarge", "enquiry", "eraser", "erosion", "erupt", "eruption", "ethnic", "evaluate", "exceed", "excite", "exclaim", "exclude", "exhibit", "exile", "expansion", "expel", "export", "external", "eyebrow", "eyelash", "earphones", "eyeshadow", "eliminate", "endless", "essence", "exposure", "evidently", "establish", "errand", "embrace", "emperor", "exotic", "Easter", "equally", "era", "expertise", "extend", "exquisite", "entertain", "embassy", "elaborate", "easiest", "echo", "extension", "extent", "educated", "exploded", "explosive", "equation", "ethical", "equipped", "execute", "ensure", "edgy", "employed", "eyeball", "expand", "enchant", "elevate", "evict", "erotic", "earnest", "eclipse", "elastic", "embargo", "energetic", "enjoyment", "envious", "equator", "erect", "eyelid", "earnings", "easel", "edible", "egoism", "embark", "embroider", "empower", "endorse", "enrich", "entail", "envisage", "err", "escalator", "evasion", "excel", "exempt", "exhale", "expedient", "expend", "extinct", "enjoying", "enlighten", "estimate", "endure", "extensive", "expelled", "elf", "elevator", "extortion", "eater", "evolution", "expanding", "exterior", "epidemic", "emerald", "ecstatic", "ecstasy", "exploit", "excessive", "evolve", "eligible", "evacuate", "extract", "expire", "excess", "etiquette", "ending", "edit", "engrave", "epic", "encode", "explorer", "examiner", "elite", "editorial", "eccentric", "existing", "eavesdrop", "earlobe", "ebony", "ecology", "elated", "elitist", "eloquent", "emphasize", "enjoyable", "edifice", "eel", "efface", "Egyptian", "elapse", "elegance", "elk", "elusive", "emblem", "embody", "embryo", "emigrant", "eminence", "emit", "emptiness", "enact", "enamel", "encircle", "enclose", "encroach", "encumber", "endeavour", "endurance", "enlist", "enliven", "enmity", "enrage", "enrapture", "ensue", "entangle", "entice", "entrails", "entreat", "entrust", "enumerate", "enviable", "envoy", "epoch", "eradicate", "evade", "evaporate", "ewe", "exalt", "excursion", "exemplify", "expulsion", "earlap", "earthy", "eatable", "easygoing", "edacity", "edacious", "efforless", "ejection", "elemental", "embitter", "eminent", "emulate", "encase", "enfold", "enigma", "ensign", "enthrone", "equality", "equity", "erratic", "espionage", "estrange", "eventful", "evergreen", "evoke", "excavate", "exclusion", "excrete", "exemplar"] ,["for", "from", "find", "first", "fine", "father", "family", "found", "friend", "face", "forget", "five", "fact", "fun", "far", "funny", "four", "fire", "free", "fight", "finally", "front", "full", "fault", "future", "fast", "food", "frank", "forever", "fall", "feel", "fair", "figure", "follow", "forgive", "feet", "finish", "fix", "floor", "faith", "forward", "fool", "force", "fly", "fifty", "fat", "fit", "fish", "fear", "famous", "farm", "field", "finger", "flat", "flower", "foot", "forest", "form", "fresh", "fruit", "flight", "file", "fill", "forty", "freak", "French", "folks", "focus", "fifteen", "final", "film", "further", "following", "Friday", "flying", "fake", "familiar", "forgotten", "funeral", "feed", "fan", "fantastic", "football", "frankly", "fortune", "fancy", "fashion", "freedom", "freeze", "faster", "fabulous", "fellow", "fourth", "fate", "friendly", "federal", "fantasy", "forth", "fourteen", "furniture", "fee", "finance", "flow", "formula", "frequent", "fridge", "fry", "fulfil", "farther", "fought", "firm", "flash", "former", "fail", "fishing", "fifth", "flesh", "fever", "female", "fully", "freezing", "frame", "fright", "fairy", "failure", "frozen", "fund", "fed", "financial", "facing", "flew", "flag", "fox", "finest", "fries", "flip", "frog", "fog", "facility", "factor", "factory", "feature", "feedback", "feeling", "fence", "festival", "fetch", "few", "filthy", "flavour", "flood", "fold", "foreign", "fork", "formal", "formally", "formation", "fortnight", "fortunate", "freeway", "freezer", "fuel", "function", "fuss", "furious", "fax", "focused", "foolish", "filling", "fraud", "flu", "fairly", "facet", "fond", "fried", "favourite", "forgiven", "foul", "firing", "forbid", "fighter", "floating", "favour", "flirting", "fuzzy", "fragile", "forensics", "fixing", "fusion", "foster", "frisk", "folk", "freshman", "finishing", "faithful", "firework", "fringe", "forcing", "flames", "funds", "filing", "freaky", "forehead", "flame", "flush", "fame", "faint", "fitting", "felony", "fabric", "fur", "fatal", "fleet", "forbidden", "fireplace", "fountain", "fare", "feather", "farmer", "fuse", "footstep", "foam", "frequency", "flexible", "frost", "fisherman", "flee", "firmly", "flour", "faraway", "fatality", "fatigue", "fearful", "February", "fertile", "fibber", "fiscal", "fitness", "famine", "flinch", "fluctuate", "fluent", "font", "forecast", "foreigner", "format", "fossil", "fraction", "fragrance", "framework", "furnish", "fir", "feeding", "footage", "fist", "fisher", "fling", "fainted", "failing", "franchise", "float", "forgiving", "fiction", "fugitive", "foreman", "freshen", "flatten", "fluid", "flick", "fudge", "felon", "fasten", "frighten", "forgave", "fart", "farewell", "flirt", "flown", "feast", "facial", "flowing", "funky", "flaw", "funding", "fluffy", "froze", "flea", "flatter", "filth", "feminine", "fearless", "frosty", "friction", "fume", "foremost", "fade", "feminist", "forfeit", "fort", "futile", "fable", "faciliate", "falcon", "fathom", "feat", "feeble", "ferocious", "fibre", "fiddle", "fig", "fillet", "flake", "flask", "flippers", "flourish", "flute", "foliage", "fortress", "frenzy", "funnel", "freely", "fastest", "freed", "flashing", "forensic", "fireman", "faculty", "founded", "flushed", "floss", "fury", "felicity", "fang", "festive", "fiasco", "fallout", "formality", "fewer", "flare", "fierce", "folding", "filming", "fulfilled", "forge", "florist", "firsthand", "fiend", "flock", "fading", "filter", "fertility", "fragment", "freight", "fore", "flooding", "fishy", "finch", "ferry", "footprint", "fluke", "festivity", "feisty", "frown", "furnace", "flyer", "flashy", "fungus", "fracture", "formerly", "fireball", "firearm", "fend", "furry", "fruitful", "footing", "flop", "finding", "fib", "funk", "forgery", "foolproof", "folder", "flattery", "fingertip", "framing", "flap", "flannel", "falter", "feign", "ferment", "fern", "fervent", "feud", "fidelity", "fidget", "fiery", "Finnish", "flax", "fleeting", "flicker", "flimsy", "flippant", "flint", "flog", "flounder", "flutter", "fodder", "foe", "folly", "forbear", "forestall", "forsake", "fowl", "frail", "frantic", "freckless", "frock", "frontier", "froth", "frugal", "furrow", "furtively", "facile", "fad", "fairness", "fairytale", "faithless", "falsify", "faultless", "fearsome", "feasible", "feint", "fell", "fen", "fervid", "fetid", "feudal", "fickle", "finesse", "firstly", "fitful", "fixedly", "fixture", "fizzy", "flabby", "flank", "flatly", "fleck", "flex", "floral", "fluency", "flurry", "foggy", "foetus", "foil", "follower", "fondle", "fondness", "footwear", "forceful", "forceless", "forearm", "foresee", "foresight", "foretaste", "forgetful", "forum", "frigility", "freelance", "frivolous", "frizz", "frontage", "frugality", "fruitless"] ,["get", "good", "God", "great", "guess", "girl", "glad", "game", "grace", "gun", "gift", "guilty", "general", "gay", "grab", "give", "ground", "guy", "green", "glass", "garden", "gas", "gold", "group", "grow", "gap", "goodbye", "guard", "grand", "going", "guest", "grateful", "goodness", "grandma", "grade", "growing", "greatest", "guarantee", "garage", "grew", "guilt", "guts", "glasses", "genius", "gate", "gentleman", "grant", "guide", "gum", "gloves", "gym", "gang", "giant", "goodnight", "grave", "grief", "gross", "golden", "golf", "goal", "gig", "gain", "goose", "guitar", "gallery", "garlic", "gather", "gear", "gene", "generally", "gentle", "genuine", "glance", "global", "govern", "gradually", "grammar", "graph", "grass", "grocery", "gut", "gorgeous", "garbage", "generous", "gram", "granted", "governor", "German", "garrison", "grandson", "gray", "groom", "gesture", "greater", "grip", "graduate", "glow", "ginger", "genetic", "gown", "Greek", "goods", "ghost", "gamble", "guardian", "guidance", "gratitude", "gossip", "gambling", "goody", "goat", "goddess", "glorious", "glove", "grill", "glue", "gathering", "graduated", "growth", "grudge", "granddad", "grasp", "greed", "glamorous", "globe", "grape", "grain", "gourmet", "gulf", "gallon", "Gemini", "gadget", "gangster", "garment", "garnish", "gasp", "gave", "gaze", "gel", "generic", "geography", "geometry", "giggle", "given", "glacier", "gloomy", "glory", "graceful", "gradual", "graphics", "groan", "grocer", "gladly", "gin", "gale", "greedy", "godfather", "gently", "gracious", "grease", "getaway", "galaxy", "gag", "greet", "gravy", "gutter", "grandpa", "gravity", "glowing", "generator", "greeting", "graveyard", "gifted", "glimpse", "gloat", "grim", "gardener", "godmother", "greens", "glamour", "gild", "gills", "giraffe", "girdle", "gloss", "gnat", "grope", "guile", "gust", "glen", "grove", "germ", "gypsy", "grind", "greasy", "grieve", "gorilla", "genuinely", "Greece", "greatness", "girlie", "gauge", "grilled", "glitch", "gullible", "grid", "granny", "gigantic", "grumpy", "groove", "greatly", "grownup", "goldfish", "glued", "ghetto", "gait", "gender", "grin", "gospel", "gage", "gall", "gunfire", "grunt", "giddy", "garland", "gallant", "gymnasium", "gaiety", "gallop", "gargle", "gaunt", "gauntlet", "gauze", "gelatine", "gem", "genial", "germinate", "ghastly", "giddiness", "gland", "glaze", "gleam", "glide", "glimmer", "glisten", "glitter", "glorify", "gnaw", "granary", "granite", "grating", "graze", "grimace", "grit", "gruff", "grumble", "gulp", "gurgle", "gush", "gabble", "gaily", "gainful", "gateway", "gaudy", "gist", "glare", "gleeful", "glossary", "glum", "glutton", "gluttony", "goblet", "godless", "goggle", "gorge", "gossipy", "governess", "graceless", "grate", "groin", "growl", "grub", "gruel"] ,["have", "here", "her", "him", "his", "help", "home", "hear", "hell", "house", "hello", "hope", "happy", "honey", "hurt", "hard", "head", "heart", "hate", "hospital", "hit", "husband", "half", "hand", "high", "hot", "how", "happen", "hour", "hang", "handle", "hundred", "hair", "himself", "honest", "human", "history", "hurry", "herself", "hotel", "hide", "huge", "horrible", "hungry", "hearing", "hero", "heavy", "heat", "hat", "hole", "horse", "hunt", "honestly", "hardly", "harry", "hall", "held", "health", "heaven", "happiness", "holy", "however", "harmony", "hook", "healthy", "hire", "handsome", "harm", "heading", "honeymoon", "hung", "hug", "hill", "homework", "holiday", "headache", "habit", "helpful", "had", "hopefully", "hers", "highly", "hidden", "heal", "highest", "honorary", "happily", "host", "honesty", "handling", "hip", "hint", "handy", "harbour", "hood", "hike", "halfway", "handbag", "height", "hence", "hesitate", "highlight", "highway", "historian", "hold", "holder", "holding", "household", "housing", "heavily", "hearty", "hallway", "hop", "helpless", "honoured", "hostage", "hammer", "homeless", "hollow", "hid", "hockey", "horn", "harsh", "horror", "hopeless", "homicide", "healing", "hostile", "hush", "haul", "hunter", "heartbeat", "hurricane", "hiring", "ham", "hack", "harmless", "highness", "hawk", "hunch", "haircut", "hatred", "humanity", "honour", "heir", "hose", "hobby", "herb", "hardware", "hairy", "humble", "heel", "hostess", "harvest", "harass", "horizon", "herbal", "humour", "hazard", "headline", "heating", "herd", "heap", "hangover", "habitat", "habitual", "hardy", "harmful", "has", "hassle", "haste", "hierarchy", "hinder", "horoscope", "horseback", "housewife", "humidity", "humorous", "hut", "hydrogen", "hypnotize", "heaviness", "herald", "hoarse", "hyphen", "hypocrisy", "haunted", "heroin", "having", "hypocrite", "humiliate", "hideous", "harassing", "helmet", "hooligan", "hormone", "hail", "handcuff", "hum", "haunt", "hereby", "hay", "hourglass", "horny", "haven", "handful", "hooray", "hunk", "hunger", "hamburger", "heartless", "hitch", "hearted", "hilarious", "heroic", "honours", "hostility", "heartache", "hopeful", "havoc", "hog", "hatch", "hound", "heavenly", "hash", "halt", "horribly", "hazel", "handyman", "homemade", "hazardous", "haphazard", "harness", "haze", "hearth", "hedge", "helm", "heritage", "heron", "herring", "hew", "highjack", "hind", "hurdle", "hurl", "hybrid", "hank", "hateful", "hanging", "hover", "hustle", "hiking", "hatchet", "hag", "hen", "hump", "holler", "haw", "hoot", "handshake", "hurtful", "helper", "hubby", "homicidal", "hasty", "homey", "heed", "historic", "hector", "hamster", "hepatitis", "heave", "heater", "hygiene", "harp", "humility", "hoop", "hamlet", "homesick", "hive", "hectic", "haunting", "hoax", "horrified", "hometown", "handicap", "hotline", "hammock", "heather", "haggard", "harrow", "haughty", "haunch", "hazy", "heartburn", "heathen", "hem", "hinge", "hiss", "hoard", "hoarfrost", "hoof", "hosiery", "howl", "hue", "husk", "hailstone", "halve", "hamper", "handgrip", "hangnail", "harden", "hardily", "hardness", "hardship", "hare", "headlight", "headphone", "heady", "heartily", "heedless", "heiress", "heirloom", "hermic", "hibernate", "hiccup", "hindrance", "hindsight", "hireling", "hobble", "housemaid", "hugely", "humankind", "humid", "husky", "hysteria"] ,["into", "idea", "important", "inside", "involve", "imagine", "interest", "instead", "island", "idiot", "ice", "inch", "include", "increase", "indicate", "insect", "iron", "itself", "insane", "issue", "invite", "interview", "indeed", "insurance", "ignore", "intend", "interrupt", "introduce", "inn", "ill", "industry", "injury", "institute", "illegal", "image", "insist", "influence", "intention", "intense", "incident", "Italian", "identity", "inspector", "invent", "ideal", "identify", "illness", "impact", "implement", "imply", "import", "impose", "improve", "income", "index", "infant", "infection", "inflation", "initial", "input", "inquiry", "install", "instance", "instant", "incurable", "innocent", "interfere", "insult", "internal", "Italy", "impress", "item", "instinct", "invisible", "inviting", "inner", "intimate", "ironic", "integrity", "immediate", "insanity", "injured", "insecure", "ignoring", "innocence", "inform", "infected", "insulting", "illusion", "ignate", "irony", "intruder", "invest", "imaginary", "impulsive", "invasion", "inherit", "idiom", "ignorant", "illogical", "imitate", "immigrant", "immigrate", "immune", "impartial", "impolite", "indirect", "indoor", "informal", "inhale", "inland", "insert", "insure", "internet", "interval", "invention", "inward", "irritate", "isolate", "its", "ivory", "ignition", "incite", "inclose", "incorrect", "instruct", "integral", "intestine", "invoice", "identical", "impulse", "intent", "ink", "intern", "info", "isolated", "immature", "inventory", "improved", "insight", "iris", "involving", "immunity", "inspire", "intact", "injection", "intimacy", "incarnate", "interior", "incoming", "inspiring", "immortal", "impatient", "indulge", "incentive", "ingoing", "intrude", "ignorance", "induce", "iceberg", "irregular", "invalid", "intellect", "insomnia", "incapable", "initially", "intricate", "interim", "icicle", "ignoble", "immense", "imminent", "immobile", "imprison", "impure", "inaudible", "indecent", "infantry", "inflame", "inflict", "influenza", "ingenious", "inhabit", "inhuman", "inoculate", "inquire", "inscribe", "insolence", "insular", "interact", "idiotic", "investor", "itch", "installed", "informant", "incline", "icy", "immoral", "inject", "invade", "illegally", "intrigue", "injustice", "inmate", "invaded", "intercept", "itinerary", "interpret", "infamous", "infinite", "itching", "intuition", "icky", "isolation", "itchy", "insinuate", "idol", "intensive", "infest", "improvise", "implant", "infirmary", "imposter", "idle", "ivy", "immovable", "impel", "impending", "imperial", "impetus", "implore", "improper", "impunity", "inability", "inborn", "indebted", "indignant", "inert", "infer", "inferior", "inflate", "influx", "infuriate", "insoluble", "intrepid", "iodine", "irksome", "irrigate", "icily", "icon", "illegible", "illicit", "illusive", "imbue", "immensely", "immerse", "imperfect", "impetuous", "impish", "imprint", "inaction", "inane", "indicator", "inedible", "inept", "infertile", "inhibit", "inset", "intrusive", "invoke", "irradiate", "irritable"] ,["just", "jail", "Jesus", "judge", "join", "joke", "jump", "job", "justice", "jacket", "jury", "juice", "joy", "junior", "journey", "jam", "joint", "junk", "jersey", "jewellery", "jeans", "jumper", "justify", "jockey", "jealous", "jet", "jean", "Japanese", "joining", "Jewish", "jay", "June", "jungle", "July", "jealousy", "journal", "jar", "jazz", "January", "jug", "junction", "Jew", "jaw", "jeep", "Jews", "jewel", "jelly", "janitor", "juicy", "jerk", "jeopardy", "jinx", "jumbo", "judgement", "juvenile", "jackal", "jolly", "jubilee", "judicial", "juggle", "justified", "jumpy", "jab", "jog", "jingle", "jackpot", "junkie", "jitter", "jell", "jade", "joker", "joyous", "jogging", "jigsaw", "jagged", "javelin", "jeer", "jest", "jolt", "jovial", "judicious", "jut", "jaguar", "jangle", "jargon", "jaunty", "jobless", "joggle", "joyful", "juxtapose"] ,["kind", "kill", "kid", "kiss", "know", "key", "kitchen", "kick", "knock", "keep", "king", "knife", "knowledge", "keen", "kettle", "keyboard", "knee", "kilometre", "kitty", "kit", "kidney", "kindness", "kindly", "ken", "kidnap", "knight", "kingdom", "killer", "knew", "keeper", "kin", "kneel", "knit", "known", "knot", "ketchup", "kitten", "kidding", "knives", "kinky", "karate", "knack", "keg", "knob", "kangaroo", "knuckle", "knockout", "knitting", "keel", "kernel", "kindle", "kerb", "keyhole", "keynote", "knead"] ,["little", "let", "life", "last", "long", "listen", "lot", "leave", "left", "later", "lost", "look", "late", "least", "lucky", "line", "lose", "love", "lie", "luck", "light", "law", "less", "learn", "lunch", "list", "lawyer", "lately", "lovely", "lord", "lead", "letting", "letter", "low", "laugh", "lesson", "like", "lady", "lake", "land", "language", "large", "lay", "leg", "length", "level", "lift", "loving", "lots", "lock", "legal", "liar", "loose", "loud", "lips", "lonely", "local", "loser", "loss", "launch", "lousy", "license", "lifetime", "likely", "laid", "lane", "lover", "load", "label", "labour", "lack", "ladder", "lamb", "lamp", "landlord", "lazy", "leader", "leaf", "lean", "leather", "lend", "leisure", "log", "logical", "lorry", "library", "largely", "lunchtime", "link", "liquid", "limit", "lavatory", "litre", "laundry", "lower", "league", "latest", "location", "loan", "loyal", "leading", "literally", "lecture", "loyalty", "liberty", "lobby", "liver", "lap", "lip", "lit", "luckily", "lounge", "lighting", "locate", "locker", "laying", "legend", "lad", "legally", "landing", "lightning", "leak", "liquor", "lunatic", "lesbian", "loft", "lipstick", "lawn", "lighten", "leap", "live", "loop", "lawsuit", "leery", "limited", "lighter", "lion", "logic", "liking", "luggage", "lemon", "lodge", "lick", "lobster", "larger", "lease", "lifestyle", "louder", "limb", "laser", "lethal", "located", "lid", "laptop", "lump", "lemonade", "liberal", "loaf", "lotion", "limp", "lace", "lively", "litter", "leftover", "landscape", "latitude", "latter", "lily", "lint", "literary", "locally", "loitering", "longitude", "lottery", "lumber", "lying", "lyrics", "lard", "lavish", "laziness", "lever", "libel", "lyrical", "lining", "legacy", "luxury", "loosen", "longest", "listed", "lung", "largest", "lust", "leverage", "lure", "lone", "likewise", "lowlife", "lengthen", "locking", "lowest", "leash", "lightly", "lifting", "living", "lurk", "lingerie", "layer", "lockdown", "liability", "liaison", "listener", "licence", "locum", "languish", "lark", "lateral", "lattice", "leaden", "leech", "lacking", "laughter", "ledge", "linen", "locket", "linked", "lesser", "lent", "lime", "lettuce", "lair", "liable", "limbo", "leopard", "lab", "lookout", "longing", "lockup", "lizard", "librarian", "ludicrous", "licking", "lens", "loo", "lasting", "lonesome", "lawfully", "legendary", "loathe", "lantern", "landlady", "loner", "lullaby", "layout", "leukemia", "lapse", "lacquer", "laden", "ladle", "lag", "lame", "lament", "lash", "latch", "lathe", "lather", "laurel", "lavender", "levy", "lilac", "linger", "locust", "loin", "louse", "lubricant", "lukewarm", "lull", "luminous", "luscious", "lustre", "luxuriant", "lacerate", "lacy", "lagoon", "lamppost", "lance", "landfall", "landmark", "languid", "lank", "lardy", "lassitude", "latent", "lax", "laxative", "legalize", "leggy", "lenient", "levity", "libellous", "likeable", "limelight", "limitless", "lineal", "linear", "lioness", "liquidate", "lisp", "listless", "literacy", "lithe", "livestock", "locus", "lollipop", "loom", "loot", "lozenge", "lucent", "lucidity", "lackless", "lucrative", "lumpy"] ,["more", "maybe", "man", "much", "mom", "mother", "might", "mind", "must", "money", "may", "myself", "most", "move", "meet", "make", "mean", "minute", "mine", "moment", "men", "meeting", "mistake", "marriage", "marry", "mad", "movie", "murder", "miss", "million", "message", "mouth", "middle", "music", "mess", "mention", "mommy", "magic", "month", "memory", "mark", "mile", "matter", "machine", "mail", "milk", "market", "monkey", "main", "many", "map", "march", "made", "morning", "mood", "mister", "meaning", "match", "mission", "miracle", "monster", "moon", "master", "merry", "miserable", "meat", "medicine", "mystery", "mostly", "member", "meal", "manager", "model", "meantime", "midnight", "manage", "mirror", "magazine", "male", "Monday", "material", "math", "mum", "mainly", "maintain", "major", "mall", "manner", "margin", "massive", "mushroom", "musical", "muscle", "movement", "mouse", "mountain", "metre", "mate", "matt", "maid", "mayor", "military", "mental", "mix", "mixed", "motel", "motion", "mortal", "minor", "mass", "media", "motive", "museum", "mob", "misery", "magical", "moral", "mighty", "mature", "meanwhile", "minister", "menu", "mud", "motorway", "mortgage", "moreover", "mixture", "mania", "margarine", "mosque", "medical", "murderer", "makeup", "madam", "memorial", "mask", "mistaken", "merely", "massage", "metal", "monitor", "moron", "majesty", "messenger", "modern", "mutual", "miller", "mill", "muffin", "mid", "measure", "minimum", "musician", "motor", "mini", "minus", "messy", "multiple", "medium", "mattress", "mistress", "marrow", "melt", "madness", "mint", "modeling", "marsh", "majority", "medal", "mug", "method", "marketing", "mere", "mock", "maximum", "mechanic", "missile", "modest", "mild", "mustard", "microwave", "mankind", "myth", "metaphor", "mobile", "mend", "merit", "mist", "mercy", "moustache", "marble", "monthly", "module", "merchant", "machinery", "magnitude", "married", "meadow", "means", "melody", "metric", "midday", "midterm", "mineral", "minimal", "missing", "moderate", "modify", "moist", "moisture", "mould", "molecule", "monument", "monopoly", "mosquito", "malice", "mammal", "marmalade", "merge", "miser", "mistrust", "monarchy", "muse", "mute", "mansion", "maker", "maniac", "mount", "manual", "matching", "marine", "mentor", "mentally", "monk", "mourning", "marijuana", "manly", "madly", "mode", "meter", "marching", "motivate", "murmur", "marathon", "misplace", "moonlight", "moss", "mat", "maze", "marital", "magician", "moving", "meltdown", "motto", "meteor", "menace", "marshal", "mice", "mop", "mocking", "magically", "moody", "midst", "maiden", "molecular", "minority", "marker", "medieval", "maturity", "maternity", "marinade", "morbid", "muddy", "mascara", "migraine", "magnify", "momentary", "mutter", "madden", "maggot", "malignant", "mandate", "manhood", "manoeuvre", "manpower", "mare", "marvel", "measles", "mediate", "minimize", "mischief", "misty", "misuse", "monastery", "moor", "mortify", "mow", "mutton", "morgue", "meow", "mart", "manor", "madman", "mugged", "maestro", "multi", "mystical", "mayhem", "matrimony", "magnet", "melting", "mar", "mailbox", "mash", "misguided", "mildly", "mule", "mourn", "mechanism", "mafia", "mounted", "morality", "memorable", "maternal", "merger", "mandatory", "misjudge", "mink", "memorize", "ministry", "mingle", "mistletoe", "meddling", "manifest", "morally", "matrix", "martyr", "martial", "mellow", "makeover", "mainland", "mush", "mummy", "macaroni", "mailman", "mystic", "miniature", "maple", "massacre", "meatloaf", "manicure", "multiply", "masculine", "moth", "mindless", "midget", "mercury", "mope", "moan", "mausoleum", "milligram", "midge", "merciful", "mushy", "mover", "moot", "medic", "manure", "magnetic", "magpie", "maim", "malt", "mammoth", "mane", "marten", "mast", "meek", "melon", "militant", "mimic", "mince", "mirth", "mitten", "morsel", "montley", "muffle", "mulberry", "mumble", "mural", "musty", "mutilate", "muzzle", "majestic", "malicious", "marshy", "mediocre", "mercenary", "mermaid", "merriment", "mesh", "mesmerize", "midland", "midsummer", "midwife", "migration", "migrant", "mildness", "mileage", "milestone", "minder", "minefield", "misfire", "mishandle", "mislead", "misspell", "mole", "mussel", "muteness", "mutinous"] ,["not", "now", "never", "night", "new", "nice", "name", "next", "need", "news", "number", "nobody", "none", "nick", "neither", "near", "normal", "nervous", "nine", "nose", "notice", "note", "nut", "neck", "nurse", "nope", "naked", "necessary", "nowhere", "natural", "nature", "north", "national", "nearly", "nothing", "noise", "negative", "nasty", "nail", "nerve", "ninety", "nephew", "niece", "narrow", "native", "naughty", "nearby", "neighbour", "net", "network", "nicely", "northern", "noun", "nor", "newspaper", "nonsense", "normally", "naturally", "nap", "noble", "neat", "November", "numerous", "nuisance", "nuclear", "nowadays", "novel", "notion", "notably", "noisy", "newly", "nanny", "naive", "noon", "needle", "necklace", "nation", "nest", "nicer", "nineteen", "nightmare", "ninth", "nun", "navy", "nearest", "nursery", "negotiate", "nickname", "nude", "notify", "napkin", "neutral", "nod", "notebook", "nausea", "nosy", "noodle", "necessity", "neglect", "numb", "numeral", "nutrition", "narrative", "nostril", "notorious", "nought", "nourish", "nicest", "needy", "nickel", "notch", "newest", "nutty", "neurotic", "newborn", "nightclub", "nylon", "navigable", "nitrogen", "nobility", "novice", "noxious", "null", "nutshell", "newlywed", "nauseous", "northwest", "nagging", "nipple", "nip", "narcotic", "nag", "nominate", "noose", "needless", "norm", "nasal", "nautical", "neigh", "nettle", "niche", "nimble", "nominal", "nook", "nameless", "namely", "namesake", "naval", "navel", "navigate", "nebulous", "needful", "negate", "negation", "negligent", "nestle", "nightfall", "noiseless", "nomad", "nonpareil", "nosebleed", "notary", "notoriety", "nudge", "nurture", "nutmeg", "nutrient"] ,["out", "one", "over", "our", "off", "only", "own", "old", "once", "open", "office", "order", "outside", "obviously", "offer", "officer", "other", "otherwise", "okay", "obvious", "opinion", "often", "older", "opening", "operation", "official", "original", "oil", "odd", "orange", "object", "objection", "observe", "obtain", "occasion", "occupy", "occur", "ocean", "operate", "oppose", "overseas", "ownership", "option", "offense", "opera", "owner", "opposite", "overnight", "October", "objective", "opponent", "ordinary", "organ", "organic", "organize", "origin", "outcome", "output", "oven", "overall", "overcome", "overtime", "owe", "ourselves", "outfit", "odds", "oxygen", "oath", "obsession", "oldest", "operator", "offensive", "outer", "ounce", "oak", "orbit", "onion", "online", "obey", "orchestra", "outdoor", "overload", "obedient", "obese", "obituary", "oblige", "oily", "Olympics", "omelette", "omit", "oneself", "onto", "optional", "opt", "orthodox", "ours", "outdoors", "outgoing", "outline", "outlook", "outspoken", "outward", "overdo", "overdone", "overflow", "overtake", "overwhelm", "overwork", "oblivion", "obscure", "ointment", "omission", "orchard", "owing", "overturn", "olive", "obnoxious", "ought", "overreact", "overboard", "occupied", "ordeal", "offend", "orderly", "obsessive", "operative", "obstacle", "oatmeal", "overlook", "obscene", "organism", "oar", "orient", "ornament", "oxen", "oyster", "oats", "obstinacy", "obstruct", "odious", "odour", "offhand", "onset", "onward", "opaque", "optical", "orator", "orchid", "ore", "ostrich", "overdue", "onboard", "overly", "ongoing", "owl", "override", "opener", "oval", "outsider", "overhear", "oral", "overhead", "oddly", "orphan", "orphanage", "offence", "oasis", "outlet", "overrated", "outrage", "openly", "offshore", "omen", "offspring", "obsolete", "observer", "oversight", "overdose", "oblique", "oblong", "oppress", "otter", "obdurate", "obedience", "obscenity", "obsess", "obstinate", "obtrusive", "occult", "occupant", "octopus", "offender", "offset", "ominous", "oncoming", "onefold", "onerous", "orb", "outbid", "outbreak", "outburst", "outlay", "outmatch", "outnumber", "outright", "outset", "outskirts", "overjoyed", "overlap", "overlive", "oversleep", "oxide"] ,["please", "people", "put", "place", "pretty", "probably", "part", "person", "point", "phone", "play", "party", "perfect", "police", "pay", "pick", "past", "power", "president", "picture", "pain", "protect", "poor", "piece", "perhaps", "personal", "problem", "prove", "pregnant", "proud", "prison", "pass", "plan", "present", "private", "possibly", "plane", "park", "promise", "public", "push", "patient", "pleasure", "press", "position", "peace", "plenty", "pretend", "proof", "perfectly", "pull", "pop", "paper", "partner", "process", "pig", "pan", "pertinent", "planning", "princess", "plus", "positive", "price", "pressure", "pants", "pack", "page", "project", "passion", "planet", "practice", "pizza", "powerful", "port", "precious", "professor", "percent", "purpose", "paint", "pardon", "post", "program", "prefer", "pray", "prince", "pie", "painting", "period", "pair", "player", "peg", "property", "parking", "photo", "pocket", "prom", "purse", "plate", "package", "pure", "prepare", "pink", "popular", "parent", "perform", "provide", "pace", "pad", "palace", "pale", "panic", "parcel", "partly", "passenger", "patience", "path", "pattern", "pause", "payment", "programme", "pupil", "pub", "primarily", "presume", "predict", "practise", "praise", "potato", "pool", "policeman", "poem", "plug", "petrol", "pepper", "pension", "pencil", "pigeon", "porridge", "pride", "pine", "punch", "painful", "pity", "pen", "progress", "poison", "privacy", "pot", "plant", "proper", "prize", "potential", "policy", "pilot", "penny", "pregnancy", "prisoner", "presence", "per", "print", "plain", "pet", "priest", "plastic", "pierce", "propose", "pin", "prime", "priority", "pleasant", "permanent", "poker", "pro", "proposal", "pit", "product", "piano", "paperwork", "pound", "pillow", "profile", "proceed", "potatoes", "plea", "pronounce", "pursue", "purple", "purely", "purchase", "pudding", "publish", "publicity", "provision", "providing", "protest", "properly", "prompt", "promotion", "promote", "profit", "producer", "produce", "privilege", "prior", "printer", "principle", "principal", "primary", "previous", "prevent", "preserve", "precisely", "precise", "prayer", "practical", "poverty", "pour", "poster", "possess", "pond", "pollution", "poll", "politics", "pole", "poetry", "poet", "plot", "platform", "pitch", "pipe", "pint", "pile", "pill", "physics", "phrase", "photocopy", "phase", "persuade", "permit", "perceive", "peak", "peaceful", "proclaim", "pathetic", "physical", "procedure", "political", "popcorn", "phony", "punish", "polite", "punk", "picnic", "pee", "patch", "parade", "proven", "potion", "paradise", "psychic", "puppy", "personnel", "powder", "pumpkin", "parole", "pancake", "peanut", "portrait", "pops", "patrol", "pony", "payback", "porch", "pump", "paternity", "passport", "perfume", "palm", "puzzle", "pacific", "polish", "pry", "peel", "promising", "pork", "plague", "pointless", "pearl", "puppet", "pledge", "prick", "peek", "postpone", "pose", "peach", "parallel", "parenting", "partial", "password", "pear", "peculiar", "painter", "passive", "probable", "paragraph", "publisher", "penalty", "paid", "pail", "pajamas", "panel", "parrot", "particle", "paste", "patent", "peer", "peninsula", "persist", "pianist", "plural", "postage", "postman", "pram", "precede", "precedent", "prospect", "punctual", "pamper", "parsley", "pastime", "pat", "patron", "pavement", "peasant", "plausible", "predatory", "proverb", "penthouse", "probation", "paralyzed", "pursuit", "porter", "pep", "physician", "perimeter", "passage", "pal", "portal", "pea", "prank", "petty", "pact", "protocol", "panties", "payslips", "pinch", "poise", "pasta", "pervert", "payroll", "preoccupy", "petition", "pawn", "premise", "puff", "privately", "protein", "paramedic", "pistol", "prosecute", "premature", "pod", "priceless", "pike", "partying", "pitcher", "ping", "pirate", "protector", "portion", "powerless", "paranoia", "plumbing", "primitive", "pending", "poke", "pickup", "picket", "publicly", "piggy", "peep", "pageant", "poppy", "prophecy", "profound", "postcard", "pharmacy", "prognosis", "plumber", "platinum", "parachute", "polar", "pronoun", "pottery", "plaster", "parasol", "pasture", "pioneer", "playful", "poisonous", "precision", "prefix", "prestige", "padlock", "pagan", "palate", "partridge", "peacock", "peat", "pedigree", "penetrate", "peril", "perish", "perpetual", "pest", "pheasant", "pier", "placard", "placid", "plank", "plough", "pluck", "poach", "pollute", "porcelain", "pore", "porous", "potent", "poultry", "preface", "premium", "preside", "primrose", "procure", "prodigy", "prolific", "prolong", "prone", "prose", "protrude", "province", "proximity", "prudence", "prunes", "psalm", "pullover", "pleased", "pushy", "plead", "payoff", "preview", "perjury", "parental", "preacher", "piper", "pneumonia", "perk", "prey", "probe", "poodle", "pitiful", "penguin", "panther", "puddle", "pros", "picky", "par", "puffy", "pointy", "partially", "premiere", "painless", "prototype", "prop", "prescribe", "pompous", "poetic", "ploy", "paw", "pulse", "processed", "polygraph", "prophet", "paralysis", "painfully", "prominent", "prise", "prejudice", "platoon", "pickle", "permitted", "planner", "placing", "patronize", "patio", "paddle", "poorly", "polling", "pedestal", "puberty", "phantom", "pesky", "purity", "prevail", "preach", "pun", "portable", "pastry", "purposely", "proxy", "pineapple", "parasite", "plunge", "peck", "playboy", "provoke", "plum", "pyramid", "portfolio", "pilgrim", "patriot", "perky", "pedal", "parlour", "pastel", "predicate", "prohibit", "paltry", "pang", "pansy", "pant", "parch", "pare", "parish", "parson", "partition", "patter", "patty", "peal", "pebble", "penal", "pendulum", "pensive", "perch", "perplex", "persecute", "perverse", "physique", "pimple", "pitfall", "plaice", "plaid", "plaintiff", "plait", "pleat", "plentiful", "pliable", "plight", "plod", "plunder", "plywood", "polarity", "ponder", "poplar", "posterity", "potter", "pouch", "pounce", "pout", "prelude", "pretence", "pretext", "prism", "prologue", "propel", "pulp", "pulverize", "pungent", "purr", "pacify", "palette", "pallor", "palmful", "palpable", "palpate", "palsy", "pancreas", "parable", "parity", "parquet", "parting", "passable", "paternal", "patronage", "pavilion", "peachy", "pectoral", "peephole", "peerless", "peevish", "pelt", "pendulous", "penitence", "penitent", "penniless", "pensioner", "peppery", "perennial", "periodic", "persevere", "personify", "perspire", "pert", "peruse", "pervasive", "pester", "pestilent", "petulant", "pictorial", "piercing", "piety", "pillar", "pilotage", "pinprick", "placidity", "plash", "platitude", "plenitude", "pliant", "plumb", "plume", "plump", "poignant", "polity", "pollen", "pomp", "pomposity", "ponderous", "populate", "portent", "portly", "portray", "posh", "possible", "postal", "posture", "potency", "prawn", "precursor", "prepay", "prepense", "prevalent", "prickly", "primeval", "prod", "prodigal", "profane", "profanity", "profess", "progeny", "prowess", "prowl", "prudent", "puncture", "purge", "purify", "pushful", "putrefy"] ,["quite", "question", "quiet", "quick", "quit", "quickly", "queen", "qualify", "quality", "quantity", "quarter", "quote", "qualified", "quietly", "quiz", "quid", "queue", "quicker", "quest", "quack", "queer", "quarrel", "quarry", "quilt", "quaint", "quickie", "quotation", "quail", "quaver", "quay", "quiver", "quake", "quaking", "quandary", "quasi", "quell", "quench"] ,["right", "really", "remember", "room", "real", "ready", "run", "reason", "rest", "rather", "red", "relax", "ring", "ride", "ray", "ran", "road", "respect", "report", "record", "return", "rule", "risk", "rose", "reading", "rock", "romantic", "ruin", "reach", "rain", "river", "read", "rid", "remind", "roll", "radio", "raise", "rough", "round", "result", "research", "regret", "ruined", "rush", "reality", "roof", "recognize", "rent", "revenge", "regular", "race", "recently", "release", "rude", "radar", "remain", "repeat", "reaction", "riding", "rate", "rescue", "royal", "replace", "rail", "railway", "range", "rapid", "rare", "rarely", "react", "receipt", "receive", "reduce", "region", "rice", "raspberry", "recall", "rat", "row", "role", "refuse", "rise", "routine", "request", "rob", "rolling", "recovery", "remove", "route", "review", "relief", "response", "reception", "rub", "reporter", "rotten", "represent", "resist", "realm", "random", "racing", "radical", "rapidly", "ratio", "raw", "reader", "readily", "realistic", "recipe", "reckon", "recommend", "recover", "reduction", "refer", "reflect", "reform", "regard", "regime", "regularly", "reject", "relate", "relation", "relative", "relieve", "religion", "remark", "reserve", "resort", "resource", "respond", "restore", "restrict", "retire", "reveal", "romance", "Russian", "rich", "robbery", "recent", "rehearsal", "rabbit", "root", "reunion", "rage", "rug", "restrain", "rap", "rape", "risky", "roast", "riot", "rum", "rod", "ruby", "rational", "ritual", "repay", "residence", "rack", "repair", "resent", "rocky", "robe", "retired", "righteous", "rear", "robot", "rib", "realise", "reminder", "rally", "roller", "rocket", "rifle", "rainbow", "razor", "renew", "refund", "rainy", "ruler", "rust", "reference", "regional", "register", "relevant", "religious", "rely", "remaining", "remote", "reply", "republic", "require", "resident", "resign", "resolve", "retain", "revenue", "reverse", "reward", "rhythm", "rival", "rope", "roughly", "rubber", "rubbish", "rural", "racism", "radiation", "recycle", "remedy", "removal", "renovate", "restless", "resume", "rigid", "rinse", "repel", "reside", "ridicule", "rigorous", "robust", "rip", "reverend", "rag", "rising", "ransom", "reliable", "rusty", "rig", "reckless", "rash", "railroad", "rating", "receiver", "righty", "rejection", "ribbon", "raid", "remotely", "rank", "retreat", "ruling", "raining", "rental", "ruthless", "refill", "relaxing", "recital", "recorder", "rang", "reserved", "running", "rethink", "rebuild", "roommate", "recess", "rebound", "rebel", "royalty", "runway", "ridge", "runner", "riddle", "ranger", "rye", "rogue", "raft", "ripe", "rewrite", "robber", "reconnect", "rhyme", "raffle", "relay", "rim", "rugby", "radiance", "radish", "raincoat", "ramble", "rapture", "readiness", "recoil", "recollect", "rectangle", "rectify", "recycling", "redeem", "reed", "refine", "refuel", "refusal", "rein", "relapse", "relent", "remnant", "render", "reprint", "reptile", "repulse", "requisite", "revision", "revolt", "rind", "ripple", "roadmap", "roadside", "rosy", "rot", "rotate", "rouge", "racket", "ravine", "rookie", "rehearse", "revealing", "racist", "rattle", "reel", "redhead", "rave", "rabble", "retrieve", "reassure", "retail", "renting", "reign", "reset", "radius", "remorse", "roar", "rumour", "remarried", "reluctant", "regain", "refresh", "runaway", "rightful", "richest", "retro", "rewind", "ramp", "railing", "riddance", "reunited", "retainer", "restroom", "relive", "reef", "reconcile", "recognise", "raven", "ringer", "refuge", "reclaim", "rosebud", "rearrange", "retrieval", "roam", "repulsive", "renown", "reflex", "raisin", "racial", "rile", "revive", "retard", "recruit", "reinforce", "recession", "ragged", "rake", "ram", "rascal", "ravage", "reap", "rebuff", "rebuke", "recline", "refrain", "regent", "rejoice", "rend", "repent", "repress", "reprimand", "reproach", "reproof", "resolute", "resound", "respite", "retaliate", "reticence", "retinue", "retort", "rhubarb", "rift", "rite", "rivet", "roe", "romp", "rook", "rouse", "rove", "rowan", "rudder", "ruffian", "rumble", "rummage", "rustic", "rustle", "rut", "rabid", "radiant", "rancid", "rancorous", "rant", "rapacity", "rapt", "rarity", "rasp", "ravenous", "rebellion", "recant", "recast", "recede", "reseptive", "recipient", "recite", "recurrent", "redden", "redress", "reek", "referee", "regretful", "reliance", "reliant", "relish", "remiss", "renewal", "repellent", "replica", "repose", "reprove", "repute", "resemble", "resentful", "resedue", "reverence", "revert", "revoke", "revolve", "revulsion", "rigour", "riotous", "rotund", "rucksack", "ruinous", "ruse"] ,["she", "see", "some", "say", "sure", "sorry", "still", "stop", "stay", "someone", "son", "same", "sir", "show", "since", "start", "stuff", "second", "school", "soon", "somebody", "such", "sit", "sister", "set", "shut", "stand", "story", "stupid", "sleep", "sonny", "sometimes", "serious", "shit", "sick", "seem", "safe", "shot", "six", "sweet", "sense", "special", "sound", "speak", "spend", "sex", "send", "sign", "secret", "straight", "sent", "surprise", "situation", "swear", "step", "strong", "suppose", "street", "smart", "small", "shall", "shoot", "stick", "seven", "share", "simple", "short", "spent", "self", "sake", "station", "strange", "save", "stuck", "security", "store", "single", "soul", "service", "seriously", "somehow", "summer", "support", "seat", "song", "system", "sell", "screw", "sad", "smell", "spell", "slow", "space", "suddenly", "shoes", "scene", "sooner", "suit", "smile", "stole", "sudden", "sing", "shop", "study", "star", "sea", "Saturday", "speed", "sugar", "stone", "serve", "super", "signal", "steal", "silly", "south", "something", "spot", "shower", "shirt", "ship", "subject", "sun", "surgery", "simply", "skin", "spirit", "speech", "someplace", "suspect", "split", "search", "spoke", "scare", "settle", "saving", "suggest", "staff", "shopping", "sight", "size", "student", "sold", "someday", "sally", "schedule", "social", "shame", "scary", "strength", "several", "shock", "survive", "spare", "statement", "sometime", "storm", "sexy", "style", "stronger", "shake", "stage", "slip", "stomach", "sexual", "switch", "spring", "score", "stranger", "snow", "strike", "shape", "stock", "source", "selfish", "science", "sat", "stress", "sensitive", "shoulder", "success", "soft", "sky", "shoe", "sentence", "soup", "society", "sue", "stake", "square", "shift", "Sunday", "settled", "staircase", "stamp", "suffering", "spoken", "snake", "suffer", "swim", "silence", "seventy", "supply", "stubborn", "surface", "soap", "signature", "safety", "sail", "salad", "salary", "sale", "salt", "sand", "sandwich", "satellite", "sauce", "sausage", "scale", "scheme", "scratch", "screen", "script", "seal", "season", "secondary", "seed", "seek", "select", "senior", "sensible", "separate", "sequence", "servant", "session", "severe", "shadow", "scientist", "sheep", "sheet", "shelf", "shout", "singer", "slice", "slim", "smoking", "sole", "spoon", "steak", "strict", "struggle", "submit", "supper", "symbol", "solve", "sixty", "secretary", "sneak", "swing", "scream", "solid", "skip", "soda", "silver", "sheriff", "suite", "section", "suicide", "spread", "solution", "sharp", "spike", "sweat", "silent", "surely", "site", "secure", "spit", "smiling", "shrink", "spin", "smooth", "standard", "sacrifice", "slowly", "studio", "sixteen", "sport", "shown", "series", "soldier", "spy", "skill", "sergeant", "snap", "sink", "shy", "swimming", "sample", "squeeze", "saint", "searching", "squad", "strip", "stable", "stroke", "steady", "spoil", "surgeon", "stretch", "seventeen", "strategy", "similar", "slave", "statue", "surrender", "sunshine", "side", "September", "sack", "scope", "secondly", "seize", "selection", "sharply", "shave", "shell", "shelter", "shine", "shortly", "should", "shove", "shrug", "similarly", "sin", "skirt", "slide", "slight", "slightly", "slope", "sock", "soil", "spray", "starve", "status", "steel", "storage", "strain", "straw", "stream", "strongly", "structure", "substance", "succeed", "surround", "survey", "survival", "suspicion", "swap", "sympathy", "shiver", "skilful", "socket", "shared", "specific", "sweater", "strictly", "serving", "struck", "scaring", "stink", "scam", "scout", "shed", "separated", "subtle", "swell", "spirits", "sealed", "superior", "slack", "sacred", "signing", "seduce", "stuffed", "slap", "spa", "sworn", "safely", "spider", "smaller", "Spanish", "skull", "scotch", "sob", "spoiled", "stunt", "sword", "scenario", "safeguard", "shark", "sunset", "scarf", "salesman", "swallow", "setup", "serial", "sandy", "seventh", "semester", "stab", "sickness", "sixth", "steam", "scar", "suck", "skinny", "ski", "suitcase", "sort", "scan", "silk", "shooter", "slightest", "saying", "snack", "shore", "soccer", "sofa", "state", "somewhat", "solo", "stir", "stiff", "sincere", "shield", "stud", "sailor", "shorts", "sane", "sunny", "screech", "sailing", "slam", "sober", "suspend", "sting", "smack", "sperm", "sang", "shiny", "sleeve", "scandal", "sponge", "sleepy", "sip", "sticky", "splendid", "shrimp", "shepherd", "scent", "sketch", "sour", "speaker", "salmon", "summit", "steer", "smash", "shaft", "stem", "sadness", "saddle", "sidewalk", "scrub", "spicy", "solitary", "splash", "shade", "sarcasm", "stew", "sorrow", "stereo", "stadium", "spice", "shampoo", "scenery", "sphere", "stern", "sponsor", "salvation", "scatter", "slavery", "solar", "sculpture", "sensation", "savage", "spectacle", "shrine", "shortage", "software", "solicitor", "sore", "southern", "species", "specify", "spelling", "spill", "spiritual", "spite", "spokesman", "stall", "stare", "steep", "strategic", "string", "sustain", "sweep", "scammer", "said", "sank", "saucer", "sauna", "saw", "scarlet", "scholar", "scissors", "scold", "scramble", "scrape", "seafood", "seaside", "selective", "sensual", "shilling", "sideways", "singular", "skeleton", "slang", "sieve", "sled", "slender", "softly", "solemn", "sprinkle", "squirrel", "stimulate", "subscribe", "seaweed", "semicolon", "situated", "skier", "slum", "smith", "snail", "superb", "surname", "smoke", "sneaking", "supreme", "streak", "sector", "spreading", "subway", "skating", "spine", "shotgun", "shipment", "scissor", "sexually", "stunning", "shipping", "strongest", "shaken", "sabotage", "strangle", "senate", "skiing", "swamp", "secretly", "scoop", "sewer", "scroll", "squash", "stranded", "syndrome", "stack", "slick", "sum", "spark", "surf", "superman", "specialty", "snoop", "semi", "shorter", "serum", "smug", "sweaty", "stain", "shack", "summon", "splitting", "sneaky", "sloppy", "settling", "shatter", "stressful", "satisfy", "starling", "surgical", "sunrise", "strangely", "sweetness", "stinky", "salvage", "stove", "slot", "sunk", "survivor", "shovel", "stun", "sadly", "smelly", "shred", "stroll", "sitting", "sheer", "scarecrow", "syrup", "shuttle", "salute", "sleigh", "sarcastic", "strung", "stitch", "sordid", "straits", "spooky", "spaghetti", "stuffing", "speeding", "slime", "sophomore", "selfless", "secrecy", "slippery", "stoop", "sanity", "syringe", "symphony", "sleazy", "shaky", "strap", "sniff", "sedative", "souvenir", "squat", "suspense", "sunlight", "slippers", "sibling", "suffice", "striking", "swift", "sew", "stool", "submarine", "startle", "sedate", "snore", "sneeze", "smuggle", "salty", "symptom", "stumble", "saliva", "supervise", "soften", "scallop", "spank", "stride", "subtract", "suburb", "supporter", "swimsuit", "syllable", "syllabus", "sanctify", "sanitary", "saturate", "savour", "sceptical", "sculptor", "seam", "seaman", "seashore", "sect", "sermon", "serpent", "shabby", "shallow", "shawl", "sickly", "sinister", "sinner", "skid", "skim", "slander", "sledge", "sleek", "slogan", "sociable", "soot", "soothe", "sovereign", "sow", "spam", "Spaniard", "spanner", "sparrow", "speck", "spinster", "spire", "squint", "stair", "stallion", "stammer", "staple", "starch", "stingy", "stub", "sturgeon", "subdue", "submerge", "sulphur", "surpass", "swarm", "Swede", "Swiss", "synonym", "swelling", "swat", "steroid", "slate", "sentinel", "span", "smoothly", "skate", "sprung", "spotlight", "scrambled", "superhero", "stirring", "spinal", "server", "seminar", "suitable", "specimen", "solving", "snitch", "sap", "slash", "sigh", "setback", "slimy", "steering", "stability", "suction", "sporting", "safest", "stupidity", "starring", "spear", "slit", "serenity", "smear", "sought", "softball", "snag", "smallest", "sling", "stale", "sexist", "sanctuary", "slaughter", "slay", "sham", "scrap", "stairwell", "spur", "slower", "sewing", "severely", "sage", "swollen", "swan", "scalpel", "stuffy", "sexuality", "segment", "surrogate", "stray", "snob", "slowing", "scoot", "scanner", "snatch", "stalk", "spleen", "slob", "spree", "soak", "sever", "scarce", "scalp", "spiral", "spaceship", "salon", "seducing", "secretive", "statute", "sparkling", "sod", "socially", "sideline", "suburban", "soothing", "slumber", "slayer", "shindig", "sentiment", "squirt", "spade", "snappy", "sleepover", "spun", "spook", "shady", "senseless", "scooter", "swoop", "sticker", "smite", "shameless", "static", "scales", "satin", "suicidal", "skilled", "sketchy", "surfing", "stricken", "stork", "sodium", "snick", "sly", "suffocate", "stench", "stark", "spawn", "sideway", "shortcut", "squid", "soy", "snowman", "sensor", "seller", "strand", "seizure", "savvy", "saxophone", "scallion", "sesame", "sable", "sacrament", "sag", "sagacious", "sardine", "satire", "scald", "scanty", "scorch", "scoundrel", "scowl", "scribble", "scythe", "seclude", "seethe", "semblance", "sequel", "shaggy", "shear", "sherry", "shingle", "shrill", "shrivel", "shrub", "shudder", "shuffle", "shun", "sickle", "siege", "sift", "sill", "silliness", "sinew", "singe", "skipper", "skirmish", "sluice", "slush", "smother", "smoulder", "snarl", "sneer", "snort", "snout", "snug", "solder", "soloist", "soluble", "spatter", "spectrum", "spinach", "spittle", "splinter", "sprinter", "squeak", "stagger", "staunch", "steed", "steeple", "steppe", "sterile", "steward", "stifle", "stipulate", "stocking", "stoker", "stout", "stow", "strenuous", "strew", "stripe", "strive", "stubble", "stump", "sturdy", "stutter", "subdivide", "subside", "subsist", "suede", "sulk", "sullen", "sultry", "sumptuous", "sunken", "supersede", "supplant", "supple", "suppress", "surmise", "surmount", "swarthy", "sway", "swerve", "swindle", "swine", "synthesis"] ,["the", "that", "this", "there", "they", "then", "too", "thank", "two", "talk", "thing", "told", "than", "these", "those", "through", "together", "their", "try", "tonight", "three", "today", "took", "truth", "tomorrow", "trust", "town", "trouble", "though", "time", "them", "ten", "think", "totally", "touch", "test", "twenty", "take", "top", "tired", "trip", "terrible", "table", "team", "thousand", "tough", "tape", "thirty", "third", "track", "tell", "turn", "type", "twice", "treat", "tree", "teach", "trial", "total", "trick", "taste", "truly", "threw", "tight", "twelve", "train", "terrific", "truck", "teeth", "tie", "ticket", "taught", "toast", "teacher", "threat", "trade", "tip", "trash", "tear", "tiny", "timing", "theory", "term", "talent", "travel", "training", "throat", "terms", "tongue", "treatment", "towards", "tall", "therapy", "trapped", "tour", "terribly", "trap", "turkey", "toilet", "Thursday", "tennis", "Tuesday", "theatre", "tradition", "towel", "title", "tablet", "tail", "tale", "tap", "target", "task", "tax", "taxi", "tea", "telly", "telephone", "territory", "text", "toe", "tomato", "tooth", "tourist", "tower", "translate", "transport", "trousers", "tube", "traffic", "twins", "till", "thin", "toy", "tool", "torture", "trace", "threaten", "trunk", "twisted", "temporary", "tense", "torn", "transfer", "thee", "therapist", "tend", "tone", "toss", "thief", "trail", "tag", "typical", "tension", "tank", "tragedy", "therefore", "twist", "trigger", "thick", "terror", "tendency", "tent", "tidy", "tin", "ton", "trend", "tricky", "tune", "tunnel", "tyre", "tears", "touching", "testimony", "trauma", "tragic", "twin", "tub", "talented", "thirteen", "traveling", "temper", "thinking", "tiger", "teenage", "treasure", "tramp", "tips", "tattoo", "thirsty", "troubles", "tore", "tire", "topic", "thumb", "tuna", "tumor", "turk", "thankful", "teenager", "tissue", "triple", "troops", "theirs", "tuck", "teen", "tick", "temple", "tan", "thrill", "terminal", "tender", "trophy", "technical", "tabloid", "torch", "triangle", "thorough", "thunder", "tease", "tobacco", "tutor", "tide", "tribe", "toll", "tempt", "triumph", "tenth", "thirst", "trim", "tackle", "tickle", "tractor", "thrust", "textbook", "timetable", "technique", "terrorist", "theme", "thus", "tile", "trailer", "transform", "tray", "troop", "tame", "telegraph", "tentative", "texture", "thesaurus", "thread", "tights", "timber", "tolerate", "toward", "treaty", "tremble", "tropical", "tulip", "testify", "toxic", "theft", "turner", "terrace", "tasty", "truce", "tee", "throne", "timer", "traitor", "traumatic", "tow", "tweak", "thieve", "twilight", "token", "turf", "trespass", "tomb", "teeny", "touchy", "turtle", "tactic", "titanic", "thug", "trainer", "thingy", "tribute", "telegram", "toaster", "tuition", "telescope", "trivial", "tenant", "thesis", "terrorism", "toenail", "tack", "tangible", "tariff", "teaspoon", "tedious", "teem", "temporal", "tendon", "testament", "textile", "thought", "threshold", "thrift", "timid", "tint", "toil", "tonsil", "torrent", "tortoise", "trait", "tram", "transient", "treason", "tread", "trickle", "Trinity", "trolley", "tsar", "turban", "turbulent", "turnip", "tusk", "twirl", "twitter", "tyran", "typist", "trey", "thinner", "tuxedo", "torment", "tighter", "toad", "tying", "tacky", "tonic", "twenties", "tangle", "tucker", "tart", "taping", "takeout", "twit", "trout", "tolerance", "tactical", "tummy", "troll", "takeover", "taint", "thrilling", "thigh", "terminate", "tasting", "tamper", "triad", "trashy", "tilt", "thorn", "turmoil", "truthful", "trump", "trench", "touchdown", "thaw", "tailor", "treasury", "twinkle", "temp", "typically", "tug", "topless", "twig", "trembling", "taunt", "tar", "twitch", "taxpayer", "tapestry", "tardy", "thimble", "throng", "thump", "thwart", "tinge", "tinsel", "tongs", "topple", "treble", "trifle", "truant", "tumult", "twine"] ,["until", "use", "under", "upset", "unless", "uncle", "usually", "usual", "upon", "ugly", "united", "unit", "universe", "useless", "unable", "undertake", "uniform", "unlike", "unlikely", "useful", "union", "unusual", "underwear", "unfair", "unhappy", "user", "ultimate", "unique", "unknown", "upper", "urban", "urge", "urgent", "used", "upstairs", "upside", "upsetting", "update", "undo", "umbrella", "unpack", "uncertain", "underline", "uneasy", "unite", "unity", "unlucky", "upright", "upward", "utility", "uptight", "unlock", "unstable", "utterly", "untie", "urine", "utter", "undermine", "unborn", "uncommon", "undone", "unwanted", "ulcer", "unaware", "unbutton", "unchanged", "unequal", "uneven", "unjust", "unkind", "unruly", "unrest", "unsettled", "unskilful", "untidy", "unworthy", "upbrining", "uphill", "uprising", "usage", "utmost", "uninvited", "unfit", "ultimatum", "unload", "universal", "urn", "ulterior", "uptown", "ultra", "unethical", "unreal", "uphold", "unarmed", "unnatural", "underage", "unhealthy", "unicorn", "uncanny", "unlimited", "usher", "upgrade", "upcoming", "untrue", "uncover", "unwind", "udder"] ,["very", "voice", "visit", "video", "van", "vote", "vampire", "victim", "view", "valley", "vision", "village", "victory", "vacation", "variation", "vary", "vast", "vegetable", "via", "visual", "volume", "vine", "value", "virus", "version", "vice", "violence", "visiting", "virgin", "vow", "violent", "valuable", "various", "vehicle", "virtually", "virtue", "visible", "visitor", "vital", "voluntary", "volunteer", "videotape", "vicious", "vault", "verdict", "vengeance", "violation", "versus", "vessel", "variety", "vain", "vomit", "volcano", "verify", "vitamin", "vanish", "vacant", "vivid", "vague", "vacancy", "variable", "vat", "vein", "verb", "vertical", "veteran", "viewpoint", "vinegar", "vowel", "voyage", "valid", "void", "violet", "verge", "vent", "voting", "villa", "vanilla", "veil", "venture", "vest", "vacuum", "verbal", "veal", "vile", "vase", "verse", "vouch", "violin", "vandalism", "vapour", "varnish", "velocity", "venison", "venomous", "versatile", "vestige", "vibrate", "vigilance", "vigorous", "vogue", "vulgar", "vulture", "vanquish", "velvet", "vanity", "virginity", "vaguely", "vista", "vintage", "viper", "villain", "visa", "viewer", "vending", "valve", "volatile", "veto", "valiant", "valet", "vaccine", "viable", "violate", "virtual", "vicinity", "venue", "vocal", "vane", "vehemence", "vexation", "vivacious", "voracious"] ,["was", "with", "well", "want", "why", "when", "were", "who", "way", "where", "wait", "wrong", "whole", "woman", "which", "world", "while", "without", "whatever", "worry", "wife", "wish", "walk", "wedding", "wonderful", "water", "women", "welcome", "worse", "weird", "white", "word", "work", "week", "worth", "win", "wear", "write", "war", "wonder", "would", "whether", "worst", "window", "whose", "weekend", "wrote", "waste", "wall", "warm", "wind", "west", "witness", "whoever", "wine", "writing", "wild", "within", "warning", "warn", "wherever", "weak", "weapon", "weight", "woke", "watch", "wise", "weather", "what", "wet", "wash", "worrying", "whom", "wound", "whip", "wheel", "wide", "winter", "wood", "wing", "wage", "wake", "wander", "ward", "wardrobe", "weakness", "wealth", "web", "website", "western", "whereas", "wooden", "wool", "workshop", "wallet", "winner", "wolf", "wore", "wreck", "walker", "wire", "wishes", "wrap", "wrapped", "will", "waitress", "wave", "warehouse", "wipe", "worries", "Wednesday", "withdraw", "widely", "whisper", "whenever", "warrant", "worthy", "wives", "wounded", "wicked", "waiter", "worn", "wrestling", "wisdom", "worthless", "whistle", "wrist", "wig", "widow", "worker", "whack", "wade", "wizard", "welfare", "wee", "wandering", "warrior", "worm", "washing", "warden", "warlock", "wagon", "whipped", "wit", "wax", "weed", "weigh", "wealthy", "wheat", "writer", "weekly", "warmth", "waist", "wrinkle", "weep", "went", "whale", "widen", "width", "windy", "wink", "worship", "wallpaper", "waterfall", "witch", "woo", "weasel", "whiskey", "worldwide", "whining", "woof", "whoop", "waiting", "warming", "wily", "won", "watcher", "woody", "witty", "whine", "wrath", "wrench", "whichever", "walnut", "wary", "watery", "wharf", "whirl", "wholly", "wilful", "wireless", "withhold", "wrangle", "wring", "warmer", "wiser", "willingly", "waltz", "wrestle", "wretched", "wand", "wrecking", "wits", "waffles", "wedge", "whiz", "warp", "wishful", "wimp", "wiggle", "welcoming", "weary", "wed", "weaver", "whim", "womb", "wiring", "wildest", "wisely", "wildlife", "wider", "wan", "warfare", "wad", "workplace", "weave", "weaker", "woe", "wallow", "whereby", "wail", "whet", "whimper", "whirlpool", "willow", "wistful", "wreath", "wrest", "wriggle", "wry"], [] ,["you", "your", "yes", "yourself", "year", "yours", "young", "yesterday", "yard", "yellow", "yet", "youth", "yell", "youngster", "younger", "yacht", "yearbook", "yield", "yearly", "yummy", "youngest", "yogurt", "yoga", "yawn", "yeast", "yolk", "yearn", "yank", "yap", "yelp", "yoke", "yowl"],["zoo", "zero", "zone", "zip", "zoom", "zipper", "zomby", "zillion", "zap", "zeal", "zoology", "zealot", "zealous", "zenith", "zigzag", "zodiac"]];