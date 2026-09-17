import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@tabler/icons-webfont/dist/tabler-icons.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SITEKS DUKCAPIL - Sistem Informasi Teks & Penjadwalan Konten",
    template: "%s | SITEKS DUKCAPIL",
  },
  description: "Platform manajemen template teks dan penjadwalan konten media sosial resmi Dinas Kependudukan dan Pencatatan Sipil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
