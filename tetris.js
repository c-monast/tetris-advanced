import {defs, tiny} from './common.js';
// Pull these names into this module's scope for convenience:
const {vec3, vec4, vec, color, hex_color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
    Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './shader.js'
import * as logic from "./logic.js";

// The scene
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
            "sphere": new Subdivision_Sphere(6),
            "cube": new Cube(),
            "rock": new Subdivision_Sphere(1),
            "frame": new defs.RectangularFrame(),
            "pyramid": new defs.Pyramid(),
            "outline": new defs.Cube_Outline()
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
        }


        // For the teapot
        this.stars = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.5, .5, .5, 1),
            ambient: .4, diffusivity: .5, specularity: .5,
            color_texture: new Texture("assets/stars.png"),
            light_depth_texture: null

        });
        // For the floor or other plain objects
        this.floor = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(1, 1, 1, 1), ambient: .3, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
            color_texture: null,
            light_depth_texture: null
        })
        // For the first pass
        this.pure = new Material(new Color_Phong_Shader(), {
        })
        // For light source
        this.light_src = new Material(new Phong_Shader(), {
            color: color(1, 1, 1, 1), ambient: 1, diffusivity: 0, specularity: 0
        });
        // For depth texture display
        this.depth_tex =  new Material(new Depth_Texture_Shader_2D(), {
            color: color(0, 0, .0, 1),
            ambient: 1, diffusivity: 0, specularity: 0, texture: null
        });
        this.ground = new Material(new Shadow_Textured_Phong_Shader(1), {
            ambient: 0.8,
            specularity: 0.3,
            diffusivity: 0.3,
            color: color(.15, .38, .128, 1),
            color_texture: null,
        });
        this.sky = new Material(new Color_Phong_Shader(), {
            ambient: 0.9,
            specularity: 0.3,
            diffusivity: 0.001,
            color: color(.527, .805, .917, 1),
            color_texture: null,
        });
        this.frame = new Material(new Shadow_Textured_Phong_Shader(1), {
            ambient: 0.9,
            specularity: 0.3,
            diffusivity: 0.001,
            color: color(.5, .5, .5, 1),
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

        this.tree_locations = [];
        for (let i = 0; i < 20; i++) {
            while (true) {
                let x = Math.random() * -110;
                let z = Math.random() * -140;
                if (z <= 10 && z >= -10 && x <= -4 && x >= -3 && z !== 0) {
                    continue;
                }
                this.tree_locations.push(Mat4.translation(x, -2, z));
                break;
            }
        }

        this.grid = Array.from({ length: 20 }, () => Array(10).fill(null));
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
        this.start_game_loop();
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
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
        this.stars.light_depth_texture = this.light_depth_texture
        this.floor.light_depth_texture = this.light_depth_texture

        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
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
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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

    render_scene(context, program_state, shadow_pass, draw_light_source=false, draw_shadow=false, t, dt) {
        // shadow_pass: true if this is the second pass that draw the shadow.
        // draw_light_source: true if we want to draw the light source.
        // draw_shadow: true if we want to draw the shadow

        let light_position = this.light_position;
        let light_color = this.light_color;
        let model_transform = Mat4.identity();

        program_state.draw_shadow = draw_shadow;

        if (draw_light_source && shadow_pass) {
            this.shapes.sphere.draw(context, program_state,
                Mat4.translation(light_position[0], light_position[1], light_position[2]).times(Mat4.scale(.5,.5,.5)),
                this.light_src.override({color: light_color}));
        }
        //
        // for (let i of [-1, 1]) { // Spin the 3D model shapes as well.
        //     const model_transform = Mat4.translation(2 * i, 3, 0)
        //         .times(Mat4.rotation(t / 1000, -1, 2, 0))
        //         .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0));
        //     this.shapes.teapot.draw(context, program_state, model_transform, shadow_pass? this.stars : this.pure);
        // }

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



        let model_trans_rock = Mat4.translation(5, 1, 0);
        let model_trans_ground = Mat4.translation(0,-4,0).times(Mat4.scale(1000,.5,1000));
        let model_trans_sky = Mat4.translation(0, 0, -300).times(Mat4.scale(1000, 1000, 1));
        let model_trans_frame = Mat4.translation(10, 20, 0);
        this.shapes.rock.draw(context, program_state, model_trans_rock, shadow_pass? this.floor : this.pure);
        this.shapes.cube.draw(context, program_state, model_trans_ground, shadow_pass? this.ground : this.pure)
        this.shapes.cube.draw(context, program_state, model_trans_sky, shadow_pass? this.sky:this.pure);
        this.shapes.frame.draw(context, program_state, model_trans_frame, shadow_pass? this.frame : this.pure);
        this.draw_score(context, program_state);



    }

    display(context, program_state) {
        const t = program_state.animation_time;
        const dt = program_state.animation_delta_time / 1000;
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.look_at(
                vec3(11, 20, 60),
                vec3(11, 20, 0),
                vec3(0, 1, 0)
            )); // Locate the camera here
        }

        // The position of the light
        this.light_position = Mat4.rotation(t / 1500, 0, 1, 0).times(vec4(4, 6, 0, 1));
        // The color of the light
        this.light_color = color(
            //0.667 + Math.sin(t/500) / 3,
            // 0.667 + Math.sin(t/1500) / 3,
            // 0.667 + Math.sin(t/3500) / 3,
            1,1,1,1
        );

        // This is a rough target of the light.
        // Although the light is point light, we need a target to set the POV of the light
        this.light_view_target = vec4(0, 0, 0, 1);
        this.light_field_of_view = 110 * Math.PI / 180; // 130 degree

        program_state.lights = [new Light(this.light_position, this.light_color, 1000000000)];

        // Step 1: set the perspective and camera to the POV of light
        const light_view_mat = Mat4.look_at(
            vec3(this.light_position[0], this.light_position[1], this.light_position[2]),
            vec3(this.light_view_target[0], this.light_view_target[1], this.light_view_target[2]),
            vec3(0, 1, 0), // assume the light to target will have a up dir of +y, maybe need to change according to your case
        );
        const light_proj_mat = Mat4.perspective(this.light_field_of_view, 1, 0.5, 500);
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
        this.render_scene(context, program_state, false,false, false, t, dt);

        // Step 2: unbind, draw to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        program_state.view_mat = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.5, 500);
        this.render_scene(context, program_state, true,true, true, t, dt);

        // // Step 3: display the textures
        // this.shapes.square_2d.draw(context, program_state,
        //     Mat4.translation(-.99, .08, 0).times(
        //     Mat4.scale(0.5, 0.5 * gl.canvas.width / gl.canvas.height, 1)
        //     ),
        //     this.depth_tex.override({texture: this.lightDepthTexture})
        // );
    }

    // show_explanation(document_element) {
    //     document_element.innerHTML += "<p>This demo loads an external 3D model file of a teapot.  It uses a condensed version of the \"webgl-obj-loader.js\" "
    //         + "open source library, though this version is not guaranteed to be complete and may not handle some .OBJ files.  It is contained in the class \"Shape_From_File\". "
    //         + "</p><p>One of these teapots is lit with bump mapping.  Can you tell which one?</p>";
    // }
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

