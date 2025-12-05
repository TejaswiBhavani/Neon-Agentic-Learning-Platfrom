import React from 'react';

interface VideoPlayerProps {
    onComplete: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ onComplete }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl text-center">
                <h2 className="text-2xl font-bold mb-4 text-primary">Relax & Refocus 🌿</h2>
                <p className="mb-4 text-gray-600">Take a moment to breathe. Watch this short video.</p>

                <div className="aspect-w-16 aspect-h-9 mb-6">
                    <iframe
                        width="100%"
                        height="315"
                        src="https://www.youtube.com/embed/inpok4MKVLM" // Calming nature video
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                    ></iframe>
                </div>

                <button
                    onClick={onComplete}
                    className="bg-primary text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
                >
                    I'm Ready to Continue
                </button>
            </div>
        </div>
    );
};

export default VideoPlayer;
