import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  Box,
  ChevronDown,
  Command,
  Gamepad2,
  Maximize2,
  Menu,
  Minimize2,
  Newspaper,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import { navigateTo } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { RootState } from '../store/store';
import { toggleViewMode } from '../store/slices/viewSlice';
import { useTheme } from '../hooks/useTheme';
import { OPEN_PALETTE_EVENT } from './CommandPalette';
import { CLOSE_INTENT_EVENT, OPEN_INTENT_EVENT } from './IntentWizard';
import ThemeSwitcher from './ThemeSwitcher';
import { prefetchPlaygroundRoute, prefetchThreeDRoute } from '../lib/experienceRoutes';
import { HAT_LIST } from '../data/hats';
import { OfferingsData } from '../data/portfolioData';
import { useHat } from '../context/hat-context';
import {
  MORE_SECTIONS,
  OPS_PATH,
  PLAY_LINKS,
  PRIMARY_SECTIONS,
  activePlayId,
  isPortfolioPath,
} from '../lib/siteNav';
import NavMenu, { type NavMenuGroup } from './nav/NavMenu';

const dismissIntentWizard = () => {
  window.dispatchEvent(new Event(CLOSE_INTENT_EVENT));
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--os-primary)]';

type OpenMenu = 'view' | 'play' | 'more' | null;

const PLAY_ICONS: Record<(typeof PLAY_LINKS)[number]['id'], React.ReactNode> = {
  playground: <Gamepad2 size={16} />,
  chess: <Swords size={16} />,
  '3d': <Box size={16} />,
};

/**
 * Four section links, a role switcher, and one Play menu.
 * Skills, education, wins, and products stay in the compact menu and in ⌘K.
 */
const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const hat = useHat();
  const { activeSection } = useSelector((state: RootState) => state.navigation);
  const viewMode = useSelector((state: RootState) => state.view.mode);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isDark = theme.mode === 'dark';
  const isMinimal = viewMode === 'minimal';
  const isHome = isPortfolioPath(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const root = mobileRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () =>
      root
        ? [...root.querySelectorAll<HTMLElement>('a, button, [href], [tabindex]:not([tabindex="-1"])')]
        : [];
    const timer = window.setTimeout(() => focusables()[0]?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [isMobileMenuOpen]);

  if (!isHome) return null;

  const panelClass = isDark
    ? 'border-white/10 bg-slate-950/95 text-slate-200'
    : 'border-slate-200 bg-white/95 text-slate-700';
  const itemClass = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const quietTrigger = `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${focusRing} ${
    isDark ? 'border-slate-700 bg-slate-800/80 text-slate-200' : 'border-slate-300 bg-white/80 text-slate-700'
  }`;
  const moreActive = MORE_SECTIONS.some((section) => section.id === activeSection);
  const playId = activePlayId(location.pathname, null);
  const viewLabel = hat?.label ?? 'Full portfolio';

  const goToSection = (section: SectionId) => {
    dispatch(navigateTo(section));
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const goPlay = (to: string) => {
    dismissIntentWizard();
    if (to.startsWith('/3d')) prefetchThreeDRoute();
    else if (to.startsWith('/ai')) prefetchPlaygroundRoute();
    navigate(to);
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const viewAs = (path: string) => {
    navigate(path, { state: { keepSection: true } });
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const viewGroups: NavMenuGroup[] = [
    {
      id: 'roles',
      label: 'Role',
      items: [
        {
          id: 'full',
          label: 'Full portfolio',
          description: 'Original order, every section',
          selected: !hat,
          onSelect: () => viewAs('/'),
        },
        ...HAT_LIST.map((entry) => ({
          id: entry.id,
          label: entry.label,
          description: entry.roleLine,
          selected: hat?.id === entry.id,
          onSelect: () => viewAs(entry.path),
        })),
      ],
    },
  ];

  const playGroups: NavMenuGroup[] = [
    {
      id: 'play',
      label: 'Play',
      items: PLAY_LINKS.map((link) => ({
        id: link.id,
        label: link.label,
        description: link.description,
        icon: PLAY_ICONS[link.id],
        selected: playId === link.id,
        onSelect: () => goPlay(link.to),
      })),
    },
  ];

  const moreGroups: NavMenuGroup[] = [
    {
      id: 'sections',
      label: 'Also on this page',
      items: MORE_SECTIONS.map((section) => ({
        id: section.id,
        label: section.label,
        selected: activeSection === section.id,
        onSelect: () => goToSection(section.id),
      })),
    },
    {
      id: 'tools',
      label: 'Visit tools',
      items: [
        {
          id: 'intent',
          label: 'Personalize my visit',
          icon: <Sparkles size={16} />,
          onSelect: () => {
            setOpenMenu(null);
            window.dispatchEvent(new Event(OPEN_INTENT_EVENT));
          },
        },
        {
          id: 'palette',
          label: 'Search & commands',
          icon: <Command size={16} />,
          kbd: '⌘K',
          onSelect: () => {
            setOpenMenu(null);
            window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
          },
        },
        {
          id: 'view-mode',
          label: isMinimal ? 'Switch to full view' : 'Switch to minimal view',
          icon: isMinimal ? <Minimize2 size={16} /> : <Maximize2 size={16} />,
          onSelect: () => {
            dispatch(toggleViewMode());
            setOpenMenu(null);
          },
        },
        {
          id: 'ops',
          label: 'Ops',
          description: 'Site analytics',
          icon: <Activity size={16} />,
          onSelect: () => goPlay(OPS_PATH),
        },
        {
          id: 'infosentry',
          label: 'Source',
          description: 'InfoSentry on GitHub',
          icon: <Newspaper size={16} />,
          onSelect: () => {
            setOpenMenu(null);
            window.open(OfferingsData.flagship.sourceUrl, '_blank', 'noopener,noreferrer');
          },
        },
      ],
    },
  ];

  const setMenu = (id: OpenMenu) => (next: boolean) => setOpenMenu(next ? id : null);

  const mobileLinkClass = `rounded-xl px-3 py-2.5 text-left text-base font-medium transition ${focusRing} ${itemClass}`;

  return (
    <header
      className={`fixed top-0 left-0 z-[120] w-full transition-all duration-300 ${
        isScrolled
          ? `${isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/85 backdrop-blur-md'} shadow-md`
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center gap-3 px-4 py-3 md:px-6 md:py-4">
        <div className="relative z-10 flex shrink-0 items-center gap-2 font-mono text-lg font-bold tracking-tight md:text-xl">
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
          <span className={isDark ? 'text-white' : 'text-slate-900'}>
            hari<span style={{ color: 'var(--os-primary)' }}>.os</span>
          </span>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex" aria-label="Page sections">
          {PRIMARY_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => goToSection(section.id)}
                className={`relative inline-flex shrink-0 items-center px-3 pb-1.5 text-sm font-medium tracking-wide transition-colors ${focusRing} ${
                  isActive ? '' : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
                }`}
                style={{ color: isActive ? 'var(--os-primary)' : undefined }}
                aria-current={isActive ? 'true' : undefined}
              >
                {section.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="relative z-10 ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <NavMenu
            kind="listbox"
            menuLabel="View as role"
            trigger={
              <>
                <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${muted}`}>View as</span>
                <span>{viewLabel}</span>
                <ChevronDown size={13} className={`transition ${openMenu === 'view' ? 'rotate-180' : ''}`} />
              </>
            }
            triggerClassName={quietTrigger}
            panelClassName={panelClass}
            itemClassName={itemClass}
            groups={viewGroups}
            open={openMenu === 'view'}
            onOpenChange={setMenu('view')}
          />
          <NavMenu
            menuLabel="Play"
            trigger={
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  isDark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-slate-900'
                }`}
              >
                <Gamepad2 size={14} style={{ color: 'var(--os-primary)' }} />
                Play
                <ChevronDown size={13} className={`transition ${openMenu === 'play' ? 'rotate-180' : ''}`} />
              </span>
            }
            triggerClassName={`os-border-flow inline-flex rounded-full p-[1.5px] ${focusRing}`}
            panelClassName={panelClass}
            itemClassName={itemClass}
            groups={playGroups}
            open={openMenu === 'play'}
            onOpenChange={setMenu('play')}
          />
          <NavMenu
            menuLabel="More sections and tools"
            trigger={
              <>
                Menu
                {moreActive && (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
                )}
                <ChevronDown size={13} className={`transition ${openMenu === 'more' ? 'rotate-180' : ''}`} />
              </>
            }
            triggerClassName={quietTrigger}
            panelClassName={panelClass}
            itemClassName={itemClass}
            groups={moreGroups}
            open={openMenu === 'more'}
            onOpenChange={setMenu('more')}
          />
          <ThemeSwitcher />
        </div>

        <div className="relative z-10 ml-auto flex items-center gap-1 lg:hidden">
          <ThemeSwitcher />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className={`rounded-full p-2 transition-colors ${focusRing}`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className={isDark ? 'text-white' : 'text-slate-900'} />
            ) : (
              <Menu size={24} className={isDark ? 'text-white' : 'text-slate-900'} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileRef}
            id="site-menu"
            role="dialog"
            aria-label="Site menu"
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduce ? 0.01 : 0.2, ease: 'easeOut' }}
            className={`absolute max-h-[calc(100vh-4.5rem)] w-full overflow-y-auto px-5 py-4 shadow-xl backdrop-blur-xl lg:hidden ${
              isDark ? 'border-t border-white/10 bg-slate-950/95' : 'border-t border-slate-200 bg-white/95'
            }`}
          >
            <p className={`mb-1 px-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] ${muted}`}>View as</p>
            <div role="listbox" aria-label="View as role" className="flex flex-col gap-1">
              <button
                type="button"
                role="option"
                aria-selected={!hat}
                onClick={() => viewAs('/')}
                className={mobileLinkClass}
                style={!hat ? { color: 'var(--os-primary)' } : undefined}
              >
                Full portfolio
              </button>
              {HAT_LIST.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="option"
                  aria-selected={hat?.id === entry.id}
                  onClick={() => viewAs(entry.path)}
                  className={mobileLinkClass}
                  style={hat?.id === entry.id ? { color: 'var(--os-primary)' } : undefined}
                >
                  {entry.label}
                  <span className={`mt-0.5 block text-xs font-normal ${muted}`}>{entry.roleLine}</span>
                </button>
              ))}
            </div>

            <p className={`mb-1 mt-4 px-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] ${muted}`}>
              On this page
            </p>
            <nav className="flex flex-col gap-1" aria-label="Page sections">
              {PRIMARY_SECTIONS.map((section, index) => (
                <motion.button
                  key={section.id}
                  type="button"
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduce ? 0 : index * 0.03, duration: 0.16 }}
                  onClick={() => goToSection(section.id)}
                  className={mobileLinkClass}
                  style={
                    activeSection === section.id
                      ? {
                          color: 'var(--os-primary)',
                          backgroundColor: 'color-mix(in srgb, var(--os-primary) 10%, transparent)',
                        }
                      : undefined
                  }
                  aria-current={activeSection === section.id ? 'true' : undefined}
                >
                  {section.label}
                </motion.button>
              ))}
              {MORE_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(section.id)}
                  className={`${mobileLinkClass} text-sm`}
                  aria-current={activeSection === section.id ? 'true' : undefined}
                  style={activeSection === section.id ? { color: 'var(--os-primary)' } : undefined}
                >
                  {section.label}
                </button>
              ))}
            </nav>

            <p className={`mb-1 mt-4 px-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] ${muted}`}>Play</p>
            <div className="flex flex-col gap-1">
              {PLAY_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onMouseEnter={link.id === '3d' ? prefetchThreeDRoute : prefetchPlaygroundRoute}
                  onFocus={link.id === '3d' ? prefetchThreeDRoute : prefetchPlaygroundRoute}
                  onClick={() => goPlay(link.to)}
                  className={`${mobileLinkClass} inline-flex items-center gap-2 text-sm`}
                >
                  <span style={{ color: 'var(--os-primary)' }}>{PLAY_ICONS[link.id]}</span>
                  <span>
                    {link.label}
                    <span className={`mt-0.5 block text-xs font-normal ${muted}`}>{link.description}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className={`my-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
            <button type="button" onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new Event(OPEN_INTENT_EVENT)); }} className={`${mobileLinkClass} inline-flex items-center gap-2 text-sm`}>
              <Sparkles size={16} style={{ color: 'var(--os-primary)' }} />
              Personalize my visit
            </button>
            <button type="button" onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new Event(OPEN_PALETTE_EVENT)); }} className={`${mobileLinkClass} inline-flex items-center gap-2 text-sm`}>
              <Command size={16} style={{ color: 'var(--os-primary)' }} />
              Search & commands
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(toggleViewMode());
                setIsMobileMenuOpen(false);
              }}
              className={`${mobileLinkClass} inline-flex items-center gap-2 text-sm`}
            >
              {isMinimal ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {isMinimal ? 'Switch to full view' : 'Switch to minimal view'}
            </button>
            <button type="button" onClick={() => goPlay(OPS_PATH)} className={`${mobileLinkClass} inline-flex items-center gap-2 text-sm`}>
              <Activity size={16} style={{ color: 'var(--os-primary)' }} />
              Ops
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
