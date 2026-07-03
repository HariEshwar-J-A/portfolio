import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { navigateTo } from '../store/slices/navigationSlice';
import { cyclePalette } from '../store/slices/themeSlice';

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

/**
 * Game-style keyboard controls for the homepage:
 *   W / ArrowUp      previous section
 *   S / ArrowDown    next section
 *   1..9             jump straight to a section
 *   Home / End       first / last section
 *   T                cycle theme personas
 * Disabled while typing in a form field or while an overlay (command
 * palette, collaboration wizard) flags itself open on <html>.
 */
export const useKeyboardNav = () => {
  const dispatch = useDispatch();
  const { activeSection, sections } = useSelector((state: RootState) => state.navigation);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      const { cmdkOpen, modalOpen } = document.documentElement.dataset;
      if (cmdkOpen === 'true' || modalOpen === 'true') return;

      const currentIndex = sections.indexOf(activeSection);
      const goTo = (index: number) => {
        const section = sections[Math.min(Math.max(index, 0), sections.length - 1)];
        if (section && section !== activeSection) {
          dispatch(navigateTo(section));
        }
      };

      switch (event.key) {
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          goTo(currentIndex + 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          goTo(currentIndex - 1);
          break;
        case 'Home':
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          event.preventDefault();
          goTo(sections.length - 1);
          break;
        case 't':
        case 'T':
          dispatch(cyclePalette());
          break;
        default: {
          const digit = Number.parseInt(event.key, 10);
          if (!Number.isNaN(digit) && digit >= 1 && digit <= sections.length) {
            goTo(digit - 1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, activeSection, sections]);
};
