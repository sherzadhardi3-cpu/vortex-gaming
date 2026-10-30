import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support & Help Desk',
  description:
    'Contact VORTEX GAMING dedicated support desk, live chat dispatch, and customer service.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
