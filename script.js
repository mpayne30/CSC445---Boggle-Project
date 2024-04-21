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

const currentWordID = new Stack();
const currentWordContent = new Stack();

let gridCells = []; // Array to store references to all grid cells of player 1

const numRows = 4;
const numCols = 4;

let gameMode;

let timerInterval;
let seconds = 60;


function generateBoggleBoard(initial) {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

    //This const was gotten from chat gpt for letter distribution.
    const letterDistribution = [...vowels,...vowels, ...vowels, ...vowels, ...consonants, ...consonants, ...consonants, ...consonants, ...consonants]; // Vowels:Consonants in a 4:5 Ratio

    const board = [];

    // Loop through each row
    if (initial === true){
        for (let i = 0; i < numRows; i++) {
            const row = [];

            // Loop through each column in the current row
            for (let j = 0; j < numCols; j++) {
                // Generate a random index to select a letter from the distribution
                const randomIndex = Math.floor(Math.random() * letterDistribution.length);
                const randomLetter = letterDistribution[randomIndex];
                row.push(randomLetter); // Push the random letter to the current row
            }

            board.push(row); // Push the row to the 2D array (board)
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
            cellContent.style.backgroundColor = "#E6E6FA";

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
                    if (cell.getAttribute('data-on') !== 'true' && isAdjacent(cell) && timerActive) {
                        cellContent.style.backgroundColor = "#00CED1";
                        cell.setAttribute('data-on', 'true');

                        currentWordID.push(cell);
                        currentWordContent.push(cellContent.textContent);

                        document.getElementById("currentWord").textContent = ("Current Word: "+currentWordContent.join());
                    } else if (cell.getAttribute('data-on') === 'true' && cell.id === currentWordID.peek().id && timerActive) {
                        cell.setAttribute('data-on', 'false');
                        cellContent.style.backgroundColor = "#E6E6FA";

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

// fix post stack implimentation
function submitWord(gridID) {
    let word = currentWordContent.join();

    if (currentWordID.size() > 2){
        if (wordValidation(word, gridID)){
            //Get current players id, update appropriate score, reset board state.
            if (playerId = '01'){
                player1Points += calculateScore(word);
                document.querySelectorAll('.player1Score').forEach(element => {
                    if (gameMode = "singlePlayer")
                    element.textContent = "Score: ".concat(player1Points);
                    else if (gameMode = "twoPlayer") {
                        element.textContent = "Player One's Score: " + player1Points;
                    }
                });
            } else {
                player2Points += calculateScore(word);
                if (gameMode = "twoPlayer")
                    element.textContent = "Player Two's Score: ".concat(player2Points);
                else if (gameMode = "playerVsAI") {
                    element.textContent = "Computer's Score: " + player2Points;
                }
            }

            // Add valid submitted word to word list.
            const listItem = document.createElement('li');
            listItem.textContent = word;
            wordList.appendChild(listItem);

            // Clear the submitArray
            currentWordID.clear();
            currentWordContent.clear();

            // Reset text box
            document.getElementById("currentWord").textContent = "Current Word: ";

            // Reset background color of all cells of the given player grid
            gridCells.forEach(row => {
                row.forEach(cell => {
                    const cellContent = cell.querySelector('div');
                    cellContent.style.backgroundColor = "#E6E6FA";
                    cell.setAttribute('data-on', false);
                });
            });
        } else {
            console.log("Failed to submit");
        alert("Word is not valid: failed to submit");
        }
    } else {
        console.log("Failed to submit");
        alert("Word is too short: failed to submit");
    }
}

function wordValidation(word) {
    // John: Word validation

    //Temp forced validation for testing
    return true;
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

        //Since playerID changes at turn end this check allows me to see if it is the first or second turn of a game instance.
        if (playerID === "01"){
            showTurnEnd();
        } else {
            showGameEnd();
        }
    }
}

function showTurnEnd() {
    if (gameMode === "twoPlayer"){
        document.getElementById("endOfTurnText").textContent = "End of Player 1's Turn";
        document.getElementById("endOfTurnScore").textContent = "Score: "+player1Points;
        document.getElementById("endOfTurnButton").textContent = "Player 2's Turn";
        const turnDialog = document.getElementById("turnEndDialog");
        turnDialog.showModal();
        playerID = "02";
    } else if (gameMode === "playerVsAI"){
        document.getElementById("endOfTurnText").textContent = "End of Player's Turn"
        document.getElementById("endOfTurnScore").textContent = "Score: "+player1Points;
        document.getElementById("endOfTurnButton").textContent = "Computer's Turn";
        const turnDialog = document.getElementById("turnEndDialog");
        turnDialog.showModal();
        playerID = "Computer";
    } else {
        showGameEnd();
    }
}

function showGameEnd(){
    if (gameMode === "twoPlayer"){
        document.getElementById("endOfGameText").textContent = (player1Points === player2Points) ? "Its a tie!" : (player1Points > player2Points) ? "Player 1 Wins!" : "Player 2 Wins!";
        document.getElementById("endOfGameScore").textContent = "Scores: "+player1Points+" : "+player2Points;
    } else if (gameMode === "playerVsAI"){
        document.getElementById("endOfGameText").textContent = (player1Points === player2Points) ? "Its a tie!" : (player1Points > player2Points) ? "Player Wins!" : "Computer Wins!";
        document.getElementById("endOfGameScore").textContent = "Scores: "+player1Points+" : "+player2Points;
    } else {
        document.getElementById("endOfGameScore").textContent = "Score: "+player1Points;
    }
    const endDialog = document.getElementById("gameEndDialog");
    endDialog.showModal();
}

function resetTextBoxes(){
    document.getElementById("gridAndWordContainer").style.marginTop = "2.5%";

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

function setGameMode(gameMode) {
    this.gameMode = gameMode;
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

blockAllScoreBoxes();
generateBoggleBoard(false);

function startGame() {
    document.getElementById("turnEndDialog").close();
    document.getElementById("gameEndDialog").close();
    clearInterval(timerInterval);
    resetTextBoxes();
    generateBoggleBoard(true);
    setGameMode(document.getElementById("gameModeSelector").value);
}
