import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Chat Demo — @agent-chat/react + AI SDK',
  description:
    'A demo application showing how to use @agent-chat/react library with the Vercel AI SDK for building AI agent chat interfaces.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
