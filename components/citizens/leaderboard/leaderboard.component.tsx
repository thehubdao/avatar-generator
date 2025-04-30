import CitizenLeaderBoardUI from "../../../ui/citizens/leaderboard/leaderboard.ui";
import { FollowUser, UnfollowUser } from "../../../utils/web3/citizens.util";
import { useBlockchainProvider } from "../../../contexts/BlockchainContext";
import { BrowserProvider } from "ethers";

export default function CitizenLeaderBoardComponent() {
  const { ethersProvider } = useBlockchainProvider();


  const handleFollowUser = async (address: string) => {
    if (ethersProvider) {
      const result = await FollowUser(address, ethersProvider);
      if (result.success) {
        // TODO: Update the leaderboard
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
        // TODO: Update the leaderboard
      }
      return result.success;
    } else {
      return false;
    }
  };

  return <CitizenLeaderBoardUI onFollowUser={(address) => handleFollowUser(address)} onUnfollowUser={(address) => handleUnfollowUser(address)} />;
}