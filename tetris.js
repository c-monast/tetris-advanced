import { defs, tiny } from "./common.js";
const {
  vec3,
  vec4,
  vec,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Shader,
  Texture,
  Scene,
} = tiny;
const {
  Cube,
  Axis_Arrows,
  Textured_Phong,
  Phong_Shader,
  Basic_Shader,
  Subdivision_Sphere,
} = defs;

import {
  Color_Phong_Shader,
  Shadow_Textured_Phong_Shader,
  Depth_Texture_Shader_2D,
  Buffered_Texture,
  LIGHT_DEPTH_TEX_SIZE,
} from "./shader.js";
import * as logic from "./logic.js";
import * as renderer from "./renderer.js";
import * as scoreboard from "./scoreboard.js";

export class Tetris extends Scene {
  constructor() {
    super();
    // Load the model file:
    this.shapes = {
      oshape: new defs.OShape(),
      lshape: new defs.LShape(),
      ishape: new defs.IShape(),
      sshape: new defs.SShape(),
      zshape: new defs.ZShape(),
      jshape: new defs.JShape(),
      tshape: new defs.TShape(),
      sphere: new Subdivision_Sphere(6),
      cube: new Cube(),
      rock: new Subdivision_Sphere(1),
      frame: new defs.RectangularFrame(),
      pyramid: new defs.Pyramid(),
      outline: new defs.Cube_Outline(),
      torus: new defs.Torus(7,7),
      cone: new defs.Closed_Cone(50, 50),
      ring: new defs.Torus(70,70),
      cylinder: new defs.Cylindrical_Tube(70, 70)
    };
    this.materials = {
      oshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ff0d72"),
      }),
      lshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.1,
        color: hex_color("#0dc2ff"),
      }),
      ishape: new Material(new Shadow_Textured_Phong_Shader(1), {
        ambient: 0.2,
        diffusivity: 0.1,
        specularity: .1,
        color: hex_color("#0dff72"),
      }),
      sshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#f538ff"),
      }),
      zshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ff8e0d"),
      }),
      jshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#3877ff"),
      }),
      tshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ff0d0d"),
      }),
      frame: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#cccccc"),
      }),
      frame_night: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#808080"),
      }),
      scoreFrame: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color("#ba53ed"),
      }),
      numbers: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 10,
        color: hex_color("#44fcf6"),
      }),
      mountain: new Material(new Shadow_Textured_Phong_Shader(1), {
        ambient: 1,
        specularity: 0.3,
        diffusivity: .1,
        color: hex_color("#934105"),
        color_texture: null,
      }),
      grey: new Material(new Shadow_Textured_Phong_Shader(1), {
        ambient: 0.3,
        specularity: 0.4,
        diffusivity: .6,
        color: hex_color("#404040"),
        color_texture: null,
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
      ambient: 0.5,
      specularity: 0.3,
      diffusivity: .1,
      color: hex_color("#E9620A"),
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

    this.current_piece = null;

    this.piece_position = { x: 5, y: 20 };
    this.piece_rotation = Mat4.identity();

    // To make sure texture initialization only does once
    this.init_ok = false;

    // Bind the logic functions to this instance
    this.start_game_loop = logic.start_game_loop.bind(this);
    this.generate_new_piece = logic.generate_new_piece.bind(this);
    this.get_piece_height = logic.get_piece_height.bind(this);
    this.get_piece_dimensions = logic.get_piece_dimensions.bind(this);
    this.drop_piece = logic.drop_piece.bind(this);
    this.rotate_piece = logic.rotate_piece.bind(this);
    this.move_piece = logic.move_piece.bind(this);
    this.check_collision_with_frame =
      logic.check_collision_with_frame.bind(this);
    this.try_rotation = logic.try_rotation.bind(this);
    this.add_piece_to_grid = logic.add_piece_to_grid.bind(this);
    this.clear_full_rows = logic.clear_full_rows.bind(this);

    this.texture_buffer_init = renderer.texture_buffer_init.bind(this);
    this.render_scene = renderer.render_scene.bind(this);
    this.drawTree = renderer.drawTree.bind(this);

    this.draw_score = scoreboard.draw_score.bind(this);

    // Start the game loop
    this.start_game_loop();
  }

  make_control_panel() {
    this.key_triggered_button("Move piece left", ["ArrowLeft"], () =>
      this.move_piece(-1)
    );
    this.key_triggered_button("Move piece right", ["ArrowRight"], () =>
      this.move_piece(1)
    );
    this.key_triggered_button("Rotate piece", ["ArrowUp"], () =>
      this.rotate_piece()
    );
    this.key_triggered_button("Drop piece", ["ArrowDown"], () =>
      this.drop_piece(1)
    );
    this.key_triggered_button("Stop Day/Night cycle", ["g"], () => {
      this.rotation ^= 1;
    });
  }

  display(context, program_state) {
    const t = program_state.animation_time;
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
      program_state.set_camera(
        Mat4.look_at(vec3(11, 20, 60), vec3(11, 20, 0), vec3(0, 1, 0))
      ); // Locate the camera here
    }

    // The position of the light
    this.light_position = //Mat4.rotation(t / 1500, 0, 1, 0).times(
      vec4(10,20, 40, 1)
    ;
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

    // // Step 3: display the textures
    // this.shapes.square_2d.draw(context, program_state,
    //     Mat4.translation(-.99, .08, 0).times(
    //     Mat4.scale(0.5, 0.5 * gl.canvas.width / gl.canvas.height, 1)
    //     ),
    //     this.depth_tex.override({texture: this.lightDepthTexture})
    // );
  }
}