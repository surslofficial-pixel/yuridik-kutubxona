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
  AlertCircle,
  Play,
  Pause,
  FastForward,
  Rewind
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactPlayer from 'react-player';



export function PDFReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const { books, setActiveReader, removeActiveReader, updateActiveReaderTimestamp } = useBooks();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const activeReaderIdRef = useRef<string>('');
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSeek = (amount: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + amount, 'seconds');
    }
  };

  const foundBook = books.find((b) => b.id.toString() === id);

  // Register active reader presence with heartbeat
  useEffect(() => {
    const readerData = sessionStorage.getItem('currentReader');
    if (!readerData || !id) return;

    let isMounted = true;

    try {
      const { firstName, lastName, groupName } = JSON.parse(readerData);
      setActiveReader({ firstName, lastName, groupName, bookId: id }).then((docId) => {
        if (isMounted && docId) {
          activeReaderIdRef.current = docId;
          // Heartbeat: update timestamp every 2 minutes
          heartbeatRef.current = setInterval(() => {
            if (activeReaderIdRef.current) {
              updateActiveReaderTimestamp(activeReaderIdRef.current);
            }
          }, 2 * 60 * 1000);
        }
      });
    } catch (e) {
      console.error('Error registering active reader:', e);
    }

    const cleanupReader = () => {
      if (activeReaderIdRef.current) {
        const docId = activeReaderIdRef.current;
        activeReaderIdRef.current = '';
        // Try Firestore SDK delete
        removeActiveReader(docId);
        // Also try REST API delete as backup for mobile
        const url = `https://firestore.googleapis.com/v1/projects/surxondaryoyuridikkutubhonasi/databases/(default)/documents/active_readers/${docId}`;
        fetch(url, { method: 'DELETE', keepalive: true }).catch(() => { });
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    // Mobile: visibilitychange is more reliable than beforeunload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cleanupReader();
      }
    };

    // pagehide is the most reliable event on mobile Safari
    const handlePageHide = () => {
      cleanupReader();
    };

    const handleBeforeUnload = () => {
      cleanupReader();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupReader();
    };
  }, [id]);

  const book = {
    id: foundBook?.id || id,
    title: foundBook?.title || "O'zbekiston Respublikasi Konstitutsiyasi",
    author: foundBook?.author || "Noma'lum",
    cover: foundBook?.cover || "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
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
        previewUrl = rawUrl;
        driveViewUrl = rawUrl;
      }
    } else if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
      // YouTube Embed Link
      let videoId = "";
      if (rawUrl.includes("youtu.be/")) {
        videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
      } else if (rawUrl.includes("watch?v=")) {
        videoId = rawUrl.split("watch?v=")[1]?.split("&")[0];
      }
      previewUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      driveViewUrl = rawUrl;
    } else {
      // Oddiy PDF yoki boshqa tashqi havola
      previewUrl = rawUrl;
      driveViewUrl = rawUrl;
    }
  }

  // Agar driveUrl bo'lmasa yoki noto'g'ri bo'lsa, fileId orqali urinib ko'ramiz
  if (!previewUrl) {
    const fid = book.drive_file_id?.trim() || "";
    const isAudioBook = foundBook?.categorySlug === 'audio-kitoblar' || foundBook?.category === 'Audio Darslik';

    // YouTube Video ID = exactly 11 characters
    if (fid && fid.length === 11) {
      previewUrl = `https://www.youtube.com/embed/${fid}?autoplay=1&rel=0`;
      driveViewUrl = `https://www.youtube.com/watch?v=${fid}`;
    } else if (fid) {
      // Boshqa fayllar (misol uchun Google Drive ID)
      isFolder = fid.length > 30 && !fid.includes("-");
      if (isAudioBook) {
        // Agar u Audio Kitob bo'lsa va Drive fayl bo'lsa, mp3 stream linkni beramiz
        previewUrl = `https://docs.google.com/uc?export=download&id=${fid}`;
        driveViewUrl = previewUrl;
      } else {
        previewUrl = isFolder
          ? `https://drive.google.com/drive/folders/${fid}?usp=sharing&rm=minimal`
          : `https://drive.google.com/file/d/${fid}/preview?rm=minimal`;
        driveViewUrl = isFolder
          ? `https://drive.google.com/drive/folders/${fid}?usp=sharing`
          : `https://drive.google.com/file/d/${fid}/view?usp=sharing`;
      }
    }
  }

  // Determine if this is a YouTube embed
  const isYouTubeEmbed = previewUrl?.includes('youtube.com/embed');
  const isDriveAudio = !isYouTubeEmbed && previewUrl?.includes('docs.google.com/uc?export=download');
  const isAudioMode = isYouTubeEmbed || isDriveAudio;

  // YouTube video ID ni oldindan hisoblash
  const youtubeVideoId = book.drive_file_id?.includes('youtube.com')
    ? (book.drive_file_id.match(/[?&]v=([^&]+)/)?.[1] || '')
    : book.drive_file_id?.includes('youtu.be')
      ? (book.drive_file_id.split('youtu.be/')[1]?.split('?')[0] || '')
      : book.drive_file_id?.length === 11
        ? book.drive_file_id.trim()
        : (previewUrl?.split('embed/')[1]?.split('?')[0] || '');

  // Also try to append rm=minimal if previewUrl is already set (Drive only)
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


        {isAudioMode ? (
          <div className="w-full flex-1 max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 space-y-6 my-auto relative">
            <audio
              ref={audioRef}
              src={isDriveAudio ? previewUrl : undefined}
              onTimeUpdate={(e) => setPlayedSeconds(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            {/* Spinning Cover Art */}
            <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl relative border-[6px] border-slate-800 transition-all duration-300 ${isPlaying ? 'animate-[spin_15s_linear_infinite]' : ''}`}>
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-slate-900 rounded-full shadow-inner border-2 border-slate-800" />
              </div>
            </div>

            {/* Title and Audio status */}
            <div className="text-center space-y-3 px-4 w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full bg-blue-500 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? "Audio efirda" : "To'xtatilgan"}
              </div>
              <h2 className="text-2xl font-bold text-white line-clamp-2 leading-snug">{book.title}</h2>
              <p className="text-slate-400 text-sm font-medium">Kitob ovozlashtirilgan fonda ijro etilmoqda</p>

              {/* Progress Bar */}
              <div className="w-full flex items-center justify-between text-xs text-slate-500 font-medium px-2 pt-2">
                <span>{formatTime(playedSeconds)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative mt-1 cursor-pointer"
                onClick={(e) => {
                  const bounds = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - bounds.left;
                  const percent = x / bounds.width;
                  if (isDriveAudio && audioRef.current) {
                    audioRef.current.currentTime = percent * duration;
                  } else {
                    const ytIframe = document.getElementById('yt-audio-player') as HTMLIFrameElement;
                    if (ytIframe && duration > 0) {
                      ytIframe.contentWindow?.postMessage(JSON.stringify({
                        event: 'command', func: 'seekTo', args: [percent * duration, true]
                      }), '*');
                    }
                  }
                }}>
                <div className="h-full bg-blue-500 rounded-full transition-all duration-100" style={{ width: `${duration > 0 ? (playedSeconds / duration) * 100 : 0}%` }} />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <button onClick={() => {
                  if (isDriveAudio && audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
                  } else {
                    const ytIframe = document.getElementById('yt-audio-player') as HTMLIFrameElement;
                    if (ytIframe && playedSeconds > 15) {
                      ytIframe.contentWindow?.postMessage(JSON.stringify({
                        event: 'command', func: 'seekTo', args: [playedSeconds - 15, true]
                      }), '*');
                    }
                  }
                }} className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-full transition-all">
                  <Rewind className="w-6 h-6" />
                </button>
                <button onClick={() => {
                  if (isDriveAudio && audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play().catch(console.error);
                    }
                    return;
                  }

                  const container = document.getElementById('yt-player-container');
                  if (!container) return;

                  if (!isPlaying && !container.querySelector('iframe')) {
                    // Birinchi marta — iframe'ni yaratamiz autoplay=1 bilan
                    const iframe = document.createElement('iframe');
                    iframe.id = 'yt-audio-player';
                    iframe.src = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`;
                    iframe.width = '200';
                    iframe.height = '200';
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.style.border = 'none';
                    iframe.setAttribute('allowfullscreen', '');
                    container.appendChild(iframe);
                    setIsPlaying(true);

                    // Progress tracking
                    const progressInterval = setInterval(() => {
                      try {
                        const ytFrame = document.getElementById('yt-audio-player') as HTMLIFrameElement;
                        if (ytFrame?.contentWindow) {
                          ytFrame.contentWindow.postMessage(JSON.stringify({
                            event: 'listening', id: 1
                          }), '*');
                        }
                      } catch (e) { }
                    }, 1000);

                    // Listen for YouTube messages
                    const handleMessage = (event: MessageEvent) => {
                      try {
                        if (typeof event.data === 'string') {
                          const data = JSON.parse(event.data);
                          if (data.event === 'infoDelivery' && data.info) {
                            if (typeof data.info.currentTime === 'number') {
                              setPlayedSeconds(data.info.currentTime);
                            }
                            if (typeof data.info.duration === 'number' && data.info.duration > 0) {
                              setDuration(data.info.duration);
                            }
                            if (data.info.playerState === 0) { // ENDED
                              setIsPlaying(false);
                            }
                            if (data.info.playerState === 2) { // PAUSED
                              setIsPlaying(false);
                            }
                            if (data.info.playerState === 1) { // PLAYING
                              setIsPlaying(true);
                            }
                          }
                        }
                      } catch (e) { }
                    };
                    window.addEventListener('message', handleMessage);

                    // Cleanup reference
                    (container as any)._cleanup = () => {
                      clearInterval(progressInterval);
                      window.removeEventListener('message', handleMessage);
                    };
                  } else {
                    // Play/Pause toggle
                    const ytIframe = document.getElementById('yt-audio-player') as HTMLIFrameElement;
                    if (ytIframe?.contentWindow) {
                      if (isPlaying) {
                        ytIframe.contentWindow.postMessage(JSON.stringify({
                          event: 'command', func: 'pauseVideo', args: []
                        }), '*');
                        setIsPlaying(false);
                      } else {
                        ytIframe.contentWindow.postMessage(JSON.stringify({
                          event: 'command', func: 'playVideo', args: []
                        }), '*');
                        setIsPlaying(true);
                      }
                    }
                  }
                }} className="p-4 bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/30 rounded-full transition-all hover:scale-105">
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button onClick={() => {
                  if (isDriveAudio && audioRef.current) {
                    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
                  } else {
                    const ytIframe = document.getElementById('yt-audio-player') as HTMLIFrameElement;
                    if (ytIframe) {
                      ytIframe.contentWindow?.postMessage(JSON.stringify({
                        event: 'command', func: 'seekTo', args: [playedSeconds + 15, true]
                      }), '*');
                    }
                  }
                }} className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-full transition-all">
                  <FastForward className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* YouTube player container - kichik, kartochka pastida, ko'rinmas lekin DOM da bor */}
            <div id="yt-player-container" className="w-[200px] h-[200px] absolute bottom-0 right-0 overflow-hidden" style={{ opacity: 0.01, pointerEvents: 'none' }} />
          </div>
        ) : (
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
        )}
      </main>


    </div>
  );
}
