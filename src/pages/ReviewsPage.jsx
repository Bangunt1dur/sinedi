import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, User } from 'lucide-react';

export default function ReviewsPage() {
    const navigate = useNavigate();

    // Mock Review Data
    const reviews = [
        { id: 1, name: 'Budi Santoso', rating: 5, comment: 'Sangat membantu! Penjelasannya mudah dimengerti.', date: '2 Hari lalu' },
        { id: 2, name: 'Siti Aminah', rating: 5, comment: 'Tutor ramah dan fast respons. Recommended!', date: '5 Hari lalu' },
        { id: 3, name: 'Rizky Febian', rating: 4, comment: 'Bagus, tapi agak telat sedikit dari jadwal.', date: '1 Minggu lalu' },
        { id: 4, name: 'Dewi Lestari', rating: 5, comment: 'Terima kasih kak, nilai ulangan saya jadi bagus!', date: '2 Minggu lalu' },
        { id: 5, name: 'Andi Hidayat', rating: 5, comment: 'Mantap, pengerjaan cepat dan rapi.', date: '3 Minggu lalu' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold">Ulasan & Rating</h1>
            </div>

            <div className="p-6 max-w-lg mx-auto space-y-6 animate-in fade-in">
                {/* Summary Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Rating</h2>
                    <div className="flex justify-center items-end gap-2">
                        <span className="text-5xl font-black text-slate-900">4.9</span>
                        <span className="text-lg text-slate-400 font-bold mb-1">/ 5.0</span>
                    </div>
                    <div className="flex justify-center gap-1 my-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <p className="text-sm text-slate-500">Berdasarkan 24 ulasan dari siswa</p>
                </div>

                {/* Review List */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4">Ulasan Terbaru</h3>
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{review.name}</p>
                                            <p className="text-[10px] text-slate-400">{review.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
