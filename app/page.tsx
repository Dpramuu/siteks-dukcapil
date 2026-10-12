import type { Metadata } from 'next';
import LandingPage from '@/app/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'SIMANTEN | Sistem Informasi Manajemen & Penjadwalan Konten',
  description:
    'Sistem Informasi Manajemen & Penjadwalan Konten Media Sosia. Rencanakan, simulasikan, dan publikasikan informasi konten secara terstruktur.',
};

export default function RootPage() {
  return <LandingPage />;
}