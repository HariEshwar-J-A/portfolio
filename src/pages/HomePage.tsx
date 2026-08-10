import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setSections } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { useTheme } from '../hooks/useTheme';
import { useScroll } from '../hooks/useScroll';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { DEFAULT_SECTION_ORDER, FOCUS_CONFIGS } from '../data/personalization';
import { scrollDocumentToTop } from '../components/ScrollToTop';
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
import IntentWizard from '../components/IntentWizard';
import PersonalizedBanner from '../components/PersonalizedBanner';
import AboutSection from '../components/sections/AboutSection';
import SkillsSection from '../components/sections/SkillsSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ProductsSection from '../components/sections/ProductsSection';
import AchievementsSection from '../components/sections/AchievementsSection';
import ContactSection from '../components/sections/ContactSection';

const SECTION_COMPONENTS: Record<SectionId, React.FC> = {
  about: AboutSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectsSection,
  products: ProductsSection,
  achievements: AchievementsSection,
  contact: ContactSection,
};

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const focus = useSelector((state: RootState) => state.view.focus);

  // Immersive base layer: Lenis smooth scrolling, scroll-spy, game-style keys.
  useSmoothScroll();
  useScroll();
  useKeyboardNav();

  // The intent wizard personalizes the section order; nav/dots follow it.
  const sectionOrder = useMemo(
    () => (focus ? FOCUS_CONFIGS[focus].order : DEFAULT_SECTION_ORDER),
    [focus]
  );

  useEffect(() => {
    dispatch(setSections(sectionOrder));
  }, [dispatch, sectionOrder]);

  useEffect(() => {
    document.title = 'Harieshwar J A | Senior Full-Stack Developer';
  }, []);

  // Pin the hero on first paint (and after Lenis boots) so a restored
  // scroll offset never opens the page mid-Experience.
  useEffect(() => {
    scrollDocumentToTop(true);
    const t0 = window.setTimeout(() => scrollDocumentToTop(true), 0);
    const t1 = window.setTimeout(() => scrollDocumentToTop(true), 100);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
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
        <PersonalizedBanner />
        <IntentWizard />
        <CommandPalette />
        <CollabWizard />
        <ScrollProgress />
        <SectionDots />
        <SceneTransition />
        <SystemNarrator />

        <main>
          {sectionOrder.map((sectionId) => {
            const Section = SECTION_COMPONENTS[sectionId];
            return <Section key={sectionId} />;
          })}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
