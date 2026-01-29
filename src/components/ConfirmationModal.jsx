import { AlertCircle, HelpCircle } from 'lucide-react';

export default function ConfirmationModal({ show, title, message, onConfirm, onCancel, type = 'question' }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {type === 'danger' ? (
                        <AlertCircle className="w-10 h-10" />
                    ) : (
                        <HelpCircle className="w-10 h-10" />
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 font-bold py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 font-bold py-3 rounded-xl shadow-lg text-white transition-all active:scale-95 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        Ya, Lanjutkan
                    </button>
                </div>
            </div>
        </div>
    );
}
