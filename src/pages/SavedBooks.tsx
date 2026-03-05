import { motion } from "framer-motion";
import { Bookmark, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookmarks } from "@/hooks/useBookmarks";

export function SavedBooks() {
    const { bookmarks } = useBookmarks();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Bookmark className="h-8 w-8 text-blue-600" />
                    Saqlangan kitoblar
                </h1>
                <p className="text-slate-500">
                    Siz o'z qurilmangizda saqlab qo'ygan barcha kitoblar ro'yxati.
                </p>
            </div>

            {bookmarks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Bookmark className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Hozircha bo'sh</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        Siz hali hech qanday kitob saqlamadingiz. Kitoblarni saqlab qo'yish uchun ularni o'qish sahifasidagi yoki kitob haqida ma'lumot sahifasidagi saqlash tugmasini bosing.
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1E3A8A]/90 transition-colors"
                    >
                        <BookOpen className="h-5 w-5" />
                        Katalogga o'tish
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {bookmarks.map((book, index) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                                <img
                                    src={book.cover}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Link
                                        to={`/books/${book.id}`}
                                        className="bg-white/90 backdrop-blur-sm text-slate-900 px-6 py-2 rounded-full font-medium hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                                    >
                                        Ko'rish
                                    </Link>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                                        {book.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                    {book.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-auto pt-2 font-medium">
                                    {book.author}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
