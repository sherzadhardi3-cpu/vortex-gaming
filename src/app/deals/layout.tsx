import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weekend Flash Deals & Discounts',
  description:
    'Exclusive limited-time price drops on publisher game keys with up to 75% savings on VORTEX GAMING.',
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
