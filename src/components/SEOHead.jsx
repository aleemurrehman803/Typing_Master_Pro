import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Head Component - Manages all meta tags and structured data
 * 
 * @param {object} props - SEO configuration
 */
const SEOHead = ({
    title = 'TypeMaster Pro - Professional Typing Platform',
    description = 'Master your typing skills with professional courses, certification, and real-time practice. Join thousands improving their WPM speed and accuracy.',
    keywords = 'typing test, typing speed, WPM test, typing certification, learn typing, typing practice, typing courses, keyboard typing',
    canonical = 'https://typemasterpro.com',
    ogType = 'website',
    ogImage = 'https://typemasterpro.com/og-image.jpg',
    twitterCard = 'summary_large_image',
    author = 'TypeMaster Pro Team',
    robots = 'index, follow',
    schemaType = 'webApplication',
    structuredData = null
}) => {
    // Determine dynamic structured data based on schemaType
    const getStructuredData = () => {
        if (structuredData) return structuredData;

        switch (schemaType) {
            case 'organization':
                return {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "TypeMaster Pro",
                    "url": canonical,
                    "logo": "https://typemasterpro.com/logo.png",
                    "sameAs": [
                        "https://twitter.com/typemasterpro",
                        "https://facebook.com/typemasterpro"
                    ]
                };
            case 'course':
                return {
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": title.replace(" - TypeMaster Pro", "") || "Professional Touch Typing Course",
                    "description": description,
                    "provider": {
                        "@type": "Organization",
                        "name": "TypeMaster Pro",
                        "url": "https://typemasterpro.com"
                    }
                };
            case 'faq':
                return {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "How is WPM (Words Per Minute) calculated?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "WPM stands for Words Per Minute. It is calculated by dividing the total number of typed characters by 5, then dividing by the time spent in minutes, and subtracting the uncorrected errors."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Can I get a certificate on TypeMaster Pro?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes! You can get a typing certificate by completing the typing exams with at least 70% accuracy."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is TypeMaster Pro free?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, TypeMaster Pro provides free typing practice, courses, and speed tests."
                            }
                        }
                    ]
                };
            case 'profile':
                return {
                    "@context": "https://schema.org",
                    "@type": "ProfilePage",
                    "dateCreated": "2026-06-20",
                    "mainEntity": {
                        "@type": "Person",
                        "name": title.replace(" - TypeMaster Pro", "") || "User Profile",
                        "jobTitle": "Typist"
                    }
                };
            case 'webApplication':
            default:
                return {
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "TypeMaster Pro",
                    "description": description,
                    "url": canonical,
                    "applicationCategory": "EducationalApplication",
                    "operatingSystem": "All",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "ratingCount": "1250"
                    }
                };
        }
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="robots" content={robots} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph (Facebook, LinkedIn) */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="TypeMaster Pro" />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Mobile */}
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(getStructuredData())}
            </script>
        </Helmet>
    );
};

export default SEOHead;
