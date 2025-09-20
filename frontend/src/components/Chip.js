'use client';
import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Subtitle, Paragraph } from './Typography';
import { getTechColor, getTechCategory } from '../utils/techColors';

const Chip = ({ 
  children, 
  color = 'auto', // Changed default to 'auto' for tech-based coloring
  className = '', 
  showIcon = true,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Auto-detect technology color if color is 'auto'
  const techColor = color === 'auto' ? getTechColor(children, isDarkMode) : null;
  const techCategory = getTechCategory(children);
  
  // Memoize chip styles
  const chipStyles = useMemo(() => ({
    dark: {
      default: {
        idle: {
          background: "rgba(245, 245, 245, 0.05)",
          border: "1px solid rgba(65, 61, 61, 1)"
        },
        hover: {
          background: "rgba(245, 245, 245, 0.24)",
          border: "1px solid rgba(65, 61, 61, 1)"
        }
      },
      primary: {
        idle: {
          background: "rgba(35, 130, 139, 0.24)",
          border: "1px solid rgba(107, 128, 131, 0.31)"
        },
        hover: {
          background: "rgba(35, 130, 139, 0.48)",
          border: "1px solid rgba(107, 128, 131, 0.31)"
        }
      },
      success: {
        idle: {
          background: "rgba(56, 139, 35, 0.24)",
          border: "1px solid rgba(119, 131, 107, 0.31)"
        },
        hover: {
          background: "rgba(56, 139, 35, 0.48)",
          border: "1px solid rgba(119, 131, 107, 0.31)"
        }
      },
      warning: {
        idle: {
          background: "rgba(139, 118, 35, 0.24)",
          border: "1px solid rgba(131, 113, 107, 0.31)"
        },
        hover: {
          background: "rgba(139, 118, 35, 0.48)",
          border: "1px solid rgba(131, 113, 107, 0.31)"
        }
      },
      error: {
        idle: {
          background: "rgba(139, 35, 35, 0.24)",
          border: "1px solid rgba(131, 107, 107, 0.31)"
        },
        hover: {
          background: "rgba(139, 35, 35, 0.48)",
          border: "1px solid rgba(131, 107, 107, 0.31)"
        }
      }
    },
    light: {
      default: {
        idle: {
          background: "rgba(245, 245, 245, 0.11)",
          border: "1px solid rgba(134, 110, 110, 0.08)"
        },
        hover: {
          background: "rgba(245, 245, 245, 0.32)",
          border: "1px solid rgba(65, 61, 61, 0.08)"
        }
      },
      primary: {
        idle: {
          background: "rgba(59, 214, 228, 0.16)",
          border: "1px solid rgba(37, 118, 133, 0.08)"
        },
        hover: {
          background: "rgba(62, 229, 244, 0.32)",
          border: "1px solid rgba(37, 118, 133, 0.08)"
        }
      },
      success: {
        idle: {
          background: "rgba(78, 226, 41, 0.16)",
          border: "1px solid rgba(83, 121, 44, 0.08)"
        },
        hover: {
          background: "rgba(78, 226, 41, 0.32)",
          border: "1px solid rgba(83, 121, 44, 0.09)"
        }
      },
      warning: {
        idle: {
          background: "rgba(254, 216, 65, 0.16)",
          border: "1px solid rgba(85, 83, 28, 0.05)"
        },
        hover: {
          background: "rgba(254, 216, 65, 0.32)",
          border: "1px solid rgba(85, 83, 28, 0.05)"
        }
      },
      error: {
        idle: {
          background: "rgba(238, 54, 54, 0.16)",
          border: "1px solid rgba(113, 50, 50, 0.08)"
        },
        hover: {
          background: "rgba(239, 53, 53, 0.32)",
          border: "1px solid rgba(113, 50, 50, 0.08)"
        }
      }
    }
  }), []);
  
  const currentStyle = useMemo(() => {
    // If using tech-based coloring
    if (color === 'auto' && techColor) {
      const opacity = isHovered ? 0.25 : 0.15;
      return {
        background: `${techColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        border: `1px solid ${techColor}40`,
        backdropFilter: "blur(20px)",
        boxShadow: isHovered ? `0 0 15px ${techColor}30` : 'none'
      };
    }
    
    // Fallback to existing system
    const mode = isDarkMode ? 'dark' : 'light';
    const state = isHovered ? 'hover' : 'idle';
    
    let style;
    if (!chipStyles[mode][color]) {
      style = chipStyles[mode].default[state];
    } else {
      style = chipStyles[mode][color][state];
    }
    
    return {
      ...style,
      backdropFilter: "blur(20px)"
    };
  }, [isDarkMode, isHovered, color, chipStyles, techColor]);

  // Professional SVG tech icon component
  const TechIcon = ({ tech }) => {
    const iconStyle = { 
      width: '14px', 
      height: '14px', 
      marginRight: '6px',
      color: techColor || 'currentColor'
    };
    
    // Professional SVG icons for major technologies
    switch (tech) {
      case 'React':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.139s-2.018 3.25-5.535 4.139l-.473.120zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046z"/>
          </svg>
        );
      case 'Python':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.0281.0156c-.6591-.0006-1.2827.0256-1.8562.0781-2.3408.2137-2.7656.6631-2.7656 1.4907v1.0937H12v1.5H5.4375C4.5762 4.1781 3.8158 4.7837 3.5469 5.7813c-.3304 1.2256-.3452 1.9956 0 3.2812.2554 1.0056.8649 1.7188 1.7281 1.7188h1.125v-1.5c0-1.1569.9869-2.1562 2.1562-2.1562h4.6875c1.0056 0 1.8125-.8394 1.8125-1.8437V3.0469c0-.7838-.6619-1.3737-1.4906-1.4907-.5794-.0819-1.1819-.1019-1.8406-.1031zm-2.3125 1.2188c.3769 0 .6875.3106.6875.6875s-.3106.6875-.6875.6875-.6875-.3106-.6875-.6875.3106-.6875.6875-.6875z"/>
          </svg>
        );
      case 'JavaScript':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.113-.484.687-.629 1.137-.495.293.09.563.315.732.676.775-.507.775-.507 1.316-.844-.203-.314-.304-.451-.439-.586-.473-.528-1.103-.798-2.126-.77l-.528.067c-.507.124-.991.395-1.283.754-.855.968-.608 2.655.427 3.354 1.023.765 2.521.933 2.712 1.653.18.878-.652 1.159-1.475 1.058-.607-.136-.945-.439-1.316-1.002l-1.372.788c.157.359.337.517.607.832 1.305 1.316 4.568 1.249 5.153-.754.021-.067.18-.528.056-1.237l.034.049zm-6.737-5.434h-1.686c0 1.453-.007 2.898-.007 4.354 0 .924.047 1.772-.104 2.033-.247.528-.883.513-1.173.303-.295-.22-.446-.5-.623-.925-.047-.101-.082-.17-.142-.148l-1.371.844c.293.573.72 1.073 1.26 1.39.816.491 1.921.415 2.682-.336.345-.399.418-.884.418-1.781.024-1.588 0-3.181 0-4.766l.002.032z"/>
          </svg>
        );
      case 'TypeScript':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0z"/>
            <path fill="white" d="M9.75 12.75V9h2.25v1.5h-1.5v.75h1.5v1.5h-2.25zm2.25 0h2.25c.414 0 .75.336.75.75v3c0 .414-.336.75-.75.75H12c-.414 0-.75-.336-.75-.75v-3c0-.414.336-.75.75-.75z"/>
          </svg>
        );
      case 'Node.js':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L2.46,6.68C2.376,6.729,2.322,6.825,2.322,6.921v10.15c0,0.097,0.054,0.189,0.137,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z"/>
          </svg>
        );
      case 'AWS':
      case 'AWS EMR':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.175 0 .048-.024.104-.08.160l-.264.176c-.04.023-.08.040-.12.040-.048 0-.095-.024-.144-.08-.112-.127-.207-.271-.279-.431-.072-.16-.111-.336-.111-.535 0-.528.207-.904.615-1.111.207-.104.447-.16.735-.16.287 0 .551.056.783.16.616.264.927.735.927 1.415 0 .24-.032.487-.104.735-.071.248-.184.487-.336.703-.04.056-.087.08-.144.08-.024 0-.056-.008-.088-.024l-.264-.16c-.056-.04-.08-.087-.08-.144 0-.032.008-.063.024-.104.136-.231.231-.439.279-.615.056-.184.08-.36.80-.543 0-.263-.048-.48-.152-.64-.096-.16-.248-.231-.448-.231-.2 0-.4.071-.6.231-.2.16-.296.375-.296.64zm2.527 2.24c-.08 0-.135-.016-.175-.056-.04-.04-.08-.111-.111-.207l-1.335-4.407c-.032-.104-.048-.175-.048-.207 0-.087.04-.135.127-.135h.52c.087 0 .143.016.175.056.04.04.071.111.095.207l.96 3.783.88-3.783c.016-.104.048-.175.087-.207.04-.04.104-.056.175-.056h.424c.087 0 .143.016.175.056.048.04.08.111.095.207l.888 3.831.976-3.831c.024-.104.056-.175.095-.207.04-.04.095-.056.175-.056h.493c.087 0 .135.04.135.135 0 .024-.008.056-.008.087-.008.032-.016.071-.032.127l-1.367 4.407c-.032.104-.071.175-.111.207-.04.04-.095.056-.175.056h-.455c-.087 0-.143-.016-.175-.056-.048-.04-.08-.111-.095-.207l-.872-3.607-.864 3.607c-.016.104-.048.175-.095.207-.04.04-.095.056-.175.056zm5.424.207c-.4 0-.8-.048-1.183-.144-.383-.095-.68-.2-.903-.327-.08-.048-.135-.103-.151-.151-.016-.048-.024-.104-.024-.168v-.279c0-.071.024-.111.071-.111.024 0 .048.008.08.016.032.008.071.024.111.04.335.151.695.263 1.063.336.375.071.735.111 1.111.111.6 0 1.063-.111 1.415-.327.351-.216.527-.535.527-.96 0-.279-.087-.518-.263-.703-.175-.184-.487-.359-.918-.52l-1.335-.423c-.679-.216-1.183-.535-1.479-.968-.295-.431-.447-.911-.447-1.415 0-.4.087-.76.255-1.063.175-.319.4-.6.695-.823.295-.231.647-.407 1.047-.535.4-.127.823-.191 1.279-.191.175 0 .36.008.535.032.184.016.36.048.535.08s.336.071.487.111c.151.048.279.095.375.151.095.048.167.104.207.167.048.063.071.135.071.231v.256c0 .072-.024.111-.071.111-.032 0-.087-.016-.167-.056a4.432 4.432 0 0 0-1.599-.319c-.551 0-.975.095-1.279.288-.303.191-.455.479-.455.863 0 .279.095.527.279.711.184.184.52.375.999.559l1.279.415c.671.216 1.151.511 1.431.887.279.375.423.823.423 1.343 0 .4-.08.775-.247 1.111-.167.336-.4.631-.695.871-.295.24-.647.423-1.063.535-.415.112-.863.168-1.343.168z"/>
          </svg>
        );
      case 'Docker':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338 0-.676.032-1.01.098-.246-1.73-1.653-2.57-1.718-2.604l-.344-.199-.237.327c-.299.412-.553.944-.612 1.478-.06.533.027 1.045.268 1.47-.216.124-.618.346-1.163.365-5.963.185-6.696 5.998-6.696 7.166 0 1.283.312 2.523 1.004 3.518.726 1.042 1.754 1.636 2.953 1.636.592 0 1.196-.081 1.794-.244 2.049-.56 3.62-2.365 4.09-4.69.654.008 2.177.005 2.177.005 1.065 0 1.847-.645 2.045-1.689.008-.048.018-.095.024-.142h.018l-.004-.024c.205-.847-.139-1.69-.583-2.081l-.017-.01z"/>
          </svg>
        );
      case 'PyTorch':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.005 0L4.952 7.053c-2.756 2.756-2.756 7.236 0 9.992s7.236 2.756 9.992 0c2.756-2.756 2.756-7.236 0-9.992L12.005 0z"/>
          </svg>
        );
      case 'TensorFlow':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.292 5.856L11.54 0v24l-4.095-2.378V7.603l-6.168 3.564.015-5.31zm21.708 5.307l-.014 5.31L16.818 20l-6.24-3.618V7.603L16.746 4z"/>
          </svg>
        );
      default:
        // Return category-based simple icons
        switch (techCategory) {
          case 'frontend': 
            return (
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            );
          case 'backend':
            return (
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            );
          case 'database':
            return (
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            );
          case 'ai-ml':
            return (
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
              </svg>
            );
          case 'cloud':
            return (
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
            );
          default: return null;
        }
    }
  };

  // Use simple functions (no useCallback) to reduce overhead
  const handleHoverStart = () => setIsHovered(true);
  const handleHoverEnd = () => setIsHovered(false);

  return (
    <motion.div
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${className}`}
      style={currentStyle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      {...props}
    >
      {showIcon && color === 'auto' && <TechIcon tech={children} />}
      <span className="text-xs font-medium">{children}</span>
    </motion.div>
  );
};

export default Chip;