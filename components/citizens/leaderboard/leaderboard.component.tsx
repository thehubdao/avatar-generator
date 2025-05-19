import CitizenLeaderBoardUI from "../../../ui/citizens/leaderboard/leaderboard.ui";
import { FollowUser, UnfollowUser } from "../../../utils/web3/citizens.util";
import { useBlockchainProvider } from "../../../contexts/BlockchainContext";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setLeaderboardData } from "../../../store/citizensMetadataSlice";
import { LogError } from "../../../utils/common.util";
import { Module } from "../../../enums/common.enum";

export default function CitizenLeaderBoardComponent() {
  const dispatch = useAppDispatch();
  const leaderboardData = useAppSelector(state => state.citizensMetadata.leaderboardData);
  const { ethersProvider } = useBlockchainProvider();


  const handleFollowUser = async (address: string) => {
    if (ethersProvider) {
      const result = await FollowUser(address, ethersProvider);
      if (result.success) {
        if (!leaderboardData || leaderboardData === null) {
          LogError(Module.Citizens, "Leaderboard data is not loaded yet, please try again later.");
          return false;
        }

        dispatch(setLeaderboardData(leaderboardData.map(entry =>
          entry.address === address
            ? { ...entry, isFollowing: true }
            : entry
        )));
      }
      return result.success;
    } else {
      return false;
    }
  };

  const handleUnfollowUser = async (address: string) => {
    if (ethersProvider) {
      const result = await UnfollowUser(address, ethersProvider);
      if (result.success) {
        if (!leaderboardData || leaderboardData === null) {
          LogError(Module.Citizens, "Leaderboard data is not loaded yet, please try again later.");
          return false;
        }
        
        dispatch(setLeaderboardData(leaderboardData.map(entry =>
          entry.address === address
            ? { ...entry, isFollowing: false }
            : entry
        )));
      }
      return result.success;
    } else {
      return false;
    }
  };

  return <CitizenLeaderBoardUI onFollowUser={(address) => handleFollowUser(address)} onUnfollowUser={(address) => handleUnfollowUser(address)} />;
}