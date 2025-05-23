import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { 
  Sphere, 
  Stars, 
  ScrollControls,
  Scroll,
  Environment,
  Cloud,
  Trail
} from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import * as THREE from 'three';
import { useInView } from 'framer-motion';

// Rocket component
const Rocket = ({ position }: { position: [number, number, number] }) => {
  const rocketRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Group>(null);
  
  const flameColors = useMemo(() => ({
    primary: new THREE.Color('#ff4400'),
    secondary: new THREE.Color('#ff8800')
  }), []);
  
  useFrame(({ clock }) => {
    if (rocketRef.current) {
      // Smoother rocket movement
      rocketRef.current.rotation.z = Math.sin(clock.getElapsedTime()) * 0.05;
      rocketRef.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.5) * 0.02;
    }
    if (flameRef.current) {
      // More dynamic flame animation
      flameRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 20) * 0.3;
      flameRef.current.scale.x = 1 + Math.cos(clock.getElapsedTime() * 15) * 0.1;
    }
  });
  
  return (
    <group ref={rocketRef} position={position}>
      <Trail
        width={2}
        length={8}
        color={'#ffffff'}
        attenuation={(t) => Math.pow(t, 1.5)}
      >
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 4, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1} 
        />
      </mesh>
      </Trail>
      {/* Nose cone */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Rocket flame */}
      <group ref={flameRef} position={[0, -2, 0]}>
        <mesh>
          <coneGeometry args={[0.4, 2, 32]} />
          <meshBasicMaterial color={flameColors.primary} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[0.2, 1, 32]} />
          <meshBasicMaterial color={flameColors.secondary} transparent opacity={0.7} />
        </mesh>
      </group>
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
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Load textures only when needed
  const [map, bumpMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group scale={scale}>
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          map={map}
          bumpMap={bumpMap}
          bumpScale={0.05}
        />
      </Sphere>
      <Sphere ref={cloudsRef} args={[1.01, 32, 32]}>
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </Sphere>
      <Sphere args={[1.01, 64, 64]}>
        <meshPhongMaterial
          transparent
          opacity={0.3}
          color={theme.colors.primary}
        />
      </Sphere>
    </group>
  );
};

// Moon component
const Moon = ({ scale = 0.27 }) => {
  const moonRef = useRef<THREE.Mesh>(null);
  const [moonTexture] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg'
  ]);

  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere ref={moonRef} args={[1, 64, 64]} scale={scale}>
      <meshStandardMaterial
        map={moonTexture}
        roughnessMap={moonTexture}
        bumpMap={moonTexture}
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
      const t = THREE.MathUtils.smootherstep(progress, 0, 0.3);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(12, 4, 24),
        new THREE.Vector3(14, 6, 28),
        new THREE.Vector3(16, 8, 32)
      ]);
      const point = curve.getPoint(t);
      return [point.x, point.y, point.z];
    } else if (progress < 0.7) {
      // Middle phase: Following rocket through space
      const t = THREE.MathUtils.smoothstep((progress - 0.3), 0, 0.4);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(10, 6, 24),
        new THREE.Vector3(14, 30, 12),
        new THREE.Vector3(20, 50, 10)
      ]);
      const point = curve.getPoint(t);
      return [point.x, point.y, point.z];
    } else {
      // Final phase: Approaching moon
      const t = THREE.MathUtils.smoothstep((progress - 0.7), 0, 0.3);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(20, 50, 10),
        new THREE.Vector3(16, 56, 4),
        new THREE.Vector3(12, 60, 0)
      ]);
      const point = curve.getPoint(t);
      return [point.x, point.y, point.z];
    }
  };

  const calculateRocketPosition = (progress: number): [number, number, number] => {
    if (progress < 0.3) {
      // On Earth's surface
      const t = THREE.MathUtils.smoothstep(progress, 0, 0.3);
      return [
        THREE.MathUtils.lerp(0, 2, t),
        THREE.MathUtils.lerp(4.2, 8, t),
        THREE.MathUtils.lerp(0, 6, t)
      ];
    } else if (progress < 0.7) {
      // Space journey
      const t = THREE.MathUtils.smoothstep((progress - 0.3), 0, 0.4);
      return [
        THREE.MathUtils.lerp(2, 6, t),
        THREE.MathUtils.lerp(8, 40, t),
        THREE.MathUtils.lerp(6, -4, t)
      ];
    } else {
      // Moon approach
      const t = THREE.MathUtils.smoothstep((progress - 0.7), 0, 0.3);
      return [
        THREE.MathUtils.lerp(6, 8, t),
        THREE.MathUtils.lerp(40, 50, t),
        THREE.MathUtils.lerp(-4, -8, t)
      ];
    }
  };

  useFrame(() => {
    if (!isMounted) return;
    
    const lerpFactor = 0.03; // Reduced for smoother movement

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
    return [8, 50, -10] as [number, number, number];
  }, []);

  return (
    <>
      <ScrollControls pages={2} damping={0.2}>
        <Scroll onScroll={onScroll} damping={0.4}>
          <Stars 
            radius={120} 
            depth={60} 
            count={7000} 
            factor={6} 
            saturation={1} 
            fade 
            speed={0.5} 
          />
          {/* Reduced group nesting for better performance */}
          <group position={earthPosition}>
            <Earth scale={6} />
            <Moon scale={1.2} />
            <Rocket position={calculateRocketPosition(scrollProgress)} />
          </group>
          
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Environment preset="sunset" />
          
          {/* Atmospheric effects */}
          <Cloud 
            opacity={0.15} 
            speed={0.3} 
            width={30} 
            depth={2} 
            segments={25} 
          />
        </Scroll>
      </ScrollControls>
    </>
  );
};

const ThreeScene: React.FC = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef);

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ 
        opacity: isInView ? 0.8 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {isInView && (
        <Canvas 
          camera={{ 
            position: [12, 4, 24], 
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            antialias: true,
            powerPreference: "high-performance",
            precision: "highp",
            alpha: true
          }}
          linear
          style={{ 
            position: 'absolute',
            pointerEvents: 'none'
          }}
          frameloop="always"
          dpr={Math.min(2, window.devicePixelRatio)}
        >
          <Scene />
        </Canvas>
      )}
    </div>
  );
};

export default ThreeScene;