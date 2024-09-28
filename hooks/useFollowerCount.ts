import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const LSP26_ADDRESS = '0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA';

const LSP26_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'followerCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export function useFollowerCount(address: string) {
    const [followerCount, setFollowerCount] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFollowerCount() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);

        const count = await lsp26Contract.followerCount(address);
        setFollowerCount(Number(count));
      } catch (err) {
        console.error('Error fetching follower count:', err);
        setError(err instanceof Error ? err : new Error('An error occurred while fetching follower count'));
        setFollowerCount(-1);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFollowerCount();
  }, [address]);

  return { followerCount, isLoading, error };
}
