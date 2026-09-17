import type { Metadata } from 'next';
import LandingPage from '@/app/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'SITEKS DUKCAPIL | Sistem Informasi Manajemen & Penjadwalan Konten',
  description:
    'Sistem Informasi Teks & Penjadwalan Konten Media Sosial resmi Dinas Kependudukan dan Pencatatan Sipil. Rencanakan, simulasikan, dan publikasikan informasi layanan adminduk secara terstruktur.',
};

export default function RootPage() {
  return <LandingPage />;
}