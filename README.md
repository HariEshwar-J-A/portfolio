# Harieshwar J A - Portfolio Website

![Portfolio Preview](/Harieshwar-Portfolio.gif)

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. This portfolio showcases professional experience, skills, projects, and achievements in an interactive and visually appealing manner.

## 🌟 Features

- **Responsive Design**: Fully responsive layout that works seamlessly across all devices and screen sizes
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Interactive UI**: Smooth animations and transitions powered by Framer Motion
- **Data Visualization**: Dynamic charts and graphs using D3.js and Plotly.js
- **Accessibility**: WCAG compliant with a focus on keyboard navigation and screen reader support
- **Performance Optimized**: Lazy loading, code splitting, and optimized assets for fast loading
- **Contact Form**: Integrated email functionality using EmailJS
- **State Management**: Centralized state management with Redux Toolkit and Redux Saga
- **TypeScript**: Type-safe code for better developer experience and fewer bugs

## 📋 Table of Contents

- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Customization](#-customization)
- [Performance Optimization](#-performance-optimization)
- [Accessibility Features](#-accessibility-features)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠 Technologies Used

### Frontend Framework & Libraries
- **React 18**: Modern UI library for building component-based interfaces
- **TypeScript**: Strongly typed programming language that builds on JavaScript
- **Redux Toolkit**: State management library for predictable state updates
- **Redux Saga**: Middleware for handling side effects in Redux
- **Framer Motion**: Animation library for React
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### UI Components & Styling
- **Material UI**: React component library implementing Google's Material Design
- **Lucide React**: Beautiful & consistent icon set
- **Emotion**: CSS-in-JS library for component-scoped styling

### Data Visualization
- **D3.js**: JavaScript library for producing dynamic, interactive data visualizations
- **Plotly.js**: High-level, declarative charting library
- **React-Plotly.js**: React wrapper for Plotly.js

### Form Handling & Communication
- **EmailJS**: Client-side email sending without a server

### Development & Build Tools
- **Vite**: Next-generation frontend tooling for faster development and optimized builds
- **ESLint**: Linting utility for JavaScript and TypeScript
- **Lighthouse**: Automated tool for improving web page quality
- **Vitest**: Unit testing framework compatible with Vite

## 🗂 Project Structure

```
portfolio-app/
├── public/                  # Static assets
│   └── assets/
│       └── images/          # Image assets
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Page footer
│   │   └── sections/        # Main content sections
│   │       ├── AboutSection.tsx
│   │       ├── SkillsSection.tsx
│   │       ├── ExperienceSection.tsx
│   │       ├── EducationSection.tsx
│   │       ├── ProjectsSection.tsx
│   │       ├── AchievementsSection.tsx
│   │       └── ContactSection.tsx
│   ├── data/                # Data files
│   │   └── portfolioData.ts # Content data for the portfolio
│   ├── hooks/               # Custom React hooks
│   │   ├── useTheme.ts      # Theme management hook
│   │   └── useScroll.ts     # Scroll tracking hook
│   ├── store/               # Redux store configuration
│   │   ├── slices/          # Redux Toolkit slices
│   │   ├── sagas/           # Redux Sagas
│   │   ├── rootReducer.ts   # Combined reducers
│   │   ├── rootSaga.ts      # Combined sagas
│   │   └── store.ts         # Store configuration
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── index.html               # HTML entry point
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/portfolio-app.git
   cd portfolio-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

To set up EmailJS:
1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a service and template
3. Get your service ID, template ID, and public key
4. Add them to your `.env` file

### Lighthouse Configuration

The project includes a `lighthouserc.json` file that configures Lighthouse CI to ensure high-quality standards for:
- Performance
- Accessibility
- Best Practices
- SEO

Run Lighthouse tests with:
```bash
npm run lighthouse
```

## 🎨 Customization

### Personal Information

Edit the `src/data/portfolioData.ts` file to update:
- Personal details
- Work experience
- Education
- Skills
- Projects
- Achievements
- Contact information

### Theme Customization

The color scheme can be customized in the `portfolioData.ts` file under the `colors` object:

```typescript
colors: {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#F97316",
  // ... other colors
}
```

### Adding New Sections

To add a new section to the portfolio:

1. Create a new component in `src/components/sections/`
2. Add the section to the `App.tsx` file
3. Update the navigation in `Header.tsx`
4. Add the section ID to the `sections` array in the navigation slice

## 🚄 Performance Optimization

The portfolio implements several performance optimizations:

### Code Splitting
- Non-critical sections are lazy-loaded using React's `lazy` and `Suspense`
- This reduces the initial bundle size and improves load time

### Asset Optimization
- Images are properly sized and include width/height attributes to prevent layout shifts
- External resources are preconnected and preloaded where appropriate

### Bundle Optimization
- Vite's build configuration includes chunk splitting for vendor libraries
- Assets are organized into appropriate directories during build

### Monitoring
- Lighthouse CI is configured to ensure performance standards are maintained

## ♿ Accessibility Features

The portfolio is designed with accessibility in mind:

- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **ARIA Attributes**: Used appropriately to enhance screen reader experience
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Skip Link**: Allows keyboard users to bypass navigation
- **Color Contrast**: Meets WCAG AA standards for readability
- **Focus Management**: Visible focus indicators for keyboard users
- **Responsive Design**: Accessible on all device sizes
- **Screen Reader Announcements**: Proper labeling for all interactive elements

## 🚢 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

This will generate optimized production files in the `dist` directory.

### Deployment Options

The portfolio can be deployed to various platforms:

- **Netlify**: Connect your GitHub repository or drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository for automatic deployments
- **GitHub Pages**: Push the `dist` folder to a `gh-pages` branch
- **AWS S3/CloudFront**: Upload the `dist` folder to an S3 bucket and configure CloudFront

## 🔮 Future Enhancements

The following features are planned for future releases:

### Short-term Roadmap
- **Blog Section**: Add a blog section with MDX support
- **Internationalization**: Support for multiple languages
- **Project Filtering**: Enhanced filtering options for projects
- **Testimonials Section**: Add a section for testimonials and recommendations
- **Printable Resume**: Add option to download a PDF version of the resume

### Long-term Roadmap
- **CMS Integration**: Headless CMS for easier content management
- **Analytics Dashboard**: Private dashboard for viewing visitor analytics
- **Interactive Timeline**: 3D timeline for work experience and education
- **WebGL Animations**: Background animations using Three.js
- **Microinteractions**: Enhanced UI feedback through subtle animations
- **Voice Navigation**: Experimental voice command support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Material UI](https://mui.com/)
- [EmailJS](https://www.emailjs.com/)
- [D3.js](https://d3js.org/)
- [Plotly.js](https://plotly.com/javascript/)
- [Lucide Icons](https://lucide.dev/)
- [Pexels](https://www.pexels.com/) for stock images

---

Created with ❤️ by Harieshwar J A