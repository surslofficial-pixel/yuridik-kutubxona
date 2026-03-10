import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBooks } from "@/context/BookContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Download,
  Share2,
  Star,
  Clock,
  FileText,
  BookOpen,
  User,
  CircleUser,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, addReadingSession } = useBooks();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const [showReaderModal, setShowReaderModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedBosqich, setSelectedBosqich] = useState("");
  const [selectedGuruh, setSelectedGuruh] = useState("");

  const foundBook = books.find((b) => b.id.toString() === id);

  // Use actual book data or fallback to mock
  const book = {
    id: foundBook?.id || id,
    title: foundBook?.title || "O'zbekiston Respublikasi Konstitutsiyasi",
    author: foundBook?.author || "Oliy Majlis",
    category: foundBook?.category || "Konstitutsiyaviy huquq",
    description:
      "O'zbekiston Respublikasining Asosiy Qonuni. Yangi tahrirdagi Konstitutsiya matni, uning mazmun-mohiyati va ahamiyati haqida batafsil ma'lumotlar.",
    cover: foundBook?.cover || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600",
    pages: 128,
    size: "2.4 MB",
    published: foundBook?.year?.toString() || "2023",
    rating: 4.8,
    reads: 1245,
  };

  const handleReadClick = () => {
    setFirstName("");
    setLastName("");
    setSelectedBosqich("");
    setSelectedGuruh("");
    setShowReaderModal(true);
  };

  const confirmRead = () => {
    if (!firstName || !lastName || !selectedBosqich || !selectedGuruh) return;

    let finalGuruh = selectedGuruh.replace(/\D/g, '');
    if (finalGuruh.length > 1) {
      finalGuruh = finalGuruh.slice(0, 1) + '-' + finalGuruh.slice(1, 4);
    } else {
      finalGuruh = selectedGuruh;
    }

    const groupName = `${selectedBosqich}-bosqich, ${finalGuruh} guruh`;

    if (book.id) {
      addReadingSession({
        firstName,
        lastName,
        groupName,
        bookId: book.id
      });
    }

    setShowReaderModal(false);
    navigate(`/reader/${book.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#1E3A8A] transition-colors bg-transparent border-none p-0 cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Orqaga qaytish
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 lg:gap-12">
        {/* Book Cover Sidebar */}
        <div className="space-y-6">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-100 relative group">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                onClick={handleReadClick}
                size="lg"
                className="rounded-full bg-[#3B82F6] hover:bg-[#1E3A8A] shadow-lg"
              >
                O'qish
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleReadClick}
              className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-full"
            >
              <BookOpen className="mr-2 h-4 w-4" /> O'qish
            </Button>
            <Button
              variant="outline"
              className={`w-full rounded-full border-slate-200 ${isBookmarked(book.id) ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}`}
              onClick={() => foundBook && toggleBookmark(foundBook)}
            >
              <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked(book.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} /> {isBookmarked(book.id) ? 'Saqlangan' : 'Saqlash'}
            </Button>
          </div>
        </div>

        {/* Book Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {book.category}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {book.title}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 pt-6">
            <Card className="bg-slate-50 border-none shadow-none">
              <CardContent className="p-4 text-center space-y-1">
                <p className="text-sm text-slate-500">Nashr yili</p>
                <p className="font-semibold text-slate-900">{foundBook?.year || book.published}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-none">
              <CardContent className="p-4 text-center space-y-1">
                <p className="text-sm text-slate-500">Fayl hajmi</p>
                <p className="font-semibold text-slate-900">{foundBook?.size || "Ma'lum emas"}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-none">
              <CardContent className="p-4 text-center space-y-1">
                <p className="text-sm text-slate-500">Format</p>
                <p className="font-semibold text-slate-900">{foundBook?.format || "PDF"}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-none">
              <CardContent className="p-4 text-center space-y-1">
                <p className="text-sm text-slate-500">Til</p>
                <p className="font-semibold text-slate-900">{foundBook?.language || "O'zbek"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      {showReaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Ma'lumotlaringizni kiriting</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-4">Kitobni o'qishni boshlashdan oldin, iltimos ism, familiya va guruhingizni kiriting.</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ism</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white appearance-none"
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
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0-25"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowReaderModal(false)}
                className="rounded-xl"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={confirmRead}
                disabled={!firstName || !lastName || !selectedBosqich || !selectedGuruh}
                className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl text-white px-8 h-11"
              >
                O'qishni boshlash
              </Button>
            </div>
          </motion.div>
        </div>
      )}


    </motion.div>
  );
}
