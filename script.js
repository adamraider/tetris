const gameEl = document.getElementById("root");

const ROWS = 32;
const COLS = 16;

const Colors = {
  ACTIVE: "#FA4224",
  EMPTY: "white",
};

const Values = {
  ACTIVE: 1,
  EMPTY: 0,
};

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
    "#475F94"
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
    "#475F94"
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
    "#475F94"
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
    "#475F94"
  ),
};

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

class Tetris {
  constructor() {
    this.bindEventListeners();

    this.board = makeEmptyBoard(ROWS, COLS);
    this.newPiece();

    // this.board[10][8] = { value: Values.ACTIVE, color: Colors.ACTIVE };
    this.board[ROWS - 1].fill({ value: Values.ACTIVE, color: Colors.ACTIVE });
    this.board[ROWS - 2].fill({ value: Values.ACTIVE, color: Colors.ACTIVE });
    this.board[ROWS - 3].fill({ value: Values.ACTIVE, color: Colors.ACTIVE });
    this.board[ROWS - 1][0] = {
      color: Colors.EMPTY,
      value: Values.EMPTY,
    };
    this.board[ROWS - 2][0] = {
      color: Colors.EMPTY,
      value: Values.EMPTY,
    };
    this.board[ROWS - 3][0] = {
      color: Colors.EMPTY,
      value: Values.EMPTY,
    };
    this.previousPos = [];
    this.initializeDom();
    this.interval = setInterval(this.tick.bind(this), 50);
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(this.tick.bind(this), 50);
  }

  stop() {
    clearTimeout(this.interval);
    this.interval = null;
  }

  bindEventListeners() {
    window.addEventListener("keydown", (e) => {
      console.log(e);
      if (e.key === "ArrowRight") {
        if (!this.checkCollision(1)) {
          this.currentPiecePosition[1]++;
          this.draw();
        }
      } else if (e.key === "ArrowLeft") {
        if (!this.checkCollision(-1)) {
          this.currentPiecePosition[1]--;
          this.draw();
        }
      } else if (e.key === "g") {
        if (!this.checkCollision(0, this.currentPiece.nextRotationCells())) {
        } else if (
          !this.checkCollision(-1, this.currentPiece.nextRotationCells())
        ) {
          this.currentPiecePosition[1]--;
        } else if (
          !this.checkCollision(-2, this.currentPiece.nextRotationCells())
        ) {
          this.currentPiecePosition[1] = this.currentPiecePosition[1] - 2;
        } else if (
          !this.checkCollision(-3, this.currentPiece.nextRotationCells())
        ) {
          this.currentPiecePosition[1] = this.currentPiecePosition[1] - 3;
        } else {
          // can't rotate?
          return;
        }
        this.currentPiece.rotateRight();
        this.draw();
      } else if (e.key === "Control") {
        this.interval ? this.stop() : this.start();
      }
    });
  }

  initializeDom() {
    gameEl.innerHTML = this.board
      .map((row, rowIndex) => {
        return `<div class="row">${row
          .map((col, colIndex) => {
            let color = col.color;
            if (
              this.currentPiece.getCells().some((cell) => {
                const [x, y] = this.currentPiecePosition;
                return rowIndex === x + cell[0] && colIndex === y + cell[1];
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
    this.previousPos.forEach(([x, y]) => {
      const el = gameEl.children[x].children[y];
      el.style.backgroundColor = Colors.EMPTY;
    });

    this.previousPos = [];

    this.currentPiece.getCells().forEach((cell) => {
      const [x, y] = this.currentPiecePosition;
      const newX = x + cell[0];
      const newY = y + cell[1];
      const el = gameEl.children[newX].children[newY];
      this.previousPos.push([newX, newY]);
      el.style.backgroundColor = this.currentPiece.color;
    });
  }

  tick() {
    this.currentPiecePosition[0]++;

    if (this.checkCollision()) {
      this.currentPiecePosition[0]--;
      this.stop();
      this.burnPiece();
      this.previousPos = [];
      this.newPiece();
      this.resolveRows();
      this.start();
      return;
    }

    this.draw();
  }

  resolveRows() {
    this.board.forEach((row, rowIndex) => {
      if (row.every((cell) => cell.value === Values.ACTIVE)) {
        for (let i = rowIndex - 1; i >= 0; i--) {
          for (let c = 0; c < COLS; c++) {
            this.board[i + 1][c] = { ...this.board[i][c] };
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

  checkCollision(offset = 0, cells = this.currentPiece.getCells()) {
    return cells.some((cell) => {
      const [x, y] = this.currentPiecePosition;
      return (
        typeof this.board[x + cell[0]] === "undefined" ||
        typeof this.board[x + cell[0]][offset + y + cell[1]] === "undefined" ||
        this.board[x + cell[0]][offset + y + cell[1]].value != Values.EMPTY
      );
    });
  }
}

function getRandomPiece() {
  const piecesKeys = Object.keys(Pieces);
  return piecesKeys[Math.floor(Math.random() * piecesKeys.length)];
}

const game = new Tetris();
