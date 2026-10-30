import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Store & Digital Catalog',
  description:
    'Browse legitimate PC and console activation keys with instant delivery and multi-currency checkout on VORTEX GAMING.',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
