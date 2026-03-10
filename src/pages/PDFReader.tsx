import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "@/context/BookContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  ArrowLeft,
  Bookmark,
  Maximize,
  Moon,
  Sun,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";



export function PDFReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const { books, setActiveReader, removeActiveReader } = useBooks();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const activeReaderIdRef = useRef<string>('');

  const foundBook = books.find((b) => b.id.toString() === id);

  // Register active reader presence
  useEffect(() => {
    const readerData = sessionStorage.getItem('currentReader');
    if (!readerData || !id) return;

    try {
      const { firstName, lastName, groupName } = JSON.parse(readerData);
      setActiveReader({ firstName, lastName, groupName, bookId: id }).then((docId) => {
        activeReaderIdRef.current = docId;
      });
    } catch (e) {
      console.error('Error registering active reader:', e);
    }

    const handleBeforeUnload = () => {
      if (activeReaderIdRef.current) {
        // Use navigator.sendBeacon with fetch for reliability on tab close
        const url = `https://firestore.googleapis.com/v1/projects/surxondaryoyuridikkutubhonasi/databases/(default)/documents/active_readers/${activeReaderIdRef.current}`;
        fetch(url, { method: 'DELETE', keepalive: true }).catch(() => { });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (activeReaderIdRef.current) {
        removeActiveReader(activeReaderIdRef.current);
        activeReaderIdRef.current = '';
      }
    };
  }, [id]);

  const book = {
    id: foundBook?.id || id,
    title: foundBook?.title || "O'zbekiston Respublikasi Konstitutsiyasi",
    drive_file_id: foundBook?.fileId || "",
    drive_url: foundBook?.driveUrl || "",
  };

  // Drive URL va fileId uchun mos, ishonchli preview/link generatsiyasi
  let isFolder = false;
  let previewUrl = "";
  let driveViewUrl = "";

  const rawUrl = book.drive_url?.trim();

  if (rawUrl) {
    // Agar to'g'ridan-to'g'ri Google Drive havolasi bo'lsa
    if (rawUrl.includes("drive.google.com")) {
      const folderMatch = rawUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      const fileMatch =
        rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);

      if (folderMatch) {
        const idFromUrl = folderMatch[1];
        isFolder = true;
        previewUrl = `https://drive.google.com/drive/folders/${idFromUrl}?usp=sharing`;
        driveViewUrl = previewUrl;
      } else if (fileMatch) {
        const idFromUrl = fileMatch[1];
        previewUrl = `https://drive.google.com/file/d/${idFromUrl}/preview`;
        driveViewUrl = `https://drive.google.com/file/d/${idFromUrl}/view?usp=sharing`;
      } else {
        // Noma'lum, lekin baribir iframe orqali ochish
        previewUrl = rawUrl;
        driveViewUrl = rawUrl;
      }
    } else {
      // Oddiy PDF yoki boshqa tashqi havola
      previewUrl = rawUrl;
      driveViewUrl = rawUrl;
    }
  }

  // Agar driveUrl bo'lmasa yoki noto'g'ri bo'lsa, fileId orqali urinib ko'ramiz
  if (!previewUrl) {
    const fid = book.drive_file_id || "19klnuvu2l2GMOzs0I20qEG4YBzAnHZX";
    isFolder = fid.length > 30 && !fid.includes("-");

    previewUrl = isFolder
      ? `https://drive.google.com/drive/folders/${fid}?usp=sharing&rm=minimal`
      : `https://drive.google.com/file/d/${fid}/preview?rm=minimal`;

    driveViewUrl = isFolder
      ? `https://drive.google.com/drive/folders/${fid}?usp=sharing`
      : `https://drive.google.com/file/d/${fid}/view?usp=sharing`;
  }

  // Also try to append rm=minimal if previewUrl is already set
  if (previewUrl && previewUrl.includes('drive.google.com')) {
    if (!previewUrl.includes('rm=minimal')) {
      previewUrl += previewUrl.includes('?') ? '&rm=minimal' : '?rm=minimal';
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${darkMode ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-900"}`}
    >
      {/* PDF Toolbar */}
      <header
        className={`h-14 border-b flex items-center justify-between px-4 shrink-0 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className={darkMode ? "hover:bg-slate-800 text-slate-300" : ""}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium truncate max-w-[150px] sm:max-w-md">
            {book.title}
          </span>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? "hover:bg-slate-800 text-slate-300" : ""}
            title={darkMode ? "Kunduzgi rejim" : "Tungi rejim"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`hidden sm:inline-flex ${darkMode ? "hover:bg-slate-800 text-slate-300" : ""}`}
            title="To'liq ekranda ko'rish"
            onClick={() => {
              const viewer = document.getElementById('pdf-viewer-frame');
              if (viewer) {
                if (viewer.requestFullscreen) {
                  viewer.requestFullscreen();
                }
              }
            }}
          >
            <Maximize className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${foundBook && isBookmarked(foundBook.id) ? 'text-blue-500 hover:text-blue-600' : darkMode ? 'hover:bg-slate-800 text-slate-300' : ''}`}
            title={foundBook && isBookmarked(foundBook.id) ? "Saqlangandan olib tashlash" : "Saqlab qo'yish"}
            onClick={() => foundBook && toggleBookmark(foundBook)}
          >
            <Bookmark className={`h-5 w-5 ${foundBook && isBookmarked(foundBook.id) ? 'fill-blue-500' : ''}`} />
          </Button>

        </div>
      </header>

      {/* PDF Content Area */}
      <main className="flex-1 overflow-hidden p-0 sm:p-4 flex flex-col justify-center items-center gap-4">


        <div
          id="pdf-viewer-frame"
          className={`w-full max-w-5xl flex-1 rounded-xl overflow-hidden shadow-2xl relative ${darkMode ? "shadow-black/50" : ""}`}
        >
          {/* Background loading spinner effect layer */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 bg-slate-100 dark:bg-slate-800">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Yuklanmoqda...</p>
            </div>
          </div>

          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            className="border-none w-full h-full bg-white dark:bg-slate-950 relative z-10"
            allow="autoplay"
            title="Google Drive PDF Viewer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />

          {/* Overlays to prevent clicking external links in the iframe */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-transparent z-20" title="Yangi oynada ochish taqiqlangan"></div>
        </div>
      </main>


    </div>
  );
}
