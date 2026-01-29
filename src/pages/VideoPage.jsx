import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Lock, CheckCircle, Search, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationModal from '../components/NotificationModal';

export default function VideoPage() {
    const { user, createOrder, videos, addVideo } = useApp();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });

    // Tutor Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        category: 'Sains',
        price: '',
        url: 'https://youtube.com/mock'
    });

    const categories = ['Semua', 'Sains', 'Bahasa', 'Programming', 'Ekonomi', 'Desain'];

    // Mock Data for "Wow" Effect matching the image
    const demoVideos = [
        {
            id: 101,
            title: 'Kalkulus Dasar: Limit & Turunan',
            duration: '45 Min',
            price: 25000,
            category: 'Sains',
            color: 'bg-stone-300', // Brownish/Paper
            tutorName: 'Pak Budi'
        },
        {
            id: 102,
            title: 'Algoritma Pemrograman Python',
            duration: '1 Jam 20 Min',
            price: 35000,
            category: 'Programming',
            color: 'bg-slate-800', // Dark Code
            tutorName: 'Kak Rizky'
        },
        {
            id: 103,
            title: 'Tips Menulis Skripsi Cepat',
            duration: '30 Min',
            price: 15000,
            category: 'Bahasa',
            color: 'bg-emerald-100', // Greenish/Abstract
            tutorName: 'Bu Siti'
        },
        {
            id: 104,
            title: 'Belajar Figma untuk Pemula',
            duration: '50 Min',
            price: 40000,
            category: 'Desain',
            color: 'bg-green-200', // Abstract
            tutorName: 'Kak Desi'
        }
    ];

    // Merge demo videos with context videos for student view
    // (In a real app, this would all come from the backend/context)
    const displayVideos = [...demoVideos, ...videos.filter(v => !demoVideos.find(d => d.title === v.title))];

    const filteredVideos = selectedCategory === 'Semua'
        ? displayVideos
        : displayVideos.filter(v => v.category === selectedCategory);

    const handleBuy = (video) => {
        const orderId = createOrder({
            title: `Video: ${video.title}`,
            deadline: '-',
            difficulty: 'video',
            price: video.price,
            type: 'video', // Explicit type
            details: `Kategori: ${video.category}`,
            tutorName: video.tutorName || 'Unknown Tutor',
            videoUrl: video.url || 'https://youtube.com'
        });
        navigate(`/payment/${orderId}`);
    };

    // Format Price helper
    const formatPrice = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Parse Price helper
    const parsePrice = (value) => {
        return parseInt(value.replace(/\./g, '')) || 0;
    };

    const handleUpload = (e) => {
        e.preventDefault();
        const priceValue = typeof uploadForm.price === 'string' ? parsePrice(uploadForm.price) : uploadForm.price;

        if (!uploadForm.title || !priceValue) {
            setNotification({ show: true, type: 'error', message: 'Mohon lengkapi judul dan harga video!' });
            return;
        }

        addVideo({
            title: uploadForm.title,
            category: uploadForm.category,
            price: priceValue,
            url: uploadForm.url,
            tutorName: user.name,
        });

        setIsUploading(false);
        setUploadForm({ title: '', category: 'Sains', price: '', url: 'https://youtube.com/mock' });
        setNotification({ show: true, type: 'success', message: 'Video berhasil diupload dan siap dijual!' });
    };

    // ... (inside the form) ...

    <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Harga (Rp)</label>
        <input
            type="text"
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-yellow-400"
            placeholder="50000"
            value={formatPrice(uploadForm.price)}
            onChange={e => {
                const val = parsePrice(e.target.value);
                if (!isNaN(val)) setUploadForm({ ...uploadForm, price: val });
            }}
        />
    </div>

    // TUTOR VIEW
    if (user.role === 'tutor') {
        const myVideos = videos.filter(v => v.tutorName === user.name);

        return (
            <div className="p-6 space-y-6 animate-in fade-in pb-24">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Kelola Video Anda</h1>
                        <p className="text-slate-500 text-sm">Upload materi baru dan pantau penjualan.</p>
                    </div>
                    <button
                        onClick={() => setIsUploading(!isUploading)}
                        className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-yellow-500 transition-colors shadow-sm"
                    >
                        {isUploading ? 'Batal Upload' : '+ Upload Video Baru'}
                    </button>
                </div>

                {isUploading && (
                    <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-top-4">
                        <h3 className="font-bold text-slate-900">Form Upload Video</h3>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Video</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-yellow-400"
                                placeholder="Contoh: Tutorial Fisika Dasar Bab 1"
                                value={uploadForm.title}
                                onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Link Video / URL</label>
                            <input
                                type="url"
                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-yellow-400"
                                placeholder="https://youtube.com/..."
                                value={uploadForm.url}
                                onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                                <select
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-yellow-400"
                                    value={uploadForm.category}
                                    onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Harga (Rp)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-yellow-400"
                                    placeholder="50000"
                                    value={formatPrice(uploadForm.price)}
                                    onChange={e => {
                                        const val = parsePrice(e.target.value);
                                        if (!isNaN(val)) setUploadForm({ ...uploadForm, price: val });
                                    }}
                                />
                            </div>
                        </div>

                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
                            Simpan & Publish
                        </button>
                    </form>
                )
                }

                <h3 className="font-bold text-lg text-slate-900">Video Saya ({myVideos.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myVideos.length === 0 ? (
                        <div className="text-slate-400 text-sm col-span-2 text-center py-8 bg-slate-50 rounded-2xl border-dashed border border-slate-200">
                            Belum ada video yang diupload.
                        </div>
                    ) : myVideos.map(video => (
                        <div key={video.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                            <div className={`w-20 h-20 rounded-xl ${video.color || 'bg-slate-200'} flex items-center justify-center shrink-0`}>
                                <Play className="text-white fill-white w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{video.category}</span>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mt-1">{video.title}</h4>
                                <p className="text-yellow-600 font-bold text-xs mt-1">Rp {video.price.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Notification Modal */}
                <NotificationModal
                    show={notification.show}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            </div >
        );
    }

    // STUDENT VIEW
    return (
        <div className="p-6 space-y-8 animate-in fade-in pb-24 bg-white min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-900" />
                </button>
                <h1 className="text-xl font-bold text-slate-900 flex-1">Video Library</h1>
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari materi..."
                        className="bg-slate-50 border border-slate-100 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all w-48"
                    />
                </div>
            </div>

            {/* Content Categories (Optional/Hidden for exact mockup match, but good to keep) */}
            {/* Used minimal style */}

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map(video => (
                    <div key={video.id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-yellow-300 transition-all group flex flex-col h-full">
                        {/* Thumbnail */}
                        <div className={`h-40 ${video.color || 'bg-slate-200'} relative flex items-center justify-center overflow-hidden`}>
                            {/* Abstract Pattern Overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                            <div className="w-12 h-8 bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <Play className="fill-red-500 text-red-500 w-4 h-4" />
                            </div>

                            {/* Duration Badge */}
                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                {video.duration || 'Video'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2 mb-4 flex-1">
                                {video.title}
                            </h3>

                            <div className="flex items-center justify-between mt-auto pt-4">
                                <span className="font-bold text-slate-900 text-base">
                                    Rp {video.price.toLocaleString()}
                                </span>
                                <button
                                    onClick={() => handleBuy(video)}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-md shadow-yellow-400/20 active:scale-95 transition-all"
                                >
                                    Beli
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
