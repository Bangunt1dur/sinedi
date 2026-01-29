import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logoImage from '../assets/logo.png';

export default function RegisterPage() {
    const navigate = useNavigate();
    const context = useApp();
    const { showAlert } = context;

    const [form, setForm] = useState({ name: '', username: '', password: '', role: 'student' });

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!form.name || !form.username || !form.password) {
            showAlert('Mohon lengkapi semua data!', 'Validasi', 'error');
            return;
        }

        const success = await context.register(form.name, form.username, form.password, form.role);

        if (success) {
            showAlert(`Selamat datang, ${form.name}!`, 'Registrasi Berhasil', 'success');
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900 animate-in fade-in">
            <div className="w-full max-w-sm flex flex-col items-center gap-8">

                {/* Logo Section */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <img src={logoImage} alt="SINEDI Logo" className="h-14 w-auto object-contain" />
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Buat Akun Baru</h1>
                    <p className="text-sm text-slate-500">
                        Bergabunglah dengan komunitas belajar terbesar.
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleRegister} className="w-full space-y-5">

                    {/* Role Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, role: 'student' })}
                            className={`py-2 text-sm font-bold rounded-lg transition-all ${form.role === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Mahasiswa
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, role: 'tutor' })}
                            className={`py-2 text-sm font-bold rounded-lg transition-all ${form.role === 'tutor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tutor
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Nama Lengkap</label>
                        <input
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="Username unik"
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 text-base mt-4"
                    >
                        Daftar Sebagai {form.role === 'student' ? 'Mahasiswa' : 'Tutor'}
                    </button>
                </form>

                <p className="text-sm text-slate-500">
                    Sudah punya akun? <span onClick={() => navigate('/')} className="text-yellow-600 font-bold cursor-pointer hover:underline">Login</span>
                </p>
            </div>
        </div>
    );
}
