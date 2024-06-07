import { tiny } from '../tiny-graphics.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4,
    Light, Shape, Material, Shader, Texture, Scene
} = tiny;

class Square extends Shape {
  // **Square** demonstrates two triangles that share vertices.  On any planar surface, the
  // interior edges don't make any important seams.  In these cases there's no reason not
  // to re-use data of the common vertices between triangles.  This makes all the vertex
  // arrays (position, normals, etc) smaller and more cache friendly.
  constructor() {
    super("position", "normal", "texture_coord");
    // Specify the 4 square corner locations, and match those up with normal vectors:
    this.arrays.position = Vector3.cast(
      [-1, -1, 0],
      [1, -1, 0],
      [-1, 1, 0],
      [1, 1, 0]
    );
    this.arrays.normal = Vector3.cast(
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1]
    );
    // Arrange the vertices into a square shape in texture space too:
    this.arrays.texture_coord = Vector.cast([0, 0], [1, 0], [0, 1], [1, 1]);
    // Use two triangles this time, indexing into four distinct vertices:
    this.indices.push(0, 1, 2, 1, 3, 2);
  }
}

class Cube extends Shape {
  constructor() {
    super("position", "normal", "texture_coord");
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++) {
        const square_transform = Mat4.rotation(
          i == 0 ? Math.PI / 2 : 0,
          1,
          0,
          0
        )
          .times(
            Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0)
          )
          .times(Mat4.translation(0, 0, 1));
        Square.insert_transformed_copy_into(this, [], square_transform);
      }
  }
}

class TetrisShape extends Shape {
  constructor(name, configs, color) {
      super("position", "normal", "texture_coord");
      this.name = name;
      this.configs = configs;
      this.color = color;
      this.createShape();
  }

  createShape() {
      this.configs.forEach((config, index) => {
          config.forEach(([x, y]) => {
              const cube_transform = Mat4.translation(2 * x, 2 * y, 0);
              Cube.insert_transformed_copy_into(this, [], cube_transform);
          });
      });
  }
}

class IShape extends TetrisShape {
  constructor() {
      super("I", [
          [[-1, 1], [0, 1], [1, 1], [2, 1]],
          [[1, 2], [1, 1], [1, 0], [1, -1]],
          [[-1, 0], [0, 0], [1, 0], [2, 0]],
          [[0, 2], [0, 1], [0, 0], [0, -1]]
      ], "0dc2ff");
  }
}

class OShape extends TetrisShape {
  constructor() {
      super("O", [
          [[0, 0], [1, 0], [0, 1], [1, 1]]
      ], "f538ff");
  }
}

class TShape extends TetrisShape {
  constructor() {
      super("T", [
          [[-1, 0], [0, 0], [1, 0], [0, 1]],
          [[0, 1], [0, 0], [0, -1], [1, 0]],
          [[-1, 0], [0, 0], [1, 0], [0, -1]],
          [[0, 1], [0, 0], [0, -1], [-1, 0]]
      ], "ff0d72");
  }
}

class LShape extends TetrisShape {
  constructor() {
      super("L", [
          [[-1, 1], [0, 1], [1, 1], [1, 2]],
          [[0, 2], [0, 1], [0, 0], [1, 0]],
          [[-1, 1], [0, 1], [1, 1], [-1, 0]],
          [[0, 2], [0, 1], [0, 0], [-1, 2]]
      ], "ff0d0d");
  }
}

class JShape extends TetrisShape {
  constructor() {
      super("J", [
          [[-1, 1], [0, 1], [1, 1], [-1, 2]],
          [[0, 2], [0, 1], [0, 0], [1, 2]],
          [[-1, 1], [0, 1], [1, 1], [1, 0]],
          [[0, 2], [0, 1], [0, 0], [-1, 0]]
      ], "3877ff");
  }
}

class SShape extends TetrisShape {
  constructor() {
      super("S", [
          [[-1, 0], [0, 1], [0, 0], [1, 1]],
          [[0, 1], [0, 0], [1, 0], [1, -1]],
          [[-1, -1], [0, -1], [0, 0], [1, 0]],
          [[-1, 1], [-1, 0], [0, 0], [0, -1]]
      ], "0dff72");
  }
}

class ZShape extends TetrisShape {
  constructor() {
      super("Z", [
          [[-1, 1], [0, 1], [0, 0], [1, 0]],
          [[1, 1], [1, 0], [0, 0], [0, -1]],
          [[-1, 0], [0, 0], [0, -1], [1, -1]],
          [[-1, -1], [-1, 0], [0, 0], [0, 1]]
      ], "ff8e0d");
  }
}

export { IShape, OShape, TShape, LShape, JShape, SShape, ZShape };