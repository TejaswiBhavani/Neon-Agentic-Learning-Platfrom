import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProgressDashboard from '../components/Progress/ProgressDashboard';

const Progress: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-600 mb-6 hover:text-primary"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </button>

                <h2 className="text-3xl font-bold mb-8 text-gray-800">Your Progress</h2>
                <ProgressDashboard />
            </div>
        </div>
    );
};

export default Progress;
