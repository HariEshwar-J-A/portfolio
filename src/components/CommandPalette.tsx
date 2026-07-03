import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Box,
  Briefcase,
  FolderGit2,
  Github,
  GraduationCap,
  Layers,
  Linkedin,
  Mail,
  Moon,
  Newspaper,
  Search,
  Sun,
  User,
  Wrench,
} from 'lucide-react';
import { navigateTo } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { setPalette } from '../store/slices/themeSlice';
import { useTheme } from '../hooks/useTheme';
import { OfferingsData, portfolioData } from '../data/portfolioData';
import { themePalettes } from '../data/osPersona';
import { OPEN_COLLAB_EVENT } from './CollabWizard';

/** Dispatch this event from anywhere (Header button, HUD) to open the palette. */
export const OPEN_PALETTE_EVENT = 'portfolio:open-palette';

interface PaletteItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: React.ReactNode;
  perform: () => void;
}

const SECTION_ICONS: Record<SectionId, React.ReactNode> = {
  about: <User size={16} />,
  skills: <Wrench size={16} />,
  experience: <Briefcase size={16} />,
  education: <GraduationCap size={16} />,
  projects: <FolderGit2 size={16} />,
  products: <Layers size={16} />,
  achievements: <Award size={16} />,
  contact: <Mail size={16} />,
};

const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const matches = (item: PaletteItem, query: string): boolean => {
  const haystack = `${item.group} ${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
};

const CommandPalette: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isDark = theme.mode === 'dark';

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const items = useMemo<PaletteItem[]>(() => {
    const { personal, contact, projects } = portfolioData;
    const flagship = OfferingsData.flagship;

    const sectionItems: PaletteItem[] = (
      Object.keys(SECTION_ICONS) as SectionId[]
    ).map((section, index) => ({
      id: `nav-${section}`,
      group: 'Navigate',
      label: section.charAt(0).toUpperCase() + section.slice(1),
      hint: `Jump to section · ${index + 1}`,
      keywords: 'go section jump',
      icon: SECTION_ICONS[section],
      perform: () => dispatch(navigateTo(section)),
    }));

    const offeringItems: PaletteItem[] = [
      {
        id: 'offering-infosentry',
        group: 'Offerings',
        label: `${flagship.name} — ${flagship.tagline}`,
        hint: 'Open product page',
        keywords: 'info sentry product suite intelligence ifeeds ichat igithub ivideos isurprise',
        icon: <Newspaper size={16} />,
        perform: () => openExternal(flagship.marketingUrl),
      },
      {
        id: 'offering-infosentry-source',
        group: 'Offerings',
        label: `${flagship.name} source code`,
        hint: 'GitHub repository',
        keywords: 'info sentry github repo source',
        icon: <Github size={16} />,
        perform: () => openExternal(flagship.sourceUrl),
      },
    ];

    const projectItems: PaletteItem[] = projects
      .filter((project) => project.featured)
      .map((project) => ({
        id: `project-${project.title}`,
        group: 'Featured projects',
        label: project.title,
        hint: project.demoLink ? 'Open live demo' : 'Open source code',
        keywords: project.technologies.join(' '),
        icon: <FolderGit2 size={16} />,
        perform: () => openExternal(project.demoLink ?? project.sourceLink ?? '#'),
      }));

    const actionItems: PaletteItem[] = [
      {
        id: 'action-collab',
        group: 'Actions',
        label: 'Start a collaboration',
        hint: 'Guided email wizard',
        keywords: 'collaborate hire contact wizard email draft work together',
        icon: <Mail size={16} />,
        perform: () => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT)),
      },
      ...themePalettes.map((palette) => ({
        id: `action-theme-${palette.id}`,
        group: 'Actions',
        label: `Theme: ${palette.label}`,
        hint: palette.description,
        keywords: `theme persona palette color ${palette.mode}`,
        icon: palette.mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />,
        perform: () => dispatch(setPalette(palette.id)),
      })),
      {
        id: 'action-playground',
        group: 'Actions',
        label: 'Enter the HARI.OS Playground',
        hint: 'Quizzes · puzzles · chess arena',
        keywords: 'play game arcade playground quiz puzzle chess explore os',
        icon: <Layers size={16} />,
        perform: () => navigate('/os'),
      },
      {
        id: 'action-3d',
        group: 'Actions',
        label: 'Enter the 3D experience',
        hint: 'Immersive mode',
        keywords: 'three 3d immersive experience webgl',
        icon: <Box size={16} />,
        perform: () => navigate('/3d'),
      },
      {
        id: 'action-email',
        group: 'Actions',
        label: 'Copy email address',
        hint: contact.email,
        keywords: 'copy email contact hire',
        icon: <Mail size={16} />,
        perform: () => {
          navigator.clipboard.writeText(contact.email).catch(() => {
            window.location.href = `mailto:${contact.email}`;
          });
        },
      },
    ];

    const connectItems: PaletteItem[] = [
      {
        id: 'connect-github',
        group: 'Connect',
        label: 'GitHub profile',
        keywords: 'github social code',
        icon: <Github size={16} />,
        perform: () => openExternal(personal.socialLinks.github),
      },
      {
        id: 'connect-linkedin',
        group: 'Connect',
        label: 'LinkedIn profile',
        keywords: 'linkedin social network hire',
        icon: <Linkedin size={16} />,
        perform: () => openExternal(personal.socialLinks.linkedin),
      },
      {
        id: 'connect-email',
        group: 'Connect',
        label: 'Send an email',
        hint: contact.email,
        keywords: 'email mail contact hire message',
        icon: <Mail size={16} />,
        perform: () => {
          window.location.href = `mailto:${contact.email}`;
        },
      },
    ];

    return [...sectionItems, ...offeringItems, ...projectItems, ...actionItems, ...connectItems];
  }, [dispatch, navigate]);

  const filteredItems = useMemo(
    () => (query.trim() ? items.filter((item) => matches(item, query)) : items),
    [items, query]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    document.documentElement.dataset.cmdkOpen = isOpen ? 'true' : 'false';
    if (isOpen) {
      // Focus after the panel mounts.
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => {
      document.documentElement.dataset.cmdkOpen = 'false';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener('keydown', handleGlobalKey);
    window.addEventListener(OPEN_PALETTE_EVENT, handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, filteredItems]);

  const runItem = (item: PaletteItem) => {
    close();
    item.perform();
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((index) => (filteredItems.length ? (index + 1) % filteredItems.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((index) =>
        filteredItems.length ? (index - 1 + filteredItems.length) % filteredItems.length : 0
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) runItem(item);
    }
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/60 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={close}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={handlePanelKeyDown}
            className={`w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl ${
              isDark
                ? 'border-white/10 bg-slate-900/95 text-white shadow-cyan-950/50'
                : 'border-slate-200 bg-white/95 text-slate-900 shadow-slate-300/60'
            }`}
          >
            <div
              className={`flex items-center gap-3 border-b px-4 py-3 ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <Search size={18} style={{ color: 'var(--os-primary)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a command or search…"
                className={`flex-1 bg-transparent text-base outline-none ${
                  isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
                }`}
                aria-label="Search commands"
              />
              <kbd
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${
                  isDark ? 'border-white/15 text-slate-400' : 'border-slate-300 text-slate-500'
                }`}
              >
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
              {filteredItems.length === 0 && (
                <p className={`px-3 py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No results for “{query}”.
                </p>
              )}
              {filteredItems.map((item, index) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                const isSelected = index === selectedIndex;

                return (
                  <React.Fragment key={item.id}>
                    {showGroup && (
                      <p
                        className={`px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.2em] ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {item.group}
                      </p>
                    )}
                    <button
                      type="button"
                      data-selected={isSelected}
                      onClick={() => runItem(item)}
                      onMouseMove={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        isSelected ? '' : isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: 'color-mix(in srgb, var(--os-primary) 14%, transparent)',
                              boxShadow:
                                'inset 0 0 0 1px color-mix(in srgb, var(--os-primary) 35%, transparent)',
                              color: isDark ? '#fff' : '#0f172a',
                            }
                          : undefined
                      }
                    >
                      <span className={isSelected ? '' : isDark ? 'text-slate-500' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate font-medium">{item.label}</span>
                      {item.hint && (
                        <span className={`truncate text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.hint}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            <div
              className={`flex items-center justify-between border-t px-4 py-2 text-[11px] ${
                isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'
              }`}
            >
              <span>↑↓ navigate · ↵ select · esc close</span>
              <span className="font-semibold">Ctrl / ⌘ + K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
