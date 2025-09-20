import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '../context/ThemeContext';
import { AIAgentProvider } from '../context/AIAgentContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nitigya Kargeti | Data Scientist & ML Engineer",
  description: "Portfolio of Nitigya Kargeti - Data Scientist and Machine Learning Engineer.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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