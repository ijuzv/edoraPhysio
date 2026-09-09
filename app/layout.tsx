import type { Metadata } from 'next';
import './globals.css';
import parse from 'html-react-parser';
import { nav, footer } from '@/src/content';
import Interactions from './interactions';

export const metadata: Metadata = {
  title: 'Eudora Movement House',
  icons: {
    icon: '/assets/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {parse(nav)}
        {children}
        {parse(footer)}
        <Interactions />
      </body>
    </html>
  );
}
