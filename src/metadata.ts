export function siteOrigin(): string {
  try {
    const u = new URL(process.env.SITE_URL || '');
    return u.protocol === 'https:' ? u.origin : '';
  } catch {
    return '';
  }
}

export const privatePaths: string[] = [
  '/practitioner/',
  '/feedback/',
  '/privacy/',
  '/terms/',
];
