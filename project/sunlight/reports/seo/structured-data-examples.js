/**
 * Structured Data Examples
 * 
 * This file contains examples of structured data for different page types.
 * Add these snippets to your pages to improve SEO and enable rich search results.
 */

// Product Page Structured Data
export const productStructuredData = (product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl,
    description: product.description,
    sku: product.sku,
    mpn: product.mpn,
    brand: {
      '@type': 'Brand',
      name: product.brandName,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: 'USD',
      price: product.price,
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Your Company Name',
      }
    },
    // Optional: Add reviews if available
    review: product.reviews?.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
      },
      reviewBody: review.text,
      datePublished: review.date,
    })) || [],
  };
};

// Article Page Structured Data
export const articleStructuredData = (article) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.imageUrl,
    datePublished: article.publishDate,
    dateModified: article.updateDate,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Company Name',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourdomain.com/logo.png',
      },
    },
    description: article.summary,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
};

// FAQ Page Structured Data
export const faqStructuredData = (faqs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

// Organization Structured Data
export const organizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Company Name',
    url: 'https://yourdomain.com',
    logo: 'https://yourdomain.com/logo.png',
    sameAs: [
      'https://www.facebook.com/yourcompany',
      'https://www.twitter.com/yourcompany',
      'https://www.linkedin.com/company/yourcompany',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-123-456-7890',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
};

// How to use:
/*
import { productStructuredData } from './structured-data-examples';

const ProductPage = ({ product }) => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData(product))
        }}
      />
      
      {/* Rest of your component */}
    </>
  );
};
*/
