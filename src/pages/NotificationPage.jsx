import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, Info } from 'lucide-react';

export default function NotificationPage() {
    const navigate = useNavigate();

    const notifications = [
        { id: 1, title: 'Pembayaran Berhasil', desc: 'Pembayaran untuk "Makalah Sejarah" telah dikonfirmasi.', time: 'Baru saja', type: 'success' },
        { id: 2, title: 'Tutor Menemukanmu!', desc: 'Kak Andi telah mengambil tugasmu. Cek progres sekarang.', time: '5 Menit lalu', type: 'info' },
        { id: 3, title: 'Selamat Datang di SINEDI', desc: 'Akunmu berhasil dibuat. Yuk mulai order!', time: '1 Jam lalu', type: 'info' },
    ];

    return (
        <div className="p-6 space-y-6 animate-in fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
            </button>

            <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>

            <div className="space-y-4">
                {notifications.map(notif => (
                    <div key={notif.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 hover:bg-slate-50 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {notif.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{notif.desc}</p>
                            <span className="text-[10px] text-slate-400 mt-2 block font-medium">{notif.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
