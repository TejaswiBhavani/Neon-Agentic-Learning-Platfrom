import React, { useState, useEffect } from 'react';

interface MindGameProps {
    onComplete: () => void;
}

const MindGame: React.FC<MindGameProps> = ({ onComplete }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds game
    const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onComplete]);

    const handleClick = () => {
        setScore(score + 1);
        // Move target randomly
        const top = Math.random() * 80 + 10 + '%';
        const left = Math.random() * 80 + 10 + '%';
        setTargetPos({ top, left });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center relative h-96">
                <h2 className="text-2xl font-bold mb-4 text-primary">Mind Booster! 🧠</h2>
                <p className="mb-4 text-gray-600">Click the blue dot as many times as you can!</p>

                <div className="flex justify-between mb-4 font-bold">
                    <span>Score: {score}</span>
                    <span className="text-red-500">Time: {timeLeft}s</span>
                </div>

                <div className="relative w-full h-64 bg-gray-100 rounded border overflow-hidden">
                    <button
                        onClick={handleClick}
                        style={{ top: targetPos.top, left: targetPos.left }}
                        className="absolute w-8 h-8 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 hover:bg-blue-600 transition-all duration-75"
                    />
                </div>
            </div>
        </div>
    );
};

export default MindGame;
