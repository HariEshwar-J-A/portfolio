import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useScroll } from '../hooks/useScroll';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CommandPalette from '../components/CommandPalette';
import ScrollProgress from '../components/ScrollProgress';
import SectionDots from '../components/SectionDots';
import AmbientBackground from '../components/AmbientBackground';
import BootSequence from '../components/BootSequence';
import SceneTransition from '../components/SceneTransition';
import SystemNarrator from '../components/SystemNarrator';
import CollabWizard from '../components/CollabWizard';
import AboutSection from '../components/sections/AboutSection';
import SkillsSection from '../components/sections/SkillsSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ProductsSection from '../components/sections/ProductsSection';
import AchievementsSection from '../components/sections/AchievementsSection';
import ContactSection from '../components/sections/ContactSection';

const HomePage: React.FC = () => {
  const { theme } = useTheme();

  // Immersive base layer: Lenis smooth scrolling, scroll-spy, game-style keys.
  useSmoothScroll();
  useScroll();
  useKeyboardNav();

  useEffect(() => {
    document.title = 'Harieshwar J A | Software Architect & Full Stack Developer';
  }, []);

  useEffect(() => {
    document.body.className =
      theme.mode === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  }, [theme.mode]);

  return (
    <div
      className={`relative ${
        theme.mode === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <AmbientBackground />

      <BootSequence />

      <div className="relative z-10">
        <Header />
        <CommandPalette />
        <CollabWizard />
        <ScrollProgress />
        <SectionDots />
        <SceneTransition />
        <SystemNarrator />

        <main>
          <AboutSection />
          <SkillsSection />
          <ExperienceSection />
          <EducationSection />
          <ProjectsSection />
          <ProductsSection />
          <AchievementsSection />
          <ContactSection />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
