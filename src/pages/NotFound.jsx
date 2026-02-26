import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-900">
      <p className="text-8xl font-black text-indigo-600 dark:text-indigo-400 select-none">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver al Dashboard
      </Link>
    </div>
  )
}
