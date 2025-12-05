import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Learning from './pages/Learning';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import TopicLearning from './pages/TopicLearning';
import Background3D from './components/UI/Background3D';
import ChatWidget from './components/Assistant/ChatWidget';

const App: React.FC = () => {
    return (
        <Router>
            <Background3D />
            <ChatWidget />
            <div className="relative z-10">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/learn/:conceptId" element={<Learning />} />
                    <Route path="/tutor" element={<TopicLearning />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
