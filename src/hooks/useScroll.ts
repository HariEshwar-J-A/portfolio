import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveSection } from '../store/slices/navigationSlice';

export const useScroll = () => {
  const dispatch = useDispatch();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Determine which section is currently in view
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 300;
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight &&
          sectionId
        ) {
          dispatch(setActiveSection(sectionId as any));
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  return scrollY;
};