import { defs, tiny } from "./common.js";
import { Gouraud_Shader } from "./shader.js";

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
  Webgl_Manager
} = tiny;

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
<<<<<<< HEAD
      sphere: new defs.Subdivision_Sphere(4)
=======
>>>>>>> main
    };

    this.materials = {
      oshape: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#ff0d72") }),
      lshape: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#0dc2ff") }),
      ishape: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#0dff72") }),
      sshape: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#f538ff") }),
      zshape: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#ff8e0d") }),
      jshape: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#3877ff") }),
      tshape: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#ff0d0d") }),
      frame: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#cccccc") }),
      frame_night: new Material(new defs.Phong_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#808080") }),
      scoreFrame: new Material(new defs.Phong_Shader(), { ambient: 1, diffusivity: 1, color: hex_color("#ba53ed") }),
      numbers: new Material(new defs.Phong_Shader(), { ambient: 1, diffusivity: 10, color: hex_color("#44fcf6") }),
      test2: new Material(new Gouraud_Shader(), { ambient: 0.4, diffusivity: 0.6, color: hex_color("#992828") }),
      sky: new Material(new defs.Phong_Shader(), { ambient: 0.9, diffusivity: 0.001, color: hex_color("#87ceeb") }),
      night_sky: new Material(new defs.Phong_Shader(), { ambient: 0.9, diffusivity: 0.001, color: hex_color("#142D38") }),
      ground: new Material(new defs.Phong_Shader(), { ambient: 0.8, specularity: 0.3, diffusivity: 0.3, color: hex_color("#276221") }),
      ground_night: new Material(new defs.Phong_Shader(), {ambient: 0.8, specularity: 0.3, diffusivity: 0.3, color: hex_color("#14381d") }),
      sun: new Material(new defs.Phong_Shader(), { ambient: 1, diffusivity: 1, color: hex_color("#FFFFFF") }),
      moon: new Material(new defs.Phong_Shader(), { ambient: 0.8, diffusivity: 0.6, color: hex_color("#F0E68C") }),
      test3: new Material(new defs.Phong_Shader(), { ambient: 0, diffusivity: 0, color: hex_color("#000000"), specularity: 0 }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(11, 20, 60),
      vec3(11, 20, 0),
      vec3(0, 1, 0)
    );

    this.grid = Array.from({ length: 20 }, () => Array(10).fill(null));
    this.clouds = [];
    this.rotation = true;
    this.paused_time = 0;
    this.last_pause_time = 0;
    this.game_time = 0;
    this.rotation_time = 0;

    for (let i = 0; i < 5; i++) {
      this.clouds.push(Mat4.translation(Math.random() * 300 - 150, 40 + Math.random() * 10, 50 + Math.random() * 20).times(Mat4.scale(10, 5, 5)));
    }

    this.current_piece = null;
<<<<<<< HEAD
    this.piece_position = { x: 5, y: 19 };
    this.piece_rotation = Mat4.identity();

    this.start_game_loop();
  }

  drawSky(context, program_state, sky_transform, sun_y_position) {
    let sky = sky_transform.times(Mat4.scale(500, 500, 500));
    let sky_material = sun_y_position < 0 ? this.materials.night_sky : this.materials.sky;

    this.shapes.sphere.draw(context, program_state, sky, sky_material);
  }

  drawGround(context, program_state, ground_transform, sun_y_position){
    ground_transform = ground_transform.times(Mat4.translation(0, -30, 0));
    let ground_material = sun_y_position < 0 ? this.materials.ground_night : this.materials.ground;
    this.shapes.cube.draw(context, program_state, ground_transform, ground_material);
  }

=======

    this.piece_position = { x: 5, y: 20 };
    this.piece_rotation = Mat4.identity();

    this.start_game_loop();
  }

>>>>>>> main
  start_game_loop() {
    this.current_piece = this.generate_new_piece();
    this.piece_position = { x: 5, y: 20 - this.get_piece_height(this.current_piece) };
    this.piece_rotation = Mat4.identity();
    this.next_drop_time = 0;
    this.game_over = false;
    console.log("New piece spawned:", this.current_piece.constructor.name, "at position", this.piece_position);
  }

  generate_new_piece() {
    const pieces = ["oshape", "lshape", "ishape", "sshape", "zshape", "jshape", "tshape"];
    const random_piece = pieces[Math.floor(Math.random() * pieces.length)];
    return this.shapes[random_piece];
  }

  get_piece_height(piece) {
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < piece.arrays.position.length; i++) {
      const y = piece.arrays.position[i][1];
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return maxY - minY + 1;
  }

  drop_piece(dt) {
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
          this.piece_position = { x: 5, y: 20 - this.get_piece_height(this.current_piece) };
          this.piece_rotation = Mat4.identity();
          console.log("New piece spawned:", this.current_piece.constructor.name, "at position", this.piece_position);
        }
      }
      this.next_drop_time = 1;
    }
  }


  detect_collision(rotated_piece = false) {
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
  
      if (x < 0 || x >= 10 || y < 0 || (y < 20 && this.grid[Math.floor(y)][Math.floor(x)])) {
        return true;
      }
    }
    return false;
  }

  merge_piece_to_grid() {
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
        this.grid[Math.floor(y)][Math.floor(x)] = this.materials[this.current_piece.constructor.name.toLowerCase()];
      }
    }
    console.log("Grid after merging:", this.grid);
  }

  clear_full_rows() {
    let cleared_rows = 0;
    this.grid = this.grid.filter(row => {
      if (row.every(cell => cell)) {
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

  make_control_panel() {
    this.key_triggered_button("Move piece left", ["ArrowLeft"], () => this.move_piece(-1));
    this.key_triggered_button("Move piece right", ["ArrowRight"], () => this.move_piece(1));
    this.key_triggered_button("Rotate piece", ["ArrowUp"], () => this.rotate_piece());
    this.key_triggered_button("Drop piece", ["ArrowDown"], () => this.drop_piece(1));
    this.key_triggered_button("Stop Day/Night cycle", ["g"], () => {
      this.rotation ^= 1;
    });
  }

  move_piece(direction) {
    this.piece_position.x += direction;
    if (this.detect_collision()) {
      this.piece_position.x -= direction;
    }
  }

  rotate_piece() {
    let new_rotation = Mat4.rotation(Math.PI / 2, 0, 0, 1).times(this.piece_rotation);
    this.piece_rotation = new_rotation;

    if (this.detect_collision(true)) {
      this.piece_rotation = Mat4.rotation(-Math.PI / 2, 0, 0, 1).times(this.piece_rotation);
    }
  }

<<<<<<< HEAD
  draw_score(context, program_state) {
    const score_position = { x: 30, y: 20 }; // Adjust as needed
    const score = 721; // Placeholder score

    let model_transform = Mat4.translation(score_position.x, score_position.y, 0);

    // Define a more detailed mapping for digits (0-9) to cube configurations using a 4x8 matrix
    const digit_shapes = {
      0: [
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1]
      ],
      1: [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 1]
      ],
      2: [
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 1]
      ],
      3: [
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [1, 1, 1, 1]
      ],
      4: [
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1]
      ],
      5: [
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [1, 1, 1, 1]
      ],
      6: [
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1]
      ],
      7: [
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1]
      ],
      8: [
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1]
      ],
      9: [
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [1, 1, 1, 1]
      ]
    };

=======
  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
      program_state.set_camera(this.initial_camera_location);
    }

    program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 1000);
    const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

    const light_position = vec4(0, 5, 5, 1);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    if (!this.game_over) {
      this.drop_piece(dt);

      let model_transform = Mat4.translation(this.piece_position.x * 2, this.piece_position.y * 2, 0).times(this.piece_rotation);
      this.current_piece.draw(context, program_state, model_transform, this.materials[this.current_piece.constructor.name.toLowerCase()]);
    }

    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x]) {
          let model_transform = Mat4.translation(x * 2, y * 2, 0);
          this.shapes.cube.draw(context, program_state, model_transform, this.grid[y][x]);
        }
      }
    }

    let frame_transform = Mat4.translation(10, 20, 0);
    this.shapes.frame.draw(context, program_state, frame_transform, this.materials.frame);

    this.draw_score(context, program_state);

    if (this.game_over) {
      console.log("Game over!");
      // Display game over message
    }
  }

  draw_score(context, program_state) {
    const score_position = { x: 30, y: 20 };
    const score = 420999;

    let model_transform = Mat4.translation(score_position.x, score_position.y, 0);

>>>>>>> main
    const digits = score.toString().split('').map(Number);
    const cube_size = 0.5; // Decrease the cube size to prevent overlap
    const digit_spacing = 3; // Adjust the spacing between digits

    digits.forEach((digit, digit_index) => {
      const digit_shape = defs.digit_shapes[digit];
      for (let row = 0; row < digit_shape.length; row++) {
        for (let col = 0; col < digit_shape[row].length; col++) {
          if (digit_shape[row][col]) {
            let digit_transform = model_transform
                .times(Mat4.translation(digit_index * digit_spacing + col * cube_size +.5, -row * cube_size + 10, 0))
                .times(Mat4.scale(cube_size, cube_size, cube_size));
            this.shapes.cube.draw(context, program_state, digit_transform, this.materials.scoreFrame);
          }
        }
      }
    });

<<<<<<< HEAD
    // Draw a frame around the score
    const frame_width = digits.length * digit_spacing * cube_size*2;
=======
    const frame_width = digits.length * digit_spacing * cube_size * 2;
>>>>>>> main
    const frame_height = 8 * cube_size;
    let frame_transform = Mat4.translation(score_position.x + frame_width / 2 - cube_size / 2, score_position.y - frame_height / 2 + cube_size / 2 + 10, 0)
        .times(Mat4.scale(frame_width / 2 + cube_size, frame_height / 2 + cube_size, cube_size / 2));
    this.shapes.cube.draw(context, program_state, frame_transform, this.materials.test3);
  }
<<<<<<< HEAD

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
      program_state.set_camera(this.initial_camera_location);
    }

    let model_transform = Mat4.identity();
    program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 1000);
    const current_time = program_state.animation_time / 1000;
    const dt = program_state.animation_delta_time / 1000;

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

    // Calculate the sun's position based on the current or last rotation angle
    let sun_transform = model_transform.times(Mat4.rotation(this.rotation_time / 4, 1, 0, 0))
        .times(Mat4.translation(140, 100, -300))
        .times(Mat4.scale(10, 10, 10));

    // Calculate the moon's position (180 degrees opposite to the sun)
    let moon_transform = model_transform.times(Mat4.rotation(this.rotation_time / 4 + Math.PI, 1, 0, 0))
        .times(Mat4.translation(140, 100, -300))
        .times(Mat4.scale(10, 10, 10));

    // Get the sun's world position
    let sun_position = sun_transform.times(vec4(0, 0, 0, 1));
    // Get the moon's world position
    let moon_position = moon_transform.times(vec4(0, 0, 0, 1));

    // Determine the active light source and its intensity
    let active_light_position, active_light_intensity;
    if (sun_position[1] < 0) {
      // Night time, use moonlight with significantly lower intensity
      active_light_position = moon_position;
      active_light_intensity = 11**4; // Considerably lower intensity for moonlight
    } else {
      // Day time, use sunlight with full intensity
      active_light_position = sun_position;
      active_light_intensity = 10**5; // Full intensity for sunlight
    }

    // Update light position to follow the active light source with adjusted intensity
    program_state.lights = [new Light(active_light_position, color(1, 1, 1, 1), active_light_intensity)];

    if (!this.game_over) {
      this.drop_piece(dt); // Use dt instead of current_time to control piece dropping speed

      let model_transform = Mat4.translation(this.piece_position.x * 2, this.piece_position.y * 2, 0).times(this.piece_rotation);
      this.current_piece.draw(context, program_state, model_transform, this.materials[this.current_piece.constructor.name.toLowerCase()]);
    }

    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x]) {
          let model_transform = Mat4.translation(x * 2, y * 2, 0);
          this.shapes.cube.draw(context, program_state, model_transform, this.grid[y][x]);
        }
      }
    }

    let frame_transform = Mat4.translation(10, 20, 0);
    let frame_material = sun_position[1] < 0 ? this.materials.frame_night : this.materials.frame;
    this.shapes.frame.draw(context, program_state, frame_transform, frame_material);

    this.draw_score(context, program_state);

    if (this.game_over) {
    }

    let sky_transform = Mat4.identity();
    this.drawSky(context, program_state, sky_transform, sun_position[1]);

    let ground_transform = model_transform.times(Mat4.scale(1000, .1, 1000));
    this.drawGround(context, program_state, ground_transform, sun_position[1]);

    // Draw the sun
    this.shapes.sphere.draw(context, program_state, sun_transform, this.materials.sun);

    // Draw the moon
    this.shapes.sphere.draw(context, program_state, moon_transform, this.materials.moon);
  }








}

class Gouraud_Shader extends Shader {
  // This is a Shader using Phong_Shader as template
  // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

  constructor(num_lights = 2) {
    super();
    this.num_lights = num_lights;
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return (
        ` 
        precision mediump float;
        const int N_LIGHTS = ` +
        this.num_lights +
        `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `
    );
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
        this.shared_glsl_code() +
        `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
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
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `
    );
  }

  send_material(gl, gpu, material) {
    // send_material(): Send the desired shape-wide material qualities to the
    // graphics card, where they will tweak the Phong lighting formula.
    gl.uniform4fv(gpu.shape_color, material.color);
    gl.uniform1f(gpu.ambient, material.ambient);
    gl.uniform1f(gpu.diffusivity, material.diffusivity);
    gl.uniform1f(gpu.specularity, material.specularity);
    gl.uniform1f(gpu.smoothness, material.smoothness);
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
        .times(gpu_state.camera_inverse)
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
    // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
    // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
    // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
    // program (which we call the "Program_State").  Send both a material and a program state to the shaders
    // within this function, one data field at a time, to fully initialize the shader for a draw.

    // Fill in any missing fields in the Material object with custom defaults for this shader:
    const defaults = {
      color: color(0, 0, 0, 1),
      ambient: 0,
      diffusivity: 1,
      specularity: 1,
      smoothness: 40,
    };
    material = Object.assign({}, defaults, material);

    this.send_material(context, gpu_addresses, material);
    this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
  }
}

class Ring_Shader extends Shader {
  update_GPU(
      context,
      gpu_addresses,
      graphics_state,
      model_transform,
      material
  ) {
    // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
    const [P, C, M] = [
          graphics_state.projection_transform,
          graphics_state.camera_inverse,
          model_transform,
        ],
        PCM = P.times(C).times(M);
    context.uniformMatrix4fv(
        gpu_addresses.model_transform,
        false,
        Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    context.uniformMatrix4fv(
        gpu_addresses.projection_camera_model_transform,
        false,
        Matrix.flatten_2D_to_1D(PCM.transposed())
    );
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    return (
        this.shared_glsl_code() +
        `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          
        }`
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    return (
        this.shared_glsl_code() +
        `
        void main(){
          
        }`
    );
  }
}
=======
}
>>>>>>> main
