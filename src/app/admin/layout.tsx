import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Command Center',
  description:
    'Administrative management console for inventory, fraud alerts, and revenue metrics on VORTEX GAMING.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
