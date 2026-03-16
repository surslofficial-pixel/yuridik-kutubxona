import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import {
    Briefcase,
    Landmark,
    Leaf,
    Users,
    FileText,
    Shield,
    Gavel,
    Scale,
    FileSearch,
    BookOpen,
    Settings,
    LayoutDashboard,
    GraduationCap,
    Library,
    Fingerprint,
    Building2,
    BrainCircuit,
    ShieldAlert,
    Sparkles,
    Database,
    Lock,
    Headphones,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    doc,
    onSnapshot,
    query,
    orderBy,
    setDoc
} from "firebase/firestore";

export const IconMap: Record<string, any> = {
    Briefcase,
    Landmark,
    Leaf,
    Users,
    FileText,
    Shield,
    Gavel,
    Scale,
    FileSearch,
    BookOpen,
    Settings,
    LayoutDashboard,
    GraduationCap,
    Library,
    Fingerprint,
    Building2,
    BrainCircuit,
    ShieldAlert,
    Sparkles,
    Database,
    Lock,
    Headphones,
};

export interface Category {
    name: string;
    iconName: string;
    color: string;
    slug: string;
    group: 'maxsus' | 'umumtalim' | 'badiiy' | 'ai' | 'audio';
}

export interface Book {
    id: string | number;
    title: string;
    author: string;
    category: string;
    categorySlug: string;
    cover: string;
    year?: number;
    date?: string;
    status?: string;
    fileId?: string;
    driveUrl?: string;
    format?: string;
    language?: string;
    size?: string;
}

export interface ReadingSession {
    id: string;
    firstName: string;
    lastName: string;
    groupName: string;
    bookId: string | number;
    timestamp: number;
}

export interface AiTopic {
    id: string;
    title: string;
    description: string;
    iconName: string;
    color: string;
}

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    groupName: string;
    accessCode: string;
}

export interface AiAccessLog {
    id: string;
    studentId: string;
    studentName: string;
    studentGroup: string;
    topicId: string;
    topicTitle: string;
    timestamp: number;
}

export interface ActiveReader {
    id: string;
    firstName: string;
    lastName: string;
    groupName: string;
    bookId: string | number;
    timestamp: number;
}

interface BookContextType {
    categories: Category[];
    books: Book[];
    readingSessions: ReadingSession[];
    aiTopics: AiTopic[];
    addBook: (book: Book) => void;
    deleteBook: (id: string | number) => void;
    updateBook: (id: string | number, updatedFields: Partial<Book>) => void;
    addCategory: (category: Category) => void;
    deleteCategory: (slug: string) => void;
    updateCategory: (slug: string, updatedFields: Partial<Category>) => void;
    addReadingSession: (session: Omit<ReadingSession, 'id' | 'timestamp'>) => void;
    deleteUserSessions: (firstName: string, lastName: string, groupName: string) => void;
    updateUserSessions: (oldIdentity: { firstName: string, lastName: string, groupName: string }, newIdentity: { firstName: string, lastName: string, groupName: string }) => void;
    addAiTopic: (topic: AiTopic) => void;
    updateAiTopic: (id: string, updatedFields: Partial<AiTopic>) => void;
    deleteAiTopic: (id: string) => void;
    students: Student[];
    addStudent: (student: Student) => void;
    updateStudent: (id: string, updatedFields: Partial<Student>) => void;
    deleteStudent: (id: string) => void;
    aiAccessLogs: AiAccessLog[];
    addAiAccessLog: (log: Omit<AiAccessLog, 'id' | 'timestamp'>) => void;
    activeReaders: ActiveReader[];
    setActiveReader: (data: Omit<ActiveReader, 'id' | 'timestamp'>) => Promise<string>;
    removeActiveReader: (id: string) => void;
    updateActiveReaderTimestamp: (id: string) => void;
}

const defaultCategories: Category[] = [
    {
        name: "Biznes huquqi",
        iconName: "Briefcase",
        color: "bg-blue-100 text-blue-600",
        slug: "biznes-huquqi",
        group: "maxsus",
    },
    {
        name: "Davlat va huquq nazariyasi",
        iconName: "Landmark",
        color: "bg-indigo-100 text-indigo-600",
        slug: "davlat-va-huquq-nazariyasi",
        group: "maxsus",
    },
    {
        name: "Ekologiya huquqi",
        iconName: "Leaf",
        color: "bg-green-100 text-green-600",
        slug: "ekologiya-huquqi",
        group: "maxsus",
    },
    {
        name: "Fuqarolik huquqi",
        iconName: "Users",
        color: "bg-orange-100 text-orange-600",
        slug: "fuqarolik-huquqi",
        group: "maxsus",
    },
    {
        name: "Fuqarolik-protsessual huquqi",
        iconName: "FileText",
        color: "bg-amber-100 text-amber-600",
        slug: "fuqarolik-protsessual-huquqi",
        group: "maxsus",
    },
    {
        name: "Jinoyat huquqi",
        iconName: "Shield",
        color: "bg-red-100 text-red-600",
        slug: "jinoyat-huquqi",
        group: "maxsus",
    },
    {
        name: "Jinoyat protsessual huquqi",
        iconName: "Gavel",
        color: "bg-rose-100 text-rose-600",
        slug: "jinoyat-protsessual-huquqi",
        group: "maxsus",
    },
    {
        name: "Konstitutsiyaviy huquq",
        iconName: "Scale",
        color: "bg-cyan-100 text-cyan-600",
        slug: "konstitutsiyaviy-huquq",
        group: "maxsus",
    },
    {
        name: "Kriminalistika",
        iconName: "FileSearch",
        color: "bg-slate-100 text-slate-600",
        slug: "kriminalistika",
        group: "maxsus",
    },
    {
        name: "Mehnat huquqi",
        iconName: "Users",
        color: "bg-teal-100 text-teal-600",
        slug: "mehnat-huquqi",
        group: "maxsus",
    },
    {
        name: "Yuridik xizmat",
        iconName: "Briefcase",
        color: "bg-purple-100 text-purple-600",
        slug: "yuridik-xizmat",
        group: "maxsus",
    },
    {
        name: "Umumta'lim fanlari",
        iconName: "Globe",
        color: "bg-blue-100 text-blue-600",
        slug: "umumtalim-fanlari",
        group: "umumtalim",
    },
    {
        name: "Badiiy adabiyot",
        iconName: "BookOpen",
        color: "bg-pink-100 text-pink-600",
        slug: "badiiy-adabiyot",
        group: "badiiy",
    },
    {
        name: "Audio Darslik",
        iconName: "Headphones",
        color: "bg-emerald-100 text-emerald-600",
        slug: "audio-kitoblar",
        group: "audio",
    },
];

const defaultAiTopics: AiTopic[] = [
    {
        id: "ai-huquq-asoslari",
        title: "AI va huquq asoslari",
        description: "Sun'iy intellektning huquqiy maqomi, javobgarlik masalalari va xalqaro tajriba.",
        iconName: "BrainCircuit",
        color: "from-indigo-500 to-blue-500",
    },
    {
        id: "legaltech",
        title: "LegalTech",
        description: "Yuridik faoliyatni avtomatlashtirish, smart-kontraktlar va raqamli platformalar.",
        iconName: "Scale",
        color: "from-purple-500 to-pink-500",
    },
    {
        id: "kiber-huquq",
        title: "Kiber huquq",
        description: "Kibermakonda huquqbuzarliklar, axborot xavfsizligi va shaxsiy ma'lumotlar himoyasi.",
        iconName: "ShieldAlert",
        color: "from-rose-500 to-orange-500",
    },
    {
        id: "suniy-intellekt-etikasi",
        title: "Sun'iy intellekt etikasi",
        description: "AI tizimlarida adolat, xolislik va inson huquqlarini ta'minlash tamoyillari.",
        iconName: "Sparkles",
        color: "from-amber-500 to-yellow-500",
    },
    {
        id: "raqamli-dalillar",
        title: "Raqamli dalillar",
        description: "Elektron dalillarni to'plash, baholash va sudda foydalanishning protsessual tartibi.",
        iconName: "Database",
        color: "from-emerald-500 to-teal-500",
    },
    {
        id: "kiberjinoyatchilik",
        title: "Kiberjinoyatchilik",
        description: "Kiberjinoyatlarning turlari, oldini olish choralari va ularga qarshi kurashishning huquqiy mexanizmlari.",
        iconName: "Lock",
        color: "from-cyan-500 to-blue-600",
    },
];

const initialBooks: Book[] = [
    {
        id: "b1",
        title: "O'tkan kunlar",
        author: "Abdulla Qodiriy",
        category: "Badiiy adabiyot",
        categorySlug: "badiiy-adabiyot",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600",
        year: 1926,
        date: "2026-02-24",
        status: "Faol",
        format: "PDF",
        language: "O'zbek",
    },
    {
        id: 1,
        title: "O'zbekiston Respublikasi Konstitutsiyasi",
        author: "",
        category: "Konstitutsiyaviy huquq",
        categorySlug: "konstitutsiyaviy-huquq",
        cover:
            "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600",
        year: 2023,
        date: "2026-02-23",
        status: "Faol",
        format: "PDF",
        language: "O'zbek",
    },
    {
        id: 2,
        title: "Jinoyat huquqi. Umumiy qism",
        author: "M. Rustamboyev",
        category: "Jinoyat huquqi",
        categorySlug: "jinoyat-huquqi",
        cover:
            "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&q=80&w=400&h=600",
        year: 2022,
        date: "2026-02-22",
        status: "Faol",
        format: "PDF",
        language: "O'zbek",
    },
    {
        id: 3,
        title: "Fuqarolik huquqi",
        author: "H. Rahmonqulov",
        category: "Fuqarolik huquqi",
        categorySlug: "fuqarolik-huquqi",
        cover:
            "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400&h=600",
        year: 2021,
        date: "2026-02-20",
        status: "Kutmoqda",
        format: "PDF",
        language: "O'zbek",
    },
    {
        id: 4,
        title: "Kriminalistika",
        author: "A.A. To'laganov",
        category: "Kriminalistika",
        categorySlug: "kriminalistika",
        cover:
            "https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&q=80&w=400&h=600",
        year: 2020,
        date: "2026-02-15",
        status: "Faol",
        format: "PDF",
        language: "O'zbek",
    },
    {
        id: 5,
        title: "Biznes huquqi asoslari",
        author: "Sh. Ruzinazarov",
        category: "Biznes huquqi",
        categorySlug: "biznes-huquqi",
        cover:
            "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=400&h=600",
        year: 2023,
        date: "2026-02-10",
        status: "Faol",
        format: "PDF",
        language: "O'zbek",
    },
    {
        id: 6,
        title: "Mehnat huquqi",
        author: "M. Gasanov",
        category: "Mehnat huquqi",
        categorySlug: "mehnat-huquqi",
        cover:
            "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=400&h=600",
        year: 2022,
        date: "2026-02-05",
        status: "Faol",
        format: "PDF",
        language: "O'zbek",
    },
    {
        id: "a1",
        title: "O'tkan kunlar (Audio kitob)",
        author: "Abdulla Qodiriy",
        category: "Audio Darslik",
        categorySlug: "audio-kitoblar",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600",
        year: 1926,
        date: "2026-02-25",
        status: "Faol",
        format: "Audio/YouTube",
        language: "O'zbek",
        driveUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example placeholder, can be changed by admin
    },
    {
        id: "a2",
        title: "Jinoyat va Jazo (Audio kitob)",
        author: "Fyodor Dostoyevskiy",
        category: "Audio Darslik",
        categorySlug: "audio-kitoblar",
        cover: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400&h=600",
        year: 1866,
        date: "2026-02-26",
        status: "Faol",
        format: "Audio/YouTube",
        language: "O'zbek",
        driveUrl: "https://youtu.be/dQw4w9WgXcQ",
    }
];

// Helper: Remove undefined values from object (Firestore rejects undefined)
function removeUndefined(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([]);
    const [aiTopics, setAiTopics] = useState<AiTopic[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [aiAccessLogs, setAiAccessLogs] = useState<AiAccessLog[]>([]);
    const [activeReaders, setActiveReaders] = useState<ActiveReader[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Merge AI topics into categories dynamically
    const mergedCategories = useMemo(() => {
        const aiCategories: Category[] = aiTopics.map(topic => ({
            name: topic.title,
            iconName: topic.iconName,
            color: `bg-gradient-to-br ${topic.color} text-white`,
            slug: `ai-${topic.id}`,
            group: 'ai' as const,
        }));
        return [...categories, ...aiCategories];
    }, [categories, aiTopics]);

    // Initial Load and Real-time Sync
    useEffect(() => {
        let unsubCategories: (() => void) | null = null;
        let unsubBooks: (() => void) | null = null;
        let unsubSessions: (() => void) | null = null;
        let unsubAiTopics: (() => void) | null = null;
        let unsubStudents: (() => void) | null = null;
        let unsubAiAccessLogs: (() => void) | null = null;
        let unsubActiveReaders: (() => void) | null = null;

        const init = async () => {
            try {
                // One-time seeding check
                const metaRef = doc(db, "_meta", "initialized");
                const metaSnap = await getDoc(metaRef);

                if (!metaSnap.exists()) {
                    // Check if books already exist (from previous seeding)
                    const booksSnap = await getDocs(collection(db, "books"));

                    if (booksSnap.empty) {
                        // Truly first time — seed default data
                        console.log("Firebase: Seeding default data...");
                        for (const cat of defaultCategories) {
                            await setDoc(doc(db, "categories", cat.slug), removeUndefined(cat));
                        }
                        for (const book of initialBooks) {
                            await setDoc(doc(db, "books", book.id.toString()), removeUndefined(book));
                        }
                        for (const topic of defaultAiTopics) {
                            await setDoc(doc(db, "ai_topics", topic.id), removeUndefined(topic));
                        }
                        console.log("Firebase: Seeding complete!");
                    }
                    // Mark as initialized
                    await setDoc(metaRef, { seededAt: Date.now() });
                    console.log("Firebase: Initialized flag set.");
                }

                // Seed AI topics if they don't exist yet (for databases initialized before this feature)
                const aiTopicsSnap = await getDocs(collection(db, "ai_topics"));
                if (aiTopicsSnap.empty) {
                    console.log("Firebase: Seeding default AI topics...");
                    for (const topic of defaultAiTopics) {
                        await setDoc(doc(db, "ai_topics", topic.id), removeUndefined(topic));
                    }
                    console.log("Firebase: AI topics seeding complete!");
                }

                // Seed Audio kitoblar category if it doesn't exist yet
                const audioCatRef = doc(db, "categories", "audio-kitoblar");
                const audioCatSnap = await getDoc(audioCatRef);
                if (!audioCatSnap.exists()) {
                    console.log("Firebase: Seeding Audio kitoblar category...");
                    const audioCat = defaultCategories.find(c => c.slug === 'audio-kitoblar');
                    if (audioCat) {
                        await setDoc(audioCatRef, removeUndefined(audioCat));
                    }
                    // Seed sample audio books
                    const audioBooks = initialBooks.filter(b => b.categorySlug === 'audio-kitoblar');
                    for (const book of audioBooks) {
                        await setDoc(doc(db, "books", book.id.toString()), removeUndefined(book));
                    }
                    console.log("Firebase: Audio Darslik seeding complete!");
                }
            } catch (e) {
                console.error("Firebase: Initialization error:", e);
            }

            // Start real-time listeners AFTER seed
            unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
                const cats = snapshot.docs.map(d => d.data() as Category);
                setCategories(cats);
                console.log("Firebase: Categories loaded:", cats.length);
            }, (error) => {
                console.error("Firebase: Categories listener error:", error);
            });

            unsubBooks = onSnapshot(collection(db, "books"), (snapshot) => {
                const bks = snapshot.docs.map(d => {
                    const data = d.data() as Book;
                    // Auto-inject YouTube cover for Audio books across all components
                    const isAudio = data.categorySlug === 'audio-kitoblar' || data.category === 'Audio Darslik';
                    if (isAudio && data.fileId && data.fileId.length === 11) {
                        data.cover = `https://img.youtube.com/vi/${data.fileId}/maxresdefault.jpg`;
                    }
                    return data;
                });
                setBooks(bks);
                console.log("Firebase: Books loaded:", bks.length);
            }, (error) => {
                console.error("Firebase: Books listener error:", error);
            });

            unsubSessions = onSnapshot(collection(db, "reading_sessions"), (snapshot) => {
                const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReadingSession));
                setReadingSessions(sessions);
            }, (error) => {
                console.error("Firebase: Sessions listener error:", error);
            });

            unsubAiTopics = onSnapshot(collection(db, "ai_topics"), (snapshot) => {
                const topics = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AiTopic));
                setAiTopics(topics);
                console.log("Firebase: AI Topics loaded:", topics.length);
            }, (error) => {
                console.error("Firebase: AI Topics listener error:", error);
            });

            unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
                const stds = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
                setStudents(stds);
                console.log("Firebase: Students loaded:", stds.length);
            }, (error) => {
                console.error("Firebase: Students listener error:", error);
            });

            unsubAiAccessLogs = onSnapshot(collection(db, "ai_access_logs"), (snapshot) => {
                const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AiAccessLog));
                setAiAccessLogs(logs);
                console.log("Firebase: AI Access Logs loaded:", logs.length);
            }, (error) => {
                console.error("Firebase: AI Access Logs listener error:", error);
            });

            unsubActiveReaders = onSnapshot(collection(db, "active_readers"), (snapshot) => {
                const readers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActiveReader));
                setActiveReaders(readers);
            }, (error) => {
                console.error("Firebase: Active Readers listener error:", error);
            });

            setIsLoading(false);
        };

        init();

        return () => {
            unsubCategories?.();
            unsubBooks?.();
            unsubSessions?.();
            unsubAiTopics?.();
            unsubStudents?.();
            unsubAiAccessLogs?.();
            unsubActiveReaders?.();
        };
    }, []);

    const addCategory = async (category: Category) => {
        try {
            const cleanData = removeUndefined(category);
            await setDoc(doc(db, "categories", category.slug), cleanData);
        } catch (e) {
            console.error("Error adding category:", e);
        }
    };

    const deleteCategory = async (slug: string) => {
        try {
            await deleteDoc(doc(db, "categories", slug));
        } catch (e) {
            console.error("Error deleting category:", e);
        }
    };

    const updateCategory = async (slug: string, updatedFields: Partial<Category>) => {
        try {
            const cleanData = removeUndefined(updatedFields);
            await updateDoc(doc(db, "categories", slug), cleanData);
        } catch (e) {
            console.error("Error updating category:", e);
        }
    };

    const addBook = async (book: Book) => {
        try {
            const bookId = book.id.toString();
            const cleanData = removeUndefined({
                ...book,
                id: bookId,
                date: book.date || new Date().toISOString().split('T')[0]
            });
            await setDoc(doc(db, "books", bookId), cleanData);
            alert("Kitob muvaffaqiyatli saqlandi!");
        } catch (e: any) {
            console.error("Error adding book:", e);
            alert("Kitob saqlashda xatolik yuz berdi: " + (e.message || JSON.stringify(e)));
            throw e;
        }
    };

    const deleteBook = async (id: string | number) => {
        try {
            await deleteDoc(doc(db, "books", id.toString()));
        } catch (e) {
            console.error("Error deleting book:", e);
        }
    };

    const updateBook = async (id: string | number, updatedFields: Partial<Book>) => {
        try {
            const cleanData = removeUndefined(updatedFields);
            await updateDoc(doc(db, "books", id.toString()), cleanData);
        } catch (e) {
            console.error("Error updating book:", e);
        }
    };

    const addReadingSession = async (sessionData: Omit<ReadingSession, 'id' | 'timestamp'>) => {
        try {
            await addDoc(collection(db, "reading_sessions"), {
                ...sessionData,
                timestamp: Date.now(),
            });
        } catch (e) {
            console.error("Error adding reading session:", e);
        }
    };

    const deleteUserSessions = async (firstName: string, lastName: string, groupName: string) => {
        try {
            // Simple approach: filter local and delete from DB
            // Better approach would be a query but for now docs are thin
            const sessionsToDelete = readingSessions.filter(s =>
                s.firstName === firstName && s.lastName === lastName && s.groupName === groupName
            );

            for (const session of sessionsToDelete) {
                await deleteDoc(doc(db, "reading_sessions", session.id));
            }
        } catch (e) {
            console.error("Error deleting user sessions:", e);
        }
    };

    const updateUserSessions = async (
        oldId: { firstName: string, lastName: string, groupName: string },
        newId: { firstName: string, lastName: string, groupName: string }
    ) => {
        try {
            const sessionsToUpdate = readingSessions.filter(s =>
                s.firstName === oldId.firstName && s.lastName === oldId.lastName && s.groupName === oldId.groupName
            );

            for (const session of sessionsToUpdate) {
                await updateDoc(doc(db, "reading_sessions", session.id), newId);
            }
        } catch (e) {
            console.error("Error updating user sessions:", e);
        }
    };

    const addAiTopic = async (topic: AiTopic) => {
        try {
            const cleanData = removeUndefined(topic);
            await setDoc(doc(db, "ai_topics", topic.id), cleanData);
        } catch (e) {
            console.error("Error adding AI topic:", e);
        }
    };

    const updateAiTopic = async (id: string, updatedFields: Partial<AiTopic>) => {
        try {
            const cleanData = removeUndefined(updatedFields);
            await updateDoc(doc(db, "ai_topics", id), cleanData);
        } catch (e) {
            console.error("Error updating AI topic:", e);
        }
    };

    const deleteAiTopic = async (id: string) => {
        try {
            await deleteDoc(doc(db, "ai_topics", id));
        } catch (e) {
            console.error("Error deleting AI topic:", e);
        }
    };

    const addStudent = async (student: Student) => {
        try {
            const cleanData = removeUndefined(student);
            await setDoc(doc(db, "students", student.id), cleanData);
        } catch (e) {
            console.error("Error adding student:", e);
        }
    };

    const updateStudent = async (id: string, updatedFields: Partial<Student>) => {
        try {
            const cleanData = removeUndefined(updatedFields);
            await updateDoc(doc(db, "students", id), cleanData);
        } catch (e) {
            console.error("Error updating student:", e);
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            await deleteDoc(doc(db, "students", id));
        } catch (e) {
            console.error("Error deleting student:", e);
        }
    };

    const addAiAccessLog = async (logData: Omit<AiAccessLog, 'id' | 'timestamp'>) => {
        try {
            await addDoc(collection(db, "ai_access_logs"), {
                ...logData,
                timestamp: Date.now(),
            });
        } catch (e) {
            console.error("Error adding AI access log:", e);
        }
    };

    const setActiveReader = async (data: Omit<ActiveReader, 'id' | 'timestamp'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, "active_readers"), {
                ...data,
                timestamp: Date.now(),
            });
            return docRef.id;
        } catch (e) {
            console.error("Error setting active reader:", e);
            return '';
        }
    };

    const removeActiveReader = async (id: string) => {
        try {
            if (id) {
                await deleteDoc(doc(db, "active_readers", id));
            }
        } catch (e) {
            console.error("Error removing active reader:", e);
        }
    };

    const updateActiveReaderTimestamp = async (id: string) => {
        try {
            if (id) {
                await updateDoc(doc(db, "active_readers", id), { timestamp: Date.now() });
            }
        } catch (e) {
            console.error("Error updating active reader timestamp:", e);
        }
    };

    // Auto-clean stale active_readers (older than 5 minutes)
    useEffect(() => {
        const interval = setInterval(() => {
            const fiveMinAgo = Date.now() - 5 * 60 * 1000;
            activeReaders.forEach(reader => {
                if (reader.timestamp < fiveMinAgo) {
                    deleteDoc(doc(db, "active_readers", reader.id)).catch(() => { });
                }
            });
        }, 60 * 1000); // Check every minute
        return () => clearInterval(interval);
    }, [activeReaders]);

    return (
        <BookContext.Provider
            value={{
                categories: mergedCategories,
                books,
                readingSessions,
                aiTopics,
                addBook,
                deleteBook,
                updateBook,
                addCategory,
                deleteCategory,
                updateCategory,
                addReadingSession,
                deleteUserSessions,
                updateUserSessions,
                addAiTopic,
                updateAiTopic,
                deleteAiTopic,
                students,
                addStudent,
                updateStudent,
                deleteStudent,
                aiAccessLogs,
                addAiAccessLog,
                activeReaders,
                setActiveReader,
                removeActiveReader,
                updateActiveReaderTimestamp,
            }}
        >
            {children}
        </BookContext.Provider>
    );
}

export function useBooks() {
    const context = useContext(BookContext);
    if (context === undefined) {
        throw new Error("useBooks must be used within a BookProvider");
    }
    return context;
}
