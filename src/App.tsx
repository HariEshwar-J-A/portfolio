import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useTheme } from './hooks/useTheme';
import { useScroll } from './hooks/useScroll';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutSection from './components/sections/AboutSection';
import SkillsSection from './components/sections/SkillsSection';
import ExperienceSection from './components/sections/ExperienceSection';
import EducationSection from './components/sections/EducationSection';
import ProjectsSection from './components/sections/ProjectsSection';
import AchievementsSection from './components/sections/AchievementsSection';
import ContactSection from './components/sections/ContactSection';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const scrollY = useScroll();
  
  // Set document title
  useEffect(() => {
    document.title = 'Harieshwar J A | Full Stack Developer Portfolio';
  }, []);
  
  // Set theme color on body
  useEffect(() => {
    document.body.className = theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900';
  }, [theme.mode]);
  
  return (
    <div className={theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
      <Header />
      
      <main>
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <EducationSection />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
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