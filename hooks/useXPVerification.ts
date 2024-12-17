import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface XPData {
  xp: number;
  level: number;
  nextLevelXP: number;
}

export function useXPVerification() {
  const { user } = usePrivy();
  const [xpData, setXPData] = useState<XPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function verifyXP() {
      if (!user?.wallet?.address) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: user.wallet.address.toLowerCase(),
          }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }

        setXPData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify XP');
      } finally {
        setIsLoading(false);
      }
    }

    verifyXP();
  }, [user?.wallet?.address]);

  return { xpData, isLoading, error };
}
