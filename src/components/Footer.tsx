import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Github as GitHub, Linkedin, Twitter, Globe } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const { socialLinks } = portfolioData.personal;
  
  const year = new Date().getFullYear();
  
  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <footer 
      className={`py-8 mt-12 border-t ${
        theme.mode === 'dark' 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className={theme.mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              © {year} {portfolioData.personal.name}. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-4">
            {socialLinks.github && (
              <button 
                onClick={() => handleSocialClick(socialLinks.github)}
                className={`p-2 rounded-full transition-colors hover:text-primary-700 cursor-pointer`}
                style={{ color: theme.mode === 'dark' ? '#fff' : '#0F172A' }}
                aria-label="GitHub"
              >
                <GitHub size={20} />
              </button>
            )}
            
            {socialLinks.linkedin && (
              <button 
                onClick={() => handleSocialClick(socialLinks.linkedin)}
                className={`p-2 rounded-full transition-colors hover:text-primary-700 cursor-pointer`}
                style={{ color: theme.mode === 'dark' ? '#fff' : '#0F172A' }}
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </button>
            )}
            
            {socialLinks.twitter && (
              <button 
                onClick={() => handleSocialClick(socialLinks.twitter)}
                className={`p-2 rounded-full transition-colors hover:text-primary-700 cursor-pointer`}
                style={{ color: theme.mode === 'dark' ? '#fff' : '#0F172A' }}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </button>
            )}
            
            {socialLinks.website && (
              <button 
                onClick={() => handleSocialClick(socialLinks.website)}
                className={`p-2 rounded-full transition-colors hover:text-primary-700 cursor-pointer`}
                style={{ color: theme.mode === 'dark' ? '#fff' : '#0F172A' }}
                aria-label="Website"
              >
                <Globe size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;