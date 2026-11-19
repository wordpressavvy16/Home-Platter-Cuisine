import React from 'react';
import { CUSTOMER_BADGES } from '../constants';
import { TrophyIcon } from '../constants';

interface AchievementsPanelProps {
    earnedBadgeIds?: string[];
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ earnedBadgeIds = [] }) => {
    const earnedBadges = CUSTOMER_BADGES.filter(badge => earnedBadgeIds.includes(badge.id));

    if (earnedBadges.length === 0) {
        return (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <TrophyIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 font-semibold">No achievements yet!</p>
                <p className="text-sm text-gray-500 mt-1">Place your first order or write some reviews to earn badges.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedBadges.map(badge => (
                <div key={badge.id} className="p-4 bg-gray-50 rounded-lg border flex items-center gap-4">
                    <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                        <badge.icon className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AchievementsPanel;