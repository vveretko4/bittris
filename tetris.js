const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let score = 0;
let level = 1;
let gameInterval;
let isPaused = false;

const shapes = [
    { shape: [[1, 1, 1, 1]], color: '#FF0D72' },  // I
    { shape: [[1, 1], [1, 1]], color: '#0DC2FF' },  // O
    { shape: [[1, 1, 1], [0, 1, 0]], color: '#0DFF72' },  // T
    { shape: [[1, 1, 1], [1, 0, 0]], color: '#F538FF' },  // L
    { shape: [[1, 1, 1], [0, 0, 1]], color: '#FF8E0D' },  // J
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#FFE138' },  // S
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#3877FF' }   // Z
];

let currentPiece = {
    shape: null,
    color: null,
    x: 0,
    y: 0
};

function drawBoard() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece() {
    ctx.fillStyle = currentPiece.color;
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                ctx.fillRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function newPiece() {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    currentPiece.shape = randomShape.shape;
    currentPiece.color = randomShape.color;
    currentPiece.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;

    if (!isValidMove(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        gameOver();
    }
}

function isValidMove(x, y, shape) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j]) {
                const newX = x + j;
                const newY = y + i;
                if (newY >= BOARD_HEIGHT || newX < 0 || newX >= BOARD_WIDTH || board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function mergePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        scoreElement.textContent = score;
        if (score >= level * 1000) {
            level++;
            levelElement.textContent = level;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, 1000 / level);
        }
    }
}

function moveDown() {
    if (isValidMove(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
    } else {
        mergePiece();
        clearLines();
        newPiece();
    }
}

function moveLeft() {
    if (isValidMove(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x--;
    }
}

function moveRight() {
    if (isValidMove(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x++;
    }
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );
    if (isValidMove(currentPiece.x, currentPiece.y, rotated)) {
        currentPiece.shape = rotated;
    }
}

function gameLoop() {
    if (!isPaused) {
        moveDown();
        drawBoard();
        drawPiece();
    }
}

function startGame() {
    console.log("startGame function called");
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    newPiece();
    clearInterval(gameInterval); // Clear previous game interval if any
    gameInterval = setInterval(gameLoop, 1000 / level);
    isPaused = false; // Ensure the game is not paused when starting
    pauseButton.textContent = 'Pause Game'; // Ensure button text is set correctly
}

function pauseGame() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
        pauseButton.textContent = 'Resume Game'; // Change button text to indicate resume
    } else {
        gameInterval = setInterval(gameLoop, 1000 / level);
        pauseButton.textContent = 'Pause Game'; // Change button text back to pause
    }
}

function gameOver() {
    clearInterval(gameInterval);
    alert('Game Over! Your score: ' + score);
}

document.addEventListener('keydown', (e) => {
    if (!isPaused) {
        switch (e.keyCode) {
            case 37: moveLeft(); break;
            case 39: moveRight(); break;
            case 40: moveDown(); break;
            case 38: rotate(); break;
        }
        drawBoard();
        drawPiece();
    }
});

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);

console.log("Tetris script loaded");

// Telegram Mini App specific code

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded and parsed");
    if (startButton) {
        startButton.addEventListener('click', startGame);
        console.log("Start button listener attached");
    } else {
        console.error("Start button not found");
    }
    if (pauseButton) {
        pauseButton.addEventListener('click', pauseGame);
        console.log("Pause button listener attached");
    } else {
        console.error("Pause button not found");
    }
});

window.Telegram.WebApp.ready();
