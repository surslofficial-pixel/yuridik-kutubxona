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
    { name: "Bosh sahifa", href: "/", icon: Home, iconColorHex: "#2563EB", textColorHex: "#1E40AF" }, // Blue
    { name: "Katalog", href: "/catalog", icon: Library, iconColorHex: "#F97316", textColorHex: "#C2410C" }, // Orange (Malla)
    { name: "AI & Huquq", href: "/ai-law", icon: BookOpen, iconColorHex: "#EF4444", textColorHex: "#B91C1C" }, // Red
    { name: "AI Kutubxonachi", href: "/ai-chat", icon: Sparkles, premium: true },
    { name: "Saqlanganlar", href: "/saved", icon: Bookmark, iconColorHex: "#8B5CF6", textColorHex: "#6D28D9" }, // Violet
  ]

  // Close mobile menu and search when route changes
  useEffect(() => {
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
    <div className={cn(
      "min-h-screen flex flex-col font-sans bg-[#F8FAFC]"
    )}>
      {/* Navbar */}
      <header className="sticky top-0 z-[100] w-full bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative gap-2 sm:gap-4">
          <div className="flex items-center min-w-0 flex-1">
            <Link to="/" className="flex items-center gap-2 md:gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="bg-[#1E3A8A] p-2 rounded-xl shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[11px] xs:text-[13px] sm:text-lg lg:text-xl text-[#1E3A8A] leading-[1.1] truncate sm:whitespace-normal">
                  Surxondaryo yuridik
                </span>
                <span className="font-bold text-[11px] xs:text-[13px] sm:text-lg lg:text-xl text-[#1E3A8A] leading-[1.1] truncate sm:whitespace-normal">
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
                  location.pathname === item.href && "text-[#1E3A8A]",
                  item.premium && "text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 font-bold"
                )}
                style={!item.premium && location.pathname !== item.href ? { color: item.textColorHex } : {}}
              >
                <item.icon
                  className={cn("h-4 w-4", item.premium && "text-emerald-500")}
                  style={!item.premium && location.pathname !== item.href ? { color: item.iconColorHex } : {}}
                />
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
                      item.premium && "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      location.pathname === item.href ? "bg-white shadow-sm" : "bg-slate-100",
                      item.premium && "bg-white shadow-sm"
                    )}>
                      <item.icon
                        className={cn("h-5 w-5", location.pathname === item.href ? "text-[#1E3A8A]" : (item.premium && "text-emerald-600"))}
                        style={!item.premium && location.pathname !== item.href ? { color: item.iconColorHex } : {}}
                      />
                    </div>
                    <span style={!item.premium && location.pathname !== item.href ? { color: item.textColorHex } : {}}>{item.name}</span>
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
      <main className={cn(
        "relative z-10",
        location.pathname === '/ai-chat'
          ? "flex-1 w-full"
          : "flex-1 container mx-auto px-4 py-8"
      )}>
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200]"
              onClick={closeTestAlert}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90%] max-w-md bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(30,58,138,0.3)] border border-white/40 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] p-8 text-white text-center relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-blue-400/20 blur-2xl rounded-full"></div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-9 w-9 transition-all"
                  onClick={closeTestAlert}
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="mx-auto bg-white/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 backdrop-blur-xl shadow-inner border border-white/20 transform hover:rotate-6 transition-transform duration-500">
                  <BookOpen className="h-10 w-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                </div>

                <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight drop-shadow-lg">
                  Eslatma!
                </h3>

                <p className="text-blue-50/90 text-base sm:text-lg font-medium leading-relaxed drop-shadow-sm max-w-[280px] mx-auto">
                  Elektron kutubxona tizimi hozirda <span className="text-white font-bold underline decoration-blue-300/50 underline-offset-4">test rejimida</span> ishlamoqda!
                </p>
              </div>

              <div className="p-8 bg-white/40 backdrop-blur-xl flex flex-col items-center border-t border-white/20">
                <Button
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-white text-lg font-bold shadow-[0_10px_25px_rgba(30,58,138,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(30,58,138,0.3)] active:scale-[0.98]"
                  onClick={closeTestAlert}
                >
                  Tushunarli
                </Button>

                <p className="mt-4 text-[11px] text-[#1E3A8A]/60 font-medium tracking-wide">
                  SURXONDARYO YURIDIK TEXNIKUMI
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}