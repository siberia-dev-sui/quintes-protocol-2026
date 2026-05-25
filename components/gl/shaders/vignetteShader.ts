export const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    darkness: { value: 1.0 },
    offset: { value: 1.0 },
    uLightMode: { value: 0.0 }, // 0 = dark (edges→black), 1 = light (edges→white)
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    uniform float uLightMode;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);

      vec2 uv = (vUv - 0.5) * 2.0;
      float dist = dot(uv, uv);

      float vignette = 1.0 - smoothstep(offset, offset + darkness, dist);

      // Dark mode: edges fade to black (multiply).
      // Light mode: edges fade to the bg color (white/cream) — no tunnel.
      vec3 edgeColor = mix(vec3(0.0), vec3(0.941, 0.922, 0.878), uLightMode); // #f0ebe0
      gl_FragColor = vec4(mix(edgeColor, texel.rgb, vignette), texel.a);
    }
  `
};
