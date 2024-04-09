const submittedArray = [];
const submitArray = [];
let gridCells = []; // Array to store references to all grid cells

const numRows = 4;
const numCols = 4;

const wordListElement = document.getElementById('wordList');

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
function createGrid(letters) {
    const grid = document.getElementById('grid');

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

function submitWord() {
    const word = submitArray.join('');
    //Preform word validation against dictionary here.
    console.log("Tried to submit ", word);

    //Forced sucess for testing
    submitSuccess(word);

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

function submitSuccess(word) {
    const listItem = document.createElement('li');
    listItem.textContent = word;
    wordListElement.appendChild(listItem);
}

function submitFailure() {
    //IDK yet
}

function generateBoard() {
    const lettersList = generateBoggleBoard(numRows, numCols);

    // Call the function to initially create the grid
    createGrid(lettersList);
}

generateBoard();
