import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useBooks, IconMap } from "@/context/BookContext";
import { BookOpen, ArrowLeft, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReaderModal } from "@/components/ReaderModal";

export function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { categories, books: allBooks } = useBooks();

  const category = categories.find((c) => c.slug === slug);
  const books = allBooks.filter((b) => b.categorySlug === slug);
  const [readerBookId, setReaderBookId] = useState<string | number | null>(null);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-slate-500">Kategoriya topilmadi</p>
        <Link to="/">
          <Button variant="outline">Bosh sahifaga qaytish</Button>
        </Link>
      </div>
    );
  }

  const IconComponent = IconMap[category.iconName] || BookOpen;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#1E3A8A] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Orqaga qaytish
          </Link>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${category.color}`}>
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {category.name}
              </h1>
              <p className="text-slate-500 mt-1">
                {books.length} ta kitob mavjud
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Qidirish..."
              className="h-10 w-full sm:w-64 rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Books Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/books/${book.id}`)}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-100 h-full flex flex-col">
                <div className="aspect-[3/4] overflow-hidden relative shrink-0">
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
                      O'qish
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-4 space-y-1 flex-1">
                  <div className="flex flex-col mb-1">
                    <div className="text-xs font-medium text-[#3B82F6] mb-1">
                      {category.name}
                    </div>
                    <CardTitle className="text-base line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                      {book.title}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {book.author}
                  </p>
                  {(book.year || book.published) && (
                    <p className="text-xs text-slate-400 mt-1">
                      Nashr yili: <span className="font-medium text-slate-600">{book.year || book.published}</span>
                    </p>
                  )}
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <div className="p-4 rounded-full bg-slate-100">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            Kitoblar topilmadi
          </h3>
          <p className="text-slate-500 max-w-md">
            Hozircha bu yo'nalishda kitoblar mavjud emas. Tez orada yangi
            kitoblar qo'shiladi.
          </p>
        </div>
      )}

      {readerBookId && (
        <ReaderModal bookId={readerBookId} onClose={() => setReaderBookId(null)} />
      )}
    </div>
  );
}
