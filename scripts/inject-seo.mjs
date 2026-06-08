import { copyFile, readFile, writeFile } from 'node:fs/promises';

const indexPath = new URL('../dist/index.html', import.meta.url);
const faviconSourcePath = new URL('../assets/vip-favicon.png', import.meta.url);
const faviconPath = new URL('../dist/favicon.png', import.meta.url);
const appleTouchIconPath = new URL('../dist/apple-touch-icon.png', import.meta.url);
const manifestPath = new URL('../dist/site.webmanifest', import.meta.url);
const title = 'Durban July VIP Guide 2026 | Marquees, Events & Concierge';
const description =
  'Plan your Hollywoodbets Durban July 2026 VIP experience with marquees, weekend events, accommodation, transport, fashion and concierge services.';
const keywords =
  'Durban July 2026, Hollywoodbets Durban July, Durban July VIP, Durban July marquees, Durban July events, Greyville Racecourse, Durban accommodation, Durban concierge';
const siteUrl = normalizeUrl(
  process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL
);
const faviconUrl = siteUrl ? `${siteUrl}/favicon.png` : '/favicon.png';
const socialImage = faviconUrl;

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Durban July VIP Guide',
      description,
      image: faviconUrl,
      ...(siteUrl ? { url: siteUrl } : {}),
    },
    {
      '@type': 'Event',
      name: 'Hollywoodbets Durban July 2026',
      description,
      startDate: '2026-07-04T11:00:00+02:00',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'Hollywoodbets Greyville Racecourse',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Durban',
          addressRegion: 'KwaZulu-Natal',
          addressCountry: 'ZA',
        },
      },
      image: [socialImage],
      ...(siteUrl ? { url: siteUrl } : {}),
    },
  ],
};

const tags = [
  `<title>${title}</title>`,
  '<link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />',
  '<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />',
  '<link rel="apple-touch-icon" sizes="512x512" href="/apple-touch-icon.png" />',
  '<link rel="manifest" href="/site.webmanifest" />',
  `<meta name="description" content="${description}" />`,
  `<meta name="keywords" content="${keywords}" />`,
  '<meta name="robots" content="index, follow, max-image-preview:large" />',
  '<meta name="theme-color" content="#0B0B0F" />',
  '<meta name="application-name" content="Durban July VIP Guide" />',
  '<meta property="og:type" content="website" />',
  '<meta property="og:locale" content="en_ZA" />',
  `<meta property="og:site_name" content="Durban July VIP Guide" />`,
  `<meta property="og:title" content="${title}" />`,
  `<meta property="og:description" content="${description}" />`,
  `<meta property="og:image" content="${socialImage}" />`,
  '<meta name="twitter:card" content="summary" />',
  `<meta name="twitter:title" content="${title}" />`,
  `<meta name="twitter:description" content="${description}" />`,
  `<meta name="twitter:image" content="${socialImage}" />`,
  ...(siteUrl
    ? [
        `<link rel="canonical" href="${siteUrl}/" />`,
        `<meta property="og:url" content="${siteUrl}/" />`,
      ]
    : []),
  `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
].join('\n    ');

let html = await readFile(indexPath, 'utf8');
html = html
  .replace(/<title>.*?<\/title>/i, '')
  .replace(/<link rel="shortcut icon"[^>]*>/gi, '')
  .replace('</head>', `    ${tags}\n  </head>`);

const manifest = {
  name: 'Durban July VIP Guide',
  short_name: 'Durban July VIP',
  description,
  start_url: '/',
  display: 'standalone',
  background_color: '#0B0B0F',
  theme_color: '#0B0B0F',
  icons: [
    {
      src: '/favicon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};

await Promise.all([
  writeFile(indexPath, html),
  copyFile(faviconSourcePath, faviconPath),
  copyFile(faviconSourcePath, appleTouchIconPath),
  writeFile(manifestPath, JSON.stringify(manifest, null, 2)),
]);

function normalizeUrl(value) {
  if (!value) return '';
  const url = value.startsWith('http') ? value : `https://${value}`;
  return url.replace(/\/+$/, '');
}
