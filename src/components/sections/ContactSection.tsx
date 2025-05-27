import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle, Github as GitHub, Linkedin, Globe } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateForm, submitForm, resetStatus } from '../../store/slices/contactSlice';
import { RootState } from '../../store/store';
import { TextField, Button, Snackbar, Alert, CircularProgress, Tooltip } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const ContactSection: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { form, isSubmitting, isSuccess, isError, errorMessage } = useSelector((state: RootState) => state.contact);
  const { contact, personal } = portfolioData;
  
  const muiTheme = createTheme({
    palette: {
      mode: theme.mode,
      primary: {
        main: theme.colors.primary,
      },
      error: {
        main: theme.colors.error,
      },
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(updateForm({ [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(submitForm());
  };
  
  const handleCloseSnackbar = () => {
    dispatch(resetStatus());
  };
  
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
    <section 
      id="contact" 
      className={`min-h-screen py-20 ${
        theme.mode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <ThemeProvider theme={muiTheme}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-lg max-w-2xl mx-auto opacity-80">
              Have a question or want to work together? Reach out to me directly.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                    <Tooltip title="Connect with me on LinkedIn if email is unavailable!" arrow>
                      <button 
                        onClick={() => handleSocialClick(personal.socialLinks.linkedin)}
                        className="p-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                        style={{ 
                          backgroundColor: theme.colors.primary,
                          color: 'white'
                        }}
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={24} />
                      </button>
                    </Tooltip>
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
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-6 rounded-lg shadow-lg ${
                theme.mode === 'dark' ? 'bg-slate-800' : 'bg-slate-50'
              }`}
            >
              <h3 className="text-2xl font-bold mb-6">Send Me a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={form.message}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={5}
                  variant="outlined"
                />
                
                <Button 
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>
          </div>
          
          <Snackbar 
            open={isSuccess || isError} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={isSuccess ? 'success' : 'error'}
              variant="filled"
              icon={isSuccess ? <CheckCircle /> : <AlertCircle />}
            >
              {isSuccess 
                ? 'Your message has been sent successfully!' 
                : <>
                    Failed to send message: {errorMessage}. 
                    <br />
                    <span className="font-semibold">
                      Please reach out via LinkedIn if email is unavailable!
                    </span>
                  </>
              }
            </Alert>
          </Snackbar>
        </div>
      </ThemeProvider>
    </section>
  );
};

export default ContactSection;