import { useState, useEffect } from 'react';
import { GetUniversalProfileData } from '../utils/web3/lukso.util';

export function useUniversalProfile(address: string | undefined) {
  const [profileData, setProfileData] = useState<{
    name: string;
    profileImage: string;
  }>({
    name: '',
    profileImage: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        const universalProfileData = await GetUniversalProfileData(address);
        if (universalProfileData.success) {
          setProfileData(universalProfileData.value);
        } 
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [address]);

  return { ...profileData, isLoading };
}

