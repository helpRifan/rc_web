import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Robotics Club, VIT Chennai', template: '%s | Robotics Club, VIT Chennai' },
  description: 'Students at VIT Chennai who design, wire and program robots, then take them to competitions.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="dark antialiased">
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
