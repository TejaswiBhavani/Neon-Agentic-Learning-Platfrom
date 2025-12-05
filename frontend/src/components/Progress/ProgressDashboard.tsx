import React, { useEffect, useState } from 'react';
import { learnerService } from '../../services/api';
import StreakCounter from './StreakCounter';
import BadgesDisplay from './BadgesDisplay';
import { Trophy, Clock, BookOpen } from 'lucide-react';

const ProgressDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [badges, setBadges] = useState<any[]>([]);

    useEffect(() => {
        // Fetch guest user
        fetch('http://localhost:5000/api/learners/guest_user')
            .then(res => res.json())
            .then(userData => {
                return Promise.all([
                    learnerService.getProgress(userData.id),
                    learnerService.getBadges(userData.id)
                ]);
            })
            .then(([statsRes, badgesRes]) => {
                setStats(statsRes.data);
                setBadges(badgesRes.data);
            })
            .catch(err => console.error("Failed to fetch progress data", err));
    }, []);

    if (!stats) return <div>Loading progress...</div>;

    return (
        <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Concepts Completed</p>
                        <p className="text-2xl font-bold">{stats.completed_concepts}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Time Learned</p>
                        <p className="text-2xl font-bold">{stats.total_minutes_learned} mins</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Current Streak</p>
                        <StreakCounter streak={stats.streak_days} />
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                    <Trophy className="text-yellow-500 mr-2" />
                    <h3 className="text-xl font-bold">Your Achievements</h3>
                </div>
                <BadgesDisplay badges={badges} />
            </div>
        </div>
    );
};

export default ProgressDashboard;
