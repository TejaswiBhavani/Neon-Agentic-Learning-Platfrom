import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectEmotion: (emotion: string, note?: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSelectEmotion }) => {
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const emotions = [
        { emoji: '😫', label: 'Exhausted', id: 'exhausted', color: 'bg-red-500/20 border-red-500/50' },
        { emoji: '🥱', label: 'Tired', id: 'tired', color: 'bg-orange-500/20 border-orange-500/50' },
        { emoji: '🙂', label: 'Good', id: 'good', color: 'bg-yellow-500/20 border-yellow-500/50' },
        { emoji: '😃', label: 'Happy', id: 'happy', color: 'bg-green-500/20 border-green-500/50' },
        { emoji: '🤩', label: 'Enthusiastic', id: 'enthusiastic', color: 'bg-purple-500/20 border-purple-500/50' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-panel p-8 rounded-3xl max-w-md w-full relative transform transition-all scale-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white text-center mb-2">How are you feeling?</h2>
                <p className="text-indigo-200 text-center mb-8">Help us adapt the lesson to your mood.</p>

                <div className="flex justify-between gap-2 mb-8">
                    {emotions.map((emo) => (
                        <button
                            key={emo.id}
                            onClick={() => onSelectEmotion(emo.id, note)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all hover:scale-110 ${emo.color} hover:bg-opacity-40 group`}
                        >
                            <span className="text-3xl filter drop-shadow-lg group-hover:animate-bounce">{emo.emoji}</span>
                            <span className="text-xs font-medium text-gray-300">{emo.label}</span>
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Tell us more (optional)..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
