import { tiny } from "./common.js";
import { Shapes } from "./shapes.js";

const { hex_color, Mat4 } = tiny;

export class tetris {
  constructor(shapes, materials) {
    this.shapes = shapes;
    this.materials = materials;
    this.initializeGameGrid();
    this.initializeGameSettings();
    this.initializePieceQueue();
    this.initializePieceConfigurations();
    this.initializeKickData();
  }

  initializeGameGrid() {
    this.gameGrid = Array.from({ length: 14 }, () => Array(24).fill(-1));
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 24; col++) {
        if (row < 2 || row > 11 || col < 2) {
          this.gameGrid[row][col] = -1;
        }
      }
    }
  }

  initializeGameSettings() {
    this.currentScore = 0;
    this.currentLevel = 0;
    this.totalLinesCleared = 0;
    this.currentXPosition = 6;
    this.currentYPosition = 19;
    this.currentPieceType = Math.floor(Math.random() * 7);
    this.currentRotationState = 0;
    this.isGameOver = false;
    this.lineAnimationStates = Array(24).fill(false);
    this.isLineClearingAnimationActive = false;
    this.clearedLines = [];
  }

  initializePieceQueue() {
    this.pieceQueue = [];
    let pieceBag = Array.from({ length: 7 }, (_, index) => index).filter(
      (index) => index !== this.currentPieceType
    );
    while (pieceBag.length) {
      let randomIndex = Math.floor(Math.random() * pieceBag.length);
      this.pieceQueue.push(pieceBag.splice(randomIndex, 1)[0]);
    }
  }

  initializePieceConfigurations() {
    this.pieceConfigurations = Shapes.getAllPieceConfigurations();
    this.pieceColors = [
      "0dff72",
      "ff0d72",
      "ff0d0d",
      "0dc2ff",
      "3877ff",
      "3877ff",
      "f538ff",
      "ff8e0d",
    ];
  }

  initializeKickData() {
    this.iPieceKickData = [
      [
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
      ],
      [
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ],
      [
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ],
      [
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
      ],
      [
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ],
      [
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
      ],
      [
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
      ],
      [
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ],
    ];
    this.pieceKickData = [
      [
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
      [
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ],
      [
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ],
      [
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
      [
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ],
      [
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ],
      [
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ],
    ];
  }

  checkCollision(x, y, rotationState) {
    return this.pieceConfigurations[this.currentPieceType][rotationState].every(
      ([dx, dy]) => {
        const newX = x + dx,
          newY = y + dy;
        return (
          newX >= 2 &&
          newX < 12 &&
          newY >= 0 &&
          newY < 22 &&
          this.gameGrid[newX][newY] === -1
        );
      }
    );
  }

  clearLines() {
    let linesClearedCount = 0;
    for (let y = 0; y < 24; y++) {
      if (this.gameGrid.slice(2, 12).every((row) => row[y] !== -1)) {
        this.gameGrid.slice(2, 12).forEach((row) => (row[y] = -1));
        for (let j = y; j < 23; j++) {
          this.gameGrid.slice(2, 12).forEach((row) => (row[j] = row[j + 1]));
        }
        this.gameGrid.slice(2, 12).forEach((row) => (row[23] = -1));
        linesClearedCount++;
        y--;
      }
    }
    if (linesClearedCount > 0) {
      this.updateScore(linesClearedCount);
    }
    this.clearedLines = [];
  }

  updateScore(linesClearedCount) {
    const scoreValues = [0, 40, 100, 300, 1200];
    this.currentScore += scoreValues[linesClearedCount] * (this.currentLevel + 1);
    this.totalLinesCleared += linesClearedCount;
    if (this.totalLinesCleared >= (this.currentLevel + 1) * 10) {
      this.currentLevel++;
    }
  }

  detectFullLines() {
    this.clearedLines = [];
    let hasFullLine = false;
    for (let y = 0; y < 24; y++) {
      const isLineFull = this.gameGrid.slice(2, 12).every((row) => row[y] !== -1);
      this.lineAnimationStates[y] = isLineFull;
      if (isLineFull) {
        hasFullLine = true;
        this.clearedLines.push(y);
      }
    }
    return hasFullLine;
  }

  getNextPiece() {
    if (this.pieceQueue.length < 6) {
      const newBag = Array.from({ length: 7 }, (_, index) => index);
      while (newBag.length) {
        let randomIndex = Math.floor(Math.random() * newBag.length);
        this.pieceQueue.push(newBag.splice(randomIndex, 1)[0]);
      }
    }
    return this.pieceQueue.shift();
  }

  placeCurrentPiece() {
    this.pieceConfigurations[this.currentPieceType][this.currentRotationState].forEach(
      ([dx, dy]) => {
        this.gameGrid[this.currentXPosition + dx][this.currentYPosition + dy] =
          this.currentPieceType;
      }
    );
    this.currentXPosition = 6;
    this.currentYPosition = 19;
    this.currentPieceType = this.getNextPiece();
    this.currentRotationState = 0;
  }

  checkGameOver() {
    if (!this.checkCollision(this.currentXPosition, this.currentYPosition, this.currentRotationState)) {
      this.isGameOver = true;
    }
  }

  gameTick() {
    if (!this.isGameOver) {
      if (this.isLineClearingAnimationActive) {
        return true;
      }
      if (this.checkCollision(this.currentXPosition, this.currentYPosition - 1, this.currentRotationState)) {
        this.currentYPosition--;
        return false;
      } else {
        this.placeCurrentPiece();
        if (this.detectFullLines()) {
          this.isLineClearingAnimationActive = true;
          return true;
        }
        this.clearLines();
        this.checkGameOver();
        return true;
      }
    }
  }

  movePieceLeft() {
    if (!this.isGameOver && this.checkCollision(this.currentXPosition - 1, this.currentYPosition, this.currentRotationState)) {
      this.currentXPosition--;
    }
  }

  movePieceRight() {
    if (!this.isGameOver && this.checkCollision(this.currentXPosition + 1, this.currentYPosition, this.currentRotationState)) {
      this.currentXPosition++;
    }
  }

  movePieceDown() {
    if (!this.isGameOver && this.checkCollision(this.currentXPosition, this.currentYPosition - 1, this.currentRotationState)) {
      this.currentYPosition--;
    }
  }

  rotatePiece() {
    if (!this.isGameOver) {
      const newRotationState = (this.currentRotationState + 1) % 4;
      if (this.checkCollision(this.currentXPosition, this.currentYPosition, newRotationState)) {
        this.currentRotationState = newRotationState;
      } else {
        const kickOffsets =
          this.currentPieceType === 0
            ? this.iPieceKickData[this.currentRotationState * 2]
            : this.pieceKickData[this.currentRotationState * 2];
        for (let i = 0; i < kickOffsets.length; i++) {
          const [dx, dy] = kickOffsets[i];
          if (this.checkCollision(this.currentXPosition + dx, this.currentYPosition + dy, newRotationState)) {
            this.currentXPosition += dx;
            this.currentYPosition += dy;
            this.currentRotationState = newRotationState;
            return;
          }
        }
      }
    }
  }

  isPieceAtBottom() {
    return !this.checkCollision(this.currentXPosition, this.currentYPosition - 1, this.currentRotationState);
  }

  drawBlock(context, programState, x, y, color, scale = 1) {
    const scaleMatrix = Mat4.scale(scale, scale, scale);
    const transform = Mat4.scale(-1, 1, 1).times(Mat4.translation(x, y, 0).times(scaleMatrix));
    this.shapes.cube.draw(
      context,
      programState,
      transform,
      this.materials.plastic.override({ color: hex_color(color) })
    );
  }

  drawGameBoard(context, programState, gameGrid) {
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 22; col++) {
        if (gameGrid[row][col] !== -1) {
          this.drawBlock(
            context,
            programState,
            -row * 2,
            col * 2,
            this.pieceColors[gameGrid[row][col]]
          );
        }
      }
    }
  }

  drawPiece(context, programState, tetris, pieceOptions) {
    if (!tetris) return;

    const [x, y, pieceOffsets, color] =
      pieceOptions === -1
        ? [
            tetris.currentXPosition,
            tetris.currentYPosition,
            tetris.pieceConfigurations[tetris.currentPieceType][tetris.currentRotationState],
            tetris.pieceColors[tetris.currentPieceType],
          ]
        : [
            15,
            17.5 - 4 * pieceOptions[0],
            tetris.pieceConfigurations[pieceOptions[1]] ? tetris.pieceConfigurations[pieceOptions[1]][0] : [],
            tetris.pieceColors[pieceOptions[1]],
          ];

    for (let i = 0; i < 4; i++) {
      if (!pieceOffsets[i]) continue; // Check if pieceOffsets[i] is defined
      const [newX, newY] = [x + pieceOffsets[i][0], y + pieceOffsets[i][1]];
      const modelTransform = Mat4.scale(-1, 1, 1).times(Mat4.translation(-newX * 2, newY * 2, 0));
      this.shapes.cube.draw(
        context,
        programState,
        modelTransform,
        this.materials.plastic.override({ color: hex_color(color) })
      );
    }
  }

  drawPieceQueue(context, programState) {
    if (!this) return;
    for (let i = 0; i < 1; i++) {
      if (this.pieceQueue[i] !== undefined) {
        this.drawPiece(context, programState, this, [i, this.pieceQueue[i]]);
      }
    }
  }
}