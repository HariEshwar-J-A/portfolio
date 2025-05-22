import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Calendar, MapPin } from 'lucide-react';
import Plot from 'react-plotly.js';

const ExperienceSection: React.FC = () => {
  const { theme } = useTheme();
  const { experience } = portfolioData;

  // Prepare data for timeline visualization
  const timelineData = {
    companies: experience.map(exp => exp.company),
    startDates: experience.map(exp => new Date(exp.startDate)),
    endDates: experience.map(exp => exp.endDate === 'Present' ? new Date() : new Date(exp.endDate)),
    positions: experience.map(exp => exp.position),
  };
  
  useEffect(() => {
    console.log(timelineData);
  }, [timelineData]);
  
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
        </motion.div>
        
        <div className="mb-16 overflow-x-auto">
          <Plot
            data={[
              {
                x: timelineData.companies.map((_, i) => [timelineData.startDates[i], timelineData.endDates[i]]),
                y: timelineData.companies,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: theme.colors.primary, width: 4 },
                marker: { color: theme.colors.primary, size: 12 },
                name: 'Experience Timeline',
                hoverinfo: 'text',
                text: timelineData.companies.map((company, i) => 
                  `${company}: ${timelineData.positions[i]}<br>` +
                  `${timelineData.startDates[i].toLocaleDateString()} - ` +
                  `${timelineData.endDates[i] === new Date() ? 'Present' : timelineData.endDates[i].toLocaleDateString()}`
                ),
              }
            ]}
            layout={{
              title: 'Career Timeline',
              font: { color: plotlyColors.text },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              autosize: true,
              height: 300,
              margin: { l: 120, r: 50, t: 80, b: 50 },
              xaxis: {
                showgrid: true,
                gridcolor: plotlyColors.gridColor,
                gridwidth: 1,
                linecolor: plotlyColors.gridColor,
                linewidth: 1,
                tickfont: { color: plotlyColors.text },
                title: { text: 'Date', font: { color: plotlyColors.text } },
              },
              yaxis: {
                showgrid: true,
                gridcolor: plotlyColors.gridColor,
                gridwidth: 1,
                linecolor: plotlyColors.gridColor,
                linewidth: 1,
                tickfont: { color: plotlyColors.text },
              },
              hovermode: 'closest',
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
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