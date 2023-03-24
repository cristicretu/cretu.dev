import Footer from '../ui/Footer';
import './globals.css';
import Providers from './providers';
import { cn } from '@/lib/className';
import AnimateEnter from '@/ui/AnimateEnter';
import RollingMenu from '@/ui/RollingMenu';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  archives: ['https://old.crtu.dev'],
  authors: [{ name: 'Cristian Crețu', url: 'https://cretu.dev' }],
  category: 'design',
  creator: 'Cristian Crețu',
  description: 'Design Engineer.',
  icons: {
    apple: '/static/favicons/apple-touch-icon-180x180.png',
    icon: '/static/favicons/favicon-196x196.png',
    shortcut: '/favicon.ico',
  },
  keywords: [
    'Next.js',
    'React',
    'JavaScript',
    'TypeScript',
    'TailwindCSS',
    'Design',
    'Engineering',
    'Frontend',
    'Developer',
    'Software',
    'Cristian Crețu',
    'Cristicrtu',
    'cretu.dev',
    'romania',
  ],
  manifest: '/static/favicons/site.webmanifest',
  openGraph: {
    description: 'Design Engineer.',
    images: [
      {
        alt: 'Cristian Crețu',
        height: 1080,
        url: 'https://cretu.dev/static/images/og.png',
        width: 1920,
      },
    ],
    locale: 'en-US',
    siteName: 'Cristian Crețu',
    title: 'Cristian Crețu',
    type: 'website',
    url: 'https://cretu.dev',
  },
  publisher: 'Cristian Crețu',
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    index: true,
  },
  themeColor: [
    { color: 'white', media: '(prefers-color-scheme: light)' },
    { color: '#171717', media: '(prefers-color-scheme: dark)' },
  ],
  title: {
    default: 'Cristian Crețu',
    template: '%s | Cristian Crețu',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cristicrtu',
    title: 'Cristian Crețu',
  },
  verification: {
    google: 'fK4YqLAHjoaynXLF1e5gaPzDNOircgiYSgAwSXqr61o',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${inter.className}`,
          'h-full, min-h-screen, relative w-full',
          'my-4 bg-white dark:bg-gray-900 sm:my-24',
          'motion-reduce:transform-none motion-reduce:transition-none',
        )}
      >
        {/* <div className="absolute z-10 flex flex-col items-center bg-gray-200 dark:bg-gray-800 w-fit space-y-2 rounded-t-2xl rounded-xl p-1.5"></div>
        <div className="p-2  sticky left-5 bottom-5 w-12 h-14 flex text-xs text-white flex-col bg-[#7786FE] bg-[#9CB7FF] hover:bg-opacity-80 transition-all duration-200 items-center space-y-1 cursor-pointer transition-all duration-200 rounded-t-xl rounded-b-lg rounded-lg" />
        <div className="bg-[#ADC9FA] p-2 w-12 h-14 flex flex-col items-center justify-center cursor-crosshair rounded-b-xl rounded-t-lg" />
        <div className="bg-[#CC697D] bg-[#E19DC2]" />
        <div className="bg-[#BC7BFD] bg-[#D5ACFF] font-semibold" /> */}
        {/* <div className="sticky    py-2 z-[1] bottom-2 top-2 md:top-4  mx-auto flex rounded-full justify-center items-center " /> */}
        {/* <div className="px-2 mt-24 pb-24 pt-4"></div> */}
        {/* <article className="prose prose-quoteless prose-neutral dark:prose-invert"></article> */}
        {/* <div className="pl-2 select-none pt-4 underline underline-offset-[3px] hover:no-underline hover:bg-[url('/static/squiggle.svg')]"></div> */}
        {/* <div className="flip-card-inner bg-[#1DB954] text-lg opacity-70 bg-[#C4150C] w-1/2 bg-[#214D72] w-1/2 bg-[#171515] bg-indigo-400 bg-orange-500 cursor-pointer  rotate-y-180 select-none flip-card bg-[#00acee] rotate-180 h-full font-semibold flip-card  rounded-lg flex items-center rounded-lg h-96 bg-green-500 flex flex-col gap-0 p-6 items-center justify-center p-6 flip-card-back justify-center gap-2 flip-card-front  text-2xl text-gray-100 text-center"></div> */}
        {/* <div className="bg-blue-500 p-4"></div> */}
        {/* <div className="mx-0.5 h-8 w-8 items-center rounded-full bg-black p-3 text-white dark:bg-white dark:text-black"></div> */}
        {/* <div className=" ml-0.5 w-3 bg-[#228B22]  bg-[#EC605A] bg-[#EC605A] bg-[#5D0F07] bg-[#F7D358] bg-[#673D13] bg-[#61C167] bg-[#0D2805] bg-[#63C7FA] bg-[#63C7FA] bg-[#102E62] bg-[#EC79F9] bg-[#EC79F9] bg-[#5C0E63] bg-[#9f3e1b] bg-[#FF7F50] text-[#9f3e1b] text-[#5D0F07] text-[#673D13] text-[#102E62] text-[#5C0E63] text-[#0D2805]"></div> */}
        <Providers>
          <nav className="fixed bottom-4 left-2 z-50 sm:left-4 md:left-6">
            {/* <button className="rounded-full bg-blue-500 p-3">
              <PlusIcon className="h-6 w-6 text-white" />
            </button> */}
            {/* <div>hey</div> */}
            <RollingMenu />
            {/* <Swatch /> */}
          </nav>
          <AnimateEnter>
            <>
              {children}
              <Footer />
            </>
          </AnimateEnter>
        </Providers>
      </body>
    </html>
  );
}
