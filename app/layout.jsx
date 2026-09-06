import './globals.css';
import parse from 'html-react-parser';
import { nav, footer } from '../src/content.js';
import Interactions from './interactions.jsx';
export const metadata={title:'Eudora Movement House',icons:{icon:'/assets/favicon.svg'}};
export default function RootLayout({children}){
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{parse(nav)}{children}{parse(footer)}<Interactions /></body></html>;
}
