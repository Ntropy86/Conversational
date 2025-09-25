// Portfolio Configuration Service
// Manages dynamic configuration for the portfolio site

import portfolioConfigData from '../../content/portfolio-config.json';

class PortfolioConfigService {
  constructor() {
    this.config = portfolioConfigData;
  }

  // Site configuration
  getSiteConfig() {
    return this.config.siteConfig;
  }

  getTitle() {
    return this.config.siteConfig.title;
  }

  getSubtitle() {
    return this.config.siteConfig.subtitle;
  }

  getTagline() {
    return this.config.siteConfig.tagline;
  }

  getDescription() {
    return this.config.siteConfig.description;
  }

  getContactInfo() {
    return this.config.siteConfig.contact;
  }

  // Section management
  getSections() {
    return this.config.sections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order);
  }

  getSection(id) {
    return this.config.sections.find(section => section.id === id);
  }

  getNavigationSections() {
    return this.getSections().filter(section => section.showInNavigation);
  }

  getSectionClassName(id) {
    const section = this.getSection(id);
    return section?.className || 'mb-16 md:mb-24';
  }

  getSectionSubtitle(id) {
    const section = this.getSection(id);
    return section?.subtitle;
  }

  shouldShowMoreButton(id) {
    const section = this.getSection(id);
    return section?.showMoreButton || false;
  }

  getInitialDisplayCount(id) {
    const section = this.getSection(id);
    return section?.initialDisplayCount || null;
  }

  shouldShowRadarChart(id) {
    const section = this.getSection(id);
    return section?.showRadarChart || false;
  }

  getJobSearchMessage() {
    const contactSection = this.getSection('contact');
    return contactSection?.jobSearchMessage;
  }

  // Skills management
  getSkillCategories() {
    return this.config.skillCategories;
  }

  getSkillCategory(id) {
    return this.config.skillCategories.find(category => category.id === id);
  }

  // Theme management
  getTheme() {
    return this.config.theme;
  }

  getPrimaryColor() {
    return this.config.theme.colors.primary;
  }

  getSecondaryColor() {
    return this.config.theme.colors.secondary;
  }

  // Utility methods
  isSectionEnabled(id) {
    const section = this.getSection(id);
    return section?.enabled || false;
  }

  getSectionOrder(id) {
    const section = this.getSection(id);
    return section?.order || 999;
  }

  // Dynamic content loading helpers
  getContentType(sectionId) {
    const contentTypeMap = {
      'experience': 'experiences',
      'projects': 'projects', 
      'current-projects': 'current-projects',
      'education': 'education',
      'publications': 'publications',
      'blog': 'blog'
    };
    return contentTypeMap[sectionId] || sectionId;
  }

  // Social links helper
  getSocialLinks() {
    const contact = this.getContactInfo();
    return [
      {
        name: 'GitHub',
        href: contact.github,
        icon: 'github'
      },
      {
        name: 'LinkedIn', 
        href: contact.linkedin,
        icon: 'linkedin'
      },
      {
        name: 'Scholar',
        href: contact.scholar,
        icon: 'scholar'
      }
    ];
  }

  // Navigation links helper
  getNavigationLinks() {
    return this.getNavigationSections().map(section => ({
      name: section.title,
      href: `#${section.id}`
    }));
  }
}

// Export singleton instance
const portfolioConfigService = new PortfolioConfigService();
export { portfolioConfigService as portfolioConfig };
export default portfolioConfigService;