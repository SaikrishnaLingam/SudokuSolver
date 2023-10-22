let arr = [[], [], [], [], [], [], [], [], []];
//arr has references to HTML elements representing individual cells
    
for (let i = 0; i < 9; i++) {   //for easy manipulation and interaction with cells on webpage
    for (let j = 0; j < 9; j++) 
        arr[i][j] = document.getElementById(i * 9 + j);
}
//this is the board that we will use to take input and solve the sudoku
let board = []; 
for (let i = 0; i < 9; i++) {   //all values in board are initially 0
    board[i] = [];
    for (let j = 0; j < 9; j++) {
        board[i][j] = 0;
    }
}

function FillBoard(board) { //take values from initial board and updates in arr which means it basically updates on webpage
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] != 0) {
                arr[i][j].style.color = 'black';
                arr[i][j].innerText = board[i][j];
                arr[i][j].contentEditable = false;  // to avoid editing
            } else {
                arr[i][j].contentEditable = true;
                arr[i][j].style.color = 'white';
                arr[i][j].innerText = '';   //empty string
            }
        }
    }
}

function FillFinalBoard(board) {    //displays solution
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] != 0 && arr[i][j].innerText == '') {
                arr[i][j].innerText = board[i][j];
            } 
        }
    }
}
//Difficulties
let Easy = document.getElementById('Easy');
let Medium = document.getElementById('Medium');
let Hard = document.getElementById('Hard');
let Random = document.getElementById('Random');
//Actions
let SolvePuzzle = document.getElementById('SolvePuzzle');
let Clear = document.getElementById('ClearBoard');
let Check = document.getElementById('CheckPuzzle');
let Correct = document.getElementById('Correct');

function fetchDataAndFillBoard(difficulty) {
    let xhrRequest = new XMLHttpRequest();
    xhrRequest.open('get', `https://sugoku.onrender.com/board?difficulty=${difficulty}`);
    xhrRequest.onload = function () {
        if (xhrRequest.status === 200) {
            let response = JSON.parse(xhrRequest.response);
            console.log(response);
            board = response.board;
            removeRed();
            FillBoard(board);
            solver(board);
        }
        else 
            console.error('Error loading puzzle:', xhrRequest.status, xhrRequest.statusText);
    };
    xhrRequest.onerror = function () {
        console.error('Network error occurred while loading puzzle');
    };

    xhrRequest.send();
}

function ClearBoard() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (arr[i][j].style.color !== 'black') {
                arr[i][j].innerText = '';
                document.getElementById(i * 9 + j).style.backgroundColor = '';  //makes background color default, reverts back from red
            }
        }
    }
}

Easy.onclick = function () {
    fetchDataAndFillBoard('easy');
};

Medium.onclick = function () {
    fetchDataAndFillBoard('medium');
};

Hard.onclick = function () {
    fetchDataAndFillBoard('hard');
};

Random.onclick = function () {
    fetchDataAndFillBoard('random');
};

Clear.onclick = function () {
    ClearBoard();
}

SolvePuzzle.onclick = () => {   //first clears the arr, (i.e what is displayed, doesn't clear the board as the board has the correct sol) first, then copies the solved board onto the webpage
    if (isBoardEmpty(board)) {
        alert("Choose difficulty level before attempting to solve the puzzle.");
    } else {
        // If the board is not empty, solve
        ClearBoard();
        solveSudoku(board);
    }
};

Check.onclick = function () {   //Just checks if given inputs is correct; doesn't show which ones are correct
    let flag = true;
    let empty = false;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (arr[i][j].innerText == '') {
                empty = true;
                continue;
            }
            if (arr[i][j].innerText != board[i][j]) {
                flag = false;
                break;     
            } 
        }
        if (flag == false)  break;
    }

    if (flag == true && empty == false) 
        alert('Congratulations! You solved the puzzle.');
    else if (flag == true && empty == true) 
        alert('So far, so good!');
    else 
        alert('Try again!');
};

Correct.onclick = function () { //checks if given inputs is correct; show which ones are correct
    let flag = true;
    let mistakes = 0; // Count of mistakes
    let empty = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (arr[i][j].innerText == '')
                empty++;
            else if (arr[i][j].innerText != '' && arr[i][j].innerText != board[i][j]) {
                document.getElementById(i * 9 + j).style.backgroundColor = 'red';
                flag = false;
                mistakes++;
            }
        }
    }

    if (flag && mistakes === 0 && empty === 0)
    alert('Congratulations! You solved the puzzle without mistakes!');
    else if (flag)
        alert(`So far, so good!\nYou have ${empty} more cell(s) to go.`);
    else 
        alert(`You made ${mistakes} mistakes. \nMistakes are in red! \nTry again.`);
};

//check if board is empty
function isBoardEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] != 0) {
                return false; // The board is not empty
            }
        }
    }
    return true; // The board is empty
}

//Add event handler for red marked cells
for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
        if (arr[i][j].style.color != 'black') {
            arr[i][j].contentEditable = true;
            arr[i][j].addEventListener('input', Correct);
            arr[i][j].addEventListener('keydown', function (del) {  //to undo/delete input in a cell
                if (del.key === 'Backspace') {
                    del.target.innerText = ''; // Clear the text content
                    document.getElementById(i * 9 + j).style.backgroundColor = '#a3c0c3';
                }
            });
        }
    }
}

function removeRed() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (arr[i][j].style.backgroundColor === 'red') {
                arr[i][j].style.backgroundColor = ''; // Clear the red background
            }
        }
    }
}

function isValid(row, col, num, board) {
    //Basically implemented what I did in leetcode
    // Check row
    for (let j = 0; j < 9; j++) {
        if (board[row][j] == num) {
            return false;
        }
    }
    // Check column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] == num) {
            return false;
        }
    }
    // Check 3x3 grid
    for (let i = Math.floor(row / 3) * 3; i < Math.floor(row / 3) * 3 + 3; i++) {
        for (let j = Math.floor(col / 3) * 3; j < Math.floor(col / 3) * 3 + 3; j++) {
            if (board[i][j] == num) {
                return false;
            }
        }
    }
    return true;
}

function solver(board) {
    // Backtracking
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] == 0) {
                for (let k = 1; k <= 9; k++) {
                    if (isValid(i, j, k.toString(), board)) {
                        board[i][j] = k;
                        if (solver(board)) {
                            return true;
                        }
                        board[i][j] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function solveSudoku(board) {
    FillFinalBoard(board);
}