import { Link } from 'react-router-dom';
import { Bell, Search, Home, User } from 'lucide-react';
import DashboardGrid from './DashboardGrid';
import logoImage from '../assets/logo.png';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-200">
            <div className="max-w-md mx-auto min-h-screen relative bg-slate-50 shadow-2xl flex flex-col">

                {/* Header */}
                <header className="p-6 pt-8 flex justify-between items-center sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img src={logoImage} alt="SINEDI Logo" className="h-10 w-auto object-contain" />
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">Halo, Mahasiswa!</h1>
                            <p className="text-xs text-slate-500 font-medium">Selamat datang di SINEDI</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm">
                            <Bell className="w-5 h-5 text-slate-700" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-slate-900 shadow-md ring-2 ring-white">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 pb-24 space-y-6 animate-in fade-in duration-500">
                    {/* Search Bar */}
                    <div className="px-6 mt-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-yellow-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari layanan..."
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 shadow-sm transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Hero Card */}
                    <div className="px-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-900/10 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold mb-2 text-white">Butuh bantuan tugas?</h2>
                                <p className="text-slate-300 text-sm mb-6 max-w-[80%] leading-relaxed">
                                    Joki tugas cepat, aman, dan terpercaya.
                                </p>
                                <Link to="/order" className="inline-block bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95">
                                    Pesan Sekarang
                                </Link>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"></div>
                        </div>
                    </div>

                    {/* Menu Grid */}
                    <div>
                        <div className="px-6 flex justify-between items-end mb-4">
                            <h3 className="font-bold text-lg text-slate-900">Layanan Utama</h3>
                            <button className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">Lihat Semua</button>
                        </div>
                        {/* Passing props or relying on context/globalcss? DashboardGrid needs update for white cards */}
                        <DashboardGrid />
                    </div>
                </main>

                {/* Bottom Nav */}
                <nav className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center max-w-md mx-auto z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                    <Link to="/dashboard" className="flex flex-col items-center gap-1 text-yellow-500">
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Home</span>
                    </Link>
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <Search className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Cari</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Akun</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
