export class tetris {
  constructor() {
    this.initializeGrid();
    this.initializeGameSettings();
    this.initializePieceQueue();
    this.initializePieceConfig();
    this.initializeKickData();
  }

  initializeGrid() {
    this.grid = Array.from({ length: 14 }, () => Array(24).fill(-1));
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 24; j++) {
        if (i < 2 || i > 11 || j < 2) {
          this.grid[i][j] = -1;
        }
      }
    }
  }

  initializeGameSettings() {
    this.score = 0;
    this.level = 0;
    this.linesCleared = 0;
    this.x = 6;
    this.y = 19;
    this.block = Math.floor(Math.random() * 7);
    this.rotation = 0;
    this.gameEnd = false;
    this.animate = Array(24).fill(false);
    this.isAnimating = false;
    this.fullLines = [];
  }

  initializePieceQueue() {
    this.queue = [];
    let bag = Array.from({ length: 7 }, (_, i) => i).filter(
      (i) => i !== this.block
    );
    while (bag.length) {
      let randomIndex = Math.floor(Math.random() * bag.length);
      this.queue.push(bag.splice(randomIndex, 1)[0]);
    }
  }

  initializePieceConfig() {
    this.config = [
      //order of pieces: IOTLJSZ

      [
        [
          [-1, 1],
          [0, 1],
          [1, 1],
          [2, 1],
        ],
        [
          [1, 2],
          [1, 1],
          [1, 0],
          [1, -1],
        ],
        [
          [-1, 0],
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        [
          [0, 2],
          [0, 1],
          [0, 0],
          [0, -1],
        ],
      ],
      [
        [
          [1, 0],
          [1, 1],
          [0, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [1, 1],
          [0, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [1, 1],
          [0, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [1, 1],
          [0, 0],
          [0, 1],
        ],
      ],
      [
        [
          [-1, 0],
          [0, 0],
          [0, 1],
          [1, 0],
        ],
        [
          [0, 0],
          [0, 1],
          [0, -1],
          [1, 0],
        ],
        [
          [-1, 0],
          [0, 0],
          [0, -1],
          [1, 0],
        ],
        [
          [-1, 0],
          [0, 1],
          [0, 0],
          [0, -1],
        ],
      ],
      [
        [
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 2],
        ],
        [
          [0, 2],
          [0, 1],
          [0, 0],
          [1, 0],
        ],
        [
          [-1, 1],
          [0, 1],
          [1, 1],
          [-1, 0],
        ],
        [
          [0, 2],
          [0, 1],
          [0, 0],
          [-1, 2],
        ],
      ],
      [
        [
          [-1, 1],
          [0, 1],
          [1, 1],
          [-1, 2],
        ],
        [
          [0, 2],
          [0, 1],
          [0, 0],
          [1, 2],
        ],
        [
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 0],
        ],
        [
          [0, 2],
          [0, 1],
          [0, 0],
          [-1, 0],
        ],
      ],
      [
        [
          [-1, 0],
          [0, 1],
          [0, 0],
          [1, 1],
        ],
        [
          [0, 1],
          [0, 0],
          [1, 0],
          [1, -1],
        ],
        [
          [-1, -1],
          [0, -1],
          [0, 0],
          [1, 0],
        ],
        [
          [-1, 1],
          [-1, 0],
          [0, 0],
          [0, -1],
        ],
      ],
      [
        [
          [-1, 1],
          [0, 1],
          [0, 0],
          [1, 0],
        ],
        [
          [1, 1],
          [1, 0],
          [0, 0],
          [0, -1],
        ],
        [
          [-1, 0],
          [0, 0],
          [0, -1],
          [1, -1],
        ],
        [
          [-1, -1],
          [-1, 0],
          [0, 0],
          [0, 1],
        ],
      ],
    ];
    this.colors = [
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
    this.iKick = [
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
    this.kick = [
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

  checkCollision(x, y, rotation) {
    return this.config[this.block][rotation].every(([dx, dy]) => {
      const newX = x + dx,
        newY = y + dy;
      return (
        newX >= 2 &&
        newX < 12 &&
        newY >= 0 &&
        newY < 22 &&
        this.grid[newX][newY] === -1
      );
    });
  }

  clearLines() {
    let linesCleared = 0;
    for (let y = 0; y < 24; y++) {
      if (this.grid.slice(2, 12).every((row) => row[y] !== -1)) {
        this.grid.slice(2, 12).forEach((row) => (row[y] = -1));
        for (let j = y; j < 23; j++) {
          this.grid.slice(2, 12).forEach((row) => (row[j] = row[j + 1]));
        }
        this.grid.slice(2, 12).forEach((row) => (row[23] = -1));
        linesCleared++;
        y--;
      }
    }
    if (linesCleared > 0) {
      this.updateScore(linesCleared);
    }
    this.fullLines = [];
  }

  updateScore(linesCleared) {
    const scores = [0, 40, 100, 300, 1200];
    this.score += scores[linesCleared] * (this.level + 1);
    this.linesCleared += linesCleared;
    if (this.linesCleared >= (this.level + 1) * 10) {
      this.level++;
    }
  }

  checkLines() {
    this.fullLines = [];
    let flag = false;
    for (let y = 0; y < 24; y++) {
      const fullLine = this.grid.slice(2, 12).every((row) => row[y] !== -1);
      this.animate[y] = fullLine;
      if (fullLine) {
        flag = true;
        this.fullLines.push(y);
      }
    }
    return flag;
  }

  getBlock() {
    if (this.queue.length < 6) {
      const bag = Array.from({ length: 7 }, (_, i) => i);
      while (bag.length) {
        let randomIndex = Math.floor(Math.random() * bag.length);
        this.queue.push(bag.splice(randomIndex, 1)[0]);
      }
    }
    return this.queue.shift();
  }

  placeBlock() {
    this.config[this.block][this.rotation].forEach(([dx, dy]) => {
      this.grid[this.x + dx][this.y + dy] = this.block;
    });
    this.x = 6;
    this.y = 19;
    this.block = this.getBlock();
    this.rotation = 0;
  }

  checkEnd() {
    if (!this.checkCollision(this.x, this.y, this.rotation)) {
      this.gameEnd = true;
    }
  }

  tick() {
    if (!this.gameEnd) {
      if (this.isAnimating) {
        return true;
      }
      if (this.checkCollision(this.x, this.y - 1, this.rotation)) {
        this.y--;
        return false;
      } else {
        this.placeBlock();
        if (this.checkLines()) {
          this.isAnimating = true;
          return true;
        }
        this.clearLines();
        this.checkEnd();
        return true;
      }
    }
  }

  moveLeft() {
    if (
      !this.gameEnd &&
      this.checkCollision(this.x - 1, this.y, this.rotation)
    ) {
      this.x--;
    }
  }

  moveRight() {
    if (
      !this.gameEnd &&
      this.checkCollision(this.x + 1, this.y, this.rotation)
    ) {
      this.x++;
    }
  }

  moveDown() {
    if (
      !this.gameEnd &&
      this.checkCollision(this.x, this.y - 1, this.rotation)
    ) {
      this.y--;
    }
  }

  rotate() {
    if (!this.gameEnd) {
      const newRotation = (this.rotation + 1) % 4;
      if (this.checkCollision(this.x, this.y, newRotation)) {
        this.rotation = newRotation;
      } else {
        const kicks =
          this.block === 0
            ? this.iKick[this.rotation * 2]
            : this.kick[this.rotation * 2];
        for (let i = 0; i < kicks.length; i++) {
          const [dx, dy] = kicks[i];
          if (this.checkCollision(this.x + dx, this.y + dy, newRotation)) {
            this.x += dx;
            this.y += dy;
            this.rotation = newRotation;
            return;
          }
        }
      }
    }
  }

  getBottom() {
    return !this.checkCollision(this.x, this.y - 1, this.rotation);
  }
}
