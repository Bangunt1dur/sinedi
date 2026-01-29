/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, getDocs, setDoc } from 'firebase/firestore';

const AppContext = createContext();

export function AppProvider({ children }) {
    // User State - Managed via Firestore (fetch on login)
    // Removed localStorage logic as requested.
    const [user, setUser] = useState(null);

    // Orders State - Live from Firestore
    const [orders, setOrders] = useState([]);

    // Mock Tutors Data (Static for now)
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

    // Mock Video Data (Static)
    const [videos, setVideos] = useState([
        { id: 1, title: 'Mastering Calculus 1', price: 50000, color: 'bg-red-500', category: 'Sains', tutorName: 'Dr. Math', url: 'https://youtube.com/mockvideo1' },
        { id: 2, title: 'Dasar Pemrograman Python', price: 75000, color: 'bg-blue-500', category: 'Programming', tutorName: 'Code Master', url: 'https://youtube.com/mockvideo2' },
        { id: 3, title: 'Belajar Akuntansi Dasar', price: 60000, color: 'bg-green-500', category: 'Ekonomi', tutorName: 'Econ Pro', url: 'https://youtube.com/mockvideo3' },
        { id: 4, title: 'Tips Public Speaking', price: 45000, color: 'bg-purple-500', category: 'Bahasa', tutorName: 'Talkative', url: 'https://youtube.com/mockvideo4' },
        { id: 5, title: 'Fisika Dasar: Newton', price: 55000, color: 'bg-red-400', category: 'Sains', tutorName: 'Newton Fan', url: 'https://youtube.com/mockvideo5' },
        { id: 6, title: 'UI/UX Design 101', price: 65000, color: 'bg-pink-500', category: 'Desain', tutorName: 'Creative Mind', url: 'https://youtube.com/mockvideo6' },
    ]);

    // Notifications (Local)
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Pembayaran Berhasil', desc: 'Pembayaran terkonfirmasi.', type: 'success', time: 'Baru saja', isRead: false },
        { id: 2, title: 'Tutor Menemukanmu!', desc: 'Kak Andi mengambil tugasmu.', type: 'info', time: '5m lalu', isRead: false },
        { id: 3, title: 'Diskon Spesial!', desc: 'Potongan 20% untuk order hari ini.', type: 'promo', time: '1j lalu', isRead: true },
    ]);

    // Global Alert State
    const [globalAlert, setGlobalAlert] = useState({ show: false, type: 'info', title: '', message: '' });

    // Sync Orders from Firestore ('jobs' collection)
    useEffect(() => {
        const q = collection(db, 'jobs');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by createdAt descending
            setOrders(jobsData.sort((a, b) => b.createdAt?.localeCompare(a.createdAt) || 0));
        }, (error) => {
            console.error("Error connecting to Firebase:", error);
        });

        return () => unsubscribe();
    }, []);

    // Actions
    const login = async (username, role) => {
        try {
            const q = query(collection(db, 'users'), where("name", "==", username));
            const querySnapshot = await getDocs(q);

            let userData;
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                userData = { id: userDoc.id, ...userDoc.data() };
            } else {
                // Register new user
                const newUser = {
                    name: username,
                    role: role,
                    wallet: role === 'tutor' ? 2500000 : 750000,
                    availability: { days: ['Senin', 'Rabu', 'Jumat'], timeStart: '09:00', timeEnd: '17:00' },
                    createdAt: new Date().toISOString()
                };
                const colRef = collection(db, 'users');
                const docRef = await addDoc(colRef, newUser);
                userData = { id: docRef.id, ...newUser };
            }
            setUser(userData);
        } catch (err) {
            console.error("Login failed:", err);
            showAlert("Gagal login: " + err.message, "Error", "error");
        }
    };

    const logout = () => setUser(null);

    const switchMode = () => {
        if (!user) return;
        const newRole = user.role === 'student' ? 'tutor' : 'student';
        const newName = user.role === 'student' ? 'Nedi Suryadi' : 'Budi Santoso';
        login(newName, newRole);
    };

    const createOrder = (orderData) => {
        // Generate ID synchronously
        const newOrderRef = doc(collection(db, 'jobs'));
        const newOrder = {
            id: newOrderRef.id,
            status: 'Unpaid',
            createdAt: new Date().toISOString(),
            ...orderData
        };

        // Async write (fire & forget)
        setDoc(newOrderRef, newOrder)
            .then(() => {
                // Send notification for mentoring
                if (orderData.tutorName) {
                    addNotification({
                        title: 'Permintaan Mentoring Baru',
                        desc: `Ada request masuk: ${orderData.title}`,
                        type: 'info'
                    });
                }
            })
            .catch(err => console.error("Create order failed:", err));

        return newOrderRef.id;
    };

    const updateOrder = async (orderId, data) => {
        try {
            const orderRef = doc(db, 'jobs', orderId);
            await updateDoc(orderRef, data);
        } catch (err) {
            console.error("Update order failed:", err);
        }
    };

    const payOrder = async (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const orderRef = doc(db, 'jobs', orderId);
        try {
            if (order.type === 'video') {
                await updateDoc(orderRef, {
                    status: 'Done',
                    result: { type: 'link', name: 'Tonton Video', url: order.videoUrl || 'https://youtube.com' }
                });
            } else {
                await updateDoc(orderRef, { status: 'Queue' });
            }
        } catch (err) {
            console.error("Pay order failed:", err);
        }
    };

    const takeJob = async (orderId) => {
        const activeJobs = orders.filter(o => o.status === 'In Progress' && o.tutorName === user.name).length;
        if (activeJobs >= 3) {
            showAlert('Batas maksimal 3 pekerjaan sekaligus!', 'Batas Tercapai', 'error');
            return;
        }

        const orderRef = doc(db, 'jobs', orderId);
        await updateDoc(orderRef, { status: 'In Progress', tutorName: user.name });
    };

    const finishJob = async (orderId, result = null) => {
        const orderRef = doc(db, 'jobs', orderId);
        const order = orders.find(o => o.id === orderId);

        await updateDoc(orderRef, { status: 'Done', result });

        if (user && user.id && order) {
            const userRef = doc(db, 'users', user.id);
            const newWallet = (user.wallet || 0) + order.price;
            await updateDoc(userRef, { wallet: newWallet });
            setUser(prev => ({ ...prev, wallet: newWallet }));
        }
    };

    const withdrawFunds = async (amount) => {
        if (user.wallet >= amount) {
            const userRef = doc(db, 'users', user.id);
            const newWallet = user.wallet - amount;
            await updateDoc(userRef, { wallet: newWallet });
            setUser(prev => ({ ...prev, wallet: newWallet }));
            return true;
        }
        return false;
    };

    const updateProfile = async (updatedData) => {
        if (!user || !user.id) return;
        const userRef = doc(db, 'users', user.id);

        const newData = {
            ...updatedData,
            availability: { ...(user.availability || {}), ...(updatedData.availability || {}) },
            tutorProfile: { ...(user.tutorProfile || {}), ...(updatedData.tutorProfile || {}) }
        };

        await updateDoc(userRef, newData);
        setUser(prev => ({ ...prev, ...newData }));
    };

    const addVideo = (videoData) => {
        const newVideo = { id: Date.now(), color: 'bg-indigo-500', ...videoData };
        setVideos([newVideo, ...videos]);
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
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
            user, orders, login, logout, switchMode,
            createOrder, payOrder, takeJob, finishJob, withdrawFunds,
            videos, addVideo, tutors, notifications, markAllRead, updateProfile, updateOrder,
            addNotification, globalAlert, showAlert, closeAlert
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
