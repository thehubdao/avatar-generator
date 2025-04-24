import CitizenLeaderBoardUI from "../../../ui/citizens/leaderboard/leaderboard.ui";
import { FollowUser, UnfollowUser } from "../../../utils/web3/citizens.util";
import { useBlockchainProvider } from "../../../contexts/BlockchainContext";

export default function CitizenLeaderBoardComponent() {
  const { provider } = useBlockchainProvider();

  const handleFollowUser = async (address: string) => {
    if (provider) {
      const result = await FollowUser(address, provider);
      if (result.success) {
        // TODO: Update the leaderboard
      }
    }
  };

  const handleUnfollowUser = async (address: string) => {
    if (provider) {
      const result = await UnfollowUser(address, provider);
      if (result.success) {
        // TODO: Update the leaderboard
      }
    }
  };

  return <CitizenLeaderBoardUI />;
}