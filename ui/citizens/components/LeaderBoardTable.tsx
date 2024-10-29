import React from 'react';
import { LeaderboardEntry } from '../../../types/leaderboard.type';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Username</th>
          <th>Level</th>
          <th>XP</th>
          <th>Citizens Holdings</th>
          <th>Wearables Holdings</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={entry.id}>
            <td>{index + 1}</td>
            <td>{entry.address}</td>
            <td>{entry.level}</td>
            <td>{entry.xp}</td>
            <td>{entry.citizensHoldings}</td>
            <td>{entry.wearablesHoldings}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

