// Dynamic Section Factory
// Creates sections dynamically based on portfolio configuration

import { motion } from 'framer-motion';
import SectionTransition from './SectionTransition';
import { typographyClasses } from './Typography';
import portfolioConfig from '../services/portfolioConfigService';

const DynamicSectionFactory = ({
  sectionId,
  children,
  customTitle,
  customSubtitle,
  customClassName
}) => {
  const section = portfolioConfig.getSection(sectionId);
  
  if (!section || !section.enabled) {
    return null;
  }

  const title = customTitle || section.title;
  const subtitle = customSubtitle || section.subtitle;
  const className = customClassName || section.className;

  return (
    <SectionTransition type="slide-up" className={className}>
      <section id={sectionId} className="relative">
        {title && (
          <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 ${typographyClasses.heading}`}>
            {title}
          </h2>
        )}
        
        {subtitle && (
          <p className={`mb-8 md:mb-12 text-sm md:text-base ${typographyClasses.body} max-w-2xl`}>
            {subtitle}
          </p>
        )}
        
        {children}
      </section>
    </SectionTransition>
  );
};

export default DynamicSectionFactory;