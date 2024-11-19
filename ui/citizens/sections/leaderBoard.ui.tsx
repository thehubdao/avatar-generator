import Image from 'next/image';
import { LeaderboardEntry } from '../../../types/leaderboard.type';
import FollowButton from '../common/followButton.ui';

interface LeaderBoardProps {
  leaderboardData: LeaderboardEntry[];
  onFollowUser: (address: string) => Promise<boolean>;
}

export default function LeaderBoard({ leaderboardData, onFollowUser }: LeaderBoardProps) {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32">
      <table className="relative w-full font-light text-lg shadow-citizens-btn bg-citizens-dark text-white container mx-auto rounded-2xl">
        <thead className="border-b border-white/20 sticky top-28">
          <tr className="h-20">
            <th className="bg-citizens-dark font-light text-center pl-5 rounded-tl-2xl">USERNAME</th>
            <th className="bg-citizens-dark font-light text-center">LEVEL</th>
            <th className="bg-citizens-dark font-light text-center">CITIZENS HOLDINGS</th>
            <th className="bg-citizens-dark font-light text-center">WEARABLE HOLDINGS</th>
            <th className="bg-citizens-dark font-light text-center pr-5 rounded-tr-2xl">XP</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user, index) => {
            return (
              <tr key={user.address} className="even:bg-[#212121]">
                <td className="flex items-center justify-between gap-4 py-5 pl-5">
                  <p className="w-6">{(index + 1) > 9 ? (index + 1) : ('0' + (index + 1))}</p>
                  <div className="flex items-center rounded-[20px] shadow-citizens-btn gap-4 p-1 bg-citizens-dark">
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
                    <p className="font-light text-lg pr-4">
                      {user.name ? user.name : user.address} {/*  `${user.address.slice(0, 6)}...${user.address.slice(-4)}` */}
                    </p>
                  </div>
                  <div className='grow flex justify-end'>
                    {!user.isFollowing &&
                      <FollowButton user={user} onFollowUser={(address) => onFollowUser(address)} />
                    }
                  </div>
                </td>
                <td className="text-center">{user.level}</td>
                <td className="text-center">{user.citizensHoldings}</td>
                <td className="text-center">{user.wearablesHoldings}</td>
                <td className="text-center pr-5">{user.xp}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
