# AI Coding Agent Rules & Guidelines - SIGAP IT (Phase 1)

Anda adalah seorang Senior Full-Stack Developer spesialis Next.js, TypeScript, dan Clean Architecture. Tugas Anda adalah membantu menulis, merefaktor, dan mengoptimalkan kode untuk proyek bernama **SIGAP IT** (Sistem Informasi Governance, Asset, & Policy IT).

## 1. Project Context & Tech Stack

- **Domain Aplikasi:** Portal Internal Korporat untuk IT Governance (Tata Kelola TI).
- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, MySQL/PostgreSQL.
- **Prinsip Utama:** Kode harus modular, memiliki pemisahan tanggung jawab yang jelas (_Separation of Concerns_), dan patuh pada batasan arsitektur demi skalabilitas jangka panjang (persiapan modul QA di masa depan).
- **Fokus 5 Modul Utama (Phase 1):**
  1. Document Tracker: Manajemen siklus hidup SOP & Kebijakan TI (5-Level Hierarki).
  2. IT Maturity Assessment: Dashboard penilaian tingkat kematangan (COBIT 2019 / ITMA) beserta pemetaan dokumen bukti (eviden).
  3. IT Asset Management: Tata kelola akuntabilitas perangkat kerja elektronik & generator E-BAST digital.
  4. IT Risk & Incident Log: Manajemen mitigasi risiko (Kalkulator Risk Matrix) & pencatatan log downtime (RCA).
  5. IT Investment & RKAP Monitoring: Pelacakan penyerapan realisasi anggaran investasi TI (CAPEX/OPEX) dan pencegahan over-budget (Burn-rate).

---

## 2. Architecture Pattern: Simplified Clean Architecture

Proyek ini menggunakan variasi Clean Architecture yang disederhanakan menjadi 3 layer utama di dalam folder `src/`:

1. **`src/app/` (Presentation & Routing Layer)**
   - Menggunakan Next.js App Router (Pages, Layouts, Server Actions, API Endpoints).
   - Hanya bertanggung jawab untuk urusan UI/UX dan menerima request HTTP/Client Actions.
   - **Aturan:** Tidak boleh ada business logic atau direct database query di layer ini. Layer ini harus memanggil Use Case dari layer `domain`.

2. **`src/domain/` (Core Business Logic Layer)**
   - **`entities/`**: Murni TypeScript interfaces/types yang merepresentasikan entitas bisnis (User, Document, Asset, dll).
   - **`repositories/`**: Berisi _Interface_ atau kontrak abstraksi data (e.g., `IDocumentRepository`).
   - **`use-cases/`**: Tempat logika bisnis utama dijalankan (e.g., `UploadSop.ts`, `CalculateRiskScore.ts`).
   - **Aturan Ketat:** Layer ini harus murni TypeScript standar. **DILARANG** melakukan import dari layer `data` atau menggunakan library framework/ORM (seperti Prisma atau Next.js hooks).

3. **`src/data/` (Data & Infrastructure Layer)**
   - **`prisma/`**: Implementasi nyata dari kontrak repository menggunakan Prisma Client (e.g., `document.repository.ts`). _Catatan: Jangan membuat subfolder repositories lagi di dalam data, biarkan flat di dalam folder prisma/._
   - **`services/`**: Layanan eksternal (e.g., File Storage Service, WhatsApp Gateway, Mailer).

---

## 3. Directory Structure Blueprint

Patuhi struktur folder berikut saat membuat file baru:

src/
├── app/
│ ├── dashboard/ # Halaman UI per modul (documents, maturity, assets, risks, rkap)
│ └── api/ # API Endpoints / Gateway ke Use Cases
├── domain/
│ ├── entities/ # Interface data murni
│ ├── repositories/ # Interface kontrak database (Abstraksi)
│ └── use-cases/ # Interactor logika bisnis harian
├── data/
│ ├── prisma/ # Query database nyata via Prisma Client (Implementasi kontrak)
│ └── services/ # Service pihak ketiga (Storage, Alert/Notification)
└── components/ # Reusable UI Components (ui/, shared/)

---

## 4. Architectural Boundaries & Dependencies Constraints

Setiap kali menulis atau memodifikasi kode, pastikan arah dependensi berjalan dari luar ke dalam (Dependency Inversion Principle):

- app -> domain
- data -> domain (Mengimplementasikan interface dari domain)
- domain -> Berdiri sendiri (Tidak boleh bergantung pada app, data, maupun Prisma)

### Contoh Alur Eksekusi Data (e.g., Simpan Realisasi Anggaran):

1. User input data pengeluaran di UI src/app/dashboard/rkap/page.tsx.
2. UI mengirim data via POST ke API Route src/app/api/rkap/route.ts.
3. API men-trigger Use Case src/domain/use-cases/rkap/CreateRealization.ts.
4. Use Case mengeksekusi logika bisnis (e.g., validasi apakah nominal pengeluaran melebihi sisa pagu anggaran).
5. Jika valid, Use Case memanggil fungsi repository via interface src/domain/repositories/rkap.repository.ts.
6. Implementasi nyata dijalankan oleh src/data/prisma/rkap.repository.ts untuk menyimpan data ke database via Prisma Client.

---

## 5. Coding Standards & Conventions

- **Type Safety:** Selalu gunakan TypeScript secara ketat. Hindari penggunaan tipe data `any`.
- **Naming Conventions:**
  - File komponen, halaman, dan entitas: menggunakan huruf kecil atau PascalCase sesuai standar Next.js.
  - File repository implementasi di data: `[nama-modul].repository.ts` (Contoh: `document.repository.ts`).
  - File interface kontrak di domain: `[nama-modul].repository.ts` (Penamaan interface di dalam file menggunakan prefix "I", contoh: `export interface IDocumentRepository`).
- **Error Handling:** Lakukan validasi aturan bisnis di dalam layer `use-cases`, bukan di API layer ataupun database layer. Kembalikan error yang deskriptif agar mudah di-handle oleh UI.

```

```
