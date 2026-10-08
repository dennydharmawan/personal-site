import type { APIRoute } from 'astro';
import { aboutEvidence, aboutParagraph, experiences, profileLinks, projects, siteMeta } from '@/components/portfolio-home-data';

const siteUrl = siteMeta.url;

const about = aboutParagraph
  .map((segment) => (typeof segment === 'string' ? segment : aboutEvidence[segment.evidence].phrase))
  .join('');

const body = `# Denny Dharmawan

> ${siteMeta.description}

${about}

## Experience

${experiences
  .map(
    (job) =>
      `### ${job.role}, ${job.company} (${job.period})\n\n${job.summary}\n\n${job.highlights.map((h) => `- ${h.text}`).join('\n')}`,
  )
  .join('\n\n')}

## Work samples

${projects
  .map((p) => `### ${p.title}\n\n${p.problem} ${p.built}\n\nStack: ${p.stack.join(', ')}.`)
  .join('\n\n')}

## Links

- [Portfolio](${siteUrl}): work samples, experience, and contact details
- [Resume](${new URL('/resume.pdf', siteUrl).href}): PDF
- [LinkedIn](${profileLinks.linkedIn})
- [GitHub](${profileLinks.gitHub})
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
