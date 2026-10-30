import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist & Price Alerts',
  description:
    'Track price drops, releases, and favorite digital games on your VORTEX GAMING wishlist.',
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
