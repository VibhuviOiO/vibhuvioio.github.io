import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vibhuvioio.com/"),
  title: {
    default: "VibhuviOiO - Open Source Infrastructure Tools & DevOps Automation",
    template: "%s | VibhuviOiO",
  },
  description: "Production-ready open source infrastructure tools for Docker, Kubernetes, LDAP, and monitoring. Self-hosted DevOps automation that just works.",
  keywords: ["infrastructure", "devops", "open source", "docker", "kubernetes", "monitoring", "LDAP", "self-hosted"],
  authors: [{ name: "VibhuviOiO" }],
  creator: "VibhuviOiO",
  publisher: "VibhuviOiO",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "VibhuviOiO - Open Source Infrastructure Tools",
    description: "Production-ready open source infrastructure tools for Docker, Kubernetes, LDAP, and monitoring.",
    type: "website",
    url: "https://vibhuvioio.com",
    siteName: "VibhuviOiO",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibhuviOiO - Open Source Infrastructure Tools",
    description: "Production-ready open source infrastructure tools for Docker, Kubernetes, LDAP, and monitoring.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add when available
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WCRSK785');
          `}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-WCRSK785"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
