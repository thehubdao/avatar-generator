import Image from 'next/image';
import { LeaderboardEntry } from '../../../types/leaderboard.type';
import FollowButton from '../common/followButton.ui';

interface LeaderBoardProps {
  leaderboardData?: LeaderboardEntry[];
  onFollowUser: (address: string) => Promise<boolean>;
  onUnfollowUser: (address: string) => Promise<boolean>;
}

export default function LeaderBoard({ leaderboardData, onFollowUser, onUnfollowUser }: LeaderBoardProps) {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32 px-6 2xl:px-0">
      {/* NO DATA */}
      {leaderboardData === undefined &&
        <div className={`fixed inset-0 w-full h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#151515] to-[#0C0C0C]`}>
          <p className=" text-white text-xl font-light">Sorry, data is not loaded, try again later.</p>
        </div>
      }
      {/* LOADER */}
      {leaderboardData && leaderboardData.length <= 0 &&
        <div className={`fixed inset-0 w-full h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-[#151515] to-[#0C0C0C]`}>
          <p className=" text-white text-xl font-light">Loading leaderboard data</p>
          <div className="w-4 h-4 border-t rounded-full animate-spin"></div>
        </div>
      }
      {/* DATA TABLE */}
      {
        leaderboardData && leaderboardData.length > 0 &&
        <table className="relative w-full font-light text-base xl:text-lg shadow-citizens-btn bg-citizens-dark text-white container mx-auto rounded-2xl">
          <thead className="border-b border-white/20">
            <tr className="h-20">
              <th className="font-light text-center pl-5 rounded-tl-2xl">USERNAME</th>
              <th className="font-light text-center">LEVEL</th>
              <th className="font-light text-center hidden lg:table-cell px-2">CITIZENS HOLDINGS</th>
              <th className="font-light text-center hidden lg:table-cell px-2">WEARABLE HOLDINGS</th>
              <th className="font-light text-center lg:pr-5 rounded-tr-2xl">XP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => {
              return (
                <tr key={user.address} className="even:bg-[#212121]">
                  <td className="flex items-center lg:justify-between gap-2 sm:gap-4 py-5 pl-3 sm:pl-5">
                    <p className="text-xs sm:w-6">{(index + 1) > 9 ? (index + 1) : ('0' + (index + 1))}</p>
                    <div className="flex items-center rounded-[20px] shadow-citizens-btn gap-4 p-1 bg-citizens-dark w-[150px] md:w-fit">
                      {user?.profileImage ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden">
                          <Image
                            src={user.profileImage}
                            width={36}
                            height={36}
                            alt="Profile"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 bg-gray-300 rounded-full" />
                      )}
                      <div className='w-[calc(100%_-_52px)]'>
                        <p className="font-light text-xs lg:text-lg pr-4 truncate">
                          {user.name ? user.name : user.address} {/*  `${user.address.slice(0, 6)}...${user.address.slice(-4)}` */}
                        </p>
                      </div>
                    </div>
                    <div className='grow hidden lg:flex justify-end'>
                      <FollowButton user={user} onFollowUser={(address) => onFollowUser(address)} onUnfollowUser={(address) => onUnfollowUser(address)} />
                    </div>
                  </td>
                  <td className="text-sm sm:text-base text-center">{user.level}</td>
                  <td className="text-sm sm:text-base text-center hidden lg:table-cell">{user.citizensHoldings}</td>
                  <td className="text-sm sm:text-base text-center hidden lg:table-cell">{user.wearablesHoldings}</td>
                  <td className="text-sm sm:text-base text-center lg:pr-5">{user.xp}</td>
                  <td className='lg:hidden'>
                    <div className='w-full flex justify-center'>
                      <FollowButton user={user} onFollowUser={(address) => onFollowUser(address)} onUnfollowUser={(address) => onUnfollowUser(address)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
    </div>
  );
}
