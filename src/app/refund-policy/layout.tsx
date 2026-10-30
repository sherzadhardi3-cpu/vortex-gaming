import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Return Policy for Digital Goods',
  description:
    'VORTEX GAMING transparent digital goods cancellation, key replacement, and refund policies.',
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
