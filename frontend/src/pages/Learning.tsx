import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interactionService, studyPlanService } from '../services/api';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import MindGame from '../components/Interventions/MindGame';
import VideoPlayer from '../components/Interventions/VideoPlayer';

const Learning: React.FC = () => {
    const { conceptId } = useParams();
    const navigate = useNavigate();
    // Auth removed

    const [problem, setProblem] = useState<any>(null);
    const [answer, setAnswer] = useState('');
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [feedback, setFeedback] = useState<any>(null);
    const [affectiveState, setAffectiveState] = useState('neutral');

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!conceptId) return;
            try {
                const response = await studyPlanService.getQuestion(conceptId);
                setProblem(response.data);
                setStartTime(Date.now());
                setFeedback(null);
                setAnswer('');
                setAffectiveState('neutral');
            } catch (error) {
                console.error("Failed to fetch question", error);
            }
        };
        fetchQuestion();
    }, [conceptId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const isCorrect = answer.trim() === problem.correct_answer;

        try {
            const response = await interactionService.log({
                concept_id: conceptId,
                action: 'submit_answer',
                is_correct: isCorrect,
                response_time_ms: responseTime
            });

            setFeedback({
                isCorrect,
                message: isCorrect ? 'Correct! Great job.' : 'Incorrect. Try again.',
                intervention: response.data.intervention,
                conceptCompleted: response.data.concept_completed
            });

            setAffectiveState(response.data.affective_state);

        } catch (error) {
            console.error("Failed to submit", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-600 mb-6 hover:text-primary"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Practice Problem</h2>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${affectiveState === 'engaged' ? 'bg-green-100 text-green-800' :
                            affectiveState === 'confused' ? 'bg-yellow-100 text-yellow-800' :
                                affectiveState === 'struggling' ? 'bg-orange-100 text-orange-800' :
                                    affectiveState === 'fatigued' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                            State: {affectiveState.charAt(0).toUpperCase() + affectiveState.slice(1)}
                        </div>
                    </div>

                    {problem && (
                        <div className="mb-8">
                            <p className="text-lg mb-4 font-medium">{problem.question}</p>
                            <form onSubmit={handleSubmit}>
                                {problem.type === 'multiple_choice' ? (
                                    <div className="space-y-3">
                                        {problem.options.map((option: string, idx: number) => (
                                            <label key={idx} className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${answer === option ? 'border-primary bg-indigo-50' : 'border-gray-200'}`}>
                                                <input
                                                    type="radio"
                                                    name="answer"
                                                    value={option}
                                                    checked={answer === option}
                                                    onChange={(e) => setAnswer(e.target.value)}
                                                    disabled={!!feedback}
                                                    className="mr-3"
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="Type your answer..."
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        disabled={!!feedback}
                                    />
                                )}

                                {!feedback && (
                                    <button
                                        type="submit"
                                        className="mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto"
                                        disabled={!answer}
                                    >
                                        Submit Answer
                                    </button>
                                )}
                            </form>
                        </div>
                    )}

                    {feedback && (
                        <div className={`p-4 rounded-lg mb-6 ${feedback.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h4 className={`font-bold ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                {feedback.message}
                            </h4>

                            {feedback.intervention && (
                                <div className={`mt-4 p-4 rounded border shadow-sm ${feedback.intervention.type === 'visual_aid' ? 'bg-purple-50 border-purple-200' :
                                    feedback.intervention.type === 'break' ? 'bg-blue-50 border-blue-200' : 'bg-white border-blue-200'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-blue-500 mt-1" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-blue-800 capitalize">{feedback.intervention.type.replace('_', ' ')}</p>
                                            <p className="text-gray-700">{feedback.intervention.message}</p>

                                            {/* Visual Aid Modal (Inline) */}
                                            {feedback.intervention.type === 'visual_aid' && (
                                                <div className="mt-3">
                                                    <img
                                                        src="https://via.placeholder.com/400x300?text=Concept+Visualized"
                                                        alt="Visual Aid"
                                                        className="w-full h-auto rounded border border-gray-300"
                                                    />
                                                    <p className="text-xs text-center text-gray-500 mt-1">Figure 1: Concept Visualization</p>
                                                </div>
                                            )}

                                            {/* Break Action */}
                                            {feedback.intervention.type === 'break' && (
                                                <button
                                                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                                    onClick={() => alert("Take 5 minutes! The timer is paused.")}
                                                >
                                                    Start Break
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Immediate Interventions (Modals) */}
                            {feedback.intervention?.type === 'mind_game' && (
                                <MindGame onComplete={() => setFeedback({ ...feedback, intervention: null })} />
                            )}
                            {feedback.intervention?.type === 'video' && (
                                <VideoPlayer onComplete={() => setFeedback({ ...feedback, intervention: null })} />
                            )}

                            <div className="mt-6 flex gap-4">
                                {feedback.conceptCompleted ? (
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                                    >
                                        Finish Concept
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setFeedback(null);
                                            setAnswer('');
                                            setStartTime(Date.now());
                                        }}
                                        className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900"
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Learning;
