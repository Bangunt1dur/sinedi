import { BookOpen, Video, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const menuItems = [
    { title: 'Pembuatan Tugas', icon: BookOpen, color: 'bg-yellow-400', iconColor: 'text-slate-900', path: '/order' },
    { title: 'Beli Video', icon: Video, color: 'bg-purple-100', iconColor: 'text-purple-600', path: '/video' },
    { title: 'Mentoring', icon: Users, color: 'bg-emerald-100', iconColor: 'text-emerald-600', path: '/mentoring' },
];

export default function DashboardGrid() {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 gap-4 px-6">
            {menuItems.map((item, index) => {
                // Use Link for navigation if path is defined and not hash
                const isInternalLink = item.path && item.path !== '#';
                const CardContent = (
                    <div className="flex flex-col items-center justify-center p-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 rounded-2xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all active:scale-95 group h-full">
                        <div className={`p-4 rounded-full ${item.color} mb-3 shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                        </div>
                        <span className="text-slate-700 font-bold text-sm tracking-wide group-hover:text-slate-900">{item.title}</span>
                    </div>
                );

                return isInternalLink ? (
                    <Link key={index} to={item.path} className="block h-full">
                        {CardContent}
                    </Link>
                ) : (
                    <button key={index} className="block h-full w-full" onClick={() => { }}>
                        {CardContent}
                    </button>
                );
            })}
        </div>
    );
}
