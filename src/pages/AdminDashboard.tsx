import React, { useState } from "react";
import { motion } from "framer-motion";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import {
  BarChart3,
  BookOpen,
  Users,
  Settings,
  Plus,
  Upload,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
  AlertCircle,
  LayoutDashboard,
  Shield,
  LogOut,
  Eye,
  EyeOff,
  User as UserIcon,
  Lock,
  GraduationCap,
  Sparkles,
  FileDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooks, IconMap, Category, ReadingSession, AiTopic } from "@/context/BookContext";

/**
 * Extracts the Google Drive file ID from various URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/edit
 * - https://drive.google.com/uc?id=FILE_ID
 * - Raw FILE_ID string (25+ alphanumeric chars)
 */
function extractDriveFileId(input: string): string | null {
  if (!input || !input.trim()) return null;
  const trimmed = input.trim();

  // Pattern 1: /d/FILE_ID/ or /d/FILE_ID (end of string)
  const dPattern = /\/d\/([a-zA-Z0-9_-]{10,})/;
  const dMatch = trimmed.match(dPattern);
  if (dMatch) return dMatch[1];

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  const idPattern = /[?&]id=([a-zA-Z0-9_-]{10,})/;
  const idMatch = trimmed.match(idPattern);
  if (idMatch) return idMatch[1];

  // Pattern 3: /folders/FILE_ID
  const folderPattern = /\/folders\/([a-zA-Z0-9_-]{10,})/;
  const folderMatch = trimmed.match(folderPattern);
  if (folderMatch) return folderMatch[1];

  // Pattern 4: Raw file ID (only alphanumeric, hyphens, underscores, 10+ chars)
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;

  return null;
}

const CATEGORY_COLORS = [
  { label: 'Moviy', value: 'bg-blue-100 text-blue-600', dotClass: 'bg-blue-500' },
  { label: 'Binafsha', value: 'bg-indigo-100 text-indigo-600', dotClass: 'bg-indigo-500' },
  { label: 'Siyohrang', value: 'bg-purple-100 text-purple-600', dotClass: 'bg-purple-500' },
  { label: 'Pushti', value: 'bg-pink-100 text-pink-600', dotClass: 'bg-pink-500' },
  { label: 'Och pushti', value: 'bg-rose-100 text-rose-600', dotClass: 'bg-rose-500' },
  { label: 'Qizil', value: 'bg-red-100 text-red-600', dotClass: 'bg-red-500' },
  { label: 'To\'q sariq', value: 'bg-orange-100 text-orange-600', dotClass: 'bg-orange-500' },
  { label: 'Qahrabo', value: 'bg-amber-100 text-amber-600', dotClass: 'bg-amber-500' },
  { label: 'Sariq', value: 'bg-yellow-100 text-yellow-600', dotClass: 'bg-yellow-500' },
  { label: 'Yashil', value: 'bg-green-100 text-green-600', dotClass: 'bg-green-500' },
  { label: 'Zumrad', value: 'bg-emerald-100 text-emerald-600', dotClass: 'bg-emerald-500' },
  { label: 'Firuza', value: 'bg-teal-100 text-teal-600', dotClass: 'bg-teal-500' },
  { label: 'Havorang', value: 'bg-cyan-100 text-cyan-600', dotClass: 'bg-cyan-500' },
  { label: 'Och ko\'k', value: 'bg-sky-100 text-sky-600', dotClass: 'bg-sky-500' },
  { label: 'Kulrang', value: 'bg-slate-100 text-slate-600', dotClass: 'bg-slate-500' },
];

const ICON_TRANSLATIONS: Record<string, string> = {
  Briefcase: "Portfel (Ish/Biznes)",
  Landmark: "Davlat binosi (Nazariya)",
  Leaf: "Barg (Ekologiya/Tabiat)",
  Users: "Odamlar guruhi",
  FileText: "Hujjat (Qonun/Matn)",
  Shield: "Qalqon (Himoya)",
  Gavel: "Sud bolg'achasi",
  Scale: "Adolat tarozisi",
  FileSearch: "Hujjat qidirish",
  BookOpen: "Ochiq kitob",
  Settings: "Sozlamalar",
  LayoutDashboard: "Panel",
  GraduationCap: "Akademik shapka",
  Library: "Kutubxona binosi",
  Fingerprint: "Barmoq izi",
  Building2: "Zamonaviy bino"
};

const AI_TOPIC_COLORS = [
  { label: 'Indigo-Moviy', value: 'from-indigo-500 to-blue-500' },
  { label: 'Binafsha-Pushti', value: 'from-purple-500 to-pink-500' },
  { label: 'Qizil-To\'q sariq', value: 'from-rose-500 to-orange-500' },
  { label: 'Qahrabo-Sariq', value: 'from-amber-500 to-yellow-500' },
  { label: 'Zumrad-Firuza', value: 'from-emerald-500 to-teal-500' },
  { label: 'Havorang-Moviy', value: 'from-cyan-500 to-blue-600' },
  { label: 'Moviy-Binafsha', value: 'from-blue-500 to-violet-500' },
  { label: 'Yashil-Zumrad', value: 'from-green-500 to-emerald-500' },
  { label: 'Pushti-Qizil', value: 'from-pink-500 to-red-500' },
];

const AI_TOPIC_ICONS = [
  { label: 'Miya (BrainCircuit)', value: 'BrainCircuit' },
  { label: 'Tarozi (Scale)', value: 'Scale' },
  { label: 'Qalqon ogohlantirish (ShieldAlert)', value: 'ShieldAlert' },
  { label: 'Uchqun (Sparkles)', value: 'Sparkles' },
  { label: 'Ma\'lumotlar bazasi (Database)', value: 'Database' },
  { label: 'Qulf (Lock)', value: 'Lock' },
  { label: 'Kitob (BookOpen)', value: 'BookOpen' },
];

export function AdminDashboard() {
  const {
    categories,
    books,
    readingSessions,
    aiTopics,
    addBook,
    deleteBook,
    updateBook,
    addCategory,
    deleteCategory,
    updateCategory,
    addAiTopic,
    updateAiTopic,
    deleteAiTopic,
    deleteUserSessions,
    updateUserSessions,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    aiAccessLogs
  } = useBooks();


  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | number | null>(null);
  const [editingCategorySlug, setEditingCategorySlug] = useState<string | null>(null);
  const [editingUserIdentity, setEditingUserIdentity] = useState<{ firstName: string, lastName: string, groupName: string } | null>(null);

  // AI Topics Form State
  const [showAiTopicModal, setShowAiTopicModal] = useState(false);
  const [editingAiTopicId, setEditingAiTopicId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newTopicIconName, setNewTopicIconName] = useState("BrainCircuit");
  const [newTopicColor, setNewTopicColor] = useState("from-indigo-500 to-blue-500");

  // Student Management State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [newStudentFirstName, setNewStudentFirstName] = useState("");
  const [newStudentLastName, setNewStudentLastName] = useState("");
  const [newStudentGroupName, setNewStudentGroupName] = useState("");
  const [newStudentAccessCode, setNewStudentAccessCode] = useState("");

  const resetStudentForm = () => {
    setNewStudentFirstName("");
    setNewStudentLastName("");
    setNewStudentGroupName("");
    setNewStudentAccessCode("");
    setEditingStudentId(null);
    setShowStudentModal(false);
  };

  const generate8DigitCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleSaveStudent = () => {
    if (!newStudentFirstName || !newStudentLastName || !newStudentGroupName || !newStudentAccessCode) return;

    if (editingStudentId) {
      updateStudent(editingStudentId, {
        firstName: newStudentFirstName,
        lastName: newStudentLastName,
        groupName: newStudentGroupName,
        accessCode: newStudentAccessCode
      });
    } else {
      addStudent({
        id: Date.now().toString(),
        firstName: newStudentFirstName,
        lastName: newStudentLastName,
        groupName: newStudentGroupName,
        accessCode: newStudentAccessCode
      });
    }
    resetStudentForm();
  };

  const handleEditStudentClick = (student: any) => {
    setEditingStudentId(student.id);
    setNewStudentFirstName(student.firstName);
    setNewStudentLastName(student.lastName);
    setNewStudentGroupName(student.groupName);
    setNewStudentAccessCode(student.accessCode);
    setShowStudentModal(true);
  };

  const resetAiTopicForm = () => {
    setNewTopicTitle("");
    setNewTopicDescription("");
    setNewTopicIconName("BrainCircuit");
    setNewTopicColor("from-indigo-500 to-blue-500");
    setEditingAiTopicId(null);
    setShowAiTopicModal(false);
  };

  const handleEditAiTopicClick = (topic: AiTopic) => {
    setEditingAiTopicId(topic.id);
    setNewTopicTitle(topic.title);
    setNewTopicDescription(topic.description);
    setNewTopicIconName(topic.iconName);
    setNewTopicColor(topic.color);
    setShowAiTopicModal(true);
  };

  const handleSaveAiTopic = () => {
    if (!newTopicTitle || !newTopicDescription) return;
    const id = editingAiTopicId || newTopicTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const topicData: AiTopic = {
      id,
      title: newTopicTitle,
      description: newTopicDescription,
      iconName: newTopicIconName,
      color: newTopicColor,

    };
    if (editingAiTopicId) {
      updateAiTopic(editingAiTopicId, topicData);
    } else {
      addAiTopic(topicData);
    }
    resetAiTopicForm();
  };

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('syt-admin-auth') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === "texnikum" && loginPassword === "admin66") {
      sessionStorage.setItem('syt-admin-auth', 'true');
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Login yoki parol noto'g'ri");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('syt-admin-auth');
    setIsAuthenticated(false);
  };

  // Add Book Form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Biznes huquqi");
  const [newCover, setNewCover] = useState("");
  const [newDriveLink, setNewDriveLink] = useState("");
  const [newFormat, setNewFormat] = useState("PDF");
  const [newLanguage, setNewLanguage] = useState("O'zbek");
  const [newYear, setNewYear] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newSizeUnit, setNewSizeUnit] = useState("MB");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  // Add Category Form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIconName, setNewCategoryIconName] = useState("BookOpen");
  const [newCategoryColor, setNewCategoryColor] = useState("bg-blue-100 text-blue-600");
  const [newCategoryGroup, setNewCategoryGroup] = useState<'maxsus' | 'umumtalim' | 'badiiy'>('maxsus');

  const resetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryIconName("BookOpen");
    setNewCategoryColor("bg-blue-100 text-blue-600");
    setNewCategoryGroup('maxsus');
    setEditingCategorySlug(null);
    setShowCategoryModal(false);
  };

  const handleEditCategoryClick = (category: Category) => {
    setEditingCategorySlug(category.slug);
    setNewCategoryName(category.name);
    setNewCategoryIconName(category.iconName);
    setNewCategoryColor(category.color);
    setNewCategoryGroup(category.group || 'maxsus');
    setShowCategoryModal(true);
  };

  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryIconName || !newCategoryColor) return;

    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCategory: Category = {
      name: newCategoryName,
      iconName: newCategoryIconName,
      color: newCategoryColor,
      slug: editingCategorySlug || slug,
      group: newCategoryGroup,
    };

    if (editingCategorySlug) {
      updateCategory(editingCategorySlug, newCategory);
    } else {
      let finalSlug = slug;
      if (categories.some(c => c.slug === slug)) {
        finalSlug = `${slug}-${Date.now()}`;
      }
      addCategory({ ...newCategory, slug: finalSlug });
    }

    resetCategoryForm();
  };

  // User Edit Form state
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [selectedAdminBosqich, setSelectedAdminBosqich] = useState("");
  const [selectedAdminGuruh, setSelectedAdminGuruh] = useState("");

  const resetUserForm = () => {
    setNewFirstName("");
    setNewLastName("");
    setSelectedAdminBosqich("");
    setSelectedAdminGuruh("");
    setEditingUserIdentity(null);
    setShowUserModal(false);
  };

  const handleEditUserClick = (user: any) => {
    setEditingUserIdentity({
      firstName: user.firstName,
      lastName: user.lastName,
      groupName: user.groupName
    });
    setNewFirstName(user.firstName);
    setNewLastName(user.lastName);
    // Parse existing group name to pre-select bosqich and guruh
    const bosqichMatch = user.groupName.match(/(\d+)-bosqich/);
    const guruhMatch = user.groupName.match(/(\d+)-guruh/);
    setSelectedAdminBosqich(bosqichMatch ? bosqichMatch[1] : "");
    setSelectedAdminGuruh(guruhMatch ? guruhMatch[1] : "");
    setShowUserModal(true);
  };

  const handleUpdateUser = () => {
    if (!newFirstName || !newLastName || !selectedAdminBosqich || !selectedAdminGuruh || !editingUserIdentity) return;
    const newGroupName = `${selectedAdminBosqich}-bosqich, ${selectedAdminGuruh}-guruh`;
    updateUserSessions(editingUserIdentity, {
      firstName: newFirstName,
      lastName: newLastName,
      groupName: newGroupName
    });
    resetUserForm();
  };

  const resetForm = () => {
    setNewTitle("");
    setNewAuthor("");
    setNewCover("");
    setNewDriveLink("");
    setNewFormat("PDF");
    setNewLanguage("O'zbek");
    setNewYear("");
    setNewSize("");
    setNewSizeUnit("MB");
    setEditingBookId(null);
    setShowAddModal(false);
  };

  const handleEditClick = (book: any) => {
    setEditingBookId(book.id);
    setNewTitle(book.title);
    setNewAuthor(book.author || "");
    setNewCategory(book.category);
    setNewCover(book.cover || "");
    setNewFormat(book.format || "PDF");
    setNewLanguage(book.language || "O'zbek");
    setNewYear(book.year?.toString() || "");

    // Parse size and unit
    const sizeMatch = book.size?.match(/([\d.,]+)\s*(MB|KB|B|Bayt|Bit)/i);
    if (sizeMatch) {
      setNewSize(sizeMatch[1]);
      setNewSizeUnit(sizeMatch[2].toUpperCase());
    } else {
      setNewSize(book.size || "");
      setNewSizeUnit("MB");
    }

    // Restore Drive link from saved fileId
    setNewDriveLink(book.fileId ? `https://drive.google.com/file/d/${book.fileId}/view` : "");
    setShowAddModal(true);
  };

  const handleAddBook = () => {
    if (!newTitle) return;

    // Convert Category name to slug
    const slugMap: Record<string, string> = {};
    categories.forEach(c => slugMap[c.name] = c.slug);

    const newBookCategorySlug = slugMap[newCategory] || "boshqa";
    const dateStr = new Date().toISOString().split('T')[0];

    const driveFileId = extractDriveFileId(newDriveLink);
    const defaultCover = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600";

    if (editingBookId) {
      updateBook(editingBookId, {
        title: newTitle,
        author: newAuthor,
        category: newCategory,
        categorySlug: newBookCategorySlug,
        cover: newCover || defaultCover,
        fileId: driveFileId || undefined,
        format: newFormat,
        language: newLanguage,
        year: newYear ? parseInt(newYear) : undefined,
        size: newSize ? `${newSize} ${newSizeUnit}` : undefined,
      });
    } else {
      const newBook = {
        id: Date.now().toString(),
        title: newTitle,
        author: newAuthor,
        category: newCategory,
        categorySlug: newBookCategorySlug,
        cover: newCover || defaultCover,
        date: dateStr,
        status: "Faol",
        fileId: driveFileId || undefined,
        format: newFormat,
        language: newLanguage,
        year: newYear ? parseInt(newYear) : new Date().getFullYear(),
        size: newSize ? `${newSize} ${newSizeUnit}` : undefined,
      };
      addBook(newBook);
    }

    resetForm();
  };

  // Calculate Users Stats
  const usersStats = React.useMemo(() => {
    const userMap = new Map<string, { firstName: string, lastName: string, groupName: string, name: string, group: string, reads: number, status: string, lastRead: number, readBooks: Map<string, number> }>();

    readingSessions.forEach(session => {
      const key = `${session.firstName}-${session.lastName}-${session.groupName}`.toLowerCase();
      const existing = userMap.get(key);
      const book = books.find(b => b.id.toString() === session.bookId.toString());
      const bookTitle = book ? book.title : "Noma'lum kitob";

      if (existing) {
        existing.reads += 1;
        existing.readBooks.set(bookTitle, (existing.readBooks.get(bookTitle) || 0) + 1);
        if (session.timestamp > existing.lastRead) {
          existing.lastRead = session.timestamp;
        }
      } else {
        const readBooks = new Map<string, number>();
        readBooks.set(bookTitle, 1);

        userMap.set(key, {
          firstName: session.firstName,
          lastName: session.lastName,
          groupName: session.groupName,
          name: `${session.firstName} ${session.lastName}`,
          group: session.groupName,
          reads: 1,
          status: "Faol",
          lastRead: session.timestamp,
          readBooks
        });
      }
    });

    return Array.from(userMap.values()).map(user => ({
      ...user,
      readBooks: Array.from(user.readBooks.entries()).map(([title, count]) => ({ title, count }))
    })).sort((a, b) => b.lastRead - a.lastRead);
  }, [readingSessions, books]);

  const handleDeleteUser = (user: any) => {
    if (window.confirm(`${user.name}ning barcha o'qish statistikasini o'chirmoqchimisiz?`)) {
      deleteUserSessions(user.firstName, user.lastName, user.groupName);
    }
  };

  const exportUsersToDocx = async () => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

    const borderStyle = {
      style: BorderStyle.SINGLE,
      size: 1,
      color: "999999",
    };
    const cellBorders = {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
    };

    // Table header row
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: 500, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "№", bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 2500, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "Ism va familiya", bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 2000, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "Guruh", bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 3500, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "O'qilgan kitoblar", bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 1500, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "Jami o'qishlar", bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 2000, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "Oxirgi faollik", bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
        }),
      ],
    });

    // Data rows
    const dataRows = usersStats.map((user, index) => {
      const lastReadDate = new Date(user.lastRead);
      const lastReadStr = `${lastReadDate.getDate().toString().padStart(2, '0')}.${(lastReadDate.getMonth() + 1).toString().padStart(2, '0')}.${lastReadDate.getFullYear()} ${lastReadDate.getHours().toString().padStart(2, '0')}:${lastReadDate.getMinutes().toString().padStart(2, '0')}`;
      const booksStr = user.readBooks.map((rb: any) => `${rb.title} (${rb.count} marta)`).join(", ");

      return new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: `${index + 1}`, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: user.name, size: 20 })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: user.group, size: 20 })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: booksStr, size: 18 })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: `${user.reads}`, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: lastReadStr, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
        ],
      });
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Surxondaryo yuridik texnikumi kutubxonasi",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "Foydalanuvchilar o'qish statistikasi hisoboti",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: `Sana: ${dateStr}`,
                  size: 20,
                  italics: true,
                  color: "666666",
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({ text: `Jami foydalanuvchilar: `, size: 20 }),
                new TextRun({ text: `${usersStats.length} ta`, bold: true, size: 20 }),
              ],
            }),
            new Paragraph({
              spacing: { after: 300 },
              children: [
                new TextRun({ text: `Jami o'qishlar soni: `, size: 20 }),
                new TextRun({ text: `${readingSessions.length} ta`, bold: true, size: 20 }),
              ],
            }),
            new Table({
              rows: [headerRow, ...dataRows],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Kutubxona_hisobot_${dateStr.replace(/\./g, '-')}.docx`);
  };

  const activeUsersCount = usersStats.filter(u => Date.now() - u.lastRead < 7 * 24 * 60 * 60 * 1000).length; // Active in last 7 days

  const readsTodayCount = readingSessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.timestamp);
    return sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear();
  }).length;

  const stats = [
    {
      title: "Jami kitoblar",
      value: books.length.toLocaleString(),
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Faol foydalanuvchilar (7 kun)",
      value: activeUsersCount.toString(),
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Bugun o'qilgan",
      value: readsTodayCount.toString(),
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-slate-100 p-8 space-y-6">
          <div className="text-center space-y-3 pb-4">
            <div className="mx-auto w-16 h-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-blue-200">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Panelga Kirish</h1>
            <p className="text-slate-500 text-sm">Tizimni boshqarish uchun login va parolingizni kiriting</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Login</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showLogin ? "text" : "password"}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Loginni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLogin(!showLogin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showLogin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Parolni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-red-500 text-sm font-medium animate-shake">{loginError}</p>}
            <Button type="submit" className="w-full py-6 bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 active:translate-y-0">
              Kirish
            </Button>
          </form>
          <Link to="/" className="block text-center mt-4">
            <Button type="button" variant="link" className="text-slate-500 hover:text-blue-600">
              Bosh sahifaga qaytish
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col space-y-6 md:flex-row md:space-x-8 md:space-y-0 p-3 sm:p-6 md:p-8 pt-6 md:pt-12 bg-white">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col md:min-h-[calc(100vh-8rem)]">
        <div className="mb-4 md:mb-8 px-4">
          <h2 className="text-lg font-bold text-slate-900">Boshqaruv Paneli</h2>
          <p className="text-sm text-slate-500">Admin huquqlari</p>
        </div>

        <nav className="flex px-4 md:px-0 space-x-2 md:space-x-0 md:flex-col md:space-y-1 overflow-x-auto pb-4 md:pb-0 scrollbar-hide flex-1">
          <Button
            variant={activeTab === "overview" ? "secondary" : "ghost"}
            className={`flex-shrink-0 md:w-full justify-start rounded-xl whitespace-nowrap ${activeTab === "overview" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600"}`}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 className="mr-2 md:mr-3 h-5 w-5" />
            Umumiy ko'rinish
          </Button>
          <Button
            variant={activeTab === "categories" ? "secondary" : "ghost"}
            className={`flex-shrink-0 md:w-full justify-start rounded-xl whitespace-nowrap ${activeTab === "categories" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600"}`}
            onClick={() => setActiveTab("categories")}
          >
            <LayoutDashboard className="mr-2 md:mr-3 h-5 w-5" />
            Kategoriyalar
          </Button>
          <Button
            variant={activeTab === "users" ? "secondary" : "ghost"}
            className={`flex-shrink-0 md:w-full justify-start rounded-xl whitespace-nowrap ${activeTab === "users" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600"}`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 md:mr-3 h-5 w-5" />
            Foydalanuvchilar
          </Button>
          <Button
            variant={activeTab === "ai-topics" ? "secondary" : "ghost"}
            className={`flex-shrink-0 md:w-full justify-start rounded-xl whitespace-nowrap ${activeTab === "ai-topics" ? "bg-purple-50 text-purple-700 hover:bg-purple-100" : "text-slate-600"}`}
            onClick={() => setActiveTab("ai-topics")}
          >
            <Sparkles className="mr-2 md:mr-3 h-5 w-5" />
            AI & Huquq
          </Button>
        </nav>

        <div className="md:mt-auto pt-4 md:pt-6 border-t border-slate-100 pl-4 md:pl-0 mt-4">
          <Button
            variant="outline"
            className="flex-shrink-0 md:w-full justify-start rounded-xl whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 md:mr-3 h-5 w-5" />
            <span className="font-medium">Chiqish</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8 px-4 md:px-0">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeTab === "overview" && "Umumiy ko'rinish"}
            {activeTab === "books" && "Kitoblar boshqaruvi"}
            {activeTab === "categories" && "Kategoriyalar boshqaruvi"}
            {activeTab === "users" && "Foydalanuvchilar statistikasi"}
            {activeTab === "ai-topics" && "AI & Huquq bo'limlari"}
            {activeTab === "settings" && "Tizim sozlamalari"}
            {activeTab === "students" && "Talabalar boshqaruvi"}
          </h1>

          {activeTab === "books" && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-full shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" /> Yangi kitob qo'shish
            </Button>
          )}

          {activeTab === "categories" && (
            <Button
              onClick={() => setShowCategoryModal(true)}
              className="bg-[#3B82F6] hover:bg-[#2563EB] rounded-full shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" /> Yangi kategoriya qo'shish
            </Button>
          )}

          {activeTab === "ai-topics" && (
            <Button
              onClick={() => setShowAiTopicModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full shadow-md text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Yangi mavzu qo'shish
            </Button>
          )}

          {activeTab === "users" && (
            <Button
              onClick={() => exportUsersToDocx()}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-md text-white"
            >
              <FileDown className="mr-2 h-4 w-4" /> Word hisobot
            </Button>
          )}
        </div>

        {/* Add Book Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingBookId ? "Kitobni tahrirlash" : "Yangi kitob qo'shish"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                >
                  <Plus className="h-5 w-5 rotate-45 text-slate-500" />
                </Button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Kitob nomi
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Masalan: Fuqarolik huquqi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Muallif
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Masalan: H. Rahmonqulov"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Kategoriya
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.slug} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Muqova rasmi
                  </label>
                  <div className="flex items-center gap-4">
                    {newCover && (
                      <img src={newCover} alt="Muqova" className="w-16 h-20 object-cover rounded-lg border border-slate-200 shadow-sm" />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50">
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">{newCover ? "Boshqa rasm tanlash" : "Rasm tanlash"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Google Drive Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    📎 Google Drive havola
                  </label>
                  <p className="text-xs text-slate-400">
                    Google Drive dan faylning Share havolasini bu yerga yopishtiring
                  </p>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={newDriveLink}
                      onChange={(e) => setNewDriveLink(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all ${newDriveLink && extractDriveFileId(newDriveLink)
                        ? 'border-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-green-50/50'
                        : newDriveLink && !extractDriveFileId(newDriveLink)
                          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/50'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      placeholder="https://drive.google.com/file/d/.../view"
                    />
                  </div>
                  {newDriveLink && extractDriveFileId(newDriveLink) && (
                    <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                      <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[10px]">✓</span>
                      Fayl topildi! ID: <code className="bg-green-100 px-1.5 py-0.5 rounded text-[11px]">{extractDriveFileId(newDriveLink)}</code>
                    </div>
                  )}
                  {newDriveLink && !extractDriveFileId(newDriveLink) && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Havola noto'g'ri. Google Drive share havolasini kiriting.
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Nashr yili
                    </label>
                    <input
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Masalan: 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Fayl hajmi
                    </label>
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Masalan: 2.5"
                    />
                    <select
                      value={newSizeUnit}
                      onChange={(e) => setNewSizeUnit(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white text-sm"
                    >
                      <option value="MB">MB</option>
                      <option value="KB">KB</option>
                      <option value="B">Bayt</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Kitob formati
                    </label>
                    <input
                      type="text"
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Masalan: PDF, EPUB"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Kitob tili
                    </label>
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Masalan: O'zbek, Rus"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl"
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleAddBook}
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl"
                >
                  Saqlash
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCategorySlug ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetCategoryForm}
                >
                  <Plus className="h-5 w-5 rotate-45 text-slate-500" />
                </Button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Kategoriya nomi
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Masalan: Ma'muriy huquq"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Kategoriya Ikonkasi
                  </label>
                  <select
                    value={newCategoryIconName}
                    onChange={(e) => setNewCategoryIconName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    {Object.keys(IconMap).map(iconName => (
                      <option key={iconName} value={iconName}>
                        {ICON_TRANSLATIONS[iconName] || iconName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Bo'lim rangi
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomColor = CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
                        setNewCategoryColor(randomColor.value);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Avtomatik tanlash
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewCategoryColor(color.value)}
                        title={color.label}
                        className={`
                          h-10 w-full rounded-xl flex items-center justify-center transition-all
                          ${newCategoryColor === color.value
                            ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                            : 'hover:scale-105 border border-slate-200'}
                          ${color.value.split(' ')[0]}
                        `}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.dotClass}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Bo'lim
                  </label>
                  <select
                    value={newCategoryGroup}
                    onChange={(e) => setNewCategoryGroup(e.target.value as 'maxsus' | 'umumtalim' | 'badiiy')}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="maxsus">Maxsus fanlar darsliklari</option>
                    <option value="umumtalim">Umumta'lim fanlari</option>
                    <option value="badiiy">Badiiy adabiyotlar</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={resetCategoryForm}
                  className="rounded-xl"
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleAddCategory}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] rounded-xl text-white"
                >
                  Saqlash
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* User Edit Modal */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900">Foydalanuvchini tahrirlash</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetUserForm}
                >
                  <Plus className="h-5 w-5 rotate-45 text-slate-500" />
                </Button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ism</label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ismni kiriting"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Familiya</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Familiyani kiriting"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Bosqich</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <select
                        value={selectedAdminBosqich}
                        onChange={(e) => setSelectedAdminBosqich(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white appearance-none"
                      >
                        <option value="">Tanlang</option>
                        {[1, 2].map((b) => (
                          <option key={b} value={b}>{b}-bosqich</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Guruh</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={selectedAdminGuruh}
                        onChange={(e) => setSelectedAdminGuruh(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0-25"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={resetUserForm}
                  className="rounded-xl"
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl text-white"
                >
                  Saqlash
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stats Grid */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className={`p-3 sm:p-4 rounded-2xl ${stat.bg} mr-3 sm:mr-4`}>
                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {stat.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Recent Uploads Table */}
        {(activeTab === "overview" || activeTab === "books") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  So'nggi yuklanganlar
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium w-1/4">Kitob nomi</th>
                      <th className="px-6 py-4 font-medium w-1/5">Kategoriya</th>
                      <th className="px-6 py-4 font-medium w-1/6">Sana</th>
                      <th className="px-6 py-4 font-medium w-1/6">Yil</th>
                      <th className="px-6 py-4 font-medium w-1/6">Holat</th>
                      <th className="px-6 py-4 font-medium text-right w-1/12">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr
                        key={book.id}
                        className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-[200px]">
                          {book.title}
                        </td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">
                          {book.category}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {book.date}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {book.year || "Noma'lum"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block w-fit ${book.status === "Faol"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {book.status}
                            </span>
                            {book.fileId ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 inline-block w-fit">
                                📎 Drive
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400 inline-block w-fit">
                                Fayl yo'q
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-blue-600"
                              onClick={() => handleEditClick(book)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600"
                              onClick={() => {
                                if (window.confirm("Rostdan ham bu kitobni o'chirmoqchimisiz?")) {
                                  deleteBook(book.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Students Tab Content */}
        {activeTab === "students" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Talabalar boshqaruvi</h2>
              <Button
                onClick={() => {
                  resetStudentForm();
                  setShowStudentModal(true);
                }}
                className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" /> Talaba qo'shish
              </Button>
            </div>

            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">F.I.SH</th>
                      <th className="px-6 py-4 font-medium">Guruh</th>
                      <th className="px-6 py-4 font-medium">Guruh kodi (8 xonali)</th>
                      <th className="px-6 py-4 font-medium text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? students.map((student) => (
                      <tr key={student.id} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {student.groupName}
                        </td>
                        <td className="px-6 py-4">
                          <code className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-mono font-bold tracking-wider">
                            {student.accessCode}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-blue-600"
                              onClick={() => handleEditStudentClick(student)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600"
                              onClick={() => {
                                if (window.confirm("Talabani o'chirib tashlamoqchimisiz?")) {
                                  deleteStudent(student.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                          Talabalar topilmadi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* AI Access Logs */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">AI Bo'limiga kirish jurnali</h3>
              <Card className="border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Foydalanuvchi</th>
                        <th className="px-6 py-4 font-medium">Guruh</th>
                        <th className="px-6 py-4 font-medium">Bo'lim</th>
                        <th className="px-6 py-4 font-medium">Vaqt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiAccessLogs.length > 0 ? [...aiAccessLogs].sort((a, b) => b.timestamp - a.timestamp).map((log) => (
                        <tr key={log.id} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{log.studentName}</td>
                          <td className="px-6 py-4 text-slate-600">{log.studentGroup}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                              {log.topicTitle}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {new Date(log.timestamp).toLocaleString('uz-UZ')}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                            Hozircha kirishlar qayd etilmagan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Categories Tab Content */}
        {activeTab === "categories" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Maxsus fanlar darsliklari */}
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Maxsus fanlar darsliklari
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium w-2/5">Ikonka & Nom</th>
                      <th className="px-6 py-4 font-medium w-1/5">Rang</th>
                      <th className="px-6 py-4 font-medium w-1/5">Kitoblar</th>
                      <th className="px-6 py-4 font-medium text-right w-1/5">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.filter(c => c.group === 'maxsus').map((cat) => {
                      const IconComponent = IconMap[cat.iconName] || BookOpen;
                      return (
                        <tr
                          key={cat.slug}
                          className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${cat.color}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            {cat.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`w-32 h-8 rounded-lg bg-gradient-to-r from-${cat.color.split('-')[1]}-500 to-${cat.color.split('-')[1]}-400 shadow-sm`} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">{books.filter(b => b.categorySlug === cat.slug).length}</span>
                              <button
                                onClick={() => {
                                  resetForm();
                                  setNewCategory(cat.name);
                                  setShowAddModal(true);
                                }}
                                className="p-1 hover:bg-purple-50 rounded-full transition-colors group"
                                title="Yangi kitob qo'shish"
                              >
                                <Plus className="h-4 w-4 text-purple-400 group-hover:text-purple-600" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                onClick={() => handleEditCategoryClick(cat)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm("Kategoriyani o'chirib tashlamoqchimisiz?")) {
                                    deleteCategory(cat.slug);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Umumta'lim fanlari */}
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-blue-100 bg-blue-50/50 px-6 py-4">
                <CardTitle className="text-lg font-semibold text-blue-800">
                  Umumta'lim fanlari
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium w-2/5">Ikonka & Nom</th>
                      <th className="px-6 py-4 font-medium w-1/5">Rang</th>
                      <th className="px-6 py-4 font-medium w-1/5">Kitoblar</th>
                      <th className="px-6 py-4 font-medium text-right w-1/5">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.filter(c => c.group === 'umumtalim').map((cat) => {
                      const IconComponent = IconMap[cat.iconName] || BookOpen;
                      return (
                        <tr
                          key={cat.slug}
                          className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${cat.color}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            {cat.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`w-32 h-8 rounded-lg bg-gradient-to-r from-${cat.color.split('-')[1]}-500 to-${cat.color.split('-')[1]}-400 shadow-sm`} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">{books.filter(b => b.categorySlug === cat.slug).length}</span>
                              <button
                                onClick={() => {
                                  resetForm();
                                  setNewCategory(cat.name);
                                  setShowAddModal(true);
                                }}
                                className="p-1 hover:bg-purple-50 rounded-full transition-colors group"
                                title="Yangi kitob qo'shish"
                              >
                                <Plus className="h-4 w-4 text-purple-400 group-hover:text-purple-600" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                onClick={() => handleEditCategoryClick(cat)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm("Kategoriyani o'chirib tashlamoqchimisiz?")) {
                                    deleteCategory(cat.slug);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Badiiy adabiyotlar bo'limi */}
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-pink-100 bg-pink-50/50 px-6 py-4">
                <CardTitle className="text-lg font-semibold text-pink-800">
                  Badiiy adabiyotlar
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium w-2/5">Ikonka & Nom</th>
                      <th className="px-6 py-4 font-medium w-1/5">Rang</th>
                      <th className="px-6 py-4 font-medium w-1/5">Kitoblar</th>
                      <th className="px-6 py-4 font-medium text-right w-1/5">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.filter(c => c.group === 'badiiy').map((cat) => {
                      const IconComponent = IconMap[cat.iconName] || BookOpen;
                      return (
                        <tr
                          key={cat.slug}
                          className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${cat.color}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            {cat.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`w-32 h-8 rounded-lg bg-gradient-to-r from-${cat.color.split('-')[1]}-500 to-${cat.color.split('-')[1]}-400 shadow-sm`} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">{books.filter(b => b.categorySlug === cat.slug).length}</span>
                              <button
                                onClick={() => {
                                  setNewCategory(cat.name);
                                  setShowAddModal(true);
                                }}
                                className="p-1 hover:bg-purple-50 rounded-full transition-colors group"
                                title="Yangi kitob qo'shish"
                              >
                                <Plus className="h-4 w-4 text-purple-400 group-hover:text-purple-600" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                onClick={() => handleEditCategoryClick(cat)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm("Kategoriyani o'chirib tashlamoqchimisiz?")) {
                                    deleteCategory(cat.slug);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Foydalanuvchilar ro'yxati
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Foydalanuvchi izlash..."
                    className="h-9 w-48 sm:w-64 rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium w-1/5">Ism va Familiya</th>
                      <th className="px-6 py-4 font-medium w-1/6">Guruh</th>
                      <th className="px-6 py-4 font-medium w-1/3">O'qilgan kitoblar</th>
                      <th className="px-6 py-4 font-medium w-1/6">Oxirgi faollik</th>
                      <th className="px-6 py-4 font-medium w-1/12">Holat</th>
                      <th className="px-6 py-4 font-medium text-right w-1/12">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersStats.length > 0 ? usersStats.map((user, idx) => (
                      <tr
                        key={idx}
                        className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {user.group}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-500 mb-1">
                              Jami: {user.reads} marta kirgan
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {user.readBooks.map((book, i) => (
                                <span key={i} className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
                                  {book.title} ({book.count} marta)
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(user.lastRead).toLocaleString('uz-UZ', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${user.status === "Faol" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEditUserClick(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteUser(user)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Hali o'quvchilar yo'q
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Student Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingStudentId ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
                </h2>
                <Button variant="ghost" size="icon" onClick={resetStudentForm}>
                  <Plus className="h-5 w-5 rotate-45 text-slate-500" />
                </Button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Ism</label>
                    <input
                      type="text"
                      value={newStudentFirstName}
                      onChange={(e) => setNewStudentFirstName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Masalan: Ali"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Familiya</label>
                    <input
                      type="text"
                      value={newStudentLastName}
                      onChange={(e) => setNewStudentLastName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Masalan: Valiyev"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Guruh</label>
                  <input
                    type="text"
                    value={newStudentGroupName}
                    onChange={(e) => setNewStudentGroupName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Masalan: 201-guruh"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Guruh kodi (8 xonali)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStudentAccessCode}
                      maxLength={8}
                      onChange={(e) => setNewStudentAccessCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 font-mono text-lg tracking-wider focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="12345678"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewStudentAccessCode(generate8DigitCode())}
                      className="rounded-xl px-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                    >
                      Generatsiya
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={resetStudentForm} className="rounded-xl">
                  Bekor qilish
                </Button>
                <Button onClick={handleSaveStudent} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl">
                  Saqlash
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Topic Modal */}
        {showAiTopicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingAiTopicId ? "Mavzuni tahrirlash" : "Yangi mavzu qo'shish"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetAiTopicForm}
                >
                  <Plus className="h-5 w-5 rotate-45 text-slate-500" />
                </Button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Mavzu nomi
                  </label>
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Masalan: Kiberjinoyatchilik"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Tavsif
                  </label>
                  <textarea
                    value={newTopicDescription}
                    onChange={(e) => setNewTopicDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Mavzu haqida qisqacha tavsif..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Ikonka
                  </label>
                  <select
                    value={newTopicIconName}
                    onChange={(e) => setNewTopicIconName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all bg-white"
                  >
                    {AI_TOPIC_ICONS.map(icon => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 block pb-1">
                    Gradient rangi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AI_TOPIC_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewTopicColor(color.value)}
                        className={`
                          h-10 w-full rounded-xl flex items-center justify-center transition-all text-xs font-medium text-white
                          bg-gradient-to-r ${color.value}
                          ${newTopicColor === color.value
                            ? 'ring-2 ring-purple-500 ring-offset-2 scale-105'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'}
                        `}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>


              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={resetAiTopicForm}
                  className="rounded-xl"
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleSaveAiTopic}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-xl text-white"
                >
                  Saqlash
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Topics Tab Content */}
        {activeTab === "ai-topics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-purple-100 bg-purple-50/50 px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-purple-800">
                  O'rganish yo'nalishlari
                </CardTitle>
                <span className="text-sm text-purple-500">{aiTopics.length} ta mavzu</span>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium w-1/4">Mavzu nomi</th>
                      <th className="px-6 py-4 font-medium w-1/4">Tavsif</th>
                      <th className="px-6 py-4 font-medium w-1/8">Ikonka</th>
                      <th className="px-6 py-4 font-medium w-1/8">Rang</th>
                      <th className="px-6 py-4 font-medium w-1/8">Kitoblar</th>
                      <th className="px-6 py-4 font-medium text-right w-1/8">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiTopics.length > 0 ? aiTopics.map((topic) => {
                      const topicSlug = `ai-${topic.id}`;
                      const topicBooks = books.filter(b => b.categorySlug === topicSlug);
                      return (
                        <tr
                          key={topic.id}
                          className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl bg-gradient-to-br ${topic.color} text-white`}>
                                {(() => {
                                  const Icon = IconMap[topic.iconName] || BookOpen;
                                  return <Icon className="h-4 w-4" />;
                                })()}
                              </div>
                              {topic.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 max-w-[250px]">
                            <p className="line-clamp-2">{topic.description}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <span className="font-mono text-xs p-1 bg-slate-100 rounded">{topic.iconName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`h-6 w-full rounded-lg bg-gradient-to-r ${topic.color}`} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700">{topicBooks.length}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                                onClick={() => {
                                  setNewCategory(topic.title);
                                  setEditingBookId(null);
                                  setShowAddModal(true);
                                }}
                                title="Kitob qo'shish"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-purple-600"
                                onClick={() => handleEditAiTopicClick(topic)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm("Bu mavzuni o'chirib tashlamoqchimisiz?")) {
                                    deleteAiTopic(topic.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          Hali mavzular yo'q. Yangi mavzu qo'shing.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </main>


    </div >
  );
}
