import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
}

const BASE_URL = 'https://clausewise.clausewiseai.app';
const DEFAULT_TITLE = 'ClauseWise – AI Financial Document Analyzer';
const DEFAULT_DESCRIPTION = 'Instantly analyze financial documents, decode complex clauses, and understand terms & conditions with AI. Free to try.';
const OG_IMAGE = `${BASE_URL}/og-banner.png`;

export const useSEO = ({ title, description, path = '/' }: SEOProps = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ClauseWise` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = `${BASE_URL}${path}`;

    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          el.setAttribute('property', property);
        } else {
          el.setAttribute('name', property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', desc);
    setMeta('og:title', fullTitle);
    setMeta('og:description', desc);
    setMeta('og:image', OG_IMAGE);
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '630');
    setMeta('og:image:type', 'image/png');
    setMeta('og:type', 'website');
    setMeta('og:url', url);
    setMeta('og:site_name', 'ClauseWise');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', OG_IMAGE);

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, path]);
};
