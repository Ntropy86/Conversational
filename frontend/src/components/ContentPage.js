'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Card from './Card';
import Chip from './Chip';
import { typographyClasses } from './Typography';

// Simple markdown parser for our needs
const parseMarkdown = (content) => {
  // Basic markdown parsing - can be extended
  return content
    .split('\n')
    .map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return { type: 'h1', content: line.substring(2), key: index };
      }
      if (line.startsWith('## ')) {
        return { type: 'h2', content: line.substring(3), key: index };
      }
      if (line.startsWith('### ')) {
        return { type: 'h3', content: line.substring(4), key: index };
      }
      
      // Lists
      if (line.startsWith('- ')) {
        return { type: 'li', content: line.substring(2), key: index };
      }
      
      // Tech stack (special format: `tech:React,Python,AWS`)
      if (line.startsWith('tech:')) {
        const techs = line.substring(5).split(',').map(t => t.trim());
        return { type: 'tech', content: techs, key: index };
      }
      
      // Links (basic format: [text](url))
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (linkMatch) {
        return { type: 'link', content: line, key: index };
      }
      
      // Empty lines
      if (line.trim() === '') {
        return { type: 'br', content: '', key: index };
      }
      
      // Regular paragraphs
      return { type: 'p', content: line, key: index };
    });
};

// Render markdown elements
const renderMarkdownElement = (element) => {
  switch (element.type) {
    case 'h1':
      return (
        <h1 key={element.key} className={`text-3xl mb-6 ${typographyClasses.heading}`}>
          {element.content}
        </h1>
      );
    case 'h2':
      return (
        <h2 key={element.key} className={`text-2xl mb-4 ${typographyClasses.heading}`}>
          {element.content}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={element.key} className={`text-xl mb-3 ${typographyClasses.heading}`}>
          {element.content}
        </h3>
      );
    case 'p':
      return (
        <p key={element.key} className={`mb-4 ${typographyClasses.paragraph}`}>
          {element.content}
        </p>
      );
    case 'li':
      return (
        <li key={element.key} className={`mb-2 ml-4 ${typographyClasses.paragraph}`}>
          • {element.content}
        </li>
      );
    case 'tech':
      return (
        <div key={element.key} className="flex flex-wrap gap-2 mb-6">
          {element.content.map((tech, idx) => (
            <Chip key={idx}>{tech}</Chip>
          ))}
        </div>
      );
    case 'link':
      // Simple link parsing - can be improved
      const linkMatch = element.content.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        return (
          <a 
            key={element.key} 
            href={linkMatch[2]} 
            className={`text-blue-400 hover:text-blue-300 underline ${typographyClasses.paragraph}`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return null;
    case 'br':
      return <br key={element.key} />;
    default:
      return null;
  }
};

const MarkdownRenderer = ({ content, className = '' }) => {
  return (
    <motion.div 
      className={`${className} prose prose-invert max-w-none`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom components for better styling
          h1: ({children}) => <h1 className={`text-3xl mb-6 ${typographyClasses.heading}`}>{children}</h1>,
          h2: ({children}) => <h2 className={`text-2xl mb-4 ${typographyClasses.heading}`}>{children}</h2>,
          h3: ({children}) => <h3 className={`text-xl mb-3 ${typographyClasses.heading}`}>{children}</h3>,
          p: ({children}) => <p className={`mb-4 ${typographyClasses.paragraph}`}>{children}</p>,
          ul: ({children}) => <ul className="mb-4 ml-6">{children}</ul>,
          ol: ({children}) => <ol className="mb-4 ml-6">{children}</ol>,
          li: ({children}) => <li className={`mb-2 ${typographyClasses.paragraph}`}>{children}</li>,
          a: ({href, children}) => (
            <a 
              href={href} 
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code: ({children, className}) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                  <code className={className}>{children}</code>
                </pre>
              );
            }
            return <code className="bg-gray-700 px-2 py-1 rounded text-sm">{children}</code>;
          },
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
              {children}
            </blockquote>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};

// Individual content page component
const ContentPage = ({ title, content, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Content in a card */}
      <Card className="prose prose-invert max-w-none">
        <MarkdownRenderer content={content} />
      </Card>
    </motion.div>
  );
};

export default ContentPage;
export { MarkdownRenderer };