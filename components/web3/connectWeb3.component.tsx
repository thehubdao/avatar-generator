import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

interface ConnectWeb3ButtonProps {
  classStyles: string;
  setIsSigned: (signed: boolean) => void;
  children: React.ReactNode;
}

export default function ConnectWeb3Button({ children, classStyles, setIsSigned }: ConnectWeb3ButtonProps) {
  const { login, authenticated:isAuthenticated, user } = usePrivy();

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsSigned(true);
    }
  }, [isAuthenticated, user, setIsSigned]);

  return (
    <button
      className={classStyles}
      onClick={login}
      disabled={isAuthenticated}
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
    </button>
  );
}