import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Award, Medal, Trophy } from 'lucide-react';

const AchievementsSection: React.FC = () => {
  const { theme } = useTheme();
  const { achievements } = portfolioData;
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);
  
  const getIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('award')) return <Trophy size={24} />;
    if (lowerTitle.includes('speaker') || lowerTitle.includes('conference')) return <Medal size={24} />;
    return <Award size={24} />;
  };
  
  return (
    <section 
      id="achievements" 
      className={`min-h-screen py-20 ${
        theme.mode === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Achievements</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            Notable accomplishments and recognition throughout my career.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto relative">
          {/* Timeline Line */}
          <div 
            className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 rounded"
            style={{ 
              background: `linear-gradient(to bottom, ${theme.colors.primary}, ${theme.colors.secondary})` 
            }}
          ></div>
          
          {/* Achievement Items */}
          <div className="relative space-y-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex items-center"
                onHoverStart={() => setSelectedAchievement(index)}
                onHoverEnd={() => setSelectedAchievement(null)}
              >
                {/* Timeline Node */}
                <motion.div 
                  className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 rounded-full border-4"
                  style={{ 
                    backgroundColor: theme.mode === 'dark' ? theme.colors.dark.surface : theme.colors.light.surface,
                    borderColor: selectedAchievement === index ? theme.colors.accent : theme.colors.primary
                  }}
                  whileHover={{ scale: 1.2 }}
                  animate={{
                    scale: selectedAchievement === index ? 1.2 : 1,
                    borderColor: selectedAchievement === index ? theme.colors.accent : theme.colors.primary
                  }}
                />
                
                {/* Achievement Content */}
                <motion.div 
                  className="pl-12 md:pl-8 w-full md:w-5/12 ml-auto"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className={`p-6 rounded-lg shadow-lg ${
                      theme.mode === 'dark' ? 'bg-slate-700' : 'bg-white'
                    }`}
                    animate={{
                      backgroundColor: selectedAchievement === index 
                        ? theme.mode === 'dark' ? theme.colors.dark.surface : theme.colors.light.surface
                        : theme.mode === 'dark' ? 'rgb(51, 65, 85)' : 'white'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          style={{ color: theme.colors.primary }}
                        >
                          {getIcon(achievement.title)}
                        </motion.div>
                        <h3 className="text-xl font-bold">{achievement.title}</h3>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {selectedAchievement === index && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-base leading-relaxed"
                        >
                          {achievement.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    
                    <div className="mt-2">
                      <span 
                        className="text-sm"
                        style={{ color: theme.colors.primary }}
                      >
                        {achievement.date}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;