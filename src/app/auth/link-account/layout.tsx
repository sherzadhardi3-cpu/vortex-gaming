import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Discord Account',
  description:
    'Securely link your Discord account with VORTEX GAMING.',
};

export default function LinkAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
