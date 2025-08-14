'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, ReactNode } from 'react';

// Dynamically import the ProgressBar component without SSR
const ProgressBar = dynamic(
  () => import('next-nprogress-bar').then((mod) => mod.AppProgressBar),
  { ssr: false }
);

interface ProvidersProps {
  children?: ReactNode;
}

const Providers = ({ children }: ProvidersProps = {}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <ProgressBar
          height="4px"
          color="#283c63"
          options={{ showSpinner: false }}
          shallowRouting
        />
      )}
    </>
  );
};

export default Providers;
