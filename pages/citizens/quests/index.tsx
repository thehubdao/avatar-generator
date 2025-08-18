import React from 'react';
import CitizensLayout from '../../../layouts/citizens.layout';
import QuestDashboard from '../../../components/citizens/quests/QuestDashboard';

export default function Quests() {
  return (
    <CitizensLayout>
      <div className="w-full min-h-screen p-6">
        <QuestDashboard />
      </div>
    </CitizensLayout>
  );
}
