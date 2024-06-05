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

export function texture_buffer_init(gl) {
  // Depth Texture
  this.lightDepthTexture = gl.createTexture();
  // Bind it to TinyGraphics
  this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
  this.stars.light_depth_texture = this.light_depth_texture;
  this.floor.light_depth_texture = this.light_depth_texture;

  this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
  gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
  gl.texImage2D(
    gl.TEXTURE_2D, // target
    0, // mip level
    gl.DEPTH_COMPONENT, // internal format
    this.lightDepthTextureSize, // width
    this.lightDepthTextureSize, // height
    0, // border
    gl.DEPTH_COMPONENT, // format
    gl.UNSIGNED_INT, // type
    null
  ); // data
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Depth Texture Buffer
  this.lightDepthFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, // target
    gl.DEPTH_ATTACHMENT, // attachment point
    gl.TEXTURE_2D, // texture target
    this.lightDepthTexture, // texture
    0
  ); // mip level
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // create a color texture of the same size as the depth texture
  // see article why this is needed_
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
  // attach it to the framebuffer
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, // target
    gl.COLOR_ATTACHMENT0, // attachment point
    gl.TEXTURE_2D, // texture target
    this.unusedTexture, // texture
    0
  ); // mip level
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

export function render_scene(
  context,
  program_state,
  shadow_pass,
  draw_light_source = false,
  draw_shadow = false,
  t,
  dt
) {
  // shadow_pass: true if this is the second pass that draw the shadow.
  // draw_light_source: true if we want to draw the light source.
  // draw_shadow: true if we want to draw the shadow

  let light_position = this.light_position;
  let light_color = this.light_color;
  let model_transform = Mat4.identity();

  program_state.draw_shadow = draw_shadow;

  if (draw_light_source && shadow_pass) {
    this.shapes.sphere.draw(
      context,
      program_state,
      Mat4.translation(
        light_position[0],
        light_position[1],
        light_position[2]
      ).times(Mat4.scale(0.5, 0.5, 0.5)),
      this.light_src.override({ color: light_color })
    );
  }

  for (let i = 0; i < 20; i++) {
    // this.drawTree(
    //     context,
    //     program_state,
    //     model_trans_tree.times(this.tree_locations[i]),
    //     model_trans_wood.times(this.tree_locations[i]),
    //     60,
    //     -10
    // );
  }

  // Draws the Tetris grid
  // for (let i = 0; i < 22; i++) {
  //   for (let j = 0; j < 11; j++) {
  //     this.shapes.outline.draw(
  //       context,
  //       program_state,
  //       model_transform,
  //       this.white,
  //       "LINES"
  //     );
  //     model_transform = model_transform.times(Mat4.translation(2, 0, 0));
  //   }
  //   model_transform = Mat4.identity().times(Mat4.translation(0, 2 * i, 0));
  // }

  if (!this.rotation) {
    if (!this.last_pause_time) {
      this.last_pause_time = t;
    }
    this.paused_time += t - this.last_pause_time;
    this.last_pause_time = t;
  } else {
    this.last_pause_time = 0; // Reset the pause time when rotation is enabled
  }

  // Calculate the adjusted game time and rotation time
  this.game_time = t - this.paused_time;
  if (this.rotation) {
    this.rotation_time = this.game_time;
  }

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
        let model_transform = Mat4.translation(x, y, 0);
        this.shapes.cube.draw(
          context,
          program_state,
          model_transform,
          this.grid[y][x]
        );
      }
    }
  }

  let model_trans_rock = Mat4.translation(5, 1, 0);
  let model_trans_ground = Mat4.translation(0, -4, 0).times(
    Mat4.scale(1000, 0.5, 1000)
  );
  let model_trans_sky = Mat4.translation(0, 0, -300).times(
    Mat4.scale(1000, 1000, 1)
  );
  let model_trans_frame = Mat4.translation(10, 20, 0);
  this.shapes.rock.draw(
    context,
    program_state,
    model_trans_rock,
    shadow_pass ? this.floor : this.pure
  );
  this.shapes.cube.draw(
    context,
    program_state,
    model_trans_ground,
    shadow_pass ? this.ground : this.pure
  );
  this.shapes.cube.draw(
    context,
    program_state,
    model_trans_sky,
    shadow_pass ? this.sky : this.pure
  );
  this.shapes.frame.draw(
    context,
    program_state,
    model_trans_frame,
    shadow_pass ? this.frame : this.pure
  );
  this.draw_score(context, program_state);
}


export function drawTree(context, program_state, wood_transform, tree_transform, x, z) {
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