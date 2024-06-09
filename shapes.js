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

  static generatePieceConfig(initialOffsets) {
    const rotations = [];
    for (let angle = 0; angle < 360; angle += 90) {
      rotations.push(this.rotateOffsets(initialOffsets, angle));
    }
    return rotations;
  }

  static getIPiece() {
    return this.generatePieceConfig([
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
  }

  static getOPiece() {
    return this.generatePieceConfig([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
  }

  static getTPiece() {
    return this.generatePieceConfig([
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
    ]);
  }

  static getLPiece() {
    return this.generatePieceConfig([
      [0, 0],
      [-1, 0],
      [1, 0],
      [1, 1],
    ]);
  }

  static getJPiece() {
    return this.generatePieceConfig([
      [0, 0],
      [-1, 0],
      [1, 0],
      [-1, 1],
    ]);
  }

  static getSPiece() {
    return this.generatePieceConfig([
      [0, 0],
      [0, 1],
      [-1, 1],
      [1, 0],
    ]);
  }

  static getZPiece() {
    return this.generatePieceConfig([
      [0, 0],
      [0, 1],
      [1, 1],
      [-1, 0],
    ]);
  }

  static getAllPieceConfigurations() {
    return [
      this.getIPiece(),
      this.getOPiece(),
      this.getTPiece(),
      this.getLPiece(),
      this.getJPiece(),
      this.getSPiece(),
      this.getZPiece(),
    ];
  }
}