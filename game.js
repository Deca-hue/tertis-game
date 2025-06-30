  // Game constants
        const COLS = 10;
        const ROWS = 15;
        const BLOCK_SIZE = 30;
        const EMPTY = ' ';
        
        // Tetromino shapes
        const SHAPES = [
            { color: 'bg-cyan-500', shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] }, // I
            { color: 'bg-blue-500', shape: [[2, 0, 0], [2, 2, 2], [0, 0, 0]] }, // J
            { color: 'bg-orange-500', shape: [[0, 0, 3], [3, 3, 3], [0, 0, 0]] }, // L
            { color: 'bg-yellow-500', shape: [[4, 4], [4, 4]] }, // O
            { color: 'bg-green-500', shape: [[0, 5, 5], [5, 5, 0], [0, 0, 0]] }, // S
            { color: 'bg-purple-500', shape: [[0, 6, 0], [6, 6, 6], [0, 0, 0]] }, // T
            { color: 'bg-red-500', shape: [[7, 7, 0], [0, 7, 7], [0, 0, 0]] }  // Z
        ];
        
        // Game variables
        let grid = createGrid();
        let currentPiece = null;
        let nextPiece = null;
        let currentX = 0;
        let currentY = 0;
        let score = 0;
        let level = 1;
        let gameOver = false;
        let paused = false;
        let dropInterval = 1000;
        let gameInterval = null;
        
        // DOM elements
        const gameGrid = document.getElementById('game-grid');
        const nextPieceGrid = document.getElementById('next-piece-grid');
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resumeBtn = document.getElementById('resume-btn');
        const gameOverElement = document.getElementById('game-over');
        const pausedElement = document.getElementById('paused');
        const restartBtn = document.getElementById('restart-btn');
        
        // Initialize the game grid
        function createGrid() {
            return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
        }
        
        // Draw the game grid
        function drawGrid() {
            gameGrid.innerHTML = '';
            
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    
                    if (grid[y][x] !== EMPTY) {
                        const color = SHAPES[grid[y][x] - 1].color;
                        cell.classList.add(color);
                    } else {
                        cell.classList.add('bg-gray-700');
                    }
                    
                    gameGrid.appendChild(cell);
                }
            }
        }
        
        // Draw the next piece preview
        function drawNextPiece() {
            nextPieceGrid.innerHTML = '';
            
            const shape = nextPiece.shape;
            const color = nextPiece.color;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell bg-gray-700';
                    
                    if (shape[y][x]) {
                        cell.classList.add(color);
                    }
                    
                    nextPieceGrid.appendChild(cell);
                }
            }
        }
        
        // Generate a random piece
        function randomPiece() {
            const randomIndex = Math.floor(Math.random() * SHAPES.length);
            return {
                shape: SHAPES[randomIndex].shape,
                color: SHAPES[randomIndex].color
            };
        }
        
        // Start a new game
        function startGame() {
            grid = createGrid();
            score = 0;
            level = 1;
            gameOver = false;
            paused = false;
            dropInterval = 1000;
            
            scoreElement.textContent = score;
            levelElement.textContent = level;
            
            currentPiece = randomPiece();
            nextPiece = randomPiece();
            currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
            currentY = 0;
            
            drawGrid();
            drawNextPiece();
            
            gameOverElement.classList.add('hidden');
            pausedElement.classList.add('hidden');
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            
            gameInterval = setInterval(moveDown, dropInterval);
        }
        
        // Pause the game
        function pauseGame() {
            if (gameOver) return;
            
            paused = true;
            clearInterval(gameInterval);
            pausedElement.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        }
        
        // Resume the game
        function resumeGame() {
            paused = false;
            pausedElement.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            gameInterval = setInterval(moveDown, dropInterval);
        }
        
        // Check if the current position is valid
        function isValidMove(piece, offsetX, offsetY) {
            const shape = piece.shape;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const newX = currentX + x + offsetX;
                        const newY = currentY + y + offsetY;
                        
                        if (newX < 0 || newX >= COLS || newY >= ROWS) {
                            return false;
                        }
                        
                        if (newY >= 0 && grid[newY][newX] !== EMPTY) {
                            return false;
                        }
                    }
                }
            }
            
            return true;
        }
        
        // Rotate the current piece
        function rotatePiece() {
            if (paused || gameOver) return;
            
            const newShape = [];
            const shape = currentPiece.shape;
            
            // Transpose the matrix
            for (let x = 0; x < shape[0].length; x++) {
                newShape.push([]);
                for (let y = shape.length - 1; y >= 0; y--) {
                    newShape[x].push(shape[y][x]);
                }
            }
            
            const originalShape = currentPiece.shape;
            currentPiece.shape = newShape;
            
            // If rotation causes collision, revert
            if (!isValidMove(currentPiece, 0, 0)) {
                currentPiece.shape = originalShape;
            }
            
            drawGrid();
            drawCurrentPiece();
        }
        
        // Lock the current piece in place
        function lockPiece() {
            const shape = currentPiece.shape;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const gridY = currentY + y;
                        const gridX = currentX + x;
                        
                        if (gridY >= 0) {
                            grid[gridY][gridX] = shape[y][x];
                        }
                    }
                }
            }
            
            // Check for completed lines
            checkLines();
            
            // Get the next piece
            currentPiece = nextPiece;
            nextPiece = randomPiece();
            currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
            currentY = 0;
            
            drawNextPiece();
            
            // Check if game over
            if (!isValidMove(currentPiece, 0, 0)) {
                gameOver = true;
                clearInterval(gameInterval);
                gameOverElement.classList.remove('hidden');
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
            }
        }
        
        // Check for completed lines
        function checkLines() {
            let linesCleared = 0;
            
            for (let y = ROWS - 1; y >= 0; y--) {
                if (grid[y].every(cell => cell !== EMPTY)) {
                    // Remove the line
                    grid.splice(y, 1);
                    // Add a new empty line at the top
                    grid.unshift(Array(COLS).fill(EMPTY));
                    linesCleared++;
                    y++; // Check the same row again after shifting
                }
            }
            
            if (linesCleared > 0) {
                // Update score
                const points = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, 4 lines
                score += points[linesCleared] * level;
                scoreElement.textContent = score;
                
                // Update level every 10 lines
                const newLevel = Math.floor(score / 1000) + 1;
                if (newLevel > level) {
                    level = newLevel;
                    levelElement.textContent = level;
                    
                    // Increase speed
                    dropInterval = Math.max(100, 1000 - (level - 1) * 100);
                    clearInterval(gameInterval);
                    gameInterval = setInterval(moveDown, dropInterval);
                }
            }
        }
        
        // Draw the current piece on the grid
        function drawCurrentPiece() {
            const shape = currentPiece.shape;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const gridY = currentY + y;
                        const gridX = currentX + x;
                        
                        if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
                            const cellIndex = gridY * COLS + gridX;
                            const cell = gameGrid.children[cellIndex];
                            cell.className = 'cell ' + currentPiece.color;
                        }
                    }
                }
            }
        }
        
        // Move the current piece down
        function moveDown() {
            if (!gameOver && !paused) {
                if (isValidMove(currentPiece, 0, 1)) {
                    currentY++;
                    drawGrid();
                    drawCurrentPiece();
                } else {
                    lockPiece();
                    drawGrid();
                }
            }
        }
        
        // Move the current piece left
        function moveLeft() {
            if (!gameOver && !paused && isValidMove(currentPiece, -1, 0)) {
                currentX--;
                drawGrid();
                drawCurrentPiece();
            }
        }
        
        // Move the current piece right
        function moveRight() {
            if (!gameOver && !paused && isValidMove(currentPiece, 1, 0)) {
                currentX++;
                drawGrid();
                drawCurrentPiece();
            }
        }
        
        // Hard drop (instant drop)
        function hardDrop() {
            if (!gameOver && !paused) {
                while (isValidMove(currentPiece, 0, 1)) {
                    currentY++;
                }
                
                lockPiece();
                drawGrid();
            }
        }
        
        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (gameOver && e.key !== 'Enter') return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    moveLeft();
                    break;
                case 'ArrowRight':
                    moveRight();
                    break;
                case 'ArrowDown':
                    moveDown();
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
                case ' ':
                    hardDrop();
                    break;
                case 'p':
                case 'P':
                    if (paused) {
                        resumeGame();
                    } else {
                        pauseGame();
                    }
                    break;
                case 'Enter':
                    if (gameOver) {
                        startGame();
                    }
                    break;
            }
        });
        
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', pauseGame);
        resumeBtn.addEventListener('click', resumeGame);
        
        // Initialize the game
        drawGrid();

        // Iframe detection and styling
        if (window.self !== window.top) {
            document.body.classList.add('iframe-mode');
        }