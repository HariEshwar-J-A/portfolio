import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sphere, 
  Stars, 
  ScrollControls,
  Scroll,
  Environment,
  Cloud
} from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import * as THREE from 'three';

// Rocket component
const Rocket = ({ position }: { position: [number, number, number] }) => {
  const rocketRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (rocketRef.current) {
      // Add subtle hover animation
      rocketRef.current.position.y += Math.sin(clock.getElapsedTime() * 2) * 0.001;
    }
  });
  
  return (
    <group ref={rocketRef} position={position}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 4, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Fins */}
      {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((rotation, i) => (
        <mesh key={i} position={[0, -1.5, 0]} rotation={[0, rotation, 0]}>
          <boxGeometry args={[0.1, 1, 1]} />
          <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

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
          opacity={1}
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

// Scene component that handles animations
const Scene = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { camera } = useThree();
  const rocketRef = useRef<THREE.Group>(null);

  const onScroll = (e: { scroll: { current: number } }) => {
    setScrollProgress(e.scroll.current);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateCameraPosition = (progress: number): [number, number, number] => {
    if (progress < 0.3) {
      // Initial phase: On Earth, looking at rocket
      return [
        THREE.MathUtils.lerp(5, 10, progress / 0.3),
        THREE.MathUtils.lerp(2, 5, progress / 0.3),
        THREE.MathUtils.lerp(10, 15, progress / 0.3)
      ];
    } else if (progress < 0.7) {
      // Middle phase: Following rocket through space
      const t = (progress - 0.3) / 0.4;
      return [
        THREE.MathUtils.lerp(10, 15, t),
        THREE.MathUtils.lerp(5, 20, t),
        THREE.MathUtils.lerp(15, 5, t)
      ];
    } else {
      // Final phase: Approaching moon
      const t = (progress - 0.7) / 0.3;
      return [
        THREE.MathUtils.lerp(15, 8, t),
        THREE.MathUtils.lerp(20, 25, t),
        THREE.MathUtils.lerp(5, 0, t)
      ];
    }
  };

  const calculateRocketPosition = (progress: number): [number, number, number] => {
    if (progress < 0.3) {
      // On Earth's surface
      return [
        THREE.MathUtils.lerp(0, 2, progress / 0.3),
        THREE.MathUtils.lerp(1, 3, progress / 0.3),
        THREE.MathUtils.lerp(0, 5, progress / 0.3)
      ];
    } else if (progress < 0.7) {
      // Space journey
      const t = (progress - 0.3) / 0.4;
      return [
        THREE.MathUtils.lerp(2, 5, t),
        THREE.MathUtils.lerp(3, 18, t),
        THREE.MathUtils.lerp(5, 0, t)
      ];
    } else {
      // Moon approach
      const t = (progress - 0.7) / 0.3;
      return [
        THREE.MathUtils.lerp(5, 5, t),
        THREE.MathUtils.lerp(18, 22, t),
        THREE.MathUtils.lerp(0, -3, t)
      ];
    }
  };

  useFrame(() => {
    if (!isMounted) return;
    
    const lerpFactor = 0.05; // Smoother transition

    // Calculate camera and rocket positions
    const [camX, camY, camZ] = calculateCameraPosition(scrollProgress);
    const [rocketX, rocketY, rocketZ] = calculateRocketPosition(scrollProgress);
    
    // Smooth camera movement
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, lerpFactor);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, lerpFactor);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, lerpFactor);
    
    // Make camera look at rocket
    camera.lookAt(rocketX, rocketY, rocketZ);
  });

  const earthPosition = useMemo(() => {
    return [0, 0, 0] as [number, number, number];
  }, []);

  const moonPosition = useMemo(() => {
    return [5, 25, -5] as [number, number, number];
  }, []);

  return (
    <>
      <ScrollControls pages={3} damping={0.1}>
        <Scroll onScroll={onScroll}>
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
          
          <group position={earthPosition}>
            <Earth scale={2} />
          </group>
          
          <group position={moonPosition}>
            <Moon />
          </group>

          <Rocket position={calculateRocketPosition(scrollProgress)} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Environment preset="sunset" />
          
          {/* Atmospheric effects */}
          <Cloud opacity={0.5} speed={0.4} width={20} depth={1.5} segments={20} />
        </Scroll>
      </ScrollControls>
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
        opacity: 0.6,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ antialias: true }}
        linear
        style={{ 
          position: 'absolute',
          pointerEvents: 'none'
        }}
        frameloop="always"
        dpr={window.devicePixelRatio}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeScene;