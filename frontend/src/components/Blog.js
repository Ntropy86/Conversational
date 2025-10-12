'use client';
import { motion } from 'framer-motion';
import Card from './Card';
import Chip from './Chip';
import Button from './Button';
import { typographyClasses } from './Typography';

const Blog = ({ onPostClick }) => {
  // Hardcoded blog posts - no API calls, no loading states
  const blogPosts = [
    {
      id: "building-this-website",
      title: "Building This Website: From Figma to Production",
      publishDate: "January 15, 2025",
      readingTime: "15 minutes",
      preview: "A comprehensive journey through designing, developing, and deploying this modern portfolio website with AI-powered features. From Figma wireframes to production deployment, covering component architecture, AI integration, performance optimization, and lessons learned.",
      tags: ["Web Development", "Next.js", "AI Integration", "Design Process", "Portfolio", "Production Systems"],
      featured: true
    }
  ];

  return (
    <section id="blog">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-3xl md:text-4xl ${typographyClasses.heading} mb-4`}
        >
          Blog
        </motion.h2>
        <p className={`mb-6 md:mb-8 ${typographyClasses.body} max-w-2xl`}>
          Insights and experiences from building intelligent systems, modern web applications, 
          and production machine learning solutions.
        </p>

        <div className="grid gap-8 md:gap-12">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <BlogPostCard
                post={post}
                onClick={() => onPostClick && onPostClick(post)}
                featured={post.featured}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const BlogPostCard = ({ post, onClick, featured }) => {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
        featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`} 
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Featured Badge and Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {featured && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Featured
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.publishDate}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {post.readingTime}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className={`text-xl md:text-2xl mb-2 ${typographyClasses.heading} ${
            featured ? 'text-blue-600 dark:text-blue-400' : ''
          }`}>
            {post.title}
          </h3>
        </div>

        {/* Preview */}
        <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
          {post.preview}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Chip key={index} color="auto">{tag}</Chip>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onCard={true}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            Read Full Post →
          </Button>
          
          {/* Reading indicator */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">{post.readingTime}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Blog;
