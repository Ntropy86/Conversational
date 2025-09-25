# Dynamic Content Management System

This portfolio uses a dynamic content management system that allows you to modify content, sections, and configuration without touching the code.

## Overview

The system consists of:
- **Configuration File**: `content/portfolio-config.json` - Master configuration
- **Content Service**: `services/portfolioConfigService.js` - Configuration API
- **Dynamic Components**: Components that read from configuration
- **Management Utilities**: Tools for validation and management

## Configuration File Structure

### Site Configuration
```json
{
  "siteConfig": {
    "title": "Your Name",
    "subtitle": "Your Role", 
    "tagline": "Brief description",
    "description": "Longer about text",
    "contact": {
      "email": "your@email.com",
      "phone": "+1 (555) 123-4567",
      "location": "Your City, State",
      "linkedin": "https://linkedin.com/in/yourprofile",
      "github": "https://github.com/yourusername",
      "scholar": "https://scholar.google.com/citations?user=YOURUSER"
    }
  }
}
```

### Section Configuration
```json
{
  "sections": [
    {
      "id": "about",                    // Unique identifier (required)
      "title": "About",                // Display title (required)
      "enabled": true,                 // Show/hide section (required)
      "order": 1,                      // Display order (required)
      "showInNavigation": true,        // Include in navigation menu
      "className": "mb-16 md:mb-24",   // CSS classes
      "subtitle": "Section description" // Optional description
    }
  ]
}
```

### Advanced Section Options
```json
{
  "id": "experience",
  "showMoreButton": true,        // Enable show more/less
  "initialDisplayCount": 2,      // Items to show initially
  "showRadarChart": true,        // Enable radar chart (skills)
  "jobSearchMessage": "Text"     // Additional message (contact)
}
```

## Making Changes

### 1. Modify Content
Edit `content/portfolio-config.json` and restart the development server:

```bash
npm run dev
```

### 2. Add New Section
1. Add section to `sections` array in config
2. Create content files in `content/[section-name]/`
3. Update `content-metadata.json` if needed

Example new section:
```json
{
  "id": "certifications",
  "title": "Certifications",
  "enabled": true,
  "order": 6,
  "showInNavigation": true,
  "className": "mb-16 md:mb-24",
  "subtitle": "Professional certifications and credentials"
}
```

### 3. Reorder Sections
Change the `order` values in the configuration:
```json
{
  "id": "skills",
  "order": 3  // Move skills to position 3
}
```

### 4. Hide/Show Sections
Toggle the `enabled` flag:
```json
{
  "id": "blog",
  "enabled": false  // Hide blog section
}
```

### 5. Update Contact Information
Modify the `contact` object in `siteConfig`:
```json
{
  "contact": {
    "email": "newemail@domain.com",
    "phone": "+1 (555) 999-8888",
    "location": "New City, NY"
  }
}
```

## Skills Configuration

The skills section supports dynamic categorization:

```json
{
  "skillCategories": [
    {
      "id": "backend",
      "title": "Backend & APIs",
      "icon": "server",
      "primarySkills": ["FastAPI", "Python", "PostgreSQL"],
      "secondarySkills": ["MongoDB", "Node.js", "Redis"]
    }
  ]
}
```

## Theme Configuration

Basic theme settings can be configured:

```json
{
  "theme": {
    "colors": {
      "primary": "#3498DB",
      "secondary": "#8B5C3C"
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter"
    }
  }
}
```

## Content Management

### Adding Content
1. Create markdown files in `content/[section]/`
2. Update `content/content-metadata.json`
3. Reference in portfolio config if needed

### Content Types Supported
- **Experience**: Work history and roles
- **Projects**: Portfolio projects
- **Current Projects**: Work in progress
- **Education**: Academic background
- **Publications**: Research papers
- **Blog**: Blog posts

## Validation

The system includes built-in validation:

```javascript
import { ConfigManager } from '../utils/configManager';

// Validate configuration
try {
  ConfigManager.validateConfig(newConfig);
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

## Development Helpers

### Configuration Preview
```javascript
import { configUtils } from '../utils/configManager';

// Log current configuration (development only)
configUtils.logCurrentConfig();
```

### Section Utilities
```javascript
import portfolioConfig from '../services/portfolioConfigService';

// Check if section is enabled
const isEnabled = portfolioConfig.isSectionEnabled('blog');

// Get section configuration
const sectionConfig = portfolioConfig.getSection('experience');

// Get navigation links
const navLinks = portfolioConfig.getNavigationLinks();
```

## Best Practices

1. **Always validate** configuration changes before deployment
2. **Keep order values** sequential (1, 2, 3...) for clarity
3. **Use descriptive IDs** that match your content structure
4. **Test navigation** after reordering sections
5. **Backup configs** before making major changes

## Troubleshooting

### Section Not Showing
- Check `enabled: true` in configuration
- Verify `order` value is set
- Ensure required content files exist

### Navigation Issues
- Check `showInNavigation: true`
- Verify section ID matches navigation href
- Ensure section has proper HTML ID attribute

### Content Not Loading
- Check content files exist in correct directory
- Verify content-metadata.json is updated
- Check console for loading errors

## Examples

See `content/portfolio-config.json` for a complete working example with all sections configured.

For advanced customization beyond this system, you may need to modify the React components directly.