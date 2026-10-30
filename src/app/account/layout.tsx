import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Dashboard & Key Vault',
  description:
    'Manage your digital game keys, orders, wallet balance, and security preferences on VORTEX GAMING.',
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
