const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-10 w-10 border-[3px]',
}

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`
        animate-spin rounded-full
        border-gray-200 border-t-indigo-600
        dark:border-gray-700 dark:border-t-indigo-400
        ${sizes[size]}
        ${className}
      `}
    />
  )
}
