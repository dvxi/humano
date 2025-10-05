import type { Metadata } from 'next';
import { Inter, Noto_Serif_Hebrew } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const notoSerifHebrew = Noto_Serif_Hebrew({
  variable: '--font-noto-serif-hebrew',
  subsets: ['latin', 'hebrew'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Fitness & Wellbeing App',
  description:
    'Track your fitness, monitor recovery, and optimize your training with AI-powered recommendations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoSerifHebrew.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
