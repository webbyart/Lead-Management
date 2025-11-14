import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';

interface LoginViewProps {
    onBack: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onBack }) => {
    const { loginSales } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await loginSales(email, password);
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
         <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <button
                    onClick={onBack}
                    className="text-sm text-primary-dark hover:text-primary font-medium mb-4 block"
                >
                    &larr; กลับสู่หน้าหลัก
                </button>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 font-thai">Sales Login</h2>
                <p className="text-center text-gray-500 mb-8">Access your assigned leads.</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"
                            placeholder="sales1@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"
                            placeholder="1234"
                            required
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 text-center bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-secondary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginView;