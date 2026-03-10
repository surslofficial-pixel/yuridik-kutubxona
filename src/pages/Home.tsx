import { motion } from "framer-motion";
import { ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useBooks, IconMap } from "@/context/BookContext";

export function Home() {
  const { categories, books } = useBooks();
  const navigate = useNavigate();

  const mainCategories = categories.filter(c => c.group === 'maxsus');
  const umumtalimCategories = categories.filter(c => c.group === 'umumtalim');
  const badiiyCategories = categories.filter(c => c.group === 'badiiy');

  const badiiyCategorySlugs = badiiyCategories.map(c => c.slug);
  const badiiyBooks = books.filter(book => badiiyCategorySlugs.includes(book.categorySlug)).slice(0, 4);

  // Eng so'nggi qo'shilgan 4 ta kitobni olib kelamiz
  const recentBooks = books
    .slice()
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4);


  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-[#1E3A8A] px-4 py-10 sm:px-12 sm:py-24 lg:px-16 lg:py-32 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/library/1920/1080')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/50" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-6xl leading-tight"
          >
            Raqamli yuridik kutubxonaga xush kelibsiz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-blue-100 sm:text-lg lg:text-xl"
          >
            Surxondaryo yuridik texnikumi talabalari uchun maxsus ishlab
            chiqilgan zamonaviy, tezkor va aqlli kitoblar bazasi.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <a href="https://sursl.uz/" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-white text-[#1E3A8A] hover:bg-blue-50 rounded-full px-8 font-semibold shadow-lg"
              >
                Rasmiy veb-sayt
              </Button>
            </a>
            <Link to="/ai-law">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-full px-8"
              >
                AI & Huquq bo'limi
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Maxsus fanlar darsliklari</h2>
          <Link to="/categories">
            <Button
              variant="ghost"
              className="text-[#3B82F6] hover:text-[#1E3A8A]"
            >
              Barchasini ko'rish <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          {mainCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/category/${category.slug}`}>
                <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-slate-100 h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full">
                    <div
                      className={`p-3 rounded-2xl ${category.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      {(() => {
                        const IconComponent = IconMap[category.iconName] || BookOpen;
                        return <IconComponent className="h-6 w-6" />;
                      })()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                      {category.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Umumta'lim Fanlari Category */}
      {umumtalimCategories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Umumta'lim fanlari</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {umumtalimCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/category/${category.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-slate-100 h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full">
                      <div
                        className={`p-3 rounded-2xl ${category.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        {(() => {
                          const IconComponent = IconMap[category.iconName] || BookOpen;
                          return <IconComponent className="h-6 w-6" />;
                        })()}
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                        {category.name}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Badiiy Adabiyot Category */}
      {badiiyCategories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Badiiy adabiyotlar</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {badiiyCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/category/${category.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-slate-100 h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full">
                      <div
                        className={`p-3 rounded-2xl ${category.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        {(() => {
                          const IconComponent = IconMap[category.iconName] || BookOpen;
                          return <IconComponent className="h-6 w-6" />;
                        })()}
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                        {category.name}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}


      {/* Badiiy Kitoblar Section */}
      {badiiyBooks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Badiiy kitoblar
            </h2>
            <Link to="/categories">
              <Button
                variant="ghost"
                className="text-[#3B82F6] hover:text-[#1E3A8A]"
              >
                Barchasini ko'rish <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {badiiyBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-100 h-full flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden relative shrink-0">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <CardHeader className="p-4 space-y-1 flex-1">
                    <div className="text-xs font-medium text-[#3B82F6] mb-1">
                      {book.category}
                    </div>
                    <CardTitle className="text-base line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                      {book.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
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
        </section>
      )}

      {/* Yangi qo'shilgan kitoblar Section */}
      {recentBooks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Yangi qo'shilgan kitoblar
            </h2>
            <Link to="/categories">
              <Button
                variant="ghost"
                className="text-[#3B82F6] hover:text-[#1E3A8A]"
              >
                Barchasini ko'rish <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-100 h-full flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden relative shrink-0">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <CardHeader className="p-4 space-y-1 flex-1">
                    <div className="text-xs font-medium text-[#3B82F6] mb-1">
                      {book.category}
                    </div>
                    <CardTitle className="text-base line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                      {book.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
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
        </section>
      )}
    </div>
  );
}
