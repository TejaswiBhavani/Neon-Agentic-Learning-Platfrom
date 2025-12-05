import React, { useState, useEffect } from 'react';
import { Brain, Zap, Grid, Palette } from 'lucide-react';

interface MindGameProps {
    gameType?: string;
    onComplete: () => void;
}

const MindGame: React.FC<MindGameProps> = ({ gameType = 'reaction', onComplete }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

    // Reaction Game State
    const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

    // Pattern Game State
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [isShowingSequence, setIsShowingSequence] = useState(false);

    // Memory Game State
    const [cards, setCards] = useState<{ id: number, val: string, flipped: boolean, matched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

    // Color Game State
    const [colorTarget, setColorTarget] = useState({ text: 'RED', color: 'text-red-500' });
    const [colorOptions, setColorOptions] = useState<{ text: string, color: string }[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameState('finished');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Initialize Games
        if (gameType === 'pattern') startPatternRound();
        if (gameType === 'memory') initMemoryGame();
        if (gameType === 'color') nextColorRound();

        return () => clearInterval(timer);
    }, []);

    // --- Reaction Game ---
    const handleReactionClick = () => {
        setScore(score + 10);
        setTargetPos({
            top: Math.random() * 80 + 10 + '%',
            left: Math.random() * 80 + 10 + '%'
        });
    };

    // --- Pattern Game ---
    const startPatternRound = () => {
        const newSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(newSeq);
        setUserSequence([]);
        setIsShowingSequence(true);

        let i = 0;
        const interval = setInterval(() => {
            highlightButton(newSeq[i]);
            i++;
            if (i >= newSeq.length) {
                clearInterval(interval);
                setIsShowingSequence(false);
            }
        }, 800);
    };

    const highlightButton = (index: number) => {
        const btn = document.getElementById(`btn-${index}`);
        if (btn) {
            btn.classList.add('ring-4', 'ring-white');
            setTimeout(() => btn.classList.remove('ring-4', 'ring-white'), 400);
        }
    };

    const handlePatternClick = (index: number) => {
        if (isShowingSequence) return;
        highlightButton(index);
        const newUserSeq = [...userSequence, index];
        setUserSequence(newUserSeq);

        if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
            // Wrong
            setSequence([]);
            setTimeout(startPatternRound, 1000);
        } else if (newUserSeq.length === sequence.length) {
            // Correct round
            setScore(score + 50);
            setTimeout(startPatternRound, 1000);
        }
    };

    // --- Memory Game ---
    const initMemoryGame = () => {
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        const deck = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((val, id) => ({ id, val, flipped: false, matched: false }));
        setCards(deck);
    };

    const handleCardClick = (index: number) => {
        if (flippedIndices.length >= 2 || cards[index].flipped || cards[index].matched) return;

        const newCards = [...cards];
        newCards[index].flipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            const [first, second] = newFlipped;
            if (cards[first].val === cards[second].val) {
                setScore(score + 100);
                newCards[first].matched = true;
                newCards[second].matched = true;
                setCards(newCards);
                setFlippedIndices([]);
                // Check win
                if (newCards.every(c => c.matched)) {
                    setScore(score + 500);
                    setGameState('finished');
                }
            } else {
                setTimeout(() => {
                    newCards[first].flipped = false;
                    newCards[second].flipped = false;
                    setCards([...newCards]);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    // --- Color Game ---
    const nextColorRound = () => {
        const colors = [
            { text: 'RED', color: 'text-red-500' },
            { text: 'BLUE', color: 'text-blue-500' },
            { text: 'GREEN', color: 'text-green-500' },
            { text: 'YELLOW', color: 'text-yellow-500' }
        ];
        const target = colors[Math.floor(Math.random() * colors.length)];
        // Randomize the display color (Stroop effect)
        const displayColor = colors[Math.floor(Math.random() * colors.length)].color;

        setColorTarget({ text: target.text, color: displayColor });
        setColorOptions(colors.sort(() => Math.random() - 0.5));
    };

    const handleColorClick = (selectedColor: string) => {
        // Check if selected color matches the TEXT of the target
        // e.g. Target says "RED" (in blue ink), user must click Red button
        // Simplified: User clicks the button that matches the TEXT meaning
        if (selectedColor.includes(colorTarget.text.toLowerCase())) {
            setScore(score + 20);
        } else {
            setScore(Math.max(0, score - 10));
        }
        nextColorRound();
    };


    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center relative min-h-[500px] flex flex-col">
                {gameState === 'finished' ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <Brain size={64} className="text-indigo-500 animate-bounce" />
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Time's Up!</h2>
                        <p className="text-2xl text-indigo-500 font-bold">Final Score: {score}</p>
                        <button onClick={onComplete} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all">
                            Back to Learning
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-left">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {gameType === 'reaction' && <Zap className="text-yellow-500" />}
                                    {gameType === 'pattern' && <Grid className="text-purple-500" />}
                                    {gameType === 'memory' && <Brain className="text-pink-500" />}
                                    {gameType === 'color' && <Palette className="text-green-500" />}
                                    Mind Booster
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Score: {score}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{timeLeft}s</div>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 p-4">

                            {/* REACTION GAME */}
                            {gameType === 'reaction' && (
                                <button
                                    onClick={handleReactionClick}
                                    style={{ top: targetPos.top, left: targetPos.left }}
                                    className="absolute w-12 h-12 bg-indigo-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-90 transition-transform shadow-lg shadow-indigo-500/50"
                                />
                            )}

                            {/* PATTERN GAME */}
                            {gameType === 'pattern' && (
                                <div className="grid grid-cols-2 gap-4 h-full max-w-sm mx-auto">
                                    {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'].map((color, i) => (
                                        <button
                                            key={i}
                                            id={`btn-${i}`}
                                            onClick={() => handlePatternClick(i)}
                                            className={`${color} rounded-2xl shadow-lg active:opacity-75 transition-all`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* MEMORY GAME */}
                            {gameType === 'memory' && (
                                <div className="grid grid-cols-4 gap-2 h-full">
                                    {cards.map((card, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleCardClick(i)}
                                            className={`rounded-xl text-3xl flex items-center justify-center transition-all duration-300 ${card.flipped || card.matched ? 'bg-white dark:bg-gray-700 rotate-0' : 'bg-indigo-600 rotate-180'
                                                }`}
                                        >
                                            {(card.flipped || card.matched) ? card.val : ''}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* COLOR GAME */}
                            {gameType === 'color' && (
                                <div className="flex flex-col items-center justify-center h-full space-y-8">
                                    <h3 className={`text-6xl font-black ${colorTarget.color}`}>
                                        {colorTarget.text}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                        {colorOptions.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleColorClick(opt.color)}
                                                className={`p-4 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all ${opt.text === 'RED' ? 'bg-red-500' :
                                                        opt.text === 'BLUE' ? 'bg-blue-500' :
                                                            opt.text === 'GREEN' ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}
                                            >
                                                {opt.text}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-gray-500">Click the button matching the TEXT meaning!</p>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MindGame;
