const USERLIST = Array.from({ length: 20 }, () => ({
  username: ['John Gilbert Jhones', 'Alice Wonderful', 'Bob Sponge', 'Diana Turbay', 'Eve Evelyn Everin'][Math.floor(Math.random() * 5)], // Random username
  level: Math.floor(Math.random() * 100) + 1, // Random level between 1 and 100
  citizens: Math.floor(Math.random() * 10) + 1, // Random citizens between 1 and 1000
  wearables: Math.floor(Math.random() * 100) + 1, // Random wearables between 1 and 10
  xp: Math.floor(Math.random() * 50000) + 1 // Random XP between 1 and 5000
}));

export default function LeaderBoard() {

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
          {USERLIST.map((user, index) => (
            <tr key={index} className="even:bg-[#212121]">
              <td className="flex items-center gap-4 py-5 pl-5">
                <p className="w-6">{(index + 1) > 9 ? (index + 1) : ('0' + (index + 1))}</p>
                <div className="flex items-center rounded-[20px] shadow-citizens-btn gap-4 p-1 bg-citizens-dark">
                  <div className="bg-red rounded-full w-9 h-9" />
                  <p className="font-light text-lg pr-4">{user.username}</p>
                </div>
              </td>
              <td className="text-center">{user.level}</td>
              <td className="text-center">{user.citizens}</td>
              <td className="text-center">{user.wearables}</td>
              <td className="text-center pr-5">{user.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}