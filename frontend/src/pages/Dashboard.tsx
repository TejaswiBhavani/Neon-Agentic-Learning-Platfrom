import React, { useState, useEffect } from 'react';
import StudyPlanDisplay from '../components/StudyPlan/StudyPlanDisplay';
import KnowledgeGraphVisualization from '../components/StudyPlan/KnowledgeGraphVisualization';
import { Settings as SettingsIcon, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import DomainSelector from '../components/Dashboard/DomainSelector';
import RecommendationsWidget from '../components/Dashboard/RecommendationsWidget';

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Fetch guest user
        fetch('http://localhost:5000/api/learners/guest_user')
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(err => console.error("Failed to fetch user", err));
    }, []);

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-transparent animate-fade-in">
            {/* Header */}
            <header className="glass-panel m-4 mb-8 sticky top-4 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        AI Learning System
                    </h1>
                    <div className="flex items-center gap-6">
                        <span className="text-gray-300 font-medium">Welcome, {user.name}</span>
                        <DomainSelector />
                        <Link to="/tutor" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1">
                            <Brain size={18} /> AI Tutor
                        </Link>
                        <Link to="/progress" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Progress</Link>
                        <Link to="/settings" className="text-gray-400 hover:text-white transition-colors">
                            <SettingsIcon size={20} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Study Plan */}
                <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {user && <RecommendationsWidget user={user} />}
                    <div className="premium-card p-6">
                        <StudyPlanDisplay />
                    </div>
                </div>

                {/* Right Column: Graph & Stats */}
                <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="h-[500px]">
                        <KnowledgeGraphVisualization domain={user?.current_domain || 'Programming Basics'} />
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                            Current Progress
                            <div className="h-px flex-1 bg-gray-100 ml-2"></div>
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-500 group-hover:text-indigo-600 transition-colors">Domain</span>
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-lg border border-indigo-100">
                                    {user?.current_domain}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-500 group-hover:text-green-600 transition-colors">Completed</span>
                                <span className="font-bold text-green-600 bg-green-50 px-4 py-1.5 rounded-lg border border-green-100">
                                    {user?.completed_concepts.length} Concepts
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>Overall Completion</span>
                                <span>{Math.min(user?.completed_concepts.length * 5, 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(user?.completed_concepts.length * 5, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
