import { defs, tiny } from "./common.js";
const { Mat4 } = tiny;

export function draw_score(context, program_state) {
  const score_position = { x: -15, y: 20 };
  const score = this.tetris.currentScore; // Use the score from the Tetris instance

  let model_transform = Mat4.translation(score_position.x, score_position.y, 0);

  const digits = score.toString().split("").map(Number);
  const cube_size = 0.5; // Decrease the cube size to prevent overlap
  const digit_spacing = 3; // Adjust the spacing between digits

  digits.forEach((digit, digit_index) => {
    const digit_shape = defs.digit_shapes[digit];
    for (let row = 0; row < digit_shape.length; row++) {
      for (let col = 0; col < digit_shape[row].length; col++) {
        if (digit_shape[row][col]) {
          let digit_transform = model_transform
            .times(
              Mat4.translation(
                digit_index * digit_spacing + col * cube_size,
                -row * cube_size + 10,
                0
              )
            )
            .times(Mat4.scale(cube_size, cube_size, cube_size));
          this.shapes.cube.draw(
            context,
            program_state,
            digit_transform,
            this.materials.numbers
          );
        }
      }
    }
  });

  const frame_width = digits.length * digit_spacing * cube_size * 2;
  const frame_height = 8 * cube_size;
  let frame_transform = Mat4.translation(
    score_position.x + frame_width / 2 - cube_size / 2,
    score_position.y - frame_height / 2 + cube_size / 2 + 10,
    0
  ).times(
    Mat4.scale(
      frame_width / 2 + cube_size,
      frame_height / 2 + cube_size,
      cube_size / 2
    )
  );
}
