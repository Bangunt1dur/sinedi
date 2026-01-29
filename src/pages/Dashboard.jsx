import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, Video, Users, Clock, CheckCircle, AlertCircle, Star, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext'; // Import AppContext
import logoImage from '../assets/logo.png';
import NotificationModal from '../components/NotificationModal';

export default function Dashboard() {
    // 1. Safe Context Usage
    const context = useApp();
    const navigate = useNavigate();

    // Dropdown State
    const [showNotif, setShowNotif] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Job Filter State
    const [jobFilter, setJobFilter] = useState('Semua');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);

    const promoSlides = [
        {
            id: 1,
            title: "Ingin dapat penghasilan tambahan?",
            desc: "Bergabunglah menjadi Tutor di SINEDI dan bantu teman-temanmu belajar.",
            btnText: "FITUR BARU",
            color: "bg-slate-900",
            imgClass: "bg-white/10",
            action: () => navigate('/profile')
        },
        {
            id: 2,
            title: "Diskon Spesial 50%",
            desc: "Khusus pembelian video pembelajaran pertamamu hari ini!",
            btnText: "BELI SEKARANG",
            color: "bg-indigo-600",
            imgClass: "bg-yellow-400/20",
            action: () => navigate('/video')
        },
        {
            id: 3,
            title: "Ajak Teman, Dapat Cuan",
            desc: "Dapatkan komisi 20% setiap temanmu melakukan order pertamanya.",
            btnText: "SHARE KODE",
            color: "bg-emerald-600",
            imgClass: "bg-black/10",
            // Fix: Wrap setNotification in a function that's safe to call here?
            // Actually, promoSlides is a constant definition. Calling setNotification inside it is tricky if we don't have access to it.
            // But promoSlides is defined INSIDE the component, so it has access to state!
            // Wait, previous replace showed promoSlides inside component.
            action: () => setNotification({ show: true, type: 'success', message: 'Kode Referral Anda: SINEDI-USER-123' })
        }
    ];

    // Carousel Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, []); // Empty dependency array as promoSlides length is constant

    // 2. Error Handling: Loading State
    if (!context || !context.user) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">Memuat data pengguna...</p>
                </div>
            </div>
        );
    }

    const { user, orders, takeJob, notifications, markAllRead, createOrder, updateOrder } = context;

    // --- LOGIC: DATA PREPARATION ---

    // Tutor: Queue Orders (Available Jobs)
    const queueOrders = orders ? orders.filter(o => {
        if (o.status !== 'Queue') return false;
        // Joki: Open for all (Default if type is missing)
        if (o.type === 'joki' || !o.type) return true;
        // Mentoring: Only for specific tutor
        if (o.type === 'mentoring') return o.tutorName === user.name;
        return false;
    }) : [];

    // Filter Logic
    const filteredQueueOrders = queueOrders.filter(order => {
        if (jobFilter === 'Semua') return true;
        if (jobFilter === 'Hari Ini') return order.deadline === 'Hari ini';
        if (jobFilter === 'Besok') return order.deadline === 'Besok';
        if (jobFilter === 'Minggu Ini') return ['Hari ini', 'Besok', 'Lusa', 'Minggu ini'].includes(order.deadline);
        return true;
    });

    // Student: Stats
    const completedTasks = orders ? orders.filter(o => o.status === 'Done').length : 0;
    const inProgressTasks = orders ? orders.filter(o => ['In Progress', 'Queue'].includes(o.status)).length : 0;

    // Tutor: Today's Schedule (Safe Check)
    const todaySchedule = orders ? orders.filter(o => o.status === 'In Progress' && o.tutorName === user.name) : [];

    // Tutor: Attention Needed logic
    const attentionTasks = orders ? orders.filter(o => {
        if (o.status !== 'In Progress' || o.tutorName !== user.name) return false;
        const isUrgent = ['Hari ini', 'Besok'].includes(o.deadline);
        const isMentoringToday = o.type === 'mentoring' && o.deadline === 'Hari ini';
        return isUrgent || isMentoringToday;
    }) : [];


    // --- FEATURE: MAGIC BUTTON (Safe Simulation) ---
    const handleMagicSimulation = (e) => {
        e.stopPropagation();
        // Simulate a new order coming in (for Tutor) or Task update (for Student)
        const titles = ['Tugas Kalkulus Lanjut', 'Review Jurnal Ilmiah', 'Coding ReactJS Dasar', 'Mentoring Bahasa Inggris'];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];

        createOrder({
            title: randomTitle,
            type: 'joki',
            deadline: 'Besok',
            price: 150000,
            desc: 'Simulasi order baru dari Magic Button',
            difficulty: 'medium'
        });

        setNotification({ show: true, type: 'success', message: '✨ Magic Button: Simulasi Order Baru Berhasil Dibuat!' });
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in pb-32" onClick={() => setShowNotif(false)}>

            {/* --- HEADER --- */}
            <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="md:hidden">
                        <img src={logoImage} alt="Logo" className="h-8 w-auto" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {user.role === 'tutor' ? 'Tutor Dashboard' : 'Student Dashboard'}
                        </h1>
                        <p className="text-sm text-slate-500">Welcome back, <span className="font-bold text-slate-900">{user.name}</span></p>
                    </div>
                </div>

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowNotif(!showNotif); }}
                        className="relative w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                        <Bell className="w-5 h-5 text-slate-700" />
                        {notifications && notifications.some(n => !n.isRead) && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotif && (
                        <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-50">
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-900">Notifikasi</h3>
                                <button onClick={markAllRead} className="text-xs text-yellow-600 font-bold hover:underline">Mark all read</button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications && notifications.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-xs">Tidak ada notifikasi</div>
                                ) : notifications.map(n => (
                                    <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 border-b border-slate-50 last:border-0 ${!n.isRead ? 'bg-yellow-50/50' : ''}`}>
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{n.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* --- BODY CONTENT --- */}
            {user.role === 'student' ? (
                // ================= STUDENT VIEW =================
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => navigate('/activity', { state: { filter: 'Selesai' } })}
                            className="bg-green-50 p-6 rounded-3xl flex flex-col justify-center items-center text-center gap-2 border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
                        >
                            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-700 mb-2">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">{completedTasks}</h2>
                            <p className="text-sm text-slate-500">Tugas Selesai</p>
                        </div>
                        <div
                            onClick={() => navigate('/activity', { state: { filter: 'Proses' } })}
                            className="bg-blue-50 p-6 rounded-3xl flex flex-col justify-center items-center text-center gap-2 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 mb-2">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">{inProgressTasks}</h2>
                            <p className="text-sm text-slate-500">Dalam Proses</p>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Mau nugas apa hari ini?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => navigate('/order')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-yellow-400 transition-all text-left group">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900">Jasa Tugas</h4>
                                <p className="text-xs text-slate-500 mt-1">Joki tugas kilat & aman</p>
                            </button>
                            <button onClick={() => navigate('/video')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-red-400 transition-all text-left group">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                                    <Video className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900">Beli Video</h4>
                                <p className="text-xs text-slate-500 mt-1">Materi kuliah lengkap</p>
                            </button>
                            <button onClick={() => navigate('/mentoring')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-400 transition-all text-left group">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900">Mentoring</h4>
                                <p className="text-xs text-slate-500 mt-1">Belajar bareng ahlinya</p>
                            </button>
                        </div>
                    </div>

                    {/* Tutor Promo Banner (Carousel) */}
                    <div className="relative overflow-hidden rounded-3xl group h-80 sm:h-72 bg-slate-100">
                        <div
                            className={`transition-all duration-700 ease-in-out px-8 py-10 text-white relative h-full flex items-center ${promoSlides[currentSlide]?.color || 'bg-slate-900'}`}
                        >
                            <div className="relative z-10 max-w-lg space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 key={currentSlide}">
                                <h3 className="text-3xl font-bold leading-tight">{promoSlides[currentSlide]?.title}</h3>
                                <p className="text-white/80 text-sm mb-4">{promoSlides[currentSlide]?.desc}</p>
                                <button
                                    onClick={promoSlides[currentSlide]?.action}
                                    className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-yellow-300 transition-colors mt-4 relative z-30"
                                >
                                    {promoSlides[currentSlide]?.btnText}
                                </button>
                            </div>

                            {/* Decorative Background */}
                            <div className={`absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-3xl transform ${promoSlides[currentSlide]?.imgClass}`}></div>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-5 left-8 flex justify-start gap-2 z-20">
                            {promoSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-yellow-400 w-8' : 'bg-white/30 hover:bg-white/50 w-2'}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                    {/* Notification Modal */}
                    <NotificationModal
                        show={notification.show}
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification({ ...notification, show: false })}
                    />
                </div >
            ) : (
                // ================= TUTOR VIEW =================
                <div className="space-y-6">
                    <div className="mb-2">
                        <h2 className="text-slate-500 text-sm">Manage your jobs and earnings</h2>
                    </div>

                    {/* Attention Widget */}
                    {attentionTasks.length > 0 && (
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl animate-in slide-in-from-top-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-orange-800 font-bold">
                                <AlertCircle className="w-5 h-5" />
                                <span>{attentionTasks.length} Tugas Perlu Perhatian</span>
                            </div>
                            <button
                                onClick={() => navigate('/schedule')}
                                className="text-xs bg-white px-3 py-1.5 rounded-lg border border-orange-200 font-bold text-orange-700 hover:bg-orange-100"
                            >
                                Atur Jadwal & Harga
                            </button>
                        </div>
                    )}

                    {/* Quick Access Menu (If no attention needed, show this instead or always) */}
                    {attentionTasks.length === 0 && (
                        <div className="flex justify-center">
                            <button onClick={() => navigate('/schedule')} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                                <Calendar className="w-4 h-4" /> Atur Jadwal & Harga
                            </button>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Earnings */}
                        <div
                            onClick={() => navigate('/wallet-history')}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-green-200 hover:bg-green-50 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold">$</div>
                                <span className="text-sm font-medium text-slate-400">Total Earnings</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Rp {user.wallet?.toLocaleString() || 0}</h2>
                            <p className="text-xs text-green-600 font-bold mt-1">+15% dari bulan lalu</p>
                        </div>

                        {/* Rating */}
                        <div
                            onClick={() => navigate('/reviews')}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-yellow-200 hover:bg-yellow-50 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600"><Star className="w-4 h-4" fill="currentColor" /></div>
                                <span className="text-sm font-medium text-slate-400">Tutor Rating</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">4.9 <span className="text-sm text-slate-400 font-normal">/ 5.0</span></h2>
                            <p className="text-xs text-slate-400 mt-1">Berdasarkan 24 review</p>
                        </div>

                        {/* Active Jobs */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><FileText className="w-4 h-4" /></div>
                                <span className="text-sm font-medium text-slate-400">Active Jobs</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">{todaySchedule.length} Tasks</h2>
                            <p className="text-xs text-blue-600 font-bold mt-1">{todaySchedule.filter(t => t.deadline === 'Hari ini').length} Deadline Hari Ini</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Available Jobs */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center relative">
                                <h3 className="font-bold text-lg text-slate-900">Rekomendasi Pekerjaan</h3>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        className="text-slate-400 text-xs font-bold hover:text-slate-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm transition-all"
                                    >
                                        Filter: <span className="text-slate-900">{jobFilter}</span> <span className="text-[10px]">▼</span>
                                    </button>

                                    {showFilterDropdown && (
                                        <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right">
                                            {['Semua', 'Hari Ini', 'Besok', 'Minggu Ini'].map(filter => (
                                                <button
                                                    key={filter}
                                                    onClick={() => { setJobFilter(filter); setShowFilterDropdown(false); }}
                                                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${jobFilter === filter ? 'text-yellow-600 bg-yellow-50' : 'text-slate-600'}`}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {filteredQueueOrders.length === 0 ? (
                                <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 text-sm">
                                    <p className="font-bold text-slate-900 mb-1">Tidak ada pekerjaan ditemukan</p>
                                    <p>Coba ubah filter atau cek lagi nanti.</p>
                                </div>
                            ) : (
                                filteredQueueOrders.map(order => {
                                    const isUrgent = ['Hari ini', 'Besok'].includes(order.deadline);
                                    const isExpanded = expandedOrderId === order.id;
                                    const isMentoring = order.type === 'mentoring';

                                    return (
                                        <div key={order.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all group ${isMentoring ? 'border-l-4 border-l-purple-500' : 'border-slate-100 hover:border-yellow-400'}`}>
                                            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isMentoring ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-400 group-hover:bg-yellow-50 group-hover:text-yellow-600'}`}>
                                                        {isMentoring ? <Users className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg">
                                                            {isMentoring ? 'Permintaan Mentoring' : order.title}
                                                        </h4>
                                                        {isMentoring ? (
                                                            <div className="space-y-1 mt-1">
                                                                <p className="text-sm font-bold text-slate-700">Topik: {order.title}</p>
                                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    Jadwal: <span className="font-bold text-slate-700">{order.details || order.deadline}</span>
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{order.desc || 'Deskripsi pekerjaan...'}</p>
                                                                <div className="flex gap-2 mt-3">
                                                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">Fisika</span>
                                                                    {isUrgent && (
                                                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold">Urgent</span>
                                                                    )}
                                                                    {!isUrgent && (
                                                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">{order.deadline}</span>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                                                    {!isMentoring && (
                                                        <span className="font-bold text-slate-900 text-lg">Rp {order.price?.toLocaleString()}</span>
                                                    )}

                                                    <div className="flex gap-2 w-full">
                                                        {isMentoring ? (
                                                            // Mentoring Actions
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        updateOrder(order.id, { status: 'Cancelled' });
                                                                        setNotification({ show: true, type: 'success', message: 'Permintaan ditolak.' });
                                                                    }}
                                                                    className="flex-1 sm:flex-none border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
                                                                >
                                                                    Tolak
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        updateOrder(order.id, { status: 'In Progress' });
                                                                        navigate(`/chat/${order.id}`);
                                                                    }}
                                                                    className="flex-1 sm:flex-none bg-green-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-green-600 hover:shadow-lg transition-all"
                                                                >
                                                                    Terima Permintaan
                                                                </button>
                                                            </>
                                                        ) : (
                                                            // Joki Actions
                                                            <>
                                                                <button
                                                                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                                    className={`flex-1 sm:flex-none border px-4 py-2 rounded-xl text-xs font-bold transition-all ${isExpanded ? 'bg-slate-100 border-slate-200 text-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                                >
                                                                    {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                                                                </button>
                                                                <button
                                                                    onClick={() => { takeJob(order.id); navigate('/activity'); }}
                                                                    className="flex-1 sm:flex-none bg-yellow-400 text-slate-900 px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-yellow-500 hover:shadow-lg transition-all"
                                                                >
                                                                    Ambil
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DROPDOWN DETAILS (Only for Joki for now, or unified?) */}
                                            {!isMentoring && isExpanded && (
                                                <div className="bg-slate-50 border-t border-slate-100 p-6 animate-in slide-in-from-top-2">
                                                    <h5 className="font-bold text-slate-900 text-sm mb-3">Detail Lengkap</h5>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <p className="text-slate-500 mb-1">Deskripsi Tugas</p>
                                                            <p className="font-medium text-slate-800 leading-relaxed">
                                                                {order.desc || 'Tidak ada deskripsi detail.'}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-slate-500 mb-1">Tenggat Waktu</p>
                                                                <p className="font-bold text-slate-800">{order.deadline}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-500 mb-1">Estimasi Pengerjaan</p>
                                                                <p className="font-bold text-slate-800">2-3 Hari</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                                                        <button
                                                            onClick={() => { takeJob(order.id); navigate('/activity'); }}
                                                            className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800"
                                                        >
                                                            Ambil Tugas Ini Sekarang
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* RIGHT: Schedule & Utils */}
                        <div className="space-y-6">
                            {/* Jadwal Mentoring Widget */}
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-4">Jadwal Mentoring</h3>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <span className="font-bold text-slate-700 text-sm">Hari Ini</span>
                                        <span className="text-xs text-slate-400">29 Jan 2026</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {todaySchedule.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-xs">
                                                Belum ada jadwal hari ini.
                                            </div>
                                        ) : (
                                            todaySchedule.map(schedule => (
                                                <div key={schedule.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-slate-900 text-sm">{schedule.title}</h4>
                                                        <span className="text-blue-600 font-bold text-xs">
                                                            {/* Mock time or use real property if available */}
                                                            {schedule.time || '10:00'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400">Student: {schedule.studentName || 'Mahasiswa'}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate('/activity', { state: { filter: 'Proses' } })}
                                        className="w-full p-3 text-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors border-t border-slate-100"
                                    >
                                        Lihat Semua Jadwal
                                    </button>
                                </div>
                            </div>

                            {/* Upload Video Widget */}
                            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-1">Upload Materi Video</h3>
                                    <p className="text-slate-400 text-xs mb-6 max-w-[200px]">Dapatkan passive income dengan menjual video pembelajaran.</p>
                                    <button
                                        onClick={() => navigate('/video')}
                                        className="w-full bg-yellow-400 text-slate-900 py-3 rounded-xl text-sm font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                                    >
                                        Upload Video
                                    </button>
                                </div>
                                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            <button
                onClick={handleMagicSimulation}
                className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-2xl z-50 transition-transform active:scale-90 border-2 border-white/20"
                title="Magic Button: Simulasi Order Baru"
            >
                <Star className="w-5 h-5 fill-white" />
            </button>

        </div >
    );
}
