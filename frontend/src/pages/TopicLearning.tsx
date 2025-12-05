import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, BookOpen, Brain, AlertCircle, ChevronRight, RefreshCw, XCircle, ChevronDown, ChevronUp, Zap, Coffee } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import FeedbackModal from '../components/UI/FeedbackModal';
import MindGame from '../components/Interventions/MindGame';
import { studyPlanService } from '../services/api';

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
}

interface QuizResultDetail {
    id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
}

interface QuizEvaluation {
    score: number;
    total: number;
    summary: string;
    next_steps: string;
    results: QuizResultDetail[];
}

const TopicLearning: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [topic, setTopic] = useState(searchParams.get('topic') || '');
    const [topicId, setTopicId] = useState(searchParams.get('id') || '');
    const [stage, setStage] = useState<'input' | 'reading' | 'quiz' | 'feedback'>('input');
    const [loading, setLoading] = useState(false);

    const [content, setContent] = useState('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [nextTopic, setNextTopic] = useState<{ name: string, id: string } | null>(null);

    // Feedback & Intervention State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [intervention, setIntervention] = useState<'none' | 'mind_game' | 'story_mode' | 'challenge'>('none');
    const [storyModeActive, setStoryModeActive] = useState(false);

    // Auto-start if topic is provided via URL
    useEffect(() => {
        if (topic && stage === 'input' && !loading) {
            handleGenerateContent();
        }
    }, [topic]);

    const handleGenerateContent = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/tutor/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            });
            const data = await res.json();
            if (!data.content) {
                setContent("Error: No content received from server.");
            } else {
                setContent(data.content);
            }
            setStage('reading');
        } catch (err) {
            console.error(err);
            setContent("Error generating content. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/tutor/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            setQuiz(data.quiz);
            setCurrentQuestionIndex(0);
            setStage('quiz');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (option: string) => {
        const currentQuestion = quiz[currentQuestionIndex];
        setAnswers({ ...answers, [currentQuestion.id]: option });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmitQuiz();
        }
    };

    const handleSubmitQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/tutor/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, user_answers: answers, quiz_questions: quiz })
            });
            const data = await res.json();
            setEvaluation(data.feedback);

            // Log progress if passed (70%)
            if (data.feedback.score / data.feedback.total >= 0.7) {
                try {
                    await fetch('http://localhost:5000/api/interactions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            concept_id: topicId || topic, // Use ID if available, else name
                            action: 'submit_answer',
                            is_correct: true,
                            details: `Quiz Score: ${data.feedback.score}/${data.feedback.total}`
                        })
                    });

                    // Fetch updated study plan to find next topic
                    const planRes = await studyPlanService.generate();
                    const plan = planRes.data;
                    // Find first unlocked topic that isn't the current one (by ID if possible)
                    const next = plan.find((c: any) => c.status === 'unlocked' && (topicId ? c.id !== topicId : c.name !== topic));

                    if (next) {
                        setNextTopic({ name: next.name, id: next.id });
                    }

                } catch (logErr) {
                    console.error("Failed to log progress or fetch plan", logErr);
                }
            }

            setShowDetails(false);
            setStage('feedback');
            // Trigger feedback modal after a short delay
            setTimeout(() => setShowFeedbackModal(true), 1500);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEmotionSelect = async (emotion: string, note?: string) => {
        setShowFeedbackModal(false);

        // Save feedback to backend
        try {
            await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, emotion, note })
            });
        } catch (err) {
            console.error("Failed to save feedback:", err);
        }

        // Trigger Intervention
        switch (emotion) {
            case 'exhausted': // Red Zone
                setIntervention('mind_game');
                break;
            case 'tired': // Orange Zone
                setIntervention('story_mode');
                setStoryModeActive(true);
                break;
            case 'good': // Yellow Zone
                // Continue normally
                break;
            case 'happy': // Green Zone
                // Positive reinforcement (could be a toast or animation)
                alert("Great job! Keep up the momentum! 🚀");
                break;
            case 'enthusiastic': // Gold Zone
                setIntervention('challenge');
                break;
        }
    };

    return (
        <div className={`min-h-screen p-8 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-700 ${storyModeActive ? 'bg-amber-900/20' : ''}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-12 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/20 shadow-xl">
                            <Brain className="text-indigo-600 dark:text-indigo-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">AI Tutor {storyModeActive && <span className="text-amber-500 dark:text-amber-400 text-lg font-normal ml-2">• Story Mode</span>}</h1>
                            <p className="text-indigo-600 dark:text-indigo-200 font-medium">Master any topic with personalized guidance</p>
                        </div>
                    </div>
                    <a href="/" className="flex items-center gap-2 text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-white transition-colors font-medium px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
                        <ArrowRight className="rotate-180" size={20} /> Back to Dashboard
                    </a>
                </header>

                {/* Stage: Input */}
                {stage === 'input' && (
                    <div className="max-w-2xl mx-auto mt-20 text-center animate-slide-up">
                        <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                            What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-300 dark:to-purple-300">learn today?</span>
                        </h2>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative flex bg-white/50 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-gray-200 dark:border-white/20 shadow-2xl">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Quantum Physics, French Revolution, Photosynthesis..."
                                    className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-xl text-gray-900 dark:text-white placeholder-indigo-400 dark:placeholder-indigo-200/50 font-medium"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateContent()}
                                />
                                <button
                                    onClick={handleGenerateContent}
                                    disabled={!topic || loading}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <RefreshCw className="animate-spin" />
                                    ) : (
                                        <>Start <ArrowRight size={20} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage: Reading */}
                {stage === 'reading' && (
                    <div className="animate-slide-up grid lg:grid-cols-3 gap-8">
                        {/* Content Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className={`bg-white/90 dark:bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/40 ${storyModeActive ? 'font-serif text-lg leading-relaxed' : ''}`}>
                                <div className="prose prose-lg max-w-none prose-headings:text-indigo-900 prose-p:text-gray-800 prose-strong:text-indigo-800">
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Actions */}
                        <div className="space-y-6">
                            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
                                <h3 className="text-2xl font-bold mb-4 relative z-10">Ready to test your knowledge?</h3>
                                <p className="text-indigo-100 mb-8 relative z-10">Take a quick quiz to reinforce what you've just learned.</p>
                                <button
                                    onClick={handleStartQuiz}
                                    disabled={loading}
                                    className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-2 relative z-10"
                                >
                                    {loading ? <RefreshCw className="animate-spin" /> : <>Start Quiz <BookOpen size={20} /></>}
                                </button>
                            </div>

                            <div className="bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-white/20 shadow-xl">
                                <img
                                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(topic)}?width=400&height=300&nologo=true`}
                                    alt={topic}
                                    className="w-full h-48 object-cover rounded-2xl shadow-inner"
                                />
                                <p className="mt-4 text-indigo-600 dark:text-indigo-200 text-sm text-center font-medium">Visualizing: {topic}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage: Quiz (Wizard Style) */}
                {stage === 'quiz' && quiz.length > 0 && (
                    <div className="max-w-3xl mx-auto animate-slide-up">
                        <div className="mb-6 flex justify-between items-center text-indigo-200 font-medium">
                            <span className="text-white">Question {currentQuestionIndex + 1} of {quiz.length}</span>
                            <div className="w-1/3 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="neon-progress-bar"
                                    style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="neon-card min-h-[400px] flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-8 leading-snug">
                                    {quiz[currentQuestionIndex].question}
                                </h3>
                                <div className="space-y-4">
                                    {quiz[currentQuestionIndex].options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleAnswerSelect(opt)}
                                            className={`neon-option-card group ${answers[quiz[currentQuestionIndex].id] === opt ? 'selected' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium text-lg">{opt}</span>
                                                {answers[quiz[currentQuestionIndex].id] === opt && (
                                                    <CheckCircle className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" size={24} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={!answers[quiz[currentQuestionIndex].id] || loading}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] flex items-center gap-2"
                                >
                                    {currentQuestionIndex === quiz.length - 1 ? (
                                        loading ? 'Submitting...' : 'Submit Quiz'
                                    ) : (
                                        <>Next Question <ChevronRight /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage: Feedback (Structured) */}
                {stage === 'feedback' && evaluation && (
                    <div className="animate-slide-up space-y-8 max-w-4xl mx-auto">
                        {/* Summary Card */}
                        <div className="glass-panel p-10 rounded-3xl shadow-2xl border border-white/10 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
                            <div className="inline-flex p-4 bg-white/5 rounded-full mb-6 ring-1 ring-white/10">
                                {evaluation.score >= evaluation.total * 0.8 ? (
                                    <CheckCircle size={48} className="text-green-400" />
                                ) : (
                                    <AlertCircle size={48} className="text-orange-400" />
                                )}
                            </div>

                            <h2 className="text-4xl font-bold text-white mb-2">
                                You scored {evaluation.score} out of {evaluation.total}
                            </h2>
                            <p className="text-xl text-gray-300 mb-8">{evaluation.summary}</p>

                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                                <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                                    <div className="text-3xl font-bold text-green-400">{evaluation.score}</div>
                                    <div className="text-sm text-green-200/70 font-medium">Correct</div>
                                </div>
                                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                    <div className="text-3xl font-bold text-red-400">{evaluation.total - evaluation.score}</div>
                                    <div className="text-sm text-red-200/70 font-medium">Wrong</div>
                                </div>
                            </div>

                            <div className="bg-indigo-500/10 p-6 rounded-2xl text-left mb-8 border border-indigo-500/20">
                                <h3 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                    <ArrowRight size={20} /> Next Steps
                                </h3>
                                <p className="text-indigo-100">{evaluation.next_steps}</p>
                            </div>

                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-indigo-300 font-bold flex items-center justify-center gap-2 mx-auto hover:text-white transition-colors"
                            >
                                {showDetails ? 'Hide Detailed Results' : 'View My Results'}
                                {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>

                        {/* Detailed Results (Expandable) */}
                        {showDetails && (
                            <div className="space-y-6 animate-fade-in">
                                {evaluation.results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`glass-panel p-8 rounded-3xl shadow-lg border-l-8 ${result.is_correct ? 'border-l-green-500' : 'border-l-red-500'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`p-2 rounded-full shrink-0 ${result.is_correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {result.is_correct ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{result.question}</h3>
                                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                                    <div className={`p-4 rounded-xl ${result.is_correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                                                        }`}>
                                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1 text-gray-400">Your Answer</span>
                                                        <span className="font-medium text-gray-200">{result.user_answer}</span>
                                                    </div>
                                                    {!result.is_correct && (
                                                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-green-400/70 block mb-1">Correct Answer</span>
                                                            <span className="font-medium text-green-100">{result.correct_answer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4 text-gray-300 bg-white/5 p-4 rounded-xl text-sm leading-relaxed border border-white/10">
                                                    <span className="font-bold text-white block mb-1">Explanation:</span>
                                                    {result.explanation}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-center gap-4 pt-8">
                            <button
                                onClick={() => {
                                    setStage('input');
                                    setTopic('');
                                    setTopicId('');
                                    setAnswers({});
                                    setQuiz([]);
                                    setCurrentQuestionIndex(0);
                                    setEvaluation(null);
                                    setShowDetails(false);
                                    setIntervention('none');
                                    setStoryModeActive(false);
                                    setNextTopic(null);
                                }}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                Learn Another Topic
                            </button>

                            {nextTopic && (
                                <button
                                    onClick={() => {
                                        setTopic(nextTopic.name);
                                        setTopicId(nextTopic.id);
                                        setStage('input');
                                        setAnswers({});
                                        setQuiz([]);
                                        setCurrentQuestionIndex(0);
                                        setEvaluation(null);
                                        setShowDetails(false);
                                        setIntervention('none');
                                        setStoryModeActive(false);
                                        setNextTopic(null);
                                        // Trigger generation immediately
                                        setTimeout(() => handleGenerateContent(), 100);
                                    }}
                                    className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-500 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
                                >
                                    Next Lesson: {nextTopic.name} <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Modals & Interventions */}
                <FeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    onSelectEmotion={handleEmotionSelect}
                />

                {intervention === 'mind_game' && (
                    <MindGame onComplete={() => setIntervention('none')} />
                )}

                {intervention === 'story_mode' && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
                        <div className="glass-panel p-10 rounded-3xl max-w-lg text-center">
                            <Coffee size={64} className="text-amber-400 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Story Mode Activated</h2>
                            <p className="text-indigo-200 mb-8 text-lg">We've switched to a more relaxed, narrative-driven learning style. Take a deep breath and enjoy the story.</p>
                            <button
                                onClick={() => setIntervention('none')}
                                className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all"
                            >
                                Continue Relaxed
                            </button>
                        </div>
                    </div>
                )}

                {intervention === 'challenge' && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
                        <div className="glass-panel p-10 rounded-3xl max-w-lg text-center border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                            <Zap size={64} className="text-purple-400 mx-auto mb-6 animate-pulse" />
                            <h2 className="text-3xl font-bold text-white mb-4">Challenge Mode Unlocked!</h2>
                            <p className="text-indigo-200 mb-8 text-lg">Your enthusiasm is contagious! We've unlocked a bonus challenge question for your next topic.</p>
                            <button
                                onClick={() => setIntervention('none')}
                                className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-500 transition-all shadow-lg hover:shadow-purple-500/50"
                            >
                                Accept Challenge
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicLearning;
