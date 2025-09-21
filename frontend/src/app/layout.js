import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '../context/ThemeContext';
import { AIAgentProvider } from '../context/AIAgentContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Improve font loading performance
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Only preload primary font
});

export const metadata = {
  title: "Nitigya Kargeti | Data Scientist & ML Engineer",
  description: "Portfolio of Nitigya Kargeti - Data Scientist and Machine Learning Engineer specialized in LLMs, robotics, and conversational AI.",
  keywords: "Nitigya Kargeti, Data Science, Machine Learning, AI, LLM, Robotics, Portfolio",
  authors: [{ name: "Nitigya Kargeti" }],
  creator: "Nitigya Kargeti",
  openGraph: {
    title: "Nitigya Kargeti | Data Scientist & ML Engineer",
    description: "Portfolio showcasing ML projects, research publications, and AI expertise",
    url: "https://www.ntropy.dev",
    siteName: "Nitigya Kargeti Portfolio",
    images: [
      {
        url: "/photo.jpeg",
        width: 1764,
        height: 1764,
        alt: "Nitigya Kargeti",
      },
    ],
    locale: "en_US",
    type: "website",
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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1108' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect for critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/photo.jpeg" as="image" type="image/jpeg" />
        
        {/* Performance hints */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AIAgentProvider>
            {children}
          </AIAgentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}