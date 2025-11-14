import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';

interface AdminLoginViewProps {
    onBack: () => void;
}

const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBack }) => {
    const { loginAdmin, sendPasswordReset } = useAuth();
    const [view, setView] = useState<'login' | 'reset'>('login');
    
    // Login state
    const [password, setPassword] = useState('P@59w0rd');
    
    // Reset state
    const [resetEmail, setResetEmail] = useState('admin@admin.com');
    const [message, setMessage] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        const result = await loginAdmin(password);
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };
    
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        const result = await sendPasswordReset(resetEmail);
        if (result.success) {
            setMessage(result.message);
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                 <button onClick={onBack} className="text-sm text-primary-dark hover:text-primary font-medium mb-4 block">
                    &larr; กลับสู่หน้าหลัก
                </button>
                
                {view === 'login' ? (
                    <>
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 font-thai">Admin Login</h2>
                        <p className="text-center text-gray-500 mb-8">Enter the system password.</p>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"
                                    placeholder="admin"
                                    required
                                />
                                 <p className="text-xs text-gray-500 mt-1">Hint: The default admin user is 'admin@admin.com'.</p>
                            </div>
                            {error && <div className="p-3 text-center bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Logging in...' : 'Enter Dashboard'}
                                </button>
                            </div>
                            <div className="text-center">
                                <button type="button" onClick={() => setView('reset')} className="text-sm text-primary-dark hover:underline font-medium">
                                    Forgot Password?
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 font-thai">Reset Password</h2>
                        <p className="text-center text-gray-500 mb-8">Enter your admin email to receive a reset link.</p>
                        <form onSubmit={handlePasswordReset} className="space-y-6">
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                <input
                                    type="email"
                                    id="reset-email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"
                                    required
                                />
                            </div>
                            {error && <div className="p-3 text-center bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                            {message && <div className="p-3 text-center bg-green-100 text-green-700 rounded-lg text-sm">{message}</div>}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                             <div className="text-center">
                                <button type="button" onClick={() => setView('login')} className="text-sm text-primary-dark hover:underline font-medium">
                                    &larr; Back to Login
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminLoginView;
