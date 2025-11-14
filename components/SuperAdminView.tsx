import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { SalesPerson } from '../types';

const SuperAdminView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { salesRoster, registerSales, updateSalesPerson, deleteSalesPerson, registerAdmin } = useAuth();
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [editingSales, setEditingSales] = useState<SalesPerson | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const openAddModal = () => {
        setEditingSales(null);
        setIsSalesModalOpen(true);
    };

    const openEditModal = (sales: SalesPerson) => {
        setEditingSales(sales);
        setIsSalesModalOpen(true);
    };

    const handleDeleteSales = async (sales: SalesPerson) => {
        if (window.confirm(`Are you sure you want to delete sales user "${sales.name}"? This cannot be undone.`)) {
            const result = await deleteSalesPerson(sales.id);
            setMessage({ type: result.success ? 'success' : 'error', text: result.message });
            setTimeout(() => setMessage(null), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-secondary font-thai">Super Admin Panel</h1>
                    <button onClick={onLogout} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium">
                        Logout
                    </button>
                </header>

                 {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sales Management */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800 font-thai">Manage Sales</h2>
                            <button onClick={openAddModal} className="px-3 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                                Add Sales
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Name</th>
                                        <th scope="col" className="px-4 py-3">Email</th>
                                        <th scope="col" className="px-4 py-3">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesRoster.map(sales => (
                                        <tr key={sales.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{sales.name}</td>
                                            <td className="px-4 py-3">{sales.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sales.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {sales.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => openEditModal(sales)} className="font-medium text-primary-dark hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteSales(sales)} className="font-medium text-red-600 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Admin Management */}
                    <AdminManagementPanel />
                </div>
            </div>

            {isSalesModalOpen && (
                <SalesUserModal
                    isOpen={isSalesModalOpen}
                    onClose={() => setIsSalesModalOpen(false)}
                    salesPerson={editingSales}
                    onSuccess={(msg) => {
                        setMessage({ type: 'success', text: msg });
                        setTimeout(() => setMessage(null), 4000);
                        setIsSalesModalOpen(false);
                    }}
                    onFailure={(msg) => {
                        setMessage({ type: 'error', text: msg });
                        setTimeout(() => setMessage(null), 4000);
                    }}
                />
            )}
        </div>
    );
};


const AdminManagementPanel: React.FC = () => {
    const { registerAdmin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        const result = await registerAdmin(email, password);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setEmail('');
            setPassword('');
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 font-thai mb-4 border-b pb-4">Manage Administrators</h2>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
                <p className="text-sm text-amber-800">
                    <span className="font-bold">Note:</span> For security, existing admins cannot be listed or managed from this client-side interface. You can only add new admins.
                </p>
            </div>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
                 <h3 className="font-semibold text-gray-700 font-thai">Add New Admin</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                </div>
                {message && (
                    <div className={`p-3 rounded-lg text-center text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}
                <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-secondary text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
                    {isLoading ? 'Adding...' : 'Add Admin'}
                </button>
            </form>
        </div>
    );
};


interface SalesUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    salesPerson: SalesPerson | null;
    onSuccess: (message: string) => void;
    onFailure: (message: string) => void;
}

const SalesUserModal: React.FC<SalesUserModalProps> = ({ isOpen, onClose, salesPerson, onSuccess, onFailure }) => {
    const { registerSales, updateSalesPerson } = useAuth();
    const [name, setName] = useState(salesPerson?.name || '');
    const [email, setEmail] = useState(salesPerson?.email || '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        let result;
        if (salesPerson) { // Editing existing user
            result = await updateSalesPerson(salesPerson.id, { name });
        } else { // Adding new user
            result = await registerSales(name, email, password);
        }
        
        if (result.success) {
            onSuccess(result.message);
        } else {
            onFailure(result.message);
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{salesPerson ? 'Edit' : 'Add'} Sales User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!salesPerson} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 disabled:cursor-not-allowed"/>
                    </div>
                    {!salesPerson && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminView;
