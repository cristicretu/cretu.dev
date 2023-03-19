import { cn } from "@/lib/className";
import { Inter } from "next/font/google";

// import "../styles/output.css";
import "./globals.css";
import Providers from "./providers";
import Footer from "../ui/Footer";
import Swatch from "@/ui/Swatch";

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
        {/* <div className="absolute z-10 flex flex-col items-center bg-gray-200 dark:bg-gray-800 w-fit space-y-2 rounded-t-2xl rounded-xl p-1.5"></div>
        <div className="p-2  sticky left-5 bottom-5 w-12 h-14 flex text-xs text-white flex-col bg-[#7786FE] bg-[#9CB7FF] hover:bg-opacity-80 transition-all duration-200 items-center space-y-1 cursor-pointer transition-all duration-200 rounded-t-xl rounded-b-lg rounded-lg" />
        <div className="bg-[#ADC9FA] p-2 w-12 h-14 flex flex-col items-center justify-center cursor-crosshair rounded-b-xl rounded-t-lg" />
        <div className="bg-[#CC697D] bg-[#E19DC2]" />
        <div className="bg-[#BC7BFD] bg-[#D5ACFF] font-semibold" /> */}
        {/* <div className="sticky    py-2 z-[1] bottom-2 top-2 md:top-4  mx-auto flex rounded-full justify-center items-center " /> */}
        {/* <div className="px-2 mt-24 pb-24 pt-4"></div> */}
        <div className="select-none"></div>
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
