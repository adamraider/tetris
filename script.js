const gameEl = document.getElementById("root");
const previewEl = document.getElementById("preview");
const debugEl = document.getElementById("debug");

const DEBUG = false;

/**
 * Constants
 */
const ROWS = 32;
const COLS = 16;

const Colors = {
  ACTIVE: "#FA4224",
  EMPTY: "black",
};

const Values = {
  ACTIVE: 1,
  EMPTY: 0,
};

/**
 * Pieces
 */
class Piece {
  constructor(positions, color) {
    this.positions = positions;
    this.positionIndex = 0;
    this.color = color;
  }

  getCells() {
    return this.positions[this.positionIndex];
  }

  rotate() {
    this.cells;
  }

  rotateRight() {
    this.positionIndex = this.nextRotationIndex();
  }

  nextRotationIndex() {
    return this.positionIndex === this.positions.length - 1
      ? 0
      : this.positionIndex + 1;
  }

  nextRotationCells() {
    return this.positions[this.nextRotationIndex()];
  }

  rotateToRandomPosition() {
    this.positionIndex = Math.floor(Math.random() * this.positions.length);
  }
}

const Pieces = {
  SQUARE: new Piece(
    [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
      ],
    ],
    "#FDDC5C"
  ),
  LINE: new Piece(
    [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ],
    ],
    "lightblue"
  ),
  L: new Piece(
    [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [0, 2],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [0, 1],
        [0, 2],
      ],
    ],
    "blue"
  ),
  REVERSE_L: new Piece(
    [
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 0],
      ],
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    ],
    "orange"
  ),
  ZOID: new Piece(
    [
      [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [1, 0],
        [2, 1],
      ],
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 0],
      ],
    ],
    "purple"
  ),
  Z: new Piece(
    [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [1, 0],
        [2, 0],
      ],
    ],
    "red"
  ),
  REVERSE_Z: new Piece(
    [
      [
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
    ],
    "green"
  ),
};

/**
 * Util functions
 */
function makeEmptyBoard(
  rows,
  cols,
  defaultValue = {
    color: Colors.EMPTY,
    value: Values.EMPTY,
  }
) {
  return [...Array(rows)].map((_) => Array(cols).fill(defaultValue));
}

function makeActiveCell(color) {
  return {
    color,
    value: Values.ACTIVE,
  };
}

function getRandomPiece() {
  const piecesKeys = Object.keys(Pieces);
  return piecesKeys[Math.floor(Math.random() * piecesKeys.length)];
}

/**
 * Game
 */
class Tetris {
  constructor() {
    this.bindEventListeners();

    this.board = makeEmptyBoard(ROWS, COLS);
    this.currentPiecePositions = [];
    this.currentPiecePendingFinalPositions = [];
    this.points = 0;
    this.gameIsOver = false;
    this.nextPiece = Pieces[getRandomPiece()];
    this.nextPiece.rotateToRandomPosition();
    this.newPiece();
    this.initializeDom();
    this.start();
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(this.tick.bind(this), 500);
  }

  stop() {
    clearTimeout(this.interval);
    this.interval = null;
  }

  handleKeypress(e) {
    if (DEBUG) console.log("[keypress]", e.key);
    if (this.gameIsOver) return;

    if (e.key === "ArrowRight" || e.key === "d") {
      this.moveCurrentPieceRight();
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      this.moveCurrentPieceLeft();
    } else if (e.key === "ArrowDown" || e.key === "s") {
      this.immediatelyPlaceCurrentPiece();
    } else if (e.key === "g") {
      this.rotateCurrentPiece();
    } else if (e.key === "Control") {
      this.togglePlayPause();
    }
  }

  togglePlayPause() {
    this.interval ? this.stop() : this.start();
  }

  getCurrentPieceFinalOriginOffset() {
    let offset = 0;

    while (!this.checkCollision(/* colOffset= */ 0, /* rowOffset= */ offset)) {
      offset++;
    }

    // Collision was detected so we have to backtrack.
    return offset - 1;
  }

  immediatelyPlaceCurrentPiece() {
    if (!this.currentPiece) return;
    this.stop();
    this.currentPieceOrigin[0] += this.getCurrentPieceFinalOriginOffset();
    this.draw();
    this.start();
  }

  moveCurrentPieceLeft() {
    if (!this.checkCollision(/* colOffset= */ -1)) {
      this.currentPieceOrigin[1]--;
      this.draw();
    }
  }

  moveCurrentPieceRight() {
    if (!this.checkCollision(/* colOffset= */ 1)) {
      this.currentPieceOrigin[1]++;
      this.draw();
    }
  }
  rotateCurrentPiece() {
    if (
      !this.checkCollision(
        /* colOffset= */ 0,
        /* rowOffset= */ 0,
        /* cells= */ this.currentPiece.nextRotationCells()
      )
    ) {
    } else if (
      !this.checkCollision(
        /* colOffset= */ -1,
        /* rowOffset= */ 0,
        /* cells= */ this.currentPiece.nextRotationCells()
      )
    ) {
      this.currentPieceOrigin[1]--;
    } else if (
      !this.checkCollision(
        /* colOffset= */ -2,
        /* rowOffset= */ 0,
        /* cells= */ this.currentPiece.nextRotationCells()
      )
    ) {
      this.currentPieceOrigin[1] = this.currentPieceOrigin[1] - 2;
    } else if (
      !this.checkCollision(
        /* colOffset= */ -3,
        /* rowOffset= */ 0,
        /* cells= */ this.currentPiece.nextRotationCells()
      )
    ) {
      this.currentPieceOrigin[1] = this.currentPieceOrigin[1] - 3;
    } else {
      // Can't rotate?
      return;
    }
    this.currentPiece.rotateRight();
    this.draw();
  }

  bindEventListeners() {
    window.addEventListener("keydown", this.handleKeypress.bind(this));
  }

  initializeDom() {
    gameEl.innerHTML = this.board
      .map((row, rowIndex) => {
        return `<div class="row">${row
          .map((col, colIndex) => {
            let color = col.color;
            if (
              this.currentPiece.getCells().some((cell) => {
                const [row, col] = this.currentPieceOrigin;
                return rowIndex === row + cell[0] && colIndex === col + cell[1];
              })
            ) {
              this.currentPiecePositions.push([rowIndex, colIndex]);
              color = this.currentPiece.color;
            }

            return `<div class="col" style="background-color: ${color};"></div>`;
          })
          .join("")}</div>`;
      })
      .join("");
  }

  draw() {
    while (this.currentPiecePositions.length > 0) {
      const [row, col] = this.currentPiecePositions.pop();
      this.updateCell({ row, col, color: Colors.EMPTY });
    }

    while (this.currentPiecePendingFinalPositions.length > 0) {
      const [row, col] = this.currentPiecePendingFinalPositions.pop();
      if (this.board[row][col].value !== Values.EMPTY) continue;
      this.updateCell({ row, col, color: Colors.EMPTY });
    }

    const finalRowOffset = this.getCurrentPieceFinalOriginOffset();
    this.currentPiece.getCells().forEach(([cellRow, cellCol]) => {
      const [row, col] = this.currentPieceOrigin;
      const newRow = row + cellRow + finalRowOffset;
      const newCol = col + cellCol;
      this.currentPiecePendingFinalPositions.push([newRow, newCol]);
      this.updateCell({
        row: newRow,
        col: newCol,
        color: "white",
      });
    });

    this.currentPiece.getCells().forEach((cell) => {
      const [row, col] = this.currentPieceOrigin;
      const newRow = row + cell[0];
      const newCol = col + cell[1];
      this.currentPiecePositions.push([newRow, newCol]);

      this.updateCell({
        row: newRow,
        col: newCol,
        color: this.currentPiece.color,
      });
    });
  }

  updateCell({ row, col, color }) {
    if (DEBUG) console.log("[cell update]", row, col);
    const el = gameEl.children[row].children[col];
    el.style.backgroundColor = color;
  }

  tick() {
    this.currentPieceOrigin[0]++;

    if (this.checkCollision()) {
      this.currentPieceOrigin[0]--;
      this.stop();
      this.burnPiece();

      if (this.checkLoseCondition()) {
        this.endGame();
        return;
      }

      this.currentPiecePositions = [];
      this.resolveRows();
      this.newPiece();
      this.start();
    }

    this.draw();
  }

  endGame() {
    if (DEBUG) console.log("GAME OVER");
    this.gameIsOver = true;
    this.stop();
  }

  checkLoseCondition() {
    // If any square is filled in top row, game is over. In future "hide" this row.
    return this.board[0].some((cell) => cell.value !== Values.EMPTY);
  }

  resolveRows() {
    this.board.forEach((rowEl, rowIndex) => {
      if (rowEl.every((cell) => cell.value === Values.ACTIVE)) {
        this.points++;

        for (let row = rowIndex - 1; row >= 0; row--) {
          for (let col = 0; col < COLS; col++) {
            this.board[row + 1][col] = { ...this.board[row][col] };
          }
        }

        this.initializeDom();
      }
    });
  }

  burnPiece() {
    this.currentPiece.getCells().forEach((cell) => {
      const [cellRow, cellCol] = cell;
      const [pieceOriginRow, pieceOriginCol] = this.currentPieceOrigin;

      this.board[pieceOriginRow + cellRow][pieceOriginCol + cellCol] =
        makeActiveCell(this.currentPiece.color);

      this.updateCell({
        row: pieceOriginRow + cellRow,
        col: pieceOriginCol + cellCol,
        color: this.currentPiece.color,
      });
    });
  }

  newPiece() {
    this.currentPiece = this.nextPiece;

    // Randomly assign starting position.
    this.currentPieceOrigin = [
      0,
      Math.min(Math.max(1, Math.floor(Math.random() * COLS)), COLS - 4),
    ];
    // TODO: Randomly assign rotation.
    this.nextPiece = Pieces[getRandomPiece()];
    this.nextPiece.rotateToRandomPosition();
    this.drawNextPiece();
  }

  drawNextPiece() {
    Array.from(previewEl.children).forEach((rowEl) => {
      Array.from(rowEl.children).forEach((colEl) => {
        colEl.style.backgroundColor = "transparent";
      });
    });

    this.nextPiece.getCells().forEach(([row, col]) => {
      previewEl.children[row].children[col].style.backgroundColor =
        this.nextPiece.color;
    });
  }

  checkCollision(
    colOffset = 0,
    rowOffset = 0,
    cells = this.currentPiece.getCells()
  ) {
    return cells.some((cell) => {
      const [row, col] = this.currentPieceOrigin;

      return (
        typeof this.board[rowOffset + row + cell[0]] === "undefined" ||
        typeof this.board[rowOffset + row + cell[0]][
          colOffset + col + cell[1]
        ] === "undefined" ||
        this.board[rowOffset + row + cell[0]][colOffset + col + cell[1]]
          .value != Values.EMPTY
      );
    });
  }
}

const game = new Tetris();
