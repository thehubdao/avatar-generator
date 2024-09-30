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
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'followingCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export function useFollowCount(address: string | undefined) {
    const [followerCount, setFollowerCount] = useState<number>(-1);
    const [followingCount, setfollowingCount] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFollowCount() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);

        const followerCount = await lsp26Contract.followerCount(address);
        const followingCount = await lsp26Contract.followingCount(address);

        setFollowerCount(Number(followerCount));
        setfollowingCount(Number(followingCount));
      } catch (err) {
        console.error('Error fetching follower count:', err);
        setError(err instanceof Error ? err : new Error('An error occurred while fetching follower count'));
        setFollowerCount(-1);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFollowCount();
  }, [address]);

  return { followerCount, followingCount, isLoading, error };
}
