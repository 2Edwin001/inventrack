import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useMovimientos } from '../hooks/useMovimientos'
import { useSedes } from '../hooks/useSedes'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

// ─── Constantes ──────────────────────────────────────────────

const PAGE_SIZE = 20

// ─── Helpers ─────────────────────────────────────────────────

const fmtDate = (d) =>
  new Date(d).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

function getStockVariant(stock, minimo) {
  const min = minimo ?? 0
  if (stock <= min) return 'red'
  if (stock <= min * 2) return 'yellow'
  return 'green'
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500'

// ─── Paginación ───────────────────────────────────────────────

const MAX_VIS = 5
function getRange(cur, total) {
  if (total <= MAX_VIS) return Array.from({ length: total }, (_, i) => i + 1)
  const half = Math.floor(MAX_VIS / 2)
  let start = Math.max(1, cur - half)
  const end = Math.min(total, start + MAX_VIS - 1)
  start = Math.max(1, end - MAX_VIS + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function Pagination({ page, totalPages, count, onPageChange }) {
  if (totalPages <= 1) return null
  const range = getRange(page, totalPages)
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, count)

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm dark:border-gray-700">
      <span className="text-gray-500 dark:text-gray-400">{from}–{to} de {count} registros</span>
      <div className="flex items-center gap-0.5">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700">←</button>
        {range[0] > 1 && (<><button onClick={() => onPageChange(1)} className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">1</button>{range[0] > 2 && <span className="px-1 text-gray-400">…</span>}</>)}
        {range.map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>{p}</button>
        ))}
        {range[range.length - 1] < totalPages && (<>{range[range.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}<button onClick={() => onPageChange(totalPages)} className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">{totalPages}</button></>)}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700">→</button>
      </div>
    </div>
  )
}

// ─── Autocomplete de item ─────────────────────────────────────

function ItemSearch({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Búsqueda con debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('items')
        .select('id, nombre, codigo, stock, stock_minimo, sedes(nombre)')
        .or(`nombre.ilike.%${query.trim()}%,codigo.ilike.%${query.trim()}%`)
        .order('nombre')
        .limit(8)
      setSuggestions(data ?? [])
      setOpen(true)
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  function selectItem(item) {
    onChange(item)
    setQuery('')
    setOpen(false)
    setSuggestions([])
  }

  function clearItem() {
    onChange(null)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Item seleccionado
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-indigo-300 bg-indigo-50 p-3.5 dark:border-indigo-700 dark:bg-indigo-900/20">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-800/40">
          <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">{value.nombre}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {value.codigo}
            {value.sedes?.nombre ? ` · ${value.sedes.nombre}` : ''}
            {' · '}Stock:
            <span className={`ml-1 font-semibold ${value.stock <= (value.stock_minimo ?? 0) ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
              {value.stock}
            </span>
          </p>
        </div>
        <Badge variant={getStockVariant(value.stock, value.stock_minimo)}>
          {value.stock}
        </Badge>
        <button
          type="button"
          onClick={clearItem}
          title="Cambiar producto"
          className="ml-1 rounded-lg p-1 text-gray-400 hover:bg-indigo-100 hover:text-gray-600 dark:hover:bg-indigo-800/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Buscar producto por nombre o código…"
          autoComplete="off"
          className={`${inputCls} pl-9 pr-9`}
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Sin resultados para &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectItem(item)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.codigo}
                        {item.sedes?.nombre ? ` · ${item.sedes.nombre}` : ''}
                      </p>
                    </div>
                    <Badge variant={getStockVariant(item.stock, item.stock_minimo)}>
                      {item.stock}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Formulario de registro ───────────────────────────────────

function MovimientoForm({ onSuccess }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [tipo, setTipo] = useState('ENTRADA')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const cantidadNum = parseInt(cantidad) || 0
  const stockInsuficiente =
    tipo === 'SALIDA' && selectedItem != null && cantidadNum > selectedItem.stock

  // Auto-ocultar banner de éxito
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(false), 4000)
    return () => clearTimeout(t)
  }, [success])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!selectedItem) return setError('Selecciona un producto.')
    if (!cantidad || cantidadNum < 1) return setError('La cantidad debe ser al menos 1.')
    if (stockInsuficiente)
      return setError(`Stock insuficiente. Disponible: ${selectedItem.stock} unidades.`)

    setSubmitting(true)
    try {
      const { error: rpcErr } = await supabase.rpc('registrar_movimiento', {
        p_item_id: selectedItem.id,
        p_tipo: tipo,
        p_cantidad: cantidadNum,
        p_motivo: motivo.trim() || null,
        p_usuario_id: null,
      })
      if (rpcErr) throw rpcErr

      setSelectedItem(null)
      setCantidad('')
      setMotivo('')
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Registrar movimiento
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Banner de éxito */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">
              Movimiento registrado. El stock fue actualizado automáticamente.
            </p>
          </div>
        )}

        {/* Buscador de item */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Producto <span className="text-red-500">*</span>
          </label>
          <ItemSearch value={selectedItem} onChange={setSelectedItem} />
        </div>

        {/* Selector visual de tipo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* ENTRADA */}
            <button
              type="button"
              onClick={() => setTipo('ENTRADA')}
              className={`flex items-center justify-center gap-2.5 rounded-xl border-2 px-4 py-3.5 font-semibold text-sm transition-all ${
                tipo === 'ENTRADA'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0-15l-4.5 4.5M12 4.5l4.5 4.5" />
              </svg>
              ENTRADA
            </button>

            {/* SALIDA */}
            <button
              type="button"
              onClick={() => setTipo('SALIDA')}
              className={`flex items-center justify-center gap-2.5 rounded-xl border-2 px-4 py-3.5 font-semibold text-sm transition-all ${
                tipo === 'SALIDA'
                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 15l-4.5-4.5M12 19.5l4.5-4.5" />
              </svg>
              SALIDA
            </button>
          </div>
        </div>

        {/* Cantidad + Motivo */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cantidad */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="0"
              className={`${inputCls} ${stockInsuficiente ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
            />
            {/* Indicador de stock disponible en SALIDA */}
            {tipo === 'SALIDA' && selectedItem && (
              <p className={`text-xs ${stockInsuficiente ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {stockInsuficiente
                  ? `Máximo disponible: ${selectedItem.stock} unidades`
                  : `Disponible: ${selectedItem.stock} unidades`}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivo
              <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Compra, venta, ajuste…"
              className={inputCls}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Botón submit */}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            loading={submitting}
            disabled={!selectedItem || !cantidad || stockInsuficiente}
            className="min-w-[180px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Registrar movimiento
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────

export default function Movimientos() {
  // Filtros del historial
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [filtroSede, setFiltroSede] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: sedes } = useSedes()
  const { data: movimientos, count, loading, error, refetch } = useMovimientos({
    tipo: filtroTipo,
    fechaDesde,
    fechaHasta,
    sedeId: filtroSede,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = Math.ceil(count / PAGE_SIZE)

  // Re-fetch al registrar un movimiento nuevo
  function handleMovimientoRegistrado() {
    setRefreshKey((k) => k + 1)
    setPage(1)
    refetch()
  }

  function updateFiltroTipo(t) {
    setFiltroTipo(t)
    setPage(1)
  }

  function clearFiltros() {
    setFiltroTipo('TODOS')
    setFechaDesde('')
    setFechaHasta('')
    setFiltroSede('')
    setPage(1)
  }

  const filtrosActivos =
    (filtroTipo !== 'TODOS' ? 1 : 0) +
    (fechaDesde ? 1 : 0) +
    (fechaHasta ? 1 : 0) +
    (filtroSede ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Movimientos</h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Registra entradas y salidas de inventario.
        </p>
      </div>

      {/* Formulario de registro */}
      <MovimientoForm key={refreshKey} onSuccess={handleMovimientoRegistrado} />

      {/* Historial */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
        {/* Header con filtros */}
        <div className="flex flex-wrap items-start gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Historial
              {!loading && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({count} {count === 1 ? 'registro' : 'registros'})
                </span>
              )}
            </h3>
          </div>

          {/* Botones tipo */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
            {[
              { key: 'TODOS', label: 'Todos', activeClass: 'bg-indigo-600 text-white' },
              { key: 'ENTRADA', label: 'Entradas', activeClass: 'bg-emerald-600 text-white' },
              { key: 'SALIDA', label: 'Salidas', activeClass: 'bg-amber-500 text-white' },
            ].map(({ key, label, activeClass }) => (
              <button
                key={key}
                onClick={() => updateFiltroTipo(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filtroTipo === key
                    ? activeClass
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Fila de filtros adicionales */}
        <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 bg-gray-50/50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900/20">
          {/* Desde */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(e) => { setFechaDesde(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Hasta */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(e) => { setFechaHasta(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Sede */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sede</label>
            <select
              value={filtroSede}
              onChange={(e) => { setFiltroSede(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Limpiar */}
          {filtrosActivos > 0 && (
            <button
              onClick={clearFiltros}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar ({filtrosActivos})
            </button>
          )}
        </div>

        {/* Tabla */}
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <p className="py-10 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && movimientos.length === 0 && (
          <EmptyState
            title="Sin movimientos"
            description={
              filtrosActivos > 0
                ? 'No hay movimientos que coincidan con los filtros aplicados.'
                : 'Aún no hay movimientos registrados.'
            }
            action={
              filtrosActivos > 0 && (
                <button
                  onClick={clearFiltros}
                  className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Limpiar filtros
                </button>
              )
            }
          />
        )}

        {!loading && !error && movimientos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/40">
                  {['Fecha', 'Producto', 'Código', 'Tipo', 'Cantidad', 'Motivo'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white dark:divide-gray-700/50 dark:bg-gray-800">
                {movimientos.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {fmtDate(m.fecha)}
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {m.items?.nombre ?? '—'}
                      </p>
                      {m.items?.sedes?.nombre && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {m.items.sedes.nombre}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {m.items?.codigo ?? '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={m.tipo === 'ENTRADA' ? 'green' : 'yellow'}>
                        {m.tipo === 'ENTRADA' ? '↑ ENTRADA' : '↓ SALIDA'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${m.tipo === 'ENTRADA' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {m.tipo === 'ENTRADA' ? '+' : '−'}{m.cantidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {m.motivo || <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} count={count} onPageChange={setPage} />
      </div>
    </div>
  )
}
