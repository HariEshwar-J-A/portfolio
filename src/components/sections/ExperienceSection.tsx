import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Calendar, MapPin, Globe, Baseline as Timeline } from 'lucide-react';
import Plot from 'react-plotly.js';
import SectionShell, { glassPanel } from '../SectionShell';

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const parseWorkDate = (value: string): Date => {
  if (value === 'Present') return new Date();
  const [month, year] = value.split('-');
  return new Date(Number(year), MONTHS[month] ?? 0, 1);
};

const formatDuration = (start: Date, end: Date): string => {
  const totalMonths = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  );
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} mo`;
  return months === 0 ? `${years} yr` : `${years} yr ${months} mo`;
};

/**
 * Career span widget: a real Gantt of every role — when it started, how
 * long it ran, and where roles overlapped (freelance alongside co-op).
 * Replaces the old company-vs-date scatter, which answered no question.
 */
const CareerGantt: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const roles = [...portfolioData.experience]
    .map((exp) => ({
      ...exp,
      start: parseWorkDate(exp.startDate),
      end: parseWorkDate(exp.endDate),
      isSupport: /intern|part time/i.test(exp.position),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const rangeStart = roles[0].start.getTime();
  const rangeEnd = Math.max(...roles.map((role) => role.end.getTime()));
  const span = rangeEnd - rangeStart;
  const mutedText = isDark ? 'text-slate-500' : 'text-slate-400';

  const startYear = new Date(rangeStart).getFullYear();
  const endYear = new Date(rangeEnd).getFullYear();
  const yearMarks: number[] = [];
  for (let year = startYear + 1; year <= endYear; year += 1) yearMarks.push(year);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
          Career span · {formatDuration(new Date(rangeStart), new Date(rangeEnd))} and counting
        </p>
        <p className={`flex items-center gap-3 font-mono text-[10px] ${mutedText}`}>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-4 rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))' }}
            />
            full-time
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-4 rounded-full opacity-45"
              style={{ background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))' }}
            />
            intern / part-time
          </span>
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {roles.map((role, index) => {
          const left = ((role.start.getTime() - rangeStart) / span) * 100;
          const width = Math.max(2.5, ((role.end.getTime() - role.start.getTime()) / span) * 100);

          return (
            <div key={`${role.company}-${role.startDate}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-semibold">
                  {role.company}
                  <span className={`ml-2 text-xs font-normal ${mutedText}`}>{role.position}</span>
                </p>
                <p className={`font-mono text-[10px] ${mutedText}`}>
                  {role.startDate} → {role.endDate} · {formatDuration(role.start, role.end)}
                </p>
              </div>
              <div
                className={`relative mt-1.5 h-3.5 overflow-hidden rounded-full ${
                  isDark ? 'bg-white/5' : 'bg-slate-100'
                }`}
              >
                {yearMarks.map((year) => (
                  <span
                    key={year}
                    className={`absolute bottom-0 top-0 w-px ${isDark ? 'bg-white/10' : 'bg-slate-300/60'}`}
                    style={{ left: `${((new Date(year, 0, 1).getTime() - rangeStart) / span) * 100}%` }}
                  />
                ))}
                <motion.div
                  className="absolute bottom-0 top-0 rounded-full"
                  style={{
                    left: `${left}%`,
                    background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))',
                    opacity: role.isSupport ? 0.45 : 1,
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.07, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-3 flex justify-between font-mono text-[10px] ${mutedText}`}>
        <span>{startYear}</span>
        <span>today</span>
      </div>
    </div>
  );
};

const ExperienceSection: React.FC = () => {
  const { theme } = useTheme();
  const { experience } = portfolioData;
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');
  const isMinimal = useSelector((state: RootState) => state.view.mode) === 'minimal';

  // Get unique locations with their associated experiences
  const uniqueLocations = experience.reduce((acc, exp) => {
    const key = `${exp.location}`;
    if (!acc[key]) {
      acc[key] = {
        experiences: [],
        coordinates: getCoordinates(exp.location)
      };
    }
    acc[key].experiences.push(exp);
    return acc;
  }, {} as Record<string, { experiences: typeof experience, coordinates: [number, number] }>);

  // Helper function to get coordinates for each location
  function getCoordinates(location: string): [number, number] {
    const coordinates: Record<string, [number, number]> = {
      'Hamilton, ON, Canada': [-79.8711, 43.2557],
      'Hamilton, Canada': [-79.8711, 43.2557],
      'Mississauga, ON, Canada': [-79.6583, 43.589],
      'Mississauga, Canada': [-79.6583, 43.589],
      'Remote, ON, Canada': [-79.3832, 43.6532],
      Remote: [-79.3832, 43.6532],
      'Toronto, ON': [-79.3832, 43.6532],
      'Tamil Nadu, India': [78.6569, 11.1271],
      'Bangalore, India': [77.5946, 12.9716],
      'Chennai, India': [80.2707, 13.0827],
      'Thiruvallur, India': [79.1378, 13.1231],
    };
    return coordinates[location] || [0, 0];
  }

  const handleCompanyClick = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Prepare data for map visualization
  const mapData = Object.entries(uniqueLocations).map(([location, data]) => {
    const [lon, lat] = data.coordinates;
    const experiences = data.experiences;
    
    const text = experiences.map(exp => 
      `${exp.company}\n${exp.position}\n${exp.startDate} - ${exp.endDate}`
    ).join('\n\n');
    
    return {
      type: 'scattergeo',
      lon: [lon],
      lat: [lat],
      name: location,
      text: [text],
      mode: 'markers',
      marker: {
        size: 12,
        color: theme.colors.primary,
        line: {
          color: 'white',
          width: 2
        }
      },
      hoverinfo: 'text',
      hoverlabel: {
        bgcolor: theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        bordercolor: theme.colors.primary,
        font: { family: 'Inter, system-ui, sans-serif' }
      }
    };
  });

  const plotlyColors = theme.mode === 'dark' ? 
    { bg: 'rgba(30, 41, 59, 0.8)', text: '#fff', gridColor: 'rgba(255, 255, 255, 0.1)' } : 
    { bg: 'rgba(255, 255, 255, 0.8)', text: '#0f172a', gridColor: 'rgba(0, 0, 0, 0.1)' };

  return (
    <SectionShell
      id="experience"
      eyebrow="Journey"
      title="Work Experience"
      subtitle="My professional journey and the companies I've worked with."
      headerExtra={
        isMinimal ? undefined : (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all backdrop-blur ${
              viewMode === 'timeline'
                ? 'text-white shadow-lg'
                : theme.mode === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-slate-200'
            }`}
            style={{ backgroundColor: viewMode === 'timeline' ? theme.colors.primary : undefined }}
          >
            <Timeline size={20} />
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all backdrop-blur ${
              viewMode === 'map'
                ? 'text-white shadow-lg'
                : theme.mode === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-slate-200'
            }`}
            style={{ backgroundColor: viewMode === 'map' ? theme.colors.primary : undefined }}
          >
            <Globe size={20} />
            Map View
          </button>
        </div>
        )
      }
    >
        {isMinimal ? (
          /* Quick peek: one compact card per role, newest first */
          <div className="mx-auto max-w-3xl space-y-3">
            {experience.map((exp) => (
              <motion.div
                key={`${exp.company}-${exp.startDate}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35 }}
                className={`flex items-center gap-4 p-4 ${glassPanel(theme.mode === 'dark')}`}
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white p-1.5">
                  <img src={exp.logo} alt={exp.company} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{exp.position}</p>
                  <p className="truncate text-xs" style={{ color: theme.colors.primary }}>
                    {exp.company}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-[10px] opacity-60">
                  {exp.startDate} → {exp.endDate}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
        <>
        <div className={`${glassPanel(theme.mode === 'dark')} mb-16 overflow-x-auto p-4 md:p-6`}>
          {viewMode === 'timeline' ? (
            <CareerGantt isDark={theme.mode === 'dark'} />
          ) : (
            <Plot
              data={mapData}
              layout={{
                title: {
                  text: 'Global Work Experience',
                  font: { 
                    size: 24,
                    color: plotlyColors.text
                  }
                },
                font: { 
                  family: 'Inter, system-ui, sans-serif',
                  color: plotlyColors.text
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                autosize: true,
                height: 400,
                margin: { l: 0, r: 0, t: 80, b: 0 },
                geo: {
                  scope: 'world',
                  showland: true,
                  center: { lon: 0, lat: 20 },
                  projection: {
                    scale: 1.5,
                    type: "mercator",
                  },
                  landcolor: theme.mode === 'dark' ? 'rgb(30, 41, 59)' : 'rgb(243, 244, 246)',
                  showocean: true,
                  oceancolor: theme.mode === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(219, 234, 254)',
                  showcountries: true,
                  countrycolor: theme.mode === 'dark' ? 'rgb(51, 65, 85)' : 'rgb(203, 213, 225)',
                  showframe: false,
                  showcoastlines: true,
                  coastlinecolor: theme.mode === 'dark' ? 'rgb(71, 85, 105)' : 'rgb(148, 163, 184)',
                },
                hoverlabel: {
                  bgcolor: theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  font: { color: plotlyColors.text },
                  bordercolor: theme.colors.primary
                }
              }}
              config={{
                responsive: true,
                displayModeBar: false,
                scrollZoom: false
              }}
              style={{
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            />
          )}
        </div>
        
        <div className="space-y-12">
          {experience.map((exp) => (
            <motion.div
              key={`${exp.company}-${exp.startDate}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5 }}
              className={`p-6 ${glassPanel(theme.mode === 'dark')}`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white p-2">
                  <img 
                    src={exp.logo} 
                    alt={exp.company} 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold">{exp.position}</h3>
                  <button
                    onClick={() => handleCompanyClick(exp.website)}
                    className={`text-xl hover:underline ${exp.website ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{ color: theme.colors.primary }}
                    disabled={!exp.website}
                  >
                    {exp.company}
                  </button>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-sm opacity-70">
                      <Calendar size={16} className="mr-1" />
                      {exp.startDate} - {exp.endDate}
                    </div>
                    <div className="flex items-center text-sm opacity-70">
                      <MapPin size={16} className="mr-1" />
                      {exp.location}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="mb-4">{exp.description}</p>
                <div className="mt-4">
                  <h5 className="font-semibold mb-2">Key Achievements:</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </>
        )}
    </SectionShell>
  );
};

export default ExperienceSection;