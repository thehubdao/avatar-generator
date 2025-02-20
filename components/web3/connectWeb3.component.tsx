import { usePrivy } from '@privy-io/react-auth';

interface ConnectWeb3ButtonProps {
  classStyles: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function ConnectWeb3Button({ children, classStyles, onClick }: ConnectWeb3ButtonProps) {
  const {authenticated:isAuthenticated } = usePrivy();
  return (
    <button
      className={classStyles}
      onClick={
          onClick
      
      }
      disabled={isAuthenticated}
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
    </button>
  );
}