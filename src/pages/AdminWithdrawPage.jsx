import { useState } from 'react';
import { useApp } from '../context/AppContext';

import { ArrowLeft, Upload, CheckCircle, AlertCircle, Banknote, Download, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminWithdrawPage() {
    const { user, orders, finishJob } = useApp(); // orders are jobs, include withdraws
    const navigate = useNavigate();

    // Local State for Upload
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);

    // Filter withdrawals
    // Note: AppContext 'orders' catches 'jobs' collection.
    const withdrawals = orders.filter(o => o.type === 'withdraw').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const pendingWithdrawals = withdrawals.filter(o => o.status === 'process');
    const completedWithdrawals = withdrawals.filter(o => o.status === 'done' || o.status === 'Done');

    const handleUploadSubmit = (orderId) => {
        if (!uploadFile) return alert("Pilih file bukti transfer dahulu!");

        // Mock Upload / Store File Data
        const resultData = {
            type: 'file',
            name: uploadFile.name,
            url: URL.createObjectURL(uploadFile), // Mock URL for display
            uploadedAt: new Date().toISOString()
        };

        finishJob(orderId, resultData);
        setExpandedOrderId(null);
        setUploadFile(null);
        alert("Bukti transfer berhasil diupload! Status diperbarui.");
    };

    if (!user || !user.isAdmin) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-xl font-bold text-red-600">Akses Ditolak</h1>
                <p>Halaman ini hanya untuk Administrator.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">Kembali ke Dashboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Logout Button instead of Back, as this is the main admin page now */}
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500" title="Keluar">
                        <LogOut className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Admin Withdrawal Center</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-8">

                {/* Pending Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Menunggu Transfer ({pendingWithdrawals.length})</h2>
                    </div>

                    <div className="space-y-4">
                        {pendingWithdrawals.length === 0 ? (
                            <p className="text-slate-400 italic">Tidak ada antrian penarikan.</p>
                        ) : (
                            pendingWithdrawals.map(w => (
                                <div key={w.id} className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-bold rounded-bl-xl">
                                        Proses
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Request ID: #{w.id.slice(-6)}</p>
                                            <h3 className="text-lg font-bold text-slate-900">{w.tutorName}</h3>
                                            <p className="text-sm text-slate-600 font-medium">{w.bankDetails?.bank} - {w.bankDetails?.accountNumber}</p>
                                            <p className="text-xs text-slate-500 uppercase">A.N {w.bankDetails?.accountName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-slate-900">Rp {parseInt(w.price).toLocaleString('id-ID')}</p>
                                            <p className="text-xs text-slate-400">{new Date(w.createdAt).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        {expandedOrderId === w.id ? (
                                            <div className="animate-in fade-in">
                                                <label className="block text-xs font-bold text-slate-700 mb-2">Upload Bukti Transfer</label>
                                                <input
                                                    type="file"
                                                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                                />
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => setExpandedOrderId(null)}
                                                        className="flex-1 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        onClick={() => handleUploadSubmit(w.id)}
                                                        className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 shadow-md shadow-green-200"
                                                    >
                                                        Kirim Bukti & Selesaikan
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setExpandedOrderId(w.id)}
                                                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                                            >
                                                <Upload className="w-4 h-4" /> Proses Transfer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <hr className="border-slate-200" />

                {/* Completed Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Riwayat Selesai ({completedWithdrawals.length})</h2>
                    </div>

                    <div className="space-y-4">
                        {completedWithdrawals.map(w => (
                            <div key={w.id} className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-50 rounded-full">
                                        <Banknote className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{w.tutorName}</h4>
                                        <p className="text-xs text-slate-500">{new Date(w.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">Rp {parseInt(w.price).toLocaleString()}</p>
                                    {w.result && (
                                        <div className="text-xs text-green-600 flex items-center justify-end gap-1 mt-1">
                                            <CheckCircle className="w-3 h-3" /> Bukti Terkirim
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
