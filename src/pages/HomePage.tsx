import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useScroll } from '../hooks/useScroll';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CommandPalette from '../components/CommandPalette';
import GameHud from '../components/GameHud';
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

  // Scroll-spy keeps the active section in sync; keyboard nav adds game-style controls.
  useScroll();
  useKeyboardNav();

  useEffect(() => {
    document.title = 'Harieshwar J A | Software Architect & Full Stack Developer';
  }, []);

  useEffect(() => {
    document.body.className =
      theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900';
  }, [theme.mode]);

  return (
    <div className={theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
      <Header />
      <CommandPalette />
      <GameHud />

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
  );
};

export default HomePage;
