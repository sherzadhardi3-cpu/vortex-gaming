import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description:
    'Review your selected digital games, enter promotional coupons, and proceed to secure checkout on VORTEX GAMING.',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
