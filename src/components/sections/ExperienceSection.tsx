import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Calendar, MapPin, Globe, Baseline as Timeline } from 'lucide-react';
import Plot from 'react-plotly.js';

const ExperienceSection: React.FC = () => {
  const { theme } = useTheme();
  const { experience } = portfolioData;
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');

  // Prepare data for timeline visualization
  const timelineData = {
    companies: experience.map(exp => exp.company),
    startDates: experience.map(exp => new Date(exp.startDate)),
    endDates: experience.map(exp => exp.endDate === 'Present' ? new Date() : new Date(exp.endDate)),
    positions: experience.map(exp => exp.position),
    locations: experience.map(exp => exp.location),
  };

  // Prepare data for map visualization
  const mapData = experience.map(exp => ({
    type: 'scattergeo',
    lon: [78.9629], // Bangalore coordinates
    lat: [17.3850],
    name: exp.company,
    text: [
      `${exp.company}<br>${exp.position}<br>${exp.startDate} - ${exp.endDate}<br>${exp.location}`
    ],
    mode: 'markers',
    marker: {
      size: 12,
      color: theme.colors.primary,
      line: {
        color: 'white',
        width: 2
      }
    },
    hoverinfo: 'text'
  }));

  const plotlyColors = theme.mode === 'dark' ? 
    { bg: 'rgba(30, 41, 59, 0.8)', text: '#fff', gridColor: 'rgba(255, 255, 255, 0.1)' } : 
    { bg: 'rgba(255, 255, 255, 0.8)', text: '#0f172a', gridColor: 'rgba(0, 0, 0, 0.1)' };

  return (
    <section 
      id="experience" 
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
          <h2 className="text-4xl font-bold mb-4">Work Experience</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            My professional journey and the companies I've worked with.
          </p>
          
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'timeline'
                  ? 'bg-primary text-white'
                  : theme.mode === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}
              style={{ backgroundColor: viewMode === 'timeline' ? theme.colors.primary : undefined }}
            >
              <Timeline size={20} />
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-primary text-white'
                  : theme.mode === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}
              style={{ backgroundColor: viewMode === 'map' ? theme.colors.primary : undefined }}
            >
              <Globe size={20} />
              Map View
            </button>
          </div>
        </motion.div>
        
        <div className="mb-16 overflow-x-auto">
          {viewMode === 'timeline' ? (
            <Plot
              data={[
                {
                  x: timelineData.endDate,
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
                    `${timelineData.endDates[i] === new Date() ? 'Present' : timelineData.endDates[i].toLocaleDateString()}<br>` +
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
                  landcolor: theme.mode === 'dark' ? 'rgb(30, 41, 59)' : 'rgb(243, 244, 246)',
                  showocean: true,
                  oceancolor: theme.mode === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(219, 234, 254)',
                  showcountries: true,
                  countrycolor: theme.mode === 'dark' ? 'rgb(51, 65, 85)' : 'rgb(203, 213, 225)',
                  showframe: false,
                  showcoastlines: true,
                  coastlinecolor: theme.mode === 'dark' ? 'rgb(71, 85, 105)' : 'rgb(148, 163, 184)',
                  projection: {
                    type: 'mercator'
                  }
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
          {experience.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${exp.startDate}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 rounded-lg shadow-lg ${
                theme.mode === 'dark' ? 'bg-slate-800' : 'bg-slate-50'
              }`}
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
                  <h4 className="text-xl" style={{ color: theme.colors.primary }}>{exp.company}</h4>
                  
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
      </div>
    </section>
  );
};

export default ExperienceSection;