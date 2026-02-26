import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  hint,
  id,
  required,
  className = '',
  ...props
}, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm transition-colors
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2
          ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20'
          }
          ${className}
        `}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default Input
