import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logoImage from '../assets/logo.png';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useApp();

    const [form, setForm] = useState({ username: '', password: '' });
    const [selectedRole, setSelectedRole] = useState('student');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!form.username || !form.password) {
            setError('Username dan password harus diisi!');
            return;
        }

        // Login with selected role
        login(form.username, selectedRole);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900">
            <div className="w-full max-w-sm flex flex-col items-center gap-8">

                {/* Logo Section */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <img src={logoImage} alt="SINEDI Logo" className="h-16 w-auto object-contain" />
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">SINEDI</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-[200px] leading-tight">
                        Smart Integrated Network for Education & Digital Intelligence
                    </p>
                </div>

                {/* Role Selector */}
                <div className="w-full bg-slate-100 p-1 rounded-xl flex">
                    <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selectedRole === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Mahasiswa
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('tutor')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selectedRole === 'tutor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Tutor
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleLogin} className="w-full space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl text-center border border-red-100 animate-in fade-in">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Username</label>
                            <input
                                type="text"
                                placeholder="Masukkan username"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-full shadow-lg shadow-yellow-400/20 transition-all active:scale-95 text-lg"
                    >
                        Login as {selectedRole === 'student' ? 'Student' : 'Tutor'}
                    </button>
                </form>

                <p className="text-sm text-slate-500">
                    Belum punya akun? <span onClick={() => navigate('/register')} className="text-yellow-600 font-bold cursor-pointer hover:underline">Daftar</span>
                </p>
            </div>
        </div>
    );
}
