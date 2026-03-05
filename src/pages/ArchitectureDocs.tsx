import { motion } from "framer-motion"
import { FileCode2, Database, Server, ShieldCheck, LayoutTemplate, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ArchitectureDocs() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Tizim Arxitekturasi va Hujjatlar</h1>
        <p className="text-lg text-slate-600">Surxondaryo Yuridik Texnikumi Raqamli Kutubxonasi texnik spetsifikatsiyasi</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-2">
            <LayoutTemplate className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">1. Folder Structure (Frontend - Next.js)</h2>
          </div>
          <Card className="bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto">
            <CardContent className="p-6">
              <pre>{`src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (admin)/
│   │   ├── dashboard/page.tsx
│   │   └── books/page.tsx
│   ├── (main)/
│   │   ├── catalog/page.tsx
│   │   ├── ai-law/page.tsx
│   │   └── book/[id]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/          # shadcn components
│   ├── layout/      # Navbar, Sidebar, Footer
│   ├── books/       # BookCard, PDFViewer
│   └── admin/       # Admin tables, forms
├── lib/
│   ├── utils.ts
│   ├── api.ts
│   └── store.ts     # Zustand or Redux
├── types/
│   └── index.ts
└── styles/
    └── globals.css`}</pre>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-2">
            <Server className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-800">2. Backend Modul Struktura (NestJS)</h2>
          </div>
          <Card className="bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto">
            <CardContent className="p-6">
              <pre>{`src/
├── app.module.ts
├── main.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── roles.guard.ts
│   ├── users/
│   ├── books/
│   │   ├── books.controller.ts
│   │   ├── books.service.ts
│   │   └── dto/
│   ├── categories/
│   ├── upload/      # S3 or Local file storage
│   └── ai-recommendations/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── common/
    ├── decorators/
    ├── filters/
    └── interceptors/`}</pre>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-2">
            <FileCode2 className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-800">3. API Endpointlar Ro'yxati</h2>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                <tr>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-3 font-mono text-blue-600">POST</td><td className="px-4 py-3 font-mono">/auth/login</td><td className="px-4 py-3">User login</td><td className="px-4 py-3">Public</td></tr>
                <tr><td className="px-4 py-3 font-mono text-green-600">GET</td><td className="px-4 py-3 font-mono">/books</td><td className="px-4 py-3">Get all books (paginated)</td><td className="px-4 py-3">Public</td></tr>
                <tr><td className="px-4 py-3 font-mono text-green-600">GET</td><td className="px-4 py-3 font-mono">/books/:id</td><td className="px-4 py-3">Get book details</td><td className="px-4 py-3">Public</td></tr>
                <tr><td className="px-4 py-3 font-mono text-blue-600">POST</td><td className="px-4 py-3 font-mono">/books</td><td className="px-4 py-3">Upload new book</td><td className="px-4 py-3">Admin</td></tr>
                <tr><td className="px-4 py-3 font-mono text-green-600">GET</td><td className="px-4 py-3 font-mono">/categories</td><td className="px-4 py-3">List categories</td><td className="px-4 py-3">Public</td></tr>
                <tr><td className="px-4 py-3 font-mono text-purple-600">GET</td><td className="px-4 py-3 font-mono">/ai/recommendations</td><td className="px-4 py-3">Get AI book suggestions</td><td className="px-4 py-3">User</td></tr>
              </tbody>
            </table>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-2">
            <Database className="h-6 w-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-slate-800">4. Database Schema (Prisma)</h2>
          </div>
          <Card className="bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto">
            <CardContent className="p-6">
              <pre>{`generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(STUDENT)
  bookmarks Bookmark[]
  createdAt DateTime @default(now())
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  icon        String?
  books       Book[]
}

model Book {
  id          String   @id @default(uuid())
  title       String
  author      String
  description String?
  pdfUrl      String
  coverUrl    String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  tags        String[]
  isFeatured  Boolean  @default(false)
  readsCount  Int      @default(0)
  bookmarks   Bookmark[]
  createdAt   DateTime @default(now())
}

model Bookmark {
  id        String   @id @default(uuid())
  userId    String
  bookId    String
  user      User     @relation(fields: [userId], references: [id])
  book      Book     @relation(fields: [bookId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, bookId])
}`}</pre>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-2">
            <Layers className="h-6 w-6 text-rose-600" />
            <h2 className="text-2xl font-bold text-slate-800">5. Rust Microservice (Axum) - PDF Validation</h2>
          </div>
          <Card className="bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto">
            <CardContent className="p-6">
              <pre>{`// main.rs
use axum::{
    routing::post,
    Router,
    extract::Multipart,
    response::Json,
};
use serde_json::{Value, json};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/validate-pdf", post(validate_pdf));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    println!("Rust microservice listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn validate_pdf(mut multipart: Multipart) -> Json<Value> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        if name == "file" {
            let data = field.bytes().await.unwrap();
            // Perform fast PDF signature validation
            if data.len() > 4 && &data[0..4] == b"%PDF" {
                return Json(json!({ "valid": true, "message": "Valid PDF format" }));
            } else {
                return Json(json!({ "valid": false, "message": "Invalid file format" }));
            }
        }
    }
    Json(json!({ "valid": false, "message": "No file provided" }))
}`}</pre>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-2">
            <ShieldCheck className="h-6 w-6 text-teal-600" />
            <h2 className="text-2xl font-bold text-slate-800">6. Authentication Flow</h2>
          </div>
          <Card className="bg-white p-6 border-slate-200">
            <ol className="list-decimal list-inside space-y-3 text-slate-700">
              <li><strong>Login Request:</strong> Client sends email/password to <code className="bg-slate-100 px-1 rounded">/auth/login</code></li>
              <li><strong>Validation:</strong> NestJS validates credentials against PostgreSQL (bcrypt hash comparison).</li>
              <li><strong>Token Generation:</strong> If valid, server generates JWT Access Token (15m expiry) and Refresh Token (7d expiry).</li>
              <li><strong>Storage:</strong> Access token stored in memory/session, Refresh token stored in HttpOnly Secure Cookie.</li>
              <li><strong>Access Control:</strong> Protected routes use <code className="bg-slate-100 px-1 rounded">JwtAuthGuard</code>. Admin routes use <code className="bg-slate-100 px-1 rounded">RolesGuard</code> checking <code className="bg-slate-100 px-1 rounded">user.role === 'ADMIN'</code>.</li>
              <li><strong>Token Refresh:</strong> When Access Token expires, client calls <code className="bg-slate-100 px-1 rounded">/auth/refresh</code> using the HttpOnly cookie to get a new Access Token.</li>
            </ol>
          </Card>
        </section>
      </div>
    </div>
  )
}
