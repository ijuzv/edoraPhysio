import type { Metadata } from 'next';
import parse from 'html-react-parser';
import { notFound } from 'next/navigation';
import { pages, cta } from '@/src/content';
import { siteOrigin, privatePaths } from '@/src/metadata';

export const dynamic = 'force-dynamic';

async function findPage(
  params: Promise<{ slug?: string[] }>,
): Promise<(typeof pages)[number] | undefined> {
  const { slug = [] } = await params;
  return pages.find(
    (p) => p.path === '/' + (slug.length ? slug.join('/') + '/' : ''),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const page = await findPage(params);
  if (!page) {
    return {};
  }

  const origin = siteOrigin();
  const isPrivate = privatePaths.includes(page.path);
  const index =
    process.env.PUBLIC_INDEXING === 'true' && !!origin && !isPrivate;

  return {
    title: `${page.title} | Eudora Movement House`,
    description: page.description,
    robots: {
      index,
      follow: index,
    },
    alternates:
      origin && !isPrivate
        ? {
            canonical: origin + page.path,
          }
        : undefined,
    openGraph: {
      title: `${page.title} | Eudora Movement House`,
      description: page.description,
      type: 'website',
      ...(origin && !isPrivate
        ? {
            url: origin + page.path,
            images: [origin + '/assets/eduro-logo.png'],
          }
        : {}),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<React.ReactElement> {
  const page = await findPage(params);
  if (!page) {
    notFound();
  }

  return (
    <main id="main">
      {parse(page.body)}
      {page.ctaShow ? parse(cta) : null}
    </main>
  );
}
