import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Mock User Data
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('sinedi_user');
        return saved ? JSON.parse(saved) : {
            name: 'Mahasiswa',
            role: 'student',
            wallet: 750000,
            availability: { days: ['Senin', 'Rabu', 'Jumat'], timeStart: '09:00', timeEnd: '17:00' } // Default for potential tutor
        };
    });

    // Mock Tutors Data (Global for sync)
    const [tutors, setTutors] = useState([
        {
            id: 1, name: 'Budi Santoso', skill: 'Matematika & Fisika', rate: 4.9, color: 'bg-blue-100', price: 100000,
            availability: { days: ['Senin', 'Kamis'], timeStart: '10:00', timeEnd: '14:00' }
        },
        {
            id: 2, name: 'Siti Aminah', skill: 'Bahasa Inggris', rate: 4.8, color: 'bg-pink-100', price: 85000,
            availability: { days: ['Rabu', 'Jumat'], timeStart: '13:00', timeEnd: '17:00' }
        },
        {
            id: 3, name: 'Rizky Febian', skill: 'Pemrograman Web', rate: 5.0, color: 'bg-orange-100', price: 120000,
            availability: { days: ['Sabtu', 'Minggu'], timeStart: '09:00', timeEnd: '12:00' }
        },
        {
            id: 4, name: 'Nedi Suryadi', skill: 'Teknik Informatika', rate: 5.0, color: 'bg-indigo-100', price: 50000,
            availability: { days: ['Senin', 'Rabu', 'Jumat'], timeStart: '09:00', timeEnd: '17:00' }
        },
    ]);

    // Persist State
    useEffect(() => {
        localStorage.setItem('sinedi_user', JSON.stringify(user));
    }, [user]);

    // Update Tutors List when User (Tutor) updates profile
    useEffect(() => {
        if (user && user.role === 'tutor') {
            setTutors(prev => prev.map(t => {
                if (t.name === user.name) {
                    return {
                        ...t,
                        // Sync specific fields that Student sees
                        availability: user.availability || t.availability,
                        price: user.price || t.price // Assume user.price exists if they set it
                        // Add more fields if needed
                    };
                }
                return t;
            }));
        }
    }, [user]); // Run whenever user updates

    // Mock Orders Data with Persistence
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('sinedi_orders');
        return saved ? JSON.parse(saved) : [
            { id: 'ORD-12345', title: 'Calculus Assignment 2', type: 'joki', status: 'In Progress', deadline: 'Besok', price: 150000 },
            { id: 'ORD-67890', title: 'Makalah Sejarah', type: 'joki', status: 'Done', deadline: 'Kemarin', price: 75000 },
            { id: 'ORD-11223', title: 'Joki Coding (React)', type: 'joki', status: 'Queue', deadline: 'Lusa', price: 300000 },
            { id: 'ORD-99887', title: 'Mentoring Skripsi UI/UX', type: 'mentoring', status: 'In Progress', deadline: 'Hari ini', price: 200000, tutorName: 'Mahasiswa' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('sinedi_orders', JSON.stringify(orders));
    }, [orders]);

    // Mock Video Data (Global)
    const [videos, setVideos] = useState([
        { id: 1, title: 'Mastering Calculus 1', price: 50000, color: 'bg-red-500', category: 'Sains', tutorName: 'Dr. Math', url: 'https://youtube.com/mockvideo1' },
        { id: 2, title: 'Dasar Pemrograman Python', price: 75000, color: 'bg-blue-500', category: 'Programming', tutorName: 'Code Master', url: 'https://youtube.com/mockvideo2' },
        { id: 3, title: 'Belajar Akuntansi Dasar', price: 60000, color: 'bg-green-500', category: 'Ekonomi', tutorName: 'Econ Pro', url: 'https://youtube.com/mockvideo3' },
        { id: 4, title: 'Tips Public Speaking', price: 45000, color: 'bg-purple-500', category: 'Bahasa', tutorName: 'Talkative', url: 'https://youtube.com/mockvideo4' },
        { id: 5, title: 'Fisika Dasar: Newton', price: 55000, color: 'bg-red-400', category: 'Sains', tutorName: 'Newton Fan', url: 'https://youtube.com/mockvideo5' },
        { id: 6, title: 'UI/UX Design 101', price: 65000, color: 'bg-pink-500', category: 'Desain', tutorName: 'Creative Mind', url: 'https://youtube.com/mockvideo6' },
    ]);

    // ... (persistance code stays same or is omitted if not in viewing range, but I'll trust the context)
    // Wait, the REPLACE block needs to match exact context.
    // I will target the videos block and the payOrder block separately using MultiReplace if possible, but the tools are distinct.
    // I'll do this in two chunks if needed, or if they are close enough (lines 32 and 88 are far).
    // I'll use multi_replace_file_content since I need to edit two separate blocks.
    // WAIT: I don't have multi_replace available in this turn? I DO have `multi_replace_file_content`.
    // I will use `replace_file_content` for now, just applied twice if need be.
    // Actually, `payOrder` is at line 88. `videos` is at line 32.
    // I will use `multi_replace_file_content`.

    // Oh wait, I am the model. I should check if I have `multi_replace_file_content`. YES I DO.
    // So I will use that.


    // Persist State
    useEffect(() => {
        localStorage.setItem('sinedi_user', JSON.stringify(user));
    }, [user]);

    // Mock Notifications Data
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Pembayaran Berhasil', desc: 'Pembayaran terkonfirmasi.', type: 'success', time: 'Baru saja', isRead: false },
        { id: 2, title: 'Tutor Menemukanmu!', desc: 'Kak Andi mengambil tugasmu.', type: 'info', time: '5m lalu', isRead: false },
        { id: 3, title: 'Diskon Spesial!', desc: 'Potongan 20% untuk order hari ini.', type: 'promo', time: '1j lalu', isRead: true },
    ]);

    // Global Alert State
    const [globalAlert, setGlobalAlert] = useState({ show: false, type: 'info', title: '', message: '' });

    // Actions
    // Actions
    const login = (username, role) => {
        setUser({
            name: username,
            role: role,
            wallet: role === 'tutor' ? 2500000 : 750000, // Different mock wallet for fun
            availability: { days: ['Senin', 'Rabu', 'Jumat'], timeStart: '09:00', timeEnd: '17:00' }
        });
    };

    const updateProfile = (updatedData) => {
        setUser(prev => ({
            ...prev,
            ...updatedData,
            availability: { ...prev.availability, ...(updatedData.availability || {}) },
            tutorProfile: { ...prev.tutorProfile, ...(updatedData.tutorProfile || {}) }
        }));
    };

    const switchMode = () => {
        setUser(prev => {
            const isStudent = prev.role === 'student';
            return {
                ...prev,
                role: isStudent ? 'tutor' : 'student',
                name: isStudent ? 'Nedi Suryadi' : 'Budi Santoso', // Auto-switch persona for better demo flow
                wallet: isStudent ? 2500000 : 750000
            };
        });
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const createOrder = (orderData) => {
        const newOrder = {
            id: `ORD-${Math.floor(Math.random() * 100000)}`,
            status: 'Unpaid',
            ...orderData
        };
        setOrders([newOrder, ...orders]);

        // If it's a Direct Request (Mentoring), Notify the specific Tutor immediately (Simulated)
        if (orderData.tutorName) {
            const notif = {
                id: Date.now() + 1,
                title: 'Permintaan Mentoring Baru',
                desc: `Ada request masuk: ${orderData.title}`,
                type: 'info',
                isRead: false,
                targetUser: orderData.tutorName // We would need filtering logic in Dashboard, but for simplicity assuming global notif list filtered by user relevance or just pushing to global for now
            };
            // In a real app, this would go to the backend. Here we push to a "notifications" array that we filter? 
            // Current AppContext has simplistic 'notifications' state.
            // Let's assume we append to it.
            setNotifications(prev => [notif, ...prev]);
        }

        return newOrder.id;
    };

    const addVideo = (videoData) => {
        const newVideo = {
            id: Date.now(),
            color: 'bg-indigo-500', // Default color for new uploads
            ...videoData
        };
        setVideos([newVideo, ...videos]);
    };

    const updateOrder = (orderId, data) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    };

    const payOrder = (orderId) => {
        setOrders(prevOrders => prevOrders.map(o => {
            if (o.id === orderId) {
                // If it's a video, complete it immediately
                if (o.type === 'video') {
                    return {
                        ...o,
                        status: 'Done',
                        result: { type: 'link', name: 'Tonton Video', url: o.videoUrl || 'https://youtube.com' }
                    };
                }
                // Else (Joki), put in Queue
                return { ...o, status: 'Queue' };
            }
            return o;
        }));
    };

    const takeJob = (orderId) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'In Progress', tutorName: user.name } : o));
    };

    const finishJob = (orderId, result = null) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            // Update Order Status
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Done', result } : o));

            // Add Funds to User Wallet (Mock)
            setUser(prev => ({
                ...prev,
                wallet: (prev.wallet || 0) + order.price
            }));
        }
    };

    const withdrawFunds = (amount) => {
        if (user.wallet >= amount) {
            setUser(prev => ({
                ...prev,
                wallet: prev.wallet - amount
            }));
            return true;
        }
        return false;
    };

    const addNotification = (notif) => {
        setNotifications(prev => [{
            id: Date.now(),
            time: 'Baru saja',
            isRead: false,
            ...notif
        }, ...prev]);
    };

    const showAlert = (message, title = 'Info', type = 'info') => {
        setGlobalAlert({ show: true, message, title, type });
    };

    const closeAlert = () => {
        setGlobalAlert({ ...globalAlert, show: false });
    };

    return (
        <AppContext.Provider value={{
            user, orders, login, logout: () => setUser(null), switchMode, // Added switchMode
            createOrder, payOrder, takeJob, finishJob, withdrawFunds,
            videos, addVideo, tutors, notifications, markAllRead, updateProfile, updateOrder,
            addNotification, globalAlert, showAlert, closeAlert // Export global alert
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
