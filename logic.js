import { tiny } from "./common.js";
const { Mat4, vec3, vec4 } = tiny;

export function start_game_loop() {
  this.current_piece = this.generate_new_piece();
  this.piece_position = {
    x: 5, // Centered within the play area
    y: 25 - this.get_piece_height(this.current_piece),
  };
  this.piece_rotation = Mat4.identity();
  this.next_drop_time = 0;
  this.game_over = false;
  console.log(
    "New piece spawned:",
    this.current_piece.constructor.name,
    "at position",
    this.piece_position
  );
}

export function generate_new_piece() {
  const pieces = [
    "oshape",
    "lshape",
    "ishape",
    "sshape",
    "zshape",
    "jshape",
    "tshape",
  ];
  const random_piece = pieces[Math.floor(Math.random() * pieces.length)];
  return this.shapes[random_piece];
}

export function move_piece(direction) {
  const newPosition = { ...this.piece_position, x: this.piece_position.x + direction };
  if (!this.check_collision_with_frame(newPosition)) {
    this.piece_position = newPosition;
  } else {
    console.log("Collision detected. Move blocked.");
  }
}

export function get_piece_height(piece) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < piece.arrays.position.length; i++) {
    const y = piece.arrays.position[i][1];
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const height = (maxY - minY) / 2;
  console.log(
    `Piece: ${piece.constructor.name}, MinY: ${minY}, MaxY: ${maxY}, Calculated Height: ${height}`
  );
  return height;
}

export function rotate_piece() {
  const rotationMatrix = Mat4.rotation(Math.PI / 2, 0, 0, 1);

  // Try rotating in place
  if (this.try_rotation(rotationMatrix, this.piece_position)) {
    return;
  }

  // Try wall kicks
  const wallKickOffsets = [-2, 2, -4, 4]; // Example wall kick offsets, adjust as needed
  for (let offset of wallKickOffsets) {
    const newPosition = { ...this.piece_position, x: this.piece_position.x + offset };
    if (this.try_rotation(rotationMatrix, newPosition)) {
      this.piece_position = newPosition;
      return;
    }
  }

  console.log("Rotation failed due to collision.");
}

export function try_rotation(rotationMatrix, position) {
  // Apply the rotation to the vertices
  const newPiece = { ...this.current_piece };
  newPiece.arrays = { ...this.current_piece.arrays, position: [...this.current_piece.arrays.position] };
  for (let i = 0; i < newPiece.arrays.position.length; i++) {
    const vertex = vec4(...newPiece.arrays.position[i], 1);
    const rotated_vertex = rotationMatrix.times(vertex);
    newPiece.arrays.position[i] = rotated_vertex.to3();
  }

  // Check for collision
  if (!this.check_collision_with_frame(position, newPiece)) {
    // Update the piece's position and rotation if no collision
    this.current_piece.arrays.position = newPiece.arrays.position;
    this.piece_rotation = rotationMatrix.times(this.piece_rotation);
    this.current_piece.dimensions = this.get_piece_dimensions(this.current_piece);
    console.log(
      "Piece rotated:",
      this.current_piece.constructor.name,
      "to position",
      this.piece_position,
      `Dimensions: Width: ${this.current_piece.dimensions.width}, Height: ${this.current_piece.dimensions.height}`
    );
    return true;
  }

  return false;
}

export function get_piece_dimensions(piece) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < piece.arrays.position.length; i++) {
    const x = piece.arrays.position[i][0];
    const y = piece.arrays.position[i][1];

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const width = (maxX - minX) / 2;
  const height = (maxY - minY) / 2;

  console.log(`Width: ${width}, Height: ${height}`);

  return { width, height };
}

export function drop_piece(dt) {
  this.next_drop_time -= dt;
  if (this.next_drop_time <= 0) {
    const newPosition = { ...this.piece_position, y: this.piece_position.y - 1 };
    if (!this.check_collision_with_frame(newPosition)) {
      this.piece_position.y -= 1;
    } else {
      this.add_piece_to_grid();
      this.clear_full_rows();
      this.current_piece = this.generate_new_piece();
      this.piece_position = {
        x: 5,
        y: 25 - this.get_piece_height(this.current_piece),
      };
      this.piece_rotation = Mat4.identity();
      if (this.check_collision_with_frame(this.piece_position)) {
        this.game_over = true;
        console.log("Game Over");
      }
    }
    console.log("Piece position after dropping:", this.piece_position);
    this.next_drop_time = 1;
  }
}

export function add_piece_to_grid() {
  const piece = this.current_piece;
  const position = this.piece_position;
  const material = this.materials[piece.constructor.name.toLowerCase()];

  for (let i = 0; i < piece.arrays.position.length; i++) {
    const cube = piece.arrays.position[i];
    const gridX = Math.floor(position.x + cube[0] / 2);
    const gridY = Math.floor(position.y + cube[1] / 2);

    if (gridY >= 0 && gridY < this.grid.length && gridX >= 0 && gridX < this.grid[0].length) {
      this.grid[gridY][gridX] = material;
    }
  }
}

export function clear_full_rows() {
  for (let y = this.grid.length - 1; y >= 0; y--) {
    if (this.grid[y].every(cell => cell !== null)) {
      this.grid.splice(y, 1);
      this.grid.unshift(Array(10).fill(null));
      y++;
    }
  }
}

export function check_collision_with_frame(newPosition, piece = this.current_piece) {
  const playAreaMinX = -1; // Minimum X boundary of the frame
  const playAreaMaxX = 11; // Maximum X boundary of the frame

  // Check each cube in the piece for collision with frame boundaries and the grid
  for (let i = 0; i < piece.arrays.position.length; i++) {
    const cubeX = piece.arrays.position[i][0] / 2; // Since each cube is 2 units
    const cubeY = piece.arrays.position[i][1] / 2; // Since each cube is 2 units
    const newX = newPosition.x + cubeX;
    const newY = newPosition.y + cubeY;

    if (newX < playAreaMinX || newX > playAreaMaxX || newY < 0 || (newY < this.grid.length && newY >= 0 && this.grid[newY]?.[newX])) {
      return true;
    }
  }

  return false;
}