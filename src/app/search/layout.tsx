import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Game Catalog',
  description:
    'Search thousands of legitimate PC and console games by title, platform, publisher, or genre on VORTEX GAMING.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
