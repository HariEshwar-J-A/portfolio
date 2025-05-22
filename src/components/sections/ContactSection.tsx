import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { portfolioData } from '../../data/portfolioData';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateForm, submitForm, resetStatus } from '../../store/slices/contactSlice';
import { RootState } from '../../store/store';
import { TextField, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const ContactSection: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { form, isSubmitting, isSuccess, isError, errorMessage } = useSelector((state: RootState) => state.contact);
  const { contact } = portfolioData;
  
  // Create Material UI theme
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
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:underline"
                      style={{ color: theme.colors.primary }}
                    >
                      {contact.email}
                    </a>
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
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-primary hover:underline"
                        style={{ color: theme.colors.primary }}
                      >
                        {contact.phone}
                      </a>
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
                  {portfolioData.personal.socialLinks.github && (
                    <a 
                      href={portfolioData.personal.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        color: 'white'
                      }}
                      aria-label="GitHub"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                  )}
                  
                  {portfolioData.personal.socialLinks.linkedin && (
                    <a 
                      href={portfolioData.personal.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        color: 'white'
                      }}
                      aria-label="LinkedIn"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  )}
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
                : `Failed to send message: ${errorMessage}`
              }
            </Alert>
          </Snackbar>
        </div>
      </ThemeProvider>
    </section>
  );
};

export default ContactSection;