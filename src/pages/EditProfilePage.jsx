import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Camera, Save } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

export default function EditProfilePage() {
    const { user, updateProfile } = useApp();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        university: user?.university || '',
        major: user?.major || '',
        subjects: user?.subjects?.join(', ') || '',
        photo: user?.photo || null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Prepare Subjects (Ensure Array)
            let finalSubjects = [];
            if (formData.subjects) {
                finalSubjects = typeof formData.subjects === 'string'
                    ? formData.subjects.split(',').map(s => s.trim()).filter(s => s)
                    : formData.subjects;
            }

            // 2. Prepare Data
            const updatedData = {
                ...formData,
                subjects: finalSubjects,
                photoURL: formData.photo, // Save as both for compatibility
                // Force activate mentoring if Tutor
                ...(user?.role === 'tutor' && {
                    isMentoringActive: true,
                    isTutor: true, // Explicit flag as requested
                    role: 'tutor' // Reinforce role
                })
            };

            // 3. Attempt Save
            await updateProfile(updatedData);
            setNotification({ show: true, type: 'success', message: 'Profil berhasil diperbarui!' });

        } catch (error) {
            console.error("Primary Save Failed:", error);

            // 4. Fallback: If Text too large or unknown error, try saving ONLY text data (skip photo)
            try {
                console.warn("Attempting text-only save...");
                const { photo, photoURL, ...textOnlyData } = formData;
                // Recalculate subjects for text-only
                const textSubjects = typeof formData.subjects === 'string'
                    ? formData.subjects.split(',').map(s => s.trim()).filter(s => s)
                    : formData.subjects;

                await updateProfile({
                    ...textOnlyData,
                    subjects: textSubjects,
                    ...(user?.role === 'tutor' && { isMentoringActive: true })
                });
                setNotification({ show: true, type: 'warning', message: 'Profil disimpan (Foto tidak berubah karena error).' });
            } catch (secondError) {
                console.error("Text-only Save Failed:", secondError);
                setNotification({ show: true, type: 'error', message: 'Gagal menyimpan profil. Coba lagi.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
        navigate('/profile');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold">Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto space-y-6 animate-in fade-in">

                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-sm">
                            <img
                                src={formData.photo || `https://ui-avatars.com/api/?name=${formData.name}&background=random`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button type="button" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors group-hover:scale-110">
                            <Camera className="w-4 h-4" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>


                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nomor HP</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Universitas</label>
                        <input
                            type="text"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Jurusan</label>
                        <input
                            type="text"
                            name="major"
                            value={formData.major}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Tutor Specific: Subjects */}
                    {user?.role === 'tutor' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Keahlian / Mata Kuliah (Pisahkan dengan koma)</label>
                            <input
                                type="text"
                                name="subjects"
                                placeholder="Contoh: Matematika, Fisika Dasar, Kalkulus"
                                value={formData.subjects}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Keahlian ini akan muncul di pencarian mahasiswa.</p>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {loading && <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>}
                        {loading ? 'Menyimpan...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Simpan Perubahan
                            </>
                        )}
                    </button>
                </div>
            </form>
            {/* Notification Modal */}
            <NotificationModal
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={handleCloseNotification}
            />
        </div>
    );
}
