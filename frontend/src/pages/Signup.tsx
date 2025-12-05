import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dob: '',
        learning_goal: '',
        preferred_style: 'visual'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.signup(formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign Up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input
                            name="name"
                            type="text"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Date of Birth</label>
                        <input
                            name="dob"
                            type="date"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Learning Goal</label>
                        <input
                            name="learning_goal"
                            type="text"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Preferred Style</label>
                        <select
                            name="preferred_style"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={handleChange}
                        >
                            <option value="visual">Visual</option>
                            <option value="auditory">Auditory</option>
                            <option value="kinesthetic">Kinesthetic</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white p-2 rounded hover:bg-indigo-700 transition"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-primary">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
