import type { APIRoute } from 'astro';
import { siteMeta } from '@/components/portfolio-home-data';

// Every deploy rebuilds the one page, so the build date is when it last changed.
const lastmod = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${siteMeta.url}</loc>
		<lastmod>${lastmod}</lastmod>
	</url>
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
