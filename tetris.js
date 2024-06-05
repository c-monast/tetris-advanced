import { defs, tiny } from "./common.js";
import {
  Gouraud_Shader,
  Shadow_Textured_Phong_Shader,
  Depth_Texture_Shader_2D,
  Buffered_Texture,
} from "./shader.js";
import * as logic from "./logic.js"; // Import logic functions

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
  Texture,
  Webgl_Manager,
} = tiny;

const LIGHT_DEPTH_TEX_SIZE = 1024;

class Pyramid extends Shape {
  constructor() {
    super("position", "normal");
    this.arrays.position = Vector3.cast(
      [1, 0, 0],
      [0, 0, -1],
      [-1, 0, 0],
      [0, 0, 1],
      [0, 2, 0],
      [-1, 0, 0],
      [0, 0, 1]
    );
    this.arrays.normal = Vector3.cast(
      [1, 0, 0],
      [0, 0, -1],
      [-1, 0, 0],
      [0, 0, 1],
      [0, 1, 0]
    );
    this.indices.push(0, 1, 4, 5, 1, 4, 5, 6, 4, 0, 3, 4, 1, 0, 3, 1, 2, 3); //,2,3,1,0,4,3)
  }
}

class Cube_Outline extends Shape {
  constructor() {
    super("position", "color");
    // When a set of lines is used in graphics, you should think of the list entries as
    // broken down into pairs; each pair of vertices will be drawn as a line segment.
    // Note: since the outline is rendered with Basic_shader, you need to redefine the
    // position and color of each vertex
    this.arrays.position = Vector3.cast(
      // X Y Z
      [-1, -1, -1],
      [1, -1, -1],
      [-1, -1, -1],
      [-1, 1, -1],
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, -1, 1],
      [1, -1, 1],
      [-1, -1, 1],
      [-1, 1, 1],
      [-1, 1, -1],
      [-1, 1, 1],
      [-1, 1, -1],
      [-1, 1, 1],
      [-1, 1, -1],
      [1, 1, -1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, -1, -1],
      [1, 1, -1],
      [1, -1, 1],
      [1, 1, 1],
      [1, 1, -1],
      [1, 1, 1],
      [1, -1, -1],
      [1, -1, 1]
    );
    this.arrays.color = [
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
    ];
    this.indices = false;
  }
}

export class Tetris extends Scene {
  constructor() {
    super();

    this.shapes = {
      oshape: new defs.OShape(),
      lshape: new defs.LShape(),
      ishape: new defs.IShape(),
      sshape: new defs.SShape(),
      zshape: new defs.ZShape(),
      jshape: new defs.JShape(),
      tshape: new defs.TShape(),
      frame: new defs.RectangularFrame(),
      cube: new defs.Cube(),
      sphere: new defs.Subdivision_Sphere(4),
      outline: new Cube_Outline(),
      pyramid: new Pyramid(),
      rock: new defs.Subdivision_Sphere(1),
    };

    this.materials = {
      oshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ff0d72"),
      }),
      lshape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#0dc2ff"),
      }),
      ishape: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
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
      test2: new Material(new Gouraud_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#992828"),
      }),
      sky: new Material(new defs.Phong_Shader(), {
        ambient: 0.9,
        diffusivity: 0.001,
        color: hex_color("#87ceeb"),
      }),
      night_sky: new Material(new defs.Phong_Shader(), {
        ambient: 0.9,
        diffusivity: 0.001,
        color: hex_color("#142D38"),
      }),
      ground: new Material(new Shadow_Textured_Phong_Shader(1), {
        ambient: 0.8,
        specularity: 0.3,
        diffusivity: 0.3,
        color: hex_color("#276221"),
      }),
      ground_night: new Material(new defs.Phong_Shader(), {
        ambient: 0.8,
        specularity: 0.3,
        diffusivity: 0.3,
        color: hex_color("#14381d"),
      }),
      sun: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0,
        color: hex_color("#FFFFFF"),
        specularity: 0,
        light_depth_texture: null,
      }),
      moon: new Material(new defs.Phong_Shader(), {
        ambient: 0.8,
        diffusivity: 0.6,
        color: hex_color("#F0E68C"),
      }),
      test3: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 0,
        color: hex_color("#000000"),
        specularity: 0,
      }),
      tree: new Material(new defs.Phong_Shader(), {
        ambient: 0.8,
        specularity: 0.3,
        diffusivity: 0.3,
        color: hex_color("#14381d"),
        //texture: Texture("assets/static.jpg")
      }),
      wood: new Material(new Shadow_Textured_Phong_Shader(1), {
        ambient: 0.8,
        specularity: 0.3,
        diffusivity: 0.3,
        color: hex_color("#563232"),
      }),
      pure: new Material(new Color_Phong_Shader(), {}),
      plastic: new Material(new Shadow_Textured_Phong_Shader(1), {
        color: color(0.9, 0.5, 0.9, 1),
        ambient: 0.4,
        diffusivity: 0.8,
        specularity: 0.5,
        light_depth_texture: null,
      }),
      rock: new Material(new Shadow_Textured_Phong_Shader(1), {
        color: color(0.5, 0.5, 0.5, 1),
        ambient: 0.4,
        diffusivity: 0.8,
        specularity: 0.5,
        light_depth_texture: null,
      }),
      // For light source, if you want to draw and see where it's at for easier finding.
      light_src: new Material(new defs.Phong_Shader(), {
        color: color(1, 1, 1, 1),
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
      }),
      // For depth texture display, drawing that square based buffer small on scene
      depth_tex: new Material(new Depth_Texture_Shader_2D(), {
        color: hex_color("#000000"),
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: null,
      }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(11, 20, 60),
      vec3(11, 20, 0),
      vec3(0, 1, 0)
    );

    this.grid = Array.from({ length: 20 }, () => Array(10).fill(null));
    this.rotation = true;
    this.paused_time = 0;
    this.last_pause_time = 0;
    this.game_time = 0;
    this.rotation_time = 0;
    this.white = new Material(new defs.Basic_Shader());

    this.current_piece = null;

    this.piece_position = { x: 5, y: 20 };
    this.piece_rotation = Mat4.identity();

    this.tree_locations = [];
    for (let i = 0; i < 20; i++) {
      while (true) {
        let x = Math.random() * -110;
        let z = Math.random() * -140;
        if (z <= 10 && z >= -10 && x <= -4 && x >= -3 && z !== 0) {
          continue;
        }
        this.tree_locations.push(Mat4.translation(x, -1.5, z));
        break;
      }
    }

    this.init_ok = false;
    this.start_game_loop();
  }

  drawSky(context, program_state, sky_transform, sun_y_position) {
    let sky = sky_transform.times(Mat4.scale(500, 500, 500));
    let sky_material =
      sun_y_position < 0 ? this.materials.night_sky : this.materials.sky;

    this.shapes.sphere.draw(context, program_state, sky, sky_material);
  }

  drawGround(
    context,
    program_state,
    ground_transform,
    sun_y_position,
    shadow_pass
  ) {
    ground_transform = ground_transform.times(Mat4.translation(0, -30, 0));
    let ground_material =
      sun_y_position < 0 ? this.materials.ground_night : this.materials.ground;
    this.shapes.cube.draw(
      context,
      program_state,
      ground_transform,
      shadow_pass ? ground_material : this.materials.pure
    );
  }

  drawTree(context, program_state, wood_transform, tree_transform, x, z) {
    // Apply the initial translation by x and z to the transforms
    wood_transform = wood_transform
      .times(Mat4.translation(x, -1.5, z))
      .times(Mat4.scale(0.5, 2, 0.5));
    tree_transform = tree_transform
      .times(Mat4.translation(x, -1.5, z))
      .times(Mat4.scale(2, 1, 2));

    // Draw the wood
    this.shapes.cube.draw(
      context,
      program_state,
      wood_transform,
      this.materials.wood
    );

    // Draw the tree leaves
    for (let i = 0; i < 4; i++) {
      tree_transform = tree_transform.times(Mat4.translation(0, 0.8, 0));
      this.shapes.pyramid.draw(
        context,
        program_state,
        tree_transform,
        this.materials.tree
      );
    }
  }

  start_game_loop() {
    logic.start_game_loop.call(this);
  }

  generate_new_piece() {
    return logic.generate_new_piece.call(this);
  }

  get_piece_height(piece) {
    return logic.get_piece_height.call(this, piece);
  }

  drop_piece(dt) {
    logic.drop_piece.call(this, dt);
  }

  detect_collision(rotated_piece = false) {
    return logic.detect_collision.call(this, rotated_piece);
  }

  merge_piece_to_grid() {
    logic.merge_piece_to_grid.call(this);
  }

  clear_full_rows() {
    logic.clear_full_rows.call(this);
  }

  rotate_piece() {
    logic.rotate_piece.call(this);
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

  move_piece(direction) {
    this.piece_position.x += direction;
    if (this.detect_collision(this.piece_rotation, this.piece_position)) {
      this.piece_position.x -= direction;
    }
  }

  texture_buffer_init(gl) {
    // Depth Texture
    this.lightDepthTexture = gl.createTexture();
    this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
    this.materials.plastic.light_depth_texture = this.light_depth_texture;
    this.materials.wood.light_depth_texture = this.light_depth_texture;
    this.materials.rock.light_depth_texture = this.light_depth_texture;

    this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
    gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT,
      this.lightDepthTextureSize,
      this.lightDepthTextureSize,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Depth Texture Buffer
    this.lightDepthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.lightDepthTexture,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Create a color texture of the same size as the depth texture
    this.unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.lightDepthTextureSize,
      this.lightDepthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.unusedTexture,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render_scene(
    context,
    program_state,
    shadow_pass,
    draw_light_source = false,
    draw_shadow = false,
    sun_position,
    moon_position,
    sun_transform,
    moon_transform
  ) {
    // let light_position = this.light_position;
    program_state.draw_shadow = draw_shadow;
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      program_state.set_camera(this.initial_camera_location);
    }

    let model_transform = Mat4.identity();
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );
    const current_time = program_state.animation_time / 1000;
    const dt = program_state.animation_delta_time / 1000;

    // This draws the sun
    // if (draw_light_source && shadow_pass) {
    //   this.shapes.sphere.draw(context, program_state,
    //       Mat4.translation(sun_position[0], sun_position[1], sun_position[2]).times(Mat4.scale(3,30,30)),
    //       this.materials.light_src.override({color: this.materials.sun.color}));
    // }

    // Update the paused time if the rotation flag is toggled off
    if (!this.rotation) {
      if (!this.last_pause_time) {
        this.last_pause_time = current_time;
      }
      this.paused_time += current_time - this.last_pause_time;
      this.last_pause_time = current_time;
    } else {
      this.last_pause_time = 0; // Reset the pause time when rotation is enabled
    }

    // Calculate the adjusted game time and rotation time
    this.game_time = current_time - this.paused_time;
    if (this.rotation) {
      this.rotation_time = this.game_time;
    }

    //* THIS CALCULATES THE SUN AND MOON INTENSITIES*//

    // Calculate the sun's position based on the current or last rotation angle

    // Determine the active light source and its intensity

    if (!this.game_over) {
      this.drop_piece(dt); // Use dt instead of current_time to control piece dropping speed

      let model_transform = Mat4.translation(
        this.piece_position.x * 2,
        this.piece_position.y * 2,
        0
      ).times(this.piece_rotation);
      this.current_piece.draw(
        context,
        program_state,
        model_transform,
        this.materials[this.current_piece.constructor.name.toLowerCase()]
      );
    }

    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x]) {
          let model_transform = Mat4.translation(x * 2, y * 2, 0);
          this.shapes.cube.draw(
            context,
            program_state,
            model_transform,
            this.grid[y][x]
          );
        }
      }
    }

    let frame_transform = Mat4.translation(10, 20, 0);
    let frame_material =
      sun_position[1] < 0 ? this.materials.frame_night : this.materials.frame;
    this.shapes.frame.draw(
      context,
      program_state,
      frame_transform,
      shadow_pass ? frame_material : this.materials.pure
    );

    this.draw_score(context, program_state);

    if (this.game_over) {
      console.log("Game over!");
      // Display game over message
    }

    let sky_transform = Mat4.identity();
    this.drawSky(context, program_state, sky_transform, sun_position[1]);

    let ground_transform = model_transform.times(Mat4.scale(1000, 0.1, 1000));
    this.drawGround(
      context,
      program_state,
      ground_transform,
      sun_position[1],
      shadow_pass
    );

    // Draw the sun
    this.shapes.sphere.draw(
      context,
      program_state,
      sun_transform,
      this.materials.sun
    );

    // Draw the moon
    this.shapes.sphere.draw(
      context,
      program_state,
      moon_transform,
      this.materials.moon
    );

    for (let i = 0; i < 22; i++) {
      for (let j = 0; j < 11; j++) {
        this.shapes.outline.draw(
          context,
          program_state,
          model_transform,
          this.white,
          "LINES"
        );
        model_transform = model_transform.times(Mat4.translation(2, 0, 0));
      }
      model_transform = Mat4.identity().times(Mat4.translation(0, 2 * i, 0));
    }

    let tree_transform = Mat4.identity();
    let wood_transform = Mat4.identity();

    for (let i = 0; i < 20; i++) {
      this.drawTree(
        context,
        program_state,
        tree_transform.times(this.tree_locations[i]),
        wood_transform.times(this.tree_locations[i]),
        60,
        -10
      );
    }

    this.shapes.rock.draw(
      context,
      program_state,
      Mat4.translation(30, -2, 5),
      shadow_pass ? this.materials.rock : this.materials.pure
    );
  }

  display(context, program_state) {
    const t = program_state.animation_time;
    const gl = context.context;
    let model_transform = Mat4.identity();

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
      program_state.set_camera(this.initial_camera_location); // Locate the camera here
    }

    let sun_transform = model_transform
      .times(Mat4.rotation(this.rotation_time / 40, 1, 0, 0))
      .times(Mat4.translation(80, 80, -80))
      .times(Mat4.scale(10, 10, 10));

    // Calculate the moon's position (180 degrees opposite to the sun)
    let moon_transform = model_transform
      .times(Mat4.rotation(this.rotation_time / 40 + Math.PI, 1, 0, 0))
      .times(Mat4.translation(80, 80, -80))
      .times(Mat4.scale(10, 10, 10));

    // Get the sun's world position
    let sun_position = sun_transform.times(vec4(0, 0, 0, 1));
    // Get the moon's world position
    let moon_position = moon_transform.times(vec4(0, 0, 0, 1));

    // Get the current light position
    let active_light_position, active_light_intensity;
    if (sun_position[1] < 0) {
      // Nighttime, use moonlight with intensity based on moon's y position
      active_light_position = moon_position;
      active_light_intensity = 10 ** 4 * Math.max(0, moon_position[1] / 1000); // Adjusted intensity for moonlight based on y position
    } else {
      // Day time, use sunlight with intensity based on sun's y position
      active_light_position = sun_position;
      active_light_intensity = 10 ** 5 * Math.max(0, sun_position[1] / 100); // Adjusted intensity for sunlight based on y position
    }

    // The position of the light
    this.light_position = active_light_position.times(vec4(2, 3, 1, 1));
    // The color of the light
    this.light_color = color(
      0.667 + Math.sin(t / 500) / 3,
      0.667 + Math.sin(t / 1500) / 3,
      0.667 + Math.sin(t / 3500) / 3,
      1
    );

    // This is a rough target of the light.
    // Although the light is point light, we need a target to set the POV of the light
    this.light_view_target = vec4(0, 0, 0, 1);
    this.light_field_of_view = (10 * Math.PI) / 180; // 130 degree

    // Update light position to follow the active light source with adjusted intensity
    program_state.lights = [
      new Light(
        active_light_position,
        color(1, 1, 1, 1),
        active_light_intensity
      ),
    ];

    //program_state.lights = [new Light(this.light_position, this.materials.sun, 1000)];

    // Step 1: set the perspective and camera to the POV of light
    const light_view_mat = Mat4.look_at(
      vec3(
        active_light_position[0],
        active_light_position[1],
        active_light_position[2]
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
      0.1,
      0.5,
      50000
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
    this.render_scene(
      context,
      program_state,
      false,
      false,
      false,
      sun_position,
      moon_position,
      sun_transform,
      moon_transform
    );

    // Step 2: unbind, draw to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    program_state.view_mat = program_state.camera_inverse;
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      2,
      700
    );
    this.render_scene(
      context,
      program_state,
      true,
      true,
      true,
      sun_position,
      moon_position,
      sun_transform,
      moon_transform
    );

    // // Step 3: display the textures
    // this.shapes.rock.draw(context, program_state,
    //     Mat4.translation(-.99, .08, 0).times(
    //         Mat4.scale(0.7, 0.7 * gl.canvas.width / gl.canvas.height, 1)
    //     ),
    //     this.materials.depth_tex.override({texture: this.lightDepthTexture})
    // );
  }

  draw_score(context, program_state) {
    const score_position = { x: 30, y: 20 };
    const score = 420999;

    let model_transform = Mat4.translation(
      score_position.x,
      score_position.y,
      0
    );

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
                  -row * cube_size,
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
      score_position.y - frame_height / 2 + cube_size / 2,
      0
    ).times(
      Mat4.scale(
        frame_width / 2 + cube_size,
        frame_height / 2 + cube_size,
        cube_size / 2
      )
    );
    this.shapes.cube.draw(
      context,
      program_state,
      frame_transform,
      this.materials.scoreFrame
    );
  }
}

class Color_Phong_Shader extends defs.Phong_Shader {
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
                varying vec2 f_tex_coord;
                attribute vec3 position, normal;                            
                // Position is expressed in object coordinates.
                attribute vec2 texture_coord;
                
                uniform mat4 model_transform;
                uniform mat4 projection_camera_model_transform;
        
                void main(){                                                                   
                    // The vertex's final resting place (in NDCS):
                    gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                    // The final normal vector in screen space.
                    N = normalize( mat3( model_transform ) * normal / squared_scale);
                    vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                    // Turn the per-vertex texture coordinate into an interpolated variable.
                    f_tex_coord = texture_coord;
                  } `
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
                uniform sampler2D texture;
                uniform sampler2D light_depth_texture;
                uniform mat4 light_view_mat;
                uniform mat4 light_proj_mat;
                
                void main(){
                    gl_FragColor = vec4( (shape_color.xyz ) * ambient, shape_color.w ); 
                                                                             // Compute the final color with contributions from lights:
                    gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                  } `
    );
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
    // send_gpu_state():  Send the state of our whole drawing context to the GPU.
    const O = vec4(0, 0, 0, 1),
      camera_center = gpu_state.camera_transform.times(O).to3();
    gl.uniform3fv(gpu.camera_center, camera_center);
    // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
    const squared_scale = model_transform
      .reduce((acc, r) => {
        return acc.plus(vec4(...r).times_pairwise(r));
      }, vec4(0, 0, 0, 0))
      .to3();
    gl.uniform3fv(gpu.squared_scale, squared_scale);
    // Send the current matrices to the shader.  Go ahead and pre-compute
    // the products we'll need of the of the three special matrices and just
    // cache and send those.  They will be the same throughout this draw
    // call, and thus across each instance of the vertex shader.
    // Transpose them since the GPU expects matrices as column-major arrays.
    const PCM = gpu_state.projection_transform
      .times(gpu_state.view_mat)
      .times(model_transform);
    gl.uniformMatrix4fv(
      gpu.model_transform,
      false,
      Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    gl.uniformMatrix4fv(
      gpu.projection_camera_model_transform,
      false,
      Matrix.flatten_2D_to_1D(PCM.transposed())
    );
    // shadow related
    gl.uniformMatrix4fv(
      gpu.light_view_mat,
      false,
      Matrix.flatten_2D_to_1D(gpu_state.light_view_mat.transposed())
    );
    gl.uniformMatrix4fv(
      gpu.light_proj_mat,
      false,
      Matrix.flatten_2D_to_1D(gpu_state.light_proj_mat.transposed())
    );

    // Omitting lights will show only the material color, scaled by the ambient term:
    if (!gpu_state.lights.length) return;

    const light_positions_flattened = [],
      light_colors_flattened = [];
    for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
      light_positions_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].position[i % 4]
      );
      light_colors_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].color[i % 4]
      );
    }
    gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
    gl.uniform4fv(gpu.light_colors, light_colors_flattened);
    gl.uniform1fv(
      gpu.light_attenuation_factors,
      gpu_state.lights.map((l) => l.attenuation)
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Add a little more to the base class's version of this method.
    super.update_GPU(
      context,
      gpu_addresses,
      gpu_state,
      model_transform,
      material
    );
    // Updated for assignment 4
    context.uniform1f(
      gpu_addresses.animation_time,
      gpu_state.animation_time / 1000
    );
  }
}
