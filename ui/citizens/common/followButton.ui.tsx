import { useState } from "react";
import { LeaderboardEntry } from "../../../types/leaderboard.type";
import AddUserSVG from "./SVG/addUserSVG.ui";
import { useSnackbar } from "../snackbar/snackbar.provider";
import PlusSVG from "./SVG/plusSVG.ui";

interface FollowButtonProps {
  user: LeaderboardEntry;
  onFollowUser: (address: string) => Promise<boolean>;
  onUnfollowUser: (address: string) => Promise<boolean>;
}

export default function FollowButton({ user, onFollowUser, onUnfollowUser }: FollowButtonProps) {

  const { showSnackbar } = useSnackbar();

  const followUserHandler = async () => {
    setIsLoading(true);
    const isSuccess = await onFollowUser(user.address);

    if (!isSuccess) {
      showSnackbar(
        <p>Follow failed, try again later.</p>
      )
    }
    setIsLoading(false);
  }

  const unfollowUserHandler = async () => {
    setIsLoading(true);
    const isSuccess = await onUnfollowUser(user.address);
    console.log('isSuccess', isSuccess);
    if (!isSuccess) {

      showSnackbar(
        <p>Unfollow failed, try again later.</p>
      )
    }
    setIsLoading(false);
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  return !user.isFollowing ? <div
    className={`h-7 sm:h-11 w-8 sm:w-16 flex justify-center items-center rounded-[20px] cursor-pointer mr-2 lg:mr-8 bg-white`}
    onClick={() => {
      if (!user.isFollowing) {
        setIsLoading(true);
        followUserHandler();
      }
    }}
  >
    {isLoading ?
      <div className="w-2 sm:w-2 h-2 sm:h-4 border-t border-citizens-dark rounded-full animate-spin" />
      :
      <div className="scale-75">
        <AddUserSVG />
      </div>
    }
  </div> : <div
    className={`h-7 sm:h-11 w-8 sm:w-16 flex justify-center items-center rounded-[20px] cursor-pointer mr-2 lg:mr-8 bg-white`}
    onClick={() => {
      if (user.isFollowing) {
        setIsLoading(true);
        unfollowUserHandler();
      }
    }}
  >
    {isLoading ?
      <div className="w-2 sm:w-4 h-2 sm:h-4 border-t border-citizens-dark rounded-full animate-spin" />
      :
      <div className="rotate-45">
        <PlusSVG className="fill-citizens-dark" />
      </div>
    }
  </div>
}