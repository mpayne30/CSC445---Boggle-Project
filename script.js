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
let seconds = 180;

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

function resetGridColor() {
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

        //Ends ai attempts at time limit reguardless of remaining attempts
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
    }, 3000);
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

            resetGridColor();
        } else {
            if (gameMode != "playerVsAI") {
                console.log("Failed to submit");
                alert("Word is invalid: failed to submit");
            }
            //console.log("AI Tried");
            resetGridColor();

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

    resetGridColor();
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