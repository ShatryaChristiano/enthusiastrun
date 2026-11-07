import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Provider } from "@/components/pages/layout/Provider";
import Navbar from "@/components/pages/layout/Navbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Footer from "@/components/pages/layout/Footer";
import FloatingActionButton from "@/components/pages/layout/FloatingActionButton";
import { Toaster } from "@/components/ui/sonner";

// Heading font (provided by client)
const morway = localFont({
  src: [
    { path: "../fonts/Morway-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/Morway-Italic.otf", weight: "400", style: "italic" },
  ],
  variable: "--font-morway",
  display: "swap",
});

// Sub-heading / body font
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enthusiast Foam Run",
  description: "Enthusiast Foam Run is a premier fun run event by IBM Student Union, Universitas Ciputra. Discover our routes, partnership opportunities, and 5K category.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${morway.variable} ${montserrat.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Provider session={session}>
          <Navbar />
          {children}
          <Footer />
          <FloatingActionButton />  
          <Toaster richColors closeButton />
        </Provider>
      </body>
    </html>
  );
}
