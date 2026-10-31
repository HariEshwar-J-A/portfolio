import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Mail, Phone, MapPin, Github as GitHub, Linkedin, Globe } from 'lucide-react';
import SectionShell, { glassPanel } from '../SectionShell';
const ContactForm = lazy(() => import('./ContactForm'));
const LinkedInTip = lazy(() => import('./ContactForm').then((mod) => ({ default: mod.LinkedInTip })));

const LinkedInButton: React.FC<{
  ready: boolean;
  onClick: () => void;
  backgroundColor: string;
}> = ({ ready, onClick, backgroundColor }) => {
  const button = (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full p-3 transition-all duration-300 hover:scale-110"
      style={{ backgroundColor, color: 'white' }}
      aria-label="LinkedIn"
    >
      <Linkedin size={24} />
    </button>
  );
  if (!ready) return button;
  return (
    <Suspense fallback={button}>
      <LinkedInTip>{button}</LinkedInTip>
    </Suspense>
  );
};

const ContactSection: React.FC = () => {
  const { theme } = useTheme();
  const { contact, personal } = portfolioData;
  const [muiReady, setMuiReady] = useState(false);

  useEffect(() => {
    const node = document.getElementById('contact');
    if (!node || typeof IntersectionObserver === 'undefined') {
      setMuiReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setMuiReady(true);
        observer.disconnect();
      },
      { rootMargin: '240px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleEmailClick = () => {
    window.location.href = `mailto:${contact.email}`;
  };
  
  const handlePhoneClick = () => {
    if (contact.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
  };
  
  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <SectionShell
      id="contact"
      eyebrow="Final chapter"
      title="Get In Touch"
      subtitle="Have a question or want to work together? Reach out to me directly."
    >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                    style={{ backgroundColor: `${theme.colors.primary}20` }}
                  >
                    <Mail size={20} style={{ color: theme.colors.primary }} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email</h4>
                    <button 
                      onClick={handleEmailClick}
                      className="text-primary hover:underline cursor-pointer"
                      style={{ color: theme.colors.primary }}
                    >
                      {contact.email}
                    </button>
                  </div>
                </div>
                
                {contact.phone && (
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ backgroundColor: `${theme.colors.primary}20` }}
                    >
                      <Phone size={20} style={{ color: theme.colors.primary }} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Phone</h4>
                      <button 
                        onClick={handlePhoneClick}
                        className="text-primary hover:underline cursor-pointer"
                        style={{ color: theme.colors.primary }}
                      >
                        {contact.phone}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                    style={{ backgroundColor: `${theme.colors.primary}20` }}
                  >
                    <MapPin size={20} style={{ color: theme.colors.primary }} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p>{contact.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Connect With Me</h3>
                <div className="flex space-x-4">
                  {personal.socialLinks.github && (
                    <button 
                      onClick={() => handleSocialClick(personal.socialLinks.github)}
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
                  
                  {personal.socialLinks.linkedin && (
                    <LinkedInButton
                      ready={muiReady}
                      onClick={() => handleSocialClick(personal.socialLinks.linkedin)}
                      backgroundColor={theme.colors.primary}
                    />
                  )}
                  
                  {personal.socialLinks.website && (
                    <button 
                      onClick={() => handleSocialClick(personal.socialLinks.website)}
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
                
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${theme.colors.primary}15` }}>
                  <p className="text-sm">
                    <span className="font-medium">Note:</span> If the contact form is unavailable, please feel free to connect with me on LinkedIn for direct communication.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`p-6 ${glassPanel(theme.mode === 'dark')}`}
            >
              <h3 className="text-2xl font-bold mb-6">Send Me a Message</h3>

              {muiReady ? (
                <Suspense fallback={<div className="min-h-72" aria-hidden />}>
                  <ContactForm />
                </Suspense>
              ) : (
                <div className="min-h-72" aria-hidden />
              )}
            </motion.div>
          </div>
    </SectionShell>
  );
};

export default ContactSection;