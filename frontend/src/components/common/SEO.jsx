/**
 * SEO Component
 * 
 * A reusable component for managing SEO-related tags in React applications.
 * Use this component on each page to set title, description, and other meta tags.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet'; // Note: You may need to install react-helmet

const SEO = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  structuredData = null,
  noIndex = false,
}) => {
  const siteName = 'Your App Name';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Default description for your website';
  const siteUrl = 'https://yourdomain.com';
  // Simplified logic for canonical URL - using Docker-compatible window check
  const fullCanonical = canonical ? canonical : 
    (typeof window !== 'undefined' && window ? window.location.href : '');
  const defaultImage = '/logo.png';
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={fullCanonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={image || `${siteUrl}${defaultImage}`} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || `${siteUrl}${defaultImage}`} />
      
      {/* Structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  structuredData: PropTypes.object,
  noIndex: PropTypes.bool,
};

export default SEO;

/**
 * Usage Example:
 *
 * import SEO from '@/components/common/SEO';
 * import { productStructuredData } from '@/utils/structured-data';
 *
 * const ProductPage = ({ product }) => {
 *   return (
 *     <>
 *       <SEO
 *         title={product.name}
 *         description={product.description}
 *         image={product.imageUrl}
 *         type="product"
 *         structuredData={productStructuredData(product)}
 *       />
 *       
 *       {- Rest of your component -}
 *     </>
 *   );
 * };
 */
