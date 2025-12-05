import React from 'react';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
    streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
    return (
        <div className="flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full shadow-sm">
            <Flame size={20} className="mr-2 fill-current" />
            <span className="font-bold">{streak} Day Streak</span>
        </div>
    );
};

export default StreakCounter;
