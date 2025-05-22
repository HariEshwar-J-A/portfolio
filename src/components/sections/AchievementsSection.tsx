import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Award, Medal, Trophy } from 'lucide-react';

const AchievementsSection: React.FC = () => {
  const { theme } = useTheme();
  const { achievements } = portfolioData;
  
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
        
        <div className="max-w-4xl mx-auto">
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(${theme.colors.primary}, ${theme.colors.secondary})` }}>
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-odd:ml-8 group-even:mr-8 md:group-odd:ml-0 md:group-even:mr-0 md:mx-auto" style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
                  {getIcon(achievement.title)}
                </div>
                
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg shadow-lg ${
                  theme.mode === 'dark' ? 'bg-slate-700' : 'bg-white'
                }`}>
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <h3 className="text-lg font-bold">{achievement.title}</h3>
                    <time className="text-sm" style={{ color: theme.colors.primary }}>{achievement.date}</time>
                  </div>
                  <p>{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;