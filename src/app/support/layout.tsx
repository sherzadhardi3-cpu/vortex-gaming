import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Support & Help Center',
  description:
    'VORTEX GAMING dedicated customer support desk, ticket dispatch, and game key activation help.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
