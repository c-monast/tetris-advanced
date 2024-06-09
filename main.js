import { defs, tiny } from "./common.js";
import { tetris } from "./tetris_logic.js";
import {
  Color_Phong_Shader,
  Shadow_Textured_Phong_Shader,
  Depth_Texture_Shader_2D,
  Buffered_Texture,
  LIGHT_DEPTH_TEX_SIZE,
} from "./shader.js";

const { vec3, vec4, color, hex_color, Mat4, Light, Material, Scene, Texture } =
  tiny;

const {
  Cube,
  Subdivision_Sphere,
  RectangularFrame,
  Pyramid,
  Cube_Outline,
  Torus,
  Closed_Cone,
  Cylindrical_Tube,
  Phong_Shader,
  Textured_Phong,
} = defs;

import * as renderer from "./renderer.js";
import * as scoreboard from "./scoreboard.js";
import { Materials } from "./materials.js";

const materials = new Materials().getMaterials();

export class Main extends Scene {
  constructor() {
    super();
    this.initialize_shapes();
    this.initialize_materials();
    this.initialize_scene();
    this.initial_camera_location = Mat4.look_at(
      vec3(13, 20, 60),
      vec3(13, 20, 0),
      vec3(0, 1, 0)
    );
    this.tetris = new tetris(this.shapes, this.materials);
  }

  initialize_shapes() {
    this.shapes = {
      sphere: new Subdivision_Sphere(6),
      cube: new Cube(),
      ground: new Cube(),
      rock: new Subdivision_Sphere(1),
      frame: new RectangularFrame(),
      pyramid: new Pyramid(),
      outline: new Cube_Outline(),
      torus: new Torus(7, 7),
      cone: new Closed_Cone(50, 50),
      ring: new Torus(70, 70),
      cylinder: new Cylindrical_Tube(70, 70),
    };
  }

  initialize_materials() {
    this.materials = new Materials().getMaterials();

    this.stars = materials.stars;
    this.floor = materials.floor;
    this.pure = materials.pure;
    this.light_src = materials.light_src;
    this.depth_tex = materials.depth_tex;
    this.ground = materials.ground;
    this.stone = materials.stone;
    this.sky = materials.sky;
    this.frame = materials.frame;
    this.white = materials.white;
    this.tree = materials.tree;
    this.wood = materials.wood;
    this.edge = materials.edge;
    this.shapes.ground.arrays.texture_coord.forEach((p) => p.scale_by(16));

    this.starMatrices = [];
    this.starMatrices2 = [];
    for (var i = 0; i < 600; i++) {
      while (true) {
        var x = Math.random() * 1000 - 500; // Random value between -500 and 500
        var z = Math.random() * 1000 - 500; // Random value between -500 and 500
        var y = Math.random() * 600 + 30; // Random value between 30 and 50
        // Ensure the position is greater than 400 units away in x and z directions, and y is greater than 50
        if (Math.abs(x) > 20 && Math.abs(z) > 200 && Math.abs(y) > 30) {
          this.starMatrices.push(Mat4.translation(x, y, z));
          break;
        }
      }
    }

    for (var i = 0; i < 300; i++) {
      while (true) {
        var x = Math.random() * 1000 - 500; // Random value between -500 and 500
        var z = Math.random() * 1000 - 500; // Random value between -500 and 500
        var y = Math.random() * 600 + 30; // Random value between 30 and 50
        // Ensure the position is greater than 400 units away in x and z directions, and y is greater than 50
        if (Math.abs(x) > 200 && Math.abs(z) > 20 && Math.abs(y) > 30) {
          this.starMatrices2.push(Mat4.translation(x, y, z));
          break;
        }
      }
    }

    this.rotation = true;
    this.paused_time = 0;
    this.last_pause_time = 0;
    this.game_time = 0;
    this.rotation_time = 0;

    // To make sure texture initialization only does once
    this.init_ok = false;

    this.texture_buffer_init = renderer.texture_buffer_init.bind(this);
    this.render_scene = renderer.render_scene.bind(this);
    this.drawTree = renderer.drawTree.bind(this);

    this.draw_score = scoreboard.draw_score.bind(this);
  }

  initialize_scene() {
    this.downscaleMat4 = Mat4.scale(-1, 1, 1);
    this.colors = Array.from({ length: 8 }, () =>
      color(Math.random(), Math.random(), Math.random(), 1.0)
    );
    this.pos = Mat4.translation(-10, 40, 0);
    this.rot = Mat4.identity();
    this.currentTickTime = 0;
    this.t = 0;
    this.inputBuffer = 0;
    this.endAnimationStep = 0;
    this.endAnimationStartTime = 0;
    this.lineClearStartTime = 0;
  }

  make_control_panel() {
    this.key_triggered_button(
      "move left",
      ["ArrowLeft"],
      this.handle_move_left.bind(this)
    );
    this.key_triggered_button(
      "move right",
      ["ArrowRight"],
      this.handle_move_right.bind(this)
    );
    this.key_triggered_button(
      "move down",
      ["ArrowDown"],
      this.handle_move_down.bind(this)
    );
    this.key_triggered_button(
      "rotate",
      ["ArrowUp"],
      this.handle_rotate.bind(this)
    );
  }

  handle_move_left() {
    this.tetris.movePieceLeft();
  }

  handle_move_right() {
    this.tetris.movePieceRight();
  }

  handle_move_down() {
    this.tetris.movePieceDown();
  }

  handle_rotate() {
    this.tetris.rotatePiece();
  }

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      program_state.set_camera(this.initial_camera_location);
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );

    const light_position = vec4(10, 20, 0, 1);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    const t = Math.floor(program_state.animation_time);
    const dt = program_state.animation_delta_time / 1000;

    const gl = context.context;

    if (!this.init_ok) {
      const ext = gl.getExtension("WEBGL_depth_texture");
      if (!ext) {
        return alert("need WEBGL_depth_texture");
      }
      this.texture_buffer_init(gl);

      this.init_ok = true;
    }

    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
    }

    this.light_position = vec4(10, 20, 40, 1);
    this.light_color = color(1, 1, 1, 1);
    this.light_view_target = vec4(0, 0, 0, 1);
    this.light_field_of_view = (130 * Math.PI) / 180;

    program_state.lights = [
      new Light(this.light_position, this.light_color, 1000000),
    ];

    const light_view_mat = Mat4.look_at(
      vec3(
        this.light_position[0],
        this.light_position[1],
        this.light_position[2]
      ),
      vec3(
        this.light_view_target[0],
        this.light_view_target[1],
        this.light_view_target[2]
      ),
      vec3(0, 1, 0)
    );
    const light_proj_mat = Mat4.perspective(
      this.light_field_of_view,
      1,
      10,
      500
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    program_state.light_view_mat = light_view_mat;
    program_state.light_proj_mat = light_proj_mat;
    program_state.light_tex_mat = light_proj_mat;
    program_state.view_mat = light_view_mat;
    program_state.projection_transform = light_proj_mat;
    this.render_scene(context, program_state, false, false, false, t, dt);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    program_state.view_mat = program_state.camera_inverse;
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.5,
      500
    );
    this.render_scene(context, program_state, true, true, true, t, dt);

    this.t = t;

    if (this.lineClearStartTime !== 0 && t - this.lineClearStartTime > 500) {
      this.tetris.isLineClearingAnimationActive = false;
      this.lineClearStartTime = 0;
      this.tetris.clearLines();
    }

    if (
      this.tetris.isLineClearingAnimationActive &&
      this.lineClearStartTime === 0
    ) {
      this.lineClearStartTime = t;
    }

    if (
      t - this.currentTickTime > 500 ||
      (this.inputBuffer > 15 && this.tetris.isPieceAtBottom())
    ) {
      this.tetris.gameTick();
      this.currentTickTime = t;
      this.inputBuffer = 0;
    }

    this.tetris.drawPiece(context, program_state, this.tetris, -1);

    if (this.tetris.isGameOver) {
      if (this.endAnimationStep === 0) {
        this.endAnimationStartTime = t;
        this.endAnimationStep = 1;
      }
      if (t - this.endAnimationStartTime > 50 && this.endAnimationStep < 60) {
        this.endAnimationStep++;
        this.endAnimationStartTime = t;
      }
    }

    this.tetris.drawGameBoard(context, program_state, this.tetris.gameGrid);
    this.tetris.drawPieceQueue(context, program_state);
  }
}
