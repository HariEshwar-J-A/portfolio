import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Points, PointMaterial, Stars, Environment } from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Attractor parameters
const LORENZ_PARAMS = { rho: 28, sigma: 10, beta: 8 / 3 };
const PARTICLE_COUNT = 50000;
const PARTICLE_SIZE = 0.015;

// Generate initial particle positions
function generateParticles() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
  }
  return positions;
}

// Lorenz attractor function
function updateParticles(positions: Float32Array, dt: number) {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const x = positions[i3];
    const y = positions[i3 + 1];
    const z = positions[i3 + 2];

    positions[i3] += (LORENZ_PARAMS.sigma * (y - x)) * dt;
    positions[i3 + 1] += (x * (LORENZ_PARAMS.rho - z) - y) * dt;
    positions[i3 + 2] += (x * y - LORENZ_PARAMS.beta * z) * dt;
  }
}

// Particles component
const ParticleSystem = () => {
  const { theme } = useTheme();
  const points = useRef<THREE.Points>(null);
  const [positions] = useState(() => generateParticles());
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { rotation } = useSpring({
    rotation: [mouse.y * Math.PI * 0.1, mouse.x * Math.PI * 0.1, 0],
    config: { mass: 1, tension: 170, friction: 26 }
  });

  useFrame((state, dt) => {
    if (!points.current) return;
    updateParticles(positions, dt * 0.1);
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <animated.group rotation={rotation}>
      <Points ref={points} positions={positions} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={PARTICLE_SIZE}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color={theme.mode === 'dark' ? '#334155' : '#f1f5f9'}
        />
      </Points>
    </animated.group>
  );
};

// Earth component with atmosphere
const Earth = ({ isDark }: { isDark: boolean }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  // Load Earth textures
  const [earthMap, bumpMap, cloudsMap, specularMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
  ]);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      {/* Earth base */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={new THREE.Color('#909090')}
          shininess={5}
        />
      </mesh>
      
      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={1.003}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.01}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          transparent={true}
          opacity={0.2}
          color={isDark ? '#4B5563' : '#60A5FA'}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Orbiting planets
const Planets = ({ isDark }: { isDark: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const planets = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      radius: (i + 2) * 1.5,
      speed: 0.2 / (i + 1),
      size: 0.2 - i * 0.02,
      color: isDark ? '#94a3b8' : '#fbbf24'
    }));
  }, [isDark]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    planets.forEach((planet, i) => {
      const child = group.current!.children[i];
      const angle = clock.getElapsedTime() * planet.speed;
      child.position.x = Math.cos(angle) * planet.radius;
      child.position.z = Math.sin(angle) * planet.radius;
    });
  });

  return (
    <group ref={group}>
      {planets.map((planet, i) => (
        <mesh key={i} position={[planet.radius, 0, 0]}>
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshStandardMaterial
            color={planet.color}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Scene component
const Scene = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <>
      {/* Dynamic lighting based on theme */}
      <ambientLight intensity={isDark ? 0.1 : 0.4} />
      <pointLight 
        position={[50, 20, 20]} 
        intensity={isDark ? 0.5 : 2}
        color={isDark ? '#94A3B8' : '#FCD34D'}
      />
      
      {/* Starry background */}
      <Stars 
        radius={300} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade={true}
        speed={0.5}
      />
      
      {/* Scene environment */}
      <Environment preset={isDark ? "night" : "sunset"} />
      
      <ParticleSystem />
      <Earth isDark={isDark} />
      <Planets isDark={isDark} />
    </>
  );
};

const ThreeScene: React.FC = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ 
        opacity: 0.8,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 5, 20],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: true
        }}
        style={{ 
          position: 'absolute',
          pointerEvents: 'none',
          background: theme.mode === 'dark' ? '#0F172A' : '#F8FAFC'
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeScene;