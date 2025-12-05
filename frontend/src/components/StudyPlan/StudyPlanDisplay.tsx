import React, { useEffect, useState } from 'react';
import { studyPlanService } from '../../services/api';
import { Concept } from '../../types';
import { CheckCircle, Lock, PlayCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudyPlanDisplay: React.FC = () => {
    const [plan, setPlan] = useState<Concept[]>([]);
    const navigate = useNavigate();

    const fetchPlan = async () => {
        try {
            console.log("Fetching study plan...");
            const response = await studyPlanService.generate();
            console.log("Study plan received:", response.data);
            setPlan(response.data);
        } catch (error) {
            console.error("Failed to fetch study plan", error);
        }
    };

    useEffect(() => {
        fetchPlan();

        const onFocus = () => {
            console.log("Window focused, refreshing plan...");
            fetchPlan();
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-500">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Personalized Study Plan</h3>
                <button onClick={fetchPlan} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors" title="Refresh Plan">
                    <RefreshCw size={20} />
                </button>
            </div>
            <div className="space-y-4">
                {plan.map((concept, index) => (
                    <div
                        key={concept.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${concept.status === 'unlocked' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 dark:text-gray-400 font-mono">#{index + 1}</span>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{concept.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{concept.time_estimate} mins • {concept.level}</p>
                            </div>
                        </div>

                        <div>
                            {concept.status === 'completed' && <CheckCircle className="text-green-500" />}
                            {concept.status === 'locked' && <Lock className="text-gray-400 dark:text-gray-600" />}
                            {concept.status === 'unlocked' && (
                                <button
                                    onClick={() => navigate(`/tutor?topic=${encodeURIComponent(concept.name)}&id=${concept.id}`)}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition shadow-lg hover:shadow-indigo-500/30"
                                >
                                    <PlayCircle size={18} /> Start
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudyPlanDisplay;
