import { readFile, writeFile } from 'node:fs/promises';

const indexPath = new URL('../dist/index.html', import.meta.url);
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
const socialImage = siteUrl ? `${siteUrl}/favicon.ico` : '/favicon.ico';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Durban July VIP Guide',
      description,
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
  .replace('</head>', `    ${tags}\n  </head>`);

await writeFile(indexPath, html);

function normalizeUrl(value) {
  if (!value) return '';
  const url = value.startsWith('http') ? value : `https://${value}`;
  return url.replace(/\/+$/, '');
}
