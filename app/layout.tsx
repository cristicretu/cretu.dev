import { cn } from "@/lib/className";
import { Inter } from "next/font/google";

// import "../styles/output.css";
import "./globals.css";
import Providers from "./providers";
import Footer from "../ui/Footer";
import Swatch from "@/ui/Swatch";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Cristian Crețu",
    template: "%s | Cristian Crețu",
  },
  description: "Design Engineer.",
  manifest: "/static/favicons/site.webmanifest",
  category: "design",
  icons: {
    icon: "/static/favicons/favicon-196x196.png",
    shortcut: "/favicon.ico",
    apple: "/static/favicons/apple-touch-icon-180x180.png",
  },
  openGraph: {
    title: "Cristian Crețu",
    description: "Design Engineer.",
    url: "https://cretu.dev",
    siteName: "Cristian Crețu",
    images: [
      {
        url: "https://leerob.io/static/images/og.png",
        alt: "Cristian Crețu",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Cristian Crețu",
    site: "@cristicrtu",
    card: "summary_large_image",
  },

  verification: {
    google: "fK4YqLAHjoaynXLF1e5gaPzDNOircgiYSgAwSXqr61o",
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
          "relative h-full, min-h-screen, w-full",
          "my-24 bg-white dark:bg-gray-900",
          "motion-reduce:transition-none motion-reduce:transform-none"
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
        <Providers>
          <nav className="fixed z-50 bottom-4 left-4">
            <Swatch />
          </nav>
          <main className="max-w-2xl mx-auto p-4">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
