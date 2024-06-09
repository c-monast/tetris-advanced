import { defs, tiny } from "./common.js";
import {
  Color_Phong_Shader,
  Shadow_Textured_Phong_Shader,
  Depth_Texture_Shader_2D,
} from "./shader.js";

const { color, hex_color, Material, Texture } = tiny;

const { Phong_Shader, Textured_Phong } = defs;

export class Materials {
  constructor() {
    const commonShaderProps = {
      ambient: 1,
      specularity: 0.3,
      diffusivity: 0.6,
      color_texture: null,
    };

    this.materials = {
      shape: new Material(new defs.Phong_Shader(), {
        ambient: 0.9,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),
      scoreFrame: new Material(new defs.Phong_Shader(), {
        ...commonShaderProps,
        color: hex_color("#ba53ed"),
      }),
      numbers: new Material(new defs.Phong_Shader(), {
        ambient: 0.9,
        diffusivity: 3,
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

    // For the stars texture
    this.materials.stars = new Material(new Shadow_Textured_Phong_Shader(1), {
      color: color(0.5, 0.5, 0.5, 1),
      ambient: 0.4,
      diffusivity: 0.5,
      specularity: 0.5,
      color_texture: new Texture("assets/stars.png"),
      light_depth_texture: null,
    });

    // For the floor or other plain objects
    this.materials.floor = new Material(new Shadow_Textured_Phong_Shader(1), {
      color: color(1, 1, 1, 1),
      ambient: 0.3,
      diffusivity: 0.6,
      specularity: 0.4,
      smoothness: 64,
      color_texture: null,
      light_depth_texture: null,
    });

    // For the first pass
    this.materials.pure = new Material(new Color_Phong_Shader(), {});

    // For light source
    this.materials.light_src = new Material(new Phong_Shader(), {
      color: color(1, 1, 1, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
    });

    // For depth texture display
    this.materials.depth_tex = new Material(new Depth_Texture_Shader_2D(), {
      color: color(0, 0, 0.0, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
      texture: null,
    });

    // Additional materials
    this.materials.ground = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.4,
      specularity: 0.3,
      diffusivity: 0.1,
      color: hex_color("#E9620A"),
      color_texture: null,
      texture: new Texture("assets/stone.jpg", "NEAREST"),
    });

    this.materials.stone = new Material(new Textured_Phong(), {
      ambient: 0.3,
      specularity: 0.1,
      diffusivity: 0.1,
      color: hex_color("#E9620A"),
      texture: new Texture("assets/stone.jpg", "NEAREST"),
      color_texture: null,
    });

    this.materials.sky = new Material(new Color_Phong_Shader(), {
      ambient: 0.9,
      specularity: 0.3,
      diffusivity: 0.001,
      color: color(0.527, 0.805, 0.917, 1),
      color_texture: null,
    });

    this.materials.frame = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.9,
      specularity: 0.3,
      diffusivity: 0.001,
      color: color(0.5, 0.5, 0.5, 1),
      color_texture: null,
    });

    this.materials.white = new Material(new defs.Basic_Shader());

    this.materials.tree = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.8,
      specularity: 0.3,
      diffusivity: 0.03,
      color: hex_color("#14381d"),
    });

    this.materials.wood = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.8,
      specularity: 0.3,
      diffusivity: 0.3,
      color: hex_color("#563232"),
    });

    this.materials.edge = new Material(new Shadow_Textured_Phong_Shader(1), {
      ambient: 0.6,
      specularity: 0.3,
      diffusivity: 0.3,
      color: hex_color("#C85205"),
    });
  }

  getMaterials() {
    return this.materials;
  }
}
