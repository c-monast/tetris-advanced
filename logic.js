import { tiny } from "./common.js";
const { Mat4, vec3, vec4 } = tiny;


export function start_game_loop() {
    this.current_piece = this.generate_new_piece();
    this.piece_position = {
      x: 5,
      y: 24 - this.get_piece_height(this.current_piece),
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
  
  export function get_piece_height(piece) {
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < piece.arrays.position.length; i++) {
      const y = piece.arrays.position[i][1];
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return maxY - minY + 1;
  }
  
  export function drop_piece(dt) {
    this.next_drop_time -= dt;
    if (this.next_drop_time <= 0) {
      this.piece_position.y -= 1;
      console.log("Piece position after dropping:", this.piece_position);
      if (this.detect_collision()) {
        console.log("Collision detected at:", this.piece_position);
        this.piece_position.y += 1;
        this.merge_piece_to_grid();
        this.clear_full_rows();
        if (this.piece_position.y >= 20) {
          this.game_over = true;
        } else {
          this.current_piece = this.generate_new_piece();
          this.piece_position = {
            x: 5,
            y: 20 - this.get_piece_height(this.current_piece),
          };
          this.piece_rotation = Mat4.identity();
          console.log(
            "New piece spawned:",
            this.current_piece.constructor.name,
            "at position",
            this.piece_position
          );
        }
      }
      this.next_drop_time = 1;
    }
  }
  
  export function detect_collision(rotated_piece = false) {
    for (let i = 0; i < this.current_piece.arrays.position.length; i++) {
      let cube_position = vec3(
        this.current_piece.arrays.position[i][0],
        this.current_piece.arrays.position[i][1],
        this.current_piece.arrays.position[i][2]
      );
  
      if (rotated_piece) {
        cube_position = this.piece_rotation.times(vec4(cube_position, 1)).to3();
      }
  
      let x = this.piece_position.x + cube_position[0] / 2;
      let y = this.piece_position.y - cube_position[1] / 2;
  
      if (
        x < 0 ||
        x >= 10 ||
        y < 0 ||
        (y < 20 && this.grid[Math.floor(y)][Math.floor(x)])
      ) {
        return true;
      }
    }
    return false;
  }
  
  export function merge_piece_to_grid() {
    console.log("Merging piece to grid at position:", this.piece_position);
    for (let i = 0; i < this.current_piece.arrays.position.length; i++) {
      let cube_position = vec3(
        this.current_piece.arrays.position[i][0],
        this.current_piece.arrays.position[i][1],
        this.current_piece.arrays.position[i][2]
      );
  
      cube_position = this.piece_rotation.times(vec4(cube_position, 1)).to3();
  
      let x = this.piece_position.x + cube_position[0] / 2;
      let y = this.piece_position.y - cube_position[1] / 2;
  
      if (y >= 0 && y < 20 && x >= 0 && x < 10) {
        this.grid[Math.floor(y)][Math.floor(x)] =
          this.materials[this.current_piece.constructor.name.toLowerCase()];
      }
    }
    console.log("Grid after merging:", this.grid);
  }
  
  export function clear_full_rows() {
    let cleared_rows = 0;
    this.grid = this.grid.filter((row) => {
      if (row.every((cell) => cell)) {
        cleared_rows++;
        return false;
      }
      return true;
    });
    while (this.grid.length < 20) {
      this.grid.unshift(Array(10).fill(null));
    }
    if (cleared_rows > 0) {
      console.log("Cleared rows:", cleared_rows);
    }
  }