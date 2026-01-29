import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle, ChevronRight, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { addDays, format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import "react-datepicker/dist/react-datepicker.css";

export default function OrderPage() {
    const { createOrder, showAlert } = useApp();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Steps: 1 = Detail, 2 = Upload, 3 = Waktu
    const [step, setStep] = useState(1);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [price, setPrice] = useState(0);

    // Quick Date Chips
    const quickDates = [
        { label: 'Besok', value: addDays(new Date(), 1) },
        { label: '3 Hari', value: addDays(new Date(), 3) },
        { label: '1 Minggu', value: addDays(new Date(), 7) },
        { label: '2 Minggu', value: addDays(new Date(), 14) },
    ];

    // Logic: Auto Calc Price
    useEffect(() => {
        let basePrice = 50000;
        if (difficulty === 'hard') basePrice += 50000;
        if (difficulty === 'easy') basePrice -= 20000;

        if (selectedDate) {
            const daysDiff = differenceInDays(selectedDate, new Date());
            if (daysDiff <= 1) basePrice += 50000; // Urgent
            else if (daysDiff <= 3) basePrice += 20000;
        }
        setPrice(basePrice);
    }, [difficulty, selectedDate]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!title) return showAlert('Mohon isi judul tugas!', 'Perhatian', 'error');
            setStep(2);
        } else if (step === 2) {
            // Upload is optional or mocked, so just proceed
            setStep(3);
        } else if (step === 3) {
            if (!selectedDate) return showAlert('Pilih deadline tugas!', 'Perhatian', 'error');
            // Submit
            const orderId = createOrder({
                title,
                type: 'joki', // Fix: Explicitly set type
                desc: description,
                deadline: format(selectedDate, 'dd MMMM yyyy', { locale: idLocale }),
                difficulty,
                price,
                fileName: selectedFile ? selectedFile.name : 'No file',
                fileSize: selectedFile ? '2MB' : '' // Mock
            });
            navigate(`/payment/${orderId}`);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate(-1);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
            <div className="p-6 max-w-xl mx-auto animate-in slide-in-from-bottom-5 duration-500">

                {/* Header Steps */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Buat Pesanan Tugas</h1>
                    <div className="w-5"></div> {/* Spacer */}
                </div>

                {/* Stepper Progress */}
                <div className="flex justify-center gap-2 mb-8">
                    {['Detail', 'Upload', 'Waktu'].map((label, idx) => {
                        const stepNum = idx + 1;
                        const isActive = step === stepNum;
                        const isDone = step > stepNum;
                        return (
                            <div key={label} className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold ${isActive ? 'bg-yellow-400 text-slate-900' : isDone ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-500'}`}>
                                {stepNum}. {label}
                            </div>
                        )
                    })}
                </div>

                {/* STEP 1: Details */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Tugas</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                                placeholder="Contoh: Makalah Sejarah Indonesia"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tingkat Kesulitan</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'easy', label: 'Mudah' },
                                    { id: 'medium', label: 'Sedang' },
                                    { id: 'hard', label: 'Sulit' }
                                ].map(lvl => (
                                    <button
                                        key={lvl.id}
                                        onClick={() => setDifficulty(lvl.id)}
                                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${difficulty === lvl.id ? 'bg-white border-yellow-400 text-slate-900 shadow-sm ring-1 ring-yellow-400' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {lvl.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Detail</label>
                            <textarea
                                className="w-full bg-white border border-slate-200 rounded-xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium resize-none"
                                placeholder="Jelaskan kebutuhan tugas..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: Upload */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center">
                            <h3 className="font-bold text-lg mb-2">Upload Bahan Materi</h3>
                            <p className="text-sm text-slate-500">Opsional, upload soal atau referensi jika ada.</p>
                        </div>

                        <div
                            onClick={() => fileInputRef.current.click()}
                            className={`border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center transition-all cursor-pointer bg-white group ${selectedFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-yellow-400 hover:bg-yellow-50'}`}
                        >
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            {selectedFile ? (
                                <>
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold text-slate-900">{selectedFile.name}</p>
                                    <p className="text-xs text-green-600 mt-1">Siap diupload</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold text-slate-900">Click or Drag file here</p>
                                    <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG (Max 10MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: Waktu */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-4">Pilih Deadline Cepat</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {quickDates.map((q, idx) => {
                                    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(q.value, 'yyyy-MM-dd');
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDate(q.value)}
                                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${isSelected ? 'bg-yellow-400 border-yellow-400 text-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {q.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-900 mb-1">Pilih Tanggal Manual</label>
                                <div className="relative z-50">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={date => setSelectedDate(date)}
                                        placeholderText="dd/mm/yyyy"
                                        className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
                                        dateFormat="dd/MM/yyyy"
                                        minDate={new Date()}
                                        locale={idLocale}
                                        popperClassName="z-50"
                                        portalId="root"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl">
                            <span className="text-sm font-medium text-slate-600">Estimasi Harga</span>
                            <span className="text-2xl font-bold text-slate-900">Rp {price.toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                    <div className="max-w-xl mx-auto flex gap-4">
                        {step > 1 && (
                            <button onClick={handleBack} className="flex-1 py-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                Kembali
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            {step === 3 ? 'Lanjut Bayar' : 'Lanjut'}
                            {step < 3 && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
