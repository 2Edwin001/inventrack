import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAlerts } from '../../context/AlertContext'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/inventario': 'Inventario',
  '/movimientos': 'Movimientos',
  '/sedes': 'Sedes',
  '/reportes': 'Reportes',
}

export default function Header() {
  const { pathname } = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { alertCount } = useAlerts()
  const [search, setSearch] = useState('')

  const title = PAGE_TITLES[pathname] ?? 'InvenTrack'

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-100 bg-white px-6 dark:border-gray-700/60 dark:bg-gray-800">
      {/* Page title */}
      <h1 className="shrink-0 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos, sedes..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Alert bell */}
        <button
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Alertas de stock bajo"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>

        {/* User avatar */}
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white select-none">
          U
        </div>
      </div>
    </header>
  )
}
