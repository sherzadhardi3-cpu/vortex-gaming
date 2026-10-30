import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Data Protection Policy',
  description:
    'VORTEX GAMING transparent privacy practices, encryption standards, and user data rights.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
