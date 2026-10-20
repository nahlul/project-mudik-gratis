import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 30,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  itemLabel = 'pendaftar',
  className = '',
}: PaginationProps) {
  // Calculate displayed record range (e.g. 1–30 of 1627)
  const from = totalItems !== undefined && totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const to =
    totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  // Generate pagination pages array: e.g. [1, 2, '...', 55] or [1, '...', 4, 5, 6, '...', 55]
  const pages = useMemo<(number | '...')[]>(() => {
    if (totalPages <= 1) return [1];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // When on first few pages (e.g. page 1, 2, 3)
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }

    // When near the end
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    // In the middle
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 bg-white border border-slate-200 rounded-b-xl shadow-xs text-sm ${className}`}
    >
      {/* Left: Summary text & Per halaman dropdown */}
      <div className="flex flex-wrap items-center gap-3 text-slate-500">
        {totalItems !== undefined && (
          <span>
            Menampilkan <strong className="text-slate-900 font-semibold">{from}–{to}</strong> dari{' '}
            <strong className="text-slate-900 font-semibold">{totalItems}</strong> {itemLabel}
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            {totalItems !== undefined && <span className="text-slate-300">|</span>}
            <label htmlFor="pagination-per-page" className="text-slate-500 text-xs sm:text-sm">
              Per halaman:
            </label>
            <div className="relative">
              <select
                id="pagination-per-page"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-md px-2.5 py-1 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500 transition appearance-none"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Numeric & Directional Pagination Controls */}
      <div className="flex items-center gap-1 select-none">
        {/* First page button « */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
          title="Halaman Pertama"
          aria-label="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page button < */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
          title="Halaman Sebelumnya"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 font-medium select-none">
              …
            </span>
          ) : (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-sm transition flex items-center justify-center font-medium ${
                p === currentPage
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next page button > */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
          title="Halaman Berikutnya"
          aria-label="Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page button » */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
          title="Halaman Terakhir"
          aria-label="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
