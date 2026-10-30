import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Your Account',
  description:
    'Sign in to VORTEX GAMING to access your encrypted digital game key vault and purchase history.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
