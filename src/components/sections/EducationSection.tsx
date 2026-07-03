import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Calendar, MapPin, GraduationCap } from 'lucide-react';
import SectionShell, { glassPanel } from '../SectionShell';

const EducationSection: React.FC = () => {
  const { theme } = useTheme();
  const { education } = portfolioData;

  return (
    <SectionShell
      id="education"
      eyebrow="Foundations"
      title="Education"
      subtitle="My academic background and qualifications."
    >
        <div className="space-y-12 max-w-4xl mx-auto">
          {education.map((edu, index) => (
            <motion.div
              key={`${edu.institution}-${edu.degree}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 ${glassPanel(theme.mode === 'dark')}`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {edu.logo && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white p-2">
                    <img 
                      src={edu.logo} 
                      alt={edu.institution} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <GraduationCap 
                      size={24} 
                      className="mr-2"
                      style={{ color: theme.colors.primary }}
                    />
                    <h3 className="text-2xl font-bold">{edu.institution}</h3>
                  </div>
                  
                  <h4 className="text-xl mb-2">
                    {edu.degree} in {edu.field}
                  </h4>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-sm opacity-70">
                      <Calendar size={16} className="mr-1" />
                      {edu.startDate} - {edu.endDate}
                    </div>
                    <div className="flex items-center text-sm opacity-70">
                      <MapPin size={16} className="mr-1" />
                      {edu.location}
                    </div>
                    {edu.gpa && (
                      <div className="flex items-center text-sm" style={{ color: theme.colors.primary }}>
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </div>
                  
                  {edu.description && (
                    <p className="mt-4">{edu.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
    </SectionShell>
  );
};

export default EducationSection;