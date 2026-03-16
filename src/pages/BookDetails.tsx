import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBooks } from "@/context/BookContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReaderModal } from "@/components/ReaderModal";

export function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, categories, addReadingSession } = useBooks();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const [showReaderModal, setShowReaderModal] = useState(false);

  const foundBook = books.find((b) => b.id.toString() === id);

  // Check if this book belongs to an Audio category
  const bookCategory = categories.find(c => c.name === foundBook?.category);
  const isAudioBook = bookCategory?.group === 'audio' || foundBook?.category === 'Audio Darslik';

  // For audio books, use YouTube thumbnail as cover
  const getAudioCover = () => {
    if (foundBook?.fileId && foundBook.fileId.length === 11) {
      return `https://img.youtube.com/vi/${foundBook.fileId}/maxresdefault.jpg`;
    }
    return foundBook?.cover || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600";
  };

  // Use actual book data or fallback
  const book = {
    id: foundBook?.id || id,
    title: foundBook?.title || "O'zbekiston Respublikasi Konstitutsiyasi",
    author: foundBook?.author || "",
    category: foundBook?.category || "Konstitutsiyaviy huquq",
    cover: isAudioBook
      ? getAudioCover()
      : (foundBook?.cover || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600"),
    published: foundBook?.year?.toString() || "2023",
  };

  const handleReadClick = () => {
    setShowReaderModal(true);
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
                className={`rounded-full shadow-lg ${isAudioBook ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#3B82F6] hover:bg-[#1E3A8A]'}`}
              >
                {isAudioBook ? "Eshitish" : "O'qish"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleReadClick}
              className={`w-full rounded-full ${isAudioBook ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90'}`}
            >
              {isAudioBook ? (
                <><Headphones className="mr-2 h-4 w-4" /> Eshitish</>
              ) : (
                <><BookOpen className="mr-2 h-4 w-4" /> O'qish</>
              )}
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
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${isAudioBook ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
              {isAudioBook && <Headphones className="mr-1.5 h-3.5 w-3.5" />}
              {book.category}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {book.title}
            </h1>
            {book.author && (
              <p className="text-lg text-slate-500">{book.author}</p>
            )}
          </div>

          {/* Info cards — only for non-audio books */}
          {!isAudioBook && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 pt-6">
              <Card className="bg-slate-50 border-none shadow-none">
                <CardContent className="p-4 text-center space-y-1">
                  <p className="text-sm text-slate-500">Nashr yili</p>
                  <p className="font-semibold text-slate-900">{foundBook?.year || "Ma'lum emas"}</p>
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
          )}
        </div>
      </div>

      {showReaderModal && book.id && (
        <ReaderModal
          bookId={book.id}
          onClose={() => setShowReaderModal(false)}
        />
      )}

    </motion.div>
  );
}
