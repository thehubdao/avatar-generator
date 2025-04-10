import { useState, useEffect } from 'react';
import { GetFollowerCounts } from '../utils/web3/citizens.util';
import { Blockchain } from '../enums/blockchain/common.enum';
import { useAppSelector } from '../store/hooks';


// eslint-disable-next-line @typescript-eslint/naming-convention
export function useFollowCount(address: string | undefined) {
    const [followerCount, setFollowerCount] = useState<number>(-1);
    const [followingCount, setfollowingCount] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);

  useEffect(() => {
    async function fetchFollowCount() {
      if (!address || blockchainType === Blockchain.Solana) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
        const followerCountResult = await GetFollowerCounts(address);
        if (followerCountResult.success) {
          setFollowerCount(followerCountResult.value.followerCount);
          setfollowingCount(followerCountResult.value.followingCount);
        } else {
          setError(new Error(followerCountResult.errMessage));
          setFollowerCount(-1);
        }
        setIsLoading(false);
      
    }

    fetchFollowCount();
  }, [address]);

  return { followerCount, followingCount, isLoading, error };
}
