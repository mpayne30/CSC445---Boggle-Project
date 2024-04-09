
const submitArray = [];

const numRows = 4;
const numCols = 4;

function generateRandomLetterArray(rows, cols) {
    const letterArray = [];

    // Loop through each row
    for (let i = 0; i < rows; i++) {
        const row = [];

        // Loop through each column in the current row
        for (let j = 0; j < cols; j++) {
            // Generate a random letter (A-Z) using ASCII code
            const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            row.push(randomLetter); // Push the random letter to the current row
        }

        letterArray.push(row); // Push the row to the 2D array
    }

    return letterArray;
}

// Function to create the grid from the letters list
function createGrid(letters) {
    const grid = document.getElementById('grid');

    // Clear existing content
    grid.innerHTML = '';

    // Loop through each row in the letters list
    letters.forEach(rowData => {
        const row = document.createElement('tr');

        // Loop through each letter in the row
        rowData.forEach(letter => {
            const cell = document.createElement('td');
            const cellContent = document.createElement('div'); // Create a <div> for cell content
            cellContent.textContent = letter; // Set the text content of the <div>

            // Add styles to the cell content <div>
            cellContent.style.width = '100%';
            cellContent.style.height = '100%';
            cellContent.style.display = 'flex';
            cellContent.style.alignItems = 'center';
            cellContent.style.justifyContent = 'center';

            // Add click event listener to each cell
            cell.addEventListener('click', () => {
                //Preform letter validation here
                //Must be adjacted to an already clicked letter and not already been clicked.
                cellContent.style.backgroundColor = "blue";
                submitArray.push(cell.querySelector('div').textContent);
                console.log(submitArray);
            });

            cell.appendChild(cellContent); // Append the <div> to the cell
            row.appendChild(cell); // Append the cell to the row
        });

        grid.appendChild(row); // Append the row to the table
    });
}

const lettersList = generateRandomLetterArray(numRows, numCols);

// Call the function to initially create the grid
createGrid(lettersList);
