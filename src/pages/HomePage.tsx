import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { RootState } from '../store/store';
import { setSections } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { useTheme } from '../hooks/useTheme';
import { useScroll } from '../hooks/useScroll';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { DEFAULT_SECTION_ORDER, FOCUS_CONFIGS } from '../data/personalization';
import { useHat } from '../context/hat-context';
import { applyPageMeta } from '../lib/pageMeta';
import { scrollDocumentToTop } from '../components/ScrollToTop';
import { getLenis } from '../hooks/useSmoothScroll';
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
  const location = useLocation();
  const { theme } = useTheme();
  const focus = useSelector((state: RootState) => state.view.focus);
  const activeSection = useSelector((state: RootState) => state.navigation.activeSection);
  const hat = useHat();
  const sectionRef = useRef(activeSection);
  sectionRef.current = activeSection;
  const hatKey = hat?.id ?? 'home';

  // Immersive base layer: Lenis smooth scrolling, scroll-spy, game-style keys.
  useSmoothScroll();
  useScroll();
  useKeyboardNav();

  // Hat route wins over a saved visit intent, which wins over the default order.
  const sectionOrder = useMemo(() => {
    if (hat) return hat.sectionOrder;
    if (focus) return FOCUS_CONFIGS[focus].order;
    return DEFAULT_SECTION_ORDER;
  }, [hat, focus]);

  useEffect(() => {
    dispatch(setSections(sectionOrder));
  }, [dispatch, sectionOrder]);

  useEffect(() => {
    applyPageMeta(hat);
    return () => applyPageMeta(null);
  }, [hat]);

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

  // Role switches keep the section in view. The first paint still opens
  // on the hero (the effect above). "See full portfolio" does not pass
  // keepSection, so that link returns to the top.
  const skipHatScroll = useRef(true);
  useEffect(() => {
    if (skipHatScroll.current) {
      skipHatScroll.current = false;
      return;
    }
    const keepSection = Boolean(
      (location.state as { keepSection?: boolean } | null)?.keepSection
    );
    const section = sectionRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      if (!keepSection || section === 'about') {
        scrollDocumentToTop(reduce);
        return;
      }
      const element = document.getElementById(section);
      if (!element) {
        scrollDocumentToTop(reduce);
        return;
      }
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(element, { offset: -80, immediate: reduce, duration: reduce ? 0 : 0.55 });
      } else {
        element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }, reduce ? 0 : 260);
    return () => window.clearTimeout(timer);
  }, [hatKey, location.state]);

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
        {!hat && <SystemNarrator />}

        <AnimatePresence mode="wait" initial={false}>
          <m.main
            key={hatKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            {sectionOrder.map((sectionId) => {
              const Section = SECTION_COMPONENTS[sectionId];
              return <Section key={sectionId} />;
            })}
          </m.main>
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
