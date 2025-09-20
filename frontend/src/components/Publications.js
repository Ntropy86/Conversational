'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPublicationList, getPublicationContent } from '../services/contentService';
import Card from './Card';
import Link from './Link';
import Chip from './Chip';
import { typographyClasses } from './Typography';
import ContentPage from './ContentPage';

const Publications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        const publicationData = await getPublicationList();
        setPublications(publicationData);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError('Failed to load publications');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  return (
    <section id="publications" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 ${typographyClasses.heading}`}>
          Publications
        </h2>
        <p className={`mb-8 md:mb-12 text-sm md:text-base ${typographyClasses.body} max-w-2xl`}>
          Research contributions in brain-computer interfaces, machine learning, and educational robotics, 
          published in peer-reviewed journals and conferences.
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
          <div className="grid gap-6 md:gap-8 lg:gap-12">
            {publications.map((publication, index) => (
              <motion.div
                key={publication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PublicationCard
                  publication={publication}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

const PublicationCard = ({ publication }) => {
  const handleCardClick = () => {
    if (publication.doi || publication.link) {
      window.open(publication.doi || publication.link, '_blank');
    }
  };

  // Get venue reputation badge based on the venue
  const getVenueReputation = (venue) => {
    if (venue.includes('CHI')) {
      return {
        text: 'Premier HCI Conference',
        detail: '~20% acceptance rate',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      };
    }
    if (venue.includes('ICRA')) {
      return {
        text: 'A-Rating Conference',
        detail: 'Premier robotics venue',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      };
    }
    if (venue.includes('Biomedical Signal Processing and Control')) {
      return {
        text: 'Q1 Journal',
        detail: 'Impact Factor 4.9',
        color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
      };
    }
    return null;
  };

  const venueReputation = getVenueReputation(publication.venue);

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleCardClick}>
      <div className="space-y-3 md:space-y-4">
        {/* Publication Type Badge */}
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
            publication.type === 'Journal Article' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {publication.type}
          </span>
          {venueReputation && (
            <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${venueReputation.color}`}
                  title={venueReputation.detail}>
              {venueReputation.text}
            </span>
          )}
          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-0">
            {publication.date}
          </span>
        </div>

        {/* Title and Venue */}
        <div>
          <h3 className={`text-lg md:text-xl lg:text-2xl mb-2 leading-tight ${typographyClasses.heading}`}>
            {publication.title}
          </h3>
          <p className={`text-xs md:text-sm mb-1 md:mb-2 ${typographyClasses.subtitle} font-medium`}>
            {publication.venue}
            {venueReputation && (
              <span className="ml-1 md:ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal block md:inline">
                ({venueReputation.detail})
              </span>
            )}
          </p>
          {(publication.doi || publication.link) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
              {publication.doi ? `DOI: ${publication.doi}` : 'Link: ' + publication.link}
            </p>
          )}
        </div>

        {/* Preview */}
        <p className={`${typographyClasses.body} text-sm leading-relaxed`}>
          {publication.preview}
        </p>

        {/* Tags */}
        {publication.tags && publication.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {publication.tags.map((tag, index) => (
              <Chip key={index} color="auto">{tag}</Chip>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 md:pt-4 gap-3 sm:gap-0">
          <Link
            href={publication.doi || publication.link}
            external={true}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm md:text-base font-medium min-h-[44px] flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            Read the Paper
          </Link>
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-xs">Tap to view</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Publications;