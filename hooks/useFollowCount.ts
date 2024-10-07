import { useState, useEffect } from 'react';
import { GetFollowerCounts } from '../utils/web3/lukso.util';



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
        const { followerCount, followingCount } = await GetFollowerCounts(address);

        setFollowerCount(followerCount);
        setfollowingCount(followingCount);
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
