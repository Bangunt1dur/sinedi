import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Clock, Calendar } from 'lucide-react';
import NotificationModal from '../components/NotificationModal'; // Ensure this matches WalletHistoryPage import

export default function TutorSchedulePage() {
    const { user, updateProfile } = useApp();
    const navigate = useNavigate();

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const [schedule, setSchedule] = useState({
        days: user.availability?.days || [],
        timeStart: user.availability?.timeStart || '09:00',
        timeEnd: user.availability?.timeEnd || '17:00',
        price: user.tutorProfile?.price || 50000
    });

    const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });

    // Format Price: 50000 -> "50.000"
    const formatPrice = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Parse Price: "50.000" -> 50000
    const parsePrice = (value) => {
        return parseInt(value.replace(/\./g, '')) || 0;
    };

    const toggleDay = (day) => {
        setSchedule(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }));
    };

    const handleSave = () => {
        if (schedule.days.length === 0) {
            setNotification({ show: true, type: 'error', message: 'Pilih minimal satu hari!' });
            return;
        }

        updateProfile({
            availability: { ...schedule },
            tutorProfile: { price: schedule.price },
            isMentoringActive: true // MENTORING VISIBILITY FIX
        });

        setNotification({ show: true, type: 'success', message: 'Pengaturan mentoring berhasil disimpan!' });

        // Navigate after short delay or let user close modal
        setTimeout(() => {
            // Optional: auto navigate or wait for user to close modal
        }, 1500);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
        if (notification.type === 'success') {
            navigate('/profile');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
            <div className="p-6 max-w-md mx-auto animate-in fade-in">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Kembali
                </button>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Atur Jadwal Mentoring</h1>
                <p className="text-slate-500 text-sm mb-8">Tentukan kapan Anda tersedia untuk sesi mentoring.</p>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
                    {/* Days Selection */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Hari Tersedia
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${schedule.days.includes(day)
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Range */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Jam Operasional
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <span className="text-xs text-slate-500 mb-1 block">Mulai</span>
                                <input
                                    type="time"
                                    value={schedule.timeStart}
                                    onChange={e => setSchedule({ ...schedule, timeStart: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            <span className="text-slate-400 font-bold">-</span>
                            <div className="flex-1">
                                <span className="text-xs text-slate-500 mb-1 block">Selesai</span>
                                <input
                                    type="time"
                                    value={schedule.timeEnd}
                                    onChange={e => setSchedule({ ...schedule, timeEnd: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">Tarif Mentoring</h3>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                            <input
                                type="text"
                                value={formatPrice(schedule.price)}
                                onChange={e => {
                                    const val = parsePrice(e.target.value);
                                    if (!isNaN(val)) setSchedule({ ...schedule, price: val });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Harga per sesi"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ Sesi</span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Simpan Pengaturan
                    </button>
                </div>

                {/* Notification Modal */}
                <NotificationModal
                    show={notification.show}
                    type={notification.type}
                    message={notification.message}
                    onClose={handleCloseNotification}
                />
            </div>
        </div>
    );
}
