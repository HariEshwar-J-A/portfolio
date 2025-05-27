import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Dynamically import EmailJS
const initEmailJS = async () => {
  const emailjs = await import('@emailjs/browser');
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
};

// Initialize EmailJS when the contact form is in view
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      initEmailJS();
      observer.disconnect();
    }
  });
});

// Observe the contact section
document.addEventListener('DOMContentLoaded', () => {
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    observer.observe(contactSection);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);