import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account',
  description:
    'Join VORTEX GAMING for instant digital key delivery, order tracking, and exclusive discounts.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
