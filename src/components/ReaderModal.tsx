import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, CircleUser, GraduationCap, BookOpen } from "lucide-react";
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

    const confirmRead = () => {
        if (!firstName || !lastName || !selectedBosqich || !selectedGuruh) return;

        let finalGuruh = selectedGuruh.replace(/\D/g, '');
        if (finalGuruh.length > 1) {
            finalGuruh = finalGuruh.slice(0, 1) + '-' + finalGuruh.slice(1, 4);
        } else {
            finalGuruh = selectedGuruh;
        }

        const groupName = `${selectedBosqich}-bosqich, ${finalGuruh} guruh`;

        addReadingSession({
            firstName,
            lastName,
            groupName,
            bookId,
        });

        onClose();
        navigate(`/reader/${bookId}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Ma'lumotlaringizni kiriting</h2>
                </div>
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                    <p className="text-sm text-slate-500 mb-4">Kitobni o'qishni boshlashdan oldin, iltimos ism, familiya va guruhingizni kiriting.</p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Ism</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-ZáóúiñÁÓÚIÑo'O'g'G'shShchCh\s'-]/g, '');
                                        setFirstName(val);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-base sm:text-sm"
                                    placeholder="Masalan: Sardor"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Familiya</label>
                            <div className="relative">
                                <CircleUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-ZáóúiñÁÓÚIÑo'O'g'G'shShchCh\s'-]/g, '');
                                        setLastName(val);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-base sm:text-sm"
                                    placeholder="Masalan: Ahmedov"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Bosqich</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <select
                                        value={selectedBosqich}
                                        onChange={(e) => setSelectedBosqich(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white appearance-none text-base sm:text-sm"
                                    >
                                        <option value="">Tanlang</option>
                                        {[1, 2].map((b) => (
                                            <option key={b} value={b}>{b}-bosqich</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Guruh</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
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
                                        className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-base sm:text-sm"
                                        placeholder="0-25"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={confirmRead}
                        disabled={!firstName || !lastName || !selectedBosqich || !selectedGuruh}
                        className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-full text-white px-6 sm:px-8 h-11"
                    >
                        O'qishni boshlash
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
