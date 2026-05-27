import { useEffect } from 'react';

const SITE_NAME = 'OrderPote';
const DEFAULT_TITLE = 'OrderPote | Social Commerce အော်ဒါစီမံခန့်ခွဲမှုစနစ်';
const DEFAULT_DESCRIPTION =
  'Product Link များဖန်တီးပါ၊ Mobile Banking ဖြင့် ငွေပေးချေမှုများကို လက်ခံပါ၊ အော်ဒါများကို တစ်နေရာတည်းတွင် စနစ်တကျ စီမံခန့်ခွဲပါ။';
const DEFAULT_IMAGE = '/logo.png';

export interface SeoMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

function getAbsoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl =
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (!baseUrl) return value;

  return new URL(value, baseUrl).toString();
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertCanonical(url: string) {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }

  element.href = url;
}

export default function SeoMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
}: SeoMetaProps) {
  useEffect(() => {
    const pageUrl =
      url || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');
    const absoluteUrl = pageUrl ? getAbsoluteUrl(pageUrl) : '';
    const absoluteImage = getAbsoluteUrl(image);

    console.log('SEO Meta အချက်အလက်:', { title, description, image, absoluteImage, absoluteUrl, type });

    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', absoluteImage);
    upsertMeta('property', 'og:image:alt', title);
    if (absoluteUrl) upsertMeta('property', 'og:url', absoluteUrl);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:site', '@orderpote');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteImage);

    if (absoluteUrl) upsertCanonical(absoluteUrl);
  }, [description, image, noIndex, title, type, url]);

  return null;
}
