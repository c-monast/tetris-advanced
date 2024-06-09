import { tiny } from "./common.js";
const {
  Mat4,
} = tiny;

import {
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

  let light_position = this.light_position;
  let light_color = this.light_color;
  let model_transform = Mat4.identity();

  program_state.draw_shadow = draw_shadow;

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


  // ** HERE ARE ALL THE MAIN OBJECT DRAWS FOR THE SCENE ** //
  let model_trans_dish = Mat4.identity();
  let model_trans_stars = Mat4.identity();
  let model_trans_ring = Mat4.identity();
  let model_trans_edge = Mat4.identity();
  let model_trans_rock = Mat4.identity();
  let model_trans_mountain = Mat4.identity();
  let model_trans_cylinder = Mat4.rotation(Math.PI/2,1,0,0);
  let model_trans_ground = Mat4.translation(0, -3.5, 0).times(
    Mat4.scale(1000, 0.5, 1000)
  );
  let model_trans_sky = Mat4.translation(0, 0, -300).times(
    Mat4.scale(1000, 1000, 1)
  );
  let model_trans_frame = Mat4.translation(13, 20, 0);

  // Draw random stars
  for (var i = 0; i < 500; i++) {
    let star_scale = Mat4.scale(0.5, 0.5, 0.5); // Scale down the star
    this.shapes.sphere.draw(context, program_state, this.starMatrices[i].times(star_scale), this.light_src.override({ color: light_color }));
  }

  for (var i = 0; i < 200; i++) {
    let star_scale = Mat4.scale(1.1, 1.1, 1.1); // Scale down the star
    this.shapes.sphere.draw(context, program_state, this.starMatrices[i].times(star_scale), this.light_src.override({ color: light_color }));
  }

  for (var i = 0; i < 200; i++) {
    let star_scale = Mat4.scale(1.1, 1.1, 1.1); // Scale down the star
    this.shapes.sphere.draw(context, program_state, this.starMatrices2[i], this.light_src.override({ color: light_color }));
  }




  // ** MANIPULATIONS ** //
  model_trans_rock = model_trans_rock.times(Mat4.rotation(t / 3000, 0, 1, .5))
    .times(Mat4.translation(0, 100, -450))
    .times(Mat4.scale(4,4,4));

  model_trans_edge = model_trans_edge.times(Mat4.translation(0, -200, 0))
                                     .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
                                     .times(Mat4.scale(800,800, 800))


  model_trans_mountain = model_trans_mountain.times(Mat4.translation(120, 0, -250))
                                             .times(Mat4.rotation(Math.PI / -2, 1, 0, 0))
                                             .times(Mat4.scale(100, 100, 8));

  model_trans_ring = model_trans_ring.times(Mat4.translation(120, 5, -250))
                                     .times(Mat4.rotation(Math.PI / -2, 1, 0, 0))
                                     .times(Mat4.scale(10, 10 , 6));


  // This block draws the energy tower
  this.shapes.cylinder.draw(
    context, 
    program_state, 
    model_trans_cylinder.times(Mat4.translation(-50,-50,0)).times(Mat4.scale(2,2,6)), 
    shadow_pass ? this.floor : this.pure 
  );
  this.shapes.cylinder.draw(
    context, 
    program_state, 
    model_trans_cylinder.times(Mat4.translation(-50,-50,-6)).times(Mat4.scale(1.5,1.5,5)), 
    shadow_pass ? this.floor : this.pure 
  );
  this.shapes.ring.draw(
    context,
    program_state,
    model_trans_cylinder.times(Mat4.translation(-50,-50, -3)).times(Mat4.scale(2,2,2)),
    shadow_pass ? this.materials.grey: this.pure
  );
  this.shapes.ring.draw(
    context,
    program_state,
    model_trans_cylinder.times(Mat4.translation(-50,-50, -8.4)).times(Mat4.scale(1.5,1.5,2)),
    shadow_pass ? this.materials.grey: this.pure
  );
  this.shapes.cylinder.draw(
    context, 
    program_state, 
    model_trans_cylinder.times(Mat4.translation(-50,-50,-14)).times(Mat4.scale(.7,.7,10)), 
    shadow_pass ? this.floor : this.pure 
  );
  this.shapes.ring.draw(
    context,
    program_state,
    model_trans_cylinder.times(Mat4.translation(-50,-50, -15.2)).times(Mat4.scale(1.3,1.3,1.1)),
    shadow_pass ? this.materials.grey: this.pure
  );
  this.shapes.ring.draw(
    context,
    program_state,
    model_trans_cylinder.times(Mat4.translation(-50,-50, -16.5)).times(Mat4.scale(3,3,1.2)),
    shadow_pass ? this.materials.grey: this.pure
  );
  this.shapes.ring.draw(
    context,
    program_state,
    model_trans_cylinder.times(Mat4.translation(-50,-50, -17.8)).times(Mat4.scale(1.3,1.3,1.1)),
    shadow_pass ? this.materials.grey: this.pure
  );

  this.shapes.cylinder.draw(
    context, 
    program_state, 
    model_trans_cylinder.times(Mat4.translation(-44, -56,0)).times(Mat4.rotation(Math.PI / 2, 1, 1, 0)).times(Mat4.scale(.5,.5,14)), 
    shadow_pass ? this.floor : this.pure 
  );
  this.shapes.cylinder.draw(
    context, 
    program_state, 
    model_trans_cylinder.times(Mat4.translation(-44, -56,2)).times(Mat4.scale(.5,.5,4)), 
    shadow_pass ? this.floor : this.pure 
  );
  this.shapes.cube.draw(
    context, 
    program_state, 
    model_trans_cylinder.times(Mat4.translation(-44, -56,0)).times(Mat4.rotation(Math.PI/4,0,0,1)).times(Mat4.scale(.7,.7,.7)), 
    shadow_pass ? this.materials.grey : this.pure 
  );
  this.shapes.cube.draw(
    context, 
    program_state, 
    model_trans_cylinder.times(Mat4.translation(-38, -62,0)).times(Mat4.rotation(Math.PI/4,0,0,1)).times(Mat4.scale(4,4,6)), 
    shadow_pass ? this.floor : this.pure 
  );

  // This draws the mountain in the background
  this.shapes.cone.draw(
    context, 
    program_state, 
    model_trans_mountain, 
    shadow_pass ? this.stone.override({ ambient:.1 }) : this.pure
  );
  this.shapes.ring.draw(
    context, 
    program_state, 
    model_trans_ring, 
    shadow_pass ? this.stone.override({ ambient:.1 }) : this.pure
  );

  // Draw the satellite dish
  this.shapes.cone.draw(
    context, 
    program_state, 
    model_trans_dish.times(Mat4.translation(-38, 8.8,-61.2))
                    .times(Mat4.rotation(Math.PI / 4, 1, 0 ,0))
                    .times(Mat4.scale(4,4,1)),
    shadow_pass ? this.floor : this.pure 
  );
  this.shapes.cube.draw(
    context, 
    program_state, 
    model_trans_dish.times(Mat4.translation(-39, 7,-60))
                    .times(Mat4.rotation(Math.PI / -4, 1, 0 ,1))
                    .times(Mat4.scale(.2,2,.2)), 
    shadow_pass ? this.materials.grey : this.pure 
  );
  this.shapes.cube.draw(
    context, 
    program_state, 
    model_trans_dish.times(Mat4.translation(-38, 7.3,-60))
                    .times(Mat4.rotation(Math.PI / -4, 1, 0 ,0))
                    .times(Mat4.scale(.2,4,.2)), 
    shadow_pass ? this.materials.grey : this.pure 
  );
  this.shapes.cube.draw(
    context, 
    program_state, 
    model_trans_dish.times(Mat4.translation(-38, 10.127,-62.55))
                    .times(Mat4.rotation(Math.PI / -4, 1, 0 ,0))
                    .times(Mat4.scale(.2,.2,.3)), 
    shadow_pass ? this.materials.grey : this.pure 
  );
  this.shapes.cube.draw(
    context, 
    program_state, 
    model_trans_dish.times(Mat4.translation(-37, 7,-60))
                    .times(Mat4.rotation(Math.PI / 4, -1, 0,1))
                    .times(Mat4.scale(.2,2,.2)), 
    shadow_pass ? this.materials.grey : this.pure 
  );
  this.shapes.cube.draw(
    context, 
    program_state, 
    model_trans_dish.times(Mat4.translation(-38, 6,-60.8))
                    .times(Mat4.scale(.2,3,.2)), 
    shadow_pass ? this.materials.grey : this.pure 
  );


  // Draw the Earth
  model_trans_stars = model_trans_stars.times(Mat4.translation(0,100,-420))                                   
  this.shapes.sphere.draw(
    context, 
    program_state, 
    model_trans_stars, 
    this.light_src.override({ color: light_color })
  );

  // Draw the mountains in the back
  this.shapes.torus.draw(
    context,
    program_state,
    model_trans_edge,
    shadow_pass ? this.edge : this.pure
  );
  this.shapes.rock.draw(
    context,
    program_state,
    model_trans_rock,
    shadow_pass ? this.floor : this.pure //this.light_src.override({ color: light_color })
  );
  this.shapes.ground.draw(
    context,
    program_state,
    model_trans_ground,
    shadow_pass ? this.ground : this.pure
  );

  this.shapes.frame.draw(
    context,
    program_state,
    model_trans_frame,
    shadow_pass ? this.stone : this.pure
  );
  this.draw_score(context, program_state);
}