import { useState } from 'react'
import Spinner from './Spinner'
import EmptyState from './EmptyState'

const MAX_VISIBLE = 5

function getPageRange(current, total) {
  if (total <= MAX_VISIBLE) return Array.from({ length: total }, (_, i) => i + 1)
  const half = Math.floor(MAX_VISIBLE / 2)
  let start = Math.max(1, current - half)
  const end = Math.min(total, start + MAX_VISIBLE - 1)
  start = Math.max(1, end - MAX_VISIBLE + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export default function Table({
  columns = [],
  data = [],
  loading = false,
  pageSize = 10,
  emptyTitle,
  emptyDescription,
}) {
  const [page, setPage] = useState(1)

  const total = data.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const rows = data.slice(start, start + pageSize)
  const pageRange = getPageRange(safePage, totalPages)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white dark:divide-gray-700/50 dark:bg-gray-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/30"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${col.className ?? ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {start + 1}–{Math.min(start + pageSize, total)} de {total} registros
          </span>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-lg px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              ←
            </button>

            {pageRange[0] > 1 && (
              <>
                <button
                  onClick={() => setPage(1)}
                  className="rounded-lg px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  1
                </button>
                {pageRange[0] > 2 && (
                  <span className="px-2 text-gray-400">…</span>
                )}
              </>
            )}

            {pageRange.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  p === safePage
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}

            {pageRange[pageRange.length - 1] < totalPages && (
              <>
                {pageRange[pageRange.length - 1] < totalPages - 1 && (
                  <span className="px-2 text-gray-400">…</span>
                )}
                <button
                  onClick={() => setPage(totalPages)}
                  className="rounded-lg px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
