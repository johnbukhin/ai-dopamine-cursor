import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compass - Your Personal Well-being Plan',
  description: 'Personalized well-being management powered by evidence-based techniques',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
