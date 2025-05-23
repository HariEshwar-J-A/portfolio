import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Cone, MeshDistortMaterial, Float, Trail, useGLTF } from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import * as THREE from 'three';

const Rocket = () => {
  const meshRef = useRef<THREE.Group>(null);
  const { theme } = useTheme();
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const speed = 0.03;
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    meshRef.current.position.x += direction.x * speed;
    meshRef.current.position.y += direction.y * speed;
    
    const targetRotation = Math.atan2(direction.y, direction.x);
    meshRef.current.rotation.z = targetRotation - Math.PI / 2;
    
    if (meshRef.current.position.x > 2 || meshRef.current.position.x < -2) {
      setDirection(prev => ({ ...prev, x: -prev.x }));
    }
    if (meshRef.current.position.y > 1 || meshRef.current.position.y < -1) {
      setDirection(prev => ({ ...prev, y: -prev.y }));
    }
  });

  return (
    <group ref={meshRef}>
      <Trail
        width={0.2}
        length={8}
        color={new THREE.Color(1, 0.5, 0)}
        attenuation={(t) => t * t}
      >
        <group scale={0.15}>
          <Cone args={[1, 3, 32]}>
            <meshStandardMaterial color={theme.colors.primary} />
          </Cone>
          <Cone 
            args={[0.5, 1, 32]} 
            position={[0, -2, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <meshStandardMaterial color={theme.colors.accent} emissive="orange" emissiveIntensity={2} />
          </Cone>
        </group>
      </Trail>
    </group>
  );
};

const BouncingBall = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const speed = 0.02;

  useFrame(() => {
    if (!meshRef.current) return;
    
    meshRef.current.position.x += direction.x * speed;
    meshRef.current.position.y += direction.y * speed;
    
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
    
    if (meshRef.current.position.x > 2 || meshRef.current.position.x < -2) {
      setDirection(prev => ({ ...prev, x: -prev.x }));
    }
    if (meshRef.current.position.y > 1 || meshRef.current.position.y < -1) {
      setDirection(prev => ({ ...prev, y: -prev.y }));
    }
  });

  return (
    <Sphere args={[0.3, 32, 32]} ref={meshRef}>
      <MeshDistortMaterial
        color={theme.colors.primary}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0}
      />
    </Sphere>
  );
};

const AnimatedShape = () => {
  const { theme } = useTheme();
  const activeSection = useSelector((state: RootState) => state.navigation.activeSection);
  const [currentSection, setCurrentSection] = useState(activeSection);
  
  useEffect(() => {
    setCurrentSection(activeSection);
  }, [activeSection]);

  const ShapeComponent = useMemo(() => {
    switch(currentSection) {
      case 'skills':
      case 'experience':
        return <Rocket />;
      default:
        return <BouncingBall />;
    }
  }, [currentSection, theme.colors]);

  return ShapeComponent;
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
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
        style={{ 
          position: 'absolute',
          pointerEvents: 'none'
        }}
        frameloop="always"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AnimatedShape />
      </Canvas>
    </div>
  );
};

export default ThreeScene;