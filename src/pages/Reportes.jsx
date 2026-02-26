import Card from '../components/Card'

const reportTypes = [
  {
    title: 'Stock por sede',
    description: 'Inventario actual agrupado por cada sede.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    title: 'Movimientos del período',
    description: 'Entradas y salidas en un rango de fechas.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    title: 'Alertas de stock bajo',
    description: 'Productos que están por debajo del mínimo.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  },
  {
    title: 'Historial de auditoría',
    description: 'Registro completo de cambios y responsables.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
  },
]

export default function Reportes() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Genera y exporta reportes del inventario.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reportTypes.map((r) => (
          <button
            key={r.title}
            className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${r.color}`}>
              {r.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{r.title}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
              <span className="mt-2 inline-block text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Generar reporte →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
