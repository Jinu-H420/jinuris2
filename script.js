const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const nextPieceContext = nextPieceCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('startButton');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const EMPTY = 0;

let board = [];
let score = 0;
let level = 1;
let interval = 1000;
let dropStart = Date.now();
let isGameOver = false;

const shapes = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]]  // J
];

let currentPiece;
let nextPiece;
let currentX;
let currentY;

function createBoard() {
    for (let y = 0; y < ROWS; y++) {
        board[y] = [];
        for (let x = 0; x < COLS; x++) {
            board[y][x] = EMPTY;
        }
    }
}

function drawBlock(x, y, color, ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== EMPTY) {
                drawBlock(x, y, 'cyan', context);
            }
        }
    }
}

function drawPiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                drawBlock(currentX + x, currentY + y, 'orange', context);
            }
        }
    }
}

function drawNextPiece() {
    nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    for (let y = 0; y < nextPiece.length; y++) {
        for (let x = 0; x < nextPiece[y].length; x++) {
            if (nextPiece[y][x]) {
                drawBlock(x, y, 'orange', nextPieceContext);
            }
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece();
    drawNextPiece();
}

function newPiece() {
    currentPiece = nextPiece;
    nextPiece = shapes[Math.floor(Math.random() * shapes.length)];
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2);
    currentY = 0;
    if (collide(currentX, currentY, currentPiece)) {
        isGameOver = true;
        alert('ゲームオーバー！ スコア: ' + score);
        document.location.reload();
    }
}

function collide(x, y, piece) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col] && (board[y + row] && board[y + row][x + col]) !== EMPTY) {
                return true;
            }
        }
    }
    return false;
}

function placePiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                board[currentY + y][currentX + x] = 1;
            }
        }
    }
    clearLines();
    newPiece();
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== EMPTY)) {
            board.splice(y, 1);
            board.unshift(new Array(COLS).fill(EMPTY));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        scoreElement.textContent = score;
        if (score % 1000 === 0) {
            level++;
            levelElement.textContent = level;
            interval = Math.max(100, interval - 100);
        }
    }
}

function drop() {
    if (!isGameOver) {
        const now = Date.now();
        const delta = now - dropStart;
        if (delta > interval) {
            if (!collide(currentX, currentY + 1, currentPiece)) {
                currentY++;
            } else {
                placePiece();
            }
            dropStart = now;
        }
        draw();
        requestAnimationFrame(drop);
    }
}

function movePiece(dir) {
    if (!collide(currentX + dir, currentY, currentPiece)) {
        currentX += dir;
    }
}

function rotatePiece() {
    const rotated = currentPiece[0].map((val, index) => currentPiece.map(row => row[index]).reverse());
    if (!collide(currentX, currentY, rotated)) {
        currentPiece = rotated;
    }
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        movePiece(-1);
    } else if (event.key === 'ArrowRight') {
        movePiece(1);
    } else if (event.key === 'ArrowDown') {
        if (!collide(currentX, currentY + 1, currentPiece)) {
            currentY++;
        }
    } else if (event.key === 'ArrowUp') {
        rotatePiece();
    }
});

startButton.addEventListener('click', () => {
    createBoard();
    nextPiece = shapes[Math.floor(Math.random() * shapes.length)];
    newPiece();
    drop();
    startButton.disabled = true;
});