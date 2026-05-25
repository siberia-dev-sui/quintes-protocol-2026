import { Effects } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignetteShader";

export const PARTICLE_CONFIG: {
  speed: number; focus: number; aperture: number;
  size: 256 | 512 | 1024;
  noiseScale: number; noiseIntensity: number; timeScale: number;
  pointSize: number; opacity: number; planeScale: number;
  vignetteDarkness: number; vignetteOffset: number;
} = {
  speed: 1.0,
  focus: 3.8,
  aperture: 1.79,
  size: 512,
  noiseScale: 0.6,
  noiseIntensity: 0.52,
  timeScale: 1.0,
  pointSize: 10.0,
  opacity: 0.8,
  planeScale: 10.0,
  vignetteDarkness: 1.5,
  vignetteOffset: 0.4,
};

export const GL = ({ hovering, isDark = true }: { hovering: boolean; isDark?: boolean }) => {
  const {
    speed, focus, aperture, size, noiseScale, noiseIntensity,
    timeScale, pointSize, opacity, planeScale, vignetteDarkness, vignetteOffset,
  } = PARTICLE_CONFIG;

  const bgColor = isDark ? "#000000" : "#f8f7f2";
  const particleColor = useMemo(
    () => isDark ? new THREE.Color(1, 1, 1) : new THREE.Color(0.08, 0.08, 0.08),
    [isDark]
  );

  return (
    <div id="webgl">
      <Canvas
        camera={{
          position: [1.2629783123314589, 2.664606471394044, -1.8178993743288914],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={[bgColor]} />
        <Particles
          speed={speed}
          aperture={aperture}
          focus={focus}
          size={size}
          noiseScale={noiseScale}
          noiseIntensity={noiseIntensity}
          timeScale={timeScale}
          pointSize={pointSize}
          opacity={opacity}
          planeScale={planeScale}
          useManualTime={false}
          manualTime={0}
          introspect={hovering}
          particleColor={particleColor}
          isDark={isDark}
        />
        {isDark && (
          <Effects multisamping={0} disableGamma>
            <shaderPass
              args={[VignetteShader]}
              uniforms-darkness-value={vignetteDarkness}
              uniforms-offset-value={vignetteOffset}
            />
          </Effects>
        )}
      </Canvas>
    </div>
  );
};
