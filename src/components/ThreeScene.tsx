import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import * as THREE from 'three';

// Earth component with atmosphere
const Earth = ({ isDark }: { isDark: boolean }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  
  // Load Earth textures - using reliable CDN URLs
  const [earthDayMap, earthNightMap, bumpMap, cloudsMap, specularMap] = useLoader(THREE.TextureLoader, [
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_atmos_2048.jpg',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_lights_2048.jpg',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_normal_2048.jpg',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_clouds_1024.png',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_specular_2048.jpg'
  ]);

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

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      // Subtle tilt based on mouse position
      earthRef.current.rotation.x = mouse.y * 0.1;
      earthRef.current.rotation.z = mouse.x * 0.1;
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
          map={isDark ? earthNightMap : earthDayMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={new THREE.Color(isDark ? '#ffffff' : '#909090')}
          shininess={isDark ? 10 : 5}
        />
      </mesh>
      
      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={1.003}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={isDark ? 0.3 : 0.4}
          depthWrite={false}
        />
      </mesh>
      
      {/* Enhanced atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.01}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          transparent={true}
          opacity={0.2}
          color={isDark ? '#4B5563' : '#60A5FA'}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// Scene component
const Scene = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <>
      {/* Enhanced dynamic lighting */}
      <ambientLight intensity={isDark ? 0.05 : 0.3} />
      <pointLight 
        position={[10, 5, 10]} 
        intensity={isDark ? 0.8 : 2}
        color={isDark ? '#94A3B8' : '#FCD34D'}
      />
      
      {/* Enhanced starry background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={isDark ? 7000 : 3000} 
        factor={4} 
        saturation={isDark ? 0.5 : 0} 
        fade={true}
        speed={0.3}
      />
      
      {/* Scene environment */}
      <Environment preset={isDark ? "night" : "sunset"} />
      
      <Earth isDark={isDark} />
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
          position: [0, 0, 8],
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