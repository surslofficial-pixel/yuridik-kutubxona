import { useState, FormEvent, useEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { BookOpen, Home, Search, Library, Sparkles, User, Menu, X, Bookmark, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTestAlert, setShowTestAlert] = useState(() => {
    return !sessionStorage.getItem("hasSeenTestAlert");
  })

  // Set session storage when closed
  const closeTestAlert = () => {
    sessionStorage.setItem("hasSeenTestAlert", "true");
    setShowTestAlert(false);
  }

  const navItems = [
    { name: "Bosh sahifa", href: "/", icon: Home },
    { name: "Katalog", href: "/catalog", icon: Library },
    { name: "Saqlanganlar", href: "/saved", icon: Bookmark },
    { name: "AI & Huquq", href: "/ai-law", icon: Sparkles, premium: true },
  ]

  // Close mobile menu and search when route changes
  useState(() => {
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-[100] w-full bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative gap-2 sm:gap-4">
          <div className="flex items-center min-w-0 flex-1">
            <Link to="/" className="flex items-center gap-2 md:gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="bg-[#1E3A8A] p-2 rounded-xl shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[13px] sm:text-lg lg:text-xl text-[#1E3A8A] leading-tight break-words whitespace-normal">
                  Surxondaryo yuridik
                </span>
                <span className="font-bold text-[13px] sm:text-lg lg:text-xl text-[#1E3A8A] leading-tight break-words whitespace-normal">
                  texnikumi
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#3B82F6] flex items-center gap-2",
                  location.pathname === item.href ? "text-[#1E3A8A]" : "text-slate-600",
                  item.premium && "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 font-bold"
                )}
              >
                <item.icon className={cn("h-4 w-4", item.premium && "text-purple-500")} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Kitob izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
              />
            </form>

            <Link to="/admin" className="hidden sm:flex flex-shrink-0">
              <Button variant="default" className="rounded-full w-full">
                <User className="mr-2 h-4 w-4" /> Admin
              </Button>
            </Link>

            <Button
              variant={isMobileSearchOpen ? "secondary" : "outline"}
              size="icon"
              className="rounded-full lg:hidden flex-shrink-0 z-[60] h-9 w-9"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                setIsMobileMenuOpen(false);
              }}
            >
              {isMobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex-shrink-0 z-[60] h-9 w-9"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMobileSearchOpen(false);
              }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 bg-white lg:hidden overflow-hidden"
            >
              <div className="p-4">
                <form onSubmit={handleSearch} className="relative w-full">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Kitob izlash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-base outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[65px] left-0 w-full bg-white border-b border-slate-200 shadow-lg lg:hidden z-50 overflow-hidden"
            >
              <div className="flex flex-col p-4 space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                      location.pathname === item.href
                        ? "bg-blue-50 text-[#1E3A8A]"
                        : "text-slate-600 hover:bg-slate-50",
                      item.premium && "bg-gradient-to-r from-purple-50 to-pink-50 text-indigo-700 font-semibold"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      location.pathname === item.href ? "bg-white shadow-sm" : "bg-slate-100",
                      item.premium && "bg-white shadow-sm"
                    )}>
                      <item.icon className={cn(
                        "h-5 w-5",
                        location.pathname === item.href ? "text-[#1E3A8A]" : "text-slate-500",
                        item.premium && "text-purple-600"
                      )} />
                    </div>
                    {item.name}
                  </Link>
                ))}


                <div className="pt-4 border-t border-slate-100 mt-2">
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full rounded-xl h-12 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                      <User className="mr-2 h-5 w-5" /> Admin
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <Outlet />
      </main>

      {/* Custom Footer */}
      {location.pathname === '/' && (
        <footer className="relative mt-8 overflow-hidden rounded-t-[2.5rem] bg-gradient-to-br from-[#0b5de5]/95 via-[#0a4cc2]/95 to-[#08358f]/95 shadow-[0_-10px_40px_rgba(11,93,229,0.3)] backdrop-blur-3xl border-t border-white/20">
          {/* Glassmorphism Highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

          {/* Background decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center overflow-hidden">
            <div className="w-[200%] h-[200%] flex flex-wrap gap-12 justify-center items-center opacity-[0.15] transform -rotate-12">
              {[...Array(20)].map((_, i) => (
                <BookOpen key={i} className="w-64 h-64 text-white drop-shadow-2xl" />
              ))}
            </div>
          </div>

          <div className="container mx-auto px-6 py-10 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">

            {/* Logo and Main Title */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group cursor-default">
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/10 group-hover:bg-white/20 transition-all duration-500">
                  <BookOpen className="h-8 w-8 text-white stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-blue-100 mb-1">
                    Surxondaryo yuridik texnikumi
                  </h2>
                  <h2 className="text-base sm:text-lg font-bold tracking-[0.1em] text-white drop-shadow-md">
                    Elektron kutubxonasi
                  </h2>
                </div>
              </div>
            </div>

            {/* Floating Divider for mobile */}
            <div className="w-16 h-[1px] bg-white/20 md:hidden"></div>

            {/* Creator Info */}
            <div className="text-center md:text-right flex flex-col items-center md:items-end w-full md:w-auto">
              <div className="px-3 py-2 rounded-2xl bg-black/10 backdrop-blur-sm border border-white/5 hover:bg-black/20 transition-all duration-300">
                <p className="text-[8px] text-blue-200 tracking-[0.15em] mb-0.5">Sayt yaratuvchisi</p>
                <p className="text-[11px] font-bold tracking-wide text-white drop-shadow-sm">Bekmurodov Nodirbek</p>
              </div>
            </div>

          </div>

          {/* Bottom Ambient Glow */}
          <div className="absolute bottom-[-100px] left-1/2 transform -translate-x-1/2 w-[80%] h-[150px] bg-blue-400/30 blur-[100px] rounded-full pointer-events-none"></div>
        </footer>
      )}

      {/* Test Mode Modal */}
      <AnimatePresence>
        {showTestAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
              onClick={closeTestAlert}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90%] max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white text-center relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-black/10 rounded-full h-8 w-8"
                  onClick={closeTestAlert}
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md shadow-inner border border-white/20">
                  <AlertTriangle className="h-8 w-8 text-white drop-shadow-md" />
                </div>
                <h3 className="text-2xl font-bold mb-2 drop-shadow-sm">Eslatma!</h3>
                <p className="text-red-50 text-base leading-relaxed drop-shadow-sm">
                  Sayt test rejimda ishlamoqda!
                </p>
              </div>
              <div className="p-5 bg-slate-50 flex justify-center">
                <Button
                  className="w-full sm:w-[80%] h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white text-base font-semibold shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5"
                  onClick={closeTestAlert}
                >
                  Tushunarli
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}