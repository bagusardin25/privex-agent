import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flare Private AI Financial Agent | Confidential Portfolio Risk & Execution',
  description:
    'An AI financial agent that privately evaluates portfolio risks in Flare Confidential Compute TEE and executes approved rebalancing actions on Flare Testnet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen text-[#F8FAFC] flex flex-col selection:bg-amber-500/20 selection:text-amber-300">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
