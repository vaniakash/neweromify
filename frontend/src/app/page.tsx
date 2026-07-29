import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <HomePageClient />;
}
