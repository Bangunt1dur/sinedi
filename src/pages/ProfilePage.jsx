import { useNavigate } from 'react-router-dom';
import { User, CreditCard, ChevronRight, LogOut, Briefcase, Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
    const { user, switchMode, withdrawFunds } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const handlePaymentMethods = () => {
        if (user.role !== 'tutor') return;
        navigate('/wallet-history');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
            <div className="p-6 max-w-lg mx-auto animate-in fade-in">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

                {/* User Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {/* Avatar */}
                        <img
                            src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                        <p className="text-sm text-slate-500">{user.major || 'Jurusan Tidak Diketahui'} - {user.university || 'Universitas'}</p>
                        <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${user.role === 'student' ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>
                                {user.role === 'student' ? 'Student' : 'Tutor Mode'}
                            </span>
                            {user.role === 'tutor' && <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Verified Tutor</span>}
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <div className="p-4 border-b border-slate-100 font-bold text-slate-900">Account Settings</div>

                    <button
                        onClick={() => navigate('/edit-profile')}
                        className="w-full flex justify-between items-center p-4 hover:bg-slate-50 transition-colors border-b border-slate-50"
                    >
                        <div className="flex items-center gap-3 text-slate-600">
                            <User className="w-5 h-5" />
                            <span className="text-sm font-medium">Edit Profile</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Payment Methods - Only for Tutor */}
                    {user.role === 'tutor' && (
                        <button
                            onClick={handlePaymentMethods}
                            className="w-full flex justify-between items-center p-4 hover:bg-slate-50 transition-colors border-b border-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Withdraw Funds</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full text-left p-4 flex items-center gap-3 hover:bg-red-50 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-red-600">Keluar Aplikasi</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
