import { cn } from "@/lib/className";
import { Inter } from "next/font/google";

import "../styles/globals.css";
import Providers from "./providers";
import Footer from "../ui/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cristian Crețu",
  description: "Design Engineer",
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
        <Providers>
          <main className="max-w-2xl mx-auto p-4">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
