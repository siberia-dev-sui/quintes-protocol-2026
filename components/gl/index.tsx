import { Perf } from "r3f-perf";
import { Effects } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { useMemo } from "react";
import * as THREE from "three";
import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignetteShader";

export const GL = ({ hovering, isDark = true }: { hovering: boolean; isDark?: boolean }) => {
  const {
    speed,
    focus,
    aperture,
    size,
    noiseScale,
    noiseIntensity,
    timeScale,
    pointSize,
    opacity,
    planeScale,
    vignetteDarkness,
    vignetteOffset,
    useManualTime,
    manualTime,
  } = useControls("Particle System", {
    speed: { value: 1.0, min: 0, max: 2, step: 0.01 },
    noiseScale: { value: 0.6, min: 0.1, max: 5, step: 0.1 },
    noiseIntensity: { value: 0.52, min: 0, max: 2, step: 0.01 },
    timeScale: { value: 1, min: 0, max: 2, step: 0.01 },
    focus: { value: 3.8, min: 0.1, max: 20, step: 0.1 },
    aperture: { value: 1.79, min: 0, max: 2, step: 0.01 },
    pointSize: { value: 10.0, min: 0.1, max: 10, step: 0.1 },
    opacity: { value: 0.8, min: 0, max: 1, step: 0.01 },
    planeScale: { value: 10.0, min: 0.1, max: 10, step: 0.1 },
    size: {
      value: 512,
      options: [256, 512, 1024],
    },
    showDebugPlane: { value: false },
    vignetteDarkness: { value: 1.5, min: 0, max: 2, step: 0.1 },
    vignetteOffset: { value: 0.4, min: 0, max: 2, step: 0.1 },
    useManualTime: { value: false },
    manualTime: { value: 0, min: 0, max: 50, step: 0.01 },
  });

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
          useManualTime={useManualTime}
          manualTime={manualTime}
          introspect={hovering}
          particleColor={particleColor}
          isDark={isDark}
        />
        {/* Vignette only in dark mode — in light mode it creates a black halo */}
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
