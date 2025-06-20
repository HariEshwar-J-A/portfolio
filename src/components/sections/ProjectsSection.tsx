import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';

const ProjectsSection: React.FC = () => {
  const { theme } = useTheme();
  const { projects } = portfolioData;
  const [filter, setFilter] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when filter changes
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [filter]);
  
  const allTechnologies = Array.from(
    new Set(projects.flatMap(project => project.technologies))
  );
  
  const filteredProjects = filter
    ? projects.filter(project => project.technologies.includes(filter))
    : projects;
    
  const handleTechFilter = (tech: string | null) => {
    setFilter(tech);
  };
  
  const handleProjectLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -width : width;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <section 
      id="projects" 
      className={`min-h-screen py-20 ${
        theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Projects</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            A showcase of my recent work and projects.
          </p>
        </motion.div>
        
        <div className="flex flex-wrap justify-center mb-8 gap-2">
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex-shrink-0 w-80 sm:w-96 snap-center rounded-lg overflow-hidden shadow-lg h-full flex flex-col ${
                      theme.mode === 'dark' ? 'bg-slate-800' : 'bg-slate-50'
                    }`}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
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

                    <div className={`px-6 py-4 flex justify-between ${
                      theme.mode === 'dark' ? 'border-t border-slate-700' : 'border-t border-slate-200'
                    }`}>
                      {project.demoLink && (
                        <button
                          onClick={() => handleProjectLink(project.demoLink!)}
                          className="flex items-center transition-colors hover:text-primary"
                          style={{ color: theme.colors.primary }}
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Demo
                        </button>
                      )}

                      {project.sourceLink && (
                        <button
                          onClick={() => handleProjectLink(project.sourceLink!)}
                          className="flex items-center transition-colors hover:text-primary"
                          style={{ color: theme.colors.primary }}
                        >
                          <Github size={16} className="mr-1" />
                          Source
                        </button>
                      )}
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
      </div>
    </section>
  );
};

export default ProjectsSection;