import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FinSight AI — Explainable Financial Intelligence for Small Businesses',
  description:
    'Multi-agent AI platform that analyzes your transactions, detects anomalies, forecasts cash flow, and simulates decisions using an AI Boardroom of specialized financial agents.',
  keywords: ['financial intelligence', 'cash flow forecasting', 'anomaly detection', 'AI boardroom', 'small business'],
  openGraph: {
    title: 'FinSight AI',
    description: 'Explainable Financial Intelligence for Small Businesses',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
