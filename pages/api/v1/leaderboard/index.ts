import type { NextApiRequest, NextApiResponse } from 'next';
import { GetDropsContractAddresses, GetLeaderboardData } from '../../../../utils/firebase.util';
import { GetCitizensHoldings, GetWearablesHoldings } from '../../../../utils/web3/contract.util';

export default async function Handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {

      const [leaderboardData, contractAddresses] = await Promise.all([
        GetLeaderboardData(),
        GetDropsContractAddresses()
      ]);

      const updatedLeaderboardData = await Promise.all(
        leaderboardData
          .filter(entry => entry.address.toLowerCase().startsWith('0x'))
          .map(async (entry) => ({
            ...entry,
            citizensHoldings: await GetCitizensHoldings(entry.address),
            wearablesHoldings: await GetWearablesHoldings(entry.address, contractAddresses)
          }))
      );

      res.status(200).json(updatedLeaderboardData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

