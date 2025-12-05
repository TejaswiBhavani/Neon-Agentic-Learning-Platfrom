import React from 'react';
import { AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { Learner } from '../../types';

interface RecommendationsWidgetProps {
    user: Learner;
}

const RecommendationsWidget: React.FC<RecommendationsWidgetProps> = ({ user }) => {
    const riskScore = user.risk_score || 0;
    const recommendation = user.recommendation;

    const getRiskColor = (score: number) => {
        if (score < 30) return 'text-green-600';
        if (score < 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
            <h3 className="text-lg font-bold mb-4 flex items-center">
                <Lightbulb className="mr-2 text-primary" /> AI Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Score */}
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-gray-100 ${getRiskColor(riskScore)}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Dropout Risk Score</p>
                        <p className={`text-2xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}%</p>
                    </div>
                </div>

                {/* Recommendation */}
                {recommendation && (
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Recommended Action</p>
                            <p className="font-bold text-gray-800">{recommendation.action}</p>
                            <p className="text-xs text-gray-600 mt-1">{recommendation.reason}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationsWidget;
