import { useState } from "react";
import { LeaderboardEntry } from "../../../types/leaderboard.type";
import AddUserSVG from "./SVG/addUserSVG.ui";
import { useSnackbar } from "../snackbar/snackbar.provider";
import RemoveUserSVG from "./SVG/removeUserSVG.ui";

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
      showSnackbar(<p>Follow failed, try again later.</p>);
    } else {
      showSnackbar(<p>{(user.name && user.name?.length > 0) ? user.name : user.address} followed!</p>);
    }
    setIsLoading(false);
  }

  const unfollowUserHandler = async () => {
    setIsLoading(true);
    const isSuccess = await onUnfollowUser(user.address);
    if (!isSuccess) {
      showSnackbar(<p>Unfollow failed, try again later.</p>);
    } else {
      showSnackbar(<p>{(user.name && user.name?.length > 0) ? user.name : user.address} unfollowed!</p>);
    }
    setIsLoading(false);
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <div>
      {
        !user.isFollowing ? <div
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
            <div className="scale-100">
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
            <div className="scale-100">
              <RemoveUserSVG />
            </div>
          }
        </div>
      }
    </div>
  )
}