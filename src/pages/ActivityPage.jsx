import { useState, useEffect } from 'react';
import { MessageCircle, FileText, CheckCircle, Upload, Download, AlertCircle, Link as LinkIcon, Clock, Video, Star, User, Banknote } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import NotificationModal from '../components/NotificationModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ReviewModal from '../components/ReviewModal';

export default function ActivityPage() {
    const { orders, user, finishJob, updateOrder, submitReview } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Filter Logic
    const [activeTab, setActiveTab] = useState('Semua');

    useEffect(() => {
        if (location.state?.filter) {
            setActiveTab(location.state.filter);
        }
    }, [location.state]);

    // State to track uploaded files inputs for orders
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [resultLink, setResultLink] = useState('');

    // Modals State
    const [showConfirm, setShowConfirm] = useState({ show: false, action: null, title: '', message: '' });
    const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });
    const [reviewModal, setReviewModal] = useState({ show: false, jobId: null, jobTitle: '' });

    const handleUploadResult = (orderId) => {
        if (!uploadFile && !resultLink) {
            setNotification({ show: true, type: 'error', message: 'Upload file atau link dulu!' });
            return;
        }

        const resultData = {
            type: uploadFile ? 'file' : 'link',
            name: uploadFile ? uploadFile.name : 'Link Result',
            url: resultLink,
            file: uploadFile // In real app, this would be uploaded
        };

        finishJob(orderId, resultData);
        setNotification({ show: true, type: 'success', message: 'Tugas berhasil dikirim!' });
        setExpandedOrderId(null);
        setUploadFile(null);
        setResultLink('');
    };

    const handleMarkDone = (orderId) => {
        const order = orders.find(o => o.id === orderId);

        // Mentoring doesn't need upload
        if (order?.type === 'mentoring') {
            setShowConfirm({
                show: true,
                title: 'Akhiri Sesi Mentoring?',
                message: 'Pastikan durasi mentoring sudah tercapai.',
                action: () => {
                    finishJob(orderId, { type: 'mentoring', name: 'Sesi Selesai' });
                    setNotification({ show: true, type: 'success', message: 'Sesi mentoring selesai!' });
                    setShowConfirm({ ...showConfirm, show: false });
                }
            });
            return;
        }

        // For non-mentoring, we rely on handleUploadResult now.
        setNotification({ show: true, type: 'info', message: 'Gunakan tombol Upload Hasil untuk menyelesaikan tugas ini.' });
    };

    const sendMeetingLink = (orderId, link) => {
        if (link) {
            updateOrder(orderId, { meetingLink: link });
            setNotification({ show: true, type: 'success', message: 'Link meeting terkirim ke siswa!' });
        }
    };

    // Filter orders based on role and active tab
    const allOrders = user.role === 'student'
        ? orders.filter(o => o.studentId === user.id && o.type !== 'withdraw')
        : orders.filter(o => {
            // STRICT FILTER: Only show jobs explicitly assigned to this tutor (or their withdrawals)

            // 1. Withdrawal Requests (My Withdrawals)
            if (o.type === 'withdraw' && o.tutorId === user.id) return true;

            // 2. My Active/Completed Jobs (Assigned to me)
            if (o.tutorId === user.id) {
                return ['process', 'In Progress', 'process', 'done', 'Done', 'completed'].includes(o.status);
            }

            // 3. REMOVED: Open Queue jobs do NOT appear here. They belong in Dashboard > Rekomendasi.
            return false;
        });

    // TABS CONFIGURATION based on Role
    const tabs = user.role === 'student'
        ? ['Semua', 'Antrian', 'Proses', 'Selesai']
        : ['Proses', 'Selesai']; // Fix: Tutor only needs personal workspace tabs

    // Ensure activeTab is valid for the role
    useEffect(() => {
        if (user.role === 'tutor' && ['Semua', 'Antrian'].includes(activeTab)) {
            setActiveTab('Proses');
        }
    }, [user.role, activeTab]);

    // STRICT FILTER LOGIC (Shared for List & Tabs)
    const antrianJobs = allOrders.filter(o => ['Queue', 'pending'].includes(o.status) && o.type !== 'video_buy');
    const prosesJobs = allOrders.filter(o => ['process', 'In Progress'].includes(o.status));
    const selesaiJobs = allOrders.filter(o => ['done', 'Done', 'completed'].includes(o.status) || o.type === 'video_buy');

    // Determine List based on Tab
    const myOrders = activeTab === 'Semua' ? allOrders :
        activeTab === 'Antrian' ? antrianJobs :
            activeTab === 'Proses' ? prosesJobs :
                activeTab === 'Selesai' ? selesaiJobs : [];

    return (
        <div className="p-6 space-y-6 animate-in fade-in pb-24">
            <h1 className="text-2xl font-bold text-slate-900">Aktivitas {user.role === 'tutor' ? '(Tutor)' : ''}</h1>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => {
                    const count = tab === 'Semua' ? allOrders.length :
                        tab === 'Antrian' ? antrianJobs.length :
                            tab === 'Proses' ? prosesJobs.length :
                                selesaiJobs.length;

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                                ${activeTab === tab
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {tab}
                            <span className="ml-2 text-xs opacity-60">{count}</span>
                        </button>
                    );
                })}
            </div>

            <div className="space-y-4">
                {myOrders.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        {user.role === 'student' ? 'Belum ada aktivitas di kategori ini.' : 'Belum ada pekerjaan yang diambil.'}
                    </div>
                ) : (
                    myOrders.map(orderItem => {
                        // VISUAL FIX: Override status for Video Buy to always show 'done'
                        // This fixes old transactions that were stuck in 'Queue'
                        const isVideo = orderItem.type === 'video_buy';
                        const displayStatus = isVideo ? 'done' : orderItem.status;

                        // Use a new object for rendering to avoid mutating original
                        const order = { ...orderItem, status: displayStatus };

                        // --- STRICT CHAT LOGIC ---
                        // 1. Must NOT be 'done' or 'Selesai'
                        // 2. Must be 'task' (Joki) or 'mentoring'
                        const showChatButton =
                            order.status !== 'done' &&
                            order.status !== 'Done' &&
                            order.status !== 'Selesai' &&
                            (order.type === 'task' || order.type === 'mentoring');

                        return (
                            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                                {/* SPECIAL CARD FOR WITHDRAWAL */}
                                {order.type === 'withdraw' ? (
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-2">
                                            <div className="p-3 bg-yellow-50 rounded-full">
                                                <Banknote className="w-6 h-6 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">Penarikan Dana</h3>
                                                <p className="text-xs text-slate-400 mb-1">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-700">
                                                        {order.bankDetails?.bank} - {order.bankDetails?.accountNumber}
                                                    </div>
                                                </div>
                                                <p className="font-bold text-slate-900 mt-2 text-lg">
                                                    Rp {(parseInt(order.price) || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Message */}
                                        {order.status === 'process' ? (
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-center gap-3">
                                                <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-yellow-800">Menunggu Transfer</p>
                                                    <p className="text-xs text-yellow-700">Dana akan dikirim admin dalam 1x24 jam.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-green-800">Dana Terkirim</p>
                                                    <p className="text-xs text-green-700">Penarikan telah berhasil ditransfer.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ADMIN ACTION: Upload Proof */}
                                        {user.role === 'admin' && order.status === 'process' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                    className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold"
                                                >
                                                    {expandedOrderId === order.id ? 'Batal' : 'Upload Bukti Transfer'}
                                                </button>

                                                {expandedOrderId === order.id && (
                                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg animate-in fade-in">
                                                        <input
                                                            type="file"
                                                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                                                            onChange={(e) => setUploadFile(e.target.files[0])}
                                                        />
                                                        <button
                                                            onClick={() => handleUploadResult(order.id)}
                                                            className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2"
                                                        >
                                                            <Upload className="w-4 h-4" /> Kirim Bukti
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* TUTOR ACTION: Download Proof */}
                                        {(order.status === 'done' || order.status === 'Done') && order.result && (
                                            <div className="mt-2">
                                                <a
                                                    href={order.result.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {order.result.name || 'Lihat Bukti Transfer'}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* STANDARD ORDER CARD (Mentoring / Joki) */
                                    <>
                                        {/* Status Badge */}
                                        <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-xs font-bold
                                            ${order.status === 'Unpaid' ? 'bg-red-100 text-red-600' :
                                                order.status === 'Queue' ? 'bg-yellow-100 text-yellow-600' :
                                                    ['process', 'In Progress'].includes(order.status) ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600' // done
                                            }`
                                        }>
                                            {order.status}
                                        </div>

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-slate-50 rounded-full">
                                                <FileText className="w-6 h-6 text-slate-700" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">{order.title}</h3>
                                                <p className="text-xs text-slate-400 mb-2">ID: #{order.id.slice(-6)} • {order.deadline}</p>

                                                {/* INFO ROW: Tutor & Price */}
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {(order.tutorName || user.role === 'tutor') && (order.tutorName !== user.name || user.role === 'student') && (
                                                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-700">
                                                            <User className="w-3 h-3" />
                                                            {order.tutorName || 'Tutor'}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-xs font-bold text-green-700">
                                                        <Banknote className="w-3 h-3" />
                                                        Rp {(parseInt(order.price) || 0).toLocaleString()}
                                                    </div>
                                                </div>

                                                {order.status === 'In Progress' && user.role === 'student' && (
                                                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Sedang dikerjakan
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Area */}
                                        {order.status === 'In Progress' && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                                                {/* Student View: Waiting */}
                                                {user.role === 'student' && (
                                                    <div className="flex flex-col gap-3">
                                                        {/* Logic Chat Button Here? No, moved to bottom */}

                                                        {order.type === 'mentoring' && order.meetingLink ? (
                                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center animate-in fade-in">
                                                                <p className="text-sm text-blue-800 font-bold mb-2">Sesi Mentoring Siap!</p>
                                                                <button
                                                                    onClick={() => window.open(order.meetingLink, '_blank')}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 w-full transition-colors"
                                                                >
                                                                    <LinkIcon className="w-4 h-4" />
                                                                    Join Meeting Sekarang
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                                                                <span>{order.type === 'mentoring' ? 'Menunggu link meeting dari tutor...' : 'Menunggu hasil dari tutor...'}</span>
                                                                <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Tutor View */}
                                                {user.role === 'tutor' && (
                                                    <div className="mb-4">
                                                        {order.type === 'mentoring' ? (
                                                            <div className="space-y-4">
                                                                {/* Reminder Banner */}
                                                                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg animate-pulse">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-5 h-5 text-orange-600" />
                                                                        <p className="text-sm font-bold text-orange-700">
                                                                            Pengingat Sesi
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs text-orange-700 mt-1 pl-7">
                                                                        Pastikan Anda siap 10 menit sebelum jadwal: <strong>{order.deadline}</strong>.
                                                                        Siapkan materi dan cek koneksi internet.
                                                                    </p>
                                                                </div>

                                                                <p className="text-sm font-bold text-slate-700 border-b pb-2">Panel Mentoring</p>

                                                                {/* Link Meeting Input */}
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Paste Link Zoom/GMeet..."
                                                                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                                        defaultValue={order.meetingLink || ''}
                                                                        onBlur={(e) => updateOrder(order.id, { meetingLink: e.target.value })}
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            const input = e.currentTarget.previousSibling;
                                                                            sendMeetingLink(order.id, input.value);
                                                                        }}
                                                                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700"
                                                                    >
                                                                        Kirim Link
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    onClick={() => handleMarkDone(order.id)}
                                                                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-2 transition-all"
                                                                >
                                                                    <CheckCircle className="w-5 h-5" />
                                                                    Akhiri Sesi Mentoring
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            // Joki View
                                                            <div className="space-y-3">
                                                                {expandedOrderId === order.id ? (
                                                                    <div className="space-y-3">
                                                                        <p className="text-sm font-bold text-slate-700">Upload Hasil Pengerjaan</p>
                                                                        <div className="flex flex-col gap-2">
                                                                            <input
                                                                                type="file"
                                                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                                                onChange={(e) => setUploadFile(e.target.files[0])}
                                                                            />
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs text-slate-400">atau Link:</span>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="https://drive.google.com/..."
                                                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                                    value={resultLink}
                                                                                    onChange={(e) => setResultLink(e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {(uploadFile || resultLink) && (
                                                                            <div className="text-green-600 flex items-center gap-2 text-xs font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                Siap dikirim: {uploadFile ? uploadFile.name : 'Link Hasil'}
                                                                            </div>
                                                                        )}

                                                                        <div className="flex gap-2 mt-4">
                                                                            <button
                                                                                onClick={() => setExpandedOrderId(null)}
                                                                                className="flex-1 bg-white border border-slate-200 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                                                                            >
                                                                                Batal
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleUploadResult(order.id)}
                                                                                disabled={!uploadFile && !resultLink}
                                                                                className="flex-1 bg-green-500 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:shadow-none transition-all"
                                                                            >
                                                                                <CheckCircle className="w-4 h-4" /> Selesai
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setExpandedOrderId(order.id)}
                                                                        className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                                                    >
                                                                        Upload Hasil
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Completed State */}
                                        {(order.status === 'done' || order.status === 'Done') && (
                                            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-green-700">
                                                            {order.type === 'mentoring' ? 'Sesi Selesai' : 'Tugas Selesai!'}
                                                        </p>
                                                        {order.type !== 'mentoring' && order.result && (
                                                            <p className="text-xs text-green-600 mt-1">File: {order.result.name}</p>
                                                        )}
                                                        {order.type === 'mentoring' && (
                                                            <p className="text-xs text-green-600 mt-1">Durasi: 60 Menit</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Only Student can download result (Not for Mentoring) */}
                                                {order.type !== 'mentoring' && (
                                                    user.role === 'student' ? (
                                                        <a
                                                            href={order.result?.url || order.resultLink || order.videoUrl || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download={order.result?.type === 'file' ? order.result.name : undefined}
                                                            className="block w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold shadow-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-decoration-none mt-3"
                                                        >
                                                            {order.type === 'video_buy' ? <Video className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                                            {order.type === 'video_buy' ? 'Tonton Video' : (order.result?.type === 'link' ? 'Buka Link Hasil' : 'Download Hasil')}
                                                        </a>
                                                    ) : (
                                                        <p className="text-xs text-green-600 text-center bg-white/50 py-1 rounded">
                                                            Anda mengirim: {order.result?.name || 'File'}
                                                        </p>
                                                    )
                                                )}

                                                {/* Review Button Logic */}
                                                {user.role === 'student' && (
                                                    <div className="mt-3 pt-3 border-t border-green-200">
                                                        {order.hasReviewed ? (
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-green-700">Ulasan Anda:</p>
                                                                <div className="flex gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-4 h-4 ${i < order.review.stars ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setReviewModal({ show: true, jobId: order.id, jobTitle: order.title })}
                                                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 border border-yellow-500 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Star className="w-4 h-4" /> Beri Ulasan Tutor
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* PERSISTENT CHAT BUTTON (Bottom of Card) */}
                                {showChatButton && (
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <button
                                            onClick={() => navigate('/chat/' + order.id, { state: { job: order } })}
                                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            Hubungi {user.role === 'student' ? 'Tutor' : 'Mahasiswa'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <ConfirmationModal
                show={showConfirm.show}
                title={showConfirm.title}
                message={showConfirm.message}
                onConfirm={showConfirm.action}
                onCancel={() => setShowConfirm({ ...showConfirm, show: false })}
                type="danger"
            />

            <NotificationModal
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification({ ...notification, show: false })}
            />

            <ReviewModal
                show={!!reviewModal.show}
                onClose={() => setReviewModal({ show: false, jobId: null, jobTitle: '' })}
                jobTitle={reviewModal.jobTitle}
                onSubmit={(data) => {
                    submitReview(reviewModal.jobId, data);
                    setNotification({ show: true, type: 'success', message: 'Ulasan berhasil dikirim!' });
                }}
            />
        </div>
    );
}
