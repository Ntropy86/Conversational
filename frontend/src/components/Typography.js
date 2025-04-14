'use client';
import { useTheme } from '../context/ThemeContext';

// These classes will be used in our component wrappers
export const typographyClasses = {
  heading: 'typography-heading',
  subtitle: 'typography-subtitle',
  paragraph: 'typography-paragraph'
};

// Add these simple component wrappers to maintain compatibility 
export function Heading({ children, className = '', level = 1, ...props }) {
  const Tag = `h${level}`;
  return (
    <Tag className={`${typographyClasses.heading} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function Subtitle({ children, className = '', ...props }) {
  return (
    <span className={`${typographyClasses.subtitle} ${className}`} {...props}>
      {children}
    </span>
  );
}

export function Paragraph({ children, className = '', ...props }) {
  return (
    <span className={`${typographyClasses.paragraph} ${className}`} {...props}>
      {children}
    </span>
  );
}

// This component injects global styles into the page
export function TypographyStylesForCSS() {
  const { isDarkMode } = useTheme();
  
  const styles = `
    .typography-heading {
      font-weight: 500;
      color: ${isDarkMode ? '#F5F5F5' : '#332B28'};
    }
    .typography-subtitle {
      font-weight: 500;
      color: ${isDarkMode ? '#817065' : '#746757'};
    }
    .typography-paragraph {
      font-weight: normal;
      color: ${isDarkMode ? '#CBB09D' : '#542D12'};
    }
  `;
  
  return <style jsx global>{styles}</style>;
}