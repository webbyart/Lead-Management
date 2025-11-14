import React, { useState } from 'react';

interface SuperAdminLoginViewProps {
    onBack: () => void;
    onSuccess: () => void;
}

const SuperAdminLoginView: React.FC<SuperAdminLoginViewProps> = ({ onBack, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password === 'admin1234') {
            onSuccess();
        } else {
            setError('Incorrect password.');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <button
                    onClick={onBack}
                    className="text-sm text-primary-dark hover:text-primary font-medium mb-4 block"
                >
                    &larr; กลับสู่หน้าหลัก
                </button>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 font-thai">Super Admin</h2>
                <p className="text-center text-gray-500 mb-8">User Management Panel</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="super-admin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            id="super-admin-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && (
                        <div className="p-3 text-center bg-red-100 text-red-700 rounded-lg text-sm">
                            <p>{error}</p>
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                        >
                            Enter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminLoginView;
