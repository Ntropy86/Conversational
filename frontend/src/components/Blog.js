'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBlogList } from '../services/contentService';
import Card from './Card';
import Button from './Button';
import Chip from './Chip';
import { typographyClasses } from './Typography';

const Blog = ({ onPostClick }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setLoading(true);
        const blogData = await getBlogList();
        setBlogPosts(blogData);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  // Sort posts by featured status and then by publish date
  const sortedPosts = [...blogPosts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.publishDate) - new Date(a.publishDate);
  });

  return (
    <section id="blog" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={`text-3xl md:text-4xl mb-4 ${typographyClasses.heading}`}>
          Blog
        </h2>
        <p className={`mb-12 ${typographyClasses.body} max-w-2xl`}>
          Insights and experiences from building intelligent systems, modern web applications, 
          and production machine learning solutions.
        </p>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center py-12">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 md:gap-12">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <BlogPostCard
                  post={post}
                  onClick={() => onPostClick ? onPostClick(post) : null}
                  featured={post.featured}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

const BlogPostCard = ({ post, onClick, featured }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              {formatDate(post.publishDate)}
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
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            Read Full Post
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