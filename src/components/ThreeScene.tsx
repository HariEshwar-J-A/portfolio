import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Stars, Environment, useTexture, Preload } from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import * as THREE from 'three';

// Fallback texture URLs that are known to work
const TEXTURE_URLS = {
  day: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg',
  night: 'https://images.pexels.com/photos/355935/pexels-photo-355935.jpeg',
  clouds: 'https://images.pexels.com/photos/2114014/pexels-photo-2114014.jpeg'
};

// Earth component with atmosphere
const Earth = ({ isDark }: { isDark: boolean }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  
  // Use useTexture hook with error handling
  const textures = useTexture(
    {
      earthMap: isDark ? TEXTURE_URLS.night : TEXTURE_URLS.day,
      cloudsMap: TEXTURE_URLS.clouds
    },
    (loaded) => {
      setTexturesLoaded(true);
    },
    (error) => {
      console.error('Error loading textures:', error);
      setTexturesLoaded(true); // Still set to true to render with fallback materials
    }
  );

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
      earthRef.current.rotation.x = mouse.y * 0.5;
      earthRef.current.rotation.z = mouse.x * 0.5;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  if (!texturesLoaded) {
    return null; // Don't render until textures are loaded or failed
  }

  return (
    <group>
      {/* Earth base */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={textures.earthMap}
          shininess={isDark ? 15 : 10}
          specular={new THREE.Color(isDark ? '#334155' : '#94A3B8')}
        />
      </mesh>
      
      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={1.003}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={textures.cloudsMap}
          transparent={true}
          opacity={isDark ? 0.2 : 0.3}
          depthWrite={false}
        />
      </mesh>
      
      {/* Enhanced atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.01}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          transparent={true}
          opacity={0.2}
          color={isDark ? '#1E293B' : '#3B82F6'}
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
  
  // Create multiple light sources for even illumination
  const lightPositions = [
    [10, 0, 0],
    [-10, 0, 0],
    [0, 10, 0],
    [0, -10, 0],
    [0, 0, 10],
    [0, 0, -10]
  ];

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      
      {/* Multiple point lights for even illumination */}
      {lightPositions.map((position, index) => (
        <pointLight
          key={index}
          position={position}
          intensity={isDark ? 0.3 : 0.4}
          color={isDark ? '#CBD5E1' : '#FFFFFF'}
          distance={20}
          decay={2}
        />
      ))}
      
      {/* Dense starfield with theme-based adjustments */}
      <Stars 
        radius={300} 
        depth={100} 
        count={isDark ? 10000 : 5000} 
        factor={isDark ? 6 : 4} 
        saturation={isDark ? 1 : 0.5} 
        fade={true}
        speed={0.5}
      />
      <Stars 
        radius={100}
        depth={80}
        count={isDark ? 8000 : 4000}
        factor={4} 
        saturation={isDark ? 0.8 : 0.3}
        fade={true}
        speed={0.2}
      />
      
      {/* Scene environment */}
      <Environment preset={isDark ? "warehouse" : "sunset"} />
      
      <Earth isDark={isDark} />
      <Preload all />
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
        background: theme.mode === 'dark' ? 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)' : 'radial-gradient(circle at center, #BFDBFE 0%, #F8FAFC 100%)'
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 0, 6],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: true,
          powerPreference: "high-performance"
        }}
        style={{ 
          position: 'absolute',
          pointerEvents: 'none'
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeScene;