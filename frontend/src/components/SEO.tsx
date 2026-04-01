import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterHandle?: string;
}

export const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/logo.png',
  ogType = 'website',
  twitterHandle = '@eldoksh',
}: SEOProps) => {
  const siteName = 'Eldoksh';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Eldoksh - The premier destination for luxury car sales and acquisition. We provide the finest global vehicles with exceptional financing solutions.';
  const metaDescription = description || defaultDescription;
  
  const baseUrl = window.location.origin;
  const currentUrl = window.location.href;
  const canonicalUrl = canonical || currentUrl;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />
      
      {/* Locale Alternate */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}?lng=en`} />
      <link rel="alternate" hrefLang="ar" href={`${baseUrl}?lng=ar`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}`} />
    </Helmet>
  );
};

export default SEO;
