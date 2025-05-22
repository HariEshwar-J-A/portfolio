import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize EmailJS
import emailjs from 'emailjs-com';
import { portfolioData } from './data/portfolioData.ts';

// Initialize EmailJS with user ID
// In a real app, you would want to properly set up environment variables
emailjs.init(portfolioData.contact.emailjsUserId);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);