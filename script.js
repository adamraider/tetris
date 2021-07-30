const gameEl = document.getElementById("root");
const debugEl = document.getElementById("debug");

const DEBUG = true;

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
    this.positionIndex = this.nextPositionIndex();
  }

  nextPositionIndex() {
    if (this.positionIndex === this.positions.length - 1) {
      return 0;
    } else {
      return this.positionIndex + 1;
    }
  }

  nextRotationCells() {
    return this.positions[this.nextPositionIndex()];
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
    this.newPiece();
    this.previousPos = [];
    this.initializeDom();
    this.interval = setInterval(this.tick.bind(this), 50);
    this.points = 0;
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(this.tick.bind(this), 50);
  }

  stop() {
    clearTimeout(this.interval);
    this.interval = null;
  }

  handleKeypress(e) {
    if (DEBUG) console.log("[keypress]", e.key);
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

  immediatelyPlaceCurrentPiece() {
    if (!this.currentPiece) return;
    this.stop();
    let offset = 0;
    while (!this.checkCollision(/* colOffset= */ 0, /* rowOffset= */ offset)) {
      offset++;
    }
    this.currentPiecePosition[0] += offset - 1;
    this.draw();
    this.start();
  }

  moveCurrentPieceLeft() {
    if (!this.checkCollision(/* colOffset= */ -1)) {
      this.currentPiecePosition[1]--;
      this.draw();
    }
  }

  moveCurrentPieceRight() {
    if (!this.checkCollision(/* colOffset= */ 1)) {
      this.currentPiecePosition[1]++;
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
      this.currentPiecePosition[1]--;
    } else if (
      !this.checkCollision(
        /* colOffset= */ -2,
        /* rowOffset= */ 0,
        /* cells= */ this.currentPiece.nextRotationCells()
      )
    ) {
      this.currentPiecePosition[1] = this.currentPiecePosition[1] - 2;
    } else if (
      !this.checkCollision(
        /* colOffset= */ -3,
        /* rowOffset= */ 0,
        /* cells= */ this.currentPiece.nextRotationCells()
      )
    ) {
      this.currentPiecePosition[1] = this.currentPiecePosition[1] - 3;
    } else {
      // can't rotate?
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
                const [row, col] = this.currentPiecePosition;
                return rowIndex === row + cell[0] && colIndex === col + cell[1];
              })
            ) {
              this.previousPos.push([rowIndex, colIndex]);
              color = this.currentPiece.color;
            }

            return `<div class="col" style="background-color: ${color};"></div>`;
          })
          .join("")}</div>`;
      })
      .join("");
  }

  draw() {
    this.previousPos.forEach(([row, col]) => {
      this.updateCell({ row, col, color: Colors.EMPTY });
    });

    this.previousPos = [];

    this.currentPiece.getCells().forEach((cell) => {
      const [row, col] = this.currentPiecePosition;
      const newRow = row + cell[0];
      const newCol = col + cell[1];
      this.previousPos.push([newRow, newCol]);
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
    this.currentPiecePosition[0]++;

    if (this.checkCollision()) {
      this.currentPiecePosition[0]--;
      this.stop();
      this.burnPiece();
      if (this.checkLoseCondition()) {
        this.endGame();
        return;
      }
      this.previousPos = [];
      this.newPiece();
      this.resolveRows();
      this.start();
      return;
    }

    this.draw();
  }

  endGame() {
    if (DEBUG) console.log("GAME OVER");
    this.stop();
  }

  checkLoseCondition() {
    // If any square is filled in top row, game is over. In future "hide" this row.
    return this.board[0].some((cell) => cell.value !== Values.EMPTY);
  }

  resolveRows() {
    this.board.forEach((rowArr, rowIndex) => {
      if (rowArr.every((cell) => cell.value === Values.ACTIVE)) {
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
      this.board[this.currentPiecePosition[0] + cell[0]][
        this.currentPiecePosition[1] + cell[1]
      ] = {
        color: this.currentPiece.color,
        value: Values.ACTIVE,
      };
      const el =
        gameEl.children[this.currentPiecePosition[0] + cell[0]].children[
          this.currentPiecePosition[1] + cell[1]
        ];
      el.style.backgroundColor = this.currentPiece.color;
    });
  }

  newPiece() {
    this.currentPiecePosition = [
      0,
      Math.min(Math.max(1, Math.floor(Math.random() * COLS)), COLS - 4),
    ];
    this.currentPiece = Pieces[getRandomPiece()];
  }

  checkCollision(
    colOffset = 0,
    rowOffset = 0,
    cells = this.currentPiece.getCells()
  ) {
    return cells.some((cell) => {
      const [x, y] = this.currentPiecePosition;
      return (
        typeof this.board[rowOffset + x + cell[0]] === "undefined" ||
        typeof this.board[rowOffset + x + cell[0]][colOffset + y + cell[1]] ===
          "undefined" ||
        this.board[rowOffset + x + cell[0]][colOffset + y + cell[1]].value !=
          Values.EMPTY
      );
    });
  }
}

const game = new Tetris();
