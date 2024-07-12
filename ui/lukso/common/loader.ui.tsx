import React from 'react';
import LogoUI from './logo.ui';

interface LoaderUIProps {
  size?: number;
}

export default function Loader({size = 125}: LoaderUIProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div style={{ width: size, height: size }} className="text-center">
        <LogoUI />
      </div>
    </div>
  );
}
