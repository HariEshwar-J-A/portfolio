import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sphere, 
  Stars, 
  useScroll,
  PerspectiveCamera,
  useAnimations,
  Environment,
  Cloud
} from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import * as THREE from 'three';

// Earth component with atmosphere effect
const Earth = ({ scale = 1 }) => {
  const { theme } = useTheme();
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group scale={scale}>
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg')}
          bumpMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg')}
          bumpScale={0.05}
        />
      </Sphere>
      <Sphere args={[1.01, 64, 64]}>
        <meshPhongMaterial
          transparent
          opacity={0.2}
          color={theme.colors.primary}
        />
      </Sphere>
    </group>
  );
};

// Moon component
const Moon = ({ scale = 0.27 }) => {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere ref={moonRef} args={[1, 64, 64]} scale={scale}>
      <meshStandardMaterial
        map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg')}
        roughnessMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg')}
        bumpMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg')}
        bumpScale={0.04}
      />
    </Sphere>
  );
};

// Astronaut component
const Astronaut = ({ position }: { position: [number, number, number] }) => {
  const { theme } = useTheme();
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={0.5}>
      <mesh>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color={theme.colors.primary} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.1} />
      </mesh>
    </group>
  );
};

// Scene component that handles animations
const Scene = () => {
  const { theme } = useTheme();
  const scroll = useScroll();
  const { camera } = useThree();
  const [animationProgress, setAnimationProgress] = useState(0);

  useFrame(() => {
    const scrollOffset = scroll.offset;
    setAnimationProgress(scrollOffset);

    // Camera movement based on scroll
    camera.position.y = -scrollOffset * 20;
    camera.position.z = 10 - scrollOffset * 5;
    camera.lookAt(0, -scrollOffset * 20, 0);
  });

  const earthPosition = useMemo(() => {
    return [0, 0, 0] as [number, number, number];
  }, []);

  const moonPosition = useMemo(() => {
    return [5, 20, -5] as [number, number, number];
  }, []);

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      
      <group position={earthPosition}>
        <Earth scale={3} />
      </group>
      
      <group position={moonPosition}>
        <Moon />
      </group>
      
      <Astronaut position={[0, animationProgress * 15, 5 - animationProgress * 3]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="sunset" />
      
      {/* Add some atmospheric clouds */}
      <Cloud opacity={0.5} speed={0.4} width={20} depth={1.5} segments={20} />
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
        opacity: 0.4,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ antialias: true }}
        style={{ 
          position: 'absolute',
          pointerEvents: 'none'
        }}
        frameloop="always"
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeScene;