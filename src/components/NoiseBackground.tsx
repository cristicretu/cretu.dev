'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, Suspense, useEffect } from 'react';
import * as THREE from 'three';

// Get persisted time from sessionStorage
const getPersistedTime = () => {
  if (typeof window === 'undefined') return 0;
  const stored = sessionStorage.getItem('noise-time');
  return stored ? parseFloat(stored) : 0;
};

const fragmentShader = `
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float isDark;

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Classic Perlin noise
float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

const int OCTAVES = 6;

float fbm(vec2 p) {
  float value = -0.2;
  float amplitude = 1.0;
  float frequency = 2.0;
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * abs(cnoise(p));
    p *= frequency;
    amplitude *= 0.4;
  }
  return value;
}

float pattern(vec2 p, float t) {
  // Swirling movement with slight rotation
  vec2 q = p + t * 0.04;
  vec2 r = p + sin(t * 0.02) * 0.3;
  return fbm(p + fbm(q + fbm(r)));
}

// 8x8 Bayer dithering
float dither8x8(vec2 pos, float val) {
  int x = int(mod(pos.x, 8.0));
  int y = int(mod(pos.y, 8.0));
  int idx = x + y * 8;
  
  float threshold = 0.0;
  if (idx == 0) threshold = 0.015625;
  else if (idx == 1) threshold = 0.515625;
  else if (idx == 2) threshold = 0.140625;
  else if (idx == 3) threshold = 0.640625;
  else if (idx == 4) threshold = 0.046875;
  else if (idx == 5) threshold = 0.546875;
  else if (idx == 6) threshold = 0.171875;
  else if (idx == 7) threshold = 0.671875;
  else if (idx == 8) threshold = 0.765625;
  else if (idx == 9) threshold = 0.265625;
  else if (idx == 10) threshold = 0.890625;
  else if (idx == 11) threshold = 0.390625;
  else if (idx == 12) threshold = 0.796875;
  else if (idx == 13) threshold = 0.296875;
  else if (idx == 14) threshold = 0.921875;
  else if (idx == 15) threshold = 0.421875;
  else if (idx == 16) threshold = 0.203125;
  else if (idx == 17) threshold = 0.703125;
  else if (idx == 18) threshold = 0.078125;
  else if (idx == 19) threshold = 0.578125;
  else if (idx == 20) threshold = 0.234375;
  else if (idx == 21) threshold = 0.734375;
  else if (idx == 22) threshold = 0.109375;
  else if (idx == 23) threshold = 0.609375;
  else if (idx == 24) threshold = 0.953125;
  else if (idx == 25) threshold = 0.453125;
  else if (idx == 26) threshold = 0.828125;
  else if (idx == 27) threshold = 0.328125;
  else if (idx == 28) threshold = 0.984375;
  else if (idx == 29) threshold = 0.484375;
  else if (idx == 30) threshold = 0.859375;
  else if (idx == 31) threshold = 0.359375;
  else if (idx == 32) threshold = 0.0625;
  else if (idx == 33) threshold = 0.5625;
  else if (idx == 34) threshold = 0.1875;
  else if (idx == 35) threshold = 0.6875;
  else if (idx == 36) threshold = 0.03125;
  else if (idx == 37) threshold = 0.53125;
  else if (idx == 38) threshold = 0.15625;
  else if (idx == 39) threshold = 0.65625;
  else if (idx == 40) threshold = 0.8125;
  else if (idx == 41) threshold = 0.3125;
  else if (idx == 42) threshold = 0.9375;
  else if (idx == 43) threshold = 0.4375;
  else if (idx == 44) threshold = 0.78125;
  else if (idx == 45) threshold = 0.28125;
  else if (idx == 46) threshold = 0.90625;
  else if (idx == 47) threshold = 0.40625;
  else if (idx == 48) threshold = 0.25;
  else if (idx == 49) threshold = 0.75;
  else if (idx == 50) threshold = 0.125;
  else if (idx == 51) threshold = 0.625;
  else if (idx == 52) threshold = 0.21875;
  else if (idx == 53) threshold = 0.71875;
  else if (idx == 54) threshold = 0.09375;
  else if (idx == 55) threshold = 0.59375;
  else if (idx == 56) threshold = 1.0;
  else if (idx == 57) threshold = 0.5;
  else if (idx == 58) threshold = 0.875;
  else if (idx == 59) threshold = 0.375;
  else if (idx == 60) threshold = 0.96875;
  else if (idx == 61) threshold = 0.46875;
  else if (idx == 62) threshold = 0.84375;
  else if (idx == 63) threshold = 0.34375;
  
  return val > threshold ? 1.0 : 0.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 pos = uv - 0.5;
  pos.x *= resolution.x / resolution.y;
  
  float n = pattern(pos * 2.0, time);
  
  // Pixelate for retro feel
  vec2 pixelPos = floor(gl_FragCoord.xy / 2.0) * 2.0;
  float dithered = dither8x8(pixelPos, n);
  
  vec3 col;
  if (isDark > 0.5) {
    vec3 dark = vec3(0.035);
    vec3 light = vec3(0.1);
    col = mix(dark, light, dithered);
  } else {
    vec3 light = vec3(0.98);
    vec3 dark = vec3(0.86);
    col = mix(light, dark, dithered);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function Scene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const startTime = useRef(getPersistedTime());

  const uniforms = useMemo(
    () => ({
      time: { value: startTime.current },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      isDark: { value: 1.0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      const currentTime = startTime.current + state.clock.getElapsedTime();
      material.uniforms.time.value = currentTime;
      material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      material.uniforms.isDark.value = document.documentElement.classList.contains('dark') ? 1.0 : 0.0;

      // Persist time every second
      if (Math.floor(currentTime) !== Math.floor(currentTime - state.clock.getDelta())) {
        sessionStorage.setItem('noise-time', currentTime.toString());
      }
    }
  });

  useEffect(() => {
    return () => {
      const material = meshRef.current?.material as THREE.ShaderMaterial;
      if (material) {
        sessionStorage.setItem('noise-time', material.uniforms.time.value.toString());
      }
    };
  }, []);

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function NoiseBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={1}
        camera={{ position: [0, 0, 1] }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: false, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
