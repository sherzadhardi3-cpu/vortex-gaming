import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service & User Agreement',
  description:
    'Terms of service, digital licensing standards, and customer agreements for VORTEX GAMING.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
