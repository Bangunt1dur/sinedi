import { Link, useLocation } from 'react-router-dom';
import { Home, List, LogOut, Settings, MessageCircle } from 'lucide-react';
import logoImage from '../assets/logo.png';

export default function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-screen w-64 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <img src={logoImage} alt="Logo" className="h-10 w-auto" />
                <div>
                    <h1 className="font-bold text-xl text-slate-900 leading-none">SINEDI</h1>
                    <p className="text-[8px] text-slate-500 font-bold leading-tight mt-1">Smart Integrated Network for<br />Education & Digital Intelligence</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-yellow-400 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <Home className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link to="/activity" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/activity') ? 'bg-yellow-400 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <List className="w-5 h-5" />
                    Aktivitas
                </Link>

                <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/profile') ? 'bg-yellow-400 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <Settings className="w-5 h-5" />
                    Pengaturan
                </Link>
            </nav>

            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-auto">
                <LogOut className="w-5 h-5" />
                Keluar
            </Link>
        </div>
    );
}
