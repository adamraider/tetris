const gameEl = document.getElementById("root");

const ROWS = 32;
const COLS = 16;

const Colors = {
  ACTIVE: "#FA4224",
  EMPTY: "white",
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
    if (this.positionIndex === this.positions.length - 1) {
      this.positionIndex = 0;
    } else {
      this.positionIndex++;
    }
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
};

function makeEmptyBoard(
  rows,
  cols,
  defaultValue = {
    color: Colors.EMPTY,
    value: 0,
  }
) {
  return [...Array(rows)].map((_) => Array(cols).fill(defaultValue));
}

class Tetris {
  constructor() {
    this.bindEventListeners();

    this.board = makeEmptyBoard(ROWS, COLS);
    this.currentPiece = Pieces.LINE;
    this.currentPiecePosition = [0, 8];

    this.board[10][8] = { value: 1, color: Colors.ACTIVE };
    this.draw();
    this.interval = setInterval(this.tick.bind(this), 100);
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
      } else if (e.key === "r") {
        this.currentPiece.rotateRight();
      }
    });
  }

  draw() {
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
              color = this.currentPiece.color;
            }

            return `<div class="col" style="background-color: ${color};"></div>`;
          })
          .join("")}</div>`;
      })
      .join("");
  }

  tick() {
    this.currentPiecePosition[0]++;

    if (this.checkCollision()) {
      this.currentPiecePosition[0]--;
      this.currentPiece.getCells().forEach((cell) => {
        this.board[this.currentPiecePosition[0] + cell[0]][
          this.currentPiecePosition[1] + cell[1]
        ] = {
          color: this.currentPiece.color,
          value: 1,
        };
      });
      this.newPiece();
      return;
    }

    this.draw();
  }

  newPiece() {
    this.currentPiecePosition = [0, Math.floor(Math.random() * COLS)];
    this.currentPiece = Pieces[getRandomPiece()];
  }

  checkCollision(offset = 0) {
    return this.currentPiece.getCells().some((cell) => {
      const [x, y] = this.currentPiecePosition;
      return (
        typeof this.board[x + cell[0]] === "undefined" ||
        typeof this.board[x + cell[0]][offset + y + cell[1]] === "undefined" ||
        this.board[x + cell[0]][offset + y + cell[1]].value != 0
      );
    });
  }

  stop() {
    clearTimeout(this.interval);
  }
}

function getRandomPiece() {
  const piecesKeys = Object.keys(Pieces);
  return piecesKeys[Math.floor(Math.random() * piecesKeys.length)];
}

new Tetris();
