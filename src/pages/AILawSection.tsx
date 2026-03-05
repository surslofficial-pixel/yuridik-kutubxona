import React, { useState, useRef, KeyboardEvent, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, BrainCircuit, ShieldAlert, Scale, Database, Lock, ChevronRight, LockKeyhole, BookOpen, ArrowLeft, X, KeyRound, ExternalLink, Bookmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBooks } from "@/context/BookContext"
import { AiTopic } from "@/context/BookContext"
import { ReaderModal } from "@/components/ReaderModal"

const AiIconMap: Record<string, any> = {
  BrainCircuit,
  Scale,
  ShieldAlert,
  Sparkles,
  Database,
  Lock,
  BookOpen,
}

export function AILawSection() {
  const { aiTopics, books, students, addAiAccessLog } = useBooks();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active topic view state - restore from URL params
  const [activeTopic, setActiveTopic] = useState<AiTopic | null>(null);
  const [readerBookId, setReaderBookId] = useState<string | number | null>(null);

  // Restore active topic from URL on mount
  useEffect(() => {
    const topicId = searchParams.get('topic');
    if (topicId && aiTopics.length > 0) {
      const found = aiTopics.find(t => t.id === topicId);
      if (found) setActiveTopic(found);
    }
  }, [searchParams, aiTopics]);

  const handleTopicClick = (topic: AiTopic) => {
    setActiveTopic(topic);
    setSearchParams({ topic: topic.id });
  };

  const handleBookClick = (book: any) => {
    setReaderBookId(book.id);
  };



  const handleBackToTopics = () => {
    setActiveTopic(null);
    setSearchParams({});
  };

  // Get books for active topic
  const getTopicBooks = (topic: AiTopic) => {
    const topicSlug = `ai-${topic.id}`;
    return books.filter(b => b.categorySlug === topicSlug);
  };

  // If we have an active topic, show its books
  if (activeTopic) {
    const topicBooks = getTopicBooks(activeTopic);
    const IconComponent = AiIconMap[activeTopic.iconName] || BookOpen;

    return (
      <div className="space-y-8">
        {/* Back button + Topic Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            className="mb-4 text-slate-500 hover:text-slate-700 rounded-full"
            onClick={handleBackToTopics}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Barcha yo'nalishlar
          </Button>

          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${activeTopic.color} p-5 sm:p-8 text-white shadow-xl`}>
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold">{activeTopic.title}</h1>
                <p className="text-white/80 mt-1 text-sm sm:text-base">{activeTopic.description}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Books Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Mavjud kitoblar
              <span className="text-sm font-normal text-slate-400 ml-2">({topicBooks.length} ta)</span>
            </h2>
          </div>

          {topicBooks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topicBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-slate-200 hover:border-purple-200">
                    <div className="relative overflow-hidden aspect-[3/4]">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-sm text-slate-500">{book.author}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {book.format && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">{book.format}</span>
                        )}
                        {book.size && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{book.size}</span>
                        )}
                        {book.year && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{book.year}</span>
                        )}
                        {book.language && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{book.language}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-500">Hali kitoblar yuklanmagan</h3>
              <p className="text-sm text-slate-400 mt-1">Admin panel orqali kitob qo'shing</p>
            </div>
          )}
        </section>

        {readerBookId && (
          <ReaderModal bookId={readerBookId} onClose={() => setReaderBookId(null)} />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Premium Hero */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-slate-950 px-4 py-10 sm:px-12 sm:py-24 lg:px-16 lg:py-32 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/ai-law/1920/1080')] opacity-20 mix-blend-overlay bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/50" />

        {/* Animated background elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300">
            <Sparkles className="mr-2 h-4 w-4" />
            Premium Bo'lim
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-tight"
          >
            AI & Huquq
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-slate-300 sm:text-lg lg:text-xl"
          >
            Kelajak huquqshunosligi. Sun'iy intellekt va raqamli texnologiyalarning huquqiy tartibga solinishi bo'yicha eng so'nggi materiallar va tadqiqotlar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Button size="lg" variant="premium" className="rounded-full font-semibold px-8 shadow-lg shadow-purple-500/25">
              Premium obuna bo'lish
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">O'rganish yo'nalishlari</h2>
          <p className="text-slate-500">
            Raqamli asr huquqshunosi bo'lish uchun zarur bo'lgan barcha zamonaviy bilimlar bitta joyda.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiTopics.map((topic, index) => {
            const IconComponent = AiIconMap[topic.iconName] || BookOpen;
            const topicBooks = getTopicBooks(topic);
            return (
              <motion.div
                key={topic.id || topic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group relative overflow-hidden border-slate-200 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500 h-full bg-white">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <CardHeader className="space-y-4 pb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${topic.color} p-0.5 shadow-sm`}>
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                        <IconComponent className={`h-6 w-6 text-transparent bg-clip-text bg-gradient-to-br ${topic.color}`} style={{ color: "url(#gradient)" }} />
                        {/* SVG Gradient definition for icons */}
                        <svg width="0" height="0">
                          <linearGradient id="gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                            <stop stopColor="#6366f1" offset="0%" />
                            <stop stopColor="#ec4899" offset="100%" />
                          </linearGradient>
                        </svg>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-purple-700 transition-colors">{topic.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <p className="text-slate-500 leading-relaxed">
                      {topic.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-sm font-medium text-slate-400 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1 text-green-500" />
                        <span className="text-green-600">{topicBooks.length} ta kitob</span>
                      </span>
                      <Button
                        variant="ghost"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full group/btn"
                        onClick={() => handleTopicClick(topic)}
                      >
                        O'qish <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>


      {readerBookId && (
        <ReaderModal bookId={readerBookId} onClose={() => setReaderBookId(null)} />
      )}
    </div>
  )
}
