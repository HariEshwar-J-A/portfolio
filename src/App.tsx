import React, { useEffect, lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useTheme } from './hooks/useTheme';
import { useScroll } from './hooks/useScroll';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutSection from './components/sections/AboutSection';

// Lazy load non-critical sections
const SkillsSection = lazy(() => import('./components/sections/SkillsSection'));
const ExperienceSection = lazy(() => import('./components/sections/ExperienceSection'));
const EducationSection = lazy(() => import('./components/sections/EducationSection'));
const ProjectsSection = lazy(() => import('./components/sections/ProjectsSection'));
const AchievementsSection = lazy(() => import('./components/sections/AchievementsSection'));
const ContactSection = lazy(() => import('./components/sections/ContactSection'));

const SkipToContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
  >
    Skip to main content
  </a>
);

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const scrollY = useScroll();
  
  useEffect(() => {
    document.title = 'Harieshwar J A | Full Stack Developer Portfolio';
  }, []);
  
  useEffect(() => {
    document.body.className = theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900';
  }, [theme.mode]);
  
  return (
    <div className={theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
      <SkipToContent />
      <Header />
      
      <main id="main-content" tabIndex={-1}>
        <AboutSection />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <SkillsSection />
          <ExperienceSection />
          <EducationSection />
          <ProjectsSection />
          <AchievementsSection />
          <ContactSection />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;