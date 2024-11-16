import { ReactNode } from 'react';

interface SnackbarProps {
  message: ReactNode;
}

export default function Snackbar({message}: SnackbarProps) {
  return (
    <div className="max-w-xl bg-black/25 backdrop-blur-sm px-6 py-4 rounded-2xl transition duration-300 ease-in-out animate-slide-in">
      <div className="text-white text-center">
        {message}
      </div>
    </div>
  );
}
