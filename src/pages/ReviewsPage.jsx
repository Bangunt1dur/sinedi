import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, User, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReviewsPage() {
    const navigate = useNavigate();
    const { tutorStats } = useApp();

    const reviews = tutorStats?.reviewsList || [];
    const rating = tutorStats?.averageRating || 0;
    const ratingCount = tutorStats?.totalReviews || 0;

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
                        <span className="text-5xl font-black text-slate-900">{Number(rating).toFixed(1)}</span>
                        <span className="text-lg text-slate-400 font-bold mb-1">/ 5.0</span>
                    </div>
                    <div className="flex justify-center gap-1 my-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={`w-6 h-6 ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-slate-500">Berdasarkan {ratingCount} ulasan dari siswa</p>
                </div>

                {/* Review List */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4">Ulasan Anda</h3>
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <AlertCircle className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">Belum ada ulasan.</p>
                                <p className="text-xs text-slate-400 mt-1">Selesaikan pekerjaan dengan baik untuk dapat rating!</p>
                            </div>
                        ) : (
                            reviews.map((review, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{review.studentName}</p>
                                                <p className="text-[10px] text-slate-400">Review Terbaru</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < review.stars ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        "{review.text}"
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
