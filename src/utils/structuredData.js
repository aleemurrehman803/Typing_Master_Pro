/**
 * Structured Data Schemas (Schema.org)
 */

export const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TypeMaster Pro",
    "url": "https://typemasterpro.com",
    "description": "Professional typing platform for learning and certification",
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

export const typingTestSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Typing Speed Test",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    }
};

export const courseSchema = (courseData) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": courseData.title,
    "description": courseData.description,
    "provider": {
        "@type": "Organization",
        "name": "TypeMaster Pro"
    }
});

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TypeMaster Pro",
    "url": "https://typemasterpro.com",
    "logo": "https://typemasterpro.com/logo.png",
    "sameAs": [
        "https://facebook.com/typemasterpro",
        "https://twitter.com/typemasterpro"
    ]
};
