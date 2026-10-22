import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Exam Management System',
  description: 'Comprehensive institutional examination platform with automated date sheet scheduling, 10-day paper deadline tracking, QA auditing, duty roster generation, and grade publishing.',
  openGraph: {
    title: 'Exam Management System',
    description: 'Comprehensive institutional examination platform with automated date sheet scheduling, 10-day paper deadline tracking, QA auditing, duty roster generation, and grade publishing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exam Management System',
    description: 'Comprehensive institutional examination platform with automated date sheet scheduling, 10-day paper deadline tracking, QA auditing, duty roster generation, and grade publishing.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
