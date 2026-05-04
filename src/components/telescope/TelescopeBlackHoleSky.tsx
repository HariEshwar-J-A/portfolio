import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Inverted-sphere ray march: simplified Schwarzschild-style bending, analytic-style
 * accretion disk (temperature falloff, differential rotation), procedural starfield.
 * WebGL2-friendly — not identical to WebGPU/TSL path-traced demos but same visual language.
 */
const bhVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPosition = wp.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const bhFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uCameraPos;
uniform vec3 uBHCenter;

varying vec3 vWorldPosition;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 sampleStarfield(vec3 dir) {
  vec3 d = normalize(dir);
  vec3 col = vec3(0.0);
  float neb = 0.0;
  for (int layer = 0; layer < 3; layer++) {
    float s = pow(2.2, float(layer));
    vec3 p = d * (180.0 * s) + float(layer) * 17.3;
    vec3 id = floor(p);
    vec3 f = fract(p) - 0.5;
    vec2 h = vec2(hash21(id.xy + id.z * 0.1), hash21(id.yz + id.x * 0.07 + float(layer)));
    float star = smoothstep(0.22, 0.04, length(f.xy + f.z * 0.35)) * step(0.93, h.x);
    float tw = 0.55 + 0.45 * sin(uTime * 0.7 + h.y * 40.0);
    vec3 tint = mix(vec3(0.75, 0.88, 1.0), vec3(1.0, 0.92, 0.82), h.y);
    col += tint * star * tw * (0.35 / s);
    neb += smoothstep(0.65, 0.0, length(f.xy)) * h.x * 0.04 / s;
  }
  col += vec3(0.08, 0.04, 0.12) * neb;
  return col;
}

vec3 blackbodyApprox(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(vec3(0.35, 0.06, 0.02), vec3(1.0, 0.45, 0.08), smoothstep(0.0, 0.45, t));
  c = mix(c, vec3(1.0, 0.92, 0.75), smoothstep(0.45, 0.75, t));
  c = mix(c, vec3(1.0, 1.0, 1.0), smoothstep(0.75, 1.0, t));
  return c;
}

void main() {
  vec3 roW = uCameraPos;
  vec3 rdW = normalize(vWorldPosition - roW);
  vec3 ro = roW - uBHCenter;
  vec3 rd = rdW;

  float M = 1.15;
  float rs = 2.0 * M;

  vec3 accCol = vec3(0.0);
  float t = 0.04;
  bool eaten = false;

  for (int i = 0; i < 56; i++) {
    vec3 p = ro + rd * t;
    float r = length(p);

    if (r < rs * 1.02) {
      eaten = true;
      break;
    }
    if (r > 42.0) {
      break;
    }

    float y = p.y;
    float rp = length(p.xz);
    if (abs(y) < 0.09 && rp > rs * 1.45 && rp < 11.5) {
      float ang = atan(p.z, p.x);
      float omega = 0.65 * pow(rp, -1.5);
      float phase = ang + uTime * omega * 6.5;
      float streams = 0.5 + 0.5 * sin(phase * 14.0 + rp * 5.0);
      float temp01 = pow(clamp(rp / 11.5, 0.0, 1.0), 0.72);
      float T = pow(rp, -0.72);
      vec3 dcol = blackbodyApprox(clamp(T * 0.35, 0.0, 1.0));
      float mask = smoothstep(rs * 1.45, rs * 1.85, rp) * smoothstep(11.8, 9.0, rp);
      float dop = 0.65 + 0.35 * sin(ang + uTime * 1.8);
      float em = mask * streams * dop * (0.09 + 0.14 * temp01);
      accCol += dcol * em;
    }

    vec3 pull = -2.1 * M * p / (r * r * r + 0.35);
    rd = normalize(rd + pull * 0.19);
    t += 0.16 + r * 0.006;
  }

  vec3 sky = sampleStarfield(rd);
  if (eaten) {
    sky = vec3(0.0);
  }

  float r0 = length(ro);
  float rim = smoothstep(rs * 1.35, rs * 1.05, r0);
  float notEaten = 1.0;
  if (eaten) {
    notEaten = 0.0;
  }
  vec3 ein = vec3(0.15, 0.35, 0.55) * rim * 0.25 * (0.5 + 0.5 * sin(uTime * 0.4)) * notEaten;

  vec3 col = sky + accCol + ein;
  col = pow(col, vec3(0.92));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const TelescopeBlackHoleSky: React.FC<{ center: THREE.Vector3 }> = ({ center }) => {
  const { camera } = useThree();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uCameraPos: { value: new THREE.Vector3() },
          uBHCenter: { value: center.clone() },
        },
        vertexShader: bhVertexShader,
        fragmentShader: bhFragmentShader,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true,
      }),
    [center]
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uCameraPos.value.copy(camera.position);
    material.uniforms.uBHCenter.value.copy(center);
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh frustumCulled={false} renderOrder={-2} scale={[-1, 1, 1]}>
      <sphereGeometry args={[55, 48, 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
