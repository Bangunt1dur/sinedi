/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, getDocs, setDoc, increment, getDoc, runTransaction } from 'firebase/firestore';

const ADMIN_EMAILS = ["admin@sinedi.com", "tamaziddan@gmail.com"];

const AppContext = createContext();

export function AppProvider({ children }) {
    // User State - Managed via Firestore (fetch on login)
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('sinedi_user');
        return saved ? JSON.parse(saved) : null;
    });

    // Orders State - Live from Firestore
    const [orders, setOrders] = useState([]);

    // Mock Tutors removed. Fetching real tutors in components.

    // Mock Video Data (Static)
    const [videos, setVideos] = useState([
        { id: 1, title: 'Mastering Calculus 1', price: 50000, color: 'bg-red-500', category: 'Sains', tutorName: 'Dr. Math', url: 'https://youtube.com/mockvideo1' },
        { id: 2, title: 'Dasar Pemrograman Python', price: 75000, color: 'bg-blue-500', category: 'Programming', tutorName: 'Code Master', url: 'https://youtube.com/mockvideo2' },
        { id: 3, title: 'Belajar Akuntansi Dasar', price: 60000, color: 'bg-green-500', category: 'Ekonomi', tutorName: 'Econ Pro', url: 'https://youtube.com/mockvideo3' },
        { id: 4, title: 'Tips Public Speaking', price: 45000, color: 'bg-purple-500', category: 'Bahasa', tutorName: 'Talkative', url: 'https://youtube.com/mockvideo4' },
        { id: 5, title: 'Fisika Dasar: Newton', price: 55000, color: 'bg-red-400', category: 'Sains', tutorName: 'Newton Fan', url: 'https://youtube.com/mockvideo5' },
        { id: 6, title: 'UI/UX Design 101', price: 65000, color: 'bg-pink-500', category: 'Desain', tutorName: 'Creative Mind', url: 'https://youtube.com/mockvideo6' },
    ]);

    // Notifications State - Live from Firestore
    const [notifications, setNotifications] = useState([]);

    // Sync User Data from Firestore (Real-time Wallet & Profile)
    useEffect(() => {
        if (!user || !user.id) return;

        const userRef = doc(db, 'users', user.id);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Re-calc Admin Status on every sync (Robustness)
                const isAdmin = ADMIN_EMAILS.includes(data.email || data.username || data.name);

                setUser(prev => {
                    const newVal = { ...prev, ...data, id: docSnap.id, isAdmin };
                    // Persist to local storage to survive refresh
                    localStorage.setItem('sinedi_user', JSON.stringify(newVal));
                    return newVal;
                });
            }
        }, (error) => {
            console.error("Error syncing user profile:", error);
        });

        return () => unsubscribe();
    }, [user?.id]); // Only re-sub if ID changes

    // Sync Notifications from Firestore

    // Helper: Add Notification
    const addNotification = async (targetUserId, title, desc, type = 'info', link = null) => {
        try {
            await addDoc(collection(db, 'notifications'), {
                userId: targetUserId,
                title,
                desc,
                type,
                isRead: false,
                link,
                createdAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Failed to send notification:", err);
        }
    };

    // Helper: Mark as Read
    const markNotificationRead = async (id) => {
        try {
            const notifRef = doc(db, 'notifications', id);
            await updateDoc(notifRef, { isRead: true });
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

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

    // REAL-TIME STATS AGGREGATION
    // Calculate stats directly from 'orders' (Jobs Collection)
    const tutorStats = useMemo(() => {
        if (!user || user.role !== 'tutor') return {
            totalEarnings: 0,
            averageRating: 0,
            totalReviews: 0,
            reviewsList: [],
            historyList: []
        };

        // Filter finished jobs for this tutor
        const finishedJobs = orders.filter(o =>
            o.tutorId === user.id &&
            (o.status === 'done' || o.status === 'Done') // Check both for backward compatibility
        );

        // 1. Calculate Earnings
        const totalEarnings = finishedJobs.reduce((sum, job) => sum + (parseInt(job.price) || 0), 0);

        // 2. Extract Reviews
        const reviewsList = finishedJobs
            .filter(job => job.hasReviewed && job.review)
            .map(job => ({
                id: job.id,
                stars: job.review.stars,
                text: job.review.text,
                studentName: job.review.studentName || 'Mahasiswa', // Use saved name or fallback
                createdAt: job.review.createdAt,
                jobTitle: job.title
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 3. Calculate Ratings
        const totalReviews = reviewsList.length;
        const totalStars = reviewsList.reduce((sum, r) => sum + r.stars, 0);
        const averageRating = totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : 0;

        // 4. History List (Transaction History)
        const historyList = finishedJobs.map(job => ({
            id: job.id,
            title: job.title,
            date: job.createdAt, // Or completedAt if you have it
            amount: job.price || 0,
            status: job.status, // Dynamic status
            type: job.type,
            tutorId: job.tutorId
        })).sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
            totalEarnings,
            averageRating,
            totalReviews,
            reviewsList,
            historyList
        };

    }, [orders, user]);

    // Actions
    const login = async (username, role) => {
        try {
            const q = query(collection(db, 'users'), where("name", "==", username));
            const querySnapshot = await getDocs(q);

            let userData;
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const rawData = userDoc.data();
                userData = {
                    id: userDoc.id,
                    ...rawData,
                    isAdmin: ADMIN_EMAILS.includes(rawData.email || rawData.username) // Check whitelist
                };
            } else {
                // Register new user (Fallback if register not used)
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
            localStorage.setItem('sinedi_user', JSON.stringify(userData));
        } catch (err) {
            console.error("Login failed:", err);
            showAlert("Gagal login: " + err.message, "Error", "error");
        }
    };

    const register = async (name, username, password, role) => {
        try {
            // Check if username exists
            const q = query(collection(db, 'users'), where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                showAlert("Username sudah digunakan!", "Validasi", "error");
                return false;
            }

            const newUser = {
                name,
                username,
                role,
                wallet: role === 'tutor' ? 0 : 750000,
                createdAt: new Date().toISOString(),
                // Default fields for Tutor
                ...(role === 'tutor' && {
                    subjects: [],
                    price: 0,
                    schedule: [],
                    isVerified: false,
                    availability: { days: [], timeStart: '', timeEnd: '' },
                    rate: 0
                })
            };

            const colRef = collection(db, 'users');
            const docRef = await addDoc(colRef, newUser);

            // Login immediately
            setUser({ id: docRef.id, ...newUser });
            localStorage.setItem('sinedi_user', JSON.stringify({ id: docRef.id, ...newUser }));
            return true;
        } catch (err) {
            console.error("Registration failed:", err);
            showAlert("Gagal daftar: " + err.message, "Error", "error");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sinedi_user');
    };

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
            ...orderData,
            tutorId: orderData.tutorId || null, // Explicitly persist Tutor ID
            studentId: user?.id, // Ensure Student ID is always captured
            studentName: user?.name || 'Mahasiswa', // For Chat Context
            price: parseInt(orderData.price) || 0 // Ensure price is Number
        };

        // Async write (fire & forget)
        setDoc(newOrderRef, newOrder)
            .then(() => {
                // 1. AUTO-INCREMENT WALLET If Status is Done (e.g. Video Buy)
                // This ensures "Saldo bertambah detik itu juga"
                if ((newOrder.status === 'done' || newOrder.status === 'Done') && newOrder.tutorId) {
                    const tutorRef = doc(db, 'users', newOrder.tutorId);
                    updateDoc(tutorRef, {
                        wallet: increment(newOrder.price || 0)
                    }).catch(e => console.error("Auto-wallet update failed:", e));
                }

                // 2. Send notification
                if (orderData.tutorId) {
                    addNotification(
                        orderData.tutorId,
                        newOrder.type === 'video_buy' ? 'Video Terjual!' : 'Permintaan Mentoring Baru',
                        newOrder.type === 'video_buy' ? `Seseorang membeli video: ${orderData.title}` : `Ada request masuk: ${orderData.title}`,
                        'success',
                        newOrder.type === 'video_buy' ? '/wallet' : `/order/${newOrderRef.id}`
                    );
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
            if (order.type === 'video' || order.type === 'video_buy') {
                await updateDoc(orderRef, {
                    status: 'done', // changed to lowercase done
                    result: { type: 'link', name: 'Tonton Video', url: order.videoUrl || 'https://youtube.com' }
                });
            } else {
                await updateDoc(orderRef, { status: 'Queue' });
            }
        } catch (err) {
            console.error("Pay order failed:", err);
        }
    };

    const submitReview = async (jobId, reviewData) => {
        try {
            // Validation Removed: Ulasan is optional

            // 1. Update Job
            const jobRef = doc(db, 'jobs', jobId);
            const jobSnap = await getDoc(jobRef);
            if (!jobSnap.exists()) return;
            const job = jobSnap.data();

            await updateDoc(jobRef, {
                review: {
                    stars: reviewData.stars,
                    text: reviewData.text,
                    studentName: user.name || 'Mahasiswa', // Save current user name
                    createdAt: new Date().toISOString()
                },
                hasReviewed: true
                // status: 'done' removed to prevent overwriting existing valid status
            });

            // 2. Update Tutor Rating & Save to Sub-collection
            // 2. Update Tutor Rating & Save to Sub-collection
            if (job.tutorId) {
                const tutorRef = doc(db, 'users', job.tutorId);

                // A. Save to Sub-collection 'reviews'
                try {
                    const reviewsCol = collection(db, 'users', job.tutorId, 'reviews');
                    await addDoc(reviewsCol, {
                        stars: reviewData.stars,
                        text: reviewData.text,
                        rating: reviewData.stars, // Requested field
                        comment: reviewData.text, // Requested field
                        studentName: user.name || 'Mahasiswa',
                        createdAt: new Date().toISOString(),
                        jobId: jobId,
                        jobTitle: job.title || 'Pekerjaan'
                    });
                } catch (e) {
                    console.error("Failed to save review to sub-collection", e);
                }

                // B. Update Aggregate Data on Tutor Doc
                try {
                    const tutorSnap = await getDoc(tutorRef);
                    if (tutorSnap.exists()) {
                        const tutorData = tutorSnap.data();
                        const currentReviews = tutorData.reviews || [];
                        const newReviews = [...currentReviews, { stars: reviewData.stars, text: reviewData.text }];

                        // Calc average
                        const sum = newReviews.reduce((a, b) => a + b.stars, 0);
                        const avg = (sum / newReviews.length).toFixed(1);

                        await updateDoc(tutorRef, {
                            reviews: newReviews,
                            rating: avg,
                            totalRating: avg,
                            averageRating: avg, // Requested field
                            ratingCount: newReviews.length,
                            reviewCount: newReviews.length
                        });
                    }
                } catch (e) {
                    console.error("Failed to update tutor aggregate rating", e);
                }
            }

            // 3. Notify Tutor
            if (job.tutorId) {
                addNotification(job.tutorId, "Ulasan Baru!", `Kamu dapat ${reviewData.stars} bintang dari student.`, 'success');
            }

        } catch (err) {
            console.error("Submit review failed:", err);
        }
    };

    const takeJob = async (orderId) => {
        const activeJobs = orders.filter(o => o.status === 'process' && o.tutorName === user.name).length;
        if (activeJobs >= 3) {
            showAlert('Batas maksimal 3 pekerjaan sekaligus!', 'Batas Tercapai', 'error');
            return;
        }

        const orderRef = doc(db, 'jobs', orderId);
        await updateDoc(orderRef, {
            status: 'In Progress',
            tutorName: user.name,
            tutorId: user.id // FIX: Assign Tutor ID explicitly
        });
    };

    const finishJob = async (orderId, resultData = null) => {
        try {
            const orderRef = doc(db, 'jobs', orderId);
            const orderSnap = await getDoc(orderRef);
            if (!orderSnap.exists()) return;
            const order = orderSnap.data();

            // SELF-HEALING: If tutorId is missing but I am the tutor finishing it, claim it.
            const effectiveTutorId = order.tutorId || (user?.role === 'tutor' ? user.id : null);

            await updateDoc(orderRef, {
                status: 'done', // Completed status (lowercase standard)
                result: resultData,
                tutorId: effectiveTutorId // Save it for future (Reviews etc.)
            });

            // Increment Tutor Wallet
            if (effectiveTutorId) {
                const price = parseInt(order.price) || 0;
                const tutorRef = doc(db, 'users', effectiveTutorId);
                await updateDoc(tutorRef, {
                    wallet: increment(price)
                });
            }
        } catch (err) {
            console.error("Finish job failed:", err);
        }
    };

    // SYSTEM UTILITY: Recalculate Wallet Balance from Transaction History
    const recalculateWallet = async () => {
        if (!user || !user.id || user.role !== 'tutor') return;

        try {
            // 1. Get all jobs related to me
            // We use the existing 'orders' state which is live
            const myJobs = orders.filter(o => o.tutorId === user.id);

            let income = 0;
            let expense = 0;

            myJobs.forEach(job => {
                const price = parseInt(job.price) || 0;

                // A. Income (Tasks, Mentoring, Video Sales)
                if (job.type !== 'withdraw' && ['done', 'Done', 'completed', 'success'].includes(job.status)) {
                    income += price;
                }

                // B. Withdrawals (Money leaving the wallet)
                // Even 'process' withdrawals are deducted immediately.
                if (job.type === 'withdraw') {
                    expense += price;
                }
            });

            const realBalance = income - expense;
            console.log("Recalculating Wallet:", { income, expense, realBalance });

            // Update Database
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { wallet: realBalance });

            showAlert(`Saldo berhasil disinkronkan: Rp ${realBalance.toLocaleString()}`, 'Sukses', 'success');

        } catch (err) {
            console.error("Recalculate failed:", err);
            showAlert("Gagal sinkronisasi saldo", "Error", "error");
        }
    };

    const withdrawFunds = async (amount, bankDetails) => {
        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', user.id);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) throw "User does not exist!";

                const userData = userDoc.data();
                const currentWallet = Number(userData.wallet) || 0; // Force Number

                if (currentWallet < amount) {
                    throw `Saldo tidak mencukupi! (Saldo Server: ${currentWallet.toLocaleString()})`;
                }

                // 1. Deduct Balance
                const newWallet = currentWallet - amount;
                transaction.update(userRef, { wallet: newWallet });

                // 2. Create Withdrawal Activity (Job)
                const newJobRef = doc(collection(db, 'jobs'));
                transaction.set(newJobRef, {
                    type: 'withdraw',
                    title: 'Penarikan Dana',
                    status: 'process',
                    price: parseInt(amount),
                    tutorId: user.id,
                    tutorName: user.name,
                    studentName: 'Sistem',
                    createdAt: new Date().toISOString(),
                    bankDetails: bankDetails,
                    desc: `Penarikan ke ${bankDetails.bank} - ${bankDetails.accountNumber} a.n ${bankDetails.accountName}`
                });

                // 3. Log Transaction
                const newTxRef = doc(collection(db, 'transactions'));
                transaction.set(newTxRef, {
                    userId: user.id,
                    title: 'Penarikan Dana',
                    amount: -parseInt(amount),
                    type: 'withdraw',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    refId: newJobRef.id
                });
            });

            // Update local state optimizingly (though listener would catch it)
            setUser(prev => ({ ...prev, wallet: prev.wallet - amount }));
            return true;

        } catch (e) {
            console.error("Withdraw Transaction Failed:", e);
            showAlert(typeof e === 'string' ? e : "Gagal memproses penarikan", "Error", "error");
            return false;
        }
    };

    const updateProfile = async (updatedData) => {
        if (!user || !user.id) return;
        const userRef = doc(db, 'users', user.id);

        const newData = {
            ...updatedData,
            availability: { ...(user.availability || {}), ...(updatedData.availability || {}) },
            tutorProfile: { ...(user.tutorProfile || {}), ...(updatedData.tutorProfile || {}) }
        };

        // FIX: Use setDoc with merge to create doc if missing (solves "No document to update")
        await setDoc(userRef, newData, { merge: true });
        setUser(prev => {
            const updated = { ...prev, ...newData };
            localStorage.setItem('sinedi_user', JSON.stringify(updated));
            return updated;
        });
    };

    const addVideo = async (videoData) => {
        try {
            await addDoc(collection(db, 'videos'), {
                ...videoData,
                createdAt: new Date().toISOString(),
                tutorId: user.id, // Track uploader
                authorId: user.id, // Added for redundancy/search
                tutorName: user.name
            });
            // No need to setVideos manually if we listen to it, 
            // but currently we don't have a listener for 'videos' in AppContext (only 'jobs').
            // The VideoPage will implement its own listener or we can add one here.
            // For now, let's keep the local update as optimistic UI or just let the component fetch.
            // But wait, VideoPage is requested to use useEffect to fetch.
            // So we can just save here.
        } catch (err) {
            console.error("Failed to add video:", err);
            showAlert("Gagal upload video", "Error", "error");
        }
    };

    // Old helpers removed in favor of Firestore versions

    const showAlert = (message, title = 'Info', type = 'info') => {
        setGlobalAlert({ show: true, message, title, type });
    };

    const closeAlert = () => {
        setGlobalAlert({ ...globalAlert, show: false });
    };

    return (
        <AppContext.Provider value={{
            user, orders, login, register, logout, switchMode,
            createOrder, payOrder, takeJob, finishJob, withdrawFunds,
            videos, addVideo, notifications, updateProfile, updateOrder,
            addNotification, markNotificationRead, globalAlert, showAlert, closeAlert,
            submitReview, tutorStats, recalculateWallet
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
