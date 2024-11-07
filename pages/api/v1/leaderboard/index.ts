import type { NextApiRequest, NextApiResponse } from 'next';
import { GetLeaderboardData } from '../../../../utils/firebase.util';
import { GetCitizensHoldings, GetWearablesHoldings } from '../../../../utils/web3/contract.util';

export default async function Handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const leaderboardData = await GetLeaderboardData();

      for (const entry of leaderboardData) {
        entry.citizensHoldings = await GetCitizensHoldings(entry.address);
        entry.wearablesHoldings = await GetWearablesHoldings(entry.address);
      }
      
      res.status(200).json(leaderboardData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

