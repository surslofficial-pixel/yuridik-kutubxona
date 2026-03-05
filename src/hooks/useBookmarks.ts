import { useState, useEffect } from "react";
import { Book } from "@/context/BookContext";

const BOOKMARKS_KEY = "syt_bookmarks";

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<Book[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(BOOKMARKS_KEY);
            if (stored) {
                setBookmarks(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load bookmarks", e);
        }
    }, []);

    const toggleBookmark = (book: Book) => {
        setBookmarks((prev) => {
            const isBookmarked = prev.some((b) => b.id.toString() === book.id.toString());
            let newBookmarks;
            if (isBookmarked) {
                newBookmarks = prev.filter((b) => b.id.toString() !== book.id.toString());
            } else {
                newBookmarks = [...prev, book];
            }
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
            return newBookmarks;
        });
    };

    const isBookmarked = (id: string | number) => {
        return bookmarks.some((b) => b.id.toString() === id.toString());
    };

    return { bookmarks, toggleBookmark, isBookmarked };
}
