import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout & Payment',
  description:
    'Complete your digital game order with PCI-compliant payment gateways and Iraqi payment solutions (FIB, FastPay, Qi Card) on VORTEX GAMING.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
