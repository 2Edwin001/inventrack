const variants = {
  green:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800/30',
  yellow:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/30',
  red:
    'bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800/30',
  gray:
    'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:ring-gray-600',
  blue:
    'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800/30',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
        text-xs font-medium ring-1 ring-inset
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
