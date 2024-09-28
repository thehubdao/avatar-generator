import { useState, useEffect } from 'react';
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import LSP3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import { ethers } from 'ethers';

export function useFollowerCount(address: string) {
  const [followerCount, setFollowerCount] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFollowerCount() {
      if (!address) return;

      setIsLoading(true);
      try {
        // Usar ethers 6 para crear el proveedor
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        
        const erc725 = new ERC725(
          LSP3ProfileSchema as ERC725JSONSchema[],
          address,
          provider,
          {
            ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
          }
        );

        const profileMetadata = await erc725.fetchData('LSP3Profile');

        if (profileMetadata.value && typeof profileMetadata.value === 'object') {
          const tags = (profileMetadata.value as any).LSP3Profile?.tags;
          if (tags && Array.isArray(tags)) {
            const followerTag = tags.find((tag: string) => tag.startsWith('FOLLOWER:'));
            if (followerTag) {
              const count = parseInt(followerTag.split(':')[1], 10);
              setFollowerCount(isNaN(count) ? 0 : count);
            } else {
              setFollowerCount(0);
            }
          } else {
            setFollowerCount(0);
          }
        } else {
          setFollowerCount(0);
        }
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
