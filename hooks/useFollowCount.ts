import { useState, useEffect } from 'react';
import { GetFollowerCounts } from '../utils/web3/lukso.util';
import { useBlockchainWallet } from './useBlockchainWallet';
import { Blockchain } from '../enums/blockchain/common.enum';


export function useFollowCount(address: string | undefined) {
    const [followerCount, setFollowerCount] = useState<number>(-1);
    const [followingCount, setfollowingCount] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { blockchainType } = useBlockchainWallet();

  useEffect(() => {
    async function fetchFollowCount() {
      if (!address || blockchainType.current === Blockchain.Solana) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        
        const followerCountResult = await GetFollowerCounts(address);
        if (followerCountResult.success) {
          setFollowerCount(followerCountResult.value.followerCount);
          setfollowingCount(followerCountResult.value.followingCount);
        } else {
          setError(new Error(followerCountResult.errMessage));
        }

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
