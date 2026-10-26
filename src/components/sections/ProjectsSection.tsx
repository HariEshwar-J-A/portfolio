import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData, type Project } from '../../data/portfolioData';
import { useHat } from '../../context/hat-context';
import { applyOrder, HAT_PROJECT_PREVIEW, projectShortLine } from '../../lib/hatView';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionShell, { glassPanel } from '../SectionShell';
import HatDisclosure from '../HatDisclosure';

const ProjectLinks: React.FC<{
  project: Project;
  primary: string;
  emphasize?: boolean;
  iconSize?: number;
}> = ({ project, primary, emphasize = false, iconSize = 14 }) => (
  <>
    {project.demoLink && (
      <a
        href={project.demoLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center text-sm ${emphasize || project.demoLabel ? 'font-semibold' : ''}`}
        style={{ color: primary }}
      >
        <ExternalLink size={iconSize} className="mr-1" />
        {project.demoLabel ?? 'Demo'}
      </a>
    )}
    {project.sourceLink && (
      <a
        href={project.sourceLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center text-sm ${emphasize ? 'font-semibold' : ''}`}
        style={{ color: primary }}
      >
        <Github size={iconSize} className="mr-1" />
        Source
      </a>
    )}
  </>
);

const HatProjectCard: React.FC<{
  project: Project;
  isDark: boolean;
  primary: string;
}> = ({ project, isDark, primary }) => {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const shortLine = projectShortLine(project.description);
  const fullLine = project.description.replace(/\s+/g, ' ').trim();
  const extraTech = project.technologies.slice(3);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.995 }}
      transition={{ duration: reduce ? 0 : 0.28, ease: 'easeOut' }}
      className={`p-5 md:p-6 ${glassPanel(isDark)}`}
    >
      <div className="flex gap-4">
        <img src={project.image} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0">
          <h3 className="text-lg font-bold">{project.title}</h3>
          <p className={`mt-1 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{shortLine}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {project.technologies.slice(0, 3).map((tech) => (
          <span
            key={tech}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
          >
            {tech}
          </span>
        ))}
        <span className="ml-auto flex gap-4">
          <ProjectLinks project={project} primary={primary} emphasize />
        </span>
      </div>
      <HatDisclosure open={open}>
        <p className={`pt-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{project.description}</p>
        {extraTech.length > 0 && (
          <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{extraTech.join(' · ')}</p>
        )}
      </HatDisclosure>
      {shortLine !== fullLine && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-3 text-sm font-semibold"
          style={{ color: primary }}
        >
          {open ? 'Show less' : 'Show all'}
        </button>
      )}
    </motion.article>
  );
};

const ProjectsSection: React.FC = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const hat = useHat();
  const projects = hat
    ? applyOrder(portfolioData.projects, hat.projectOrder, (project) => project.id)
    : portfolioData.projects;
  const [filter, setFilter] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMinimal = useSelector((state: RootState) => state.view.mode) === 'minimal';

  // Reset scroll position when filter changes
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [filter]);
  
  const allTechnologies = Array.from(
    new Set(projects.flatMap(project => project.technologies))
  );
  
  // Minimal view: featured work only — the quick-peek shortlist.
  const visibleProjects = isMinimal ? projects.filter((project) => project.featured) : projects;
  const filteredProjects = filter
    ? visibleProjects.filter(project => project.technologies.includes(filter))
    : visibleProjects;
    
  const handleTechFilter = (tech: string | null) => {
    setFilter(tech);
  };
  
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -width : width;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (hat) {
    const preview = filteredProjects.slice(0, HAT_PROJECT_PREVIEW);
    const hidden = filteredProjects.slice(HAT_PROJECT_PREVIEW);
    return (
      <SectionShell
        id="projects"
        eyebrow="Selected work"
        title="Projects"
        subtitle="Three builds up front. The rest stay one click away."
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {preview.map((project) => (
            <HatProjectCard
              key={project.id}
              project={project}
              isDark={theme.mode === 'dark'}
              primary={theme.colors.primary}
            />
          ))}
          {hidden.length > 0 && (
            <>
              <HatDisclosure open={showAllProjects}>
                <div className="flex flex-col gap-5 pt-1">
                  {hidden.map((project) => (
                    <HatProjectCard
                      key={project.id}
                      project={project}
                      isDark={theme.mode === 'dark'}
                      primary={theme.colors.primary}
                    />
                  ))}
                </div>
              </HatDisclosure>
              <button
                type="button"
                onClick={() => setShowAllProjects((open) => !open)}
                className="self-start text-sm font-semibold"
                style={{ color: theme.colors.primary }}
              >
                {showAllProjects ? 'Show less' : `Show all (${filteredProjects.length})`}
              </button>
            </>
          )}
        </div>
      </SectionShell>
    );
  }
  
  return (
    <SectionShell
      id="projects"
      eyebrow="Selected work"
      title="Projects"
      subtitle="A showcase of my recent work and projects."
    >
        <div className={`flex flex-wrap justify-center mb-8 gap-2 ${isMinimal ? 'hidden' : ''}`}>
          <button
            onClick={() => handleTechFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === null
                ? 'text-white'
                : theme.mode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
            }`}
            style={{ 
              backgroundColor: filter === null ? theme.colors.primary : 'transparent',
              border: `1px solid ${filter === null ? theme.colors.primary : theme.mode === 'dark' ? '#4B5563' : '#D1D5DB'}`
            }}
          >
            All
          </button>
          {allTechnologies.sort().map(tech => (
            <button
              key={tech}
              onClick={() => handleTechFilter(tech)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tech
                  ? 'text-white'
                  : theme.mode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
              }`}
              style={{ 
                backgroundColor: filter === tech ? theme.colors.primary : 'transparent',
                border: `1px solid ${filter === tech ? theme.colors.primary : theme.mode === 'dark' ? '#4B5563' : '#D1D5DB'}`
              }}
            >
              {tech}
            </button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={filter || 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {
                filteredProjects.length > 3 && 
                <button
                  aria-label="Previous projects"
                  onClick={() => scrollCarousel('left')}
                  className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow"
                  style={{ backgroundColor: theme.colors.primary, color: 'white' }}
                  disabled={filteredProjects.length < 4}
                  aria-disabled={filteredProjects.length < 4}
                >
                  <ChevronLeft />
                </button>
              }
              <div
                ref={carouselRef}
                className="flex overflow-x-auto gap-8 pb-4 scroll-smooth snap-x snap-mandatory overflow-y-hidden no-scrollbar-y"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.title}
                    initial={reduce ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : index * 0.1 }}
                    className={`flex-shrink-0 w-80 sm:w-96 snap-center overflow-hidden h-full flex flex-col ${glassPanel(
                      theme.mode === 'dark'
                    )}`}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
                      />
                      {project.featured && (
                        <div
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: theme.colors.primary, color: 'white' }}
                        >
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="mb-4 opacity-80">{project.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map(tech => (
                          <button
                            key={tech}
                            onClick={() => handleTechFilter(tech)}
                            className={`px-2 py-1 rounded text-xs transition-colors hover:bg-opacity-80 ${
                              theme.mode === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                            }`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`flex justify-between px-6 py-4 ${
                      theme.mode === 'dark' ? 'border-t border-slate-700' : 'border-t border-slate-200'
                    }`}>
                      <ProjectLinks project={project} primary={theme.colors.primary} iconSize={16} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {
                filteredProjects.length > 3 && 
                <button
                  aria-label="Next projects"
                  onClick={() => scrollCarousel('right')}
                  className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow"
                  style={{ backgroundColor: theme.colors.primary, color: 'white' }}
                >
                  <ChevronRight />
                </button>
              }
            </div>
          </motion.div>
        </AnimatePresence>
    </SectionShell>
  );
};

export default ProjectsSection;