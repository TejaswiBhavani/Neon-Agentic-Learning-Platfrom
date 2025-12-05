import React from 'react';

interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
}

interface BadgesDisplayProps {
    badges: Badge[];
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ badges }) => {
    if (badges.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                <p>No badges earned yet. Keep learning!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
                <div key={badge.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h4 className="font-bold text-gray-800">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
            ))}
        </div>
    );
};

export default BadgesDisplay;
