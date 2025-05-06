class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeBoard() {
        return [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];
    }

    initializeGame() {
        this.setupBoard();
        this.setupCoordinates();
        this.updateStatus();
    }

    setupBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.textContent = this.board[row][col];
                chessboard.appendChild(square);
            }
        }
    }

    setupCoordinates() {
        const files = 'abcdefgh';
        const fileCoords = document.querySelector('.file-coords');
        const rankCoords = document.querySelector('.rank-coords');

        fileCoords.innerHTML = '';
        rankCoords.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            const fileLabel = document.createElement('div');
            fileLabel.textContent = files[i];
            fileCoords.appendChild(fileLabel);

            const rankLabel = document.createElement('div');
            rankLabel.textContent = 8 - i;
            rankCoords.appendChild(rankLabel);
        }
    }

    setupEventListeners() {
        document.getElementById('chessboard').addEventListener('click', (e) => {
            if (e.target.classList.contains('square')) {
                this.handleClick(e);
            }
        });

        document.getElementById('restart').addEventListener('click', () => this.restartGame());
        document.getElementById('undo').addEventListener('click', () => this.undoMove());
    }

    handleClick(event) {
        const square = event.target;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.board[row][col];

        if (this.selectedPiece) {
            if (this.isValidMove(row, col)) {
                this.movePiece(row, col);
            } else {
                this.clearSelection();
                if (piece && this.isPieceOfCurrentPlayer(piece)) {
                    this.selectPiece(row, col);
                }
            }
        } else if (piece && this.isPieceOfCurrentPlayer(piece)) {
            this.selectPiece(row, col);
        }
    }

    isPieceOfCurrentPlayer(piece) {
        const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
        const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];
        return this.currentPlayer === 'white' ? 
            whitePieces.includes(piece) : 
            blackPieces.includes(piece);
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.highlightSquare(row, col, 'selected');
        this.showValidMoves(row, col);
    }

    isValidMove(newRow, newCol) {
        // Basic validation - can't capture own pieces
        const targetPiece = this.board[newRow][newCol];
        if (targetPiece && this.isPieceOfCurrentPlayer(targetPiece)) {
            return false;
        }

        const piece = this.board[this.selectedPiece.row][this.selectedPiece.col];
        const rowDiff = Math.abs(newRow - this.selectedPiece.row);
        const colDiff = Math.abs(newCol - this.selectedPiece.col);

        // Basic movement rules for each piece
        switch (piece) {
            case '♙': // White pawn
                return this.isValidPawnMove(newRow, newCol, -1);
            case '♟': // Black pawn
                return this.isValidPawnMove(newRow, newCol, 1);
            case '♖': case '♜': // Rook
                return this.isValidRookMove(newRow, newCol);
            case '♗': case '♝': // Bishop
                return rowDiff === colDiff;
            case '♘': case '♞': // Knight
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
            case '♕': case '♛': // Queen
                return rowDiff === colDiff || newRow === this.selectedPiece.row || newCol === this.selectedPiece.col;
            case '♔': case '♚': // King
                return rowDiff <= 1 && colDiff <= 1;
            default:
                return false;
        }
    }

    isValidPawnMove(newRow, newCol, direction) {
        const startRow = direction === 1 ? 1 : 6; // Starting row for pawns
        const currentRow = this.selectedPiece.row;
        const currentCol = this.selectedPiece.col;
        const rowDiff = newRow - currentRow;
        const colDiff = Math.abs(newCol - currentCol);

        // Moving forward
        if (colDiff === 0) {
            if (rowDiff === direction && !this.board[newRow][newCol]) {
                return true;
            }
            // First move can be two squares
            if (currentRow === startRow && rowDiff === 2 * direction && 
                !this.board[newRow][newCol] && !this.board[currentRow + direction][currentCol]) {
                return true;
            }
        }
        // Capturing
        else if (colDiff === 1 && rowDiff === direction && this.board[newRow][newCol]) {
            return true;
        }
        return false;
    }

    isValidRookMove(newRow, newCol) {
        const currentRow = this.selectedPiece.row;
        const currentCol = this.selectedPiece.col;

        if (newRow !== currentRow && newCol !== currentCol) {
            return false;
        }

        // Check if path is clear
        if (newRow === currentRow) {
            const step = newCol > currentCol ? 1 : -1;
            for (let col = currentCol + step; col !== newCol; col += step) {
                if (this.board[currentRow][col]) return false;
            }
        } else {
            const step = newRow > currentRow ? 1 : -1;
            for (let row = currentRow + step; row !== newRow; row += step) {
                if (this.board[row][currentCol]) return false;
            }
        }
        return true;
    }

    showValidMoves(row, col) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isValidMove(i, j)) {
                    this.highlightSquare(i, j, 'valid-move');
                }
            }
        }
    }

    movePiece(newRow, newCol) {
        const oldRow = this.selectedPiece.row;
        const oldCol = this.selectedPiece.col;
        const capturedPiece = this.board[newRow][newCol];

        // Record move in history
        this.moveHistory.push({
            from: { row: oldRow, col: oldCol },
            to: { row: newRow, col: newCol },
            piece: this.board[oldRow][oldCol],
            captured: capturedPiece
        });

        // Handle captured piece
        if (capturedPiece) {
            const capturedBy = this.currentPlayer;
            this.capturedPieces[capturedBy].push(capturedPiece);
            this.updateCapturedPieces();
        }

        // Move piece
        this.board[newRow][newCol] = this.board[oldRow][oldCol];
        this.board[oldRow][oldCol] = '';

        this.updateBoard();
        this.updateMoveHistory();
        this.clearSelection();
        this.switchPlayer();
    }

    updateBoard() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            square.textContent = this.board[row][col];
        });
    }

    updateCapturedPieces() {
        ['white', 'black'].forEach(color => {
            const container = document.getElementById(`captured-${color}`);
            container.textContent = this.capturedPieces[color].join(' ');
        });
    }

    updateMoveHistory() {
        const movesContainer = document.getElementById('moves');
        const move = this.moveHistory[this.moveHistory.length - 1];
        const moveNumber = Math.ceil(this.moveHistory.length / 2);
        const files = 'abcdefgh';
        const ranks = '87654321';

        const moveText = document.createElement('div');
        moveText.textContent = `${moveNumber}. ${move.piece} ${files[move.from.col]}${ranks[move.from.row]} → ${files[move.to.col]}${ranks[move.to.row]}`;
        if (move.captured) {
            moveText.textContent += ` (${move.captured})`;
        }

        movesContainer.appendChild(moveText);
        movesContainer.scrollTop = movesContainer.scrollHeight;
    }

    highlightSquare(row, col, className) {
        const square = document.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );
        square.classList.add(className);
    }

    clearSelection() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move');
        });
        this.selectedPiece = null;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateStatus();
    }

    updateStatus() {
        document.getElementById('status').textContent = 
            `${this.currentPlayer.charAt(0).toUpperCase() + 
            this.currentPlayer.slice(1)}'s turn`;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        // Restore the moved piece
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        // Restore the captured piece (if any) or empty the square
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured || '';

        // Remove the captured piece from the captured pieces list
        if (lastMove.captured) {
            const capturedBy = this.currentPlayer === 'white' ? 'black' : 'white';
            const index = this.capturedPieces[capturedBy].lastIndexOf(lastMove.captured);
            if (index !== -1) {
                this.capturedPieces[capturedBy].splice(index, 1);
            }
        }

        // Update the UI
        this.updateBoard();
        this.updateCapturedPieces();
        document.getElementById('moves').lastChild?.remove();
        this.switchPlayer();
    }

    restartGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.initializeGame();
        document.getElementById('moves').innerHTML = '';
        this.updateCapturedPieces();
    }
}

new ChessGame();