import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activation Troubleshooting & FAQ Guide',
  description:
    'Comprehensive step-by-step game key redemption tutorials for Steam, PlayStation, Xbox, and Epic Games.',
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
