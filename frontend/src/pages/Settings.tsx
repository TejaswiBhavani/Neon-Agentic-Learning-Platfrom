import React, { useState, useEffect } from 'react';
import { learnerService } from '../services/api';
import { Save, User, ArrowLeft, Shield, Zap, Bell, Moon, Sun, Monitor, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        learning_goal: '',
        skill_level: 'Intermediate',
        theme: 'dark',
        notifications: true
    });
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch guest user
        fetch('http://localhost:5000/api/learners/guest_user')
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    learning_goal: data.learning_goal || '',
                    skill_level: data.skill_level || 'Intermediate',
                    theme: data.theme || 'dark',
                    notifications: data.notifications !== false
                });
                // Sync theme
                if (data.theme) setTheme(data.theme);
            })
            .catch(err => console.error("Failed to fetch user", err));
    }, [setTheme]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const res = await learnerService.updateSettings(user.id, formData);
            setMessage({ text: 'Settings updated successfully!', type: 'success' });
            setUser(res.data.user);

            // Update global theme
            setTheme(formData.theme as 'dark' | 'light');

            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Failed to update settings", error);
            setMessage({ text: 'Failed to update settings.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 font-sans text-gray-200">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-12 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                            <User className="text-indigo-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                            <p className="text-indigo-200 font-medium">Manage your profile and preferences</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white/10"
                    >
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                </header>

                {message && (
                    <div className={`p-4 mb-8 rounded-xl border animate-slide-up ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        <div className="flex items-center gap-2 font-medium">
                            {message.type === 'success' ? <Shield size={18} /> : <Zap size={18} />}
                            {message.text}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8 animate-slide-up">
                    {/* Left Column: Navigation/Sidebar (Visual only for now) */}
                    <div className="space-y-4">
                        <div className="glass-panel p-6 rounded-2xl border border-white/10">
                            <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
                            <nav className="space-y-2">
                                <button type="button" className="w-full text-left px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30">
                                    General
                                </button>
                                <button type="button" className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
                                    Security
                                </button>
                                <button type="button" className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
                                    Billing
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <User size={20} className="text-indigo-400" /> Profile Information
                            </h2>

                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Learning Preferences */}
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Zap size={20} className="text-purple-400" /> Learning Preferences
                            </h2>

                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-2">Skill Level</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, skill_level: level })}
                                                className={`py-3 px-4 rounded-xl border font-medium transition-all ${formData.skill_level === level
                                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                    : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-2">Learning Goal</label>
                                    <textarea
                                        value={formData.learning_goal}
                                        onChange={(e) => setFormData({ ...formData, learning_goal: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all h-24 resize-none"
                                        placeholder="What do you want to achieve?"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* App Preferences */}
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500"></div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Monitor size={20} className="text-pink-400" /> App Preferences
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Notifications</div>
                                            <div className="text-sm text-gray-400">Receive updates about your progress</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifications}
                                            onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                            <Moon size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Theme</div>
                                            <div className="text-sm text-gray-400">Select your interface appearance</div>
                                        </div>
                                    </div>
                                    <div className="flex bg-black/40 rounded-lg p-1">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, theme: 'dark' })}
                                            className={`p-1.5 rounded-md transition-all ${formData.theme === 'dark' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            <Moon size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, theme: 'light' })}
                                            className={`p-1.5 rounded-md transition-all ${formData.theme === 'light' ? 'bg-gray-200 text-gray-900 shadow' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            <Sun size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <RefreshCw className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
