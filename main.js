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

class Base_Scene extends Scene {
  constructor() {
    super();
    this.initialize_shapes();
    this.initialize_materials();
    this.initial_camera_location = Mat4.look_at(
      vec3(13, 20, 60),
      vec3(13, 20, 0),
      vec3(0, 1, 0)
    );
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
    const commonShaderProps = {
      ambient: 1,
      specularity: 0.3,
      diffusivity: 0.6,
      color_texture: null,
    };

    this.materials = {
      plastic: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),
      scoreFrame: new Material(new defs.Phong_Shader(), {
        ...commonShaderProps,
        color: hex_color("#ba53ed"),
      }),
      numbers: new Material(new defs.Phong_Shader(), {
        ...commonShaderProps,
        diffusivity: 10,
        color: hex_color("#44fcf6"),
      }),
      mountain: new Material(new Shadow_Textured_Phong_Shader(1), {
        ...commonShaderProps,
        color: hex_color("#934105"),
      }),
      grey: new Material(new Shadow_Textured_Phong_Shader(1), {
        ...commonShaderProps,
        ambient: 0.3,
        specularity: 0.4,
        color: hex_color("#404040"),
      }),
    };

    // For the teapot
    this.stars = new Material(new Shadow_Textured_Phong_Shader(1), {
      color: color(0.5, 0.5, 0.5, 1),
      ambient: 0.4,
      diffusivity: 0.5,
      specularity: 0.5,
      color_texture: new Texture("assets/stars.png"),
      light_depth_texture: null,
    });
    // For the floor or other plain objects
    this.floor = new Material(new Shadow_Textured_Phong_Shader(1), {
      color: color(1, 1, 1, 1),
      ambient: 0.3,
      diffusivity: 0.6,
      specularity: 0.4,
      smoothness: 64,
      color_texture: null,
      light_depth_texture: null,
    });
    // For the first pass
    this.pure = new Material(new Color_Phong_Shader(), {});
    // For light source
    this.light_src = new Material(new Phong_Shader(), {
      color: color(1, 1, 1, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
    });
    // For depth texture display
    this.depth_tex = new Material(new Depth_Texture_Shader_2D(), {
      color: color(0, 0, 0.0, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
      texture: null,
    });
    this.ground = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.4,
      specularity: 0.3,
      diffusivity: 0.1,
      color: hex_color("#E9620A"),
      color_texture: null,
      texture: new Texture("assets/stone.jpg", "NEAREST"),
    });
    this.stone = new Material(new Textured_Phong(), {
      ambient: 0.3,
      specularity: 0.1,
      diffusivity: 0.1,
      color: hex_color("#E9620A"),
      texture: new Texture("assets/stone.jpg", "NEAREST"),
      color_texture: null,
    });
    this.sky = new Material(new Color_Phong_Shader(), {
      ambient: 0.9,
      specularity: 0.3,
      diffusivity: 0.001,
      color: color(0.527, 0.805, 0.917, 1),
      color_texture: null,
    });
    this.frame = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.9,
      specularity: 0.3,
      diffusivity: 0.001,
      color: color(0.5, 0.5, 0.5, 1),
      color_texture: null,
    });
    this.white = new Material(new defs.Basic_Shader());

    this.tree = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.8,
      specularity: 0.3,
      diffusivity: 0.03,
      color: hex_color("#14381d"),
    });
    this.wood = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.8,
      specularity: 0.3,
      diffusivity: 0.3,
      color: hex_color("#563232"),
    });
    this.edge = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.6,
      specularity: 0.3,
      diffusivity: 0.3,
      color: hex_color("#C85205"),
    });
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
  }
}

export class Main extends Base_Scene {
  constructor() {
    super();
    this.initialize_scene();
    this.tetris = new tetris();
  }

  initialize_scene() {
    this.downscale_mat4 = Mat4.scale(-1, 1, 1);
    this.colors = Array.from({ length: 8 }, () =>
      color(Math.random(), Math.random(), Math.random(), 1.0)
    );
    this.sway = true;
    this.outline = false;
    this.pos = Mat4.translation(-10, 40, 0);
    this.rot = Mat4.identity();
    this.cur = 0;
    this.t = 0;
    this.buffer = 0;
    this.atbottom = false;
    this.endstep = 0;
    this.endtime = 0;
    this.lineClearStart = 0;
    this.gg = [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 0],
      [2, 0],
      [2, 2],
      [2, 3],
      [3, 0],
      [3, 3],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
    ];
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
    this.tetris.moveLeft();
  }

  handle_move_right() {
    this.tetris.moveRight();
  }

  handle_move_down() {
    this.tetris.moveDown();
  }

  handle_rotate() {
    this.tetris.rotate();
  }

  draw_box(context, program_state, x, y, clr, scale = 1) {
    const scaleMatrix = Mat4.scale(scale, scale, scale);
    const transform = this.downscale_mat4.times(
      Mat4.translation(x, y, 0).times(scaleMatrix)
    );
    this.shapes.cube.draw(
      context,
      program_state,
      transform,
      this.materials.plastic.override({ color: hex_color(clr) })
    );
  }

  draw_board(context, program_state, grid) {
    const t = Math.floor(program_state.animation_time);
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 22; j++) {
        if (grid[i][j] !== -1) {
          const scale = this.tetris.fullLines.includes(j)
            ? 1.0 - (t - this.lineClearStart) / 500
            : -1;
          this.draw_box(
            context,
            program_state,
            -i * 2,
            j * 2,
            this.tetris.colors[grid[i][j]]
          );
        }
      }
    }
  }
  draw_piece(context, program_state, tet, opt) {
    if (!tet) return;

    const [x, y, dxy, clr] =
      opt === -1
        ? [
            tet.x,
            tet.y,
            tet.config[tet.block][tet.rotation],
            tet.colors[tet.block],
          ]
        : [15, 17.5 - 4 * opt[0], tet.config[opt[1]][0], tet.colors[opt[1]]];

    for (let i = 0; i < 4; i++) {
      const [nx, ny] = [x + dxy[i][0], y + dxy[i][1]];
      const model_transform = this.downscale_mat4.times(
        Mat4.translation(-nx * 2, ny * 2, 0)
      );
      this.shapes.cube.draw(
        context,
        program_state,
        model_transform,
        this.materials.plastic.override({ color: hex_color(clr) })
      );
    }
  }

  draw_queue(context, program_state) {
    if (!this.tetris) return;
    for (let i = 0; i < 5; i++) {
      this.draw_piece(context, program_state, this.tetris, [
        i,
        this.tetris.queue[i],
      ]);
    }
  }

  display(context, program_state) {
    super.display(context, program_state);

    const t = Math.floor(program_state.animation_time);
    const dt = program_state.animation_delta_time / 1000;

    const gl = context.context;

    if (!this.init_ok) {
      const ext = gl.getExtension("WEBGL_depth_texture");
      if (!ext) {
        return alert("need WEBGL_depth_texture"); // eslint-disable-line
      }
      this.texture_buffer_init(gl);

      this.init_ok = true;
    }

    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
    }

    // The position of the light
    this.light_position = //Mat4.rotation(t / 1500, 0, 1, 0).times(
      vec4(10, 20, 40, 1);
    // The color of the light
    this.light_color = color(
      //0.667 + Math.sin(t/500) / 3,
      // 0.667 + Math.sin(t/1500) / 3,
      // 0.667 + Math.sin(t/3500) / 3,
      1,
      1,
      1,
      1
    );

    // This is a rough target of the light.
    // Although the light is point light, we need a target to set the POV of the light
    this.light_view_target = vec4(0, 0, 0, 1);
    this.light_field_of_view = (130 * Math.PI) / 180; // 130 degree

    program_state.lights = [
      new Light(this.light_position, this.light_color, 1000000),
    ];

    // Step 1: set the perspective and camera to the POV of light
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
      vec3(0, 1, 0) // assume the light to target will have a up dir of +y, maybe need to change according to your case
    );
    const light_proj_mat = Mat4.perspective(
      this.light_field_of_view,
      1,
      10,
      500
    );
    // Bind the Depth Texture Buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Prepare uniforms
    program_state.light_view_mat = light_view_mat;
    program_state.light_proj_mat = light_proj_mat;
    program_state.light_tex_mat = light_proj_mat;
    program_state.view_mat = light_view_mat;
    program_state.projection_transform = light_proj_mat;
    this.render_scene(context, program_state, false, false, false, t, dt);

    // Step 2: unbind, draw to the canvas
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

    if (this.lineClearStart !== 0 && t - this.lineClearStart > 500) {
      this.tetris.isAnimating = false;
      this.lineClearStart = 0;
      this.tetris.clearLines();
    }

    if (this.tetris.isAnimating && this.lineClearStart === 0) {
      this.lineClearStart = t;
    }

    if (t - this.cur > 500 || (this.buffer > 15 && this.atbottom)) {
      this.tetris.tick();
      this.cur = t;
      this.buffer = 0;
    }

    this.draw_piece(context, program_state, this.tetris, -1);
    if (this.tetris.gameend) {
      if (this.endstep === 0) {
        this.endtime = t;
        this.endstep = 1;
      }
      if (t - this.endtime > 50 && this.endstep < 60) {
        this.endstep++;
        this.endtime = t;
      }
    }

    this.draw_board(context, program_state, this.tetris.grid);
    this.draw_queue(context, program_state);
  }
}
