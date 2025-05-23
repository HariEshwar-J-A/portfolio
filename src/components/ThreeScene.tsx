import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
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

// CelestialBody component
const CelestialBody = ({ isDark }: { isDark: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color={isDark ? '#f1f5f9' : '#fbbf24'}
        emissive={isDark ? '#94a3b8' : '#fef3c7'}
        emissiveIntensity={0.5}
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
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
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <ParticleSystem />
      <CelestialBody isDark={isDark} />
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
          position: [0, 0, 20],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true
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