import { useState, useRef, useEffect } from 'react';
import { MessageCircle, FileText, CheckCircle, Upload, Download, AlertCircle, Link as LinkIcon, Clock, CheckCircle2, Video } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import NotificationModal from '../components/NotificationModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ActivityPage() {
    const { orders, user, finishJob, updateOrder } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

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
        // Just in case this is called:
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
        ? orders
        : orders.filter(o => (o.status === 'In Progress' || o.status === 'Done') && o.tutorName === user.name);

    // TABS CONFIGURATION based on Role
    // Student: Semua, Antrian, Proses, Selesai
    // Tutor: Proses, Selesai (Queue is in Dashboard)
    const tabs = user.role === 'student'
        ? ['Semua', 'Antrian', 'Proses', 'Selesai']
        : ['Proses', 'Selesai'];

    // Ensure activeTab is valid for the role
    useEffect(() => {
        if (user.role === 'tutor' && ['Semua', 'Antrian'].includes(activeTab)) {
            setActiveTab('Proses');
        }
    }, [user.role]);

    const myOrders = allOrders.filter(order => {
        if (activeTab === 'Semua') return true;
        if (activeTab === 'Antrian') return order.status === 'Queue';
        if (activeTab === 'Proses') return order.status === 'In Progress';
        if (activeTab === 'Selesai') return order.status === 'Done';
        return true;
    });

    return (
        <div className="p-6 space-y-6 animate-in fade-in pb-24">
            <h1 className="text-2xl font-bold text-slate-900">Aktivitas {user.role === 'tutor' ? '(Tutor)' : ''}</h1>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => (
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
                        <span className="ml-2 text-xs opacity-60">
                            {
                                tab === 'Semua' ? allOrders.length :
                                    tab === 'Antrian' ? allOrders.filter(o => o.status === 'Queue').length :
                                        tab === 'Proses' ? allOrders.filter(o => o.status === 'In Progress').length :
                                            allOrders.filter(o => o.status === 'Done').length
                            }
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {myOrders.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        {user.role === 'student' ? 'Belum ada aktivitas di kategori ini.' : 'Belum ada pekerjaan yang diambil.'}
                    </div>
                ) : (
                    myOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                            {/* Status Badge */}
                            <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-xs font-bold
                                ${order.status === 'Unpaid' ? 'bg-red-100 text-red-600' :
                                    order.status === 'Queue' ? 'bg-yellow-100 text-yellow-600' :
                                        order.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                                            'bg-green-100 text-green-600'
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
                                    <p className="text-sm text-slate-500">ID: #{order.id.slice(-6)} • {order.deadline}</p>
                                    {order.status === 'In Progress' && user.role === 'student' && (
                                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Dikerjakan oleh: {order.tutorName || 'Tutor'}
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

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => navigate(`/chat/${order.id}`)}
                                                            className="col-span-2 bg-blue-50 border border-blue-200 py-3 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2"
                                                        >
                                                            <MessageCircle className="w-5 h-5" />
                                                            Masuk Live Chat
                                                        </button>

                                                        <button
                                                            onClick={() => handleMarkDone(order.id)}
                                                            className="col-span-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-2 transition-all"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                            Akhiri Sesi Mentoring
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Joki View
                                                expandedOrderId === order.id ? (
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
                                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
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
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Completed State */}
                            {order.status === 'Done' && (
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
                                                href={order.result?.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={order.result?.type === 'file' ? order.result.name : undefined}
                                                className="block w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold shadow-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-decoration-none"
                                            >
                                                <Download className="w-4 h-4" />
                                                {order.result?.type === 'link' ? 'Buka Link Hasil' : 'Download Hasil'}
                                            </a>
                                        ) : (
                                            <p className="text-xs text-green-600 text-center bg-white/50 py-1 rounded">
                                                Anda mengirim: {order.result?.name || 'File'}
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    ))
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
        </div >
    );
}
