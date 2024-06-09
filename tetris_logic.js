import { tiny } from "./common.js";
import { Shapes } from "./shapes.js";

const { hex_color, Mat4 } = tiny;

export class tetris {
  constructor(shapes, materials) {
    this.shapes = shapes;
    this.materials = materials;
    this.initializeGame();
  }

  initializeGame() {
    this.initializeGameGrid();
    this.initializeGameSettings();
    this.initializePieceQueue();
    this.initializePieceConfigurations();
  }

  initializeGameGrid() {
    this.gameGrid = Array.from({ length: 14 }, (_, row) =>
      Array.from({ length: 24 }, (_, col) =>
        row < 2 || row > 11 || col < 2 ? -1 : -1
      )
    );
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
    this.refillPieceQueue();
  }

  refillPieceQueue() {
    const pieceBag = Array.from({ length: 7 }, (_, index) => index).filter(
      (index) => index !== this.currentPieceType
    );
    while (pieceBag.length) {
      const randomIndex = Math.floor(Math.random() * pieceBag.length);
      this.pieceQueue.push(pieceBag.splice(randomIndex, 1)[0]);
    }
  }

  initializePieceConfigurations() {
    const allConfigurations = Shapes.getAllPieceConfigurations();
    this.pieceConfigurations = allConfigurations.map(
      (config) => config.rotations
    );
    this.pieceColors = allConfigurations.map((config) => config.color);
    this.pieceKickData = allConfigurations.map((config) => config.kickData);
  }

  checkCollision(x, y, rotationState) {
    return this.pieceConfigurations[this.currentPieceType][rotationState].every(
      ([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
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
    this.clearedLines = [];
    for (let y = 0; y < 24; y++) {
      if (this.gameGrid.slice(2, 12).every((row) => row[y] !== -1)) {
        this.clearedLines.push(y);
      }
    }

    if (this.clearedLines.length > 0) {
      for (const y of this.clearedLines) {
        for (let row = 2; row < 12; row++) {
          for (let col = y; col < 23; col++) {
            this.gameGrid[row][col] = this.gameGrid[row][col + 1];
          }
          this.gameGrid[row][23] = -1;
        }
      }
      this.updateScore(this.clearedLines.length);
    }
  }

  updateScore(linesClearedCount) {
    const scoreValues = [0, 40, 100, 300, 1200];
    this.currentScore +=
      scoreValues[linesClearedCount] * (this.currentLevel + 1);
    this.totalLinesCleared += linesClearedCount;
    if (this.totalLinesCleared >= (this.currentLevel + 1) * 10) {
      this.currentLevel++;
    }
  }

  detectFullLines() {
    this.clearedLines = [];
    for (let y = 0; y < 24; y++) {
      if (this.gameGrid.slice(2, 12).every((row) => row[y] !== -1)) {
        this.clearedLines.push(y);
      }
    }
    this.isLineClearingAnimationActive = this.clearedLines.length > 0;
    return this.isLineClearingAnimationActive;
  }

  getNextPiece() {
    if (this.pieceQueue.length < 7) {
      this.refillPieceQueue();
    }
    return this.pieceQueue.shift();
  }

  placeCurrentPiece() {
    this.pieceConfigurations[this.currentPieceType][
      this.currentRotationState
    ].forEach(([dx, dy]) => {
      this.gameGrid[this.currentXPosition + dx][this.currentYPosition + dy] =
        this.currentPieceType;
    });
    this.currentXPosition = 6;
    this.currentYPosition = 19;
    this.currentPieceType = this.getNextPiece();
    this.currentRotationState = 0;
  }

  checkGameOver() {
    if (
      !this.checkCollision(
        this.currentXPosition,
        this.currentYPosition,
        this.currentRotationState
      )
    ) {
      this.isGameOver = true;
    }
  }

  gameTick() {
    if (!this.isGameOver) {
      if (this.isLineClearingAnimationActive) {
        this.clearLines();
        this.isLineClearingAnimationActive = false;
        return true;
      }
      if (
        this.checkCollision(
          this.currentXPosition,
          this.currentYPosition - 1,
          this.currentRotationState
        )
      ) {
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
    if (
      !this.isGameOver &&
      this.checkCollision(
        this.currentXPosition - 1,
        this.currentYPosition,
        this.currentRotationState
      )
    ) {
      this.currentXPosition--;
    }
  }

  movePieceRight() {
    if (
      !this.isGameOver &&
      this.checkCollision(
        this.currentXPosition + 1,
        this.currentYPosition,
        this.currentRotationState
      )
    ) {
      this.currentXPosition++;
    }
  }

  movePieceDown() {
    if (
      !this.isGameOver &&
      this.checkCollision(
        this.currentXPosition,
        this.currentYPosition - 1,
        this.currentRotationState
      )
    ) {
      this.currentYPosition--;
    }
  }

  rotatePiece() {
    if (!this.isGameOver) {
      const newRotationState = (this.currentRotationState + 1) % 4;
      if (
        this.checkCollision(
          this.currentXPosition,
          this.currentYPosition,
          newRotationState
        )
      ) {
        this.currentRotationState = newRotationState;
      } else {
        const kickOffsets =
          this.pieceKickData[this.currentPieceType][this.currentRotationState];
        for (const [dx, dy] of kickOffsets) {
          if (
            this.checkCollision(
              this.currentXPosition + dx,
              this.currentYPosition + dy,
              newRotationState
            )
          ) {
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
    return !this.checkCollision(
      this.currentXPosition,
      this.currentYPosition - 1,
      this.currentRotationState
    );
  }

  drawBlock(context, programState, x, y, color, scale = 1) {
    const scaleMatrix = Mat4.scale(scale, scale, scale);
    const transform = Mat4.scale(-1, 1, 1).times(
      Mat4.translation(x, y, 0).times(scaleMatrix)
    );
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
            tetris.pieceConfigurations[tetris.currentPieceType][
              tetris.currentRotationState
            ],
            tetris.pieceColors[tetris.currentPieceType],
          ]
        : [
            15,
            17.5 - 4 * pieceOptions[0],
            tetris.pieceConfigurations[pieceOptions[1]]
              ? tetris.pieceConfigurations[pieceOptions[1]][0]
              : [],
            tetris.pieceColors[pieceOptions[1]],
          ];

    for (const [dx, dy] of pieceOffsets) {
      const newX = x + dx;
      const newY = y + dy;
      const modelTransform = Mat4.scale(-1, 1, 1).times(
        Mat4.translation(-newX * 2, newY * 2, 0)
      );
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
