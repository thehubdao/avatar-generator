import CitizenLeaderBoardUI from "../../../ui/citizens/leaderboard/leaderboard.ui";
import { FollowUser, UnfollowUser } from "../../../utils/web3/citizens.util";
import { useAppSelector } from "../../../store/hooks";

export default function CitizenLeaderBoardComponent() {
  const provider = useAppSelector(state => state.citizensAuth.provider);

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