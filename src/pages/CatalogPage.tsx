import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooks, IconMap } from "@/context/BookContext";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { ReaderModal } from "@/components/ReaderModal";

export function CatalogPage() {
    const { categories, books } = useBooks();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [readerBookId, setReaderBookId] = useState<string | number | null>(null);

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory
            ? book.categorySlug === selectedCategory
            : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Kitoblar katalogi
                </h1>
                <p className="text-slate-500 text-lg">
                    Barcha mavjud kitoblarni ko'ring, qidiring va o'qing.
                </p>
            </motion.div>

            {/* Search & Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Kitob nomi yoki muallif bo'yicha qidirish..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        className="rounded-full text-sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        Barchasi
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.slug}
                            variant={selectedCategory === cat.slug ? "default" : "outline"}
                            className="rounded-full text-sm"
                            onClick={() =>
                                setSelectedCategory(
                                    selectedCategory === cat.slug ? null : cat.slug
                                )
                            }
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {filteredBooks.map((book, index) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => navigate(`/books/${book.id}`)}
                            className="cursor-pointer"
                        >
                            <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-100 h-full">
                                <div className="aspect-[3/4] overflow-hidden relative">
                                    <img
                                        src={book.cover}
                                        alt={book.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <Button
                                            variant="default"
                                            className="w-full bg-[#3B82F6] hover:bg-[#1E3A8A] rounded-full"
                                            onClick={(e) => { e.stopPropagation(); setReaderBookId(book.id); }}
                                        >
                                            {book.categorySlug === 'audio-kitoblar' || book.category === 'Audio kitoblar' ? 'Eshitish' : "O'qish"}
                                        </Button>
                                    </div>
                                </div>
                                <CardHeader className="p-4 space-y-1">
                                    <div className="text-xs font-medium text-[#3B82F6] mb-1">
                                        {book.category}
                                    </div>
                                    <CardTitle className="text-base line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                                        {book.title}
                                    </CardTitle>
                                    <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
                                    {book.year && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            Nashr yili: <span className="font-medium text-slate-600">{book.year}</span>
                                        </p>
                                    )}
                                </CardHeader>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <BookOpen className="h-16 w-16 text-slate-300" />
                    <h3 className="text-xl font-semibold text-slate-500">
                        Kitob topilmadi
                    </h3>
                    <p className="text-slate-400">
                        Boshqa kalit so'z bilan qidiring yoki filtrni o'zgartiring.
                    </p>
                </div>
            )}

            {/* Categories Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-6 pt-8 border-t border-slate-100"
            >
                <div className="space-y-8">
                    {/* Maxsus fanlar darsliklari */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Maxsus fanlar darsliklari</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                            {categories.filter(c => c.group === 'maxsus').map((category, index) => {
                                const IconComponent = IconMap[category.iconName] || BookOpen;
                                const bookCount = books.filter((b) => b.categorySlug === category.slug).length;
                                return (
                                    <motion.div key={category.slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }}>
                                        <Link to={`/category/${category.slug}`}>
                                            <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-slate-100 h-full">
                                                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3 h-full">
                                                    <div className={`p-3 rounded-2xl ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                                                        <IconComponent className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">{category.name}</span>
                                                    <span className="text-xs text-slate-400">{bookCount} ta kitob</span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Umumta'lim fanlari */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Umumta'lim fanlari</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                            {categories.filter(c => c.group === 'umumtalim').map((category, index) => {
                                const IconComponent = IconMap[category.iconName] || BookOpen;
                                const bookCount = books.filter((b) => b.categorySlug === category.slug).length;
                                return (
                                    <motion.div key={category.slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }}>
                                        <Link to={`/category/${category.slug}`}>
                                            <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-slate-100 h-full">
                                                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3 h-full">
                                                    <div className={`p-3 rounded-2xl ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                                                        <IconComponent className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">{category.name}</span>
                                                    <span className="text-xs text-slate-400">{bookCount} ta kitob</span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Badiiy adabiyotlar */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Badiiy adabiyotlar</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                            {categories.filter(c => c.group === 'badiiy').map((category, index) => {
                                const IconComponent = IconMap[category.iconName] || BookOpen;
                                const bookCount = books.filter((b) => b.categorySlug === category.slug).length;
                                return (
                                    <motion.div key={category.slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }}>
                                        <Link to={`/category/${category.slug}`}>
                                            <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-slate-100 h-full">
                                                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3 h-full">
                                                    <div className={`p-3 rounded-2xl ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                                                        <IconComponent className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">{category.name}</span>
                                                    <span className="text-xs text-slate-400">{bookCount} ta kitob</span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Audio kitoblar */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Audio kitoblar</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                            {categories.filter(c => c.group === 'audio').map((category, index) => {
                                const IconComponent = IconMap[category.iconName] || BookOpen;
                                const bookCount = books.filter((b) => b.categorySlug === category.slug).length;
                                return (
                                    <motion.div key={category.slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }}>
                                        <Link to={`/category/${category.slug}`}>
                                            <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-slate-100 h-full">
                                                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3 h-full">
                                                    <div className={`p-3 rounded-2xl ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                                                        <IconComponent className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">{category.name}</span>
                                                    <span className="text-xs text-slate-400">{bookCount} ta kitob</span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            {readerBookId && (
                <ReaderModal bookId={readerBookId} onClose={() => setReaderBookId(null)} />
            )}
        </div>
    );
}
