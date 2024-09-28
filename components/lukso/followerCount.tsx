import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import UniversalProfileContract from '../../constants/abi/UniversalProfileABI.json';

interface FollowerCountProps {
  address: string;
}

export default function FollowerCount({ address }: FollowerCountProps) {
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [isUniversalProfile, setIsUniversalProfile] = useState<boolean>(false);

  useEffect(() => {
    async function fetchFollowerCount() {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const universalProfileContract = new ethers.Contract(
        address,
        UniversalProfileContract,
        provider
      );

      try {
        // Check if the address is a Universal Profile
        const supportsLSP26 = await universalProfileContract.supportsInterface('0x5ef83ad9');
        setIsUniversalProfile(supportsLSP26);

        if (supportsLSP26) {
          // Fetch follower count using followerCount function
          const count = await universalProfileContract.followerCount(address);
          setFollowerCount(Number(count));
        }
      } catch (error) {
        console.error('Error checking Universal Profile or fetching followers:', error);
        setIsUniversalProfile(false);
      }
    }

    if (address) {
      fetchFollowerCount();
    }
  }, [address]);

  if (!isUniversalProfile) {
    return null;
  }

  return (
    <div className="text-white">
      {followerCount !== null ? (
        <p>Followers: {followerCount}</p>
      ) : (
        <p>Loading follower count...</p>
      )}
    </div>
  );
}