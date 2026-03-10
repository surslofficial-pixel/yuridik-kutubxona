import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, CircleUser, GraduationCap, BookOpen, Info, ArrowRight, ArrowLeft, MapPin, Briefcase, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/context/BookContext";

interface ReaderModalProps {
    bookId: string | number;
    onClose: () => void;
}

export function ReaderModal({ bookId, onClose }: ReaderModalProps) {
    const navigate = useNavigate();
    const { addReadingSession } = useBooks();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [selectedBosqich, setSelectedBosqich] = useState("");
    const [selectedGuruh, setSelectedGuruh] = useState("");

    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestFirstName, setGuestFirstName] = useState("");
    const [guestLastName, setGuestLastName] = useState("");
    const [guestType, setGuestType] = useState<"hodim" | "tashqi">("hodim");
    const [guestOrigin, setGuestOrigin] = useState("");

    const confirmStudentRead = () => {
        if (!firstName || !lastName || !selectedBosqich || !selectedGuruh) return;

        let finalGuruh = selectedGuruh.replace(/\D/g, '');
        if (finalGuruh.length > 1) {
            finalGuruh = finalGuruh.slice(0, 1) + '-' + finalGuruh.slice(1, 4);
        } else {
            finalGuruh = selectedGuruh;
        }
        const groupName = `${selectedBosqich}-bosqich, ${finalGuruh} guruh`;

        addReadingSession({ firstName, lastName, groupName, bookId });
        sessionStorage.setItem('currentReader', JSON.stringify({ firstName, lastName, groupName }));
        onClose();
        navigate(`/reader/${bookId}`);
    };

    const confirmGuestRead = () => {
        if (!guestFirstName || !guestLastName || !guestOrigin) return;

        const groupName = guestType === "hodim"
            ? `Hodim — ${guestOrigin}`
            : `Mehmon — ${guestOrigin}`;

        addReadingSession({ firstName: guestFirstName, lastName: guestLastName, groupName, bookId });
        sessionStorage.setItem('currentReader', JSON.stringify({ firstName: guestFirstName, lastName: guestLastName, groupName }));
        onClose();
        navigate(`/reader/${bookId}`);
    };

    const openGuestForm = () => {
        setGuestFirstName("");
        setGuestLastName("");
        setGuestType("hodim");
        setGuestOrigin("");
        setShowGuestForm(true);
    };

    const inputClass = "w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-base sm:text-sm";
    const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400";
    const filterLetters = (val: string) => val.replace(/[^a-zA-ZáóúiñÁÓÚIÑo'O'g'G'shShchCh\s'-]/g, '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <AnimatePresence mode="wait">
                {!showGuestForm ? (
                    <motion.div
                        key="student"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
                    >
                        <form onSubmit={(e) => { e.preventDefault(); confirmStudentRead(); }} className="flex flex-col overflow-hidden max-h-full">
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Ma'lumotlaringizni kiriting</h2>
                                <button
                                    onClick={openGuestForm}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all text-sm font-medium"
                                    title="Mehmon yoki hodim sifatida kirish"
                                >
                                    <span className="hidden sm:inline text-xs">Mehmon/Hodim</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                                <p className="text-sm text-slate-500">Kitobni o'qishni boshlashdan oldin, iltimos ma'lumotlaringizni kiriting.</p>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-xs sm:text-sm text-blue-700">
                                        Texnikum o'quvchisi bo'lmasangiz yoki hodim bo'lsangiz, yuqoridagi <strong>➡️</strong> tugmasini bosing.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Ism <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <User className={iconClass} />
                                            <input type="text" value={firstName} onChange={(e) => setFirstName(filterLetters(e.target.value))} className={inputClass} placeholder="Masalan: Sardor" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Familiya <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <CircleUser className={iconClass} />
                                            <input type="text" value={lastName} onChange={(e) => setLastName(filterLetters(e.target.value))} className={inputClass} placeholder="Masalan: Ahmedov" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Bosqich <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <GraduationCap className={iconClass} />
                                                <select value={selectedBosqich} onChange={(e) => setSelectedBosqich(e.target.value)} className={`${inputClass} bg-white appearance-none`}>
                                                    <option value="">Tanlang</option>
                                                    {[1, 2].map((b) => (
                                                        <option key={b} value={b}>{b}-bosqich</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Guruh <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <BookOpen className={iconClass} />
                                                <input
                                                    type="tel"
                                                    maxLength={5}
                                                    value={selectedGuruh}
                                                    onChange={(e) => setSelectedGuruh(e.target.value.replace(/[^\d-]/g, ''))}
                                                    onBlur={() => {
                                                        let val = selectedGuruh.replace(/\D/g, '');
                                                        if (val.length > 1) {
                                                            setSelectedGuruh(val.slice(0, 1) + '-' + val.slice(1, 4));
                                                        }
                                                    }}
                                                    className={inputClass}
                                                    placeholder="0-25"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                                <Button type="button" variant="outline" onClick={onClose} className="rounded-full">
                                    Bekor qilish
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!firstName || !lastName || !selectedBosqich || !selectedGuruh}
                                    className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-full text-white px-6 sm:px-8 h-11"
                                >
                                    O'qishni boshlash
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="guest"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
                    >
                        <form onSubmit={(e) => { e.preventDefault(); confirmGuestRead(); }} className="flex flex-col overflow-hidden max-h-full">
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                                <button
                                    onClick={() => setShowGuestForm(false)}
                                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="text-sm">Orqaga</span>
                                </button>
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Mehmon / Hodim</h2>
                            </div>
                            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                                <p className="text-sm text-slate-500">Ism, familiya va kimligingizni kiriting. Barcha maydonlar majburiy.</p>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Ism <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <User className={iconClass} />
                                            <input type="text" value={guestFirstName} onChange={(e) => setGuestFirstName(filterLetters(e.target.value))} className={inputClass} placeholder="Masalan: Sardor" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Familiya <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <CircleUser className={iconClass} />
                                            <input type="text" value={guestLastName} onChange={(e) => setGuestLastName(filterLetters(e.target.value))} className={inputClass} placeholder="Masalan: Ahmedov" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Kim siz? <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setGuestType("hodim"); setGuestOrigin(""); }}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${guestType === "hodim"
                                                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                    }`}
                                            >
                                                <Briefcase className="h-4 w-4" />
                                                Hodim
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setGuestType("tashqi"); setGuestOrigin(""); }}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${guestType === "tashqi"
                                                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                    }`}
                                            >
                                                <MapPin className="h-4 w-4" />
                                                Tashqi mehmon
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            {guestType === "hodim" ? "Lavozimingiz" : "Qayerdan kiryapsiz?"} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            {guestType === "hodim"
                                                ? <Briefcase className={iconClass} />
                                                : <Globe className={iconClass} />
                                            }
                                            <input
                                                type="text"
                                                value={guestOrigin}
                                                onChange={(e) => setGuestOrigin(e.target.value)}
                                                className={inputClass}
                                                placeholder={guestType === "hodim" ? "Masalan: Kutubxonachi" : "Masalan: O'qish joyidan yoki ko'chadan..."}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                                <Button type="button" variant="outline" onClick={() => setShowGuestForm(false)} className="rounded-full">
                                    Orqaga
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!guestFirstName || !guestLastName || !guestOrigin}
                                    className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-full text-white px-6 sm:px-8 h-11"
                                >
                                    O'qishni boshlash
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
