'use client';

const ExternalLink = ({ href, children, className = '', ...props }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

export default ExternalLink;