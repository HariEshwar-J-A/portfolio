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

emailjs.init({
  publicKey: 'EMAILJS_PUBLIC_KEY',
  // Do not allow headless browsers
  blockHeadless: true,
  blockList: {
    // Block the suspended emails
    list: ['foo@emailjs.com', 'bar@emailjs.com'],
    // The variable contains the email address
    watchVariable: 'userEmail',
  },
  limitRate: {
    // Set the limit rate for the application
    id: 'app',
    // Allow 1 request per 10s
    throttle: 10000,
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);