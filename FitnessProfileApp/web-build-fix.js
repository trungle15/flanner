// This file helps ensure proper web compatibility
import { Platform } from 'react-native';

// Fix for web platform
export const fixWebCompatibility = () => {
  // Only apply these fixes on web platform
  if (Platform.OS === 'web') {
    // Load our custom CSS file
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = '/web-styles.css';
    document.head.appendChild(linkElement);
    
    // Ensure proper touch events
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    
    // Fix any scrolling issues
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Add iOS-specific meta tags
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    }
    
    // Apply basic styling to the root element
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.display = 'flex';
      rootElement.style.flexDirection = 'column';
      rootElement.style.height = '100%';
      rootElement.style.maxWidth = '100%';
      rootElement.style.margin = '0 auto';
      rootElement.style.backgroundColor = '#ffffff';
    }
  }
};

export default fixWebCompatibility;
