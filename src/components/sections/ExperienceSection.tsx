import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Calendar, MapPin, Globe, Baseline as Timeline } from 'lucide-react';
import Plot from 'react-plotly.js';
import SectionShell, { glassPanel } from '../SectionShell';

const ExperienceSection: React.FC = () => {
  const { theme } = useTheme();
  const { experience } = portfolioData;
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');

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
      'Hamilton, Canada': [-79.8711, 43.2557],
      'Mississauga, Canada': [-79.6583, 43.5890],
      'Bangalore, India': [77.5946, 12.9716],
      'Chennai, India': [80.2707, 13.0827],
      'Thiruvallur, India': [79.1378, 13.1231]
    };
    return coordinates[location] || [0, 0];
  }

  const handleCompanyClick = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Prepare data for timeline visualization
  const timelineData = {
    companies: experience.toReversed().map(exp => exp.company),
    startDates: experience.toReversed().map(exp => new Date(exp.startDate)),
    endDates: experience.toReversed().map(exp => exp.endDate === 'Present' ? new Date() : new Date(exp.endDate)),
    endLabels: experience.toReversed().map(exp => exp.endDate),
    positions: experience.toReversed().map(exp => exp.position),
    locations: experience.toReversed().map(exp => exp.location),
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
      }
    >
        <div className={`${glassPanel(theme.mode === 'dark')} mb-16 overflow-x-auto p-4 md:p-6`}>
          {viewMode === 'timeline' ? (
            <Plot
              data={[
                {
                  x: timelineData.endDates,
                  y: timelineData.companies,
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { 
                    color: theme.colors.primary,
                    width: 3,
                    shape: 'spline'
                  },
                  marker: { 
                    color: theme.colors.primary,
                    size: 12,
                    symbol: 'circle',
                    line: {
                      color: theme.mode === 'dark' ? '#fff' : '#000',
                      width: 1
                    }
                  },
                  name: 'Career Path',
                  hoverinfo: 'text',
                  text: timelineData.companies.map((company, i) => 
                    `<b>${company}</b><br>` +
                    `${timelineData.positions[i]}<br>` +
                    `${timelineData.startDates[i].toLocaleDateString()} - ` +
                    `${timelineData.endLabels[i] === 'Present' ? 'Present' : timelineData.endDates[i].toLocaleDateString()}<br>` +
                    `📍 ${timelineData.locations[i]}`
                  ),
                }
              ]}
              layout={{
                title: {
                  text: 'Professional Timeline',
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
                margin: { l: 150, r: 50, t: 80, b: 50 },
                xaxis: {
                  showgrid: true,
                  gridcolor: plotlyColors.gridColor,
                  gridwidth: 1,
                  linecolor: plotlyColors.gridColor,
                  linewidth: 2,
                  tickfont: { 
                    size: 12,
                    color: plotlyColors.text
                  },
                  title: {
                    text: 'Timeline',
                    font: {
                      size: 14,
                      color: plotlyColors.text
                    }
                  },
                  type: 'date'
                },
                yaxis: {
                  showgrid: true,
                  gridcolor: plotlyColors.gridColor,
                  gridwidth: 1,
                  linecolor: plotlyColors.gridColor,
                  linewidth: 2,
                  tickfont: { 
                    size: 12,
                    color: plotlyColors.text
                  },
                  title: {
                    text: 'Companies',
                    font: {
                      size: 14,
                      color: plotlyColors.text
                    }
                  }
                },
                hovermode: 'closest',
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
    </SectionShell>
  );
};

export default ExperienceSection;