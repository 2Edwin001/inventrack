export default function Card({ children, className = '', title, action, ...props }) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700/60">
          {title && (
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
