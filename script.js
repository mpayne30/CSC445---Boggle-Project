const player1SubmittedArray = [];
const player1SubmitArray = [];

const player2SubmittedArray = [];
const player2SubmitArray = [];

const player1WordList = document.getElementById('player1WordList');
const player2WordList = document.getElementById('player2WordList');

let gridCells = []; // Array to store references to all grid cells

const numRows = 4;
const numCols = 4;


function generateBoggleBoard() {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    const letterDistribution = [...vowels,...vowels, ...vowels, ...vowels, ...consonants, ...consonants, ...consonants, ...consonants, ...consonants]; // Vowels:Consonants in a 4:5 Ratio

    const board = [];

    // Loop through each row
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

    return board;
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
            const cellContent = document.createElement('div'); // Create a <div> for cell content
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

            // Add click event listener to each cell
            cell.addEventListener('click', () => {
                cellContent.style.backgroundColor = "#00CED1";
                submitArray.push(cell.querySelector('div').textContent);
                console.log(submitArray);
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

function submitWord(gridID) {
    if (gridID=="player1Grid"){
        const word = player1SubmitArrayArray.join('');
    } else {
        const word = player2SubmitArrayArray.join('');
    }

    //Preform word validation against dictionary here.
    console.log("Tried to submit ", word);

    //Forced sucess for testing
    submitSuccess(word, gridID);

    // Reset background color of all cells
    gridCells.forEach(row => {
        row.forEach(cell => {
            const cellContent = cell.querySelector('div');
            cellContent.style.backgroundColor = "#E6E6FA";
        });
    });

    // Clear the submitArray
    submitArray.length = 0;
}

function submitSuccess(word, gridID) {
    if (gridID=="player1Grid"){
        const listItem = document.createElement('li');
        listItem.textContent = word;
        player1WordList.appendChild(listItem);
    } else {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        player2WordList.appendChild(listItem);
    }
}

function submitFailure() {
    //IDK yet
}

function generateBoard() {
    const lettersList = generateBoggleBoard(numRows, numCols);

    // Call the function to initially create the grid
    createGrid(lettersList, "player1Grid");
    createGrid(lettersList, "player2Grid");
}

generateBoard();
