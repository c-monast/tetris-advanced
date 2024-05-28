import { tiny } from "./common.js";

const { Shader, color, vec4, vec3, Matrix } = tiny;

export class Gouraud_Shader extends Shader {
  constructor(num_lights = 2) {
    super();
    this.num_lights = num_lights;
  }

  shared_glsl_code() {
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

        varying vec3 N, vertex_worldspace;
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
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
    return (
        this.shared_glsl_code() +
        `
            attribute vec3 position, normal;                            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            } `
    );
  }

  fragment_glsl_code() {
    return (
        this.shared_glsl_code() +
        `
            void main(){                                                           
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `
    );
  }

  send_material(gl, gpu, material) {
    gl.uniform4fv(gpu.shape_color, material.color);
    gl.uniform1f(gpu.ambient, material.ambient);
    gl.uniform1f(gpu.diffusivity, material.diffusivity);
    gl.uniform1f(gpu.specularity, material.specularity);
    gl.uniform1f(gpu.smoothness, material.smoothness);
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
    const O = vec4(0, 0, 0, 1),
        camera_center = gpu_state.camera_transform.times(O).to3();
    gl.uniform3fv(gpu.camera_center, camera_center);
    const squared_scale = model_transform
        .reduce((acc, r) => {
          return acc.plus(vec4(...r).times_pairwise(r));
        }, vec4(0, 0, 0, 0))
        .to3();
    gl.uniform3fv(gpu.squared_scale, squared_scale);
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