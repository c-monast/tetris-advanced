export class Shapes {
  static rotateOffsets(offsets, angle) {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return offsets.map(([x, y]) => {
      const newX = Math.round(x * cos - y * sin);
      const newY = Math.round(x * sin + y * cos);
      return [newX, newY];
    });
  }

  static generatePieceConfig(initialOffsets, color) {
    const rotations = [];
    for (let angle = 0; angle < 360; angle += 90) {
      rotations.push(this.rotateOffsets(initialOffsets, angle));
    }
    return { rotations, color };
  }

  static generateKickData(pieceType) {
    const standardKicks = [
      [0, 0],
      [1, 0],
      [0, -1],
      [1, -1],
    ];
    const iPieceKicks = [
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ];

    const kickData = [];
    for (let i = 0; i < 4; i++) {
      if (pieceType === "I") {
        kickData.push(
          iPieceKicks.map(([dx, dy]) => [
            dx * (i % 2 === 0 ? -1 : 1),
            dy * (Math.floor(i / 2) % 2 === 0 ? -1 : 1),
          ])
        );
      } else {
        kickData.push(
          standardKicks.map(([dx, dy]) => [
            dx * (i % 2 === 0 ? -1 : 1),
            dy * (Math.floor(i / 2) % 2 === 0 ? -1 : 1),
          ])
        );
      }
    }
    return kickData;
  }

  static getOPiece() {
    return {
      ...this.generatePieceConfig(
        [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ],
        "#FFC300" // Desert Yellow
      ),
      kickData: this.generateKickData("O"),
    };
  }

  static getIPiece() {
    return {
      ...this.generatePieceConfig(
        [
          [0, -1],
          [0, 0],
          [0, 1],
          [0, 2],
        ],
        "#FF5733" // Burnt Orange
      ),
      kickData: this.generateKickData("I"),
    };
  }

  static getSPiece() {
    return {
      ...this.generatePieceConfig(
        [
          [0, 0],
          [0, 1],
          [-1, 1],
          [1, 0],
        ],
        "#8E44AD" // Dark Purple
      ),
      kickData: this.generateKickData("S"),
    };
  }

  static getZPiece() {
    return {
      ...this.generatePieceConfig(
        [
          [0, 0],
          [0, 1],
          [1, 1],
          [-1, 0],
        ],
        "#1ABC9C" // Bright Cyan
      ),
      kickData: this.generateKickData("Z"),
    };
  }

  static getLPiece() {
    return {
      ...this.generatePieceConfig(
        [
          [0, 0],
          [-1, 0],
          [1, 0],
          [1, 1],
        ],
        "#3498DB" // Space Blue
      ),
      kickData: this.generateKickData("L"),
    };
  }

  static getJPiece() {
    return {
      ...this.generatePieceConfig(
        [
          [0, 0],
          [-1, 0],
          [1, 0],
          [-1, 1],
        ],
        "#2ECC71" // Alien Green
      ),
      kickData: this.generateKickData("J"),
    };
  }

  static getTPiece() {
    return {
      ...this.generatePieceConfig(
        [
          [0, 0],
          [-1, 0],
          [1, 0],
          [0, 1],
        ],
        "#C70039" // Mars Red
      ),
      kickData: this.generateKickData("T"),
    };
  }

  static getAllPieceConfigurations() {
    return [
      this.getOPiece(),
      this.getIPiece(),
      this.getSPiece(),
      this.getZPiece(),
      this.getLPiece(),
      this.getJPiece(),
      this.getTPiece(),
    ];
  }
}
