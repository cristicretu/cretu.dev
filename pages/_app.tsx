import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import 'vercel-toast/dist/vercel-toast.css';

import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
