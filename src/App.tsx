/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { BookProvider } from "./context/BookContext";

// Lazy load all pages - they will be loaded only when navigated to
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const AILawSection = lazy(() => import("./pages/AILawSection").then(m => ({ default: m.AILawSection })));
const BookDetails = lazy(() => import("./pages/BookDetails").then(m => ({ default: m.BookDetails })));
const PDFReader = lazy(() => import("./pages/PDFReader").then(m => ({ default: m.PDFReader })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ArchitectureDocs = lazy(() => import("./pages/ArchitectureDocs").then(m => ({ default: m.ArchitectureDocs })));
const CategoryPage = lazy(() => import("./pages/CategoryPage").then(m => ({ default: m.CategoryPage })));
const CatalogPage = lazy(() => import("./pages/CatalogPage").then(m => ({ default: m.CatalogPage })));
const SavedBooks = lazy(() => import("./pages/SavedBooks").then(m => ({ default: m.SavedBooks })));

// Loading spinner component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BookProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/docs" element={<ArchitectureDocs />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="categories" element={<CatalogPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="ai-law" element={<AILawSection />} />
              <Route path="books/:id" element={<BookDetails />} />
              <Route path="saved" element={<SavedBooks />} />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900">404</h1>
                    <p className="text-slate-500">Sahifa topilmadi</p>
                  </div>
                }
              />
            </Route>
            <Route path="/reader/:id" element={<PDFReader />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </BookProvider>
  );
}
