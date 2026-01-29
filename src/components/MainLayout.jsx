import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, List, User } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MainLayout() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-yellow-200">

            {/* Desktop Sidebar (Only visible on md and up) */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen relative w-full md:max-w-none pb-24 md:pb-0">
                {/* Content Injected Here */}
                <Outlet />
            </div>

            {/* Mobile Bottom Nav (Visible on small screens) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-yellow-500' : 'text-slate-400'}`}>
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Home</span>
                </Link>
                <Link to="/activity" className={`flex flex-col items-center gap-1 ${isActive('/activity') ? 'text-yellow-500' : 'text-slate-400'}`}>
                    <List className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Aktivitas</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-yellow-500' : 'text-slate-400'}`}>
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Akun</span>
                </Link>
            </nav>
        </div>
    );
}
