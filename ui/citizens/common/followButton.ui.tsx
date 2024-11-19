import { useState } from "react";
import { LeaderboardEntry } from "../../../types/leaderboard.type";
import AddUserSVG from "./SVG/addUserSVG.ui";
import { useSnackbar } from "../snackbar/snackbar.provider";

interface FollowButtonProps {
  user: LeaderboardEntry;
  onFollowUser: (address: string) => Promise<boolean>;
}

export default function FollowButton({ user, onFollowUser }: FollowButtonProps) {

  const { showSnackbar } = useSnackbar();

  const followUserHandler = async () => {
    setIsLoading(true);
    const isSuccess = await onFollowUser(user.address);
    if (!isSuccess) {
      setIsLoading(false);
      showSnackbar(
        <p>Follow failed, try again later.</p>
      )
    }
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <div
      className={`h-11 w-16 flex justify-center items-center rounded-[20px] cursor-pointer mr-8 bg-white`}
      onClick={() => {
        if (!user.isFollowing) {
          setIsLoading(true);
          followUserHandler();
        }
      }}
    >
      {isLoading ?
        <div className="w-4 h-4 border-t border-citizens-dark rounded-full animate-spin" />
        :
        <AddUserSVG />
      }
    </div>
  )
}