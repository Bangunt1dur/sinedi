
import { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function ReviewModal({ show, onClose, onSubmit, jobTitle }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!show) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        await onSubmit({ stars: rating, text: reviewText });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <h3 className="text-xl font-bold text-slate-900 text-center mb-1">Beri Ulasan</h3>
                <p className="text-xs text-slate-500 text-center mb-6 px-4 line-clamp-1">{jobTitle}</p>

                <div className="flex flex-col items-center gap-6 mb-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 active:scale-90"
                            >
                                <Star
                                    className={`w-10 h-10 ${star <= (hoverRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-slate-100 text-slate-200'
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-bold text-yellow-500">
                        {rating === 1 && 'Sangat Buruk'}
                        {rating === 2 && 'Buruk'}
                        {rating === 3 && 'Cukup'}
                        {rating === 4 && 'Puas'}
                        {rating === 5 && 'Sangat Puas!'}
                        {rating === 0 && 'Pilih rating'}
                    </p>
                </div>

                <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    rows="3"
                    placeholder="Tulis pengalamanmu belajar dengan tutor ini..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                ></textarea>

                <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className="w-full bg-yellow-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 mt-6 transition-all active:scale-95"
                >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
            </div>
        </div>
    );
}
