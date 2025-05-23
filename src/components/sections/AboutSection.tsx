import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Github as GitHub, Linkedin, Twitter, Globe } from 'lucide-react';

const AboutSection: React.FC = () => {
  const { theme } = useTheme();
  const { name, title, bio, photo, socialLinks } = portfolioData.personal;
  
  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <section 
      id="about" 
      className={`min-h-screen flex items-center py-20 ${
        theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full md:w-2/5">
            <motion.div
              className="relative overflow-hidden rounded-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img 
                src={photo} 
                alt={name} 
                className="w-full h-auto rounded-xl object-cover shadow-xl"
                style={{ maxHeight: '500px' }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t"
                style={{ 
                  backgroundImage: `linear-gradient(to top, ${theme.colors.primary}80, transparent)` 
                }}
              ></div>
            </motion.div>
          </div>
          
          <motion.div 
            className="w-full md:w-3/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Hi, I'm <span style={{ color: theme.colors.primary }}>{name}</span>
            </h1>
            <h2 className="text-xl md:text-2xl mb-6 opacity-80">{title}</h2>
            <p className="text-lg leading-relaxed mb-8 opacity-90">{bio}</p>
            
            <div className="flex space-x-4">
              {socialLinks.github && (
                <button 
                  onClick={() => handleSocialClick(socialLinks.github)}
                  className="p-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    color: 'white'
                  }}
                  aria-label="GitHub"
                >
                  <GitHub size={24} />
                </button>
              )}
              
              {socialLinks.linkedin && (
                <button 
                  onClick={() => handleSocialClick(socialLinks.linkedin)}
                  className="p-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    color: 'white'
                  }}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} />
                </button>
              )}
              
              {socialLinks.twitter && (
                <button 
                  onClick={() => handleSocialClick(socialLinks.twitter)}
                  className="p-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    color: 'white'
                  }}
                  aria-label="Twitter"
                >
                  <Twitter size={24} />
                </button>
              )}
              
              {socialLinks.website && (
                <button 
                  onClick={() => handleSocialClick(socialLinks.website)}
                  className="p-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    color: 'white'
                  }}
                  aria-label="Website"
                >
                  <Globe size={24} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;