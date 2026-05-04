import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  Sparkles,
  Stars,
  useProgress,
  useTexture,
} from '@react-three/drei';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  GodRays,
  N8AO,
  SMAA,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Github,
  Layers,
  Linkedin,
  Mail,
  MousePointer2,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import * as THREE from 'three';
import { MarketingData, portfolioData } from '../data/portfolioData';

type MousePosition = {
  x: number;
  y: number;
};

const sectionOffsets = [0, -6, -12, -18, -24];

/** Nudge all section 3D roots upward so glass tiles can sit lower in the frame (same rhythm everywhere). */
const SECTION_BG_Y_LIFT = 0.58;

/** Scroll sections: horizontally centered; slight downward nudge so 3D above can merge into the glass tile. */
const sceneSectionLayout =
  'relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-20 md:px-10 md:py-28';

/** Applied to each glass tile so it sits a touch below optical center—room for 3D “above”. */
const sceneTileNudge = 'translate-y-8 md:translate-y-12';

const glassCard =
  'rounded-[2rem] border border-white/15 bg-slate-950/55 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl';

/** Lighter glass so the 3D canvas stays visible behind (hero and wide sections). */
const glassCardRevealing =
  'rounded-[2rem] border border-white/20 bg-slate-950/28 shadow-xl shadow-cyan-950/25 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/22';

const TypewriterText: React.FC<{ strings: string[] }> = ({ strings }) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentString = strings[index];
    const typeSpeed = isDeleting ? 30 : 60;

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentString) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setIndex((index + 1) % strings.length);
      } else {
        setText(currentString.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, strings]);

  return (
    <span className="inline-block min-h-[1.5em] text-cyan-300">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const Loader: React.FC = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="w-56 rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-center text-white backdrop-blur-xl">
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-300 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-100">Loading 3D</p>
      </div>
    </Html>
  );
};

const CameraRig: React.FC<{ mouse: MousePosition; scrollProgress: number }> = ({
  mouse,
  scrollProgress,
}) => {
  useFrame((state) => {
    const sectionTravel = scrollProgress * Math.abs(sectionOffsets.at(-1) ?? -28);
    const target = new THREE.Vector3(mouse.x * 0.55, -sectionTravel + mouse.y * 0.28, 6.6);
    state.camera.position.lerp(target, 0.07);
    state.camera.lookAt(mouse.x * 0.32, -sectionTravel, -0.15);
  });

  return null;
};

const HeroScene: React.FC<{ heroSunRef: React.RefObject<THREE.Mesh> }> = ({ heroSunRef }) => {
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowHaloMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 4;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.65));
    if (glowMatRef.current) {
      glowMatRef.current.opacity = 0.22 * pulse;
    }
    if (glowHaloMatRef.current) {
      glowHaloMatRef.current.opacity = 0.1 * pulse;
    }
  });

  useLayoutEffect(() => {
    const m = heroSunRef.current;
    if (m) {
      m.frustumCulled = false;
    }
  }, [heroSunRef]);

  return (
    <group position={[0, sectionOffsets[0] + 0.72 + SECTION_BG_Y_LIFT, 0.2]} scale={isMobile ? 0.8 : 1.02}>
      <mesh ref={heroSunRef} position={[0, 0, -0.015]} renderOrder={-1}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshBasicMaterial color="#fffbeb" transparent opacity={0.04} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.08]}>
        <circleGeometry args={[0.78, 64]} />
        <meshBasicMaterial
          ref={glowHaloMatRef}
          color="#f59e0b"
          transparent
          opacity={0.1}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0, -0.06]}>
        <circleGeometry args={[0.58, 64]} />
        <meshBasicMaterial
          ref={glowMatRef}
          color="#fbbf24"
          transparent
          opacity={0.22}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.35, 0.006, 8, 128]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.1} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
};

const SkillsOrbit: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 4;
  const skills = useMemo(
    () => portfolioData.skills.flatMap((category) => category.skills).slice(0, 12),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.09;
  });

  return (
    <group ref={groupRef} position={[0, sectionOffsets[1] + SECTION_BG_Y_LIFT, 0.28]} scale={isMobile ? 0.7 : 1.05}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.05, 0.0045, 8, 160]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.07} toneMapped={false} depthWrite={false} />
      </mesh>
      {skills.map((skill, index) => {
        const angle = (index / skills.length) * Math.PI * 2;
        const radius = 2.05;

        return (
          <group key={skill.name} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <mesh>
              <sphereGeometry args={[0.055 + skill.level / 1200, 10, 10]} />
              <meshStandardMaterial
                color={index % 3 === 0 ? '#38bdf8' : index % 3 === 1 ? '#a78bfa' : '#34d399'}
                emissive="#0f172a"
                emissiveIntensity={0.12}
                transparent
                opacity={0.55}
              />
            </mesh>
            <Html center distanceFactor={5.8} style={{ pointerEvents: 'none' }}>
              <div className="rounded-full border border-cyan-200/15 bg-slate-950/70 px-2 py-0.5 text-[10px] font-semibold text-white/90 shadow-sm backdrop-blur">
                {skill.name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

/** Featured work thumbnails with a minimal abstract rig — no device chrome or labels in 3D. */
const ProjectsWorkBackdrop: React.FC = () => {
  const hubRef = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.MeshStandardMaterial>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 4;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (hubRef.current) {
      hubRef.current.rotation.y += delta * 0.055;
    }
    if (ringA.current) {
      ringA.current.rotation.z += delta * 0.22;
    }
    if (ringB.current) {
      ringB.current.rotation.z -= delta * 0.14;
    }
    if (pulseRef.current) {
      pulseRef.current.emissiveIntensity = 0.35 + Math.sin(t * 1.4) * 0.12;
    }
  });

  return (
    <group position={[0, sectionOffsets[2] + 0.06 + SECTION_BG_Y_LIFT, 1.05]} scale={isMobile ? 0.7 : 1}>
      <pointLight position={[0.8, 1.2, 2.4]} intensity={1.35} color="#ffffff" distance={8} />
      <pointLight position={[-0.6, -0.4, 1.8]} intensity={0.55} color="#38bdf8" distance={6} />
      <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={8} blur={2.4} far={4.5} color="#020617" />
      <group ref={hubRef}>
        <mesh rotation={[Math.PI / 2, 0.08, 0]}>
          <torusGeometry args={[1.42, 0.014, 2, 96]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.22} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={ringA} rotation={[Math.PI / 2.08, -0.12, 0.06]}>
          <torusGeometry args={[1.18, 0.01, 2, 80]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.18} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 1.95, 0.1, -0.04]}>
          <torusGeometry args={[1.62, 0.008, 2, 72]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.12} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            ref={pulseRef}
            color="#0f172a"
            emissive="#0891b2"
            emissiveIntensity={0.35}
            metalness={0.9}
            roughness={0.25}
            wireframe
          />
        </mesh>
      </group>
      <Sparkles count={40} position={[0, 0.12, 0]} scale={[4.8, 1.4, 4.8]} size={1.6} speed={0.1} opacity={0.35} color="#94a3b8" />
    </group>
  );
};

/** ECAM summit — journey section only; sits above the “Selected chapter” column (positive X). */
const CareerSummitStack: React.FC = () => {
  const ecam = portfolioData.experience[0];
  const logo = useTexture(ecam.logo);
  logo.colorSpace = THREE.SRGBColorSpace;
  const root = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 4;

  useFrame((_, delta) => {
    if (root.current) {
      root.current.rotation.y += delta * 0.028;
    }
  });
  const summitScale = isMobile ? 3.2 : 4.8;
  const y = sectionOffsets[3] + (isMobile ? 1.0 : 1.45) + SECTION_BG_Y_LIFT;
  return (
    <group ref={root} position={[0, y, 0.4]} scale={summitScale}>
      <pointLight position={[0.45, 0.58, 0.48]} intensity={3.2} distance={9} decay={2} color="#fef9c3" />
      <directionalLight position={[-1.2, 2.6, 1.8]} intensity={0.55} color="#bae6fd" />
      <ContactShadows position={[0, -0.58, 0]} opacity={0.42} scale={9} blur={2.4} far={3.8} />
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.4, 64]} />
        <meshPhysicalMaterial color="#0f172a" metalness={0.8} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 64]} />
        <meshBasicMaterial map={logo} toneMapped />
      </mesh>
    </group>
  );
};

const ContactConstellation: React.FC = () => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 4;

  return (
    <group position={[0, sectionOffsets[4] + SECTION_BG_Y_LIFT, -0.2]} scale={isMobile ? 0.75 : 1.15}>
      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.7}>
        <mesh>
          <octahedronGeometry args={[1.75, 2]} />
          <meshStandardMaterial
            color="#f0abfc"
            emissive="#a855f7"
            emissiveIntensity={0.78}
            metalness={0.65}
            roughness={0.22}
            wireframe
          />
        </mesh>
      </Float>
      <mesh>
        <torusKnotGeometry args={[2.55, 0.035, 150, 12]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.72} />
      </mesh>
    </group>
  );
};

const PortfolioWorld: React.FC<{ mouse: MousePosition; scrollProgress: number }> = ({
  mouse,
  scrollProgress,
}) => {
  const useEffects = useMemo(
    () => window.matchMedia('(min-width: 768px)').matches && navigator.hardwareConcurrency > 4,
    []
  );
  const heroSunRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 5, 26]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[3.8, 6.2, 2.8]} intensity={0.95} color="#fff7ed" />
      <pointLight position={[1.8, 2.6, 4.2]} intensity={2.45} color="#67e8f9" />
      <pointLight position={[-1.8, -4, 3.2]} intensity={1.45} color="#a78bfa" />
      <spotLight position={[0, 3.8, 5.2]} angle={0.52} penumbra={0.85} intensity={1.95} color="#fffbeb" />
      <Stars radius={45} depth={20} count={3000} factor={5} saturation={0} fade speed={0.7} />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.55} />
      </Suspense>
      <CameraRig mouse={mouse} scrollProgress={scrollProgress} />
      <HeroScene heroSunRef={heroSunRef} />
      <SkillsOrbit />
      <ProjectsWorkBackdrop />
      <Suspense fallback={null}>
        <CareerSummitStack />
      </Suspense>
      <ContactConstellation />
      {useEffects && (
        <EffectComposer multisampling={0} enableNormalPass>
          <SMAA />
          <N8AO
            halfRes
            aoRadius={0.14}
            distanceFalloff={0.55}
            intensity={2.8}
            quality="medium"
            denoiseRadius={12}
            color="black"
          />
          <Bloom
            intensity={0.82}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.38}
            mipmapBlur
            levels={7}
          />
          <GodRays
            sun={heroSunRef}
            blendFunction={BlendFunction.SCREEN}
            samples={44}
            density={0.86}
            decay={0.93}
            weight={0.16}
            exposure={0.48}
            clampMax={1}
            blur
            kernelSize={KernelSize.SMALL}
          />
          <ChromaticAberration offset={[0.00045, 0.00055]} radialModulation modulationOffset={0.04} />
        </EffectComposer>
      )}
    </>
  );
};

const MouseFollower: React.FC<{ mouse: MousePosition }> = ({ mouse }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28 });
  const springY = useSpring(y, { stiffness: 260, damping: 28 });

  useEffect(() => {
    x.set((mouse.x + 1) * window.innerWidth * 0.5 - 14);
    y.set((-mouse.y + 1) * window.innerHeight * 0.5 - 14);
  }, [mouse.x, mouse.y, x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-7 w-7 rounded-full border border-cyan-200/70 mix-blend-screen md:block"
      style={{ x: springX, y: springY }}
    />
  );
};

const NavDots: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const labels = ['Hero', 'Skills', 'Projects', 'Journey', 'Contact'] as const;

  return (
    <nav
      className="fixed right-0 top-1/2 z-40 hidden w-14 -translate-y-1/2 lg:block"
      aria-label="Section navigation"
    >
      <div className="flex flex-col items-center gap-3 rounded-l-2xl border border-r-0 border-white/10 bg-slate-950/70 py-4 pr-1 pl-1 shadow-xl shadow-black/40 backdrop-blur-xl">
        {labels.map((label, index) => {
          const isActive = activeIndex === index;

          return (
            <a
              key={label}
              href={`#scene-${index}`}
              title={label}
              className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <span
                className={`absolute h-2 w-2 rounded-full transition ${
                  isActive ? 'scale-125 bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)]' : 'bg-white/25 group-hover:bg-white/55'
                }`}
              />
              <span
                className={`pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-0 shadow-lg transition group-hover:opacity-100 ${
                  isActive ? 'text-cyan-100' : ''
                }`}
              >
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

const ThreeDPortfolioPage: React.FC = () => {
  const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [allProjectsExpanded, setAllProjectsExpanded] = useState(false);
  const journeyMilestones = useMemo(() => portfolioData.experience.slice(0, 6), []);
  const [journeyDetailIndex, setJourneyDetailIndex] = useState(0);
  const [emailCopied, setEmailCopied] = useState(false);
  const { personal, contact, projects } = portfolioData;
  const featuredProjects = useMemo(() => projects.filter((p) => p.featured), [projects]);
  const activeJourney = journeyMilestones[journeyDetailIndex] ?? journeyMilestones[0];
  const activeIndex = Math.min(4, Math.round(scrollProgress * 4));

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  useEffect(() => {
    document.title = 'Harieshwar J A | 3D Portfolio Experience';
    document.body.className = 'bg-slate-950 text-white';
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll <= 0 ? 0 : window.scrollY / maxScroll);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <>
      <main className="relative min-h-[520vh] overflow-x-hidden bg-slate-950 text-white">
        <MouseFollower mouse={mouse} />
        <NavDots activeIndex={activeIndex} />

        <div className="fixed inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 6.6], fov: 46 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={<Loader />}>
              <PortfolioWorld mouse={mouse} scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_90%_60%_at_50%_40%,rgba(34,211,238,0.08),transparent_58%),radial-gradient(ellipse_75%_55%_at_50%_70%,rgba(168,85,247,0.07),transparent_52%),linear-gradient(180deg,rgba(2,6,23,0.28)_0%,rgba(2,6,23,0.06)_42%,rgba(2,6,23,0.32)_100%)]" />

      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-cyan-200/60 hover:bg-white/15"
        >
          <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
          Classic site
        </Link>
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex rounded-full bg-cyan-300 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-white"
        >
          Hire Harieshwar
        </a>
      </div>

      <section
        id="scene-0"
        className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-20 md:px-10 lg:px-14 lg:py-28 xl:px-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${glassCardRevealing} ${sceneTileNudge} w-full max-w-2xl p-6 text-center md:p-10`}
        >
          <div className="relative mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-2 border-cyan-200/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] md:h-40 md:w-40">
            <img src={personal.photo} alt={personal.name} className="h-full w-full object-cover" />
          </div>
          <p className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/25 bg-amber-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-100">
            <SparklesIcon size={16} />
            Chapter one · presence
          </p>
          <h1 className="text-6xl font-black leading-[0.9] tracking-tight text-white md:text-8xl">{personal.name}</h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
            {personal.title} · <TypewriterText strings={MarketingData.heroOrbitLabels} />
          </p>
          <h2 className="mt-8 text-3xl font-black leading-tight tracking-tight text-cyan-100 md:text-5xl">
            {MarketingData.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-200 md:text-2xl">
            {MarketingData.tagline}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-slate-400">
            The portrait merges with the glass tile, bringing the focus to the foreground while the 3D canvas breathes overhead.
          </p>
          <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            {MarketingData.proofPoints.map((point) => (
              <div key={point.metric} className="rounded-2xl border border-cyan-100/10 bg-white/10 p-4">
                <p className="text-2xl font-black text-cyan-200">{point.metric}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{point.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${contact.email}`}
              className="group inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-400/25 transition hover:bg-white"
            >
              Start a conversation
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </a>
            <a
              href="#scene-2"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-xl transition hover:border-white/40"
            >
              See featured work
            </a>
          </div>
        </motion.div>
      </section>

      <section id="scene-1" className={sceneSectionLayout}>
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          viewport={{ amount: 0.45 }}
          className={`${glassCard} ${sceneTileNudge} w-full max-w-2xl p-6 text-center md:p-9`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">Capability orbit</p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">A builder who connects product, systems, and polish.</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
            Chapter two: how strengths orbit a center of gravity — product sense, platform discipline, and craft —
            instead of scattering buzzwords.
          </p>
          <div className="mx-auto mt-6 grid max-w-2xl gap-3 md:grid-cols-3">
            {MarketingData.pillars.map((pillar) => (
              <div
                key={pillar}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center text-sm text-slate-100"
              >
                {pillar}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-300">
            The orbit ring sits above this centered tile so the copy stays the anchor while the canvas breathes overhead.
          </p>
        </motion.div>
      </section>

      <section id="scene-2" className={sceneSectionLayout}>
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 80 }}
          viewport={{ amount: 0.45 }}
          className={`${glassCard} ${sceneTileNudge} w-full max-w-5xl p-6 text-center md:p-10`}
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">Featured systems</p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">Work that sells outcomes, not just screens.</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Chapter three: each build is a bet on clarity — observable impact, honest trade-offs, and links you can
                follow. Behind the glass, the canvas keeps a quiet abstract rig and floating thumbnails—no device chrome,
                just motion that nods at shipping cadence.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-base text-slate-300">
              <p className="max-w-xl">
                One gesture opens every case file — or folds them back to a calm overview.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllProjectsExpanded(true)}
                  disabled={allProjectsExpanded}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Layers size={14} />
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={() => setAllProjectsExpanded(false)}
                  disabled={!allProjectsExpanded}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Collapse all
                </button>
              </div>
            </div>
          </div>

          <ol className="mx-auto mt-8 flex max-w-3xl flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-center sm:flex-row sm:divide-x sm:divide-y-0 sm:px-0 sm:py-0">
            {[
              { step: '01', title: 'North star', body: 'Problem and audience, frozen in one line.' },
              { step: '02', title: 'Proof in prod', body: 'What shipped, with metrics that survived reality.' },
              { step: '03', title: 'Open the hood', body: 'Stack, demo, source — nothing hand-wavy.' },
            ].map((beat) => (
              <li key={beat.step} className="flex flex-1 flex-col items-center py-4 sm:px-4 sm:py-5">
                <span className="font-mono text-xs font-black text-cyan-300">{beat.step}</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-wider text-white">{beat.title}</span>
                <span className="mt-1 text-[11px] leading-snug text-slate-500">{beat.body}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project, cardIndex) => {
              const isOpen = allProjectsExpanded;

              return (
                <motion.div
                  key={project.title}
                  layout
                  className={`flex flex-col overflow-hidden rounded-2xl border bg-white/10 p-4 transition md:p-5 ${
                    isOpen ? 'border-cyan-300/50 ring-1 ring-cyan-400/30' : 'border-white/15 hover:border-white/25'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-center">
                      <p className="font-mono text-[10px] font-black text-cyan-400/90">
                        Case {cardIndex + 1} of {featuredProjects.length}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">Featured</p>
                      <h3 className="mt-1 text-base font-black leading-snug text-white md:text-lg">{project.title}</h3>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-cyan-200/80 transition ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </div>
                  <p className={`mt-2 text-sm text-slate-300 ${isOpen ? '' : 'line-clamp-2'}`}>{project.description}</p>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 border-t border-white/10 pt-4"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-cyan-100"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.demoLink && (
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/20 px-3 py-2 text-xs font-bold text-cyan-100 ring-1 ring-cyan-300/35 transition hover:bg-cyan-400/30"
                          >
                            <ExternalLink size={14} />
                            Live demo
                          </a>
                        )}
                        {project.sourceLink && (
                          <a
                            href={project.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/20 transition hover:bg-white/15"
                          >
                            <Github size={14} />
                            Source code
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section id="scene-3" className={sceneSectionLayout}>
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 28 }}
          viewport={{ amount: 0.45 }}
          className={`${glassCard} ${sceneTileNudge} w-full max-w-[min(72rem,calc(100vw-2.5rem))] p-6 text-center md:p-10`}
        >
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-100">Career journey</p>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              One path, many chapters — read the story here.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Chapter four: the ECAM summit in 3D meets this tile from above—the same centered rhythm as every chapter:
              canvas high, glass in the middle.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-2 lg:gap-x-10">
            <div className="flex flex-col items-center gap-2">
              {journeyMilestones.map((item, index) => {
                const isSelected = journeyDetailIndex === index;

                return (
                  <button
                    key={`${item.company}-${item.startDate}`}
                    type="button"
                    onClick={() => setJourneyDetailIndex(index)}
                    className={`w-full max-w-md rounded-2xl border px-4 py-3 text-center transition ${
                      isSelected
                        ? 'border-orange-300/50 bg-orange-500/15 ring-1 ring-orange-400/25'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-200">
                      {item.startDate} — {item.endDate}
                    </p>
                    <p className="mt-1 font-black text-white">{item.company}</p>
                    <p className="text-sm text-cyan-100">{item.position}</p>
                  </button>
                );
              })}
            </div>
            <div className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/60 p-6 text-center shadow-inner shadow-black/30 lg:max-w-none">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">Selected chapter</p>
              <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">{activeJourney.company}</h3>
              <p className="mt-1 text-base font-semibold text-cyan-100">{activeJourney.position}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                {activeJourney.startDate} — {activeJourney.endDate} · {activeJourney.location}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">{activeJourney.description}</p>
              {activeJourney.achievements.length > 0 && (
                <ul className="mx-auto mt-4 max-w-prose list-none space-y-2 text-sm text-slate-300">
                  {activeJourney.achievements.slice(0, 4).map((line, achievementIndex) => (
                    <li key={`${achievementIndex}-${line.slice(0, 40)}`} className="border-b border-white/5 pb-2 last:border-0">
                      {line}
                    </li>
                  ))}
                </ul>
              )}
              {activeJourney.website && (
                <a
                  href={activeJourney.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-bold text-cyan-200 underline decoration-cyan-500/50 underline-offset-4 hover:text-white"
                >
                  <ExternalLink size={16} />
                  Company website
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="scene-4" className={sceneSectionLayout}>
        <motion.div
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.92 }}
          viewport={{ amount: 0.5 }}
          className={`${glassCard} ${sceneTileNudge} w-full max-w-3xl p-8 text-center md:p-12`}
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-10">
            <div>
              <MousePointer2 className="mx-auto mb-4 text-cyan-200" size={36} />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Final chapter</p>
              <h2 className="mt-2 text-4xl font-black md:text-5xl">Let’s build the next premium product story.</h2>
              <p className="mt-5 text-lg text-slate-300">
                {personal.bio} Available for roles and collaborations where engineering craft has to meet market impact.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Whether you are hiring, partnering, or comparing notes on how teams ship premium experiences, this is the
                beat where paths converge—clear intent, open channels, and a bias toward building.
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col items-center gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">Quick actions</p>
              <motion.a
                href={`mailto:${contact.email}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.3)] transition hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <Mail size={20} />
                  Email me
                </span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </motion.a>
              <div className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-2 pl-4 backdrop-blur-sm">
                <code className="truncate text-sm text-slate-300">{contact.email}</code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  {emailCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {emailCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="grid w-full grid-cols-3 gap-3">
                <motion.a
                  href={personal.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold text-slate-300 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
                >
                  <Github size={20} />
                  GitHub
                </motion.a>
                <motion.a
                  href={personal.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold text-slate-300 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
                >
                  <Linkedin size={20} />
                  LinkedIn
                </motion.a>
                {personal.socialLinks.website && (
                  <motion.a
                    href={personal.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -2 }}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold text-slate-300 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink size={20} />
                    Website
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      </main>
    </>
  );
};

export default ThreeDPortfolioPage;
