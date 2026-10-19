// ═══════════════════════════════════════════════════════════════════════════
//  PATCH: Dashboard.tsx — CardPenumpang download button
//  Ganti bagian `{canDownload && ( ... )}` dengan kode di bawah ini
//  (cari baris: `{canDownload && (` di dalam return CardPenumpang)
// ═══════════════════════════════════════════════════════════════════════════

// ── SEBELUM (ganti bagian ini):
/*
  {canDownload && (
    <button
      onClick={onDownload}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 transition-all text-sm"
    >
      <Download size={16} /> Download E-Tiket
    </button>
  )}
*/

// ── SESUDAH (ganti dengan ini):
{canDownload && (
  <button
    onClick={onDownload}
    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm text-white hover:-translate-y-0.5 active:scale-95 transition-all"
    style={{
      background: "linear-gradient(135deg, #2563EB, #1A4B8C)",
      boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
    }}
  >
    <Download size={16} /> Unduh E-Tiket
  </button>
)}


// ═══════════════════════════════════════════════════════════════════════════
//  FILE BARU: Tambahkan ke src/pages/
//  - TiketPage.tsx   → halaman tiket dengan preview kartu desain baru
//
//  FILE BARU: Tambahkan ke backend src/main/java/com/mudik/resource/
//  - TiketResource.java  → endpoint GET /api/tiket/download/{id}
//                          generate PNG tiket dengan desain baru
//
//  DEPENDENCY BACKEND (tambah ke pom.xml):
//  <dependency>
//    <groupId>com.google.zxing</groupId>
//    <artifactId>core</artifactId>
//    <version>3.5.3</version>
//  </dependency>
//  <dependency>
//    <groupId>com.google.zxing</groupId>
//    <artifactId>javase</artifactId>
//    <version>3.5.3</version>
//  </dependency>
//
//  DEPENDENCY FRONTEND (install jika belum ada):
//  npm install qrcode
//  npm install --save-dev @types/qrcode
//
//  ROUTE: Tambahkan ke App.tsx / router:
//  <Route path="/tiket" element={<TiketPage />} />
// ═══════════════════════════════════════════════════════════════════════════