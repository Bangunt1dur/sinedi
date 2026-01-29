import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Star, MapPin, CheckCircle, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationModal from '../components/NotificationModal';

export default function MentoringPage() {
    const { createOrder, tutors } = useApp(); // Use global tutors
    const navigate = useNavigate();

    // Booking State

    // Booking State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingType, setBookingType] = useState('private'); // 'private' | 'group'
    const [participants, setParticipants] = useState(2); // Min 2 for group
    const [selectedSlots, setSelectedSlots] = useState([]); // Array of strings
    const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });
    const [createdOrderId, setCreatedOrderId] = useState(null);

    const handleSlotToggle = (slot) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter(s => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const confirmBooking = () => {
        if (selectedSlots.length === 0) {
            setNotification({ show: true, type: 'error', message: 'Pilih minimal satu sesi jadwal!' });
            return;
        }

        const sessions = selectedSlots.length;
        const totalBasePrice = selectedTutor.price * sessions;
        const finalPrice = bookingType === 'group' ? Math.ceil(totalBasePrice / participants) : totalBasePrice;

        const title = `Mentoring ${selectedTutor.name} (${bookingType === 'group' ? 'Kelompok' : 'Private'}) - ${sessions} Sesi`;

        // Sort slots chronologically
        const sortedSlots = [...selectedSlots].sort();
        const details = bookingType === 'group'
            ? `${participants} Orang. Jadwal: ${sortedSlots.join(', ')}`
            : `Private Session. Jadwal: ${sortedSlots.join(', ')}`;

        const orderId = createOrder({
            title,
            type: 'mentoring',
            deadline: sortedSlots[0], // Use first slot as primary deadline/date
            difficulty: 'mentor',
            price: finalPrice,
            details: details,
            tutorName: selectedTutor.name // ALERT: Ensure strict tutor assignment
        });

        // Construct full job object for immediate navigation state
        const jobData = {
            id: orderId,
            title,
            type: 'mentoring',
            deadline: sortedSlots[0],
            difficulty: 'mentor',
            price: finalPrice,
            details: details,
            tutorName: selectedTutor.name,
            status: 'Unpaid', // Default status from createOrder
            createdAt: new Date().toISOString()
        };

        setShowBookingModal(false);
        // Direct navigation to remove friction and avoid "stuck" feeling
        // Pass job data in state to avoid Firestore latency on next page
        navigate(`/payment/${orderId}`, { state: { job: jobData } });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
    };

    const handleBooking = () => {
        confirmBooking();
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in pb-24">
            <h1 className="text-2xl font-bold text-slate-900">Mentoring Privat</h1>
            <p className="text-slate-500 text-sm">Booking sesi 1-on-1 dengan mentor pilihan.</p>

            <div className="space-y-4">
                {tutors.map(tutor => (
                    <div key={tutor.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-yellow-400 transition-all">
                        <div className={`w-14 h-14 rounded-full ${tutor.color} flex items-center justify-center text-slate-700 font-bold text-xl`}>
                            {tutor.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{tutor.name}</h3>
                            <p className="text-xs text-slate-500">{tutor.skill}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <span className="text-xs font-bold text-slate-700">{tutor.rate}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-900">Rp {tutor.price.toLocaleString()}/sesi</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setSelectedTutor(tutor); setBookingType('private'); setSelectedSlots([]); }}
                            className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-yellow-500 transition-colors"
                        >
                            Booking
                        </button>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {/* Booking Modal */}
            {selectedTutor && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 overflow-hidden">

                        {/* Decorative Header Background - Absolute */}
                        <div className={`absolute top-0 left-0 right-0 h-24 ${selectedTutor.color} opacity-30 pointer-events-none`}></div>

                        {/* Header Section (Sticky Top) */}
                        <div className="relative z-10 px-6 pt-6 pb-2 shrink-0">
                            <div className="flex justify-between items-start">
                                <div className="mt-2">
                                    <div className={`w-14 h-14 rounded-full bg-white p-1 shadow-sm mb-3`}>
                                        <div className={`w-full h-full rounded-full ${selectedTutor.color} flex items-center justify-center text-slate-700 font-bold text-xl`}>
                                            {selectedTutor.name.charAt(0)}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg">{selectedTutor.name}</h3>
                                    <p className="text-xs text-slate-500">{selectedTutor.skill}</p>
                                </div>
                                <button onClick={() => setSelectedTutor(null)} className="bg-white p-2 rounded-full hover:bg-slate-100 shadow-sm transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 pt-2">
                            {/* Booking Type */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Tipe Kelas</label>
                                <div className="flex p-1 bg-slate-100 rounded-xl">
                                    <button
                                        onClick={() => setBookingType('private')}
                                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${bookingType === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Private
                                    </button>
                                    <button
                                        onClick={() => setBookingType('group')}
                                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${bookingType === 'group' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Kelompok (Patungan)
                                    </button>
                                </div>
                            </div>

                            {/* Group Logic */}
                            {bookingType === 'group' && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-blue-900 mb-2 block flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Jumlah Peserta
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range" min="2" max="5"
                                            value={participants}
                                            onChange={(e) => setParticipants(parseInt(e.target.value))}
                                            className="flex-1 accent-blue-600 cursor-pointer"
                                        />
                                        <span className="font-bold text-blue-900 w-8 text-center">{participants}</span>
                                    </div>
                                </div>
                            )}

                            {/* Schedule Slot */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2 justify-between">
                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Pilih Jadwal</span>
                                    <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Bisa pilih {'>'}1</span>
                                </label>

                                {/* Dynamic Slot Generation */}
                                <div className="grid grid-cols-2 gap-2">
                                    {(() => {
                                        const slots = [];
                                        const { days, timeStart, timeEnd } = selectedTutor.availability || { days: [], timeStart: '09:00', timeEnd: '17:00' };
                                        const startHour = parseInt(timeStart.split(':')[0]);
                                        const endHour = parseInt(timeEnd.split(':')[0]);

                                        days.forEach(day => {
                                            for (let h = startHour; h < endHour; h++) {
                                                const timeString = `${h}:00`;
                                                const fullSlot = `${day}, ${timeString}`;
                                                const isSelected = selectedSlots.includes(fullSlot);

                                                slots.push(
                                                    <button
                                                        key={fullSlot}
                                                        onClick={() => handleSlotToggle(fullSlot)}
                                                        className={`px-3 py-3 rounded-xl text-[11px] font-bold border transition-all text-center flex items-center justify-center gap-2
                                                            ${isSelected
                                                                ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-[1.02]'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-yellow-400 hover:bg-yellow-50'
                                                            }`}
                                                    >
                                                        {fullSlot}
                                                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                                    </button>
                                                );
                                            }
                                        });
                                        return slots.length > 0 ? slots : <p className="text-xs text-slate-400 col-span-2 text-center py-4">Tutor tidak memiliki jadwal tersedia.</p>;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Footer Section (Sticky Bottom) */}
                        <div className="p-6 pt-4 border-t border-slate-100 bg-white shrink-0">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Total Harga ({selectedSlots.length} Sesi)</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        Rp {(() => {
                                            const total = selectedTutor.price * (selectedSlots.length || 0);
                                            return bookingType === 'group' ? Math.ceil(total / participants).toLocaleString() : total.toLocaleString();
                                        })()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleBooking}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Booking Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
